import { USER_KEY } from "./authStorage";

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getUser()?.role === "admin";
}
