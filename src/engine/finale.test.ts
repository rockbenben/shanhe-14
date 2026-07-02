import { describe, expect, it } from 'vitest'
import { demoStory } from './fixtures'
import { resolveEnding } from './finale'

describe('resolveEnding', () => {
  it('命中带 when 的结局', () => {
    expect(resolveEnding(demoStory, ['左']).id).toBe('e-left')
  })
  it('无命中时落兜底', () => {
    expect(resolveEnding(demoStory, []).id).toBe('e-def')
  })
})
