import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { format } from 'date-fns'

export async function generateInvoicePDF(order: any) {
  // Create a new PDF document
  const doc = await PDFDocument.create()
  const page = doc.addPage([595.28, 841.89]) // A4 size
  const { width, height } = page.getSize()
  
  // Get fonts
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await doc.embedFont(StandardFonts.Helvetica)

  // Colors
  const black = rgb(0, 0, 0)
  const gray = rgb(0.5, 0.5, 0.5)

  // Company info
  page.drawText('SalesCallerAI', {
    x: 50,
    y: height - 50,
    size: 24,
    font: helveticaBold,
    color: black
  })

  page.drawText('Invoice', {
    x: width - 150,
    y: height - 50,
    size: 24,
    font: helveticaBold,
    color: black
  })

  // Invoice details
  const invoiceDetails = [
    `Invoice No: ${order.orderNo}`,
    `Date: ${format(new Date(order.createdAt), 'dd/MM/yyyy')}`,
    `Status: ${order.status}`,
    '',
    'Bill To:',
    order.lead.name,
    order.lead.phone,
    order.lead.email || '',
    order.shippingAddress ? [
      order.shippingAddress.address,
      `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
      order.shippingAddress.postcode
    ].join('\n') : ''
  ]

  let y = height - 120
  for (const line of invoiceDetails) {
    if (line) {
      page.drawText(line, {
        x: 50,
        y,
        size: 10,
        font: helvetica,
        color: black
      })
    }
    y -= 15
  }

  // Table headers
  const tableHeaders = ['Item', 'Quantity', 'Unit Price (RM)', 'Total (RM)']
  const columnWidths = [250, 70, 100, 100]
  let x = 50
  y = height - 300

  page.drawLine({
    start: { x: 50, y: y + 15 },
    end: { x: width - 50, y: y + 15 },
    color: gray
  })

  for (let i = 0; i < tableHeaders.length; i++) {
    page.drawText(tableHeaders[i], {
      x,
      y,
      size: 10,
      font: helveticaBold,
      color: black
    })
    x += columnWidths[i]
  }

  page.drawLine({
    start: { x: 50, y: y - 5 },
    end: { x: width - 50, y: y - 5 },
    color: gray
  })

  // Table rows
  y -= 25
  for (const item of order.items) {
    x = 50
    
    // Product name
    page.drawText(item.product.name, {
      x,
      y,
      size: 10,
      font: helvetica,
      color: black
    })
    x += columnWidths[0]

    // Quantity
    page.drawText(item.quantity.toString(), {
      x,
      y,
      size: 10,
      font: helvetica,
      color: black
    })
    x += columnWidths[1]

    // Unit price
    page.drawText(item.unitPrice.toFixed(2), {
      x,
      y,
      size: 10,
      font: helvetica,
      color: black
    })
    x += columnWidths[2]

    // Total price
    page.drawText(item.totalPrice.toFixed(2), {
      x,
      y,
      size: 10,
      font: helvetica,
      color: black
    })

    y -= 20
  }

  // Total
  page.drawLine({
    start: { x: 50, y: y + 15 },
    end: { x: width - 50, y: y + 15 },
    color: gray
  })

  y -= 10
  page.drawText('Total Amount:', {
    x: width - 200,
    y,
    size: 12,
    font: helveticaBold,
    color: black
  })

  page.drawText(`RM ${order.totalAmount.toFixed(2)}`, {
    x: width - 150,
    y,
    size: 12,
    font: helveticaBold,
    color: black
  })

  // Payment info
  y -= 50
  const paymentInfo = [
    'Payment Information:',
    `Method: ${order.paymentMethod || 'Not specified'}`,
    `Channel: ${order.channel}`,
    order.paymentLink ? `Payment Link: ${order.paymentLink}` : '',
    '',
    'Notes:',
    order.notes || 'No additional notes'
  ]

  for (const line of paymentInfo) {
    if (line) {
      page.drawText(line, {
        x: 50,
        y,
        size: 10,
        font: line.includes(':') ? helveticaBold : helvetica,
        color: black
      })
    }
    y -= 15
  }

  // Footer
  page.drawText('Thank you for your business!', {
    x: 50,
    y: 50,
    size: 12,
    font: helveticaBold,
    color: black
  })

  // Generate PDF
  const pdfBytes = await doc.save()
  return Buffer.from(pdfBytes)
}
