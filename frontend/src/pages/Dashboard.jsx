import React, { useEffect, useMemo, useState } from "react";
import API from "../utils/api";

/* load products & suppliers */
function useCounts() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [pRes, sRes] = await Promise.allSettled([API.get("/api/products"), API.get("/api/suppliers")]);
        if (!mounted) return;
        setProducts(pRes.status === "fulfilled" && Array.isArray(pRes.value.data) ? pRes.value.data : []);
        setSuppliers(sRes.status === "fulfilled" && Array.isArray(sRes.value.data) ? sRes.value.data : []);
      } catch (err) {
        console.error(err);
        if (mounted) { setProducts([]); setSuppliers([]); }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return { products, suppliers, loading };
}

/* derive low/medium/high counts */
function computeLevels(products) {
  const counts = { low: 0, medium: 0, high: 0 };
  for (const p of products) {
    const lvl = (p.level || p.stockLevel || "").toString().toLowerCase();
    if (lvl === "low") counts.low++;
    else if (lvl === "high") counts.high++;
    else if (lvl === "medium") counts.medium++;
    else {
      const n = Number(p.stock ?? p.quantity ?? p.qty ?? 0);
      if (!isNaN(n)) {
        if (n <= 20) counts.low++;
        else if (n >= 80) counts.high++;
        else counts.medium++;
      } else counts.medium++;
    }
  }
  return counts;
}

/* Donut chart using stroked circles */
function Donut({ data, size = 200, thickness = 28 }) {
  const total = data.low + data.medium + data.high || 0;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const lowLen = C * (total === 0 ? 0 : data.low / total);
  const medLen = C * (total === 0 ? 0 : data.medium / total);
  const highLen = C * (total === 0 ? 0 : data.high / total);

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg" aria-hidden>
        <g transform={`translate(${size/2}, ${size/2}) rotate(-90)`}>
          <circle r={r} cx="0" cy="0" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={thickness} />
          <circle r={r} cx="0" cy="0" fill="none" stroke="#f59e0b" strokeWidth={thickness}
            strokeDasharray={`${lowLen} ${C - lowLen}`} strokeDashoffset={0} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 800ms cubic-bezier(.2,.9,.25,1)" }} />
          <circle r={r} cx="0" cy="0" fill="none" stroke="#60a5fa" strokeWidth={thickness}
            strokeDasharray={`${medLen} ${C - medLen}`} strokeDashoffset={-lowLen} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 800ms cubic-bezier(.2,.9,.25,1) 60ms, stroke-dashoffset 800ms 60ms" }} />
          <circle r={r} cx="0" cy="0" fill="none" stroke="#fb7185" strokeWidth={thickness}
            strokeDasharray={`${highLen} ${C - highLen}`} strokeDashoffset={-(lowLen + medLen)} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 800ms cubic-bezier(.2,.9,.25,1) 120ms, stroke-dashoffset 800ms 120ms" }} />
        </g>
      </svg>

      <div className="donut-center">
        <div className="text-xs text-slate-300">Total</div>
        <div className="text-2xl font-semibold">{total}</div>
      </div>
    </div>
  );
}

/* Simple bar chart (Products vs Suppliers) */
function SimpleBar({ items = [{ label: "Products", value: 0 }, { label: "Suppliers", value: 0 }], height = 180 }) {
  const max = Math.max(...items.map(i => i.value), 1);
  const width = 80;
  const gap = 28;
  const totalW = items.length * (width + gap);
  return (
    <div className="simple-bar-wrap">
      <svg width={Math.max(totalW, 240)} height={height} viewBox={`0 0 ${Math.max(totalW, 240)} ${height}`}>
        <line x1="0" x2={Math.max(totalW, 240)} y1={height - 28} y2={height - 28} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {items.map((it, idx) => {
          const x = idx * (width + gap) + 12;
          const barH = Math.round(((height - 48) * it.value) / max);
          const y = height - 28 - barH;
          const color = idx === 0 ? "#60a5fa" : "#34d399";
          return (
            <g key={it.label}>
              <rect x={x} y={y} width={width} height={barH} rx="8" fill={color} className="bar-anim" />
              <text x={x + width/2} y={height - 6} fontSize="12" textAnchor="middle" fill="#e6eef8">{it.label}</text>
              <text x={x + width/2} y={y - 6} fontSize="12" textAnchor="middle" fill="#e6eef8">{it.value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const { products, suppliers, loading } = useCounts();
  const levels = useMemo(() => computeLevels(products), [products]);

  const barItems = useMemo(() => ([
    { label: "Products", value: products.length || 0 },
    { label: "Suppliers", value: suppliers.length || 0 }
  ]), [products, suppliers]);

  return (
    <div className="dashboard-root">

      {/* TOP ROW — ALWAYS TWO COLUMNS: Bar (left) | Pie (right) */}
      <div className="top-grid">
        <div className="beast-card p-6">
          <h3 className="text-lg font-semibold mb-3">Products vs Suppliers</h3>
          <div className="top-content">
            <SimpleBar items={barItems} />
            <div className="ml-6 text-sm text-slate-400">
              <div>Products: <strong>{products.length}</strong></div>
              <div>Suppliers: <strong>{suppliers.length}</strong></div>
            </div>
          </div>
        </div>

        <div className="beast-card p-6">
          <h3 className="text-lg font-semibold mb-3">Stock distribution</h3>
          <div className="top-content">
            <Donut data={levels} size={220} thickness={32} />
            <div className="ml-6 legend-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="legend-sample low" />
                <div className="text-sm">Low <strong className="ml-2">{levels.low}</strong></div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="legend-sample medium" />
                <div className="text-sm">Medium <strong className="ml-2">{levels.medium}</strong></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="legend-sample high" />
                <div className="text-sm">High <strong className="ml-2">{levels.high}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW — ALWAYS TWO COLUMNS: Products (left) | Suppliers (right) */}
      <div className="bottom-grid">
        <div className="beast-card p-6">
          <h4 className="text-lg font-semibold mb-4">Products</h4>
          {loading ? <div className="text-slate-400">Loading...</div> : (
            products.length === 0 ? <div className="text-slate-400">No products yet</div> : (
              <div className="grid grid-cols-1 gap-3">
                {products.map(p => (
                  <div key={p._id || p.id} className="p-3 rounded-md bg-white/3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-slate-300">Price: {p.price ?? "—"}</div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div className="beast-card p-6">
          <h4 className="text-lg font-semibold mb-4">Suppliers</h4>
          {loading ? <div className="text-slate-400">Loading...</div> : (
            suppliers.length === 0 ? <div className="text-slate-400">No suppliers yet</div> : (
              <div className="grid grid-cols-1 gap-3">
                {suppliers.map(s => (
                  <div key={s._id || s.id} className="p-3 rounded-md bg-white/3">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-slate-300">{s.address || "—"}</div>
                    <div className="text-xs text-slate-400">{s.phone || s.contactEmail || s.contact || "—"}</div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

    </div>
  );
}
