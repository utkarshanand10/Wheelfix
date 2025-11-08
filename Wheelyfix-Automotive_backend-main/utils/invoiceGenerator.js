const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure invoices directory exists
const invoicesDir = path.join(__dirname, '../public/uploads/invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

// Company details
const COMPANY_DETAILS = {
  name: 'Wheelyfix Automotive',
  address: '123 Auto Service Street, Mumbai, Maharashtra 400001',
  phone: '+91 98765 43210',
  email: 'info@wheelyfix.com',
  website: 'www.wheelyfix.com'
};

/**
 * Generate PDF invoice for an order
 * @param {Object} order - Order object from database
 * @param {Object} user - User object from database
 * @returns {Promise<string>} - Path to generated invoice file
 */
const generateInvoice = async (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      // Create filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `invoice_${order._id}_${timestamp}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      // Create PDF document
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice - ${order.orderNumber}`,
          Author: COMPANY_DETAILS.name,
          Subject: 'Service Invoice'
        }
      });

      // Pipe to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24)
         .fillColor('#3b82f6')
         .text(COMPANY_DETAILS.name, 50, 50);

      doc.fontSize(10)
         .fillColor('#6b7280')
         .text(COMPANY_DETAILS.address, 50, 80)
         .text(`Phone: ${COMPANY_DETAILS.phone}`, 50, 95)
         .text(`Email: ${COMPANY_DETAILS.email}`, 50, 110)
         .text(`Website: ${COMPANY_DETAILS.website}`, 50, 125);

      // Invoice title and details
      doc.fontSize(20)
         .fillColor('#1f2937')
         .text('INVOICE', 400, 50);

      doc.fontSize(12)
         .fillColor('#6b7280')
         .text(`Invoice #: ${order.orderNumber}`, 400, 80)
         .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, 95)
         .text(`Payment ID: ${order.razorpay?.paymentId || 'N/A'}`, 400, 110)
         .text(`Status: ${order.paymentStatus.toUpperCase()}`, 400, 125);

      // Customer details
      doc.fontSize(14)
         .fillColor('#1f2937')
         .text('Bill To:', 50, 180);

      doc.fontSize(12)
         .fillColor('#374151')
         .text(user.name, 50, 205)
         .text(user.email, 50, 220)
         .text(user.phoneNumber || 'N/A', 50, 235);

      // Service details table
      doc.fontSize(14)
         .fillColor('#1f2937')
         .text('Service Details:', 50, 280);

      // Table header
      const tableTop = 310;
      const itemCodeX = 50;
      const descriptionX = 120;
      const quantityX = 400;
      const priceX = 450;
      const totalX = 500;

      doc.fontSize(10)
         .fillColor('#ffffff')
         .rect(itemCodeX, tableTop, 70, 20)
         .fill('#3b82f6')
         .text('S.No.', itemCodeX + 5, tableTop + 5);

      doc.rect(descriptionX, tableTop, 280, 20)
         .fill('#3b82f6')
         .text('Service Name', descriptionX + 5, tableTop + 5);

      doc.rect(quantityX, tableTop, 50, 20)
         .fill('#3b82f6')
         .text('Qty', quantityX + 5, tableTop + 5);

      doc.rect(priceX, tableTop, 50, 20)
         .fill('#3b82f6')
         .text('Price', priceX + 5, tableTop + 5);

      doc.rect(totalX, tableTop, 50, 20)
         .fill('#3b82f6')
         .text('Total', totalX + 5, tableTop + 5);

      // Service items
      let currentY = tableTop + 20;
      order.items.forEach((item, index) => {
        const itemHeight = 25;
        
        // Alternate row colors
        const isEven = index % 2 === 0;
        doc.rect(itemCodeX, currentY, 70, itemHeight)
           .fill(isEven ? '#f9fafb' : '#ffffff');

        doc.rect(descriptionX, currentY, 280, itemHeight)
           .fill(isEven ? '#f9fafb' : '#ffffff');

        doc.rect(quantityX, currentY, 50, itemHeight)
           .fill(isEven ? '#f9fafb' : '#ffffff');

        doc.rect(priceX, currentY, 50, itemHeight)
           .fill(isEven ? '#f9fafb' : '#ffffff');

        doc.rect(totalX, currentY, 50, itemHeight)
           .fill(isEven ? '#f9fafb' : '#ffffff');

        // Item content
        doc.fontSize(9)
           .fillColor('#374151')
           .text((index + 1).toString(), itemCodeX + 5, currentY + 8)
           .text(item.title, descriptionX + 5, currentY + 8)
           .text(item.quantity.toString(), quantityX + 5, currentY + 8)
           .text(`₹${(item.price / 100).toFixed(2)}`, priceX + 5, currentY + 8)
           .text(`₹${(item.total / 100).toFixed(2)}`, totalX + 5, currentY + 8);

        currentY += itemHeight;
      });

      // Total section
      const totalY = currentY + 20;
      doc.rect(priceX, totalY, 100, 30)
         .fill('#f3f4f6')
         .stroke();

      doc.fontSize(12)
         .fillColor('#1f2937')
         .text('Total Amount:', priceX + 5, totalY + 8)
         .fontSize(14)
         .fillColor('#3b82f6')
         .text(`₹${(order.total / 100).toFixed(2)}`, priceX + 5, totalY + 20);

      // Payment method
      doc.fontSize(10)
         .fillColor('#6b7280')
         .text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 50, totalY + 50)
         .text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 50, totalY + 65);

      // Footer
      const footerY = 750;
      doc.fontSize(10)
         .fillColor('#6b7280')
         .text('Thank you for choosing Wheelyfix Automotive!', 50, footerY)
         .text('This invoice is generated electronically and does not require a signature.', 50, footerY + 15)
         .text('For any queries, please contact us at info@wheelyfix.com', 50, footerY + 30);

      // Add company logo placeholder (you can replace with actual logo)
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text('Wheelyfix Automotive', 50, 30);

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete invoice file
 * @param {string} filePath - Path to invoice file
 */
const deleteInvoice = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting invoice file:', error);
  }
};

module.exports = {
  generateInvoice,
  deleteInvoice
};
