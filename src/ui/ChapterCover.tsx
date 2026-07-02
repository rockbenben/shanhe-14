import { useState } from 'react'
import type { Story } from '../stories/schema'
import type { ReaderState } from '../engine/types'

interface Props {
  story: Story
  state: ReaderState
  onEnter: () => void
}

export default function ChapterCover({ story, state, onEnter }: Props) {
  const ch = story.chapters[state.chapter]
  const [showNote, setShowNote] = useState(false)
  return (
    <main className={ch.art ? 'cover cover--photo' : 'cover'}>
      {ch.art && (
        <div
          className="cover-photo"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}covers/${ch.art})` }}
          aria-hidden="true"
        />
      )}
      <div className="cover-body">
        <p className="cover-index">第 {state.chapter + 1} 章 · 共 {story.chapters.length} 章</p>
        <h2 className="cover-title">{ch.title}</h2>
        {ch.epigraph && <p className="cover-epigraph">{ch.epigraph}</p>}
        <button className="cover-enter" onClick={onEnter}>
          开卷 ▸
        </button>
        {ch.historyNote && (
          <div className="cover-note">
            <button className="cover-note-toggle" onClick={() => setShowNote((v) => !v)}>
              {showNote ? '收起史实注' : '史实注'}
            </button>
            {showNote && <p className="cover-note-body">{ch.historyNote}</p>}
          </div>
        )}
      </div>
      {ch.artCredit && <p className="cover-credit">{ch.artCredit}</p>}
    </main>
  )
}
