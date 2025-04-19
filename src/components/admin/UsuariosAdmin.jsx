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
  startAt,
  orderBy,
} from "firebase/firestore";
import Modal from "react-modal";
import { Pencil, Trash2, X, Plus } from "lucide-react";

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
  const [filterRole, setFilterRole] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [prevPagesStack, setPrevPagesStack] = useState([]);

  const [totalUsers, setTotalUsers] = useState(0); // Adiciona esse estado
  const [totalPages, setTotalPages] = useState(0); // Correção para a variável totalPages
  const usersPerPage = 7;

  const fetchUsuarios = async (role = "", direction = "initial") => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");

      // Consulta para obter o total de documentos
      let totalQuery = query(usersRef);
      if (role) {
        totalQuery = query(usersRef, where("role", "==", role));
      }

      const totalSnapshot = await getDocs(totalQuery);
      const totalDocuments = totalSnapshot.size;

      const totalPages = Math.ceil(totalDocuments / 8);
      setTotalPages(totalPages);

      let baseQuery = query(usersRef, orderBy("nome"), limit(8));
      if (role) {
        baseQuery = query(usersRef, where("role", "==", role), orderBy("nome"), limit(8));
      }

      if (direction === "next" && lastVisible) {
        baseQuery = query(baseQuery, startAfter(lastVisible));
      } else if (direction === "prev" && prevPagesStack.length > 0) {
        const prev = prevPagesStack[prevPagesStack.length - 1];
        baseQuery = query(baseQuery, startAt(prev));
      }

      const snapshot = await getDocs(baseQuery);
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Atualizar cursor
      if (snapshot.docs.length > 0) {
        if (direction === "next") {
          setPrevPagesStack([...prevPagesStack, firstVisible]);
        } else if (direction === "prev") {
          setPrevPagesStack(prevPagesStack.slice(0, -1));
        }
        setFirstVisible(snapshot.docs[0]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }

      setUsuarios(usersList);
    } catch (error) {
      console.error("Erro ao buscar usuários: ", error);
    }
    setLoading(false);
  };

  const handlePagination = (direction) => {
    if (direction === "next") {
      setCurrentPage(prev => prev + 1);
      fetchUsuarios(filterRole, "next");
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      fetchUsuarios(filterRole, "prev");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (newUserData.senha !== newUserData.confirmarSenha) {
      setSenhaErro("As senhas não coincidem.");
      return;
    }
    try {
      await addDoc(collection(db, "users"), newUserData);
      setIsAddModalOpen(false);
      fetchUsuarios(filterRole);
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (newUserData.senha && newUserData.senha !== newUserData.confirmarSenha) {
      setSenhaErro("As senhas não coincidem.");
      return;
    }
    try {
      const userDoc = doc(db, "users", editingUser.id);
      const updateData = { ...newUserData };
      if (!updateData.senha) delete updateData.senha;

      await updateDoc(userDoc, updateData);
      setIsEditModalOpen(false);
      fetchUsuarios(filterRole);
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
    }
  };

  const handleDelete = async () => {
    try {
      if (userToDelete) {
        await deleteDoc(doc(db, "users", userToDelete.id));
        setIsDeleteModalOpen(false);
        fetchUsuarios(filterRole);
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="container mx-auto px-2 py-2 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Gerenciar Usuários</h1>

      {/* Filtro */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-medium text-sm flex items-center gap-2">
            Filtrar por:
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
                setPrevPagesStack([]);
                fetchUsuarios(e.target.value);
              }}
              className="p-2 pl-3 pr-8 border border-gray-300 rounded-md shadow-sm text-gray-700"
            >
              <option value="">Todos</option>
              <option value="admin">Admin</option>
              <option value="colaborador">Colaborador</option>
              <option value="cliente">Cliente</option>
            </select>
          </label>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
        >
          <Plus size={20} />
          <span className="hidden sm:block">Novo Usuário</span>
        </button>
      </div>

      {/* Tabela */}
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
                <td className="px-4 py-3">{usuario.role}</td>
                <td className="px-4 py-3 text-center flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditingUser(usuario);
                      setNewUserData(usuario);
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(usuario);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-800"
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
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => handlePagination("prev")}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="font-semibold text-gray-700">{`Página ${currentPage} de ${totalPages}`}</span>

        <button
          onClick={() => handlePagination("next")}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Próximo
        </button>
      </div>

      {/* Modal de Cadastro de Usuário */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        className="modal w-96 bg-white p-8 rounded-lg shadow-xl transition-all duration-500 transform"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
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
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Email:</label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Telefone:</label>
            <input
              type="text"
              value={newUserData.telefone}
              onChange={(e) => setNewUserData({ ...newUserData, telefone: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Role:</label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Confirmar Senha:</label>
            <input
              type="password"
              value={newUserData.confirmarSenha}
              onChange={(e) => setNewUserData({ ...newUserData, confirmarSenha: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {senhaErro && <p className="text-red-500">{senhaErro}</p>}
          <div className="mt-4 flex justify-between">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-lg hover:bg-blue-700 transition duration-300"
            >
              Cadastrar
            </button>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="bg-gray-300 text-black px-6 py-2 rounded-md shadow-lg hover:bg-gray-400 transition duration-300"
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
        className="modal w-96 bg-white p-8 rounded-lg shadow-xl transition-all duration-500 transform"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
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
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Email:</label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Telefone:</label>
            <input
              type="text"
              value={newUserData.telefone}
              onChange={(e) => setNewUserData({ ...newUserData, telefone: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Role:</label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Confirmar Senha:</label>
            <input
              type="password"
              value={newUserData.confirmarSenha}
              onChange={(e) => setNewUserData({ ...newUserData, confirmarSenha: e.target.value })}
              className="p-3 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {senhaErro && <p className="text-red-500">{senhaErro}</p>}
          <div className="mt-4 flex justify-between">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-lg hover:bg-blue-700 transition duration-300"
            >
              Atualizar
            </button>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="bg-gray-300 text-black px-6 py-2 rounded-md shadow-lg hover:bg-gray-400 transition duration-300"
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
            Excluir
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
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 mx-4"
        overlayClassName="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      >
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">👤 Detalhes do Usuário</h2>
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="text-gray-500 hover:text-gray-800 transition"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-gray-700">
          <div>
            <span className="font-semibold">Nome:</span> {selectedUser?.nome}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {selectedUser?.email}
          </div>
          <div>
            <span className="font-semibold">Telefone:</span> {selectedUser?.telefone || '—'}
          </div>
          <div>
            <span className="font-semibold">Perfil:</span>{' '}
            <span className="inline-block px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium uppercase">
              {selectedUser?.role}
            </span>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default UsuariosAdmin;
