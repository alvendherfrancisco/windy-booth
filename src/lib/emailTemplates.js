// Builds the HTML body for the payment confirmation email (SendEmail renders body as HTML).
export function buildPaymentConfirmationEmail({ userName, planDesc, receiptId, dateStr, amount, paymentMethod, receiptUrl }) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #1e1b4b; max-width: 560px; margin: 0 auto; line-height: 1.6;">
    <p>Hi ${userName},</p>
    <p>Thank you so much for your purchase! Your ${planDesc} has been successfully activated. You now have unlimited access to all current and future photo strip collections!</p>

    <h3 style="margin-bottom: 8px;">Transaction Details</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 4px 0; color: #64748b;">Receipt ID</td><td style="padding: 4px 0; text-align: right;">${receiptId}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Date</td><td style="padding: 4px 0; text-align: right;">${dateStr}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Plan</td><td style="padding: 4px 0; text-align: right;">${planDesc}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Amount</td><td style="padding: 4px 0; text-align: right;">$${amount}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Payment Method</td><td style="padding: 4px 0; text-align: right;">${paymentMethod}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Status</td><td style="padding: 4px 0; text-align: right; color: #37b24d; font-weight: bold;">Approved</td></tr>
    </table>

    <p style="margin-top: 20px;"><a href="${receiptUrl}" style="color: #228be6; font-weight: bold;">Download Your PDF Receipt</a></p>

    <h3 style="margin-bottom: 8px;">A Message from Windy the Pooh</h3>
    <p style="font-style: italic; color: #475569;">"Hi there! Thank you so much for supporting my work and being a part of this journey. I had so much fun designing these collections for you, and I hope they bring extra magic and sweetness to your favorite memories! Have fun styling, customizing, and creating your photo strips!"</p>

    <p style="margin-top: 24px;">Warmly,<br/>The Windy the Pooh Team<br/>Capture memories, create forever.</p>

    <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">For questions and concerns, contact the developer at alvendherfrancisco01@gmail.com.</p>
  </div>`;
}