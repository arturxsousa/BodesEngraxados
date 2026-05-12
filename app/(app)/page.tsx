"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/api/profiles";
import { listarManutencoes } from "@/lib/api/manutencoes";
import { listarVeiculos, listarPlacasPorCpf } from "@/lib/api/veiculos";
import CategoryChart from "@/components/CategoryChart";
import RecentOrders from "@/components/RecentOrders";

export default function DashboardPage() {
  const [profileReady, setProfileReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [placas, setPlacas] = useState<string[]>([]);

  const [totalVeiculos, setTotalVeiculos] = useState<number | null>(null);
  const [totalManutencoes, setTotalManutencoes] = useState<number | null>(null);
  const [manutencoesDoMes, setManutencoesDoMes] = useState<number | null>(null);
  const [manutencoesProgramadas, setManutencoesProgramadas] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return;

      const profile = await getProfile(u.id);
      const admin = profile?.role === "admin";
      setIsAdmin(admin);

      const now = new Date();
      const ano = now.getFullYear();
      const mes = String(now.getMonth() + 1).padStart(2, "0");

      if (admin) {
        const [veiculos, lista] = await Promise.all([listarVeiculos(), listarManutencoes()]);
        setTotalVeiculos(veiculos.length);
        setTotalManutencoes(lista.length);
        setManutencoesDoMes(lista.filter((m) => m.data.startsWith(`${ano}-${mes}`)).length);
        setManutencoesProgramadas(lista.filter((m) => !!m.proxima_manutencao).length);
        setProfileReady(true);
      } else if (profile?.cpf) {
        const [userPlacas, lista] = await Promise.all([
          listarPlacasPorCpf(profile.cpf),
          listarManutencoes(),
        ]);
        const filtrada = lista.filter((m) => userPlacas.includes(m.placa));
        setPlacas(userPlacas);
        setTotalVeiculos(userPlacas.length);
        setTotalManutencoes(filtrada.length);
        setManutencoesDoMes(filtrada.filter((m) => m.data.startsWith(`${ano}-${mes}`)).length);
        setManutencoesProgramadas(filtrada.filter((m) => !!m.proxima_manutencao).length);
        setProfileReady(true);
      }
    }

    load().catch(() => setProfileReady(true));
  }, []);

  const stats = [
    {
      label: isAdmin ? "Manutenções no mês" : "Suas manutenções nesse mês",
      value: manutencoesDoMes !== null ? String(manutencoesDoMes) : "—",
      icon: "🔧",
    },
    {
      label: isAdmin ? "Total de manutenções" : "Todas as suas manutenções",
      value: totalManutencoes !== null ? String(totalManutencoes) : "—",
      icon: "📋",
    },
    {
      label: isAdmin ? "Manutenções programadas" : "Suas manutenções programadas",
      value: manutencoesProgramadas !== null ? String(manutencoesProgramadas) : "—",
      icon: "📅",
    },
    {
      label: "Veículos cadastrados",
      value: totalVeiculos !== null ? String(totalVeiculos) : "—",
      icon: "🚗",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b pb-4" style={{ borderColor: "#d9d0c0" }}>
        <h1 className="text-3xl font-bold tracking-wide uppercase" style={{ color: "var(--color-charcoal)" }}>
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {profileReady && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <CategoryChart placas={isAdmin ? undefined : placas} />
          </div>
          <div className="lg:col-span-3">
            <RecentOrders
              placas={isAdmin ? undefined : placas}
              titulo={isAdmin ? undefined : "Suas Últimas Manutenções"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
