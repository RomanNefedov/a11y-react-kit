import { useState, useEffect } from 'react'
import { useA11y } from './context'
import { useVoices } from './useTTS'
import type { FontSize, ColorScheme } from './types'

// ─── Inline styles ────────────────────────────────────────────────────────────

const s = {
  fab: (active: boolean): React.CSSProperties => ({
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    width: 48, height: 48, borderRadius: '50%',
    border: active ? 'none' : '1px solid #e5e7eb',
    background: active ? '#2563eb' : '#fff',
    color: active ? '#fff' : '#4b5563',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,.15)', transition: 'background .2s',
  }),
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,.15)',
  } as React.CSSProperties,
  panel: {
    position: 'fixed', bottom: 80, right: 24, zIndex: 9999,
    width: 288, background: '#fff', borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,.18)', border: '1px solid #f3f4f6',
    overflow: 'hidden', fontFamily: 'system-ui, sans-serif',
  } as React.CSSProperties,
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', background: '#2563eb', color: '#fff',
  } as React.CSSProperties,
  headerTitle: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontWeight: 600, fontSize: 14,
  } as React.CSSProperties,
  closeBtn: {
    background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
    padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center',
  } as React.CSSProperties,
  body: {
    padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
    maxHeight: 'calc(80vh - 52px)', overflowY: 'auto',
  } as React.CSSProperties,
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  } as React.CSSProperties,
  rowLabel: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 14, color: '#374151',
  } as React.CSSProperties,
  sectionLabel: {
    fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 11, fontWeight: 600, color: '#9ca3af',
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    marginBottom: 10,
  },
  btnGroup: { display: 'flex', gap: 8 } as React.CSSProperties,
  segBtn: (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '6px 0', fontSize: 12, cursor: 'pointer', borderRadius: 8,
    border: active ? '1px solid #3b82f6' : '1px solid #e5e7eb',
    background: active ? '#eff6ff' : '#fff',
    color: active ? '#1d4ed8' : '#6b7280',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  }),
  divider: { borderTop: '1px solid #f3f4f6', paddingTop: 12 } as React.CSSProperties,
  footer: {
    fontSize: 11, color: '#9ca3af', textAlign: 'center', paddingTop: 4,
  } as React.CSSProperties,
  rangeWrap: { display: 'flex', flexDirection: 'column', gap: 6 } as React.CSSProperties,
  range: {
    flex: 1, accentColor: '#2563eb', cursor: 'pointer', height: 4,
  } as React.CSSProperties,
  rangeValue: {
    minWidth: 32, fontSize: 12, fontWeight: 600, color: '#2563eb', textAlign: 'right',
  } as React.CSSProperties,
  select: {
    width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 8,
    border: '1px solid #e5e7eb', background: '#fff', color: '#374151',
    cursor: 'pointer', outline: 'none',
  } as React.CSSProperties,
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: on ? '#2563eb' : '#d1d5db', transition: 'background .2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2,
        left: on ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        transition: 'left .2s',
      }} />
    </button>
  )
}

// ─── Reading ruler overlay ────────────────────────────────────────────────────

