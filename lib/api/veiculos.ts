const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface Veiculo {
  id?: number;
  placa: string;
  ano: string;
  modelo: string;
  versao: string;
  dono: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.erro ?? `Erro ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function listarVeiculos(): Promise<Veiculo[]> {
  const res = await fetch(`${BASE_URL}/api/veiculos`);
  return handleResponse<Veiculo[]>(res);
}

export async function criarVeiculo(veiculo: Omit<Veiculo, "id">): Promise<Veiculo> {
  const res = await fetch(`${BASE_URL}/api/veiculos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(veiculo),
  });
  return handleResponse<Veiculo>(res);
}

export async function atualizarVeiculo(id: number, veiculo: Omit<Veiculo, "id">): Promise<Veiculo> {
  const res = await fetch(`${BASE_URL}/api/veiculos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(veiculo),
  });
  return handleResponse<Veiculo>(res);
}

export async function deletarVeiculo(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/veiculos/${id}`, { method: "DELETE" });
  return handleResponse<void>(res);
}
