"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface Manutencao {
  id: string;
  categoria: string;
  data: string;
  placa: string;
  km: string;
  descricao: string;
  pecas: string;
  observacoes: string;
}

const initialManutencoes: Manutencao[] = [
  { id: "001", categoria: "Revisão",   data: "22/04/2026", placa: "ABC-1234", km: "52.300", descricao: "Troca de óleo e filtros",      pecas: "Óleo 5W30, Filtro de óleo, Filtro de ar", observacoes: "" },
  { id: "002", categoria: "Freios",    data: "25/04/2026", placa: "XYZ-5678", km: "18.750", descricao: "Revisão geral dos freios",      pecas: "Pastilhas dianteiras",                    observacoes: "Disco traseiro com desgaste leve" },
  { id: "003", categoria: "Motor",     data: "28/04/2026", placa: "DEF-9012", km: "87.400", descricao: "Troca de correia dentada",      pecas: "Correia dentada, Tensor, Bomba d'água",   observacoes: "" },
  { id: "004", categoria: "Suspensão", data: "30/04/2026", placa: "GHI-3456", km: "31.200", descricao: "Ajuste de suspensão dianteira", pecas: "Amortecedor dianteiro esquerdo",          observacoes: "Verificar lado direito em 5.000 km" },
  { id: "005", categoria: "Elétrica",  data: "02/05/2026", placa: "JKL-7890", km: "64.900", descricao: "Reparo no sistema elétrico",    pecas: "Relay do alternador, fusível 20A",        observacoes: "" },
  { id: "006", categoria: "Revisão",   data: "05/05/2026", placa: "MNO-2345", km: "23.100", descricao: "Alinhamento e balanceamento",   pecas: "",                                        observacoes: "Pneu dianteiro esquerdo com desgaste" },
];

interface AppContextType {
  manutencoes: Manutencao[];
  setManutencoes: React.Dispatch<React.SetStateAction<Manutencao[]>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>(initialManutencoes);

  return (
    <AppContext.Provider value={{ manutencoes, setManutencoes }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
