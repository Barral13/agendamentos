import { useCollectionCount, useTotalSum } from "../../hooks/useFirebaseData";

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

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar os dados: {error}</p>;

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Painel do Administrador</h1>
      <p className="text-gray-600 mb-4">Bem-vindo(a), {userData?.nome || "Admin"} 👋</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-100 rounded-xl">
          <h2 className="font-semibold text-lg">Clientes cadastrados</h2>
          <p className="text-3xl font-bold mt-2">{clientes}</p>
        </div>
        <div className="p-4 bg-green-100 rounded-xl">
          <h2 className="font-semibold text-lg">Serviços disponíveis</h2>
          <p className="text-3xl font-bold mt-2">{servicos}</p>
        </div>
        <div className="p-4 bg-purple-100 rounded-xl">
          <h2 className="font-semibold text-lg">Colaboradores ativos</h2>
          <p className="text-3xl font-bold mt-2">{colaboradores}</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded-xl">
          <h2 className="font-semibold text-lg">Ganhos totais</h2>
          <p className="text-3xl font-bold mt-2">R$ {ganhos.toFixed(2)}</p>
        </div>
      </div>
    </>
  );
};

export default InicioAdmin;
