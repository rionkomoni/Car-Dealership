/**
 * HATEOAS helpers — lidhje hypermedia për navigim brenda API-së REST.
 */

function link(href, method = "GET") {
  if (method === "GET") {
    return { href };
  }
  return { href, method };
}

function carResourceLinks(req, car) {
  const base = `${req.baseUrl}/${car.id}`;
  const links = {
    self: link(base),
    collection: link(req.baseUrl),
  };

  if (!car.sold_out) {
    links.purchase = link(`${base}/purchase`, "POST");
    links.testDrive = link(`${base}/test-drive`, "POST");
  }

  return links;
}

function paginationLinks(req, { page, totalPages }) {
  const params = new URLSearchParams(req.query);
  const build = (p) => {
    params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${req.baseUrl}?${qs}` : req.baseUrl;
  };

  const links = { self: link(build(page)) };
  if (page > 1) links.prev = link(build(page - 1));
  if (page < totalPages) links.next = link(build(page + 1));
  return links;
}

function withCarLinks(req, car) {
  return {
    ...car,
    _links: carResourceLinks(req, car),
  };
}

module.exports = {
  link,
  carResourceLinks,
  paginationLinks,
  withCarLinks,
};
