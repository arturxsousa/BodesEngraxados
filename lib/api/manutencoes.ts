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

export interface FiltroBusca {
  dataInicio?: string;
  dataFim?: string;
  placa?: string;
  proprietario?: string;
  categoria?: string;
}

export async function buscarManutencoes(filtros: FiltroBusca): Promise<Manutencao[]> {
  if (filtros.proprietario) {
    const { data: veiculos } = await supabase
      .from("veiculos")
      .select("placa")
      .ilike("proprietario", `%${filtros.proprietario}%`);
    const placas = (veiculos ?? []).map((v: { placa: string }) => v.placa);
    if (placas.length === 0) return [];
    if (!filtros.placa) {
      let q = supabase.from("manutencoes").select("*").in("placa", placas);
      if (filtros.dataInicio) q = q.gte("data", filtros.dataInicio);
      if (filtros.dataFim)    q = q.lte("data", filtros.dataFim);
      if (filtros.categoria)  q = q.eq("categoria", filtros.categoria);
      q = q.order("data", { ascending: false });
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data ?? [];
    }
    if (!placas.includes(filtros.placa)) return [];
  }

  let query = supabase.from("manutencoes").select("*");
  if (filtros.dataInicio) query = query.gte("data", filtros.dataInicio);
  if (filtros.dataFim)    query = query.lte("data", filtros.dataFim);
  if (filtros.placa)      query = query.eq("placa", filtros.placa);
  if (filtros.categoria)  query = query.eq("categoria", filtros.categoria);
  query = query.order("data", { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deletarManutencao(id: number): Promise<void> {
  const { error } = await supabase
    .from("manutencoes")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
