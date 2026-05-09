"use client";

import { useState, useEffect } from "react";
import {
  buscarManutencoes,
  formatarData,
  type Manutencao,
  type FiltroBusca,
} from "@/lib/api/manutencoes";
import { listarVeiculos } from "@/lib/api/veiculos";

const CATEGORIAS = ["Revisão", "Freios", "Motor", "Suspensão", "Elétrica", "Funilaria", "Outros"];

const emptyFiltros: FiltroBusca = {
  dataInicio: "",
  dataFim: "",
  placa: "",
  proprietario: "",
  categoria: "",
};

export default function BuscaPage() {
  const [filtros, setFiltros] = useState<FiltroBusca>(emptyFiltros);
  const [placas, setPlacas] = useState<string[]>([]);
  const [resultados, setResultados] = useState<Manutencao[] | null>(null);
  const [pesquisando, setPesquisando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarVeiculos()
      .then((v) => setPlacas(v.map((x) => x.placa)))
      .catch(() => {});
  }, []);

  const field = (key: keyof FiltroBusca, value: string) =>
    setFiltros((prev) => ({ ...prev, [key]: value }));

  async function handlePesquisar(e: React.FormEvent) {
    e.preventDefault();
    setPesquisando(true);
    setErro(null);
    try {
      const data = await buscarManutencoes(filtros);
      setResultados(data);
    } catch {
      setErro("Não foi possível realizar a busca.");
    } finally {
      setPesquisando(false);
    }
  }

  function handleLimpar() {
    setFiltros(emptyFiltros);
    setResultados(null);
    setErro(null);
  }

  const temFiltro = Object.values(filtros).some((v) => v !== "");

  return (
    <div className="space-y-6">
      <div className="border-b pb-4" style={{ borderColor: "#d9d0c0" }}>
        <h1 className="text-3xl font-bold tracking-wide uppercase" style={{ color: "var(--color-charcoal)" }}>
          Buscar Manutenção
        </h1>
      </div>

      {/* Painel de filtros */}
      <form onSubmit={handlePesquisar} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
              Data início
            </label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => field("dataInicio", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400"
              style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
              Data fim
            </label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => field("dataFim", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400"
              style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
              Categoria
            </label>
            <select
              value={filtros.categoria}
              onChange={(e) => field("categoria", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400"
              style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
            >
              <option value="">Todas</option>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
              Placa
            </label>
            <select
              value={filtros.placa}
              onChange={(e) => field("placa", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400"
              style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
            >
              <option value="">Todas</option>
              {placas.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
              Proprietário
            </label>
            <input
              type="text"
              placeholder="Nome do proprietário"
              value={filtros.proprietario}
              onChange={(e) => field("proprietario", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400"
              style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={pesquisando}
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "var(--color-rust)" }}
          >
            {pesquisando ? "Pesquisando..." : "Pesquisar"}
          </button>
          {(temFiltro || resultados !== null) && (
            <button
              type="button"
              onClick={handleLimpar}
              className="px-6 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-gray-50"
              style={{ borderColor: "#d9d0c0", color: "var(--color-charcoal)" }}
            >
              Limpar
            </button>
          )}
        </div>
      </form>

      {/* Erro */}
      {erro && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm" style={{ backgroundColor: "#fff5f5", borderColor: "#fca5a5", color: "#b91c1c" }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {erro}
        </div>
      )}

      {/* Resultados */}
      {resultados !== null && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "#e5e0d5" }}>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-teal)" }}>
              Resultados
            </span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "var(--color-rust)" }}>
              {resultados.length}
            </span>
          </div>

          {resultados.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">Nenhuma manutenção encontrada para os filtros aplicados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "#e5e0d5" }}>
                  {["ID", "Categoria", "Data", "Placa", "KM", "Descrição", "Peças Empregadas", "Observações"].map((col) => (
                    <th key={col} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--color-charcoal)" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultados.map((m, i) => (
                  <tr key={m.id} className="border-b transition-colors hover:bg-orange-50" style={{ borderColor: i === resultados.length - 1 ? "transparent" : "#f0ebe0" }}>
                    <td className="px-4 py-3 font-mono font-semibold text-xs whitespace-nowrap" style={{ color: "var(--color-rust)" }}>#{m.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#f0ebe0", color: "var(--color-teal)" }}>{m.categoria}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{formatarData(m.data)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700 whitespace-nowrap">{m.placa}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{m.km} km</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">{m.descricao}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{m.pecas || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{m.observacoes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
