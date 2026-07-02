import { CHAPTER_END, type Beat, type Story } from '../stories/schema'
import { checkCond } from './cond'
import { resolveEnding } from './finale'
import type { ReaderState } from './types'

export function startStory(story: Story): ReaderState {
  return { storyId: story.id, chapter: 0, beatId: null, flags: [], log: [] }
}

export function enterChapter(story: Story, st: ReaderState): ReaderState {
  return { ...st, beatId: story.chapters[st.chapter].entry }
}

export function currentBeat(story: Story, st: ReaderState): Beat {
  const ch = story.chapters[st.chapter]
  const beat = ch?.beats.find((b) => b.id === st.beatId)
  if (!beat) throw new Error(`当前位置无效：chapter=${st.chapter} beat=${st.beatId}`)
  return beat
}

function goto(story: Story, st: ReaderState, to: string): ReaderState {
  if (to !== CHAPTER_END) return { ...st, beatId: to }
  const next = st.chapter + 1
  if (next < story.chapters.length) return { ...st, chapter: next, beatId: null }
  return { ...st, beatId: null, ended: { endingId: resolveEnding(story, st.flags).id } }
}

export function advance(story: Story, st: ReaderState): ReaderState {
  const beat = currentBeat(story, st)
  if (beat.choices || beat.next === undefined) throw new Error(`beat "${beat.id}" 需要选择，不能直接推进`)
  const to =
    typeof beat.next === 'string'
      ? beat.next
      : // schema 保证条件 next 最后一项无 when，必然兜底
        beat.next.find((n) => checkCond(n.when, st.flags))!.to
  const log = [...st.log, { chapter: st.chapter, beatId: beat.id }]
  return goto(story, { ...st, log }, to)
}

export function choose(story: Story, st: ReaderState, index: number): ReaderState {
  const beat = currentBeat(story, st)
  const choice = beat.choices?.[index]
  if (!choice) throw new Error(`beat "${beat.id}" 无第 ${index} 个选项`)
  const flags = choice.set ? [...new Set([...st.flags, ...choice.set])] : st.flags
  const log = [...st.log, { chapter: st.chapter, beatId: beat.id, choiceText: choice.text }]
  return goto(story, { ...st, flags, log }, choice.to)
}
