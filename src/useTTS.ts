import { useState, useCallback, useEffect } from 'react'

export type TTSState = 'idle' | 'speaking' | 'paused'

/** Strips HTML tags, inserting sentence pauses at block-element boundaries. */
export function stripHtmlForTTS(html: string): string {
  const withBreaks = html.replace(
    /<\/?(p|div|h[1-6]|li|ul|ol|br|blockquote|section|article|header|footer|tr|td|th)[^>]*>/gi,
    ' . ',
  )
  const div = document.createElement('div')
  div.innerHTML = withBreaks
  return div.textContent || div.innerText || ''
}

/** Normalises special characters so the TTS engine reads them naturally. */
export function preprocessTTSText(text: string): string {
  return text
    .replace(/…/g, '. ')
    .replace(/\.{2,}/g, '. ')
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/[«»""'']/g, '')
    .replace(/[•·▪▸►▶◦‣⁃]/g, '. ')
    .replace(/&amp;/g, 'и')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;|&gt;/g, '')
    .replace(/[ \t]*\n[ \t]*/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .replace(/(\.)\s*\./g, '.')
    .replace(/(,)\s*,/g, ',')
    .trim()
}

export interface UseTTSReturn {
  state: TTSState
  activeId: string | null
  isSupported: boolean
  speak: (text: string, id: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
}

/**
 * Returns available speech synthesis voices, optionally filtered by language prefix.
 * Handles async loading — voices may not be ready on first render.
 *
 * @example
 * const voices = useVoices('ru')   // Russian voices only
 * const voices = useVoices()       // all voices
 */
export function useVoices(langPrefix?: string): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const update = () => {
      const all = window.speechSynthesis.getVoices()
      setVoices(langPrefix ? all.filter(v => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase())) : all)
    }

    update()
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [langPrefix])

  return voices
}

/**
 * Hook for managing Web Speech API text-to-speech.
 *
 * @param lang      BCP-47 language tag (default: 'ru-RU')
 * @param rate      Speech rate 0.1–2 (default: 0.85)
 * @param voiceURI  SpeechSynthesisVoice.voiceURI to use (null = browser default)
 */
export function useTTS(
  lang = 'ru-RU',
  rate = 0.85,
  voiceURI: string | null = null,
): UseTTSReturn {
  const [state, setState] = useState<TTSState>('idle')
  const [activeId, setActiveId] = useState<string | null>(null)

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setState('idle')
    setActiveId(null)
  }, [])

  const speak = useCallback((text: string, id: string) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(preprocessTTSText(text))
    utterance.lang = lang
    utterance.rate = rate

    if (voiceURI) {
      const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === voiceURI)
      if (voice) utterance.voice = voice
    }

    utterance.onend   = () => { setState('idle'); setActiveId(null) }
    utterance.onerror = () => { setState('idle'); setActiveId(null) }
    window.speechSynthesis.speak(utterance)
    setState('speaking')
    setActiveId(id)
  }, [lang, rate, voiceURI])

  const pause  = useCallback(() => { window.speechSynthesis.pause();  setState('paused')   }, [])
  const resume = useCallback(() => { window.speechSynthesis.resume(); setState('speaking') }, [])

  useEffect(() => () => { window.speechSynthesis.cancel() }, [])

  return { state, activeId, isSupported, speak, pause, resume, stop }
}
