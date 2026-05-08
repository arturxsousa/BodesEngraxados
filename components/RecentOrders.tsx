// Placeholder — substituir por dados reais da API
const mockOrders = [
  { id: "010", placa: "YZA-8901", veiculo: "Ford Ka 2019", dono: "Beatriz Campos", descricao: "Revisão do motor", data: "08/05/2026" },
  { id: "009", placa: "VWX-4567", veiculo: "Renault Sandero 2017", dono: "Eduardo Pinto", descricao: "Troca de amortecedores traseiros", data: "07/05/2026" },
  { id: "008", placa: "STU-0123", veiculo: "Kawasaki Z400 2021", dono: "Juliana Neves", descricao: "Manutenção preventiva", data: "06/05/2026" },
  { id: "007", placa: "PQR-6789", veiculo: "Honda Civic 2023", dono: "Lucas Martins", descricao: "Troca de pastilhas de freio", data: "05/05/2026" },
  { id: "006", placa: "MNO-2345", veiculo: "Chevrolet Onix 2021", dono: "Fernanda Rocha", descricao: "Alinhamento e balanceamento", data: "03/05/2026" },
  { id: "005", placa: "JKL-7890", veiculo: "Fiat Uno 2015", dono: "Roberto Alves", descricao: "Reparo no sistema elétrico", data: "02/05/2026" },
  { id: "004", placa: "GHI-3456", veiculo: "Yamaha MT-07 2022", dono: "Mariana Costa", descricao: "Ajuste de suspensão dianteira", data: "30/04/2026" },
  { id: "003", placa: "DEF-9012", veiculo: "VW Gol 2018", dono: "Pedro Lima", descricao: "Troca de correia dentada", data: "28/04/2026" },
  { id: "002", placa: "XYZ-5678", veiculo: "Honda CB 500 2019", dono: "Ana Souza", descricao: "Revisão geral dos freios", data: "25/04/2026" },
  { id: "001", placa: "ABC-1234", veiculo: "Toyota Corolla 2020", dono: "Carlos Silva", descricao: "Troca de óleo e filtros", data: "22/04/2026" },
];

export default function RecentOrders() {
  const orders = mockOrders;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full">
      <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-teal)" }}>
        Últimas 10 Manutenções
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "#e5e0d5" }}>
              {["ID", "Data", "Placa", "Veículo", "Dono", "Descrição"].map((col) => (
                <th
                  key={col}
                  className="text-left pb-2 pr-4 text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
                  style={{ color: "var(--color-charcoal)" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <tr
                key={order.id}
                className="border-b transition-colors hover:bg-orange-50"
                style={{ borderColor: i === orders.length - 1 ? "transparent" : "#f0ebe0" }}
              >
                <td className="py-2 pr-4 font-mono font-semibold text-xs" style={{ color: "var(--color-rust)" }}>
                  #{order.id}
                </td>
                <td className="py-2 pr-4 font-mono text-xs text-gray-500 whitespace-nowrap">{order.data}</td>
                <td className="py-2 pr-4 font-mono text-xs font-medium text-gray-700 whitespace-nowrap">
                  {order.placa}
                </td>
                <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">{order.veiculo}</td>
                <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">{order.dono}</td>
                <td className="py-2 text-gray-500 max-w-[200px] truncate">{order.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
