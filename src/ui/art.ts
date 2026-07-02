// 节点插画清单：构建期收集 src/assets/art/*.webp（slug → URL）。
// 缺图的节点查不到即不渲染——插画是渐进增强，不是硬依赖。
const files = import.meta.glob('../assets/art/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export const artUrl = (slug: string): string | undefined => files[`../assets/art/${slug}.webp`]
