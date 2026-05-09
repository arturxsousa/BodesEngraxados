import { supabase } from "@/lib/supabase";

export interface Veiculo {
  id?: number;
  placa: string;
  ano: string;
  marca: string;
  modelo: string;
  versao: string;
  chassi: string;
  proprietario: string;
}

export async function listarVeiculos(): Promise<Veiculo[]> {
  const { data, error } = await supabase
    .from("veiculos")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function criarVeiculo(veiculo: Omit<Veiculo, "id">): Promise<Veiculo> {
  const { data, error } = await supabase
    .from("veiculos")
    .insert(veiculo)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function atualizarVeiculo(id: number, veiculo: Omit<Veiculo, "id">): Promise<Veiculo> {
  const { data, error } = await supabase
    .from("veiculos")
    .update(veiculo)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletarVeiculo(id: number): Promise<void> {
  const { error } = await supabase
    .from("veiculos")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
