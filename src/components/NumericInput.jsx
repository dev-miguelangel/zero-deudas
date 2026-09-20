const NUMERIC_PATTERN = /^\d*\.?\d*$/

export default function NumericInput({ id, value, onChange, className, autoFocus }) {
  function handleChange(event) {
    const raw = event.target.value
    if (raw === '' || NUMERIC_PATTERN.test(raw)) {
      onChange(raw)
    }
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={handleChange}
      className={className}
      autoFocus={autoFocus}
    />
  )
}
