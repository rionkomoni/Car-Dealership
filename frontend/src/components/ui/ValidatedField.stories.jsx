import { useState } from "react";
import ValidatedField from "./ValidatedField";

export default {
  title: "UI/ValidatedField",
  component: ValidatedField,
};

function InteractiveTemplate() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const error =
    touched && !/\S+@\S+\.\S+/.test(email) ? "Vendosni një email të vlefshëm." : "";

  return (
    <div style={{ width: 320 }}>
      <ValidatedField
        id="story-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched(true)}
        error={error}
      />
    </div>
  );
}

export const Default = {
  render: () => (
    <ValidatedField
      id="demo"
      label="Email"
      type="email"
      value="user@example.com"
      onChange={() => {}}
      onBlur={() => {}}
    />
  ),
};

export const WithError = {
  render: () => (
    <ValidatedField
      id="demo-err"
      label="Password"
      type="password"
      value=""
      onChange={() => {}}
      onBlur={() => {}}
      error="Fjalëkalimi është i detyrueshëm."
    />
  ),
};

export const InteractiveValidation = {
  render: () => <InteractiveTemplate />,
};
