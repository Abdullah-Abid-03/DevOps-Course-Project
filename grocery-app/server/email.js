// ──────────────────────────────────────────────
// FreshCart — Email Service
// ──────────────────────────────────────────────
const nodemailer = require('nodemailer');

const SENDER_EMAIL = 'nickforest.234@gmail.com';
const APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER_EMAIL,
    pass: APP_PASSWORD
  }
});

/**
 * Generate a beautiful HTML email for order confirmation
 */
function buildOrderEmailHTML(order) {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #1e1e3a;text-align:left;">
        <span style="font-size:24px;vertical-align:middle;margin-right:8px;">${item.emoji}</span>
        <span style="color:#e8e8ed;font-weight:500;">${item.name}</span>
        <div style="color:#8888a0;font-size:12px;margin-top:2px;">Per ${item.unit}</div>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #1e1e3a;text-align:center;color:#8888a0;">
        × ${item.quantity}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #1e1e3a;text-align:center;color:#8888a0;">
        $${item.price.toFixed(2)}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #1e1e3a;text-align:right;color:#00d4aa;font-weight:600;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation — FreshCart</title>
</head>
<body style="margin:0;padding:0;background-color:#06060b;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#06060b;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;text-align:center;background:linear-gradient(135deg,#0f0f1a,#161625);border-radius:16px 16px 0 0;border:1px solid rgba(255,255,255,0.06);border-bottom:none;">
              <div style="font-size:28px;margin-bottom:4px;">🛒</div>
              <h1 style="margin:0;color:#e8e8ed;font-size:22px;font-weight:700;">
                Fresh<span style="color:#00d4aa;">Cart</span>
              </h1>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="padding:32px;text-align:center;background:linear-gradient(180deg,#161625,#0f0f1a);border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
              <div style="width:64px;height:64px;border-radius:50%;background:rgba(0,212,170,0.12);margin:0 auto 16px;line-height:64px;font-size:32px;">✅</div>
              <h2 style="margin:0 0 6px;color:#e8e8ed;font-size:24px;font-weight:800;">Order Confirmed!</h2>
              <p style="margin:0;color:#8888a0;font-size:14px;">Thank you for shopping with FreshCart, ${order.customer.name}!</p>
            </td>
          </tr>

          <!-- Order Info Bar -->
          <tr>
            <td style="padding:0;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1c1c30;">
                <tr>
                  <td style="padding:14px 32px;border-right:1px solid #2a2a45;">
                    <div style="color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Order ID</div>
                    <div style="color:#00d4aa;font-size:13px;font-weight:600;">${order.id}</div>
                  </td>
                  <td style="padding:14px 32px;border-right:1px solid #2a2a45;">
                    <div style="color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Date</div>
                    <div style="color:#e8e8ed;font-size:13px;font-weight:500;">${orderDate}</div>
                  </td>
                  <td style="padding:14px 32px;">
                    <div style="color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Status</div>
                    <div style="color:#4ade80;font-size:13px;font-weight:600;">✓ Confirmed</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding:24px 32px;background:#0f0f1a;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
              <h3 style="margin:0 0 16px;color:#e8e8ed;font-size:16px;font-weight:700;">Order Items</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#161625;border-radius:10px;overflow:hidden;">
                <thead>
                  <tr style="background:#1c1c30;">
                    <th style="padding:10px 16px;text-align:left;color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Item</th>
                    <th style="padding:10px 16px;text-align:center;color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Qty</th>
                    <th style="padding:10px 16px;text-align:center;color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Price</th>
                    <th style="padding:10px 16px;text-align:right;color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:0 32px 24px;background:#0f0f1a;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#161625;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 20px;color:#8888a0;font-size:14px;">Subtotal</td>
                  <td style="padding:12px 20px;text-align:right;color:#e8e8ed;font-size:14px;">$${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 20px;color:#8888a0;font-size:14px;border-top:1px solid #1e1e3a;">Delivery Fee</td>
                  <td style="padding:12px 20px;text-align:right;color:${order.deliveryFee === 0 ? '#4ade80' : '#e8e8ed'};font-size:14px;border-top:1px solid #1e1e3a;">
                    ${order.deliveryFee === 0 ? 'FREE 🎉' : '$' + order.deliveryFee.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;color:#e8e8ed;font-size:18px;font-weight:800;border-top:2px solid #00d4aa;">Total</td>
                  <td style="padding:16px 20px;text-align:right;color:#00d4aa;font-size:20px;font-weight:800;border-top:2px solid #00d4aa;">$${order.total.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Details -->
          <tr>
            <td style="padding:0 32px 24px;background:#0f0f1a;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
              <h3 style="margin:0 0 12px;color:#e8e8ed;font-size:16px;font-weight:700;">Delivery Details</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#161625;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 20px;color:#55556a;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;width:100px;border-bottom:1px solid #1e1e3a;">Name</td>
                  <td style="padding:12px 20px;color:#e8e8ed;font-size:14px;border-bottom:1px solid #1e1e3a;">${order.customer.name}</td>
                </tr>
                <tr>
                  <td style="padding:12px 20px;color:#55556a;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid #1e1e3a;">Email</td>
                  <td style="padding:12px 20px;color:#e8e8ed;font-size:14px;border-bottom:1px solid #1e1e3a;">${order.customer.email}</td>
                </tr>
                <tr>
                  <td style="padding:12px 20px;color:#55556a;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid #1e1e3a;">Phone</td>
                  <td style="padding:12px 20px;color:#e8e8ed;font-size:14px;border-bottom:1px solid #1e1e3a;">${order.customer.phone}</td>
                </tr>
                <tr>
                  <td style="padding:12px 20px;color:#55556a;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Address</td>
                  <td style="padding:12px 20px;color:#e8e8ed;font-size:14px;">${order.customer.address}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;text-align:center;background:#161625;border-radius:0 0 16px 16px;border:1px solid rgba(255,255,255,0.06);border-top:none;">
              <p style="margin:0 0 4px;color:#55556a;font-size:12px;">🛒 FreshCart — Fresh Groceries, Delivered</p>
              <p style="margin:0;color:#3a3a50;font-size:11px;">This is an automated order confirmation. Please keep it for your records.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmation(order) {
  if (!APP_PASSWORD) {
    console.warn('⚠️  GMAIL_APP_PASSWORD not set — skipping email send.');
    return { sent: false, reason: 'No app password configured' };
  }

  const mailOptions = {
    from: `"FreshCart 🛒" <${SENDER_EMAIL}>`,
    to: order.customer.email,
    subject: `✅ Order Confirmed — ${order.id} | FreshCart`,
    html: buildOrderEmailHTML(order)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧  Confirmation email sent to ${order.customer.email} (${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌  Email send failed:', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendOrderConfirmation };
