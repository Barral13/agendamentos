import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import InicioAdmin from "../components/admin/InicioAdmin";
import UsuariosAdmin from "../components/admin/UsuariosAdmin";
import RelatoriosAdmin from "../components/admin/RelatoriosAdmin";
import ServicosAdmin from "../components/admin/ServicosAdmin";
import DashboardLayout from "../components/Layout/DashboardLayout";

const PainelAdmin = () => {
  const { userData } = useAuth();
  const [section, setSection] = useState("inicio");

  const renderSection = () => {
    switch (section) {
      case "usuarios":
        return <UsuariosAdmin />;
      case "relatorios":
        return <RelatoriosAdmin />;
      case "servicos":
        return <ServicosAdmin />;
      default:
        return <InicioAdmin userData={userData} />;
    }
  };

  return (
    <DashboardLayout section={section} setSection={setSection}>
      {renderSection()}
    </DashboardLayout>
  );
};

export default PainelAdmin;
