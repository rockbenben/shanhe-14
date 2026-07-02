import type { Ending, Story } from '../stories/schema'
import type { LogEntry } from '../engine/types'

interface Props {
  story: Story
  ending: Ending
  log: LogEntry[]
  onRestart: () => void
  onRecap: () => void
}

export default function EndingCard({ story, ending, log, onRestart, onRecap }: Props) {
  const choices = log.filter((l) => l.choiceText).length
  return (
    <main className="ending">
      <p className="ending-story">{story.title} · 终卷</p>
      <h2 className="ending-title">{ending.title}</h2>
      <p className="ending-epilogue">{ending.epilogue}</p>
      <p className="ending-meta">
        走过 {story.chapters.length} 章，做出 {choices} 次选择
      </p>
      <div className="ending-actions">
        <button onClick={onRecap}>回顾长卷</button>
        <button onClick={onRestart}>重开一卷</button>
      </div>
    </main>
  )
}
