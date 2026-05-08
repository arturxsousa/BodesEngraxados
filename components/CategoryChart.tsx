"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = [
  "var(--color-rust)",
  "var(--color-teal)",
  "#8b6914",
  "#6b4c9a",
  "#1a6eb5",
  "#2d7a2d",
];

const TABS = ["1 mês", "3 meses", "6 meses"] as const;

// Placeholder — substituir por dados reais da API
const mockData: Record<typeof TABS[number], { categoria: string; total: number }[]> = {
  "1 mês": [
    { categoria: "Revisão", total: 8 },
    { categoria: "Freios", total: 5 },
    { categoria: "Motor", total: 3 },
    { categoria: "Suspensão", total: 4 },
    { categoria: "Elétrica", total: 2 },
    { categoria: "Outros", total: 1 },
  ],
  "3 meses": [
    { categoria: "Revisão", total: 22 },
    { categoria: "Freios", total: 14 },
    { categoria: "Motor", total: 9 },
    { categoria: "Suspensão", total: 11 },
    { categoria: "Elétrica", total: 6 },
    { categoria: "Outros", total: 4 },
  ],
  "6 meses": [
    { categoria: "Revisão", total: 45 },
    { categoria: "Freios", total: 28 },
    { categoria: "Motor", total: 19 },
    { categoria: "Suspensão", total: 23 },
    { categoria: "Elétrica", total: 12 },
    { categoria: "Outros", total: 9 },
  ],
};

export default function CategoryChart() {
  const [active, setActive] = useState<typeof TABS[number]>("1 mês");

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

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={mockData[active]}
            dataKey="total"
            nameKey="categoria"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={45}
            paddingAngle={3}
          >
            {mockData[active].map((_, i) => (
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
    </div>
  );
}
