import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import {
  FiHome,
  FiLogOut,
  FiMoon,
  FiSun,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiBarChart,
  FiBriefcase,
} from "react-icons/fi";

const Sidebar = ({
  collapsed,
  setCollapsed,
  sidebarOpen,
  setSidebarOpen,
  section,
  setSection,
}) => {
  const { userData, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleCollapse = () => setCollapsed(!collapsed);

  const getSidebarItems = () => {
    if (userData?.role === "admin") {
      return [
        { icon: <FiHome />, label: "Início", section: "inicio" },
        { icon: <FiUsers />, label: "Usuários", section: "usuarios" },
        { icon: <FiBarChart />, label: "Relatórios", section: "relatorios" },
        { icon: <FiBriefcase />, label: "Serviços", section: "servicos" },
      ];
    }

    if (userData?.role === "colaborador") {
      return [
        { icon: <FiHome />, label: "Início", section: "inicio" },
        { icon: <FiBriefcase />, label: "Tarefas", section: "tarefas" },
        { icon: <FiBarChart />, label: "Relatórios", section: "relatorios" },
      ];
    }

    if (userData?.role === "cliente") {
      return [
        { icon: <FiHome />, label: "Início", section: "inicio" },
        { icon: <FiBriefcase />, label: "Serviços", section: "servicos" },
      ];
    }

    return [];
  };

  return (
    <aside
      className={`bg-white dark:bg-gray-800 shadow-lg fixed top-16 left-0 z-50 transition-all duration-300 flex flex-col
        ${collapsed ? "w-20" : "w-56"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div className="flex justify-end p-2">
        <button
          onClick={toggleCollapse}
          className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition"
        >
          {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex flex-col gap-2 px-3">
        {getSidebarItems().map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            active={section === item.section}
            onClick={() => {
              setSection(item.section);
              setSidebarOpen(false);
            }}
          />
        ))}
      </nav>

      <div className="flex-grow" />

      <div className="flex flex-col gap-2 px-3 py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition"
        >
          {darkMode ? <FiSun /> : <FiMoon />}
          {!collapsed && (darkMode ? "Modo Claro" : "Modo Escuro")}
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition"
        >
          <FiLogOut />
          {!collapsed && "Sair"}
        </button>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, collapsed, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-2 py-2 rounded-lg transition w-full
      ${active ? "bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
    `}
  >
    {icon}
    {!collapsed && <span className="text-sm font-medium">{label}</span>}
  </button>
);

export default Sidebar;
