"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/api/profiles";

interface UsuarioAdmin {
  id: string;
  email: string;
  nome: string;
  cpf: string;
  role: "admin" | "user";
  confirmado: boolean;
  ultimo_login: string | null;
  criado_em: string;
}

function formatarDataHora(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const profile = await getProfile(user.id);
      if (profile?.role !== "admin") { router.push("/"); return; }

      try {
        const res = await fetch("/api/admin/usuarios");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Erro desconhecido");
        setUsuarios(json);
      } catch (e: unknown) {
        setErro(e instanceof Error ? e.message : "Não foi possível carregar os usuários.");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4" style={{ borderColor: "#d9d0c0" }}>
        <h1 className="text-3xl font-bold tracking-wide uppercase" style={{ color: "var(--color-charcoal)" }}>
          Controle de Usuários
        </h1>
      </div>

      {erro && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm" style={{ backgroundColor: "#fff5f5", borderColor: "#fca5a5", color: "#b91c1c" }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {erro}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-16 text-sm text-gray-400">Carregando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#e5e0d5" }}>
                {["Nome", "E-mail", "CPF", "Perfil", "Status", "Último Login", "Cadastro"].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--color-charcoal)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => (
                <tr key={u.id} className="border-b transition-colors hover:bg-orange-50" style={{ borderColor: i === usuarios.length - 1 ? "transparent" : "#f0ebe0" }}>
                  <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{u.nome}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{u.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{u.cpf}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: u.role === "admin" ? "#b5411a22" : "#f0ebe0",
                        color: u.role === "admin" ? "var(--color-rust)" : "var(--color-teal)",
                      }}
                    >
                      {u.role === "admin" ? "Admin" : "Usuário"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: u.confirmado ? "#dcfce7" : "#fef9c3",
                        color: u.confirmado ? "#15803d" : "#854d0e",
                      }}
                    >
                      {u.confirmado ? "Confirmado" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{formatarDataHora(u.ultimo_login)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">{formatarDataHora(u.criado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !erro && usuarios.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">Nenhum usuário encontrado.</p>
        )}
      </div>
    </div>
  );
}
