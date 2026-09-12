'use client'

import { useEffect, useState } from 'react'
import { Download, Share } from 'lucide-react'
import { T } from '@/lib/ds'

type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Shows a real "Instalar Organiza+" button only where the browser actually
// supports the install prompt (captured via beforeinstallprompt), a manual
// how-to on iOS/Safari (which never fires that event), or nothing at all —
// never a button that has no effect when clicked.
export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BIPEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setInstalled(standalone)
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream)
    setReady(true)

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BIPEvent)
    }
    function onAppInstalled() {
      setInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
  }

  if (!ready || installed) return null

  if (deferredPrompt) {
    return (
      <button onClick={handleInstall} style={{
        display:'inline-flex', alignItems:'center', gap:10, background:T.sage, color:T.cream,
        padding:'15px 32px', borderRadius:T.r14, fontSize:16, fontWeight:700, border:'none',
        cursor:'pointer', fontFamily:T.fontSans, boxShadow:'0 12px 36px rgba(122,158,135,0.35)',
        transition:'all 0.2s',
      }}
        onMouseEnter={e=>{e.currentTarget.style.background=T.sageL;e.currentTarget.style.transform='translateY(-2px)'}}
        onMouseLeave={e=>{e.currentTarget.style.background=T.sage;e.currentTarget.style.transform='translateY(0)'}}>
        <Download size={18}/> Instalar Organiza+
      </button>
    )
  }

  if (isIOS) {
    return (
      <p style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:14, color:T.mid, background:T.sageG, border:`1px solid ${T.sageP}`, borderRadius:T.r14, padding:'12px 20px', margin:0 }}>
        <Share size={16}/> No iPhone/iPad: toque em compartilhar e depois em <strong>&quot;Adicionar à Tela de Início&quot;</strong>.
      </p>
    )
  }

  return null
}
