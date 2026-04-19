/**
 * Lista e URL-ve të fotove: foto kryesore + galeri shtesë (pa përsëritje).
 */
export function getCarImageUrls(car) {
  if (!car) return [];

  let extra = [];
  const g = car.gallery;
  if (Array.isArray(g)) {
    extra = g.filter(Boolean);
  } else if (typeof g === "string" && g.trim()) {
    try {
      const parsed = JSON.parse(g);
      if (Array.isArray(parsed)) extra = parsed.filter(Boolean);
    } catch {
      extra = [];
    }
  }

  const urls = [];
  if (car.image) urls.push(car.image);
  for (const u of extra) {
    if (typeof u === "string" && u.trim() && !urls.includes(u.trim())) {
      urls.push(u.trim());
    }
  }
  return urls;
}
