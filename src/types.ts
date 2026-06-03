export type ColorScheme = 'normal' | 'high-contrast'
export type FontSize = 'normal' | 'large' | 'x-large'

export interface A11yState {
  isAccessibilityMode: boolean
  colorScheme: ColorScheme
  fontSize: FontSize
  wideSpacing: boolean
  highlightLinks: boolean
  reduceMotion: boolean
  narrowWidth: boolean
  ttsRate: number
  ttsVoiceURI: string | null
}

export interface A11yActions {
  toggleAccessibility: () => void
  setColorScheme: (s: ColorScheme) => void
  setFontSize: (s: FontSize) => void
  toggleWideSpacing: () => void
  toggleHighlightLinks: () => void
  toggleReduceMotion: () => void
  toggleNarrowWidth: () => void
  setTtsRate: (rate: number) => void
  setTtsVoiceURI: (uri: string | null) => void
}

export type A11yContext = A11yState & A11yActions
