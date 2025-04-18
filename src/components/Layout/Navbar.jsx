import { useAuth } from "../../context/AuthContext";
import { Menu } from "@headlessui/react";
import { FiUser, FiLogOut } from "react-icons/fi";

// Função para extrair as iniciais do nome
const getInitials = (nome) => {
  if (!nome) return "U";
  const words = nome.trim().split(" ");
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (
    words[0].charAt(0).toUpperCase() +
    words[words.length - 1].charAt(0).toUpperCase()
  );
};

const Navbar = ({ toggleSidebar }) => {
  const { userData, logout } = useAuth();

  const getTitle = () => {
    switch (userData?.role) {
      case "admin":
        return "Painel do Administrador";
      case "colaborador":
        return "Painel do Colaborador";
      case "cliente":
        return "Painel do Cliente";
      default:
        return "Painel";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-800 dark:text-white focus:outline-none"
          aria-label="Abrir menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
          {getTitle()}
        </h1>
      </div>

      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center gap-2 focus:outline-none">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center uppercase font-semibold text-sm">
            {getInitials(userData?.nome)}
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-800 dark:text-white">
            {userData?.nome || "Usuário"}
          </span>
        </Menu.Button>
        <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-50 overflow-hidden">
          <Menu.Item>
            {() => (
              <div className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-white text-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                <FiUser />
                Perfil
              </div>
            )}
          </Menu.Item>
          <Menu.Item>
            {() => (
              <div
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-300 text-sm hover:bg-red-100 dark:hover:bg-red-600 cursor-pointer"
              >
                <FiLogOut />
                Sair
              </div>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </header>
  );
};

export default Navbar;
