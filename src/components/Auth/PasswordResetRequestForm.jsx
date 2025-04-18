// src/components/Auth/PasswordResetRequestForm.jsx
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

const PasswordResetRequestForm = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Email de recuperação enviado!");
    } catch (err) {
      setMessage("Erro ao enviar email.");
    }
  };

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <input
        type="email"
        placeholder="Seu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition-all duration-200"
      >
        Enviar link de recuperação
      </button>

      {message && (
        <p className="text-center text-sm text-green-500 dark:text-green-400">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={onBackToLogin}
        className="text-sm text-blue-500 hover:underline block mx-auto mt-2"
      >
        Voltar para login
      </button>
    </form>
  );
};

export default PasswordResetRequestForm;
