const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateInvoice(orderInfo, path) {
  const doc = new PDFDocument({ margin: 0, size: 'A4' });
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const leftColumnWidth = pageWidth * 0.4;
  const rightColumnWidth = pageWidth - leftColumnWidth;
  const mainColor = '#fe734a';

  // Background
  doc.rect(0, 0, leftColumnWidth, pageHeight).fill(mainColor);

  // Logo
  doc.image('./logo-white.png', 50, 50, { width: 50 });

  // Left side content
  doc.font('Helvetica-Bold')
     .fontSize(24)
     .fillColor('white')
     .text('Total paid', 50, 120)
     .fontSize(36)
     .text(`$${orderInfo.total}`, 50, 150)
     .fontSize(12)
     .text(`Invoice #${orderInfo.invoiceNumber}`, 50, 200)
     .text(`Issued on ${orderInfo.date || 'undefined'}`, 50, 220)
     .fontSize(14)
     .text('Payment', 50, 260)
     .text(`Due ${orderInfo.dueDate || 'undefined'}`, 50, 280)
     .text(`$${orderInfo.total}`, 50, 300)
     .fontSize(10)
     .text('To be delivered Between 11:30 - 11:45', 50, 340);

  // Right side content
  const rightMargin = leftColumnWidth + 20;

  doc.fillColor('black')
     .fontSize(12)
     .text('Customer', rightMargin, 50)
     .fontSize(10)
     .text(`${orderInfo.customer.name}`, rightMargin, 70)
     .text(orderInfo.customer.email, rightMargin, 85)
     .text(orderInfo.customer.phone, rightMargin, 100)
     .fontSize(12)
     .text('Invoice details', rightMargin + 200, 50)
     .fontSize(10)
     .text(`PDF created ${orderInfo.pdfCreatedDate || 'undefined'}`, rightMargin + 200, 70)
     .text(`Service date ${orderInfo.serviceDate || 'undefined'}`, rightMargin + 200, 85)
     .fontSize(24)
     .text(`Invoice #${orderInfo.invoiceNumber}`, rightMargin, 150);

  // Items Table
  generateItemsTable(doc, orderInfo.items, rightMargin, 200, rightColumnWidth - 40);

  // Totals
  const totalsStartY = pageHeight - 200;
  const totalsWidth = rightColumnWidth - 100;
  doc.lineWidth(1)
     .moveTo(rightMargin, totalsStartY)
     .lineTo(rightMargin + totalsWidth, totalsStartY)
     .stroke();

  doc.fontSize(10)
     .text('Subtotal', rightMargin, totalsStartY + 10)
     .text(`$${orderInfo.subtotal}`, rightMargin + totalsWidth, totalsStartY + 10, { align: 'right' })
     .text('Sales Tax', rightMargin, totalsStartY + 30)
     .text(`$${orderInfo.tax}`, rightMargin + totalsWidth, totalsStartY + 40, { align: 'right' })
     .text('Tip', rightMargin, totalsStartY + 50)
     .text(`$${orderInfo.tip}`, rightMargin + totalsWidth, totalsStartY + 60, { align: 'right' })
     .fontSize(14)
     .text('Total paid', rightMargin, totalsStartY + 80)
     .text(`$${orderInfo.total}`, rightMargin + totalsWidth, totalsStartY + 90, { align: 'right' });

  // Footer
  doc.fontSize(10)
     .fillColor('white')
     .text('Aladdin Mediterranean Cuisine', 50, pageHeight - 100)
     .text('912 WESTHEIMER RD', 50, pageHeight - 85)
     .text('HOUSTON, TX 77006-3920 United States', 50, pageHeight - 70)
     .text('aladdin.houston@yahoo.com', 50, pageHeight - 55)
     .text('713-942-2321', 50, pageHeight - 40);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateItemsTable(doc, items, x, y, width) {
  doc.fontSize(12)
     .text('Items', x, y)
     .moveDown();

  doc.fontSize(10);
  items.forEach((item, i) => {
    const yPosition = y + 30 + (i * 20);
    doc.text(item.name, x, yPosition)
       .text(item.quantity, x + width - 150, yPosition, { width: 50, align: 'right' })
       .text(`$${item.price}`, x + width - 100, yPosition, { width: 50, align: 'right' })
       .text(`$${(item.price * item.quantity)}`, x + width - 50, yPosition, { width: 50, align: 'right' });
  });
}

module.exports = { generateInvoice };