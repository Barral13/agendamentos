import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const RegisterForm = () => {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmar: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.senha !== form.confirmar) {
      return setError("As senhas não coincidem.");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.senha
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        uid,
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        role: "cliente",
        createdAt: new Date(),
      });

      setSuccess("Conta criada com sucesso!");
    } catch (err) {
      setError("Erro ao criar conta. Verifique os dados.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="text-red-500 text-sm font-medium bg-red-100 dark:bg-red-800 dark:text-red-200 p-2 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-600 text-sm font-medium bg-green-100 dark:bg-green-800 dark:text-green-200 p-2 rounded">
          {success}
        </div>
      )}

      {[
        { label: "Nome completo", key: "nome", type: "text" },
        { label: "Email", key: "email", type: "email" },
        { label: "Telefone", key: "telefone", type: "tel" },
        { label: "Senha", key: "senha", type: "password" },
        { label: "Confirmar senha", key: "confirmar", type: "password" },
      ].map(({ label, key, type }) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm text-gray-700 dark:text-gray-300">{label}</label>
          <input
            type={type}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition-all duration-200"
      >
        Criar Conta
      </button>

    </form>
  );
};

export default RegisterForm;
