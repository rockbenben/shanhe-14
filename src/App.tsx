import { useState } from 'react'
import { builtinStories } from './stories'
import type { Story } from './stories/schema'
import type { ReaderState } from './engine/types'
import { advance, choose, enterChapter, startStory } from './engine/reader'
import { clearProgress, loadProgress, saveProgress, validProgress } from './engine/storage'
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
  // 选择的即时回应（瞬时展示，不进存档）：先浮现这一行，点「继续」才翻到下一拍
  const [reaction, setReaction] = useState<string | null>(null)

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
        onContinue={(story) => {
          const st = validProgress(story, loadProgress(story.id))
          if (st) setSession({ story, state: st })
        }}
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
      reaction={reaction}
      onChoose={(i) => {
        const beat = story.chapters[state.chapter].beats.find((b) => b.id === state.beatId)
        const next = choose(story, state, i)
        // 选择直达章末/终卷时跳过回应（封面/结局页会立即接管画面）
        setReaction(next.beatId !== null && !next.ended ? (beat?.choices?.[i]?.reaction ?? null) : null)
        update(story, next)
      }}
      onAdvance={() => {
        if (reaction) {
          setReaction(null)
          return
        }
        update(story, advance(story, state))
      }}
    />
  )
}
