// Manual payment methods — each has a QR code the user scans to pay directly.
const QR_BASE = "https://media.base44.com/images/public/6a60bb3456cf14775962b360";

export const PAYMENT_METHODS = [
  { key: "gotyme", label: "GoTyme", qr: `${QR_BASE}/7109511a3_GoTyme.JPG` },
  { key: "unionbank", label: "UnionBank", qr: `${QR_BASE}/ddf457696_UnionBank.JPG` },
  { key: "bpi", label: "BPI", qr: `${QR_BASE}/4a3e5431e_BPI.png` },
  { key: "gcash", label: "GCash", qr: `${QR_BASE}/0deca68ac_GCash.JPG` },
  { key: "paypal", label: "PayPal", qr: `${QR_BASE}/923b2ef07_PayPal.JPG` },
  { key: "wise", label: "Wise", qr: `${QR_BASE}/83c9bc8de_Wise.png` },
];

export const paymentMethodLabel = (key) => PAYMENT_METHODS.find((m) => m.key === key)?.label || key || "—";