// Builds the HTML body for the congratulatory email sent when a user is upgraded to Lifetime Pass
// (mirrors src/lib/emailTemplates.js's buildLifetimeGrantedEmail, kept separate since backend
// functions can't import frontend source files).
export function buildLifetimeGrantedEmail({ userName }: { userName: string }) {
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