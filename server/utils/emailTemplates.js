/**
 * Email Templates Module for SoftPro Innovation
 * Executive, mobile-responsive HTML templates for:
 * 1. User Registration (Welcome Email)
 * 2. Order Placed / Confirmation Receipt
 * 3. Order Status Milestone Updates (Processing, Shipped, Delivered, Cancelled)
 */

const DEFAULT_CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/**
 * Format currency in Indian Rupees style (₹ 1,299)
 */
const formatINR = (val) => {
  const num = Number(val) || 0;
  return "₹ " + num.toLocaleString("en-IN");
};

/**
 * Format ISO date string into readable Indian standard format
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "Just now";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateStr);
  }
};

/**
 * 1. User Registration / Welcome Email
 */
const generateWelcomeEmail = (user = {}, clientUrl = DEFAULT_CLIENT_URL) => {
  const name = user.name || "Innovator";
  const email = user.email || "";
  const mobile = user.mobile || "Not specified";
  const loginUrl = `${clientUrl}/login`;
  const shopUrl = `${clientUrl}/Product`;

  const subject = `Welcome to SoftPro Innovation, ${name}! 🚀 Your Gateway to Advanced Tech`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SoftPro Innovation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Branded Top Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%); padding: 36px 30px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: rgba(255,255,255,0.12); padding: 8px 18px; border-radius: 999px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.2);">
                      <span style="color: #60a5fa; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                        ⚡ NEXT-GEN ELECTRONICS &amp; IOT
                      </span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                      SoftPro Innovation
                    </h1>
                    <p style="color: #cbd5e1; margin: 0; font-size: 14px; font-weight: 500;">
                      Empowering Inventors, Engineers &amp; Tech Creators
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Greeting -->
          <tr>
            <td style="padding: 36px 32px 20px 32px;">
              <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 22px; font-weight: 700;">
                Hello ${name} 👋
              </h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.65; margin: 0 0 20px 0;">
                We are thrilled to welcome you to the <strong>SoftPro Innovation</strong> ecosystem! Your account is now active and ready for exploring cutting-edge microcontrollers, smart robotics, IoT sensors, and high-performance development boards.
              </p>

              <!-- Account Summary Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0 26px 0;">
                <tr>
                  <td style="padding: 20px 22px;">
                    <div style="color: #1e3a8a; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                      📌 Account Credentials Overview
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 5px 0; color: #64748b; font-size: 13.5px; width: 35%;">Registered Name:</td>
                        <td style="padding: 5px 0; color: #0f172a; font-size: 13.5px; font-weight: 600;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #64748b; font-size: 13.5px;">Primary Email:</td>
                        <td style="padding: 5px 0; color: #0f172a; font-size: 13.5px; font-weight: 600;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #64748b; font-size: 13.5px;">Mobile Contact:</td>
                        <td style="padding: 5px 0; color: #0f172a; font-size: 13.5px; font-weight: 600;">${mobile}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #64748b; font-size: 13.5px;">Account Status:</td>
                        <td style="padding: 5px 0;">
                          <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; border: 1px solid #bbf7d0;">
                            ACTIVE &amp; VERIFIED
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Value Propositions Grid -->
              <div style="margin-bottom: 26px;">
                <div style="color: #0f172a; font-size: 14px; font-weight: 700; margin-bottom: 12px;">
                  What you can do next:
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-size: 18px; padding-right: 12px; vertical-align: top;">⚡</td>
                          <td style="color: #334155; font-size: 13.5px; line-height: 1.5;">
                            <strong>Explore Catalog:</strong> Discover 80+ curated development boards, sensors, and robotics modules.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-size: 18px; padding-right: 12px; vertical-align: top;">🚚</td>
                          <td style="color: #334155; font-size: 13.5px; line-height: 1.5;">
                            <strong>Live Tracking:</strong> Real-time shipment status notifications directly on your dashboard.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-size: 18px; padding-right: 12px; vertical-align: top;">🛡️</td>
                          <td style="color: #334155; font-size: 13.5px; line-height: 1.5;">
                            <strong>Secure Checkout:</strong> Encrypted payments via Razorpay UPI, Cards, and Cash on Delivery.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Buttons Row -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${shopUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 14.5px; font-weight: 700; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); text-align: center; margin-right: 8px; margin-bottom: 8px;">
                      Start Shopping Now &rarr;
                    </a>
                    <a href="${loginUrl}" style="display: inline-block; background: #ffffff; color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 10px; border: 1.5px solid #2563eb; text-align: center; margin-bottom: 8px;">
                      Sign In to Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <p style="color: #94a3b8; font-size: 12.5px; line-height: 1.5; margin: 24px 0 0 0; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 18px;">
                If you did not sign up for this account, please immediately contact our team at <a href="mailto:support@softproinnovation.com" style="color: #2563eb; text-decoration: none;">support@softproinnovation.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 26px 30px; text-align: center; color: #94a3b8; font-size: 12.5px; line-height: 1.6;">
              <div style="color: #ffffff; font-weight: 700; font-size: 14px; margin-bottom: 6px;">
                SoftPro Innovation Technologies
              </div>
              <div style="margin-bottom: 8px;">
                Lucknow, Uttar Pradesh, India &bull; Helpline: +91 70801 02007
              </div>
              <div style="color: #64748b; font-size: 11.5px;">
                &copy; ${new Date().getFullYear()} SoftPro Innovation. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
};

