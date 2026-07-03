import { useEffect } from 'react'
import { useLang } from './lang'

interface Props {
  onBack: () => void
}

// 关于本作：把「怎么做的」如实交代——AI 共创方法、诚实原则、影像版权、操作方式。
// 过程纪律是本作内容的一部分，不该只藏在仓库里。
export default function About({ onBack }: Props) {
  const { tr } = useLang()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['Escape', 'ArrowLeft', 'ArrowUp', 'Backspace'].includes(e.key)) {
        e.preventDefault()
        onBack()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])
  return (
    <main className="about">
      <h2>{tr('关于本作')}</h2>

      <section>
        <h3>{tr('这是什么')}</h3>
        <p>
          {tr(
            '一部据史实与亲历记载改编的互动叙事：1931 年九一八到 1945 年胜利，你以一名记者的脚步走过十四年，在若干路口做出自己的选择。剧情主线为虚构，落脚的时间、地点、事件与大量细节取自真实记载。',
          )}
        </p>
      </section>

      <section>
        <h3>{tr('如何用 AI 共创')}</h3>
        <p>
          {tr(
            '本作由人与 AI 协作完成：框架与叙事编排由 AI 起草、人工定夺；场景细节经 AI 逐拍检索史料（回忆录、当年报刊、口述史）后微调对齐，并留下可点击的出处注；版画风插画由 AI 生成——刻意选择非写实风格，与真实档案照片一望即知地区隔开；档案照片全部由人工逐张核验出处与许可。AI 负责广度与速度，人负责判断与取舍。',
          )}
        </p>
      </section>

      <section>
        <h3>{tr('诚实三原则')}</h3>
        <p>{tr('一、查证不到的，宁缺：找不到可靠出处的引语弃用，配不上合规照片的场景保留插画。')}</p>
        <p>{tr('二、署名必须如实：氛围照片一律注明真实年份地点与「非该场景实拍」，绝不把无关照片说成剧情现场。')}</p>
        <p>{tr('三、影像缺席也是记录：个别章节存世影像或出处可疑、或过于惨烈，本作宁可少配图，也不用来路不明的画面。')}</p>
      </section>

      <section>
        <h3>{tr('影像与版权')}</h3>
        <p>
          {tr(
            '全部档案照片取自公有领域（Wikimedia Commons、美国国会图书馆、美国国家档案馆、法国国家图书馆等），逐张核验许可，出处随图注明、点击可查证原始文件页。史料出处注同样尽量附验证过的链接。',
          )}
        </p>
      </section>

      <section>
        <h3>{tr('操作方式')}</h3>
        <p>{tr('空格 / → / ↓ / 点击画面：继续（到选择点会自动替你选一项，方便只想看故事的人）')}</p>
        <p>{tr('← / ↑：回到上一页，退过选择点可以重选')}</p>
        <p>{tr('看全图：隐去文字纯赏画面；右上角切换简繁')}</p>
      </section>

      <button className="about-back" onClick={onBack}>
        {tr('返回')}
      </button>
    </main>
  )
}
