'use client'
import { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import { T } from '@/lib/ds'
import { ZoomIn, ZoomOut, RotateCw, Check, X, Camera } from 'lucide-react'

// ── Props ──────────────────────────────────────────────────────────────────
interface Props {
  value:    string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<string>
  loading?:  boolean
  theme?:   { primary: string; glow: string; pale: string; dark: string }
}

// ── Canvas helpers ─────────────────────────────────────────────────────────
function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src     = src
  })
}

function toRad(deg: number) { return (deg * Math.PI) / 180 }

function rotatedSize(w: number, h: number, deg: number) {
  const r = toRad(deg)
  return {
    width:  Math.abs(Math.cos(r) * w) + Math.abs(Math.sin(r) * h),
    height: Math.abs(Math.sin(r) * w) + Math.abs(Math.cos(r) * h),
  }
}

async function getCroppedBlob(
  src: string,
  pixelCrop: Area,
  rotation: number,
  outputSize = 1024,
): Promise<Blob> {
  const img = await loadImg(src)
  const rotRad = toRad(rotation)
  const { width: bw, height: bh } = rotatedSize(img.width, img.height, rotation)

  // Step 1 — rotate full image onto a bounding-box canvas
  const rot = document.createElement('canvas')
  rot.width = bw; rot.height = bh
  const rc = rot.getContext('2d')!
  rc.translate(bw / 2, bh / 2)
  rc.rotate(rotRad)
  rc.translate(-img.width / 2, -img.height / 2)
  rc.drawImage(img, 0, 0)

  // Step 2 — crop the exact pixel area react-easy-crop gives us
  const crop = document.createElement('canvas')
  crop.width  = pixelCrop.width
  crop.height = pixelCrop.height
  const cc = crop.getContext('2d')!
  cc.drawImage(rot, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)

  // Step 3 — scale to outputSize × outputSize at high quality
  const out = document.createElement('canvas')
  out.width = outputSize; out.height = outputSize
  const oc = out.getContext('2d')!
  oc.imageSmoothingEnabled  = true
  oc.imageSmoothingQuality  = 'high'
  oc.drawImage(crop, 0, 0, outputSize, outputSize)

  return new Promise((resolve, reject) =>
    out.toBlob(b => b ? resolve(b) : reject(new Error('toBlob falhou')), 'image/jpeg', 0.90)
  )
}

