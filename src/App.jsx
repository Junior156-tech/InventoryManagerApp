import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Download,
} from "lucide-react";

const currency = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" });

const sampleProducts = [
  { id: cryptoRandomId(), sku: "TV-55-SAM-4K", name: "TV Samsung 55\" 4K", category: "Electrónica", price: 35999, quantity: 8, minStock: 3, location: "A1", updatedAt: new Date().toISOString() },
  { id: cryptoRandomId(), sku: "PHN-A15-128", name: "Samsung A15 128GB", category: "Telefonía", price: 15990, quantity: 2, minStock: 5, location: "B3", updatedAt: new Date().toISOString() },
  { id: cryptoRandomId(), sku: "LAP-HP-15FQ", name: "HP 15-fq Core i5", category: "Computadores", price: 44999, quantity: 0, minStock: 2, location: "C2", updatedAt: new Date().toISOString() },
  { id: cryptoRandomId(), sku: "MOU-LOG-MX3", name: "Mouse Logitech MX Master 3", category: "Accesorios", price: 4990, quantity: 17, minStock: 5, location: "D1", updatedAt: new Date().toISOString() },
  { id: cryptoRandomId(), sku: "HDP-SSD-1TB", name: "SSD NVMe 1TB", category: "Almacenamiento", price: 8990, quantity: 6, minStock: 4, location: "C5", updatedAt: new Date().toISOString() },
  { id: cryptoRandomId(), sku: "HDP-SSD-2TB", name: "SSD NVMe 2TB", category: "Almacenamiento", price: 16990, quantity: 1, minStock: 3, location: "C6", updatedAt: new Date().toISOString() },
];

export default function InventoryManagerApp() {
  const [products, setProducts] = useState(sampleProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [sort, setSort] = useState({ by: "name", dir: "asc" });
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const metrics = useMemo(() => {
    const low = products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length;
    const out = products.filter(p => p.quantity <= 0).length;
    const total = products.length;
    const value = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    return { low, out, total, value };
  }, [products]);

  const categories = useMemo(() => ["Todas", ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    if (category !== "Todas") list = list.filter(p => p.category === category);
    if (status !== "Todos") list = list.filter(p => statusOf(p) === status);
    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.by) {
        case "price": return (a.price - b.price) * dir;
        case "quantity": return (a.quantity - b.quantity) * dir;
        default: return a.name.localeCompare(b.name) * dir;
      }
    });
    return list;
  }, [products, query, category, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => { if (page > pageCount) setPage(1); }, [pageCount]);
  const pageItems = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page, perPage]);

  function statusOf(p) {
    if (p.quantity <= 0) return "Agotado";
    if (p.quantity <= p.minStock) return "Bajo";
    return "OK";
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Package className="w-7 h-7 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Inventario</h1>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Exportar
            </button>
            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Nuevo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Metric Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Productos" value={metrics.total} icon={<Package />} accent="indigo" />
          <MetricCard label="En alerta" value={metrics.low} accent="amber" />
          <MetricCard label="Agotados" value={metrics.out} accent="rose" />
          <MetricCard label="Valor inventario" value={currency.format(metrics.value)} accent="green" />
        </section>

        {/* Search + Filters */}
        <section className="bg-white rounded-2xl shadow-sm border p-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por SKU, nombre, categoría…" className="w-full pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
              {["Todos", "OK", "Bajo", "Agotado"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </section>

        {/* Table */}
        <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <Th>SKU</Th>
                  <Th>Producto</Th>
                  <Th>Categoría</Th>
                  <Th className="text-right">Precio</Th>
                  <Th className="text-right">Cant.</Th>
                  <Th className="text-right">Min.</Th>
                  <Th className="text-center">Estado</Th>
                  <Th>Ubicación</Th>
                  <Th>Actualizado</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-neutral-500">Sin resultados</td>
                  </tr>
                )}
                {pageItems.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <Td className="font-mono text-xs">{p.sku}</Td>
                    <Td><div className="font-medium">{p.name}</div></Td>
                    <Td>{p.category}</Td>
                    <Td className="text-right">{currency.format(p.price)}</Td>
                    <Td className="text-right">{p.quantity}</Td>
                    <Td className="text-right">{p.minStock}</Td>
                    <Td className="text-center"><StatusBadge status={statusOf(p)} /></Td>
                    <Td>{p.location}</Td>
                    <Td>{new Date(p.updatedAt).toLocaleString("es-DO")}</Td>
                    <Td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <IconBtn><ArrowUp className="w-4 h-4" /></IconBtn>
                        <IconBtn><ArrowDown className="w-4 h-4" /></IconBtn>
                        <IconBtn><Edit2 className="w-4 h-4" /></IconBtn>
                        <IconBtn danger><Trash2 className="w-4 h-4" /></IconBtn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value, icon, accent }) {
  const colors = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    green: "bg-green-50 border-green-200 text-green-700",
  };
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-3 shadow-sm ${colors[accent]}`}>
      <div className="p-2 rounded-xl bg-white border">{icon}</div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

function Th({ children, className }) {
  return <th className={`px-4 py-3 font-semibold text-left ${className || ""}`}>{children}</th>;
}
function Td({ children, className }) {
  return <td className={`px-4 py-3 ${className || ""}`}>{children}</td>;
}

function StatusBadge({ status }) {
  const map = {
    OK: "bg-green-100 text-green-800",
    Bajo: "bg-yellow-100 text-yellow-800",
    Agotado: "bg-red-100 text-red-800",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}>{status}</span>;
}

function IconBtn({ children, danger }) {
  return (
    <button className={`p-1.5 rounded-lg border hover:bg-gray-100 ${danger ? "border-red-300 text-red-600 hover:bg-red-50" : ""}`}>
      {children}
    </button>
  );
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2);
}
