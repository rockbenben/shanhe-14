import { useEffect, useState } from 'react'
import type { Story } from '../stories/schema'
import type { ReaderState } from '../engine/types'
import { currentBeat } from '../engine/reader'
import { artUrl } from './art'
import { useLang } from './lang'

// 防闪背景：旧图保持到新图解码完成才切换——切拍时不露空白
function ReaderBg({ url, full }: { url?: string; full?: boolean }) {
  const [shown, setShown] = useState(url)
  useEffect(() => {
    if (!url || url === shown) return
    const im = new Image()
    im.onload = () => setShown(url)
    im.src = url
  }, [url, shown])
  if (!shown) return null
  return (
    <div
      className={full ? 'reader-bg reader-bg--full' : 'reader-bg'}
      style={{ backgroundImage: `url(${shown})` }}
      aria-hidden="true"
    />
  )
}

// 选择后的即时回应：非空时先显示「你的选择 + 回应」，推进后才展开本拍正文
export interface Reaction {
  choiceText: string
  text: string
}

interface Props {
  story: Story
  state: ReaderState
  reaction: Reaction | null
  // 览图模式：隐去文字浮层纯赏画面，再点返回文字
  artOnly: boolean
  onToggleArt: () => void
  onChoose: (index: number) => void
  onAdvance: () => void
  // ←/↑ 回退到上一页（会话级快照栈）
  onBack: () => void
}

export default function Reader({ story, state, reaction, artOnly, onToggleArt, onChoose, onAdvance, onBack }: Props) {
  const { tr } = useLang()
  const chapter = story.chapters[state.chapter]
  const beat = currentBeat(story, state)
  // 视觉小说惯例：无分支时空格/回车推进，点击画面任意处亦可
  const canAdvance = !artOnly && (!!reaction || !beat.choices)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 空格/↓/→ 是「放剧情键」：普通拍推进；到选择点自动替读者选一项（随机），
      // 照常走「你的选择+回应」流程——只想看故事的人可以一键到底
      if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        ;(document.activeElement as HTMLElement | null)?.blur?.()
        if (artOnly) onToggleArt()
        else if (canAdvance) onAdvance()
        else if (beat.choices) onChoose(Math.floor(Math.random() * beat.choices.length))
        return
      }
      if (artOnly && (e.key === 'Escape' || e.key === 'Enter')) {
        e.preventDefault()
        onToggleArt()
        return
      }
      // ←/↑ 回退上一页
      if (!artOnly && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) {
        e.preventDefault()
        onBack()
        return
      }
      // 回车保留浏览器默认：聚焦某个选项按钮时回车＝键盘用户的明确选择
      if (canAdvance && e.key === 'Enter' && !(document.activeElement instanceof HTMLButtonElement)) {
        e.preventDefault()
        onAdvance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canAdvance, artOnly, beat, onAdvance, onToggleArt, onChoose, onBack])

  // 真实照片拍（beat.photo，档案照片+出处署名）优先于版画插画（beat.art）
  const photoUrl = beat.photo ? `${import.meta.env.BASE_URL}covers/${beat.photo.file}` : undefined
  const img = photoUrl ?? (beat.art ? artUrl(beat.art) : undefined)

  // 预加载下一拍可能用到的图——多数切换可无缝
  useEffect(() => {
    const ch = story.chapters[state.chapter]
    const tos = beat.choices
      ? beat.choices.map((c) => c.to)
      : typeof beat.next === 'string'
        ? [beat.next]
        : (beat.next ?? []).map((n) => n.to)
    for (const to of tos) {
      const nb = ch.beats.find((b) => b.id === to)
      if (!nb) continue
      const u = nb.photo
        ? `${import.meta.env.BASE_URL}covers/${nb.photo.file}`
        : nb.art
          ? artUrl(nb.art)
          : undefined
      if (u) new Image().src = u
    }
  }, [beat, state.chapter, story])
  const photoCredit = beat.photo && (
    <p className="reader-photocredit">{tr(beat.photo.credit)}</p>
  )

  // 览图模式：只留画面与一枚返回钮，点击任意处回到文字
  if (artOnly && img) {
    return (
      <main
        className="reader reader--artonly"
        onClick={(e) => {
          // 按钮自带 onClick；冒泡到整屏会二次切换（切出去又切回来），故拦掉
          if ((e.target as HTMLElement).closest('button')) return
          onToggleArt()
        }}
      >
        <ReaderBg url={img} full />
        <button className="reader-viewtoggle" onClick={onToggleArt}>
          {tr('返回阅读')}
        </button>
        {photoCredit}
      </main>
    )
  }

  const onSurfaceClick = (e: React.MouseEvent) => {
    if (!canAdvance) return
    if ((e.target as HTMLElement).closest('button')) return // 按钮自带 onClick，避免双触发
    onAdvance()
  }

  const cls = `reader${canAdvance ? ' reader--advance' : ''}${img ? ' reader--immersive' : ''}`
  const viewBtn = img && (
    <button className="reader-viewtoggle" onClick={onToggleArt}>
      {tr('看全图')}
    </button>
  )

  if (reaction) {
    return (
      <main className={cls} onClick={onSurfaceClick}>
        <ReaderBg url={img} />
        <header className="reader-chapter">
          {tr(`第${state.chapter + 1}章`)} · {tr(chapter.title)}
        </header>
        <article className="reader-reaction">
          <p className="reader-reaction-choice">
            {tr('你的选择')} · {tr(reaction.choiceText)}
          </p>
          {tr(reaction.text)}
        </article>
        <button className="reader-continue" onClick={onAdvance}>
          {tr('继续')} ▸
        </button>
        {viewBtn}
        {photoCredit}
      </main>
    )
  }

  return (
    <main className={cls} onClick={onSurfaceClick}>
      {img && <div className="reader-bg" style={{ backgroundImage: `url(${img})` }} aria-hidden="true" />}
      <header className="reader-chapter">
        {tr(`第${state.chapter + 1}章`)} · {tr(chapter.title)}
      </header>
      <article className="reader-narrative">
        {beat.echo && (
          <p className="reader-echo">
            ◈ {tr('回响')} —— {tr(beat.echo)}
          </p>
        )}
        {tr(beat.narrative)}
        {beat.source && <p className="reader-source">◈ {tr(beat.source)}</p>}
      </article>
      {beat.choices ? (
        <div className="reader-choices">
          {beat.choices.map((c, i) => (
            <button key={i} onClick={() => onChoose(i)}>
              {tr(c.text)}
            </button>
          ))}
        </div>
      ) : (
        <button className="reader-continue" onClick={onAdvance}>
          {tr('继续')} ▸
        </button>
      )}
      {viewBtn}
      {photoCredit}
    </main>
  )
}
