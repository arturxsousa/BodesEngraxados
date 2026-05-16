"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatCpf } from "@/lib/utils";

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", cpf: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const field = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
    });

    if (error || !data.user) {
      setErro(error?.message ?? "Erro ao criar conta.");
      setCarregando(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      nome: form.nome,
      cpf: form.cpf,
      role: "user",
    });

    if (profileError) {
      setErro("Conta criada, mas erro ao salvar perfil. Contate o administrador.");
      setCarregando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <Image src="/bg-login.png" alt="" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6 gap-3">
          <Image src="/logo-bode.png" alt="Bodes Engraxados" width={72} height={72} className="object-contain drop-shadow-lg" />
          <div className="text-center">
            <p className="text-2xl font-bold tracking-wide drop-shadow">
              <span style={{ color: "var(--color-rust)" }}>BODES</span>{" "}
              <span className="text-white">ENGRAXADOS</span>
            </p>
            <p className="text-xs text-gray-300 mt-1 tracking-widest uppercase">Sistema de Gestão</p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl px-8 py-8">
          <h1 className="text-base font-bold uppercase tracking-widest mb-6" style={{ color: "var(--color-charcoal)" }}>
            Criar Conta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Nome completo", key: "nome",  type: "text",     placeholder: "João Silva"          },
              { label: "E-mail",        key: "email", type: "email",    placeholder: "joao@email.com"      },
              { label: "Senha",         key: "senha", type: "password", placeholder: "Mínimo 6 caracteres" },
              { label: "CPF",           key: "cpf",   type: "text",     placeholder: "000.000.000-00"      },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
                  {label}
                </label>
                <input
                  type={type}
                  required
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => field(key as keyof typeof form, key === "cpf" ? formatCpf(e.target.value) : e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400 transition-colors"
                  style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
                />
              </div>
            ))}

            {erro && <p className="text-xs font-medium text-red-600">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: "var(--color-rust)" }}
            >
              {carregando ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-semibold underline" style={{ color: "var(--color-teal)" }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
