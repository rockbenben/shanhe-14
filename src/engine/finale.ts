import type { Ending, Story } from '../stories/schema'
import { checkCond } from './cond'

// 顺序首个条件命中者胜出；schema 保证最后一项无 when，必然兜底。
export function resolveEnding(story: Story, flags: string[]): Ending {
  return story.endings.find((e) => checkCond(e.when, flags))!
}
