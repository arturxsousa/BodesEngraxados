"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getProfile, type Profile } from "@/lib/api/profiles";
import {
  listarDocumentos,
  uploadDocumento,
  deletarDocumento,
  type Documento,
} from "@/lib/api/biblioteca";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function BibliotecaPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [titulo, setTitulo] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const p = await getProfile(data.user.id);
        setProfile(p);
      }
      setDocumentos(await listarDocumentos());
    }
    init();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!arquivo) return;
    setUploading(true);
    setErro(null);
    try {
      await uploadDocumento(titulo, arquivo);
      setDocumentos(await listarDocumentos());
      setTitulo("");
      setArquivo(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      setErro(`Erro ao fazer upload: ${msg}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, arquivoPath: string) {
    try {
      await deletarDocumento(id, arquivoPath);
      setDocumentos((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setErro("Erro ao excluir documento.");
    } finally {
      setConfirmId(null);
    }
  }

  const docParaDeletar = documentos.find((d) => d.id === confirmId);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold uppercase tracking-widest mb-8" style={{ color: "var(--color-charcoal)" }}>
        Biblioteca
      </h1>

      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border mb-8 p-6" style={{ borderColor: "#e5ddd0" }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-teal)" }}>
            Adicionar Documento
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
                Título
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Manual de Procedimentos"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400 transition-colors"
                style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
                Arquivo PDF
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--color-rust)" }}
                >
                  Escolher arquivo
                </button>
                <span className="text-sm text-gray-500">
                  {arquivo ? `${arquivo.name} (${(arquivo.size / 1024).toFixed(0)} KB)` : "Nenhum arquivo selecionado"}
                </span>
              </div>
            </div>

            {erro && <p className="text-xs font-medium text-red-600">{erro}</p>}

            <button
              type="submit"
              disabled={uploading || !arquivo}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--color-rust)" }}
            >
              {uploading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      )}

      {documentos.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum documento cadastrado.</p>
      ) : (
        <div className="space-y-3">
          {documentos.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-sm border flex items-center gap-4 px-5 py-4"
              style={{ borderColor: "#e5ddd0" }}
            >
              <div className="shrink-0">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="4" fill="#b5411a" opacity="0.12" />
                  <path d="M7 3h7l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="#b5411a" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M14 3v5h5" stroke="#b5411a" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M9 13h6M9 16h4" stroke="#b5411a" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{doc.titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.arquivo_nome} · {formatDate(doc.created_at)}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={doc.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--color-teal)" }}
                >
                  Baixar
                </a>
                {isAdmin && (
                  <button
                    onClick={() => setConfirmId(doc.id)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#dc2626" }}
                  >
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmId && docParaDeletar && (
        <ConfirmDialog
          message={`Excluir "${docParaDeletar.titulo}"? O arquivo será removido permanentemente.`}
          onConfirm={() => handleDelete(docParaDeletar.id, docParaDeletar.arquivo_path)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
