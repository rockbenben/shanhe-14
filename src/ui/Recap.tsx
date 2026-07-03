import type { Ending, Story } from '../stories/schema'
import type { LogEntry } from '../engine/types'
import { useEffect } from 'react'
import { useLang } from './lang'

interface Props {
  story: Story
  log: LogEntry[]
  ending: Ending
  onBack: () => void
}

// 回顾长卷：按章分组列出走过的节点与所做选择
export default function Recap({ story, log, ending, onBack }: Props) {
  const { tr } = useLang()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['Escape', 'ArrowLeft', 'ArrowUp', 'Backspace'].includes(e.key)) { e.preventDefault(); onBack() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])
  return (
  
    <main className="recap">
      <h2>{tr('回顾全程')} · {tr(story.title)}</h2>
      {story.chapters.map((ch, ci) => {
        const entries = log.filter((l) => l.chapter === ci)
        if (!entries.length) return null
        return (
          <section key={ch.id} className="recap-chapter">
            <h3>
              {tr(`第 ${ci + 1} 章`)} {tr(ch.title)}
            </h3>
            <ul>
              {entries
                .filter((e) => e.choiceText)
                .map((e, i) => (
                  <li key={i}>{tr(e.choiceText!)}</li>
                ))}
            </ul>
          </section>
        )
      })}
      <p className="recap-ending">→ {tr(ending.title)}</p>
      <button onClick={onBack}>{tr('返回')}</button>
    </main>
  )
}
