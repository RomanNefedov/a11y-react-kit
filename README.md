# a11y-react-kit

Accessibility panel + TTS hooks for React 18+ apps.

## Install

```bash
npm install a11y-react-kit
```

## Setup

### 1. Add one CSS rule

The package controls font size via the `--rak-font-size` CSS variable. Add this to your global stylesheet (e.g. `index.css`):

```css
html {
  font-size: var(--rak-font-size, 16px);
}
```

Without this line the А / А+ / А++ font-size buttons will have no visible effect.

### 2. Wrap your app

```tsx
// main.tsx
import 'a11y-react-kit/styles.css'
import { A11yProvider } from 'a11y-react-kit'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <A11yProvider>
    <App />
  </A11yProvider>
)
```

> **Custom storage key** — if you have multiple apps sharing the same origin, pass a unique key to avoid conflicts:
> ```tsx
> <A11yProvider storageKey="my-app-a11y">
> ```

## Ready-made panel

Drop in the built-in panel (no Tailwind required — uses inline styles):

```tsx
import { AccessibilityPanel } from 'a11y-react-kit'

export default function App() {
  return (
    <>
      <YourApp />
      {/* ttsLang filters the voice dropdown to a specific language */}
      <AccessibilityPanel ttsLang="en" />
    </>
  )
}
```

The panel appears as a floating button (bottom-right corner). It includes font size, colour scheme, spacing, link highlighting, reduce-motion, narrow width, TTS rate slider, and voice selector — all persisted automatically.

## Build your own UI

Use `useA11y()` to read state and trigger changes:

```tsx
import { useA11y } from 'a11y-react-kit'

function MyPanel() {
  const { fontSize, setFontSize, wideSpacing, toggleWideSpacing } = useA11y()
  return (
    <div>
      <button onClick={() => setFontSize('large')}>Bigger text</button>
      <button onClick={toggleWideSpacing}>
        {wideSpacing ? 'Normal spacing' : 'Wide spacing'}
      </button>
    </div>
  )
}
```

### Available state & actions

| State | Type | Default | Description |
|-------|------|---------|-------------|
| `isAccessibilityMode` | `boolean` | `false` | Master accessibility toggle |
| `colorScheme` | `'normal' \| 'high-contrast'` | `'normal'` | Colour scheme |
| `fontSize` | `'normal' \| 'large' \| 'x-large'` | `'normal'` | Base font size |
| `wideSpacing` | `boolean` | `false` | Increased letter/line/word spacing |
| `highlightLinks` | `boolean` | `false` | Underline + outline all links |
| `reduceMotion` | `boolean` | `false` | Disable CSS transitions & animations |
| `narrowWidth` | `boolean` | `false` | Cap `.prose` / `.article-content` at 65ch |
| `ttsRate` | `number` | `0.85` | TTS speech rate (0.5–1.5) |
| `ttsVoiceURI` | `string \| null` | `null` | Selected voice URI (`null` = browser default) |

| Action | Description |
|--------|-------------|
| `toggleAccessibility()` | Toggle base accessibility mode |
| `setColorScheme(s)` | Switch colour scheme |
| `setFontSize(s)` | Change font size |
| `toggleWideSpacing()` | Letter/line spacing |
| `toggleHighlightLinks()` | Underline + outline all links |
| `toggleReduceMotion()` | Disable all CSS transitions & animations |
| `toggleNarrowWidth()` | Cap article width at 65ch |
| `setTtsRate(rate)` | Set TTS speech rate (0.5–1.5) |
| `setTtsVoiceURI(uri)` | Set TTS voice (`null` restores browser default) |

All settings are persisted to `localStorage` automatically.

## TTS

To respect the voice and rate the user chose in the accessibility panel, read `ttsRate` and `ttsVoiceURI` from `useA11y()` and pass them into `useTTS()`:

```tsx
import { useTTS, stripHtmlForTTS, useA11y } from 'a11y-react-kit'

function ArticlePage({ article }) {
  const { ttsRate, ttsVoiceURI } = useA11y()
  const tts = useTTS('en-US', ttsRate, ttsVoiceURI)

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />

      {tts.isSupported && (
        <button onClick={() =>
          tts.state === 'speaking' ? tts.pause()  :
          tts.state === 'paused'   ? tts.resume() :
          tts.speak(`${article.title}. ${stripHtmlForTTS(article.content)}`, article.id)
        }>
          {tts.state === 'speaking' ? 'Pause' : tts.state === 'paused' ? 'Resume' : 'Read aloud'}
        </button>
      )}
    </>
  )
}
```

### `useTTS(lang?, rate?, voiceURI?)`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `lang` | `string` | `'ru-RU'` | BCP-47 language tag |
| `rate` | `number` | `0.85` | Speech rate 0.1–2 |
| `voiceURI` | `string \| null` | `null` | Voice URI; `null` = browser default |

| Return | Type | Description |
|--------|------|-------------|
| `state` | `'idle' \| 'speaking' \| 'paused'` | Current TTS state |
| `activeId` | `string \| null` | ID passed to `speak()` |
| `isSupported` | `boolean` | `false` on browsers without Web Speech API |
| `speak(text, id)` | `void` | Start speaking; stops any ongoing speech |
| `pause()` | `void` | Pause |
| `resume()` | `void` | Resume |
| `stop()` | `void` | Cancel |

### `useVoices(langPrefix?)`

Returns available `SpeechSynthesisVoice[]`, filtered by language prefix. Handles async voice loading automatically (voices are not available synchronously in most browsers).

```tsx
import { useVoices } from 'a11y-react-kit'

const voices = useVoices('en')  // English voices only
const all    = useVoices()      // all browser voices
```

### Utilities

```ts
stripHtmlForTTS(html: string): string
// Converts HTML to plain text, inserting sentence pauses at block-element boundaries.

preprocessTTSText(text: string): string
// Normalises dashes, quotes, ellipsis, bullets for natural TTS reading.
```

## CSS classes applied to `<html>`

| Class | Effect |
|-------|--------|
| `rak-mode` | Base accessibility mode |
| `rak-high-contrast` | Greyscale + high contrast filter |
| `rak-wide-spacing` | Increased letter/line/word spacing |
| `rak-highlight-links` | Underline + dashed outline on all `<a>` |
| `rak-reduce-motion` | All transitions/animations → 0.001ms |
| `rak-narrow-width` | `.prose` / `.article-content` max-width: 65ch |

Override any class in your own CSS as needed.

## `rak-narrow-width` note

The narrow-width feature targets `.prose` (Tailwind Typography) and `.article-content` selectors. In a project without Tailwind, add your own override:

```css
.rak-narrow-width .my-article {
  max-width: 65ch;
}
```

## Peer dependencies

- `react` >= 18
- `react-dom` >= 18

No other runtime dependencies.