/**
 * 2. Order Confirmation Email (Upon placement / payment verification)
 */
const generateOrderConfirmationEmail = (order, clientUrl = DEFAULT_CLIENT_URL) => {
  const orderId = order.orderId || (order._id ? `#ORD-${order._id.toString().slice(-6).toUpperCase()}` : "ORD-NEW");
  const customerName = order.customerName || order.address?.name || "Valued Customer";
  const orderDate = formatDate(order.createdAt);
  const items = Array.isArray(order.items) ? order.items : [];
  const totalAmount = formatINR(order.totalAmount);
  const subtotal = formatINR(order.subtotal || order.totalAmount);
  const fee = order.fee > 0 ? formatINR(order.fee) : "FREE";
  const discount = order.discount > 0 ? `- ${formatINR(order.discount)}` : "₹ 0";
  const paymentMethod = (order.paymentMethod || "cod").toUpperCase();
  const paymentStatus = (order.paymentStatus || "pending").toUpperCase();
  const isPaid = order.paymentStatus === "paid" || order.paymentStatus === "completed";

  const orderTrackingUrl = `${clientUrl}/profile?tab=orders`;

  const address = order.address || {};
  const formattedAddress = [
    address.address || address.Address,
    address.locality || address.localiy,
    address.landmark ? `Near ${address.landmark}` : null,
    address.city,
    address.state,
    address.pincode ? `PIN: ${address.pincode}` : null,
  ].filter(Boolean).join(", ");

  const subject = `Order Confirmed! #${orderId} - SoftPro Innovation Receipt 🎉`;

  // Item rows HTML
  const itemsHtml = items.map((item) => {
    const itemName = item.name || "Product";
    const qty = item.quantity || 1;
    const price = formatINR(item.price || 0);
    const itemTotal = formatINR(item.total || (item.price * qty));
    const category = item.category ? `<span style="color: #64748b; font-size: 11px;">(${item.category})</span>` : "";

    return `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13.5px; font-weight: 600;">
          ${itemName} ${category}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 13px; text-align: center;">
          ${qty}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 13px; text-align: right;">
          ${price}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13.5px; font-weight: 700; text-align: right;">
          ${itemTotal}
        </td>
      </tr>
    `;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${orderId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Branded Top Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%); padding: 34px 28px; text-align: center;">
              <div style="display: inline-block; background: rgba(255,255,255,0.14); padding: 6px 16px; border-radius: 999px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.2);">
                <span style="color: #60a5fa; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                  ORDER CONFIRMED &bull; RECEIPT
                </span>
              </div>
              <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 25px; font-weight: 800;">
                SoftPro Innovation
              </h1>
              <p style="color: #cbd5e1; margin: 0; font-size: 13.5px;">
                Thank you for your business! Your order is being processed.
              </p>
            </td>
          </tr>

          <!-- Thank You & Key Meta Details -->
          <tr>
            <td style="padding: 30px 28px 16px 28px;">
              <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">
                Thank You, ${customerName}! 🎉
              </h2>
              <p style="color: #475569; font-size: 14.5px; line-height: 1.6; margin: 0 0 20px 0;">
                We have received your order <strong>${orderId}</strong>. Our engineering and fulfillment team is preparing your hardware items for dispatch.
              </p>

              <!-- Meta 2-Column Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; vertical-align: top; width: 50%; border-right: 1px solid #e2e8f0;">
                    <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</div>
                    <div style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 3px;">${orderId}</div>
                    <div style="color: #64748b; font-size: 11.5px; margin-top: 4px;">${orderDate}</div>
                  </td>
                  <td style="padding: 16px 20px; vertical-align: top; width: 50%;">
                    <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Payment Status</div>
                    <div style="margin-top: 4px;">
                      <span style="display: inline-block; background-color: ${isPaid ? '#dcfce7' : '#fef3c7'}; color: ${isPaid ? '#15803d' : '#b45309'}; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 999px;">
                        ${paymentStatus} (${paymentMethod})
                      </span>
                    </div>
                    <div style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 4px;">
                      ${totalAmount}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 4-Step Milestone Progress Bar -->
              <div style="margin-bottom: 26px; padding: 16px 14px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="color: #1e3a8a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; text-align: center;">
                  ORDER LIFECYCLE
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="width: 25%;">
                      <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #2563eb; color: #ffffff; font-size: 12px; font-weight: 800; line-height: 28px; text-align: center; margin: 0 auto 4px auto;">✓</div>
                      <div style="color: #2563eb; font-size: 11px; font-weight: 700;">Confirmed</div>
                    </td>
                    <td align="center" style="width: 25%;">
                      <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #e2e8f0; color: #64748b; font-size: 12px; font-weight: 800; line-height: 28px; text-align: center; margin: 0 auto 4px auto;">2</div>
                      <div style="color: #64748b; font-size: 11px;">Processing</div>
                    </td>
                    <td align="center" style="width: 25%;">
                      <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #e2e8f0; color: #64748b; font-size: 12px; font-weight: 800; line-height: 28px; text-align: center; margin: 0 auto 4px auto;">3</div>
                      <div style="color: #64748b; font-size: 11px;">Shipped</div>
                    </td>
                    <td align="center" style="width: 25%;">
                      <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #e2e8f0; color: #64748b; font-size: 12px; font-weight: 800; line-height: 28px; text-align: center; margin: 0 auto 4px auto;">4</div>
                      <div style="color: #64748b; font-size: 11px;">Delivered</div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Itemized Goods Table -->
              <div style="margin-bottom: 22px;">
                <div style="color: #0f172a; font-size: 14px; font-weight: 700; margin-bottom: 10px;">
                  Ordered Items (${items.length})
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
                  <thead>
                    <tr style="background-color: #f1f5f9;">
                      <th style="padding: 10px 14px; text-align: left; color: #475569; font-size: 11.5px; font-weight: 700; text-transform: uppercase;">Product</th>
                      <th style="padding: 10px 14px; text-align: center; color: #475569; font-size: 11.5px; font-weight: 700; text-transform: uppercase;">Qty</th>
                      <th style="padding: 10px 14px; text-align: right; color: #475569; font-size: 11.5px; font-weight: 700; text-transform: uppercase;">Price</th>
                      <th style="padding: 10px 14px; text-align: right; color: #475569; font-size: 11.5px; font-weight: 700; text-transform: uppercase;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>

              <!-- Financial Breakdown -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="width: 50%;"></td>
                  <td style="width: 50%;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-size: 12.5px;">Subtotal:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-size: 12.5px; font-weight: 600; text-align: right;">${subtotal}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-size: 12.5px;">Delivery Fee:</td>
                        <td style="padding: 4px 0; color: #16a34a; font-size: 12.5px; font-weight: 600; text-align: right;">${fee}</td>
                      </tr>
                      ${order.discount > 0 ? `
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-size: 12.5px;">Savings Discount:</td>
                        <td style="padding: 4px 0; color: #dc2626; font-size: 12.5px; font-weight: 600; text-align: right;">${discount}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0 0 0; color: #0f172a; font-size: 14px; font-weight: 800; border-top: 1px solid #e2e8f0;">Grand Total:</td>
                        <td style="padding: 8px 0 0 0; color: #1e3a8a; font-size: 16px; font-weight: 800; text-align: right; border-top: 1px solid #e2e8f0;">${totalAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Shipping Destination Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="color: #1e3a8a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                      📍 Delivery Address
                    </div>
                    <div style="color: #0f172a; font-size: 13.5px; font-weight: 700;">
                      ${address.name || customerName} &bull; ${address.mobile || order.customerMobile || ''}
                    </div>
                    <div style="color: #475569; font-size: 13px; line-height: 1.5; margin-top: 4px;">
                      ${formattedAddress || 'Standard Delivery Address'}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${orderTrackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); text-align: center;">
                      Track Order on Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center; margin: 18px 0 0 0;">
                Have any questions about this order? Reply directly to this email or reach us at <a href="mailto:support@softproinnovation.com" style="color: #2563eb; text-decoration: none;">support@softproinnovation.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 28px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <div style="color: #ffffff; font-weight: 700; font-size: 13.5px; margin-bottom: 4px;">
                SoftPro Innovation Technologies
              </div>
              <div>Lucknow, Uttar Pradesh, India &bull; Helpline: +91 70801 02007</div>
              <div style="color: #64748b; font-size: 11px; margin-top: 6px;">
                &copy; ${new Date().getFullYear()} SoftPro Innovation. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
};

/**
 * 3. Order Status Update Email (Processing, Shipped, Delivered, Cancelled)
 */
const generateOrderStatusUpdateEmail = (order, newStatus, clientUrl = DEFAULT_CLIENT_URL) => {
  const orderId = order.orderId || (order._id ? `#ORD-${order._id.toString().slice(-6).toUpperCase()}` : "ORD");
  const customerName = order.customerName || order.address?.name || "Customer";
  const s = String(newStatus || order.status || "processing").toLowerCase();
  const totalAmount = formatINR(order.totalAmount);
  const items = Array.isArray(order.items) ? order.items : [];
  const trackingUrl = `${clientUrl}/profile?tab=orders`;

  // Status configuration matrix
  let config = {
    badgeText: "PROCESSING",
    headerGradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    badgeBg: "#eff6ff",
    badgeColor: "#1d4ed8",
    title: `Your Order #${orderId} is being Processed! ⚙️`,
    message: `Our technical team has reviewed your order and items are currently being picked, tested, and securely packed for dispatch.`,
    step: 2,
    icon: "⚙️",
  };

  if (s === "shipped") {
    config = {
      badgeText: "SHIPPED & IN TRANSIT",
      headerGradient: "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
      badgeBg: "#f5f3ff",
      badgeColor: "#6d28d9",
      title: `Your Order #${orderId} has been Shipped! 🚚`,
      message: `Exciting news! Your package has been handed over to our courier partner and is en route to your delivery address.`,
      step: 3,
      icon: "🚚",
    };
  } else if (s === "delivered") {
    config = {
      badgeText: "DELIVERED",
      headerGradient: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
      badgeBg: "#ecfdf5",
      badgeColor: "#047857",
      title: `Package Delivered! Order #${orderId} 📦🎉`,
      message: `Your package has been safely delivered to your doorstep. We hope you enjoy building with your new hardware!`,
      step: 4,
      icon: "✅",
    };
  } else if (s === "cancelled") {
    config = {
      badgeText: "CANCELLED",
      headerGradient: "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)",
      badgeBg: "#fef2f2",
      badgeColor: "#b91c1c",
      title: `Order #${orderId} Cancellation Notice ⚠️`,
      message: `Your order has been cancelled. If any online payment was deducted, the full refund will be credited to your original payment method in 3-5 business days.`,
      step: 0,
      icon: "❌",
    };
  } else if (s === "confirmed") {
    config = {
      badgeText: "CONFIRMED",
      headerGradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
      badgeBg: "#eff6ff",
      badgeColor: "#1d4ed8",
      title: `Order #${orderId} Confirmed! 📋`,
      message: `Your order has been officially verified and scheduled for fulfillment.`,
      step: 1,
      icon: "📋",
    };
  }

  const subject = `${config.title} - SoftPro Innovation`;

  // Milestone Progress Bar (Active steps rendered dynamically)
  const renderMilestoneStep = (stepNum, label) => {
    const isCompleted = config.step >= stepNum;
    const isCurrent = config.step === stepNum;

    const circleBg = isCurrent
      ? "#2563eb"
      : isCompleted
      ? "#16a34a"
      : "#e2e8f0";

    const textColor = isCurrent
      ? "#2563eb"
      : isCompleted
      ? "#16a34a"
      : "#94a3b8";

    const symbol = isCompleted && !isCurrent ? "✓" : stepNum;

    return `
      <td align="center" style="width: 25%;">
        <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${circleBg}; color: #ffffff; font-size: 12px; font-weight: 800; line-height: 30px; text-align: center; margin: 0 auto 5px auto; box-shadow: ${isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none'};">
          ${symbol}
        </div>
        <div style="color: ${textColor}; font-size: 11.5px; font-weight: ${isCurrent ? '800' : '600'};">
          ${label}
        </div>
      </td>
    `;
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Branded Top Header Banner -->
          <tr>
            <td style="background: ${config.headerGradient}; padding: 36px 30px; text-align: center;">
              <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 6px 18px; border-radius: 999px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.25);">
                <span style="color: #ffffff; font-size: 11.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                  ${config.icon} ORDER STATUS UPDATE
                </span>
              </div>
              <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 24px; font-weight: 800;">
                SoftPro Innovation
              </h1>
              <p style="color: #e2e8f0; margin: 0; font-size: 13.5px; font-weight: 500;">
                Order ID: <strong>${orderId}</strong>
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 34px 30px 20px 30px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background-color: ${config.badgeBg}; color: ${config.badgeColor}; font-size: 12.5px; font-weight: 800; padding: 5px 16px; border-radius: 999px; letter-spacing: 0.5px; margin-bottom: 12px;">
                  CURRENT STATUS: ${config.badgeText}
                </span>
                <h2 style="color: #0f172a; margin: 0 0 10px 0; font-size: 21px; font-weight: 800;">
                  Dear ${customerName},
                </h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 auto; max-width: 480px;">
                  ${config.message}
                </p>
              </div>

              <!-- 4-Step Tracker (If not cancelled) -->
              ${config.step > 0 ? `
              <div style="margin-bottom: 28px; padding: 20px 14px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; text-align: center;">
                  LIVE PROGRESS TRACKER
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    ${renderMilestoneStep(1, "Confirmed")}
                    ${renderMilestoneStep(2, "Processing")}
                    ${renderMilestoneStep(3, "Shipped")}
                    ${renderMilestoneStep(4, "Delivered")}
                  </tr>
                </table>
              </div>
              ` : ''}

              <!-- Order Snapshot Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 18px 22px;">
                    <div style="color: #1e3a8a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                      📦 Order Snapshot
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-size: 13px; width: 40%;">Order Reference:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-size: 13px; font-weight: 700;">${orderId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Total Valuation:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-size: 13px; font-weight: 700;">${totalAmount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Items Count:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${items.length} item(s)</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Destination:</td>
                        <td style="padding: 4px 0; color: #475569; font-size: 12.5px;">
                          ${order.address?.city || ''}, ${order.address?.state || ''} ${order.address?.pincode ? `(${order.address.pincode})` : ''}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 22px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); text-align: center;">
                      View Order in Your Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #94a3b8; font-size: 12.5px; line-height: 1.5; text-align: center; margin: 20px 0 0 0;">
                If you have any questions or need to make a delivery note update, contact our support team anytime at <a href="mailto:support@softproinnovation.com" style="color: #2563eb; text-decoration: none;">support@softproinnovation.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 28px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <div style="color: #ffffff; font-weight: 700; font-size: 13.5px; margin-bottom: 4px;">
                SoftPro Innovation Technologies
              </div>
              <div>Lucknow, Uttar Pradesh, India &bull; Helpline: +91 70801 02007</div>
              <div style="color: #64748b; font-size: 11px; margin-top: 6px;">
                &copy; ${new Date().getFullYear()} SoftPro Innovation. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
};

module.exports = {
  generateWelcomeEmail,
  generateOrderConfirmationEmail,
  generateOrderStatusUpdateEmail,
};
