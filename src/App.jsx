import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './App.css'

const DEFAULT_BG_COLOR = '#FF2674'
const DEFAULT_BG_GRADIENT = 'linear-gradient(180deg, #FF2674 55.28%, #FF6FA3 100%)'

const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

// Common mobile portrait viewport widths (CSS px), min to max.
const DEVICE_WIDTHS = [
  { width: 360, label: 'Galaxy S8–S23 / Pixel 2–4' },
  { width: 375, label: 'iPhone SE / X / 11 Pro / 12 & 13 mini' },
  { width: 390, label: 'iPhone 12 / 13 / 14 / 15' },
  { width: 393, label: 'Pixel 4a / 5 / Galaxy S22' },
  { width: 412, label: 'Pixel 6 / 7 / 8 / Galaxy Note' },
  { width: 414, label: 'iPhone 6–8 Plus / 11 / XR' },
  { width: 428, label: 'iPhone 12 / 13 Pro Max' },
  { width: 430, label: 'iPhone 14 / 15 / 16 Pro Max' },
]

const PRESETS = [
  {
    id: 'merchant-banner',
    label: 'Merchant Banner',
    values: {
      subtitleTwoLines: true,
      showFirstRow: true,
      showChevron: true,
      showStatusBar: true,
      showMeasurements: false,
    },
  },
  {
    id: 'greeting-banner',
    label: 'Greeting Banner',
    values: {
      subtitleTwoLines: true,
      showFirstRow: false,
      showChevron: false,
      showStatusBar: true,
      showMeasurements: false,
    },
  },
  {
    id: 'merchant-banner-no-logo',
    label: 'Merchant banner no logo',
    values: {
      subtitleTwoLines: true,
      showFirstRow: false,
      showChevron: true,
      showStatusBar: true,
      showMeasurements: false,
    },
  },
]

function ChevronIcon() {
  return (
    <svg
      className="chevron-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.554 8.578a.386.386 0 0 0 0-.578l-2.688-2.711a.386.386 0 0 0-.579.578L10.7 8l-2.415 2.711a.386.386 0 0 0 .579.578l2.688-2.71Z"
        fill="#fff"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.744 8.578a.386.386 0 0 0 0-.578L5.056 5.289a.386.386 0 1 0-.579.578L6.892 8 4.477 10.711a.386.386 0 0 0 .579.578l2.688-2.71Z"
        fill="#fff"
      />
    </svg>
  )
}

function StatusBar() {
  return (
    <div className="status-bar">
      <span className="status-bar-time">9:41</span>
      <div className="status-bar-icons">
        <svg
          className="status-icon"
          width="18"
          height="12"
          viewBox="0 0 18 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#fff" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="0.5" fill="#fff" />
          <rect x="10" y="3" width="3" height="9" rx="0.5" fill="#fff" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill="#fff" />
        </svg>
        <svg
          className="status-icon"
          width="16"
          height="12"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 0 0-6 0zm-4-4l2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"
            fill="#fff"
          />
        </svg>
        <span className="status-battery" aria-hidden="true">
          <span className="status-battery-body">
            <span className="status-battery-fill" />
          </span>
          <span className="status-battery-nub" />
        </span>
      </div>
    </div>
  )
}

function Switch({ checked, onChange, label }) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={checked}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
    </label>
  )
}

function App() {
  const [brandName, setBrandName] = useState('Business Name Text')
  const [headline, setHeadline] = useState('Get 2GB free data today')
  const [subtitle, setSubtitle] = useState('Limited time offer')
  const [showFirstRow, setShowFirstRow] = useState(true)
  const [showChevron, setShowChevron] = useState(true)
  const [background, setBackground] = useState(DEFAULT_BG_GRADIENT)
  const [widthIndex, setWidthIndex] = useState(0)
  const [subtitleTwoLines, setSubtitleTwoLines] = useState(true)
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [showMeasurements, setShowMeasurements] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)

  const fileInputRef = useRef(null)
  const pageRef = useRef(null)
  const rowBrandRef = useRef(null)
  const rowHeadlineRef = useRef(null)
  const subtitleRef = useRef(null)
  const subtitleMeasureRef = useRef(null)
  const bottomSheetRef = useRef(null)
  const [gapMarks, setGapMarks] = useState([])

  const pageStyle = { background, width: `${DEVICE_WIDTHS[widthIndex].width}px` }
  const swatchValue = HEX_COLOR_RE.test(background) ? background : DEFAULT_BG_COLOR

  // Checks whether `text` fits within `maxLines` at the subtitle's current rendered width.
  const subtitleFits = (text, maxLines) => {
    const measurer = subtitleMeasureRef.current
    const real = subtitleRef.current
    if (!measurer || !real) return true
    const width = real.getBoundingClientRect().width
    if (width === 0) return true
    measurer.style.width = `${width}px`
    measurer.textContent = text
    const lineHeight = parseFloat(getComputedStyle(real).lineHeight)
    return measurer.scrollHeight <= lineHeight * maxLines + 1
  }

  const handleSubtitleChange = (e) => {
    const value = e.target.value
    const maxLines = subtitleTwoLines ? 2 : 1
    if (value.length <= subtitle.length || subtitleFits(value, maxLines)) {
      setSubtitle(value)
    } else {
      // Reject the keystroke: React won't re-render (state is unchanged), so the
      // DOM input must be reset back to the last accepted value by hand. Resetting
      // .value also resets the caret, so restore it to where the user was typing.
      const inserted = value.length - subtitle.length
      const caretAfter = e.target.selectionStart ?? value.length
      e.target.value = subtitle
      const restored = Math.max(0, Math.min(caretAfter - inserted, subtitle.length))
      e.target.setSelectionRange(restored, restored)
    }
  }

  // If toggling line count (or a width change) leaves existing text too long
  // for the new capacity, trim it down rather than ever letting it truncate visually.
  useEffect(() => {
    const maxLines = subtitleTwoLines ? 2 : 1
    if (subtitleFits(subtitle, maxLines)) return
    let trimmed = subtitle
    while (trimmed.length > 0 && !subtitleFits(trimmed, maxLines)) {
      trimmed = trimmed.slice(0, -1)
    }
    if (trimmed !== subtitle) setSubtitle(trimmed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitleTwoLines, widthIndex])

  // The check above can run before the Public Sans web font finishes loading, measuring
  // against the fallback font instead. Re-run it once fonts are actually ready so the
  // real glyph widths are used (this is what causes 3 lines to slip through in prod).
  useEffect(() => {
    if (!document.fonts?.ready) return
    document.fonts.ready.then(() => {
      setSubtitle((current) => {
        const maxLines = subtitleTwoLines ? 2 : 1
        if (subtitleFits(current, maxLines)) return current
        let trimmed = current
        while (trimmed.length > 0 && !subtitleFits(trimmed, maxLines)) {
          trimmed = trimmed.slice(0, -1)
        }
        return trimmed
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const switchState = { subtitleTwoLines, showFirstRow, showChevron, showStatusBar, showMeasurements }
  const activePreset = PRESETS.find((preset) =>
    Object.entries(preset.values).every(([key, value]) => switchState[key] === value),
  )?.id

  const applyPreset = (values) => {
    setSubtitleTwoLines(values.subtitleTwoLines)
    setShowFirstRow(values.showFirstRow)
    setShowChevron(values.showChevron)
    setShowStatusBar(values.showStatusBar)
    setShowMeasurements(values.showMeasurements)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setUploadedImage(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  useLayoutEffect(() => {
    if (!showMeasurements || !pageRef.current) {
      setGapMarks([])
      return undefined
    }

    const measure = () => {
      const pageTop = pageRef.current.getBoundingClientRect().top
      const marks = []

      const addGap = (key, startEl, endEl, label) => {
        if (!startEl || !endEl) return
        const a = startEl.getBoundingClientRect()
        const b = endEl.getBoundingClientRect()
        const top = a.bottom - pageTop
        const height = b.top - a.bottom
        if (height > 0.5) marks.push({ key, top, height, label })
      }

      addGap('gap-row1-row2', rowBrandRef.current, rowHeadlineRef.current, '8')
      addGap('gap-row2-row3', rowHeadlineRef.current, subtitleRef.current, '4')
      addGap('gap-sheet', subtitleRef.current, bottomSheetRef.current, '24')

      setGapMarks(marks)
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(pageRef.current)
    return () => observer.disconnect()
  }, [
    showMeasurements,
    showFirstRow,
    showChevron,
    showStatusBar,
    subtitleTwoLines,
    headline,
    subtitle,
    brandName,
    widthIndex,
  ])

  return (
    <div className="layout">
      <div className="viewport-frame">
        <div
          className={`page${showMeasurements ? ' measuring' : ''}`}
          style={pageStyle}
          ref={pageRef}
        >
          {showStatusBar && <StatusBar />}
          <div className="content">
            {showFirstRow && (
              <div className="row row-brand" ref={rowBrandRef}>
                <div className="avatar" aria-hidden="true">
                  {showMeasurements && <span className="measure-tag">40×40</span>}
                </div>
                {showMeasurements && <span className="measure-tag measure-tag-gap">12</span>}
                <p className="brand-name">{brandName}</p>
              </div>
            )}

            <div className="row row-headline" ref={rowHeadlineRef}>
              <p className="headline">{headline}</p>
            </div>

            <div className="row-3">
              <div className="subtitle-wrap">
                <p className="subtitle" ref={subtitleRef}>
                  {subtitle}
                </p>
                <p
                  className="subtitle subtitle-measurer"
                  ref={subtitleMeasureRef}
                  aria-hidden="true"
                />

                {showChevron && (
                  <button type="button" className="icon-badge" aria-label="View more">
                    <ChevronIcon />
                    {showMeasurements && (
                      <span className="measure-tag measure-tag-above">32×24</span>
                    )}
                  </button>
                )}
                {showMeasurements && (
                  <span className="measure-tag measure-tag-icon-gap">8</span>
                )}
              </div>
              <div className="image-placeholder">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="" className="image-placeholder-img" />
                ) : (
                  <span>Upload image</span>
                )}
                {showMeasurements && (
                  <span className="measure-tag measure-tag-corner">140×100</span>
                )}
              </div>
            </div>

            {showMeasurements && (
              <>
                <div className="measure-pad measure-pad-top">
                  <span>8</span>
                </div>
                <div className="measure-pad measure-pad-left">
                  <span>16</span>
                </div>
                <div className="measure-pad measure-pad-right">
                  <span>16</span>
                </div>
              </>
            )}
          </div>

          <div className="bottom-sheet" ref={bottomSheetRef} />

          {showMeasurements &&
            gapMarks.map((g) => (
              <div
                key={g.key}
                className="measure-gap-band"
                style={{ top: g.top, height: g.height }}
              >
                <span className="measure-gap-label">{g.label}</span>
              </div>
            ))}
        </div>
      </div>

      <section className="controls" aria-label="Banner controls">
        <header className="controls-header">
          <h2 className="controls-title">Controls</h2>
          <p className="controls-subtitle">Live-edit the preview above</p>
        </header>

        <div className="preset-tabs" role="tablist" aria-label="Banner presets">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              role="tab"
              aria-selected={activePreset === preset.id}
              className={`preset-tab${activePreset === preset.id ? ' preset-tab-active' : ''}`}
              onClick={() => applyPreset(preset.values)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="controls-body">
          <div className="control-group">
            <h3 className="control-group-title">Content</h3>

            <label className="field">
              <span className="field-label">Brand name</span>
              <input
                type="text"
                className="field-input"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </label>

            <label className="field">
              <span className="field-label">Headline</span>
              <input
                type="text"
                className="field-input"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </label>

            <label className="field">
              <span className="field-label">Subtitle</span>
              <input
                type="text"
                className="field-input"
                value={subtitle}
                onChange={handleSubtitleChange}
              />
            </label>

            <div className="toggle-row">
              <span className="toggle-label">Allow 2 lines</span>
              <Switch
                checked={subtitleTwoLines}
                onChange={setSubtitleTwoLines}
                label="Allow 2 lines"
              />
            </div>

            <div className="field">
              <span className="field-label">Image (450×320 recommended)</span>
              <span className="field-upload">
                <button
                  type="button"
                  className="field-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedImage ? 'Change image' : 'Upload image'}
                </button>
                {uploadedImage && (
                  <button
                    type="button"
                    className="field-upload-remove"
                    onClick={() => setUploadedImage(null)}
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="field-upload-input"
                  onChange={handleImageUpload}
                />
              </span>
            </div>
          </div>

          <div className="control-group">
            <h3 className="control-group-title">Appearance</h3>

            <div className="field">
              <span className="field-label">Background</span>
              <span className="field-combo">
                <input
                  type="color"
                  className="field-swatch"
                  value={swatchValue}
                  onChange={(e) => setBackground(e.target.value)}
                  aria-label="Background color swatch"
                />
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. linear-gradient(180deg, #FF2674 55%, #FF6FA3 100%)"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  aria-label="Background color or gradient value"
                />
              </span>
            </div>

            <div className="field">
              <span className="field-label">
                <span>Screen width</span>
                <span className="field-value">{DEVICE_WIDTHS[widthIndex].width}px</span>
              </span>
              <div className="field-slider-wrap">
                <input
                  type="range"
                  className="field-slider"
                  min={0}
                  max={DEVICE_WIDTHS.length - 1}
                  step={1}
                  value={widthIndex}
                  onChange={(e) => setWidthIndex(Number(e.target.value))}
                  aria-label="Screen width"
                />
                <div className="field-slider-ticks" aria-hidden="true">
                  {DEVICE_WIDTHS.map((device, i) => (
                    <span
                      key={device.width}
                      className={`field-slider-tick${i <= widthIndex ? ' field-slider-tick-filled' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <p className="field-caption">{DEVICE_WIDTHS[widthIndex].label}</p>
            </div>
          </div>

          <div className="control-group">
            <h3 className="control-group-title">Elements</h3>

            <div className="toggle-row">
              <span className="toggle-label">Show first row</span>
              <Switch checked={showFirstRow} onChange={setShowFirstRow} label="Show first row" />
            </div>

            <div className="toggle-row">
              <span className="toggle-label">Show chevron icon</span>
              <Switch checked={showChevron} onChange={setShowChevron} label="Show chevron icon" />
            </div>

            <div className="toggle-row">
              <span className="toggle-label">Show iOS status bar</span>
              <Switch
                checked={showStatusBar}
                onChange={setShowStatusBar}
                label="Show iOS status bar"
              />
            </div>
          </div>

          <div className="control-group">
            <h3 className="control-group-title">Debug</h3>

            <div className="toggle-row">
              <span className="toggle-label">Show measurements</span>
              <Switch
                checked={showMeasurements}
                onChange={setShowMeasurements}
                label="Show measurements"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
