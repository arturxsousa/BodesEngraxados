"use client";

import { useState } from "react";
import { useApp, type Manutencao } from "@/lib/AppContext";
import ConfirmDialog from "@/components/ConfirmDialog";

const CATEGORIAS = ["Revisão", "Freios", "Motor", "Suspensão", "Elétrica", "Funilaria", "Outros"];

const emptyForm = {
  categoria: CATEGORIAS[0],
  data: "",
  placa: "",
  km: "",
  descricao: "",
  pecas: "",
  observacoes: "",
};

export default function ManutencoesPage() {
  const { manutencoes, setManutencoes } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(m: Manutencao) {
    setEditingId(m.id);
    setForm({ categoria: m.categoria, data: m.data, placa: m.placa, km: m.km, descricao: m.descricao, pecas: m.pecas, observacoes: m.observacoes });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleDelete() {
    if (confirmId === null) return;
    setManutencoes((prev) => prev.filter((m) => m.id !== confirmId));
    setConfirmId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      setManutencoes((prev) => prev.map((m) => m.id === editingId ? { ...m, ...form } : m));
    } else {
      const nextId = String(manutencoes.length + 1).padStart(3, "0");
      setManutencoes((prev) => [...prev, { id: nextId, ...form }]);
    }
    closeModal();
  }

  const field = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "#d9d0c0" }}>
        <h1 className="text-3xl font-bold tracking-wide uppercase" style={{ color: "var(--color-charcoal)" }}>
          Manutenções
        </h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-rust)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Manutenção
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "#e5e0d5" }}>
              {["ID", "Categoria", "Data", "Placa", "KM", "Descrição", "Peças Empregadas", "Observações", ""].map((col) => (
                <th key={col} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--color-charcoal)" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {manutencoes.map((m, i) => (
                <tr key={m.id} className="border-b transition-colors hover:bg-orange-50" style={{ borderColor: i === manutencoes.length - 1 ? "transparent" : "#f0ebe0" }}>
                  <td className="px-4 py-3 font-mono font-semibold text-xs whitespace-nowrap" style={{ color: "var(--color-rust)" }}>#{m.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#f0ebe0", color: "var(--color-teal)" }}>{m.categoria}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{m.data}</td>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700 whitespace-nowrap">{m.placa}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{m.km} km</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">{m.descricao}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{m.pecas || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{m.observacoes || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded-md text-gray-400 transition-colors hover:text-blue-600 hover:bg-blue-50" aria-label="Editar manutenção">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                        </svg>
                      </button>
                      <button onClick={() => setConfirmId(m.id)} className="p-1.5 rounded-md text-gray-400 transition-colors hover:text-red-600 hover:bg-red-50" aria-label="Deletar manutenção">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
        {manutencoes.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">Nenhuma manutenção cadastrada.</p>
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
                  <input type="text" required placeholder="ABC-1234" value={form.placa} onChange={(e) => field("placa", e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400" style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }} />
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
                <textarea rows={2} placeholder="Ex: Óleo 5W30, Filtro de ar..." value={form.pecas} onChange={(e) => field("pecas", e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400 resize-none" style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }} />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>Observações</label>
                <textarea rows={2} placeholder="Observações adicionais..." value={form.observacoes} onChange={(e) => field("observacoes", e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400 resize-none" style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-gray-50" style={{ borderColor: "#d9d0c0", color: "var(--color-charcoal)" }}>
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-rust)" }}>
                  {editingId ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
