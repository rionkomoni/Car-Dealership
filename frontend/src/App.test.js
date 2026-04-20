import { getUser, isAdmin } from "./authHelpers";
import { USER_KEY } from "./authStorage";

beforeEach(() => {
  localStorage.clear();
});

test("returns null user when storage is empty", () => {
  expect(getUser()).toBeNull();
  expect(isAdmin()).toBe(false);
});

test("recognizes admin role from localStorage", () => {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ id: 1, name: "Admin", role: "admin" })
  );

  expect(getUser()).toEqual({ id: 1, name: "Admin", role: "admin" });
  expect(isAdmin()).toBe(true);
});
