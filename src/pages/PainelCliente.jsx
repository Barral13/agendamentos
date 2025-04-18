import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";

import InicioCliente from "../components/cliente/InicioCliente";
import ServicosCliente from "../components/cliente/ServicosCliente";

const PainelCliente = () => {
  const { userData } = useAuth();
  const [section, setSection] = useState("inicio");

  const renderSection = () => {
    switch (section) {
      case "servicos":
        return <ServicosCliente />;
      default:
        return <InicioCliente userData={userData} />;
    }
  };

  return (
    <DashboardLayout section={section} setSection={setSection}>
      {renderSection()}
    </DashboardLayout>
  );
};

export default PainelCliente;
