"use client";

import { useEffect, useState } from "react";
import { listarManutencoes, formatarData, type Manutencao } from "@/lib/api/manutencoes";

interface Props {
  placas?: string[];
  titulo?: string;
}

export default function RecentOrders({ placas, titulo }: Props = {}) {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarManutencoes()
      .then((lista) => {
        const filtrada = placas ? lista.filter((m) => placas.includes(m.placa)) : lista;
        setManutencoes(filtrada.slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, [JSON.stringify(placas)]);

  const heading = titulo ?? `Últimas ${manutencoes.length > 0 ? Math.min(manutencoes.length, 10) : ""} Manutenções`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full">
      <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-teal)" }}>
        {heading}
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-gray-400">Carregando...</div>
      ) : manutencoes.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-gray-400">Nenhuma manutenção cadastrada.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#e5e0d5" }}>
                {["ID", "Data", "Placa", "Categoria", "Descrição"].map((col) => (
                  <th
                    key={col}
                    className="text-left pb-2 pr-4 text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
                    style={{ color: "var(--color-charcoal)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {manutencoes.map((m, i) => (
                <tr
                  key={m.id}
                  className="border-b transition-colors hover:bg-orange-50"
                  style={{ borderColor: i === manutencoes.length - 1 ? "transparent" : "#f0ebe0" }}
                >
                  <td className="py-2 pr-4 font-mono font-semibold text-xs" style={{ color: "var(--color-rust)" }}>
                    #{m.id}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-gray-500 whitespace-nowrap">{formatarData(m.data)}</td>
                  <td className="py-2 pr-4 font-mono text-xs font-medium text-gray-700 whitespace-nowrap">{m.placa}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#f0ebe0", color: "var(--color-teal)" }}>
                      {m.categoria}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500 max-w-[200px] truncate">{m.descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
