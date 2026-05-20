const xss = require("xss");

function sanitizeValue(value) {
  if (typeof value === "string") {
    return xss(value, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ["script"],
    }).trim();
  }
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = sanitizeValue(v);
    }
    return out;
  }
  return value;
}

describe("security sanitizer (XSS)", () => {
  test("strips script tags from string input", () => {
    const input = '<script>alert("xss")</script>Hello';
    const out = sanitizeValue(input);
    expect(out).not.toMatch(/<script/i);
    expect(out).toContain("Hello");
  });

  test("sanitizes nested body objects", () => {
    const body = {
      name: "Test",
      notes: '<img src=x onerror="alert(1)">',
    };
    const out = sanitizeValue(body);
    expect(out.notes).not.toMatch(/onerror/i);
  });
});
