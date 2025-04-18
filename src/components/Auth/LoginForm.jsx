import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { userData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, form.email, form.senha);
      if (userData?.role) navigate(`/${userData.role}`);
    } catch (err) {
      setError("Email ou senha incorretos.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-red-500 text-sm font-medium bg-red-100 dark:bg-red-800 dark:text-red-200 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-700 dark:text-gray-300">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite seu email"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-700 dark:text-gray-300">Senha</label>
        <input
          type="password"
          value={form.senha}
          onChange={(e) => setForm({ ...form, senha: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite sua senha"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition-all duration-200"
      >
        Entrar
      </button>

    </form>
  );
};

export default LoginForm;
