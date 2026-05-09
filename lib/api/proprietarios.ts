import { supabase } from "@/lib/supabase";

export interface Proprietario {
  id?: number;
  nome: string;
  data_nascimento: string;
  cpf: string;
  email?: string;
}

export function formatarData(data: string): string {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  if (dia) return `${dia}/${mes}/${ano}`;
  return data;
}

export async function listarProprietarios(): Promise<Proprietario[]> {
  const { data, error } = await supabase
    .from("proprietarios")
    .select("*")
    .order("nome", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function criarProprietario(p: Omit<Proprietario, "id">): Promise<Proprietario> {
  const { data, error } = await supabase
    .from("proprietarios")
    .insert(p)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function atualizarProprietario(id: number, p: Omit<Proprietario, "id">): Promise<Proprietario> {
  const { data, error } = await supabase
    .from("proprietarios")
    .update(p)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletarProprietario(id: number): Promise<void> {
  const { error } = await supabase
    .from("proprietarios")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
