import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import Modal from "react-modal";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

// Função para buscar os colaboradores do Firestore
const fetchColaboradores = async () => {
  try {
    const colaboradoresQuery = query(
      collection(db, "users"),
      where("role", "==", "colaborador")
    );
    const querySnapshot = await getDocs(colaboradoresQuery);
    const colaboradores = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nome: doc.data().nome,
    }));
    return colaboradores;
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return [];
  }
};

const ServicosAdmin = () => {
  const [servicos, setServicos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoServico, setEditandoServico] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    colaboradores: [],
  });

  // Lógica para determinar itens por página com base na largura da tela
  const [itensPorPagina, setItensPorPagina] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItensPorPagina(8); // Para telas grandes, exibe 10 itens por página
      } else {
        setItensPorPagina(4);  // Para telas menores, exibe 4 itens por página
      }
    };

    handleResize(); // Chama na primeira renderização
    window.addEventListener("resize", handleResize); // Adiciona o ouvinte de evento

    return () => {
      window.removeEventListener("resize", handleResize); // Limpa o ouvinte de evento ao desmontar o componente
    };
  }, []);

  const [paginaAtual, setPaginaAtual] = useState(1);

  // Lógica para determinar o número total de páginas
  const totalPaginas = servicos.length > 0
    ? Math.ceil(servicos.length / itensPorPagina)
    : 1;

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const servicosPaginados = servicos.slice(
    indiceInicial,
    indiceInicial + itensPorPagina
  );

  useEffect(() => {
    const getColaboradores = async () => {
      const colaboradores = await fetchColaboradores();
      setColaboradores(colaboradores);
    };
    getColaboradores();
  }, []);

  useEffect(() => {
    const fetchServicos = async () => {
      const servicosQuery = query(collection(db, "servicos"));
      const querySnapshot = await getDocs(servicosQuery);
      const servicos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServicos(servicos);
    };
    fetchServicos();
  }, []);

  useEffect(() => {
    if (editandoServico) {
      setForm(editandoServico);
      setIsModalOpen(true);
    }
  }, [editandoServico]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.nome.trim()) newErrors.nome = "O nome é obrigatório.";
    if (!form.descricao.trim())
      newErrors.descricao = "A descrição é obrigatória.";
    if (!form.preco || isNaN(form.preco))
      newErrors.preco = "Informe um preço válido.";
    if (form.colaboradores.length === 0)
      newErrors.colaboradores = "Selecione ao menos um colaborador.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editandoServico) {
        const serviceRef = doc(db, "servicos", editandoServico.id);
        await updateDoc(serviceRef, form);
        setServicos((prev) =>
          prev.map((s) =>
            s.id === editandoServico.id ? { ...form, id: s.id } : s
          )
        );
      } else {
        const novoServico = {
          ...form,
          colaboradores: form.colaboradores.map((id) => id),
          criadoEm: new Date(),
        };
        const docRef = await addDoc(collection(db, "servicos"), novoServico);
        setServicos([ ...servicos, { ...novoServico, id: docRef.id } ]);
      }

      resetForm();
    } catch (error) {
      console.error("Erro ao salvar o serviço:", error);
    }
  };

  const resetForm = () => {
    setForm({ nome: "", descricao: "", preco: "", colaboradores: [] });
    setErrors({});
    setEditandoServico(null);
    setIsModalOpen(false);
  };

  const excluirServico = async (id) => {
    try {
      await deleteDoc(doc(db, "servicos", id));
      setServicos(servicos.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Erro ao excluir o serviço:", error);
    }
  };

  const toggleColaborador = (id) => {
    setForm((prev) => ({
      ...prev,
      colaboradores: prev.colaboradores.includes(id)
        ? prev.colaboradores.filter((cid) => cid !== id)
        : [...prev.colaboradores, id],
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Novo Serviço</span>
        </button>
      </div>

      {servicos.length === 0 ? (
        <p className="text-gray-500">Nenhum serviço cadastrado.</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {servicosPaginados.map((servico) => (
              <li
                key={servico.id}
                className="p-4 bg-white rounded-xl shadow-md flex justify-between items-start"
              >
                <div>
                  <h3 className="font-bold text-lg">{servico.nome}</h3>
                  <p className="text-sm text-gray-600">{servico.descricao}</p>
                  <p className="text-blue-700 font-medium mt-1">
                    R$ {parseFloat(servico.preco).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Colaboradores:{" "}
                    {servico.colaboradores
                      .map(
                        (id) =>
                          colaboradores.find((c) => c.id === id)?.nome || "—"
                      )
                      .join(", ")}
                  </p>
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setEditandoServico(servico)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => excluirServico(servico.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Paginação */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Anterior
            </button>

            <span className="font-semibold text-gray-700">
              Página {paginaAtual} de {totalPaginas}
            </span>

            <button
              onClick={() =>
                setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
              }
              disabled={paginaAtual === totalPaginas}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={resetForm}
        className="w-[90%] max-w-md bg-white p-6 rounded-xl shadow-lg mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editandoServico ? "Editar Serviço" : "Novo Serviço"}
          </h2>
          <button onClick={resetForm} className="text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>
        {/* Conteúdo do modal */}
        <div>
          {/* Formulário para adicionar ou editar o serviço */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) =>
                  setForm({ ...form, nome: e.target.value })
                }
                className="w-full p-2 mt-2 border rounded-lg"
              />
              {errors.nome && <p className="text-red-600">{errors.nome}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                className="w-full p-2 mt-2 border rounded-lg"
              />
              {errors.descricao && (
                <p className="text-red-600">{errors.descricao}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Preço
              </label>
              <input
                type="number"
                value={form.preco}
                onChange={(e) =>
                  setForm({ ...form, preco: e.target.value })
                }
                className="w-full p-2 mt-2 border rounded-lg"
              />
              {errors.preco && <p className="text-red-600">{errors.preco}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Colaboradores
              </label>
              <div className="space-y-2">
                {colaboradores.map((colaborador) => (
                  <div key={colaborador.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.colaboradores.includes(colaborador.id)}
                      onChange={() => toggleColaborador(colaborador.id)}
                      className="mr-2"
                    />
                    <span>{colaborador.nome}</span>
                  </div>
                ))}
              </div>
              {errors.colaboradores && (
                <p className="text-red-600">{errors.colaboradores}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editandoServico ? "Salvar alterações" : "Criar Serviço"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServicosAdmin;
