// flag 条件求值：`&` 连接若干项，项可带 `!` 前缀；undefined/空白恒真。
// 故事格式刻意只支持「与 + 非」——结局与路由按具体分化枚举，避免作者写出难验的布尔迷宫。
export function checkCond(cond: string | undefined, flags: string[]): boolean {
  if (!cond || !cond.trim()) return true
  return cond.split('&').every((raw) => {
    const t = raw.trim()
    return t.startsWith('!') ? !flags.includes(t.slice(1)) : flags.includes(t)
  })
}
