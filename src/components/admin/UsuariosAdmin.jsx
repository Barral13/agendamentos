import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  limit,
  startAfter,
} from "firebase/firestore";
import Modal from "react-modal";
import { Pencil, Trash2, X, Plus } from "lucide-react";

// Configuração do Modal
Modal.setAppElement("#root");

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserData, setNewUserData] = useState({
    nome: "",
    email: "",
    telefone: "",
    role: "cliente",
    senha: "",
    confirmarSenha: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [senhaErro, setSenhaErro] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filterRole, setFilterRole] = useState(""); // Novo filtro para o papel

  // Função para buscar usuários com paginação e filtro por role
  const fetchUsuarios = async (role = "", page = 1) => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      let userQuery = query(usersRef, limit(10));

      // Adicionando filtro por role, se houver
      if (role) {
        userQuery = query(userQuery, where("role", "==", role));
      }

      // Paginação
      if (page > 1) {
        const lastVisibleDoc = usuarios[usuarios.length - 1];
        userQuery = query(userQuery, startAfter(lastVisibleDoc), limit(10));
      }

      const querySnapshot = await getDocs(userQuery);
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsuarios(usersList);
      setTotalUsers(querySnapshot.size);
    } catch (error) {
      console.error("Erro ao buscar usuários: ", error);
    }
    setLoading(false);
  };

  // Função para adicionar um novo usuário
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (newUserData.senha !== newUserData.confirmarSenha) {
      setSenhaErro("As senhas não coincidem.");
      return;
    }

    try {
      const { nome, email, telefone, role, senha } = newUserData;
      await addDoc(collection(db, "users"), {
        nome,
        email,
        telefone,
        role,
        senha,
      });
      fetchUsuarios(); // Atualiza a lista de usuários após cadastro
      setNewUserData({
        nome: "",
        email: "",
        telefone: "",
        role: "cliente",
        senha: "",
        confirmarSenha: "",
      });
      setIsAddModalOpen(false);
      setSenhaErro(""); // Limpa qualquer erro de senha
    } catch (error) {
      console.error("Erro ao adicionar usuário: ", error);
    }
  };

  // Função para excluir um usuário
  const handleDelete = async () => {
    try {
      if (userToDelete) {
        await deleteDoc(doc(db, "users", userToDelete.id));
        fetchUsuarios(); // Atualiza a lista de usuários após exclusão
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao excluir usuário: ", error);
    }
  };

  // Função para editar um usuário
  const handleEdit = async (e) => {
    e.preventDefault();

    if (newUserData.senha && newUserData.senha !== newUserData.confirmarSenha) {
      setSenhaErro("As senhas não coincidem.");
      return;
    }

    try {
      const { nome, email, telefone, role, senha } = newUserData;
      const userDoc = doc(db, "users", editingUser.id);

      const userData = {
        nome,
        email,
        telefone,
        role,
      };

      if (senha) {
        userData.senha = senha;
      }

      await updateDoc(userDoc, userData);
      fetchUsuarios(); // Atualiza a lista de usuários após edição
      setIsEditModalOpen(false);
      setEditingUser(null);
      setSenhaErro("");
    } catch (error) {
      console.error("Erro ao editar usuário: ", error);
    }
  };

  // Função para mudar de página
  const handlePagination = (direction) => {
    if (direction === "next") {
      setPage(page + 1);
      fetchUsuarios(filterRole, page + 1);
    } else if (direction === "prev" && page > 1) {
      setPage(page - 1);
      fetchUsuarios(filterRole, page - 1);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Exibindo a lista de usuários
  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gerenciar Usuários</h1>
      <p className="text-gray-600 mb-6">Aqui você pode cadastrar, editar, excluir e visualizar todos os usuários.</p>

      {/* Filtro por Role */}
      <div className="mb-6 flex justify-between items-center">
        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            fetchUsuarios(e.target.value, 1);
          }}
          className="p-3 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="admin">Admin</option>
          <option value="colaborador">Colaborador</option>
          <option value="cliente">Cliente</option>
        </select>

        {/* Botão para abrir o modal de cadastro */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      {/* Tabela de Usuários */}
      <div className="overflow-x-auto bg-white shadow-md rounded-md">
        <table className="min-w-full table-auto">
          <thead className="bg-blue-100 text-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b hover:bg-gray-50">
                <td
                  className="px-6 py-3 text-blue-600 cursor-pointer hover:underline"
                  onClick={() => {
                    setSelectedUser(usuario);
                    setIsViewModalOpen(true);
                  }}
                >
                  {usuario.nome}
                </td>
                <td className="px-6 py-3">{usuario.role}</td>
                <td className="px-6 py-3 text-center flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditingUser(usuario);
                      setNewUserData(usuario);
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 transition duration-300"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(usuario);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-800 transition duration-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => handlePagination("prev")}
          className="bg-gray-300 px-4 py-2 rounded-lg disabled:opacity-50 transition duration-300"
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span className="text-gray-600 font-semibold">Página {page}</span>
        <button
          onClick={() => handlePagination("next")}
          className="bg-gray-300 px-4 py-2 rounded-lg disabled:opacity-50 transition duration-300"
          disabled={usuarios.length < 10}
        >
          Próximo
        </button>
      </div>

      {/* Modal de Cadastro de Usuário */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        className="modal w-96 bg-white p-8 rounded-lg shadow-lg"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Cadastrar Novo Usuário</h2>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="text-gray-600 hover:text-black transition duration-300"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleAddUser}>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Nome:</label>
            <input
              type="text"
              value={newUserData.nome}
              onChange={(e) => setNewUserData({ ...newUserData, nome: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Email:</label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Telefone:</label>
            <input
              type="text"
              value={newUserData.telefone}
              onChange={(e) => setNewUserData({ ...newUserData, telefone: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Role:</label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="admin">Admin</option>
              <option value="colaborador">Colaborador</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Senha:</label>
            <input
              type="password"
              value={newUserData.senha}
              onChange={(e) => setNewUserData({ ...newUserData, senha: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Confirmar Senha:</label>
            <input
              type="password"
              value={newUserData.confirmarSenha}
              onChange={(e) => setNewUserData({ ...newUserData, confirmarSenha: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {senhaErro && <p className="text-red-500">{senhaErro}</p>}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-700 transition duration-300"
            >
              Cadastrar
            </button>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="bg-gray-300 text-black px-6 py-2 rounded-md shadow-md hover:bg-gray-400 transition duration-300 ml-4"
            >
              Sair
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Editar Usuário */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        className="modal w-96 bg-white p-8 rounded-lg shadow-lg"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Editar Usuário</h2>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="text-gray-600 hover:text-black transition duration-300"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleEdit}>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Nome:</label>
            <input
              type="text"
              value={newUserData.nome}
              onChange={(e) => setNewUserData({ ...newUserData, nome: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Email:</label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Telefone:</label>
            <input
              type="text"
              value={newUserData.telefone}
              onChange={(e) => setNewUserData({ ...newUserData, telefone: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Role:</label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="admin">Admin</option>
              <option value="colaborador">Colaborador</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Senha:</label>
            <input
              type="password"
              value={newUserData.senha}
              onChange={(e) => setNewUserData({ ...newUserData, senha: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Confirmar Senha:</label>
            <input
              type="password"
              value={newUserData.confirmarSenha}
              onChange={(e) => setNewUserData({ ...newUserData, confirmarSenha: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {senhaErro && <p className="text-red-500">{senhaErro}</p>}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-700 transition duration-300"
            >
              Atualizar
            </button>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="bg-gray-300 text-black px-6 py-2 rounded-md shadow-md hover:bg-gray-400 transition duration-300 ml-4"
            >
              Sair
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Excluir Usuário */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        className="modal w-96 bg-white p-8 rounded-lg shadow-lg"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Confirmar Exclusão</h2>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="text-gray-600 hover:text-black transition duration-300"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-700">Tem certeza que deseja excluir este usuário?</p>
        <div className="mt-6 flex justify-between gap-4">
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-700 transition duration-300"
          >
            Sim, Excluir
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-gray-300 text-black px-6 py-2 rounded-md shadow-md hover:bg-gray-400 transition duration-300"
          >
            Cancelar
          </button>
        </div>
      </Modal>

      {/* Modal de Visualização do Usuário */}
      <Modal
        isOpen={isViewModalOpen}
        onRequestClose={() => setIsViewModalOpen(false)}
        className="modal w-96 bg-white p-8 rounded-lg shadow-lg"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Detalhes do Usuário</h2>
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="text-gray-600 hover:text-black transition duration-300"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <strong className="text-gray-700">Nome: </strong>
          {selectedUser?.nome}
        </div>
        <div className="mb-4">
          <strong className="text-gray-700">Email: </strong>
          {selectedUser?.email}
        </div>
        <div className="mb-4">
          <strong className="text-gray-700">Telefone: </strong>
          {selectedUser?.telefone}
        </div>
        <div className="mb-4">
          <strong className="text-gray-700">Role: </strong>
          {selectedUser?.role}
        </div>
      </Modal>
    </div>
  );
};

export default UsuariosAdmin;
