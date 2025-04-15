import React, { useState, useEffect } from 'react';
import Login from './components/Login.tsx';
import {
  Package, List, Plus, ChevronDown, ChevronUp,
  UserRound, Home, Settings, AlertCircle, Menu, X
} from 'lucide-react';
import SalesOrderForm from './Form/SalesOrderForm.tsx';
import SalesOrderList from './List/components/SalesOrderList.tsx';
import { SalesOrder } from './types.ts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChangePasswordModal from './components/ChangePasswordModal.tsx';
import {getToken} from "../utils/utils.ts";

const CONFIG = {
  host: '192.168.1.157',
  apiEndpoint: 'http://192.168.1.157:3001'
};

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('login');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [salesOrders, setSalesOrders] = useState<unknown[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [refreshList, setRefreshList] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  // Verificar token al inicio y periódicamente
  useEffect(() => {
    const savedToken = localStorage.getItem('userToken');
    const savedUsername = localStorage.getItem('username');
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
      setActiveTab('create');
      verifyToken(savedToken);
      fetchUserId(savedUsername, savedToken);
    }

    // Verificar el token cada 5 minutos
    const tokenCheckInterval = setInterval(() => {
      const currentToken = getToken()
      if (currentToken) {
        verifyToken(currentToken);
      }
    }, 12 * 60 * 1000); // 5 minutos

    return () => clearInterval(tokenCheckInterval);
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${CONFIG.apiEndpoint}/api/auth/verify-token`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenToVerify }),
      });

      if (!response.ok) {
        // Token expirado o inválido
        handleTokenExpiration();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  };

  const handleTokenExpiration = () => {
    // Mostrar modal de sesión expirada
    setShowSessionExpiredModal(true);
  };

  const handleSessionExpiredConfirm = () => {
    // Limpiar datos y redireccionar a login
    setToken(null);
    setUsername(null);
    setUserId(null);
    setActiveTab('login');
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    setShowSessionExpiredModal(false);
  };

  const fetchUserId = async (username: string, token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${CONFIG.apiEndpoint}/api/auth/get-userid?username=${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        // Token expirado
        handleTokenExpiration();
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error(`Error al obtener información de usuario: ${response.status}`);

      const userData = await response.json();
      setUserId(userData.USERID);
    } catch (error) {
      console.error('Error fetching userId:', error);
      setError('No se pudo cargar la información del usuario. Por favor, intente de nuevo.');
      toast.error('Error al cargar datos de usuario');
    } finally {
      setIsLoading(false);
    }
  };

  // Interceptar solicitudes fetch para manejar errores 401 (token expirado)
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const response = await originalFetch.apply(this, args);

      if (response.status === 401 && token) {
        // Si recibimos un 401 y teníamos un token, probablemente expiró
        handleTokenExpiration();
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch; // Restaurar fetch original al desmontar
    };
  }, [token]);

  const handleCreateSalesOrder = (newOrder: SalesOrder) => {
    setSalesOrders((prevOrders) => [...prevOrders, { ...newOrder, id: Date.now() }]);
  };

  const handleLogin = async (token: string, username: string) => {
    setToken(token);
    setUsername(username);
    setActiveTab('create');
    localStorage.setItem('userToken', token);
    localStorage.setItem('username', username);
    await fetchUserId(username, token);
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    setUserId(null);
    setActiveTab('login');
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    toast.info('Sesión cerrada correctamente');
  };

  const getBreadcrumbs = () => {
    const paths = [
      { name: 'Home', path: 'home', icon: <Home size={14} className="mr-1" /> },
      { name: 'Órdenes', path: 'orders', icon: <Package size={14} className="mr-1" /> },
    ];
    if (activeTab === 'create') paths.push({ name: 'Crear', path: 'create', icon: <Plus size={14} className="mr-1" /> });
    else if (activeTab === 'view') paths.push({ name: 'Listado', path: 'view', icon: <List size={14} className="mr-1" /> });
    return paths;
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Cargando aplicación...</p>
          </div>
        </div>
    );
  }

  return (
      <>
        {!token ? (
            <Login onLogin={handleLogin} />
        ) : (
            <div className="min-h-screen bg-gray-100 relative">
              {/* Top Navbar (solo móvil) */}
              <div className="md:hidden flex items-center justify-between bg-white p-4 shadow fixed w-full top-0 z-50">
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                  <Menu size={24} />
                </button>
              </div>

              {/* Layout principal */}
              <div className="flex flex-col md:flex-row">
                {/* Sidebar */}
                <aside
                    className={`bg-white shadow-md h-full md:h-screen w-64 p-4 transition-transform duration-300 z-40 
              fixed md:static top-0 left-0 md:translate-x-0 
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
                >
                  {/* Botón cerrar (solo móvil) */}
                  <div className="md:hidden flex justify-end mb-4">
                    <button onClick={() => setSidebarOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex items-center mb-6">
                    <img src="/favicon.png" alt="Logo" width="32" height="32" className="mr-2" />
                    <span className="font-bold text-gray-800">RL WebApp</span>
                  </div>

                  <div className="mb-6 font-medium text-gray-700 flex items-center p-3 bg-gray-50 rounded-md">
                    <UserRound size={18} className="mr-2" />
                    <div className="text-sm">{username || 'Usuario'}</div>
                  </div>

                  <nav>
                    <div className="text-gray-500 text-sm mb-2 font-medium">Módulos</div>
                    <div className="space-y-2">
                      <div>
                        <button
                            className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded justify-between"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                    <span className="flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Órdenes de Venta
                    </span>
                          {dropdownOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>

                        <div className={`pl-6 mt-1 space-y-1 ${dropdownOpen ? 'block' : 'hidden'}`}>
                          <button
                              className={`block w-full text-left px-4 py-2 rounded flex items-center transition ${
                                  activeTab === 'create'
                                      ? 'bg-blue-100 text-blue-700 font-medium'
                                      : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={() => setActiveTab('create')}
                          >
                            <Plus size={15} className="mr-2" />
                            Crear
                          </button>
                          <button
                              className={`block w-full text-left px-4 py-2 rounded flex items-center transition ${
                                  activeTab === 'view'
                                      ? 'bg-blue-100 text-blue-700 font-medium'
                                      : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={() => setActiveTab('view')}
                          >
                            <List size={15} className="mr-2" />
                            Listado
                          </button>
                        </div>
                      </div>
                    </div>
                  </nav>

                  {/* Configuración al final */}
                  <div className="relative mt-6">
                    <button
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition"
                    >
                <span className="flex items-center">
                  <Settings size={16} className="mr-2" />
                  Configuración
                </span>
                      {settingsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {settingsOpen && (
                        <div className="absolute bottom-12 left-4 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{username}</p>
                          </div>

                          <ul className="py-1 text-sm text-gray-700">
                            <li>
                              <button
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                                  onClick={() => {
                                    setIsChangePassOpen(true);
                                    setSettingsOpen(false);
                                  }}
                              >
                                Cambiar Clave
                              </button>
                            </li>
                            <li>
                              <button
                                  onClick={handleLogout}
                                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 transition"
                              >
                                Cerrar sesión
                              </button>
                            </li>
                          </ul>
                        </div>
                    )}
                  </div>

                  {isChangePassOpen && (
                      <ChangePasswordModal
                          username={username}
                          onClose={() => setIsChangePassOpen(false)}
                      />
                  )}
                </aside>

                {/* Fondo oscuro para sidebar móvil */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-30 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main */}
                <main className="flex-1 p-4 pt-20 md:pt-5 md:p-5 overflow-auto">
                  <nav className="mb-4">
                    <ol className="flex items-center text-sm text-gray-600 mb-3 space-x-2">
                      {getBreadcrumbs().map((item, index) => (
                          <React.Fragment key={item.path}>
                            {index > 0 && <span>{'>'}</span>}
                            <li className={index === getBreadcrumbs().length - 1 ? 'font-medium text-gray-900' : ''}>
                              <button
                                  className="flex items-center hover:text-blue-600"
                                  onClick={() => ['create', 'view'].includes(item.path) && setActiveTab(item.path)}
                              >
                                {item.icon}
                                {item.name}
                              </button>
                            </li>
                          </React.Fragment>
                      ))}
                    </ol>
                  </nav>

                  {error && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700 rounded">
                        <p className="text-sm">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto">X</button>
                      </div>
                  )}

                  <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6">
                      {activeTab === 'create' ? (
                          <SalesOrderForm onCreateSalesOrder={handleCreateSalesOrder} username={username} />
                      ) : (
                          <SalesOrderList
                              salesOrders={salesOrders}
                              username={username}
                              userId={userId}
                              refresh={refreshList}
                              onModalClose={() => setRefreshList(prev => prev + 1)}
                          />
                      )}
                    </div>
                  </div>
                </main>
              </div>

              <ToastContainer />
            </div>
        )}

        {/* Modal de Sesión Expirada */}
        {showSessionExpiredModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in">
                <div className="mb-4 flex items-center justify-center text-red-500">
                  <AlertCircle size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  Sesión Expirada
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Tu sesión ha expirado por motivos de seguridad. Por favor, inicia sesión nuevamente para continuar.
                </p>
                <div className="flex justify-center">
                  <button
                      type="button"
                      onClick={handleSessionExpiredConfirm}
                      className="py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Iniciar sesión
                  </button>
                </div>
              </div>
            </div>
        )}
      </>
  );

}

export default App;