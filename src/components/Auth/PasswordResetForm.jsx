// src/components/Auth/PasswordResetForm.jsx
import { useState, useEffect } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../../firebase";

const PasswordResetForm = ({ oobCode, onVoltarParaLogin }) => {
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
      } catch {
        setMensagem("Link inválido ou expirado.");
      }
    };
    fetchEmail();
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);

    if (novaSenha !== confirmar) {
      setCarregando(false);
      return setMensagem("As senhas não coincidem.");
    }

    try {
      await confirmPasswordReset(auth, oobCode, novaSenha);
      setSucesso(true);
      setMensagem("Senha redefinida com sucesso!");

      setTimeout(() => {
        onVoltarParaLogin();
      }, 2000);
    } catch {
      setMensagem("Erro ao redefinir senha.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mensagem && (
        <p
          className={`text-center text-sm font-medium ${
            sucesso
              ? "text-green-500 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
          }`}
        >
          {mensagem}
        </p>
      )}

      <input
        type="email"
        value={email}
        disabled
        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500"
      />
      <input
        type="password"
        placeholder="Nova senha"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        disabled={carregando}
      />
      <input
        type="password"
        placeholder="Confirmar nova senha"
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        disabled={carregando}
      />
      <button
        type="submit"
        className={`w-full ${
          sucesso ? "bg-green-700" : "bg-green-600 hover:bg-green-700"
        } text-white font-semibold py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2`}
        disabled={carregando || sucesso}
      >
        {carregando && (
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
        )}
        {sucesso ? "Redirecionando..." : "Redefinir senha"}
      </button>
    </form>
  );
};

export default PasswordResetForm;
