import { supabase } from "@/lib/supabase";

export interface Manutencao {
  id?: number;
  categoria: string;
  data: string; // YYYY-MM-DD (Supabase) — formatar para DD/MM/YYYY na exibição
  placa: string;
  km: string;
  descricao: string;
  pecas: string;
  observacoes?: string;
}

export function formatarData(data: string): string {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  if (dia) return `${dia}/${mes}/${ano}`;
  return data;
}

export async function listarManutencoes(): Promise<Manutencao[]> {
  const { data, error } = await supabase
    .from("manutencoes")
    .select("*")
    .order("data", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function criarManutencao(m: Omit<Manutencao, "id">): Promise<Manutencao> {
  const { data, error } = await supabase
    .from("manutencoes")
    .insert(m)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function atualizarManutencao(id: number, m: Omit<Manutencao, "id">): Promise<Manutencao> {
  const { data, error } = await supabase
    .from("manutencoes")
    .update(m)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletarManutencao(id: number): Promise<void> {
  const { error } = await supabase
    .from("manutencoes")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
