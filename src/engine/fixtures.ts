import { storySchema, type Story } from '../stories/schema'

// 引擎测试共用的极小故事：两章、一个 flag、条件路由与双结局俱全。
export const demoStory: Story = storySchema.parse({
  id: 'demo',
  title: '示例小卷',
  tagline: '引擎测试用的两章小故事',
  chapters: [
    {
      id: 'c1',
      title: '岔路',
      entry: 'b1',
      beats: [
        {
          id: 'b1',
          narrative: '你站在岔路口。',
          choices: [
            { text: '向左', set: ['左'], to: 'b2' },
            { text: '向右', to: 'b2' },
          ],
        },
        { id: 'b2', narrative: '两条路在林中并拢。', next: [{ when: '左', to: 'b3' }, { to: '$end' }] },
        { id: 'b3', narrative: '左途多看见一片湖。', next: '$end' },
      ],
    },
    {
      id: 'c2',
      title: '归途',
      entry: 'b1',
      beats: [{ id: 'b1', narrative: '你踏上归途。', next: '$end' }],
    },
  ],
  endings: [
    { id: 'e-left', when: '左', title: '湖畔', epilogue: '你记得那片湖。' },
    { id: 'e-def', title: '归家', epilogue: '你回到了家。' },
  ],
})
