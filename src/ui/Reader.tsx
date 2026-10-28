import { useEffect, useState } from 'react'
import type { Story } from '../stories/schema'
import type { ReaderState } from '../engine/types'
import { currentBeat } from '../engine/reader'
import { artUrl } from './art'
import { useLang } from './lang'

// 影像层：画册式翻页——旧图保持到新图解码完成后瞬时硬切，无空窗无叠影无暗场；
// 本拍无图（如素纸拍）则立即清空。
function ReaderBg({ url, full, art }: { url?: string; full?: boolean; art?: boolean }) {
  const [shown, setShown] = useState(url)
  useEffect(() => {
    if (!url) {
      setShown(undefined)
      return
    }
    if (url === shown) return
    const im = new Image()
    im.onload = () => setShown(url)
    im.src = url
  }, [url, shown])
  if (!shown) return null
  return (
    <div
      className={`reader-bg${full ? ' reader-bg--full' : ''}${art ? ' reader-bg--art' : ''}`}
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
  canGoBack: boolean
  onToggleArt: () => void
  onChoose: (index: number) => void
  onAdvance: () => void
  // ←/↑ 回退到上一页（会话级快照栈）
  onBack: () => void
}

const HINT_KEY = 'floating-life:hinted'

export default function Reader({ story, state, reaction, artOnly, canGoBack, onToggleArt, onChoose, onAdvance, onBack }: Props) {
  const { tr } = useLang()
  const chapter = story.chapters[state.chapter]
  const beat = currentBeat(story, state)
  // 视觉小说惯例：无分支时空格/回车推进，点击画面任意处亦可
  const canAdvance = !artOnly && (!!reaction || !beat.choices)
  // 窄屏改为整页滚动后，换拍要回到段首，别停在上一条的滚动位置
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [state.chapter, state.beatId, reaction, artOnly])

  // 首次操作提示：初次进入正文出现，一翻页或 10 秒后收起，之后不再打扰
  const [showHint, setShowHint] = useState(() => !localStorage.getItem(HINT_KEY))
  useEffect(() => {
    if (!showHint) return
    const done = () => {
      localStorage.setItem(HINT_KEY, '1')
      setShowHint(false)
    }
    const t = setTimeout(done, 10000)
    return () => { clearTimeout(t); done() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.beatId, showHint])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 焦点停在按钮/链接上时，空格与回车交给浏览器原生激活，别把「出处」链接的
      // 回车、或键盘用户选中的选项，抢成全局推进/随机选择
      const active = document.activeElement as HTMLElement | null
      const onControl = !!active?.closest?.('button, a')
      if (onControl && (e.key === ' ' || e.key === 'Enter')) return
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
  // 当前这幅是版画插画（而非档案照片）——竖屏看全图时按插画的比例整幅显示
  const isArt = !photoUrl && !!beat.art

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
    <p className="reader-photocredit">
      {beat.photo.url ? (
        <a href={beat.photo.url} target="_blank" rel="noopener noreferrer">{tr(beat.photo.credit)}</a>
      ) : (
        tr(beat.photo.credit)
      )}
    </p>
  )

  // 览图模式：只留画面与一枚返回钮，点击任意处回到文字
  if (artOnly && img) {
    return (
      <main
        className="reader reader--artonly"
        onClick={(e) => {
          // 按钮/出处链接自带 onClick；冒泡到整屏会二次切换、或把「点出处」当成翻页
          if ((e.target as HTMLElement).closest('button, a')) return
          onToggleArt()
        }}
      >
        <ReaderBg url={img} full art={isArt} />
        <button className="reader-viewtoggle" onClick={onToggleArt}>
          {tr('返回')}
        </button>
        {photoCredit}
      </main>
    )
  }

  const onSurfaceClick = (e: React.MouseEvent) => {
    if (!canAdvance) return
    // 按钮与出处链接自带 onClick；冒泡到整屏会把「点出处」当成翻页
    if ((e.target as HTMLElement).closest('button, a')) return
    onAdvance()
  }

  const cls = `reader${canAdvance ? ' reader--advance' : ''}${img ? ' reader--immersive' : ''}`
  const viewBtn = img && (
    <button className="reader-viewtoggle" onClick={onToggleArt}>
      {tr('看全图')}
    </button>
  )
  // 触屏没有 ← 键，给一页一枚实体回退钮（览图模式只留「返回」，不叠两个返回）
  const backBtn = canGoBack && (
    <button className="reader-back" onClick={onBack} aria-label={tr('回退上一页')} title={tr('回退上一页')}>
      ←
    </button>
  )

  if (reaction) {
    return (
      <main className={cls} onClick={onSurfaceClick}>
        <ReaderBg url={img} art={isArt} />
        {backBtn}
        <header className="reader-chapter">
          {tr(`第 ${state.chapter + 1} 章`)} · {tr(chapter.title)}{chapter.era && <span className="reader-era">{chapter.era}</span>}
        </header>
        <article key="reaction" className="reader-reaction">
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
      <ReaderBg url={img} art={isArt} />
      {backBtn}
      <header className="reader-chapter">
        {tr(`第 ${state.chapter + 1} 章`)} · {tr(chapter.title)}{chapter.era && <span className="reader-era">{chapter.era}</span>}
      </header>
      <article key={state.beatId ?? undefined} className="reader-narrative">
        {beat.echo && (
          <p className="reader-echo">
            ◈ {tr('回响')} —— {tr(beat.echo)}
          </p>
        )}
        {tr(beat.narrative)}
        {beat.source && (
          <p className="reader-source">
            ◈{' '}
            {beat.sourceUrl ? (
              <a href={beat.sourceUrl} target="_blank" rel="noopener noreferrer">{tr(beat.source)}</a>
            ) : (
              tr(beat.source)
            )}
          </p>
        )}
      </article>
      {beat.choices ? (
        <div className="reader-choices">
          {beat.choices.map((c, i) => (
            <button key={i} style={{ animationDelay: `${0.15 + i * 0.12}s` }} onClick={() => onChoose(i)}>
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
      {showHint && (
        <p className="reader-hint">{tr('空格或点击画面继续 · ← 回退 · 到选择点空格会替你选一项')}</p>
      )}
    </main>
  )
}
