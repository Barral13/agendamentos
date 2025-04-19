import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";

const DashboardLayout = ({ children, section, setSection }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "auto";
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Navbar toggleSidebar={toggleSidebar} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex pt-16 overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          section={section}
          setSection={setSection}
        />
        <main
          className={`transition-all duration-300 ease-in-out w-full p-4 overflow-hidden ${collapsed ? "md:ml-20" : "md:ml-56"
            }`}
        >
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
