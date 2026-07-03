import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// 简繁切换：偏好持久化；繁体转换器（opencc）按需动态加载，简体模式零开销
type Mode = 's' | 't'
const KEY = 'floating-life:lang'

const LangCtx = createContext<{ mode: Mode; toggle: () => void; tr: (s: string) => string }>({
  mode: 's',
  toggle: () => {},
  tr: (s) => s,
})

let converter: ((s: string) => string) | null = null

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    try {
      return localStorage.getItem(KEY) === 't' ? 't' : 's'
    } catch {
      return 's'
    }
  })
  const [ready, setReady] = useState(!!converter)

  useEffect(() => {
    if (mode === 't' && !converter) {
      import('opencc-js').then((m) => {
        converter = m.Converter({ from: 'cn', to: 'twp' })
        setReady(true)
      })
    }
  }, [mode])

  const value = useMemo(
    () => ({
      mode,
      toggle: () =>
        setMode((v) => {
          const n: Mode = v === 's' ? 't' : 's'
          try {
            localStorage.setItem(KEY, n)
          } catch {
            /* 存储不可用时仅本次生效 */
          }
          return n
        }),
      tr: (s: string) => (mode === 't' && converter ? converter(s) : s),
    }),
    [mode, ready],
  )

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)
