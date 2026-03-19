import 'server-only';

/**
 * Generates a clean HTML template for order notification emails.
 * 
 * @param {Object} order - The order object from MongoDB
 * @returns {string} HTML string
 */
export function generateOrderEmailHtml(order) {
  const {
    orderId,
    customerName,
    customerPhone,
    customerAddress,
    items,
    totalAmount,
    notes,
    createdAt
  } = order;

  // Format date
  const dateStr = new Date(createdAt).toLocaleString('en-PK', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  // Generate items table rows
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="font-weight: 600; color: #111;">${item.name || item.Name}</div>
        ${item.variant ? `<div style="font-size: 12px; color: #666;">Variant: ${item.variant}</div>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">PKR ${Number(item.price).toLocaleString('en-PK')}</td>
    </tr>
  `).join('');

  const adminUrl = `${process.env.NEXTAUTH_URL || 'https://chinaunique.pk'}/admin/orders`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .header { background: #065f46; color: white; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #065f46; margin-bottom: 12px; border-bottom: 2px solid #ecfdf5; padding-bottom: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .info-card { background: #f9fafb; padding: 16px; border-radius: 8px; }
        .label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        .value { font-weight: 600; color: #111827; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .total-row { background: #f0fdf4; font-weight: 700; font-size: 18px; color: #065f46; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
        .button { display: inline-block; background: #065f46; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; transition: background 0.2s; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 20px;">New Order Received</h1>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Order ID: ${orderId}</p>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div style="background: #f9fafb; border-radius: 12px; padding: 20px; border: 1px solid #f3f4f6;">
              <div style="margin-bottom: 12px;">
                <div class="label">Name</div>
                <div class="value" style="font-size: 16px;">${customerName}</div>
              </div>
              <div style="margin-bottom: 12px;">
                <div class="label">Phone</div>
                <div class="value">${customerPhone}</div>
              </div>
              <div>
                <div class="label">Shipping Address</div>
                <div class="value" style="line-height: 1.4;">${customerAddress}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Order Details</div>
            <table>
              <thead>
                <tr style="text-align: left; font-size: 12px; color: #6b7280;">
                  <th style="padding: 12px;">Product</th>
                  <th style="padding: 12px; text-align: center;">Qty</th>
                  <th style="padding: 12px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="padding: 16px; text-align: right;">Grand Total</td>
                  <td style="padding: 16px; text-align: right;">PKR ${totalAmount.toLocaleString('en-PK')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${notes ? `
          <div class="section">
            <div class="section-title">Order Notes</div>
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; font-style: italic; color: #92400e;">
              "${notes}"
            </div>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 32px;">
            <a href="${adminUrl}" class="button">Manage Order in Admin Panel</a>
            <div style="margin-top: 12px; font-size: 12px; color: #9ca3af;">
              Received on ${dateStr}
            </div>
          </div>
        </div>

        <div class="footer">
          <strong>China Unique - Home and Lifestyle Store</strong><br>
          Automated System Notification
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates a professional 'Thank You' email for customers with an HTML invoice.
 * 
 * @param {Object} order - The order object from MongoDB
 * @returns {string} HTML string
 */
export function generateCustomerOrderConfirmationHtml(order) {
  const {
    orderId,
    customerName,
    customerAddress,
    items,
    totalAmount,
    createdAt
  } = order;

  // Format date
  const dateStr = new Date(createdAt).toLocaleString('en-PK', {
    dateStyle: 'full',
  });

  // Generate items table rows
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="font-weight: 600; color: #111;">${item.name || item.Name}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${Number(item.price).toLocaleString('en-PK')}</td>
    </tr>
  `).join('');

  const myOrderUrl = `${process.env.NEXTAUTH_URL || 'https://chinaunique.pk'}/orders/${order._id}?token=${order.secureToken}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Your Order</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb; }
        .wrapper { width: 100%; padding: 20px 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: #059669; padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 32px 24px; }
        .invoice-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .item-table { width: 100%; border-collapse: collapse; }
        .total-row { font-weight: 700; font-size: 18px; color: #059669; }
        .btn-container { text-align: center; margin-top: 32px; }
        .button { display: inline-block; background: #059669; color: white !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; }
        .footer { padding: 32px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Thank You, ${customerName}!</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">We've received your order and are getting it ready.</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin: 0;">Hi ${customerName.split(' ')[0]},</p>
            <p style="font-size: 16px;">Your order <strong>${orderId}</strong> has been placed successfully. We will notify you as soon as it's shipped!</p>
            
            <div class="invoice-card">
              <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #f3f4f6; padding-bottom: 12px;">
                <span style="font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase;">Order Invoice</span>
                <span style="font-size: 12px; color: #6b7280;">${dateStr}</span>
              </div>
              
              <table class="item-table">
                <thead>
                  <tr style="text-align: left; font-size: 12px; color: #9ca3af; text-transform: uppercase;">
                    <th style="padding: 8px 0;">Item</th>
                    <th style="padding: 8px 0; text-align: center;">Qty</th>
                    <th style="padding: 8px 0; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td colspan="2" style="padding: 20px 0 0; text-align: right; font-weight: 600;">Total Amount</td>
                    <td style="padding: 20px 0 0; text-align: right; font-weight: 700; color: #059669; font-size: 20px;">Rs. ${totalAmount.toLocaleString('en-PK')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; border: 1px solid #d1fae5; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #065f46;">
                <strong>Shipping to:</strong><br>
                ${customerAddress}
              </p>
            </div>

            <div class="btn-container">
              <a href="${myOrderUrl}" class="button">View My Order</a>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0; font-weight: 700; color: #111827;">China Unique - Home & Lifestyle</p>
            <p style="margin: 4px 0 0;">Building beautiful homes together.</p>
            <div style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
              You received this email because you placed an order on chinaunique.pk
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
