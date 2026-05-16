import { supabase } from "@/lib/supabase";

export type Documento = {
  id: string;
  titulo: string;
  arquivo_nome: string;
  arquivo_path: string;
  arquivo_url: string;
  created_at: string;
};

export async function listarDocumentos(): Promise<Documento[]> {
  const { data, error } = await supabase
    .from("biblioteca")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadDocumento(titulo: string, file: File): Promise<void> {
  const path = `${crypto.randomUUID()}.pdf`;

  const { error: storageError } = await supabase.storage
    .from("biblioteca")
    .upload(path, file, { contentType: "application/pdf" });
  if (storageError) throw storageError;

  const { data: { publicUrl } } = supabase.storage.from("biblioteca").getPublicUrl(path);

  const { error: dbError } = await supabase.from("biblioteca").insert({
    titulo,
    arquivo_nome: file.name,
    arquivo_path: path,
    arquivo_url: publicUrl,
  });
  if (dbError) throw dbError;
}

export async function deletarDocumento(id: string, arquivoPath: string): Promise<void> {
  await supabase.storage.from("biblioteca").remove([arquivoPath]);
  const { error } = await supabase.from("biblioteca").delete().eq("id", id);
  if (error) throw error;
}
