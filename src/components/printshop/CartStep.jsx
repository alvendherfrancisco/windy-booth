import React from "react";

export default function CartStep({ bundle, paper, selectedCount, shipping, onCheckout, onBack }) {
  const valid = selectedCount === bundle.strips;
  const subtotal = bundle.price;
  const total = shipping ? subtotal + (shipping.cost || 0) : subtotal;
  return (
    <div className="rounded-[18px] border border-[#E8E2D8] bg-white p-6">
      <h2 className="font-heading text-xl font-extrabold text-[#2D2D2D]">Your cart</h2>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#5C5953]">{bundle.id} Bundle ({bundle.strips} strips)</span>
          <b className="text-[#2D2D2D]">₱{bundle.price}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5C5953]">Paper type</span>
          <b className="capitalize text-[#2D2D2D]">{paper}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5C5953]">Strips selected</span>
          <b className="text-[#4F46E5]">{selectedCount} / {bundle.strips}</b>
        </div>
      </div>
      <div className="mt-4 space-y-2 border-t border-[#E8E2D8] pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#5C5953]">Subtotal</span>
          <span className="text-[#2D2D2D]">₱{subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5C5953]">Shipping</span>
          <span className="text-[#2D2D2D]">{shipping ? (shipping.free ? "Free" : `₱${shipping.cost}`) : "Calculated at checkout"}</span>
        </div>
        <div className="flex justify-between text-base">
          <b className="text-[#2D2D2D]">Total</b>
          <b className="text-[#2D2D2D]">₱{total}</b>
        </div>
      </div>
      <p className="mt-3 text-xs text-[#8A8580]">Free shipping on orders ₱999+.</p>
      {!valid && (
        <p className="mt-3 rounded-lg bg-[#FDE8E4] px-3 py-2 text-xs font-bold text-[#DC3522]">
          Select {bundle.strips - selectedCount} more strip(s) to complete this {bundle.id} Bundle.
        </p>
      )}
      <div className="mt-5 flex gap-3">
        <button
          onClick={onBack}
          className="rounded-full border border-[#E8E2D8] px-5 py-3 text-sm font-bold text-[#5C5953] transition hover:border-[#4F46E5] hover:text-[#4F46E5]"
        >
          Back
        </button>
        <button
          disabled={!valid}
          onClick={onCheckout}
          className="flex-1 rounded-full bg-[#DC3522] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B82E1F] disabled:bg-[#E8E2D8] disabled:text-[#8A8580]"
        >
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}