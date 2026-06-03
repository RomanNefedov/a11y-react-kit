import { useState } from 'react'
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
  body: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 } as React.CSSProperties,
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
  rangeRow: { display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
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

// ─── Icons (minimal inline SVG) ──────────────────────────────────────────────

const Icon = {
  Eye: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Sun: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
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
  Volume: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  Mic: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
}

// ─── Panel component ──────────────────────────────────────────────────────────

export function AccessibilityPanel({ ttsLang }: { ttsLang?: string } = {}) {
  const [open, setOpen] = useState(false)
  const {
    isAccessibilityMode, colorScheme, fontSize,
    wideSpacing, highlightLinks, reduceMotion, narrowWidth,
    ttsRate, ttsVoiceURI,
    toggleAccessibility, setColorScheme, setFontSize,
    toggleWideSpacing, toggleHighlightLinks, toggleReduceMotion, toggleNarrowWidth,
    setTtsRate, setTtsVoiceURI,
  } = useA11y()

  const voices = useVoices(ttsLang)
  const anyActive = isAccessibilityMode || wideSpacing || highlightLinks || reduceMotion || narrowWidth

  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: 'normal', label: 'А' },
    { value: 'large', label: 'А+' },
    { value: 'x-large', label: 'А++' },
  ]

  const colorOptions: { value: ColorScheme; label: string; icon: React.ReactNode }[] = [
    { value: 'normal', label: 'Обычная', icon: <Icon.Sun /> },
    { value: 'high-contrast', label: 'Контраст', icon: <Icon.Contrast /> },
  ]

  const toggleRows = [
    { label: 'Широкий интервал', icon: <Icon.Spacing />, on: wideSpacing, toggle: toggleWideSpacing },
    { label: 'Выделять ссылки',  icon: <Icon.Link />,    on: highlightLinks, toggle: toggleHighlightLinks },
    { label: 'Стоп-анимации',    icon: <Icon.Zap />,     on: reduceMotion,   toggle: toggleReduceMotion },
    { label: 'Узкая строка',     icon: <Icon.AlignLeft />, on: narrowWidth,  toggle: toggleNarrowWidth },
  ]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={s.fab(anyActive)}
        title="Настройки доступности"
        aria-label="Открыть настройки доступности"
      >
        <Icon.Eye />
      </button>

      {open && (
        <>
          <div style={s.backdrop} onClick={() => setOpen(false)} />
          <div style={s.panel} role="dialog" aria-label="Настройки доступности">
            <div style={s.header}>
              <span style={s.headerTitle}><Icon.Eye /> Доступность</span>
              <button style={s.closeBtn} onClick={() => setOpen(false)} aria-label="Закрыть">
                <Icon.X />
              </button>
            </div>

            <div style={s.body}>
              {/* Режим доступности */}
              <div style={s.row}>
                <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>
                  Режим доступности
                </span>
                <Toggle on={isAccessibilityMode} onToggle={toggleAccessibility} />
              </div>

              {/* Размер шрифта */}
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

              {/* Цветовая схема */}
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

              {/* Доп. настройки */}
              <div style={s.divider}>
                {toggleRows.map(({ label, icon, on, toggle }) => (
                  <div key={label} style={{ ...s.row, marginBottom: 10 }}>
                    <span style={s.rowLabel}>
                      <span style={{ color: '#9ca3af' }}>{icon}</span>
                      {label}
                    </span>
                    <Toggle on={on} onToggle={toggle} />
                  </div>
                ))}
              </div>

              {/* TTS settings */}
              <div style={s.divider}>
                {/* Rate */}
                <div style={{ ...s.rangeWrap, marginBottom: 12 }}>
                  <div style={{ ...s.row }}>
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

                {/* Voice */}
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
