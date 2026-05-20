const PDFDocument = require("pdfkit");

function buildInvoicePdf(invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const p = invoice.pricing || {};

    doc.fontSize(22).text("Car Dealership", { align: "center" });
    doc.fontSize(14).fillColor("#666").text("Faturë / Invoice", { align: "center" });
    doc.moveDown(1);
    doc.fillColor("#000");

    doc.fontSize(11);
    doc.text(`Nr. faturës: ${invoice.invoice_number}`);
    doc.text(`Data: ${new Date(invoice.issued_at).toLocaleString("sq-AL")}`);
    doc.text(`Blerje #${invoice.purchase_id}`);
    doc.moveDown(0.75);

    doc.fontSize(13).text("Blerësi", { underline: true });
    doc.fontSize(11);
    doc.text(invoice.buyer?.name || "—");
    doc.text(invoice.buyer?.email || "—");
    if (invoice.buyer?.phone) doc.text(invoice.buyer.phone);
    doc.moveDown(0.75);

    doc.fontSize(13).text("Artikulli", { underline: true });
    doc.fontSize(11);
    doc.text(invoice.item?.car_name || "—");
    doc.text(`Pagesa: ${invoice.item?.payment_method || "—"}`);
    doc.moveDown(0.75);

    doc.fontSize(13).text("Çmimet (EUR)", { underline: true });
    doc.fontSize(11);
    doc.text(`Çmimi i veturës: ${Number(p.car_price || 0).toFixed(2)}`);
    doc.text(`Vlera trade-in: ${Number(p.trade_in_value || 0).toFixed(2)}`);
    doc.text(`Shuma neto: ${Number(p.net_amount_due || 0).toFixed(2)}`);
    if (Number(p.vat_percent) > 0) {
      doc.text(`TVSH (${p.vat_percent}%): ${Number(p.vat_amount || 0).toFixed(2)}`);
    }
    doc.moveDown(0.5);
    doc.fontSize(14).text(`TOTALI: ${Number(p.total_amount_due || p.net_amount_due || 0).toFixed(2)} EUR`, {
      bold: true,
    });

    if (invoice.notes) {
      doc.moveDown(0.75);
      doc.fontSize(11).fillColor("#444").text(`Shënime: ${invoice.notes}`);
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#888").text("Dokument i gjeneruar automatikisht nga Car Dealership.", {
      align: "center",
    });

    doc.end();
  });
}

module.exports = { buildInvoicePdf };
