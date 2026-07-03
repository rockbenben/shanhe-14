import type { Ending, Story } from '../stories/schema'
import type { LogEntry } from '../engine/types'
import { useEffect } from 'react'
import { useLang } from './lang'

interface Props {
  story: Story
  ending: Ending
  log: LogEntry[]
  onRestart: () => void
  onRecap: () => void
  onGallery: () => void
}

export default function EndingCard({ story, ending, log, onRestart, onRecap, onGallery }: Props) {
  const { tr } = useLang()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ([' ', 'Enter', 'ArrowRight', 'ArrowDown'].includes(e.key) && !(document.activeElement instanceof HTMLButtonElement)) {
        e.preventDefault(); onRecap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onRecap])
  const choices = log.filter((l) => l.choiceText).length
  return (
    <main className="ending">
      <p className="ending-story">
        {tr(story.title)} · {tr('终卷')}
      </p>
      <h2 className="ending-title">{tr(ending.title)}</h2>
      <p className="ending-epilogue">{tr(ending.epilogue)}</p>
      <p className="ending-meta">{tr(`走过 ${story.chapters.length} 章，做出 ${choices} 次选择`)}</p>
      <div className="ending-actions">
        <button onClick={onRecap}>{tr('回顾全程')}</button>
        <button onClick={onGallery}>{tr('历史影像')}</button>
        <button onClick={onRestart}>{tr('重新开始')}</button>
      </div>
    </main>
  )
}
