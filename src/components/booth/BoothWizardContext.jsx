import React, { createContext, useContext, useState } from "react";

const Ctx = createContext(null);

export function BoothWizardProvider({ children }) {
  const [step, setStep] = useState(1);
  const value = {
    step,
    setStep,
    goBack: () => setStep(s => Math.max(1, s - 1)),
    reset: () => setStep(1),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBoothWizard() {
  const ctx = useContext(Ctx);
  return ctx || { step: 1, setStep: () => {}, goBack: () => {}, reset: () => {} };
}