// Manual payment methods — each has a QR code the user scans to pay directly.
// Real QR images can be swapped in later; a placeholder is used for now.
const PLACEHOLDER_QR = "https://media.base44.com/images/public/6a60bb3456cf14775962b360/5f7ad4e4a_generated_image.png";

export const PAYMENT_METHODS = [
  { key: "gotyme", label: "GoTyme", qr: PLACEHOLDER_QR },
  { key: "unionbank", label: "UnionBank", qr: PLACEHOLDER_QR },
  { key: "bpi", label: "BPI", qr: PLACEHOLDER_QR },
  { key: "gcash", label: "GCash", qr: PLACEHOLDER_QR },
  { key: "paypal", label: "PayPal", qr: PLACEHOLDER_QR },
  { key: "wise", label: "Wise", qr: PLACEHOLDER_QR },
  { key: "qrph", label: "QR PH", qr: PLACEHOLDER_QR },
];

export const paymentMethodLabel = (key) => PAYMENT_METHODS.find((m) => m.key === key)?.label || key || "—";