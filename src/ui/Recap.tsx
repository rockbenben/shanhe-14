import type { Ending, Story } from '../stories/schema'
import type { LogEntry } from '../engine/types'
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
  return (
  
    <main className="recap">
      <h2>{tr('命运长卷')} · {tr(story.title)}</h2>
      {story.chapters.map((ch, ci) => {
        const entries = log.filter((l) => l.chapter === ci)
        if (!entries.length) return null
        return (
          <section key={ch.id} className="recap-chapter">
            <h3>
              {tr(`第${ci + 1}章`)} {tr(ch.title)}
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
