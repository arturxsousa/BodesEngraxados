"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { listarVeiculos } from "@/lib/api/veiculos";
import CategoryChart from "@/components/CategoryChart";
import RecentOrders from "@/components/RecentOrders";

export default function DashboardPage() {
  const { manutencoes } = useApp();
  const [totalVeiculos, setTotalVeiculos] = useState<number | null>(null);

  useEffect(() => {
    listarVeiculos()
      .then((v) => setTotalVeiculos(v.length))
      .catch(() => setTotalVeiculos(null));
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const doMes = manutencoes.filter((m) => {
    const parts = m.data.split("/");
    if (parts.length < 3) return false;
    return Number(parts[1]) === currentMonth && Number(parts[2]) === currentYear;
  });

  const stats = [
    { label: "Manutenções no mês",  value: String(doMes.length),       icon: "🔧" },
    { label: "Total de manutenções",value: String(manutencoes.length),  icon: "📋" },
    { label: "Veículos cadastrados", value: totalVeiculos !== null ? String(totalVeiculos) : "—", icon: "🚗" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b pb-4" style={{ borderColor: "#d9d0c0" }}>
        <h1 className="text-3xl font-bold tracking-wide uppercase" style={{ color: "var(--color-charcoal)" }}>
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-sm border-l-4 p-5 flex items-center gap-4"
            style={{ borderLeftColor: "var(--color-rust)", borderTopColor: "#e5e0d5", borderRightColor: "#e5e0d5", borderBottomColor: "#e5e0d5" }}
          >
            <span className="text-3xl">{stat.icon}</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-teal)" }}>
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--color-rust)" }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <CategoryChart />
        </div>
        <div className="lg:col-span-3">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
