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
    <p style="font-style: italic; color: #475569;">"Thank you so much for supporting my work! It means a lot to me. I had so much fun creating these collections, and I hope they bring a little extra joy to your day. Have fun creating your photo strips!"</p>

    <p style="margin-top: 24px;">Warmly,<br/>The Windy the Pooh Team<br/>A little strip of your day.</p>

    <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">For questions and concerns, contact the developer at alvendherfrancisco01@gmail.com.</p>
  </div>`;
}

// Builds the HTML body for the congratulatory email sent when an admin grants a user Lifetime Pass access.
export function buildLifetimeGrantedEmail({ userName }) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #1e1b4b; max-width: 560px; margin: 0 auto; line-height: 1.6;">
    <p>Hi ${userName},</p>
    <p>Great news — you've been upgraded to the <b>Lifetime Pass</b>! 🎉</p>

    <h3 style="margin-bottom: 8px;">What's included</h3>
    <ul style="padding-left: 20px; color: #1e1b4b;">
      <li>Unlimited booth sessions — no more daily limits</li>
      <li>Every current photo strip collection</li>
      <li>All future collection drops, automatically unlocked</li>
      <li>Unlimited saved strips</li>
    </ul>

    <p style="margin-top: 16px;">Head back into the app and start creating — everything is unlocked and ready for you.</p>

    <h3 style="margin-bottom: 8px;">A Message from Windy the Pooh</h3>
    <p style="font-style: italic; color: #475569;">"Thank you so much for being part of this journey with me! I hope every collection brings a little extra joy to your day. Have fun creating your photo strips!"</p>

    <p style="margin-top: 24px;">Warmly,<br/>The Windy the Pooh Team<br/>A little strip of your day.</p>

    <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">For questions and concerns, contact the developer at alvendherfrancisco01@gmail.com.</p>
  </div>`;
}

// Builds the HTML body for the email sent when an admin rejects a user's unlock request.
export function buildRejectionEmail({ userName, planDesc, reason }) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #1e1b4b; max-width: 560px; margin: 0 auto; line-height: 1.6;">
    <p>Hi ${userName},</p>
    <p>Thank you for your recent request to unlock <b>${planDesc}</b>. We've carefully reviewed it, but unfortunately we weren't able to approve it at this time.</p>

    <h3 style="margin-bottom: 8px;">Reason</h3>
    <p style="background: #fff5f5; border-radius: 8px; padding: 12px; color: #c92a2a;">${reason}</p>

    <p style="margin-top: 20px;">Not to worry — you're welcome to submit a new request with updated proof of payment, and we'll be happy to take another look. If you have any questions in the meantime, just reach out and we'll sort it out together.</p>

    <p style="margin-top: 24px;">Warmly,<br/>The Windy the Pooh Team<br/>A little strip of your day.</p>

    <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">For questions and concerns, contact the developer at alvendherfrancisco01@gmail.com.</p>
  </div>`;
}

// Builds the HTML body for the admin notification sent when a user submits a contact message or design suggestion.
export function buildContactMessageEmail({ userName, userEmail, type, message }) {
  const label = type === "suggestion" ? "🌼 New design suggestion" : "🌼 New contact message";
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #1e1b4b; max-width: 560px; margin: 0 auto; line-height: 1.6;">
    <p>${label} from a user.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 4px 0; color: #64748b;">User</td><td style="padding: 4px 0; text-align: right;">${userName} (${userEmail})</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Type</td><td style="padding: 4px 0; text-align: right;">${type === "suggestion" ? "Design Suggestion" : "General Contact"}</td></tr>
    </table>
    <h3 style="margin-bottom: 8px;">Message</h3>
    <p style="white-space: pre-line; background: #f1f5fb; border-radius: 8px; padding: 12px;">${message}</p>
  </div>`;
}

// Builds the HTML body for the admin notification sent when a user submits a new unlock request.
export function buildNewUnlockRequestEmail({ userName, userEmail, planDesc, amount, paymentMethod }) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #1e1b4b; max-width: 560px; margin: 0 auto; line-height: 1.6;">
    <p>🌼 A new unlock request just came in.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 4px 0; color: #64748b;">User</td><td style="padding: 4px 0; text-align: right;">${userName} (${userEmail})</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Plan</td><td style="padding: 4px 0; text-align: right;">${planDesc}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Amount</td><td style="padding: 4px 0; text-align: right;">${amount}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Payment Method</td><td style="padding: 4px 0; text-align: right;">${paymentMethod}</td></tr>
      </table>
      <p style="margin-top: 20px;">Review and approve it in the Admin dashboard under Unlock Requests.</p>
  </div>`;
}