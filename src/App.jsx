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

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PainelAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/colaborador"
        element={
          <ProtectedRoute allowedRoles={["colaborador"]}>
            <PainelColaborador />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente"
        element={
          <ProtectedRoute allowedRoles={["cliente"]}>
            <PainelCliente />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