function ReadingRuler({ active }: { active: boolean }) {
  const [y, setY] = useState(-100)

  useEffect(() => {
    if (!active) return
    const handler = (e: MouseEvent) => setY(e.clientY)
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [active])

  if (!active) return null

  const BAND = 36 // highlight band height in px

  return (
    <>
      {/* Dimmed area above the ruler */}
      <div aria-hidden="true" style={{
        position: 'fixed', left: 0, right: 0, top: 0,
        height: Math.max(0, y - BAND / 2),
        background: 'rgba(0,0,0,0.08)',
        pointerEvents: 'none', zIndex: 8998,
        transition: 'height 0.04s linear',
      }} />
      {/* Highlighted band */}
      <div aria-hidden="true" style={{
        position: 'fixed', left: 0, right: 0,
        top: y - BAND / 2, height: BAND,
        background: 'rgba(255, 235, 0, 0.25)',
        outline: '1px solid rgba(200, 160, 0, 0.35)',
        pointerEvents: 'none', zIndex: 8999,
        transition: 'top 0.04s linear',
      }} />
      {/* Dimmed area below the ruler */}
      <div aria-hidden="true" style={{
        position: 'fixed', left: 0, right: 0,
        top: y + BAND / 2, bottom: 0,
        background: 'rgba(0,0,0,0.08)',
        pointerEvents: 'none', zIndex: 8998,
        transition: 'top 0.04s linear',
      }} />
    </>
  )
}

// ─── Icons (minimal inline SVG) ──────────────────────────────────────────────

const Icon = {
  /** Wheelchair / universal accessibility symbol */
  Wheelchair: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="3.5" r="1.5" fill="currentColor" stroke="none"/>
      <path d="M11 6 L9 13 L16 13"/>
      <path d="M9 9 L9 13"/>
      <path d="M11 6 L15 7.5"/>
      <path d="M9 13 L8 17"/>
      <circle cx="11" cy="20" r="3"/>
      <circle cx="17" cy="20.5" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Sun: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Contrast: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/>
    </svg>
  ),
  Spacing: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Link: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Zap: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  AlignLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>
    </svg>
  ),
  /** Large targets — crosshair/target icon */
  Target: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  /** Dyslexia font — stylised "A" */
  DyslexiaA: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 L10 4 L16 20"/><path d="M7 13 L13 13"/>
      <path d="M18 8 Q22 8 22 12 Q22 16 18 16 L18 8"/>
    </svg>
  ),
  /** Reading ruler — horizontal lines with highlight */
  Ruler: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="20" height="6" rx="1"/>
      <line x1="6"  y1="9" x2="6"  y2="15"/>
      <line x1="10" y1="9" x2="10" y2="12"/>
      <line x1="14" y1="9" x2="14" y2="15"/>
      <line x1="18" y1="9" x2="18" y2="12"/>
    </svg>
  ),
  Volume: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  Mic: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
}

// ─── Panel component ──────────────────────────────────────────────────────────

