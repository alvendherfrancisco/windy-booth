import { jsPDF } from "jspdf";

const LOGO_URL =
  "https://media.base44.com/images/public/6a60bb3456cf14775962b360/724a11589_windythepoohpost1.svg";

// Loads the Windy SVG logo and rasterizes it to a PNG data URL so jsPDF
// can embed it (jsPDF does not support SVG directly).
function loadLogoPng() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 200, 200);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = LOGO_URL;
  });
}

// Generates a one-page PDF receipt for an unlock-purchase approval.
// Returns a jsPDF document instance the caller can output("blob") and upload.
export async function generateReceiptPdf({ user, request, billingId }) {
  const doc = new jsPDF();

  // Logo — centered at the top
  try {
    const logoPng = await loadLogoPng();
    doc.addImage(logoPng, "PNG", 85, 15, 40, 40);
  } catch (_e) {
    // If the logo fails to load the receipt still renders without it.
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("windy the pooh", 105, 68, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(120);
  doc.text("Payment Receipt", 105, 78, { align: "center" });

  doc.setDrawColor(220);
  doc.line(20, 85, 190, 85);

  doc.setTextColor(0);
  doc.setFontSize(11);

  const planDesc =
    request.plan_type === "lifetime"
      ? "Lifetime Pass"
      : `Collection: ${request.collection || "—"}`;

  const rows = [
    ["Receipt ID:", billingId || `unlock-${request.id}`],
    ["Date:", new Date().toLocaleString()],
    ["Customer:", user?.full_name || "—"],
    ["Email:", user?.email || "—"],
    ["Plan:", planDesc],
    ["Amount:", `$${(request.amount || 0).toFixed(2)}`],
    ["Payment Method:", request.payment_method || "—"],
    ["Status:", "Approved"],
  ];

  let y = 100;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), 75, y);
    y += 10;
  });

  doc.setDrawColor(220);
  doc.line(20, y + 5, 190, y + 5);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("Thank you for your purchase! Your access has been activated.", 105, y + 15, { align: "center" });
  doc.text("windy the pooh — Capture memories, create forever.", 105, y + 22, { align: "center" });

  return doc;
}