import { useState } from 'react'
import { builtinStories } from './stories'
import type { Story } from './stories/schema'
import type { ReaderState } from './engine/types'
import { advance, choose, enterChapter, startStory } from './engine/reader'
import { clearProgress, loadProgress, saveProgress, validProgress } from './engine/storage'
import Home from './ui/Home'
import Reader, { type Reaction } from './ui/Reader'
import ChapterCover from './ui/ChapterCover'
import EndingCard from './ui/EndingCard'
import Recap from './ui/Recap'
import Gallery from './ui/Gallery'
import About from './ui/About'
import { LangProvider, useLang } from './ui/lang'

interface Session {
  story: Story
  state: ReaderState
}

// 终卷之后的三个去处：结局卡 / 命运长卷 / 影像志
type EndView = 'card' | 'recap' | 'gallery'

function Shell() {
  const { mode, toggle } = useLang()
  const [session, setSession] = useState<Session | null>(null)
  const [endView, setEndView] = useState<EndView>('card')
  // 选择的即时回应（瞬时展示，不进存档）：带上所选文案，让回应页读得出「这是谁的着落」
  const [reaction, setReaction] = useState<Reaction | null>(null)
  // 览图模式：隐去文字浮层纯赏画面
  const [artOnly, setArtOnly] = useState(false)
  // 回退栈：状态快照（会话级，不入存档）——←/↑ 逐步退回上一页，退过选择点即可重选
  const [, setHistory] = useState<ReaderState[]>([])
  // 关于本作页（仅从卷首进入）
  const [showAbout, setShowAbout] = useState(false)

  const update = (story: Story, state: ReaderState) => {
    saveProgress(state)
    setSession((prev) => {
      if (prev) setHistory((h) => [...h.slice(-199), prev.state])
      return { story, state }
    })
  }

  const goBack = () => {
    setHistory((h) => {
      if (!h.length) return h
      const prev = h[h.length - 1]
      setReaction(null)
      saveProgress(prev)
      setSession((s) => (s ? { story: s.story, state: prev } : s))
      return h.slice(0, -1)
    })
  }

  // 简繁角标常驻右上角
  const langBtn = (
    <button className="lang-toggle" onClick={toggle} aria-label="简繁切换">
      {mode === 's' ? '繁' : '简'}
    </button>
  )

  let screen: React.ReactNode

  if (!session) {
    screen = showAbout ? (
      <About onBack={() => setShowAbout(false)} />
    ) : (
      <Home
        stories={builtinStories}
        onAbout={() => setShowAbout(true)}
        onStart={(story) => {
          clearProgress(story.id)
          setHistory([])
          update(story, startStory(story))
        }}
        onContinue={(story) => {
          const st = validProgress(story, loadProgress(story.id))
          if (st) {
            setHistory([])
            setSession({ story, state: st })
          }
        }}
      />
    )
  } else {
    const { story, state } = session

    if (state.ended) {
      const ending = story.endings.find((e) => e.id === state.ended!.endingId)!
      if (endView === 'recap') {
        screen = <Recap story={story} log={state.log} ending={ending} onBack={() => setEndView('card')} />
      } else if (endView === 'gallery') {
        screen = <Gallery story={story} onBack={() => setEndView('card')} />
      } else {
        screen = (
          <EndingCard
            story={story}
            ending={ending}
            onRestart={() => {
              setEndView('card')
              setSession(null)
            }}
            onRecap={() => setEndView('recap')}
            onGallery={() => setEndView('gallery')}
          />
        )
      }
    } else if (state.beatId === null) {
      screen = (
        <ChapterCover
          story={story}
          state={state}
          onEnter={() => update(story, enterChapter(story, state))}
          onBack={goBack}
        />
      )
    } else {
      screen = (
        <Reader
          story={story}
          state={state}
          reaction={reaction}
          artOnly={artOnly}
          onBack={goBack}
          onToggleArt={() => setArtOnly((v) => !v)}
          onChoose={(i) => {
            const beat = story.chapters[state.chapter].beats.find((b) => b.id === state.beatId)
            const c = beat?.choices?.[i]
            const next = choose(story, state, i)
            // 选择直达章末/终卷时跳过回应（封面/结局页会立即接管画面）
            setReaction(
              next.beatId !== null && !next.ended && c?.reaction
                ? { choiceText: c.text, text: c.reaction }
                : null,
            )
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
  }

  return (
    <>
      {screen}
      {langBtn}
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  )
}
