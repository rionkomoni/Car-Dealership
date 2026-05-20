function parsePaginationQuery(query, { defaultPageSize = 12, maxPageSize = 100 } = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(maxPageSize, Math.max(1, Number(query.pageSize) || defaultPageSize));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

function buildPaginationMeta({ total, page, pageSize }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { total, page, pageSize, totalPages };
}

module.exports = {
  parsePaginationQuery,
  buildPaginationMeta,
};
