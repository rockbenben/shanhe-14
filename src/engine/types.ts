export interface LogEntry {
  chapter: number
  beatId: string
  choiceText?: string
}

// beatId === null：停在当前章的封面页（尚未 enterChapter）。
export interface ReaderState {
  storyId: string
  chapter: number
  beatId: string | null
  flags: string[]
  log: LogEntry[]
  ended?: { endingId: string }
}
