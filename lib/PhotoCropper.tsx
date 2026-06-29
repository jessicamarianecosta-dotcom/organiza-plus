'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { T } from '@/lib/ds'
import { ZoomIn, ZoomOut, RotateCw, Check, X, Camera } from 'lucide-react'

interface Props {
  value: string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<string>
  loading?: boolean
  theme?: { primary: string; glow: string; pale: string; dark: string }
}

function cropToBlob(
  img: HTMLImageElement,
  cropX: number, cropY: number,
  cropSize: number,
  outputSize = 800
): Promise<Blob> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width = outputSize
    canvas.height = outputSize
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, outputSize, outputSize)
    canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92)
  })
}

const CANVAS_SIZE = 320

export default function PhotoCropper({ value, onChange, onUpload, loading, theme }: Props) {
  const th = theme || { primary: T.sage, glow: T.sageG, pale: T.sageP, dark: T.dark }

  const [imgEl,        setImgEl]        = useState<HTMLImageElement | null>(null)
  const [rawSrc,       setRawSrc]       = useState<string | null>(null)
  const [showCrop,     setShowCrop]     = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [uploadError,  setUploadError]  = useState('')
  const [uploadSuccess,setUploadSuccess]= useState(false)

  const [zoom,    setZoom]    = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [dragging,setDragging]= useState(false)
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)

  // ── Draw circular preview ─────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgEl
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const baseScale = Math.max(CANVAS_SIZE / img.naturalWidth, CANVAS_SIZE / img.naturalHeight)
    const scale = baseScale * zoom
    const w = img.naturalWidth  * scale
    const h = img.naturalHeight * scale
    const x = (CANVAS_SIZE - w) / 2 + offsetX
    const y = (CANVAS_SIZE - h) / 2 + offsetY

    // Image clipped to circle
    ctx.save()
    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, x, y, w, h)
    ctx.restore()

    // Dark overlay outside circle (evenodd)
    ctx.fillStyle = 'rgba(0,0,0,0.50)'
    ctx.beginPath()
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 2, 0, Math.PI * 2, true)
    ctx.fill('evenodd')

    // Circle border
    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 2, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(122,158,135,0.85)'
    ctx.lineWidth = 3
    ctx.stroke()
  }, [imgEl, zoom, offsetX, offsetY])

  useEffect(() => { draw() }, [draw])

  // ── File selection ────────────────────────────────────────────────────────
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Arquivo muito grande. Máximo permitido: 5MB.')
      return
    }
    setUploadError('')
    setUploadSuccess(false)

    const url = URL.createObjectURL(file)
    setRawSrc(url)
    const img = new Image()
    img.onload = () => {
      setImgEl(img)
      setZoom(1); setOffsetX(0); setOffsetY(0)
      setShowCrop(true)
    }
    img.src = url
  }

  // ── Drag to pan ───────────────────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent) {
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !dragStart.current) return
    setOffsetX(dragStart.current.ox + (e.clientX - dragStart.current.x))
    setOffsetY(dragStart.current.oy + (e.clientY - dragStart.current.y))
  }
  function onPointerUp() { setDragging(false); dragStart.current = null }

  // ── Rotate 90° ────────────────────────────────────────────────────────────
  function rotate() {
    if (!imgEl) return
    const off = document.createElement('canvas')
    off.width = imgEl.naturalHeight; off.height = imgEl.naturalWidth
    const ctx = off.getContext('2d')!
    ctx.translate(off.width / 2, off.height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.drawImage(imgEl, -imgEl.naturalWidth / 2, -imgEl.naturalHeight / 2)
    off.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => { setImgEl(img); setZoom(1); setOffsetX(0); setOffsetY(0) }
      img.src = url
    }, 'image/jpeg', 0.95)
  }

  // ── Confirm crop + upload ─────────────────────────────────────────────────
  async function confirm() {
    if (!imgEl) return
    setUploading(true); setUploadError('')

    const baseScale = Math.max(CANVAS_SIZE / imgEl.naturalWidth, CANVAS_SIZE / imgEl.naturalHeight)
    const scale     = baseScale * zoom
    const w  = imgEl.naturalWidth  * scale
    const h  = imgEl.naturalHeight * scale
    const ix = (CANVAS_SIZE - w) / 2 + offsetX
    const iy = (CANVAS_SIZE - h) / 2 + offsetY

    const cropX = Math.max(0, -ix / scale)
    const cropY = Math.max(0, -iy / scale)
    const cropW = Math.min(
      imgEl.naturalWidth  - cropX,
      Math.min(imgEl.naturalHeight - cropY, CANVAS_SIZE / scale)
    )

    const blob = await cropToBlob(imgEl, cropX, cropY, cropW)
    const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })

    try {
      const url = await onUpload(file)
      if (!url) throw new Error('URL não retornada pelo servidor.')
      onChange(url)
      setShowCrop(false)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 5000)
    } catch (err: any) {
      setUploadError(err?.message || 'Erro ao enviar foto. Tente novamente.')
    }
    setUploading(false)
  }

  function cancel() {
    setShowCrop(false)
    if (rawSrc) URL.revokeObjectURL(rawSrc)
    setRawSrc(null); setImgEl(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />

      {/* ── Cropper modal ── */}
      {showCrop && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.80)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: T.white, borderRadius: T.r24, overflow: 'hidden', width: '100%', maxWidth: 380, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.nude}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: T.dark, margin: 0 }}>Ajustar foto</p>
                <p style={{ fontSize: 11, color: T.muted, margin: '2px 0 0' }}>Arraste para centralizar · Enquadramento circular</p>
              </div>
              <button type="button" onClick={cancel}
                style={{ background: T.off, border: `1px solid ${T.nude}`, borderRadius: T.r10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.muted }}>
                <X size={15} />
              </button>
            </div>

            {/* Canvas */}
            <div style={{ background: '#111', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 0' }}>
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE} height={CANVAS_SIZE}
                style={{ display: 'block', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', borderRadius: '50%' }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              />
            </div>

            {/* Controls */}
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.nude}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                  style={{ width: 32, height: 32, borderRadius: T.r10, border: `1px solid ${T.nude}`, background: T.off, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.mid, flexShrink: 0 }}>
                  <ZoomOut size={14} />
                </button>
                <input type="range" min="0.5" max="3" step="0.05" value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  style={{ flex: 1, accentColor: th.primary, cursor: 'pointer' }} />
                <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.1))}
                  style={{ width: 32, height: 32, borderRadius: T.r10, border: `1px solid ${T.nude}`, background: T.off, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.mid, flexShrink: 0 }}>
                  <ZoomIn size={14} />
                </button>
                <button type="button" onClick={rotate} title="Girar 90°"
                  style={{ width: 32, height: 32, borderRadius: T.r10, border: `1px solid ${T.nude}`, background: T.off, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.mid, flexShrink: 0 }}>
                  <RotateCw size={14} />
                </button>
              </div>
              <p style={{ fontSize: 11, color: T.muted, margin: 0, textAlign: 'center' }}>
                Zoom: {Math.round(zoom * 100)}%
              </p>
            </div>

            {/* Upload error inside modal */}
            {uploadError && (
              <div style={{ margin: '10px 20px 0', padding: '9px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: T.r10, fontSize: 12, color: '#DC2626' }}>
                ⚠ {uploadError}
              </div>
            )}

            {/* Actions */}
            <div style={{ padding: '14px 20px', display: 'flex', gap: 10 }}>
              <button type="button" onClick={cancel}
                style={{ flex: 1, padding: '11px', border: `2px solid ${T.nude}`, background: 'transparent', color: T.dark, borderRadius: T.r12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: T.fontSans }}>
                Cancelar
              </button>
              <button type="button" onClick={confirm} disabled={uploading}
                style={{ flex: 2, padding: '11px', border: 'none', background: uploading ? T.muted : th.primary, color: '#FAFAF7', borderRadius: T.r12, fontSize: 14, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: T.fontSans, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.2s' }}>
                {uploading
                  ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Enviando...</>
                  : <><Check size={15} /> Usar esta foto</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload trigger + preview ── */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Circular preview */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', background: value ? 'transparent' : th.glow, border: `3px solid ${value ? th.pale : T.nude}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, boxShadow: T.shadowCard }}>
            {value
              ? <img src={value} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '📷'}
          </div>
          {value && (
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: th.primary, border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={13} color="white" />
            </div>
          )}
        </div>

        {/* Info + buttons */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.dark, margin: '0 0 4px' }}>
            Foto de perfil
          </p>
          <p style={{ fontSize: 12, color: T.muted, margin: '0 0 12px', lineHeight: 1.6 }}>
            📐 <strong>800×800 px</strong> · PNG ou JPG · Máx 5MB<br />
            Rosto centralizado, boa iluminação.
          </p>

          {uploadSuccess && (
            <div style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: T.r10, padding: '7px 10px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={13} /> Foto enviada com sucesso!
            </div>
          )}
          {uploadError && !showCrop && (
            <div style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: T.r10, padding: '7px 10px', marginBottom: 10 }}>
              ⚠ {uploadError}
            </div>
          )}

          <button type="button"
            onClick={() => { setUploadError(''); fileRef.current?.click() }}
            disabled={loading || uploading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: T.r12, border: `2px solid ${th.pale}`, background: th.glow, color: th.primary, fontSize: 13, fontWeight: 700, cursor: (loading || uploading) ? 'not-allowed' : 'pointer', fontFamily: T.fontSans, transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!loading && !uploading) { e.currentTarget.style.background = th.primary; e.currentTarget.style.color = '#FAFAF7' } }}
            onMouseLeave={e => { e.currentTarget.style.background = th.glow; e.currentTarget.style.color = th.primary }}>
            <Camera size={14} />
            {value ? 'Trocar foto' : 'Adicionar foto'}
          </button>

          {value && (
            <button type="button" onClick={() => onChange('')}
              style={{ display: 'block', marginTop: 8, fontSize: 11, color: T.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.fontSans }}
              onMouseEnter={e => (e.currentTarget.style.color = T.red)}
              onMouseLeave={e => (e.currentTarget.style.color = T.muted)}>
              × Remover foto
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
