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

export interface Veiculo {
  id: string;
  placa: string;
  ano: string;
  modelo: string;
  versao: string;
  dono: string;
}

const initialManutencoes: Manutencao[] = [
  { id: "001", categoria: "Revisão",   data: "22/04/2026", placa: "ABC-1234", km: "52.300", descricao: "Troca de óleo e filtros",      pecas: "Óleo 5W30, Filtro de óleo, Filtro de ar", observacoes: "" },
  { id: "002", categoria: "Freios",    data: "25/04/2026", placa: "XYZ-5678", km: "18.750", descricao: "Revisão geral dos freios",      pecas: "Pastilhas dianteiras",                    observacoes: "Disco traseiro com desgaste leve" },
  { id: "003", categoria: "Motor",     data: "28/04/2026", placa: "DEF-9012", km: "87.400", descricao: "Troca de correia dentada",      pecas: "Correia dentada, Tensor, Bomba d'água",   observacoes: "" },
  { id: "004", categoria: "Suspensão", data: "30/04/2026", placa: "GHI-3456", km: "31.200", descricao: "Ajuste de suspensão dianteira", pecas: "Amortecedor dianteiro esquerdo",          observacoes: "Verificar lado direito em 5.000 km" },
  { id: "005", categoria: "Elétrica",  data: "02/05/2026", placa: "JKL-7890", km: "64.900", descricao: "Reparo no sistema elétrico",    pecas: "Relay do alternador, fusível 20A",        observacoes: "" },
  { id: "006", categoria: "Revisão",   data: "05/05/2026", placa: "MNO-2345", km: "23.100", descricao: "Alinhamento e balanceamento",   pecas: "",                                        observacoes: "Pneu dianteiro esquerdo com desgaste" },
];

const initialVeiculos: Veiculo[] = [
  { id: "001", placa: "ABC-1234", ano: "2020", modelo: "Toyota Corolla",   versao: "XEi 2.0",          dono: "Carlos Silva" },
  { id: "002", placa: "XYZ-5678", ano: "2019", modelo: "Honda CB 500",     versao: "F ABS",             dono: "Ana Souza" },
  { id: "003", placa: "DEF-9012", ano: "2018", modelo: "VW Gol",           versao: "1.6 MSI Trendline", dono: "Pedro Lima" },
  { id: "004", placa: "GHI-3456", ano: "2022", modelo: "Yamaha MT-07",     versao: "Standard",          dono: "Mariana Costa" },
  { id: "005", placa: "JKL-7890", ano: "2015", modelo: "Fiat Uno",         versao: "Vivace 1.0",        dono: "Roberto Alves" },
  { id: "006", placa: "MNO-2345", ano: "2021", modelo: "Chevrolet Onix",   versao: "LTZ 1.0 Turbo",    dono: "Fernanda Rocha" },
];

interface AppContextType {
  manutencoes: Manutencao[];
  setManutencoes: React.Dispatch<React.SetStateAction<Manutencao[]>>;
  veiculos: Veiculo[];
  setVeiculos: React.Dispatch<React.SetStateAction<Veiculo[]>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>(initialManutencoes);
  const [veiculos, setVeiculos] = useState<Veiculo[]>(initialVeiculos);

  return (
    <AppContext.Provider value={{ manutencoes, setManutencoes, veiculos, setVeiculos }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
