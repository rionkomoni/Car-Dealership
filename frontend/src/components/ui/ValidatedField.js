/**
 * Fushë forme me validim dinamik (aria-invalid, mesazh gabimi).
 */
export default function ValidatedField({
  id,
  label,
  type = "text",
  autoComplete,
  value,
  onChange,
  onBlur,
  error,
  required,
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label className="field-label" htmlFor={id}>
      {label}
      <input
        id={id}
        className={`field-input${error ? " field-input--invalid" : ""}`}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      />
      {error ? (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
