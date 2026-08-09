// Manual payment methods — each has a QR code the user scans to pay directly.
const QR_BASE = "https://media.base44.com/images/public/6a60bb3456cf14775962b360";

export const PAYMENT_METHODS = [
  { key: "gotyme", label: "GoTyme", qr: `${QR_BASE}/060aa1eac_GoTyme.JPG` },
  { key: "unionbank", label: "UnionBank", qr: `${QR_BASE}/3fb4a390b_UnionBank.JPG` },
  { key: "bpi", label: "BPI", qr: `${QR_BASE}/0ce76aa92_BPI.png` },
  { key: "gcash", label: "GCash", qr: `${QR_BASE}/9a086048a_GCash.JPG` },
  { key: "paypal", label: "PayPal", qr: `${QR_BASE}/26246dfbb_PayPal.JPG` },
  { key: "wise", label: "Wise", qr: `${QR_BASE}/d4b6d131b_Wise.png` },
];

export const paymentMethodLabel = (key) => PAYMENT_METHODS.find((m) => m.key === key)?.label || key || "—";