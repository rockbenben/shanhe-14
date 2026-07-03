import { useEffect, useState } from 'react'
import type { Story } from '../stories/schema'
import type { ReaderState } from '../engine/types'
import { useLang } from './lang'

interface Props {
  story: Story
  state: ReaderState
  onEnter: () => void
  // ←/↑ 回退（退回上一章的末尾）
  onBack: () => void
}

export default function ChapterCover({ story, state, onEnter, onBack }: Props) {
  const { tr } = useLang()
  const ch = story.chapters[state.chapter]
  // 史实注默认展开——它是本作「真实底本」的证词，不该藏在折叠里
  const [showNote, setShowNote] = useState(true)
  // 看全图：撤掉压暗与文字，纯赏章封档案照片
  const [artView, setArtView] = useState(false)

  // 与阅读页同规：空格/回车/→/↓/点击任意处 进入本章；←/↑ 回退；看全图时任意键返回
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (artView) {
        if ([' ', 'Enter', 'Escape', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
          e.preventDefault()
          setArtView(false)
        }
        return
      }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        onEnter()
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        onBack()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEnter, onBack, artView])

  const onSurfaceClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if (artView) setArtView(false)
    else onEnter()
  }

  // 看全图：只留照片与署名
  if (artView && ch.art) {
    return (
      <main className="cover cover--photo cover--artview" onClick={onSurfaceClick}>
        <div
          className="cover-photo"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}covers/${ch.art})` }}
          aria-hidden="true"
        />
        <button className="reader-viewtoggle" onClick={() => setArtView(false)}>
          {tr('返回')}
        </button>
        {ch.artCredit && <p className="cover-credit">{tr(ch.artCredit)}</p>}
      </main>
    )
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
          {tr('进入本章')}
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
      {ch.art && (
        <button className="reader-viewtoggle" onClick={() => setArtView(true)}>
          {tr('看全图')}
        </button>
      )}
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
