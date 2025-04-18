import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";

import InicioColaborador from "../components/colaborador/InicioColaborador";
import TarefasColaborador from "../components/colaborador/TarefasColaborador";
import RelatoriosColaborador from "../components/colaborador/RelatoriosColaborador";

const PainelColaborador = () => {
  const { userData } = useAuth();
  const [section, setSection] = useState("inicio");

  const renderSection = () => {
    switch (section) {
      case "tarefas":
        return <TarefasColaborador />;
      case "relatorios":
        return <RelatoriosColaborador />;
      default:
        return <InicioColaborador userData={userData} />;
    }
  };

  return (
    <DashboardLayout section={section} setSection={setSection}>
      {renderSection()}
    </DashboardLayout>
  );
};

export default PainelColaborador;
