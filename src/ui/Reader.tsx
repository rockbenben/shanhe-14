import { useEffect } from 'react'
import type { Story } from '../stories/schema'
import type { ReaderState } from '../engine/types'
import { currentBeat } from '../engine/reader'
import { artUrl } from './art'

// 选择后的即时回应：非空时先显示「你的选择 + 回应」，推进后才展开本拍正文
export interface Reaction {
  choiceText: string
  text: string
}

interface Props {
  story: Story
  state: ReaderState
  reaction: Reaction | null
  onChoose: (index: number) => void
  onAdvance: () => void
}

export default function Reader({ story, state, reaction, onChoose, onAdvance }: Props) {
  const chapter = story.chapters[state.chapter]
  const beat = currentBeat(story, state)
  // 视觉小说惯例：无分支时空格/回车推进，点击画面任意处亦可
  const canAdvance = !!reaction || !beat.choices

  useEffect(() => {
    if (!canAdvance) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        onAdvance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canAdvance, onAdvance])

  const onSurfaceClick = (e: React.MouseEvent) => {
    if (!canAdvance) return
    if ((e.target as HTMLElement).closest('button')) return // 按钮自带 onClick，避免双触发
    onAdvance()
  }

  // 回应页与正文共用当前拍的整屏背景——选择的着落发生在同一个画面里
  const img = beat.art ? artUrl(beat.art) : undefined
  const cls = `reader${canAdvance ? ' reader--advance' : ''}${img ? ' reader--immersive' : ''}`

  if (reaction) {
    return (
      <main className={cls} onClick={onSurfaceClick}>
        {img && <div className="reader-bg" style={{ backgroundImage: `url(${img})` }} aria-hidden="true" />}
        <header className="reader-chapter">
          第{state.chapter + 1}章 · {chapter.title}
        </header>
        <article className="reader-reaction">
          <p className="reader-reaction-choice">你的选择 · {reaction.choiceText}</p>
          {reaction.text}
        </article>
        <button className="reader-continue" onClick={onAdvance}>
          继续 ▸
        </button>
      </main>
    )
  }

  return (
    <main className={cls} onClick={onSurfaceClick}>
      {img && <div className="reader-bg" style={{ backgroundImage: `url(${img})` }} aria-hidden="true" />}
      <header className="reader-chapter">
        第{state.chapter + 1}章 · {chapter.title}
      </header>
      <article className="reader-narrative">
        {beat.echo && <p className="reader-echo">◈ 回响 —— {beat.echo}</p>}
        {beat.narrative}
      </article>
      {beat.choices ? (
        <div className="reader-choices">
          {beat.choices.map((c, i) => (
            <button key={i} onClick={() => onChoose(i)}>
              {c.text}
            </button>
          ))}
        </div>
      ) : (
        <button className="reader-continue" onClick={onAdvance}>
          继续 ▸
        </button>
      )}
    </main>
  )
}
