"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getProfile, type Profile } from "@/lib/api/profiles";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { label: "Veículos", href: "/veiculos" },
  { label: "Manutenções", href: "/manutencoes" },
  { label: "Proprietários", href: "/proprietarios" },
  { label: "Buscar", href: "/busca" },
];

function initials(nome: string) {
  const parts = nome.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function NavBar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      setUser(u);
      if (u) {
        const p = await getProfile(u.id);
        setProfile(p);
      }
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const p = await getProfile(u.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const displayName = profile?.nome ?? user?.email ?? "";
  const displayInitials = profile ? initials(profile.nome) : (user?.email?.slice(0, 2).toUpperCase() ?? "?");

  return (
    <nav style={{ backgroundColor: "var(--color-charcoal)" }} className="text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">

          {/* Esquerda — logo + título */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-bode.png"
                alt="Bodes Engraxados"
                width={48}
                height={48}
                className="object-contain"
              />
              <span className="hidden sm:block text-xl font-bold tracking-wide">
                <span style={{ color: "var(--color-rust)" }}>BODES</span>
                {" "}
                <span className="text-white font-semibold">ENGRAXADOS</span>
              </span>
            </Link>
          </div>

          {/* Centro — links de navegação (desktop) */}
          <div className="hidden md:flex justify-center items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 text-sm font-medium tracking-wide transition-colors duration-150"
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rust)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              >
                {link.label}
              </Link>
            ))}
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="text-gray-300 text-sm font-medium tracking-wide transition-colors duration-150"
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rust)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              >
                Usuários
              </Link>
            )}
          </div>

          {/* Hambúrguer (mobile) */}
          <div className="flex md:hidden justify-center items-center">
            <button
              className="p-2 rounded-md text-gray-400 hover:text-white transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Direita — usuário logado */}
          <div className="flex justify-end">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: "var(--color-rust)" }}
                >
                  {displayInitials}
                </div>
                <span className="hidden sm:block text-sm text-gray-300 max-w-[140px] truncate">
                  {displayName}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl border z-50"
                  style={{ backgroundColor: "#252525", borderColor: "#383838" }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: "#383838" }}>
                    <p className="text-sm font-semibold text-white truncate">{profile?.nome ?? ""}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email ?? ""}</p>
                  </div>
                  <div className="py-1">
                    <button
                      className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-white/10"
                      style={{ color: "var(--color-rust)" }}
                      onClick={handleSignOut}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ backgroundColor: "#252525", borderColor: "#333" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 px-3 rounded-md text-gray-300 font-medium tracking-wide transition-colors duration-150"
              onClick={() => setMenuOpen(false)}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rust)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              {link.label}
            </Link>
          ))}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="block py-2 px-3 rounded-md text-gray-300 font-medium tracking-wide transition-colors duration-150"
              onClick={() => setMenuOpen(false)}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rust)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              Usuários
            </Link>
          )}
          <div className="border-t pt-3 mt-2" style={{ borderColor: "#383838" }}>
            <p className="px-3 text-sm font-semibold text-white">{profile?.nome ?? ""}</p>
            <p className="px-3 text-xs text-gray-400 mt-0.5">{user?.email ?? ""}</p>
            <button onClick={handleSignOut} className="mt-2 px-3 py-2 text-sm flex items-center gap-2" style={{ color: "var(--color-rust)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
