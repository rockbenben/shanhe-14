import { useEffect } from 'react'
import type { Story } from '../stories/schema'
import type { ReaderState } from '../engine/types'
import { currentBeat } from '../engine/reader'
import { artUrl } from './art'

interface Props {
  story: Story
  state: ReaderState
  // 选择后的即时回应：非空时整屏只显示这一行，推进后才翻到下一拍
  reaction: string | null
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

  if (reaction) {
    return (
      <main className="reader reader--advance" onClick={onSurfaceClick}>
        <header className="reader-chapter">
          第{state.chapter + 1}章 · {chapter.title}
        </header>
        <article className="reader-reaction">{reaction}</article>
        <button className="reader-continue" onClick={onAdvance}>
          继续 ▸
        </button>
      </main>
    )
  }

  const img = beat.art ? artUrl(beat.art) : undefined

  return (
    <main className={canAdvance ? 'reader reader--advance' : 'reader'} onClick={onSurfaceClick}>
      <header className="reader-chapter">
        第{state.chapter + 1}章 · {chapter.title}
      </header>
      {img && <img className="reader-art" src={img} alt="" />}
      <article className="reader-narrative">{beat.narrative}</article>
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
