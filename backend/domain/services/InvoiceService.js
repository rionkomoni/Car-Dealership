class InvoiceService {
  static createFromPurchase(purchaseRow, options = {}) {
    if (!purchaseRow) {
      throw new Error("Purchase row is required for invoice generation.");
    }

    const vatPercent = Number(options.vatPercent ?? process.env.INVOICE_VAT_PERCENT ?? 0) || 0;
    const carPrice = Number(purchaseRow.car_price || 0);
    const tradeInValue = Number(purchaseRow.trade_in_value || 0);
    const amountToAdd = Number(purchaseRow.amount_to_add || Math.max(0, carPrice - tradeInValue));

    const vatAmount = Number(((amountToAdd * vatPercent) / 100).toFixed(2));
    const totalWithVat = Number((amountToAdd + vatAmount).toFixed(2));

    return {
      invoice_number: `INV-${purchaseRow.id}`,
      purchase_id: purchaseRow.id,
      issued_at: new Date().toISOString(),
      buyer: {
        name: purchaseRow.buyer_name,
        email: purchaseRow.buyer_email,
        phone: purchaseRow.buyer_phone || null,
      },
      item: {
        car_id: purchaseRow.car_id,
        car_name: purchaseRow.car_name || `Car #${purchaseRow.car_id}`,
        payment_method: purchaseRow.payment_method,
      },
      pricing: {
        car_price: carPrice,
        trade_in_value: tradeInValue,
        net_amount_due: amountToAdd,
        vat_percent: vatPercent,
        vat_amount: vatAmount,
        total_amount_due: totalWithVat,
      },
      notes: purchaseRow.notes || null,
    };
  }
}

module.exports = InvoiceService;

