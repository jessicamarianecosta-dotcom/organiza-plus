'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { T } from '@/lib/ds'
import { Upload, ZoomIn, ZoomOut, RotateCw, Check, X, Camera } from 'lucide-react'

interface Props {
  value: string          // current photo URL
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<string>  // returns uploaded URL
  loading?: boolean
  theme?: { primary: string; glow: string; pale: string; dark: string }
}

// ── Canvas crop utility ───────────────────────────────────────────────────
function cropToBlob(
  img: HTMLImageElement,
  cropX: number, cropY: number,
  cropSize: number,
  outputSize = 900
): Promise<Blob> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width  = outputSize
    canvas.height = Math.round(outputSize * 5 / 4)  // 4:5 ratio
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(
      img,
      cropX, cropY,
      cropSize, Math.round(cropSize * 5 / 4),
      0, 0,
      canvas.width, canvas.height
    )
    canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92)
  })
}

export default function PhotoCropper({ value, onChange, onUpload, loading, theme }: Props) {
  const th = theme || { primary:T.sage, glow:T.sageG, pale:T.sageP, dark:T.dark }

  // Raw image state
  const [rawSrc,    setRawSrc]    = useState<string | null>(null)
  const [imgEl,     setImgEl]     = useState<HTMLImageElement | null>(null)
  const [showCrop,  setShowCrop]  = useState(false)
  const [uploading, setUploading] = useState(false)

  // Crop state
  const [zoom,     setZoom]     = useState(1)
  const [offsetX,  setOffsetX]  = useState(0)
  const [offsetY,  setOffsetY]  = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{x:number;y:number;ox:number;oy:number} | null>(null)

  // Canvas refs
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const fileRef    = useRef<HTMLInputElement>(null)

  // Canvas size (fixed display)
  const CANVAS_W = 320
  const CANVAS_H = Math.round(CANVAS_W * 5 / 4)  // 400

  // ── Draw preview on canvas ──────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgEl
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    // Background
    ctx.fillStyle = '#F7F5F0'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Compute scaled dimensions
    const baseScale = Math.max(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight)
    const scale = baseScale * zoom
    const w = img.naturalWidth  * scale
    const h = img.naturalHeight * scale
    const x = (CANVAS_W - w) / 2 + offsetX
    const y = (CANVAS_H - h) / 2 + offsetY

    ctx.drawImage(img, x, y, w, h)

    // Overlay: darken outside 4:5 frame (already full canvas, no overlay needed)
    // Guide lines
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    // Rule of thirds
    for (let i = 1; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(CANVAS_W * i / 3, 0)
      ctx.lineTo(CANVAS_W * i / 3, CANVAS_H)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, CANVAS_H * i / 3)
      ctx.lineTo(CANVAS_W, CANVAS_H * i / 3)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Border
    ctx.strokeStyle = 'rgba(122,158,135,0.6)'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, CANVAS_W - 2, CANVAS_H - 2)
  }, [imgEl, zoom, offsetX, offsetY, CANVAS_W, CANVAS_H])

  useEffect(() => { draw() }, [draw])

  // ── Load image from file ────────────────────────────────────────────────
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const url = URL.createObjectURL(file)
    setRawSrc(url)
    const img = new Image()
    img.onload = () => {
      setImgEl(img)
      setZoom(1); setOffsetX(0); setOffsetY(0)
      setShowCrop(true)
    }
    img.src = url
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  // ── Drag to pan ─────────────────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent) {
    setDragging(true)
    dragStart.current = { x:e.clientX, y:e.clientY, ox:offsetX, oy:offsetY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setOffsetX(dragStart.current.ox + dx)
    setOffsetY(dragStart.current.oy + dy)
  }
  function onPointerUp() {
    setDragging(false)
    dragStart.current = null
  }

  // ── Rotate ──────────────────────────────────────────────────────────────
  function rotate() {
    if (!imgEl || !rawSrc) return
    const offscreen = document.createElement('canvas')
    offscreen.width  = imgEl.naturalHeight
    offscreen.height = imgEl.naturalWidth
    const ctx = offscreen.getContext('2d')!
    ctx.translate(offscreen.width / 2, offscreen.height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.drawImage(imgEl, -imgEl.naturalWidth / 2, -imgEl.naturalHeight / 2)
    offscreen.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => { setImgEl(img); setZoom(1); setOffsetX(0); setOffsetY(0) }
      img.src = url
    }, 'image/jpeg', 0.95)
  }

  // ── Confirm crop and upload ─────────────────────────────────────────────
  async function confirm() {
    if (!imgEl) return
    setUploading(true)

    // Compute crop region in image coordinates
    const baseScale = Math.max(CANVAS_W / imgEl.naturalWidth, CANVAS_H / imgEl.naturalHeight)
    const scale = baseScale * zoom
    const w = imgEl.naturalWidth * scale
    const h = imgEl.naturalHeight * scale
    const imgX = (CANVAS_W - w) / 2 + offsetX
    const imgY = (CANVAS_H - h) / 2 + offsetY

    // Crop origin in image coords
    const cropX = Math.max(0, -imgX / scale)
    const cropY = Math.max(0, -imgY / scale)
    const cropW = Math.min(imgEl.naturalWidth  - cropX, CANVAS_W / scale)

    const blob = await cropToBlob(imgEl, cropX, cropY, cropW)
    const file = new File([blob], 'photo.jpg', { type:'image/jpeg' })

    try {
      const url = await onUpload(file)
      onChange(url)
      setShowCrop(false)
    } catch {
      alert('Erro ao enviar foto. Tente novamente.')
    }
    setUploading(false)
  }

  function cancel() {
    setShowCrop(false)
    if (rawSrc) URL.revokeObjectURL(rawSrc)
    setRawSrc(null); setImgEl(null)
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={onFile}/>

      {/* ── Cropper modal ── */}
      {showCrop && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:T.white, borderRadius:T.r24, overflow:'hidden', width:'100%', maxWidth:400, boxShadow:'0 24px 80px rgba(0,0,0,0.4)' }}>
            {/* Header */}
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.nude}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <p style={{ fontWeight:700, fontSize:15, color:T.dark, margin:0 }}>Ajustar foto</p>
                <p style={{ fontSize:11, color:T.muted, margin:'2px 0 0' }}>Arraste para reposicionar · Proporção 4:5</p>
              </div>
              <button type="button" onClick={cancel}
                style={{ background:T.off, border:`1px solid ${T.nude}`, borderRadius:T.r10, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.muted }}>
                <X size={15}/>
              </button>
            </div>

            {/* Canvas */}
            <div style={{ position:'relative', background:'#1a1a1a', display:'flex', justifyContent:'center' }}>
              <canvas
                ref={canvasRef}
                width={CANVAS_W} height={CANVAS_H}
                style={{ display:'block', cursor:dragging?'grabbing':'grab', touchAction:'none', maxWidth:'100%' }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              />
              {/* Rule of thirds label */}
              <div style={{ position:'absolute', top:8, left:8, background:'rgba(0,0,0,0.45)', borderRadius:6, padding:'3px 8px', fontSize:10, color:'rgba(255,255,255,0.7)', fontWeight:600, letterSpacing:'0.04em', pointerEvents:'none' }}>
                4:5 · Arraste para ajustar
              </div>
            </div>

            {/* Controls */}
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.nude}` }}>
              {/* Zoom slider */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <button type="button" onClick={()=>setZoom(z=>Math.max(0.5,z-0.1))}
                  style={{ width:32, height:32, borderRadius:T.r10, border:`1px solid ${T.nude}`, background:T.off, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.mid }}>
                  <ZoomOut size={14}/>
                </button>
                <div style={{ flex:1, position:'relative', height:32, display:'flex', alignItems:'center' }}>
                  <input type="range" min="0.5" max="3" step="0.05" value={zoom}
                    onChange={e=>setZoom(Number(e.target.value))}
                    style={{ width:'100%', accentColor:th.primary, cursor:'pointer' }}/>
                </div>
                <button type="button" onClick={()=>setZoom(z=>Math.min(3,z+0.1))}
                  style={{ width:32, height:32, borderRadius:T.r10, border:`1px solid ${T.nude}`, background:T.off, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.mid }}>
                  <ZoomIn size={14}/>
                </button>
                <button type="button" onClick={rotate} title="Girar 90°"
                  style={{ width:32, height:32, borderRadius:T.r10, border:`1px solid ${T.nude}`, background:T.off, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.mid }}>
                  <RotateCw size={14}/>
                </button>
              </div>
              {/* Zoom label */}
              <p style={{ fontSize:11, color:T.muted, margin:0, textAlign:'center' }}>
                Zoom: {Math.round(zoom * 100)}% · Ideal: centralizado e boa iluminação
              </p>
            </div>

            {/* Actions */}
            <div style={{ padding:'14px 20px', display:'flex', gap:10 }}>
              <button type="button" onClick={cancel}
                style={{ flex:1, padding:'11px', border:`2px solid ${T.nude}`, background:'transparent', color:T.dark, borderRadius:T.r12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:T.fontSans }}>
                Cancelar
              </button>
              <button type="button" onClick={confirm} disabled={uploading}
                style={{ flex:2, padding:'11px', border:'none', background:uploading?T.muted:th.primary, color:'#FAFAF7', borderRadius:T.r12, fontSize:14, fontWeight:700, cursor:uploading?'not-allowed':'pointer', fontFamily:T.fontSans, display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'background 0.2s' }}>
                {uploading
                  ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }}/> Enviando...</>
                  : <><Check size={15}/> Usar esta foto</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload trigger + preview ── */}
      <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
        {/* Preview card */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{ width:100, height:125, borderRadius:T.r16, overflow:'hidden', background:value?'transparent':T.sageG, border:`2px solid ${value?th.pale:T.nude}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, boxShadow:T.shadowCard }}>
            {value
              ? <img src={value} alt="Foto" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
              : '📷'}
          </div>
          {value && (
            <div style={{ position:'absolute', bottom:-8, left:'50%', transform:'translateX(-50%)', background:T.sageG, border:`1px solid ${th.pale}`, borderRadius:T.r100, padding:'2px 8px', fontSize:10, fontWeight:700, color:th.primary, whiteSpace:'nowrap' }}>
              4:5 ✓
            </div>
          )}
        </div>

        {/* Upload info + button */}
        <div style={{ flex:1, minWidth:160 }}>
          <p style={{ fontSize:13, fontWeight:700, color:T.dark, margin:'0 0 4px' }}>
            Foto profissional
          </p>
          <p style={{ fontSize:12, color:T.muted, margin:'0 0 12px', lineHeight:1.55 }}>
            📐 Proporção ideal: <strong>4:5</strong> (ex: 1080×1350px)<br/>
            Use rosto centralizado com boa iluminação.<br/>
            Evite fotos escuras ou muito abertas.
          </p>

          <button type="button" onClick={()=>fileRef.current?.click()} disabled={loading||uploading}
            style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:T.r12, border:`2px solid ${th.pale}`, background:th.glow, color:th.primary, fontSize:13, fontWeight:700, cursor:(loading||uploading)?'not-allowed':'pointer', fontFamily:T.fontSans, transition:'all 0.15s' }}
            onMouseEnter={e=>{ if(!loading&&!uploading){ e.currentTarget.style.background=th.primary; e.currentTarget.style.color='#FAFAF7' }}}
            onMouseLeave={e=>{ e.currentTarget.style.background=th.glow; e.currentTarget.style.color=th.primary }}>
            <Camera size={14}/>
            {value ? 'Trocar foto' : 'Adicionar foto'}
          </button>

          {value && (
            <button type="button" onClick={()=>{ onChange('') }}
              style={{ display:'block', marginTop:8, fontSize:11, color:T.muted, background:'none', border:'none', cursor:'pointer', fontFamily:T.fontSans }}
              onMouseEnter={e=>e.currentTarget.style.color=T.red}
              onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
              × Remover foto
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
