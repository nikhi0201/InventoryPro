import React, { useEffect, useState } from "react";
import API from "../utils/api";

export default function Suppliers() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [showCards, setShowCards] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await API.get("/api/suppliers");
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setList([]);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please enter supplier name.");
    const numericAge = age ? Number(age) : undefined;
    if (age && (isNaN(numericAge) || numericAge < 0)) return setError("Please enter a valid age.");
    setAdding(true);
    try {
      const body = { name: name.trim(), age: numericAge, address, phone: contact, contactEmail: contact };
      const res = await API.post("/api/suppliers", body);
      const created = res?.data;
      const newItem = created || { name, age: numericAge, address, contact, _id: `local-${Date.now()}` };

      // reveal cards column explicitly
      setShowCards(true);

      setList(prev => [{ ...newItem, newlyCreated: true }, ...prev]);
      setName(""); setAge(""); setAddress(""); setContact("");
      if (window.dashboardRefresh) window.dashboardRefresh();
      setTimeout(() => setList(prev => prev.map(x => ({ ...x, newlyCreated: false }))), 1100);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.msg || "Failed to add supplier");
    } finally { setAdding(false); }
  }

  return (
    <div className="page-grid">
      <div className="form-column">
        <div className="form-card beast-card p-6">
          <h3 className="text-lg font-semibold mb-3">Add supplier</h3>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Supplier name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/15 text-slate-100" />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-1 block">Age</label>
              <input value={age} onChange={e => setAge(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/15 text-slate-100" />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-1 block">Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/15 text-slate-100" />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-1 block">Contact</label>
              <input value={contact} onChange={e => setContact(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/15 text-slate-100" />
            </div>

            {error && <div className="text-sm text-rose-400">{error}</div>}

            <div className="flex gap-3">
              <button type="submit" disabled={adding} className="flex-1 py-3 rounded-md bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-semibold">{adding ? "Adding..." : "Add supplier"}</button>
              <button type="button" onClick={() => { setName(""); setAge(""); setAddress(""); setContact(""); setError(""); }} className="px-4 py-3 rounded-md border border-white/10 text-sm">Clear</button>
            </div>
          </form>
        </div>
      </div>

      {showCards && (
        <div className="cards-column">
          <div className="beast-card p-6">
            <h3 className="text-lg font-semibold mb-3">Supplier cards</h3>
            <div className="flex flex-col gap-4">
              {list.map(s => (
                <div key={s._id || s.id} className={`p-4 rounded-md bg-white/3 supplier-card ${s.newlyCreated ? "animate-create-card" : ""}`}>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-slate-300 mt-1">Age: {s.age ?? '—'}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.address}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.phone || s.contactEmail || s.contact || ''}</div>
                </div>
              ))}
              {list.length === 0 && <div className="text-slate-400">No suppliers yet (cards appear after Add).</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
