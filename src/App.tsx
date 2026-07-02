import { useState } from 'react'
import { builtinStories } from './stories'
import type { Story } from './stories/schema'
import type { ReaderState } from './engine/types'
import { advance, choose, enterChapter, startStory } from './engine/reader'
import { clearProgress, loadProgress, saveProgress } from './engine/storage'
import Home from './ui/Home'
import Reader from './ui/Reader'
import ChapterCover from './ui/ChapterCover'
import EndingCard from './ui/EndingCard'
import Recap from './ui/Recap'

interface Session {
  story: Story
  state: ReaderState
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [recap, setRecap] = useState(false)

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
    if (recap) {
      return <Recap story={story} log={state.log} ending={ending} onBack={() => setRecap(false)} />
    }
    return (
      <EndingCard
        story={story}
        ending={ending}
        log={state.log}
        onRestart={() => {
          setRecap(false)
          setSession(null)
        }}
        onRecap={() => setRecap(true)}
      />
    )
  }

  if (state.beatId === null) {
    return <ChapterCover story={story} state={state} onEnter={() => update(story, enterChapter(story, state))} />
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
