import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { A11yState, A11yActions, A11yContext, ColorScheme, FontSize } from './types'

const STORAGE_KEY = 'a11y-react-kit'

const fontSizeMap: Record<FontSize, string> = {
  normal: '16px',
  large: '20px',
  'x-large': '24px',
}

const defaultState: A11yState = {
  isAccessibilityMode: false,
  colorScheme: 'normal',
  fontSize: 'normal',
  wideSpacing: false,
  highlightLinks: false,
  reduceMotion: false,
  narrowWidth: false,
  largeTargets: false,
  dyslexiaFont: false,
  readingRuler: false,
  ttsRate: 0.85,
  ttsVoiceURI: null,
}

function loadState(key: string): A11yState {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return { ...defaultState, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaultState
}

/** Lazily injects the OpenDyslexic stylesheet from CDN (only once per session). */
function loadDyslexiaFont() {
  if (typeof document === 'undefined') return
  if (document.getElementById('rak-dyslexia-font')) return
  const link = document.createElement('link')
  link.id = 'rak-dyslexia-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.cdnfonts.com/css/opendyslexic'
  document.head.appendChild(link)
}

function applyToDOM(s: A11yState) {
  const html = document.documentElement
  html.classList.toggle('rak-mode',            s.isAccessibilityMode)
  html.classList.toggle('rak-high-contrast',   s.isAccessibilityMode && s.colorScheme === 'high-contrast')
  html.classList.toggle('rak-wide-spacing',    s.wideSpacing)
  html.classList.toggle('rak-highlight-links', s.highlightLinks)
  html.classList.toggle('rak-reduce-motion',   s.reduceMotion)
  html.classList.toggle('rak-narrow-width',    s.narrowWidth)
  html.classList.toggle('rak-large-targets',   s.largeTargets)
  html.classList.toggle('rak-dyslexia-font',   s.dyslexiaFont)
  // readingRuler is a React component overlay — no CSS class needed

  if (s.dyslexiaFont) loadDyslexiaFont()

  html.style.setProperty(
    '--rak-font-size',
    s.isAccessibilityMode ? fontSizeMap[s.fontSize] : '16px',
  )
}

type ToggleField = keyof Pick<
  A11yState,
  'wideSpacing' | 'highlightLinks' | 'reduceMotion' | 'narrowWidth' |
  'largeTargets' | 'dyslexiaFont' | 'readingRuler'
>

type Action =
  | { type: 'TOGGLE_A11Y' }
  | { type: 'SET_COLOR_SCHEME'; payload: ColorScheme }
  | { type: 'SET_FONT_SIZE'; payload: FontSize }
  | { type: 'TOGGLE'; field: ToggleField }
  | { type: 'SET_TTS_RATE'; payload: number }
  | { type: 'SET_TTS_VOICE_URI'; payload: string | null }

function reducer(state: A11yState, action: Action): A11yState {
  switch (action.type) {
    case 'TOGGLE_A11Y':       return { ...state, isAccessibilityMode: !state.isAccessibilityMode }
    case 'SET_COLOR_SCHEME':  return { ...state, colorScheme: action.payload }
    case 'SET_FONT_SIZE':     return { ...state, fontSize: action.payload }
    case 'TOGGLE':            return { ...state, [action.field]: !state[action.field] }
    case 'SET_TTS_RATE':      return { ...state, ttsRate: action.payload }
    case 'SET_TTS_VOICE_URI': return { ...state, ttsVoiceURI: action.payload }
  }
}

const Ctx = createContext<A11yContext | null>(null)

export function A11yProvider({ children, storageKey = STORAGE_KEY }: {
  children: ReactNode
  storageKey?: string
}) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState(storageKey))

  useEffect(() => {
    applyToDOM(state)
    try { localStorage.setItem(storageKey, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state, storageKey])

  useEffect(() => { applyToDOM(state) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const actions: A11yActions = {
    toggleAccessibility:  () => dispatch({ type: 'TOGGLE_A11Y' }),
    setColorScheme:  (s) => dispatch({ type: 'SET_COLOR_SCHEME', payload: s }),
    setFontSize:     (s) => dispatch({ type: 'SET_FONT_SIZE', payload: s }),
    toggleWideSpacing:    () => dispatch({ type: 'TOGGLE', field: 'wideSpacing' }),
    toggleHighlightLinks: () => dispatch({ type: 'TOGGLE', field: 'highlightLinks' }),
    toggleReduceMotion:   () => dispatch({ type: 'TOGGLE', field: 'reduceMotion' }),
    toggleNarrowWidth:    () => dispatch({ type: 'TOGGLE', field: 'narrowWidth' }),
    toggleLargeTargets:   () => dispatch({ type: 'TOGGLE', field: 'largeTargets' }),
    toggleDyslexiaFont:   () => dispatch({ type: 'TOGGLE', field: 'dyslexiaFont' }),
    toggleReadingRuler:   () => dispatch({ type: 'TOGGLE', field: 'readingRuler' }),
    setTtsRate:     (rate) => dispatch({ type: 'SET_TTS_RATE', payload: rate }),
    setTtsVoiceURI: (uri)  => dispatch({ type: 'SET_TTS_VOICE_URI', payload: uri }),
  }

  return <Ctx.Provider value={{ ...state, ...actions }}>{children}</Ctx.Provider>
}

export function useA11y(): A11yContext {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useA11y() must be called inside <A11yProvider>')
  return ctx
}
