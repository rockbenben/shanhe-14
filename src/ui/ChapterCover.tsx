import { useEffect, useState } from 'react'
import type { Story } from '../stories/schema'
import type { ReaderState } from '../engine/types'
import { useLang } from './lang'

interface Props {
  story: Story
  state: ReaderState
  onEnter: () => void
}

export default function ChapterCover({ story, state, onEnter }: Props) {
  const { tr } = useLang()
  const ch = story.chapters[state.chapter]
  // 史实注默认展开——它是本作「真实底本」的证词，不该藏在折叠里
  const [showNote, setShowNote] = useState(true)

  // 与阅读页同规：空格/回车/点击任意处 翻开本章
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        onEnter()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEnter])

  const onSurfaceClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    onEnter()
  }

  return (
    <main className={ch.art ? 'cover cover--photo' : 'cover'} onClick={onSurfaceClick}>
      {ch.art && (
        <div
          className="cover-photo"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}covers/${ch.art})` }}
          aria-hidden="true"
        />
      )}
      <div className="cover-body">
        <p className="cover-index">{tr(`第 ${state.chapter + 1} 章 · 共 ${story.chapters.length} 章`)}</p>
        <h2 className="cover-title">{tr(ch.title)}</h2>
        {ch.epigraph && <Epigraph text={ch.epigraph} />}
        <button className="cover-enter" onClick={onEnter}>
          {tr(state.chapter === 0 ? '开卷' : '续读')}
        </button>
        {ch.historyNote && (
          <div className="cover-note">
            <button className="cover-note-toggle" onClick={() => setShowNote((v) => !v)}>
              {tr(showNote ? '收起史实注' : '史实注')}
            </button>
            {showNote && <p className="cover-note-body">{tr(ch.historyNote)}</p>}
          </div>
        )}
      </div>
      {ch.artCredit && <p className="cover-credit">{tr(ch.artCredit)}</p>}
    </main>
  )
}

// 章引：若含「——作者《作品》」署名，出处单独一行小字排——引文必须标注来源
function Epigraph({ text }: { text: string }) {
  const { tr } = useLang()
  const i = text.lastIndexOf('——')
  if (i <= 0) return <p className="cover-epigraph">{tr(text)}</p>
  return (
    <p className="cover-epigraph">
      {tr(text.slice(0, i))}
      <span className="cover-epigraph-source">——{tr(text.slice(i + 2))}</span>
    </p>
  )
}
