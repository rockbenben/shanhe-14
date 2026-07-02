import { useState } from 'react'
import { builtinStories } from './stories'
import type { Story } from './stories/schema'
import type { ReaderState } from './engine/types'
import { advance, choose, enterChapter, startStory } from './engine/reader'
import { clearProgress, loadProgress, saveProgress } from './engine/storage'
import Home from './ui/Home'
import Reader from './ui/Reader'

interface Session {
  story: Story
  state: ReaderState
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  const update = (story: Story, state: ReaderState) => {
    saveProgress(state)
    setSession({ story, state })
  }

  if (!session) {
    return (
      <Home
        stories={builtinStories}
        onStart={(story) => {
          clearProgress(story.id)
          update(story, startStory(story))
        }}
        onContinue={(story) => setSession({ story, state: loadProgress(story.id)! })}
      />
    )
  }

  const { story, state } = session

  if (state.ended) {
    const ending = story.endings.find((e) => e.id === state.ended!.endingId)!
    return (
      <main className="ending">
        <h2>{ending.title}</h2>
        <p>{ending.epilogue}</p>
        <button onClick={() => setSession(null)}>回到首页</button>
      </main>
    )
  }

  // 章封面：Task 8 换成真封面组件，这里先直接入章
  if (state.beatId === null) {
    update(story, enterChapter(story, state))
    return null
  }

  return (
    <Reader
      story={story}
      state={state}
      onChoose={(i) => update(story, choose(story, state, i))}
      onAdvance={() => update(story, advance(story, state))}
    />
  )
}
