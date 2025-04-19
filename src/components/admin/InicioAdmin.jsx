import { useCollectionCount, useTotalSum } from "../../hooks/useFirebaseData";
import { Users, Briefcase, UserCheck, DollarSign } from "lucide-react";

const InicioAdmin = ({ userData }) => {
  const { count: clientes, loading: clientesLoading, error: clientesError } =
    useCollectionCount("users", { field: "role", value: "cliente" });

  const { count: colaboradores, loading: colaboradoresLoading, error: colaboradoresError } =
    useCollectionCount("users", { field: "role", value: "colaborador" });

  const { count: servicos, loading: servicosLoading, error: servicosError } =
    useCollectionCount("servicos");

  const { total: ganhos, loading: ganhosLoading, error: ganhosError } =
    useTotalSum("ganhos", "valor");

  const loading = clientesLoading || colaboradoresLoading || servicosLoading || ganhosLoading;
  const error = clientesError || colaboradoresError || servicosError || ganhosError;

  if (loading) return <p className="text-gray-600">Carregando...</p>;
  if (error) return <p className="text-red-600">Erro ao carregar os dados: {error}</p>;

  const cards = [
    {
      label: "Clientes cadastrados",
      value: clientes,
      icon: <Users size={28} className="text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Serviços disponíveis",
      value: servicos,
      icon: <Briefcase size={28} className="text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Colaboradores ativos",
      value: colaboradores,
      icon: <UserCheck size={28} className="text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      label: "Ganhos totais",
      value: `R$ ${ganhos.toFixed(2)}`,
      icon: <DollarSign size={28} className="text-yellow-500" />,
      bg: "bg-yellow-50",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-1">Painel do Administrador</h1>
      <p className="text-gray-500 mb-6 text-sm sm:text-base">
        Bem-vindo(a), <span className="font-medium">{userData?.nome || "Admin"}</span> 👋
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`p-5 rounded-2xl shadow-sm ${card.bg} flex items-center gap-4 hover:shadow-md transition`}
          >
            <div className="shrink-0">{card.icon}</div>
            <div>
              <h3 className="text-sm text-gray-500">{card.label}</h3>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InicioAdmin;
