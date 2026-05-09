"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro("E-mail ou senha inválidos.");
      setCarregando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Imagem de fundo */}
      <Image
        src="/bg-login.png"
        alt=""
        fill
        className="object-cover"
        priority
      />
      {/* Overlay escuro para legibilidade */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Card de login */}
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
            Entrar
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
                E-mail
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400 transition-colors"
                style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-teal)" }}>
                Senha
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:border-orange-400 transition-colors"
                style={{ borderColor: "#d9d0c0", backgroundColor: "var(--color-cream)" }}
              />
            </div>

            {erro && (
              <p className="text-xs font-medium text-red-600">{erro}</p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: "var(--color-rust)" }}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Não tem uma conta?{" "}
            <Link href="/cadastro" className="font-semibold underline" style={{ color: "var(--color-teal)" }}>
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
