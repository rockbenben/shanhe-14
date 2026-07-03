import type { Ending, Story } from '../stories/schema'
import { useEffect } from 'react'
import { useLang } from './lang'

interface Props {
  story: Story
  ending: Ending
  onRestart: () => void
  onRecap: () => void
  onGallery: () => void
}

// 结局页＝记录的最后一页：档案照片为幕（无照片则素纸）、结局题、
// 一枚「存档」朱印收卷（与卷首「史实改编」印首尾同构）、尾声正文、去向按钮。
export default function EndingCard({ story, ending, onRestart, onRecap, onGallery }: Props) {
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
  return (
    <main className={ending.photo ? 'ending cover--photo' : 'ending'}>
      {ending.photo && (
        <div
          className="cover-photo"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}covers/${ending.photo.file})` }}
          aria-hidden="true"
        />
      )}
      <p className="ending-story">{tr(story.title)}</p>
      <div className="ending-titleblock">
        <h2 className="ending-title">{tr(ending.title)}</h2>
        <span className="ending-seal" aria-hidden="true">{tr('存档')}</span>
      </div>
      <p className="ending-epilogue">{tr(ending.epilogue)}</p>
      <div className="ending-actions">
        <button onClick={onRecap}>{tr('回顾全程')}</button>
        <button onClick={onGallery}>{tr('历史影像')}</button>
        <button onClick={onRestart}>{tr('重新开始')}</button>
      </div>
      {ending.photo && (
        <p className="cover-credit">
          {ending.photo.url ? (
            <a href={ending.photo.url} target="_blank" rel="noopener noreferrer">{tr(ending.photo.credit)}</a>
          ) : (
            tr(ending.photo.credit)
          )}
        </p>
      )}
    </main>
  )
}
