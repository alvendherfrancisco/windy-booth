import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// J&T-style cascading address picker: Region -> City/Municipality (carries
// province) -> Barangay. Options come from the phLocations backend function
// (PSGC). `value` is the shipping object; `onChange` returns a new copy with
// region/regionCode/province/city/cityCode/barangay/barangayCode set.
export default function LocationSelects({ value, onChange }) {
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState("");

  const unwrap = (r) => (Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : []);

  useEffect(() => {
    setLoading("regions");
    base44.functions.invoke("phLocations", { level: "regions" })
      .then((r) => setRegions(unwrap(r)))
      .finally(() => setLoading(""));
  }, []);

  useEffect(() => {
    if (!value.regionCode) { setCities([]); return; }
    setBarangays([]);
    setLoading("cities");
    base44.functions.invoke("phLocations", { level: "cities", code: value.regionCode })
      .then((r) => setCities(unwrap(r)))
      .finally(() => setLoading(""));
  }, [value.regionCode]);

  useEffect(() => {
    if (!value.cityCode) { setBarangays([]); return; }
    setLoading("barangays");
    base44.functions.invoke("phLocations", { level: "barangays", code: value.cityCode })
      .then((r) => setBarangays(unwrap(r)))
      .finally(() => setLoading(""));
  }, [value.cityCode]);

  const pickRegion = (code) => {
    const r = regions.find((x) => x.code === code);
    onChange({ ...value, region: r?.name || "", regionCode: code, province: "", city: "", cityCode: "", barangay: "", barangayCode: "" });
  };
  const pickCity = (code) => {
    const c = cities.find((x) => x.code === code);
    onChange({ ...value, city: c?.name || "", cityCode: code, province: c?.province || "", barangay: "", barangayCode: "" });
  };
  const pickBarangay = (code) => {
    const b = barangays.find((x) => x.code === code);
    onChange({ ...value, barangay: b?.name || "", barangayCode: code });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Field label="Region" loading={loading === "regions"}>
        <select value={value.regionCode || ""} onChange={(e) => pickRegion(e.target.value)} className="input">
          <option value="">Select region…</option>
          {regions.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
        </select>
      </Field>
      <Field label="City / Municipality" loading={loading === "cities"}>
        <select value={value.cityCode || ""} onChange={(e) => pickCity(e.target.value)} disabled={!value.regionCode} className="input disabled:bg-[#F5F0EA]">
          <option value="">Select city…</option>
          {cities.map((c) => (
            <option key={c.code} value={c.code}>{c.province ? `${c.province} - ${c.name}` : c.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Barangay" loading={loading === "barangays"}>
        <select value={value.barangayCode || ""} onChange={(e) => pickBarangay(e.target.value)} disabled={!value.cityCode} className="input disabled:bg-[#F5F0EA]">
          <option value="">Select barangay…</option>
          {barangays.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>
      </Field>
    </div>
  );
}

function Field({ label, loading, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#8A8580]">
        {label} {loading && <span className="text-[10px] font-medium text-[#8A8580]">loading…</span>}
      </span>
      {children}
    </label>
  );
}