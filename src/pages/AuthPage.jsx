import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import PasswordResetRequestForm from "../components/Auth/PasswordResetRequestForm";
import PasswordResetForm from "../components/Auth/PasswordResetForm";
import ThemeToggle from "../components/ThemeToggle";
import logo from "../assets/authenticator.svg";

const AuthPage = () => {
  const [mode, setMode] = useState("login"); // login | register | reset | confirm
  const [searchParams] = useSearchParams();

  const oobCode = searchParams.get("oobCode");
  const modeParam = searchParams.get("mode");

  useEffect(() => {
    if (modeParam === "resetPassword" && oobCode) {
      setMode("confirm");
    }
  }, [modeParam, oobCode]);

  const renderForm = () => {
    switch (mode) {
      case "login":
        return <LoginForm onForgotPassword={() => setMode("reset")} />;
      case "register":
        return <RegisterForm />;
      case "reset":
        return (
          <PasswordResetRequestForm onBackToLogin={() => setMode("login")} />
        );
      case "confirm":
        return (
          <PasswordResetForm
            oobCode={oobCode}
            onVoltarParaLogin={() => setMode("login")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 px-4 py-6 relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-blue-800 dark:bg-blue-700 text-white px-6 py-8">
          <img src={logo} alt="Logo" className="w-20 h-20 mb-4" />
          <h2 className="text-center text-lg md:text-2xl font-semibold leading-relaxed max-w-sm">
            {mode === "login"
              ? "Acesse sua conta e explore a plataforma!"
              : mode === "register"
              ? "Junte-se a nós e simplifique seu dia!"
              : "Vamos te ajudar a recuperar sua conta!"}
          </h2>
        </div>

        <div className="w-full md:w-1/2 px-6 py-8 md:min-h-[500px] flex flex-col justify-center">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            {mode === "login"
              ? "Entrar"
              : mode === "register"
              ? "Criar Conta"
              : mode === "reset"
              ? "Recuperar Senha"
              : "Redefinir Senha"}
          </h2>

          <div className="w-full max-w-md mx-auto">{renderForm()}</div>

          {mode === "login" && (
            <div className="text-right text-sm text-blue-600 dark:text-blue-400 mt-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          {mode !== "confirm" && (
            <p className="mt-6 text-sm text-center text-gray-700 dark:text-gray-300">
              {mode === "login"
                ? "Não tem uma conta?"
                : "Já tem uma conta?"}{" "}
              <button
                onClick={() =>
                  setMode(mode === "login" ? "register" : "login")
                }
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {mode === "login" ? "Cadastre-se" : "Entrar"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
