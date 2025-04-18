import { useState, useEffect } from "react";
import { db } from "../../firebase"; // Importar a instância do Firestore
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Modal from "react-modal";

// Configuração do Modal
Modal.setAppElement("#root");

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserData, setNewUserData] = useState({
    nome: "",
    email: "",
    telefone: "",
    role: "cliente", // Valor inicial para o role
    senha: "",
    confirmarSenha: "",
  });
  const [editingUser, setEditingUser] = useState(null); // Para editar um usuário
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [senhaErro, setSenhaErro] = useState("");

  // Função para buscar usuários
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(usersList);
    } catch (error) {
      console.error("Erro ao buscar usuários: ", error);
    }
    setLoading(false);
  };

  // Função para adicionar um novo usuário
  const handleAddUser = async (e) => {
    e.preventDefault();

    // Verificar se as senhas correspondem
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
        senha, // Lembre-se de usar um método seguro para lidar com senhas no Firebase
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
      setIsAddModalOpen(false); // Fecha o modal de cadastro
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
        setIsDeleteModalOpen(false); // Fecha o modal de confirmação
      }
    } catch (error) {
      console.error("Erro ao excluir usuário: ", error);
    }
  };

  // Função para editar um usuário
  const handleEdit = async (e) => {
    e.preventDefault();

    // Verificar se as senhas coincidem
    if (newUserData.senha && newUserData.senha !== newUserData.confirmarSenha) {
      setSenhaErro("As senhas não coincidem.");
      return;
    }

    try {
      const { nome, email, telefone, role, senha } = newUserData;
      const userDoc = doc(db, "users", editingUser.id);

      // Atualizar o Firestore com os novos dados (incluindo a senha, se fornecida)
      const userData = {
        nome,
        email,
        telefone,
        role,
      };

      // Se a senha foi preenchida, atualizar a senha também
      if (senha) {
        userData.senha = senha;
      }

      await updateDoc(userDoc, userData);
      fetchUsuarios(); // Atualiza a lista de usuários após edição
      setIsEditModalOpen(false); // Fecha o modal de edição
      setEditingUser(null); // Limpa o estado de edição
      setSenhaErro(""); // Limpa qualquer erro de senha
    } catch (error) {
      console.error("Erro ao editar usuário: ", error);
    }
  };

  // Chama a função para buscar usuários quando o componente é montado
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Exibindo a lista de usuários
  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gerenciar Usuários</h1>
      <p className="mb-6">Aqui você pode cadastrar, editar, excluir e visualizar todos os usuários.</p>

      {/* Botão para abrir o modal de cadastro */}
      <div className="mb-6">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600"
        >
          Cadastrar Novo Usuário
        </button>
      </div>

      {/* Tabela de Usuários */}
      <div className="overflow-x-auto bg-white shadow-md rounded-md">
        <table className="w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Telefone</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-4 py-2">{usuario.nome}</td>
                <td className="px-4 py-2">{usuario.email}</td>
                <td className="px-4 py-2">{usuario.telefone}</td>
                <td className="px-4 py-2">{usuario.role}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => {
                      setEditingUser(usuario);
                      setNewUserData(usuario); // Preenche os campos com os dados do usuário
                      setIsEditModalOpen(true);
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(usuario); // Preenche o estado de usuário a ser excluído
                      setIsDeleteModalOpen(true);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro de Usuário */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        className="modal w-96 bg-white p-6 rounded-lg shadow-lg"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-semibold mb-4">Cadastrar Novo Usuário</h2>
        <form onSubmit={handleAddUser}>
          <div className="mb-4">
            <label className="block mb-2">Nome:</label>
            <input
              type="text"
              value={newUserData.nome}
              onChange={(e) => setNewUserData({ ...newUserData, nome: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Email:</label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Telefone:</label>
            <input
              type="text"
              value={newUserData.telefone}
              onChange={(e) => setNewUserData({ ...newUserData, telefone: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Role:</label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
              required
            >
              <option value="admin">Admin</option>
              <option value="colaborador">Colaborador</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Senha:</label>
            <input
              type="password"
              value={newUserData.senha}
              onChange={(e) => setNewUserData({ ...newUserData, senha: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Confirmar Senha:</label>
            <input
              type="password"
              value={newUserData.confirmarSenha}
              onChange={(e) => setNewUserData({ ...newUserData, confirmarSenha: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          {senhaErro && <p className="text-red-500">{senhaErro}</p>}
          <div className="mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600"
            >
              Cadastrar
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-md ml-4 hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição de Usuário */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        className="modal w-96 bg-white p-6 rounded-lg shadow-lg"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-semibold mb-4">Editar Usuário</h2>
        <form onSubmit={handleEdit}>
          <div className="mb-4">
            <label className="block mb-2">Nome:</label>
            <input
              type="text"
              value={newUserData.nome}
              onChange={(e) => setNewUserData({ ...newUserData, nome: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Email:</label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Telefone:</label>
            <input
              type="text"
              value={newUserData.telefone}
              onChange={(e) => setNewUserData({ ...newUserData, telefone: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Role:</label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
              required
            >
              <option value="admin">Admin</option>
              <option value="colaborador">Colaborador</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Senha:</label>
            <input
              type="password"
              value={newUserData.senha}
              onChange={(e) => setNewUserData({ ...newUserData, senha: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Confirmar Senha:</label>
            <input
              type="password"
              value={newUserData.confirmarSenha}
              onChange={(e) => setNewUserData({ ...newUserData, confirmarSenha: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          {senhaErro && <p className="text-red-500">{senhaErro}</p>}
          <div className="mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600"
            >
              Atualizar
            </button>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-md ml-4 hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Exclusão de Usuário */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        className="modal w-96 bg-white p-6 rounded-lg shadow-lg"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-semibold mb-4">Excluir Usuário</h2>
        <p className="mb-6">Tem certeza que deseja excluir este usuário?</p>
        <div className="mt-4">
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600"
          >
            Excluir
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-gray-500 text-white px-6 py-2 rounded-md ml-4 hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UsuariosAdmin;
