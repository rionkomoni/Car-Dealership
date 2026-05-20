import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../store/themeSlice";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.theme.mode);
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => dispatch(toggleTheme())}
      aria-label={isDark ? "Kalo në temë të çelët" : "Kalo në temë të errët"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? "☀" : "☽"}
    </button>
  );
}
