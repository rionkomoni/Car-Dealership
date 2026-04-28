const AnalyticsService = require("../../domain/services/AnalyticsService");
const InvoiceService = require("../../domain/services/InvoiceService");
const businessRepository = require("../../repositories/businessRepository");

async function getManagerOverview() {
  const raw = await businessRepository.getOverviewRaw();

  return {
    ...AnalyticsService.buildOverview({
      totalCars: raw.totalCars,
      soldCars: raw.soldCars,
      totalPurchases: raw.totalPurchases,
      pendingTradeIns: raw.pendingTradeIns,
      pendingTestDrives: raw.pendingTestDrives,
    }),
    latestPurchases: raw.latestPurchases,
  };
}

async function getAdminAnalyticsSnapshot() {
  return businessRepository.getAdminAnalyticsRaw();
}

async function getInvoiceByPurchaseId(purchaseId) {
  const row = await businessRepository.getPurchaseForInvoice(purchaseId);
  if (!row) return null;
  return InvoiceService.createFromPurchase(row);
}

module.exports = {
  getManagerOverview,
  getAdminAnalyticsSnapshot,
  getInvoiceByPurchaseId,
};

