import type { Story } from '../stories/schema'
import type { ReaderState } from '../engine/types'
import { currentBeat } from '../engine/reader'

interface Props {
  story: Story
  state: ReaderState
  onChoose: (index: number) => void
  onAdvance: () => void
}

export default function Reader({ story, state, onChoose, onAdvance }: Props) {
  const chapter = story.chapters[state.chapter]
  const beat = currentBeat(story, state)
  return (
    <main className="reader">
      <header className="reader-chapter">
        第{state.chapter + 1}章 · {chapter.title}
      </header>
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