export function AccessibilityPanel({ ttsLang }: { ttsLang?: string } = {}) {
  const [open, setOpen] = useState(false)
  const {
    isAccessibilityMode, colorScheme, fontSize,
    wideSpacing, highlightLinks, reduceMotion, narrowWidth,
    largeTargets, dyslexiaFont, readingRuler,
    ttsRate, ttsVoiceURI,
    toggleAccessibility, setColorScheme, setFontSize,
    toggleWideSpacing, toggleHighlightLinks, toggleReduceMotion, toggleNarrowWidth,
    toggleLargeTargets, toggleDyslexiaFont, toggleReadingRuler,
    setTtsRate, setTtsVoiceURI,
  } = useA11y()

  const voices = useVoices(ttsLang)
  const anyActive = (
    isAccessibilityMode || wideSpacing || highlightLinks ||
    reduceMotion || narrowWidth || largeTargets || dyslexiaFont || readingRuler
  )

  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: 'normal', label: 'А' },
    { value: 'large', label: 'А+' },
    { value: 'x-large', label: 'А++' },
  ]

  const colorOptions: { value: ColorScheme; label: string; icon: React.ReactNode }[] = [
    { value: 'normal',        label: 'Обычная', icon: <Icon.Sun /> },
    { value: 'high-contrast', label: 'Контраст', icon: <Icon.Contrast /> },
  ]

  const visualRows = [
    { label: 'Широкий интервал', icon: <Icon.Spacing />,  on: wideSpacing,    toggle: toggleWideSpacing },
    { label: 'Выделять ссылки',  icon: <Icon.Link />,     on: highlightLinks, toggle: toggleHighlightLinks },
    { label: 'Стоп-анимации',    icon: <Icon.Zap />,      on: reduceMotion,   toggle: toggleReduceMotion },
    { label: 'Узкая строка',     icon: <Icon.AlignLeft />, on: narrowWidth,   toggle: toggleNarrowWidth },
  ]

  const motorRows = [
    { label: 'Крупные цели клика', icon: <Icon.Target />,    on: largeTargets, toggle: toggleLargeTargets },
    { label: 'Шрифт для дислексии', icon: <Icon.DyslexiaA />, on: dyslexiaFont, toggle: toggleDyslexiaFont },
    { label: 'Линейка чтения',     icon: <Icon.Ruler />,     on: readingRuler, toggle: toggleReadingRuler },
  ]

  return (
    <>
      {/* Reading ruler — always rendered so it works without opening the panel */}
      <ReadingRuler active={readingRuler} />

      {/* Floating action button */}
      <button
        onClick={() => setOpen(true)}
        style={s.fab(anyActive)}
        title="Настройки доступности"
        aria-label="Открыть настройки доступности"
        aria-haspopup="dialog"
      >
        <Icon.Wheelchair />
      </button>

      {open && (
        <>
          <div style={s.backdrop} onClick={() => setOpen(false)} />
          <div style={s.panel} role="dialog" aria-label="Настройки доступности" aria-modal="true">
            <div style={s.header}>
              <span style={s.headerTitle}><Icon.Wheelchair /> Доступность</span>
              <button style={s.closeBtn} onClick={() => setOpen(false)} aria-label="Закрыть">
                <Icon.X />
              </button>
            </div>

            <div style={s.body}>
              {/* Master toggle */}
              <div style={s.row}>
                <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>
                  Режим доступности
                </span>
                <Toggle on={isAccessibilityMode} onToggle={toggleAccessibility} />
              </div>

              {/* Font size */}
              <div>
                <p style={s.sectionLabel}>Размер шрифта</p>
                <div style={s.btnGroup}>
                  {fontSizeOptions.map(({ value, label }) => (
                    <button key={value} onClick={() => setFontSize(value)} style={s.segBtn(fontSize === value)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color scheme */}
              <div>
                <p style={s.sectionLabel}>Цветовая схема</p>
                <div style={s.btnGroup}>
                  {colorOptions.map(({ value, label, icon }) => (
                    <button key={value} onClick={() => setColorScheme(value)} style={s.segBtn(colorScheme === value)}>
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual toggles */}
              <div style={s.divider}>
                <p style={s.sectionTitle}>Зрение</p>
                {visualRows.map(({ label, icon, on, toggle }) => (
                  <div key={label} style={{ ...s.row, marginBottom: 10 }}>
                    <span style={s.rowLabel}>
                      <span style={{ color: '#9ca3af' }}>{icon}</span>
                      {label}
                    </span>
                    <Toggle on={on} onToggle={toggle} />
                  </div>
                ))}
              </div>

              {/* Motor & cognitive toggles */}
              <div style={s.divider}>
                <p style={s.sectionTitle}>Моторика и когниция</p>
                {motorRows.map(({ label, icon, on, toggle }) => (
                  <div key={label} style={{ ...s.row, marginBottom: 10 }}>
                    <span style={s.rowLabel}>
                      <span style={{ color: '#9ca3af' }}>{icon}</span>
                      {label}
                    </span>
                    <Toggle on={on} onToggle={toggle} />
                  </div>
                ))}
              </div>

              {/* TTS */}
              <div style={s.divider}>
                <p style={s.sectionTitle}>Озвучка (TTS)</p>
                <div style={{ ...s.rangeWrap, marginBottom: voices.length > 0 ? 12 : 0 }}>
                  <div style={s.row}>
                    <span style={s.rowLabel}>
                      <span style={{ color: '#9ca3af' }}><Icon.Volume /></span>
                      Скорость речи
                    </span>
                    <span style={s.rangeValue}>{ttsRate.toFixed(1)}×</span>
                  </div>
                  <input
                    type="range"
                    min={0.5} max={1.5} step={0.1}
                    value={ttsRate}
                    onChange={e => setTtsRate(parseFloat(e.target.value))}
                    style={s.range}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af' }}>
                    <span>0.5×</span><span>1.0×</span><span>1.5×</span>
                  </div>
                </div>

                {voices.length > 0 && (
                  <div>
                    <div style={{ ...s.rowLabel, marginBottom: 6 }}>
                      <span style={{ color: '#9ca3af' }}><Icon.Mic /></span>
                      <span style={{ fontSize: 14, color: '#374151' }}>Голос</span>
                    </div>
                    <select
                      value={ttsVoiceURI ?? ''}
                      onChange={e => setTtsVoiceURI(e.target.value || null)}
                      style={s.select}
                    >
                      <option value=''>По умолчанию</option>
                      {voices.map(v => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <p style={s.footer}>Настройки сохраняются автоматически</p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
