import { useEffect, useRef, useState } from 'react'

const PREF_KEY = 'floating-life:sound'
const VOLUME = 0.22 // 环境声是底色，不是配乐——压得很低
const FADE_MS = 1400

// 环境声引擎：单声道循环 + 章间交叉渐变；浏览器自动播放策略下，
// 首次用户手势（进入/点击）之后才真正出声。
export function useAmbient(file: string | undefined) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(PREF_KEY) !== 'off')
  const currentRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const url = file ? `${import.meta.env.BASE_URL}sound/${file}` : undefined
    const prev = currentRef.current
    if (prev && url && prev.src.endsWith(url.split('/').pop()!)) {
      // 同一首：只跟随开关
      prev.muted = !enabled
      return
    }
    window.clearInterval(fadeTimer.current)
    // 旧声渐隐后停
    if (prev) {
      const out = prev
      const step = out.volume / (FADE_MS / 50)
      const t = window.setInterval(() => {
        out.volume = Math.max(0, out.volume - step)
        if (out.volume <= 0.001) {
          window.clearInterval(t)
          out.pause()
          out.src = ''
        }
      }, 50)
    }
    if (!url) {
      currentRef.current = null
      return
    }
    // 新声渐起
    const next = new Audio(url)
    next.loop = true
    next.volume = 0
    next.muted = !enabled
    currentRef.current = next
    const tryPlay = () => next.play().catch(() => undefined) // 无手势时静默失败，手势后重试
    tryPlay()
    const onGesture = () => {
      tryPlay()
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
    window.addEventListener('pointerdown', onGesture)
    window.addEventListener('keydown', onGesture)
    const step = VOLUME / (FADE_MS / 50)
    fadeTimer.current = window.setInterval(() => {
      next.volume = Math.min(VOLUME, next.volume + step)
      if (next.volume >= VOLUME) window.clearInterval(fadeTimer.current)
    }, 50)
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [file, enabled])

  const toggle = () => {
    setEnabled((v) => {
      const nv = !v
      localStorage.setItem(PREF_KEY, nv ? 'on' : 'off')
      if (currentRef.current) currentRef.current.muted = !nv
      return nv
    })
  }
  return { soundOn: enabled, toggleSound: toggle }
}
