// src/pages/PainelCliente.jsx
import { useAuth } from "../context/AuthContext";

const PainelCliente = () => {
  const { userData } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Seu Painel</h1>
      <p className="text-gray-600 mb-4">
        Olá, {userData?.nome || "Cliente"} 👋
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-purple-100 rounded-xl">
          <h2 className="font-semibold text-lg">Próximo agendamento</h2>
          <p className="text-md mt-2">Nenhum agendamento marcado.</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded-xl">
          <h2 className="font-semibold text-lg">Histórico de serviços</h2>
          <p className="text-md mt-2">--</p>
        </div>
      </div>
    </div>
  );
};

export default PainelCliente;
