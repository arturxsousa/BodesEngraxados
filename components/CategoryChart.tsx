"use client";

import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { listarManutencoes, type Manutencao } from "@/lib/api/manutencoes";

const COLORS = [
  "var(--color-rust)",
  "var(--color-teal)",
  "#8b6914",
  "#6b4c9a",
  "#1a6eb5",
  "#2d7a2d",
  "#c2410c",
];

const TABS = ["1 mês", "3 meses", "6 meses"] as const;

function filtrarPorPeriodo(lista: Manutencao[], tab: typeof TABS[number]): Manutencao[] {
  const meses = tab === "1 mês" ? 1 : tab === "3 meses" ? 3 : 6;
  const limite = new Date();
  limite.setMonth(limite.getMonth() - meses);
  return lista.filter((m) => new Date(m.data) >= limite);
}

function agruparPorCategoria(lista: Manutencao[]) {
  const mapa: Record<string, number> = {};
  for (const m of lista) {
    mapa[m.categoria] = (mapa[m.categoria] ?? 0) + 1;
  }
  return Object.entries(mapa)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);
}

export default function CategoryChart() {
  const [active, setActive] = useState<typeof TABS[number]>("1 mês");
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarManutencoes()
      .then(setManutencoes)
      .finally(() => setLoading(false));
  }, []);

  const data = useMemo(
    () => agruparPorCategoria(filtrarPorPeriodo(manutencoes, active)),
    [manutencoes, active]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-teal)" }}>
          Manutenções por Categoria
        </h2>
        <div className="flex rounded-md overflow-hidden border" style={{ borderColor: "#e5e0d5" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className="px-3 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: active === tab ? "var(--color-rust)" : "transparent",
                color: active === tab ? "#fff" : "var(--color-charcoal)",
                borderRight: tab !== "6 meses" ? "1px solid #e5e0d5" : undefined,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">Carregando...</div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">
          Nenhuma manutenção no período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="categoria"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#252525",
                border: "1px solid #383838",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [`${value} OS`, name]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ fontSize: 12, color: "#555" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
