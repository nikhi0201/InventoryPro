import React, { useEffect, useState } from "react";
import API from "../utils/api";

export default function Products() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stockLevel, setStockLevel] = useState("medium");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [showCards, setShowCards] = useState(false);

  const mapStock = (level) => {
    if (level === "low") return 10;
    if (level === "high") return 100;
    return 50;
  };

  async function load() {
    setLoading(true);
    try {
      const res = await API.get("/api/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
      // do NOT auto-show cards
    } catch (err) {
      console.error("Failed to load products", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please enter product name.");
    const numericPrice = price ? Number(price) : 0;
    if (price && isNaN(numericPrice)) return setError("Price must be a number.");
    const numericStock = mapStock(stockLevel);

    setAdding(true);
    try {
      const body = { name: name.trim(), price: numericPrice, stock: numericStock, level: stockLevel };
      const res = await API.post("/api/products", body);
      const created = res?.data;
      const newItem = created || { name: name.trim(), price: numericPrice, stock: numericStock, level: stockLevel, _id: `local-${Date.now()}` };

      // reveal cards column explicitly when the user adds
      setShowCards(true);

      // prepend and mark as newlyCreated for animation
      setProducts(prev => [{ ...newItem, newlyCreated: true }, ...prev]);

      setName(""); setPrice(""); setStockLevel("medium");
      if (window.dashboardRefresh) window.dashboardRefresh();

      setTimeout(() => {
        setProducts(prev => prev.map(p => ({ ...p, newlyCreated: false })));
      }, 1100);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.msg || "Failed to add product");
    } finally { setAdding(false); }
  }

  return (
    <div className="page-grid"> {/* custom grid - CSS below */}
      {/* Left column: form - same width as login */}
      <div className="form-column">
        <div className="form-card beast-card p-6">
          <h3 className="text-lg font-semibold mb-3">Add product</h3>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Product name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/15 text-slate-100" placeholder="e.g. Apple iPhone" />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-1 block">Price</label>
              <input value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/15 text-slate-100" placeholder="0" />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-1 block">Stock level</label>
              <select value={stockLevel} onChange={e => setStockLevel(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/15 text-slate-100">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {error && <div className="text-sm text-rose-400">{error}</div>}

            <div className="flex gap-3">
              <button type="submit" disabled={adding} className="flex-1 py-3 rounded-md bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-semibold">
                {adding ? "Adding..." : "Add product"}
              </button>
              <button type="button" onClick={() => { setName(""); setPrice(""); setStockLevel("medium"); setError(""); }} className="px-4 py-3 rounded-md border border-white/10 text-sm">
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right column: cards - same width as form so they appear beside it */}
      {showCards && (
        <div className="cards-column">
          <div className="beast-card p-6">
            <h3 className="text-lg font-semibold mb-3">Product cards</h3>
            <div className="flex flex-col gap-4">
              {products.map(p => (
                <div key={p._id || p.id} className={`p-4 rounded-md bg-white/3 product-card ${p.newlyCreated ? "animate-create-card" : ""}`}>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-slate-300 mt-1">Price: ₹{p.price ?? 0}</div>
                  <div className="text-xs text-slate-400 mt-2">Stock: <span className="font-semibold">{p.stock ?? 0}</span></div>
                  <div className="text-xs mt-2">
                    Level: <span className="px-2 py-1 rounded text-xs" style={{ background: p.level === "low" ? "rgba(245,158,11,0.12)" : p.level === "high" ? "rgba(251,113,133,0.08)" : "rgba(56,189,248,0.08)" }}>
                      {p.level ?? "medium"}
                    </span>
                  </div>
                </div>
              ))}
              {products.length === 0 && <div className="text-slate-400">No products yet (cards appear after Add).</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
