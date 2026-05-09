import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  nome: string;
  cpf: string;
  role: "admin" | "user";
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}