// ── Component ──────────────────────────────────────────────────────────────
export default function PhotoCropper({ value, onChange, onUpload, loading, theme }: Props) {
  const th = theme || { primary: T.sage, glow: T.sageG, pale: T.sageP, dark: T.dark }

  const [rawSrc,        setRawSrc]        = useState<string | null>(null)
  const [showCrop,      setShowCrop]      = useState(false)
  const [crop,          setCrop]          = useState<Point>({ x: 0, y: 0 })
  const [zoom,          setZoom]          = useState(1)
  const [rotation,      setRotation]      = useState(0)
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null)
  const [uploading,     setUploading]     = useState(false)
  const [uploadError,   setUploadError]   = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedPixels(pixels)
  }, [])

  // ── File selected ──────────────────────────────────────────────────────
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Arquivo muito grande. Máximo permitido: 10MB.')
      return
    }
    setUploadError('')
    setUploadSuccess(false)

    const url = URL.createObjectURL(file)
    setRawSrc(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setShowCrop(true)
  }

  // ── Confirm: crop + upload ─────────────────────────────────────────────
  async function confirm() {
    if (!rawSrc || !croppedPixels) return
    setUploading(true)
    setUploadError('')
    try {
      const blob = await getCroppedBlob(rawSrc, croppedPixels, rotation, 1024)
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      const url  = await onUpload(file)
      if (!url) throw new Error('URL não retornada pelo servidor.')
      onChange(url)
      closeModal()
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 5000)
    } catch (err: any) {
      setUploadError(err?.message || 'Não foi possível enviar sua foto. Tente novamente.')
    }
    setUploading(false)
  }

  function closeModal() {
    setShowCrop(false)
    if (rawSrc) URL.revokeObjectURL(rawSrc)
    setRawSrc(null)
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={onFile}/>

      {/* ── Crop modal ────────────────────────────────────────────────── */}
      {showCrop && rawSrc && (
        <div style={{
          position:'fixed', inset:0, zIndex:9000,
          background:'rgba(0,0,0,0.88)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:16,
        }}>
          <div style={{
            background:T.white, borderRadius:T.r24, overflow:'hidden',
            width:'100%', maxWidth:480,
            boxShadow:'0 24px 80px rgba(0,0,0,0.65)',
            display:'flex', flexDirection:'column',
            maxHeight:'calc(100dvh - 32px)',
          }}>

            {/* Header */}
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.nude}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div>
                <p style={{ fontWeight:700, fontSize:15, color:T.dark, margin:0 }}>Ajustar foto de perfil</p>
                <p style={{ fontSize:11, color:T.muted, margin:'2px 0 0' }}>
                  Arraste · Scroll/pinch para zoom · Enquadramento circular
                </p>
              </div>
              <button type="button" onClick={closeModal} disabled={uploading}
                style={{ background:T.off, border:`1px solid ${T.nude}`, borderRadius:T.r10, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.muted, flexShrink:0 }}>
                <X size={15}/>
              </button>
            </div>

            {/* Cropper — react-easy-crop handles drag + pinch + scroll */}
            <div style={{ position:'relative', height:'clamp(280px,55vw,380px)', background:'#111', flexShrink:0 }}>
              <Cropper
                image={rawSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                minZoom={0.5}
                maxZoom={5}
                zoomWithScroll={true}
                style={{
                  containerStyle: { background:'#111' },
                  cropAreaStyle: {
                    border: `3px solid rgba(255,255,255,0.85)`,
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                  },
                }}
              />
            </div>

            {/* Zoom + rotate controls */}
            <div style={{ padding:'14px 20px', borderTop:`1px solid ${T.nude}`, flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <button type="button"
                  onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(2)))}
                  style={{ width:34, height:34, borderRadius:T.r10, border:`1px solid ${T.nude}`, background:T.off, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.mid, flexShrink:0, transition:'all 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=th.primary;e.currentTarget.style.color=th.primary}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.nude;e.currentTarget.style.color=T.mid}}>
                  <ZoomOut size={14}/>
                </button>

                <input type="range" min="0.5" max="5" step="0.02" value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  style={{ flex:1, accentColor:th.primary, cursor:'pointer', height:4 }}/>

                <button type="button"
                  onClick={() => setZoom(z => Math.min(5, +(z + 0.1).toFixed(2)))}
                  style={{ width:34, height:34, borderRadius:T.r10, border:`1px solid ${T.nude}`, background:T.off, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.mid, flexShrink:0, transition:'all 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=th.primary;e.currentTarget.style.color=th.primary}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.nude;e.currentTarget.style.color=T.mid}}>
                  <ZoomIn size={14}/>
                </button>

                <button type="button" onClick={() => setRotation(r => (r + 90) % 360)} title="Girar 90°"
                  style={{ width:34, height:34, borderRadius:T.r10, border:`1px solid ${T.nude}`, background:T.off, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.mid, flexShrink:0, transition:'all 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=th.primary;e.currentTarget.style.color=th.primary}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.nude;e.currentTarget.style.color=T.mid}}>
                  <RotateCw size={14}/>
                </button>
              </div>
              <p style={{ fontSize:11, color:T.muted, margin:'8px 0 0', textAlign:'center' }}>
                Zoom {Math.round(zoom * 100)}%{rotation ? ` · ${rotation}°` : ''}
              </p>
            </div>

            {/* Error */}
            {uploadError && (
              <div style={{ margin:'0 20px 12px', padding:'9px 12px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:T.r10, fontSize:12, color:'#DC2626', flexShrink:0 }}>
                ⚠ {uploadError}
              </div>
            )}

            {/* Actions */}
            <div style={{ padding:'14px 20px', display:'flex', gap:10, flexShrink:0 }}>
              <button type="button" onClick={closeModal} disabled={uploading}
                style={{ flex:1, padding:'12px', border:`2px solid ${T.nude}`, background:'transparent', color:T.dark, borderRadius:T.r12, fontSize:14, fontWeight:600, cursor:uploading?'not-allowed':'pointer', fontFamily:T.fontSans, transition:'border-color 0.15s' }}
                onMouseEnter={e=>{if(!uploading)e.currentTarget.style.borderColor=th.primary}}
                onMouseLeave={e=>e.currentTarget.style.borderColor=T.nude}>
                Cancelar
              </button>
              <button type="button" onClick={confirm} disabled={uploading}
                style={{ flex:2, padding:'12px', border:'none', background:uploading?T.muted:th.primary, color:'#FAFAF7', borderRadius:T.r12, fontSize:14, fontWeight:700, cursor:uploading?'not-allowed':'pointer', fontFamily:T.fontSans, display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'background 0.2s' }}
                onMouseEnter={e=>{if(!uploading)e.currentTarget.style.background=th.dark}}
                onMouseLeave={e=>{if(!uploading)e.currentTarget.style.background=th.primary}}>
                {uploading
                  ? <><Spinner/> Enviando...</>
                  : <><Check size={15}/> Usar esta foto</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Trigger + circular preview ─────────────────────────────────── */}
      <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>

        {/* Circular preview */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{ width:96, height:96, borderRadius:'50%', overflow:'hidden', background:value?'transparent':th.glow, border:`3px solid ${value?th.pale:T.nude}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, boxShadow:T.shadowCard }}>
            {value
              ? <img src={value} alt="Foto" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : '📷'}
          </div>
          {value && (
            <div style={{ position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%', background:th.primary, border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Check size={13} color="white"/>
            </div>
          )}
        </div>

        {/* Info + buttons */}
        <div style={{ flex:1, minWidth:160 }}>
          <p style={{ fontSize:13, fontWeight:700, color:T.dark, margin:'0 0 4px' }}>Foto de perfil</p>
          <p style={{ fontSize:12, color:T.muted, margin:'0 0 12px', lineHeight:1.6 }}>
            📐 <strong>1024×1024 px</strong> · PNG ou JPG · Máx 10MB<br/>
            Rosto centralizado, boa iluminação.
          </p>

          {uploadSuccess && (
            <div style={{ fontSize:12, color:'#16a34a', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:T.r10, padding:'7px 10px', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
              <Check size={13}/> Foto enviada com sucesso!
            </div>
          )}
          {uploadError && !showCrop && (
            <div style={{ fontSize:12, color:'#DC2626', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:T.r10, padding:'7px 10px', marginBottom:10 }}>
              ⚠ {uploadError}
            </div>
          )}

          <button type="button"
            onClick={() => { setUploadError(''); fileRef.current?.click() }}
            disabled={loading || uploading}
            style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:T.r12, border:`2px solid ${th.pale}`, background:th.glow, color:th.primary, fontSize:13, fontWeight:700, cursor:(loading||uploading)?'not-allowed':'pointer', fontFamily:T.fontSans, transition:'all 0.15s' }}
            onMouseEnter={e=>{if(!loading&&!uploading){e.currentTarget.style.background=th.primary;e.currentTarget.style.color='#FAFAF7'}}}
            onMouseLeave={e=>{e.currentTarget.style.background=th.glow;e.currentTarget.style.color=th.primary}}>
            <Camera size={14}/>
            {value ? 'Trocar foto' : 'Adicionar foto'}
          </button>

          {value && (
            <button type="button" onClick={() => onChange('')}
              style={{ display:'block', marginTop:8, fontSize:11, color:T.muted, background:'none', border:'none', cursor:'pointer', fontFamily:T.fontSans }}
              onMouseEnter={e=>(e.currentTarget.style.color=T.red)}
              onMouseLeave={e=>(e.currentTarget.style.color=T.muted)}>
              × Remover foto
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function Spinner() {
  return (
    <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite', flexShrink:0 }}/>
  )
}
