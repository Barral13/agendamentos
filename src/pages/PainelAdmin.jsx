import { useAuth } from "../context/AuthContext";

const PainelAdmin = () => {
  const { userData } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Painel do Administrador</h1>
      <p className="text-gray-600 mb-4">
        Bem-vindo(a), {userData?.nome || "Admin"} 👋
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-100 rounded-xl">
          <h2 className="font-semibold text-lg">Clientes cadastrados</h2>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="p-4 bg-green-100 rounded-xl">
          <h2 className="font-semibold text-lg">Serviços disponíveis</h2>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="p-4 bg-purple-100 rounded-xl">
          <h2 className="font-semibold text-lg">Colaboradores ativos</h2>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded-xl">
          <h2 className="font-semibold text-lg">Ganhos totais</h2>
          <p className="text-3xl font-bold mt-2">R$ --,--</p>
        </div>
      </div>
    </div>
  );
};

export default PainelAdmin;
