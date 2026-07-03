import { useEffect } from 'react'
import type { Story } from '../stories/schema'
import type { ReaderState } from '../engine/types'
import { currentBeat } from '../engine/reader'
import { artUrl } from './art'
import { useLang } from './lang'

// 选择后的即时回应：非空时先显示「你的选择 + 回应」，推进后才展开本拍正文
export interface Reaction {
  choiceText: string
  text: string
}

interface Props {
  story: Story
  state: ReaderState
  reaction: Reaction | null
  // 览图模式：隐去文字浮层纯赏画面，再点返回文字
  artOnly: boolean
  onToggleArt: () => void
  onChoose: (index: number) => void
  onAdvance: () => void
}

export default function Reader({ story, state, reaction, artOnly, onToggleArt, onChoose, onAdvance }: Props) {
  const { tr } = useLang()
  const chapter = story.chapters[state.chapter]
  const beat = currentBeat(story, state)
  // 视觉小说惯例：无分支时空格/回车推进，点击画面任意处亦可
  const canAdvance = !artOnly && (!!reaction || !beat.choices)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (artOnly && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        onToggleArt()
        return
      }
      if (canAdvance && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        onAdvance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canAdvance, artOnly, onAdvance, onToggleArt])

  const img = beat.art ? artUrl(beat.art) : undefined

  // 览图模式：只留画面与一枚返回钮，点击任意处回到文字
  if (artOnly && img) {
    return (
      <main
        className="reader reader--artonly"
        onClick={(e) => {
          // 按钮自带 onClick；冒泡到整屏会二次切换（切出去又切回来），故拦掉
          if ((e.target as HTMLElement).closest('button')) return
          onToggleArt()
        }}
      >
        <div className="reader-bg reader-bg--full" style={{ backgroundImage: `url(${img})` }} aria-hidden="true" />
        <button className="reader-viewtoggle" onClick={onToggleArt}>
          {tr('读文')}
        </button>
      </main>
    )
  }

  const onSurfaceClick = (e: React.MouseEvent) => {
    if (!canAdvance) return
    if ((e.target as HTMLElement).closest('button')) return // 按钮自带 onClick，避免双触发
    onAdvance()
  }

  const cls = `reader${canAdvance ? ' reader--advance' : ''}${img ? ' reader--immersive' : ''}`
  const viewBtn = img && (
    <button className="reader-viewtoggle" onClick={onToggleArt}>
      {tr('览图')}
    </button>
  )

  if (reaction) {
    return (
      <main className={cls} onClick={onSurfaceClick}>
        {img && <div className="reader-bg" style={{ backgroundImage: `url(${img})` }} aria-hidden="true" />}
        <header className="reader-chapter">
          {tr(`第${state.chapter + 1}章`)} · {tr(chapter.title)}
        </header>
        <article className="reader-reaction">
          <p className="reader-reaction-choice">
            {tr('你的选择')} · {tr(reaction.choiceText)}
          </p>
          {tr(reaction.text)}
        </article>
        <button className="reader-continue" onClick={onAdvance}>
          {tr('继续')} ▸
        </button>
        {viewBtn}
      </main>
    )
  }

  return (
    <main className={cls} onClick={onSurfaceClick}>
      {img && <div className="reader-bg" style={{ backgroundImage: `url(${img})` }} aria-hidden="true" />}
      <header className="reader-chapter">
        {tr(`第${state.chapter + 1}章`)} · {tr(chapter.title)}
      </header>
      <article className="reader-narrative">
        {beat.echo && (
          <p className="reader-echo">
            ◈ {tr('回响')} —— {tr(beat.echo)}
          </p>
        )}
        {tr(beat.narrative)}
      </article>
      {beat.choices ? (
        <div className="reader-choices">
          {beat.choices.map((c, i) => (
            <button key={i} onClick={() => onChoose(i)}>
              {tr(c.text)}
            </button>
          ))}
        </div>
      ) : (
        <button className="reader-continue" onClick={onAdvance}>
          {tr('继续')} ▸
        </button>
      )}
      {viewBtn}
    </main>
  )
}
