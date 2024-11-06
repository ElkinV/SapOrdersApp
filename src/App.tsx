import { useState } from 'react';
import Login from './components/Login';
import { Package, List } from 'lucide-react';
import Header from './components/Header';
import SalesOrderForm from './components/SalesOrderForm';
import SalesOrderList from './components/SalesOrderList';
import { SalesOrder } from './types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'view' | 'login'>('login');
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const handleCreateSalesOrder = (newOrder: SalesOrder) => {
    setSalesOrders([...salesOrders, { ...newOrder, id: Date.now() }]);
  };

  const handleLogin = (token: string, username: string) => {
    setToken(token);
    setUsername(username);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header username={username} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-grow" />
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 px-6 text-center ${
                activeTab === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setActiveTab('create')}
              disabled={!token}
            >
              <Package className="inline-block mr-2" />
              Crear Ordenes de Venta
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center ${
                activeTab === 'view' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setActiveTab('view')}
              disabled={!token}
            >
              <List className="inline-block mr-2" />
              Listado de Ordenes
            </button>
          </div>
          <div className="p-6">
            {activeTab === 'login' ? (
              <Login onLogin={handleLogin} />
            ) : activeTab === 'create' ? (
              <SalesOrderForm onCreateSalesOrder={handleCreateSalesOrder} />
            ) : (
              <SalesOrderList salesOrders={salesOrders} />
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;