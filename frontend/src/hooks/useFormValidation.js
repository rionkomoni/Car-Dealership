import { useCallback, useState } from "react";

/**
 * Validim dinamik i formave — gabime pas blur dhe para submit.
 * @param {Record<string, (value: string) => string>} schema — emër fushë → mesazh gabimi ose ""
 */
export function useFormValidation(schema, initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (name, value) => {
      const rule = schema[name];
      if (!rule) return "";
      return rule(value) || "";
    },
    [schema]
  );

  const handleChange = useCallback(
    (name) => (e) => {
      const value = e.target.value;
      setValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => {
        if (!touched[name]) return prev;
        return { ...prev, [name]: validateField(name, value) };
      });
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (name) => () => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, values[name] ?? ""),
      }));
    },
    [values, validateField]
  );

  const validateAll = useCallback(() => {
    const nextErrors = {};
    let ok = true;
    for (const name of Object.keys(schema)) {
      const err = validateField(name, values[name] ?? "");
      if (err) ok = false;
      nextErrors[name] = err;
    }
    setErrors(nextErrors);
    setTouched(
      Object.fromEntries(Object.keys(schema).map((k) => [k, true]))
    );
    return ok;
  }, [schema, values, validateField]);

  return {
    values,
    errors,
    touched,
    setValues,
    handleChange,
    handleBlur,
    validateAll,
    fieldError: (name) => (touched[name] ? errors[name] : ""),
  };
}

export const loginSchema = {
  email: (v) =>
    /\S+@\S+\.\S+/.test(String(v || "").trim())
      ? ""
      : "Vendosni një email të vlefshëm.",
  password: (v) =>
    String(v || "").length > 0 ? "" : "Fjalëkalimi është i detyrueshëm.",
};

export const registerSchema = {
  name: (v) =>
    String(v || "").trim().length >= 2
      ? ""
      : "Emri duhet të ketë të paktën 2 karaktere.",
  email: (v) =>
    /\S+@\S+\.\S+/.test(String(v || "").trim())
      ? ""
      : "Vendosni një email të vlefshëm.",
  password: (v) =>
    String(v || "").length >= 6
      ? ""
      : "Fjalëkalimi duhet të ketë të paktën 6 karaktere.",
};
