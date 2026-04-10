import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dealership heading", () => {
  render(<App />);
  expect(screen.getByText(/browse our vehicles/i)).toBeInTheDocument();
});
