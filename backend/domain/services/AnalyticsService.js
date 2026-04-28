class AnalyticsService {
  static buildOverview({
    totalCars = 0,
    soldCars = 0,
    totalPurchases = 0,
    pendingTradeIns = 0,
    pendingTestDrives = 0,
  }) {
    const total = Number(totalCars) || 0;
    const sold = Number(soldCars) || 0;
    const available = Math.max(0, total - sold);
    const purchases = Number(totalPurchases) || 0;
    const conversionRate = total > 0 ? Number(((sold / total) * 100).toFixed(2)) : 0;

    return {
      totalCars: total,
      soldCars: sold,
      availableCars: available,
      totalPurchases: purchases,
      conversionRatePercent: conversionRate,
      pendingTradeIns: Number(pendingTradeIns) || 0,
      pendingTestDrives: Number(pendingTestDrives) || 0,
    };
  }
}

module.exports = AnalyticsService;

