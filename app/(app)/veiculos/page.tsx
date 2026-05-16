"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listarVeiculos,
  criarVeiculo,
  atualizarVeiculo,
  deletarVeiculo,
  type Veiculo,
} from "@/lib/api/veiculos";
import { listarProprietarios, type Proprietario } from "@/lib/api/proprietarios";
import ConfirmDialog from "@/components/ConfirmDialog";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/api/profiles";

const emptyForm = { placa: "", ano: "", marca: "", modelo: "", versao: "", chassi: "", proprietario: "", cpf: "" };

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [salvando, setSalvando] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cpfUsuario, setCpfUsuario] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const { data } = await supabase.auth.getUser();
      const profile = data.user ? await getProfile(data.user.id) : null;
      const admin = profile?.role === "admin";
      setIsAdmin(admin);
      setCpfUsuario(profile?.cpf ?? null);
      const [lista, props] = await Promise.all([listarVeiculos(), listarProprietarios()]);
      setVeiculos(lista);
      setProprietarios(props);
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function handleProprietarioChange(nome: string) {
    const p = proprietarios.find((x) => x.nome === nome);
    setForm((prev) => ({ ...prev, proprietario: nome, cpf: p?.cpf ?? "" }));
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(v: Veiculo) {
    setEditingId(v.id!);
    setForm({ placa: v.placa, ano: v.ano, marca: v.marca, modelo: v.modelo, versao: v.versao, chassi: v.chassi, proprietario: v.proprietario, cpf: v.cpf });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete() {
    if (confirmId === null) return;
    try {
      await deletarVeiculo(confirmId);
      setVeiculos((prev) => prev.filter((v) => v.id !== confirmId));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao deletar veículo");
    } finally {
      setConfirmId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editingId !== null) {
        const atualizado = await atualizarVeiculo(editingId, form);
        setVeiculos((prev) => prev.map((v) => v.id === editingId ? atualizado : v));
      } else {
        const novo = await criarVeiculo(form);
        setVeiculos((prev) => [...prev, novo]);
      }
      closeModal();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao salvar veículo");
    } finally {
      setSalvando(false);
    }
  }

  const veiculosFiltrados = isAdmin
    ? veiculos
    : veiculos.filter((v) => v.cpf === cpfUsuario);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "#d9d0c0" }}>
        <h1 className="text-3xl font-bold tracking-wide uppercase" style={{ color: "var(--color-charcoal)" }}>
          Veículos
        </h1>
        {isAdmin && (
          <div className="flex items-center gap-3">
            {!loading && proprietarios.length === 0 && (
              <span className="text-xs text-gray-400 italic">Cadastre um proprietário antes de registrar veículos</span>
            )}
            <button
              onClick={openNew}
              disabled={proprietarios.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--color-rust)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Veículo
            </button>
          </div>
        )}
      </div>

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
                {[...["ID", "Placa", "Ano", "Marca", "Modelo", "Versão", "Chassi", "Proprietário", "CPF"], ...(isAdmin ? [""] : [])].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--color-charcoal)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {veiculosFiltrados.map((v, i) => (
                <tr key={v.id} className="border-b transition-colors hover:bg-orange-50" style={{ borderColor: i === veiculosFiltrados.length - 1 ? "transparent" : "#f0ebe0" }}>
                  <td className="px-4 py-3 font-mono font-semibold text-xs" style={{ color: "var(--color-rust)" }}>#{v.id}</td>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700 whitespace-nowrap">{v.placa}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{v.ano}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{v.marca}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{v.modelo}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{v.versao}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{v.chassi}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{v.proprietario}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{v.cpf}</td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(v)} className="p-1.5 rounded-md text-gray-400 transition-colors hover:text-blue-600 hover:bg-blue-50" aria-label="Editar veículo">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                          </svg>
                        </button>
                        <button onClick={() => setConfirmId(v.id!)} className="p-1.5 rounded-md text-gray-400 transition-colors hover:text-red-600 hover:bg-red-50" aria-label="Deletar veículo">
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
        {!loading && !erro && veiculosFiltrados.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">Nenhum veículo cadastrado.</p>
        )}
      </div>

      {confirmId !== null && (
        <ConfirmDialog
          message="Tem certeza que deseja deletar este veículo? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#e5e0d5" }}>
              <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: "var(--color-charcoal)" }}>
                {editingId ? "Editar Veículo" : "Novo Veículo"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {[
                { label: "Placa",  key: "placa",  placeholder: "ABC-1234"         },
                { label: "Ano",    key: "ano",    placeholder: "2024"              },
                { label: "Marca",  key: "marca",  placeholder: "Toyota"            },
                { label: "Modelo", key: "modelo", placeholder: "Corolla"           },
                { label: "Versão", key: "versao", placeholder: "XEi 2.0"           },
                { label: "Chassi", key: "chassi", placeholder: "9BWZZZ377VT004251" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-md border outline-none transition-colors focus:border-orange-400"
                    style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>Proprietário</label>
                <select
                  required
                  value={form.proprietario}
                  onChange={(e) => handleProprietarioChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400"
                  style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
                >
                  <option value="">Selecione um proprietário</option>
                  {proprietarios.map((p) => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>CPF</label>
                <input
                  type="text"
                  readOnly
                  value={form.cpf}
                  placeholder="Preenchido automaticamente"
                  className="w-full px-3 py-2 text-sm rounded-md border cursor-not-allowed"
                  style={{ borderColor: "#d9d0c0", backgroundColor: "#f5f5f5", color: "#777" }}
                />
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
