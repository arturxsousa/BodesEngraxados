"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  listarManutencoes,
  criarManutencao,
  atualizarManutencao,
  deletarManutencao,
  formatarData,
  type Manutencao,
} from "@/lib/api/manutencoes";
import { listarVeiculos, listarPlacasPorCpf } from "@/lib/api/veiculos";
import ConfirmDialog from "@/components/ConfirmDialog";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/api/profiles";

const CATEGORIAS = ["Revisão", "Freios", "Motor", "Suspensão", "Elétrica", "Funilaria", "Outros"];

const emptyForm = {
  categoria: CATEGORIAS[0],
  data: "",
  placa: "",
  km: "",
  descricao: "",
  pecas: "",
  observacoes: "",
  proxima_manutencao: "",
};

function ManutencoesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filtroParam = searchParams.get("filtro") ?? "";

  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [placas, setPlacas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [periodica, setPeriodica] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [placasUsuario, setPlacasUsuario] = useState<string[] | null>(null);

  const now = new Date();
  const anoMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const manutencoesFiltradas = manutencoes
    .filter((m) => isAdmin || placasUsuario === null || placasUsuario.includes(m.placa))
    .filter((m) => {
      if (filtroParam === "programadas") return !!m.proxima_manutencao;
      if (filtroParam === "mes") return m.data.startsWith(anoMes);
      return true;
    });

  const labelFiltro: Record<string, string> = {
    programadas: "Manutenções Programadas",
    mes: "Manutenções do Mês",
  };

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const { data } = await supabase.auth.getUser();
      const profile = data.user ? await getProfile(data.user.id) : null;
      const admin = profile?.role === "admin";
      setIsAdmin(admin);
      if (!admin && profile?.cpf) {
        const userPlacas = await listarPlacasPorCpf(profile.cpf);
        setPlacasUsuario(userPlacas);
        const [lista, veiculos] = await Promise.all([listarManutencoes(), listarVeiculos()]);
        setManutencoes(lista);
        setPlacas(veiculos.filter((v) => userPlacas.includes(v.placa)).map((v) => v.placa));
      } else {
        const [lista, veiculos] = await Promise.all([listarManutencoes(), listarVeiculos()]);
        setManutencoes(lista);
        setPlacas(veiculos.map((v) => v.placa));
        setPlacasUsuario(null);
      }
    } catch {
      setErro("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setPeriodica(false);
    setModalOpen(true);
  }

  function openEdit(m: Manutencao) {
    setEditingId(m.id!);
    setForm({
      categoria: m.categoria,
      data: m.data,
      placa: m.placa,
      km: m.km,
      descricao: m.descricao,
      pecas: m.pecas ?? "",
      observacoes: m.observacoes ?? "",
      proxima_manutencao: m.proxima_manutencao ?? "",
    });
    setPeriodica(!!m.proxima_manutencao);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setPeriodica(false);
  }

  async function handleDelete() {
    if (confirmId === null) return;
    try {
      await deletarManutencao(confirmId);
      setManutencoes((prev) => prev.filter((m) => m.id !== confirmId));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao deletar manutenção");
    } finally {
      setConfirmId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      const payload = {
        ...form,
        proxima_manutencao: periodica && form.proxima_manutencao ? form.proxima_manutencao : undefined,
      };
      if (editingId !== null) {
        const atualizada = await atualizarManutencao(editingId, payload);
        setManutencoes((prev) => prev.map((m) => m.id === editingId ? atualizada : m));
      } else {
        const nova = await criarManutencao(payload);
        setManutencoes((prev) => [nova, ...prev]);
      }
      closeModal();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao salvar manutenção");
    } finally {
      setSalvando(false);
    }
  }

  const field = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "#d9d0c0" }}>
        <h1 className="text-3xl font-bold tracking-wide uppercase" style={{ color: "var(--color-charcoal)" }}>
          Manutenções
        </h1>
        {isAdmin && (
          <div className="flex items-center gap-3">
            {!loading && placas.length === 0 && (
              <span className="text-xs text-gray-400 italic">Cadastre um veículo antes de registrar manutenções</span>
            )}
            <button
              onClick={openNew}
              disabled={placas.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--color-rust)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Manutenção
            </button>
          </div>
        )}
      </div>

      {filtroParam && labelFiltro[filtroParam] && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm" style={{ backgroundColor: "#f0ebe0", borderColor: "#d9d0c0" }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--color-teal)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <span className="font-semibold text-xs uppercase tracking-widest" style={{ color: "var(--color-teal)" }}>
            Filtro: {labelFiltro[filtroParam]}
          </span>
          <button
            onClick={() => router.push("/manutencoes")}
            className="ml-auto text-xs underline font-medium"
            style={{ color: "var(--color-rust)" }}
          >
            Limpar filtro
          </button>
        </div>
      )}

      {erro && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm" style={{ backgroundColor: "#fff5f5", borderColor: "#fca5a5", color: "#b91c1c" }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {erro}
          <button onClick={carregar} className="ml-auto underline font-medium">Tentar novamente</button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-16 text-sm text-gray-400">Carregando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#e5e0d5" }}>
                {[...["ID", "Categoria", "Data", "Placa", "KM", "Descrição", "Peças Empregadas", "Observações", "Próxima Manutenção"], ...(isAdmin ? [""] : [])].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--color-charcoal)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {manutencoesFiltradas.map((m, i) => (
                <tr key={m.id} className="border-b transition-colors hover:bg-orange-50" style={{ borderColor: i === manutencoesFiltradas.length - 1 ? "transparent" : "#f0ebe0" }}>
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
                  <td className="px-4 py-3 whitespace-nowrap">
                    {m.proxima_manutencao ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#fef9c3", color: "#854d0e" }}>
                        {formatarData(m.proxima_manutencao)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-md text-gray-400 transition-colors hover:text-blue-600 hover:bg-blue-50" aria-label="Editar manutenção">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                          </svg>
                        </button>
                        <button onClick={() => setConfirmId(m.id!)} className="p-1.5 rounded-md text-gray-400 transition-colors hover:text-red-600 hover:bg-red-50" aria-label="Deletar manutenção">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !erro && manutencoesFiltradas.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">
            {filtroParam ? "Nenhuma manutenção encontrada para este filtro." : "Nenhuma manutenção cadastrada."}
          </p>
        )}
      </div>

      {confirmId !== null && (
        <ConfirmDialog
          message="Tem certeza que deseja deletar esta manutenção? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10" style={{ borderColor: "#e5e0d5" }}>
              <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: "var(--color-charcoal)" }}>
                {editingId ? "Editar Manutenção" : "Nova Manutenção"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>Categoria</label>
                <select value={form.categoria} onChange={(e) => field("categoria", e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400" style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}>
                  {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>Data</label>
                  <input type="date" required value={form.data} onChange={(e) => field("data", e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400" style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>Placa</label>
                  <select required value={form.placa} onChange={(e) => field("placa", e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400" style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}>
                    <option value="">Selecione uma placa</option>
                    {placas.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>KM</label>
                <input type="text" required placeholder="52.300" value={form.km} onChange={(e) => field("km", e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400" style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }} />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>Descrição</label>
                <input type="text" required placeholder="Descreva o serviço realizado" value={form.descricao} onChange={(e) => field("descricao", e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400" style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }} />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>Peças Empregadas</label>
                <textarea required rows={2} placeholder="Ex: Óleo 5W30, Filtro de ar..." value={form.pecas} onChange={(e) => field("pecas", e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400 resize-none" style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }} />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>Observações</label>
                <textarea rows={2} placeholder="Observações adicionais..." value={form.observacoes} onChange={(e) => field("observacoes", e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400 resize-none" style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }} />
              </div>

              {/* Manutenção periódica */}
              <div className="border-t pt-4" style={{ borderColor: "#e5e0d5" }}>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={periodica}
                    onChange={(e) => {
                      setPeriodica(e.target.checked);
                      if (!e.target.checked) field("proxima_manutencao", "");
                    }}
                    className="w-4 h-4 rounded accent-orange-600"
                  />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-teal)" }}>
                    Manutenção Periódica
                  </span>
                </label>

                {periodica && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
                      Data da Próxima Manutenção
                    </label>
                    <input
                      type="date"
                      required
                      value={form.proxima_manutencao}
                      onChange={(e) => field("proxima_manutencao", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400"
                      style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-gray-50" style={{ borderColor: "#d9d0c0", color: "var(--color-charcoal)" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: "var(--color-rust)" }}>
                  {salvando ? "Salvando..." : editingId ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManutencoesPage() {
  return (
    <Suspense>
      <ManutencoesPageInner />
    </Suspense>
  );
}
