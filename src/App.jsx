import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import PainelAdmin from "./pages/PainelAdmin";
import PainelColaborador from "./pages/PainelColaborador";
import PainelCliente from "./pages/PainelCliente";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/Layout/DashboardLayout";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <PainelAdmin />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/colaborador"
        element={
          <ProtectedRoute allowedRoles={["colaborador"]}>
            <DashboardLayout>
              <PainelColaborador />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente"
        element={
          <ProtectedRoute allowedRoles={["cliente"]}>
            <DashboardLayout>
              <PainelCliente />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
