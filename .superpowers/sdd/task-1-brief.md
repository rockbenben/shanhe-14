### Task 1: 工程脚手架

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `.gitignore`, `src/smoke.test.ts`

**Interfaces:**
- Produces: 可 `npm run dev / build / test` 的空壳工程。

- [ ] **Step 1: 写工程文件**

`package.json`：
```json
{
  "name": "floating-life",
  "version": "0.1.0",
  "description": "浮生长卷 — 编排式叙事游戏框架：作者编排故事，引擎负责推进与记忆",
  "author": "rockbenben",
  "license": "MIT",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.3",
    "typescript": "^6.0.3",
    "vite": "^8.1.2",
    "vitest": "^4.1.9"
  },
  "engines": { "node": ">=20" }
}
```

`tsconfig.json`：
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

`vite.config.ts`：
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ plugins: [react()] })
```

`index.html`：
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>浮生长卷</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`：
```tsx
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(<App />)
```

`src/App.tsx`（占位，Task 7 重写）：
```tsx
export default function App() {
  return <h1>浮生长卷</h1>
}
```

`src/styles.css`（占位，Task 8 充实）：
```css
:root { color-scheme: light; }
body { margin: 0; font-family: 'Noto Serif SC', serif; background: #f5f1e8; color: #2b2620; }
```

`.gitignore`：
```
node_modules
dist
```

`src/smoke.test.ts`：
```ts
import { describe, expect, it } from 'vitest'

describe('smoke', () => {
  it('测试器可运行', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 2: 安装依赖并跑冒烟测试**

Run: `npm --prefix "D:\Backup\Libraries\Documents\GitHub\Projects\365\021" install`
Run: `npm --prefix "D:\Backup\Libraries\Documents\GitHub\Projects\365\021" test`
Expected: 1 passed。

Run: `npm --prefix "D:\Backup\Libraries\Documents\GitHub\Projects\365\021" run build`
Expected: tsc 无错，vite build 产出 dist/。

- [ ] **Step 3: Commit**

```bash
git -C "D:\Backup\Libraries\Documents\GitHub\Projects\365\021" add -A
git -C "D:\Backup\Libraries\Documents\GitHub\Projects\365\021" commit -m "chore: Vite+React+TS 工程脚手架，对齐 015 依赖版本"
```

---

