# 浮生长卷 · floating-life

> 365 开源计划 #021 · 编排式叙事游戏框架 — 作者编排故事，引擎负责推进与记忆

千世书（#015）的镜像姐妹作：千世书用数值涌现故事，浮生长卷用编排承载故事。
故事是数据：线性章节串（珠）、章内分支章末汇聚（DAG）、选择只落 flag、flag 驱动回响与结局。

首发故事 **《山河十四年》**：1931 九一八 → 1945 胜利，一个记者走过的中国。
十二章，每章附史实注；零配置、无需 API Key，打开即读。

## 快速开始

```bash
npm install
npm run dev   # http://localhost:5173
npm test
npm run build # 纯静态，dist/ 可部署到任意静态托管
```

## 故事格式

见 `src/stories/schema.ts`（zod 定义即文档）：Story → chapters[]（章）→ beats[]（节点 DAG）
→ choices（落 flag）→ endings（按 flag 分化，末项兜底）。
