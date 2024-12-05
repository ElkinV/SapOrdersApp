import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import { Package, List } from 'lucide-react';
import Header from './components/Header';
import SalesOrderForm from './components/SalesOrderForm';
import SalesOrderList from './components/SalesOrderList';
import { SalesOrder } from './types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('login');
  const [salesOrders, setSalesOrders] = useState<any[]>([]);

  const handleCreateSalesOrder = (newOrder: SalesOrder) => {
    setSalesOrders([...salesOrders, { ...newOrder, id: Date.now() }]);
  };

  const handleLogin = async (token: string, username: string) => {
    setToken(token);
    setUsername(username);
    setActiveTab('create');

    try {
      const response = await fetch(`http://192.168.1.130:3001/api/get-userid?username=${username}`);
      const userData = await response.json();
      setUserId(userData.USERID);
    } catch (error) {
      console.error('Error fetching userId:', error);
    }
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
                activeTab === 'create' ? 'bg-blue-400 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setActiveTab('create')}
              disabled={!token}
            >
              <Package className="inline-block mr-2" />
              Crear Ordenes de Venta
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center ${
                activeTab === 'view' ? 'bg-blue-400 text-white' : 'bg-gray-100'
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
              <SalesOrderForm onCreateSalesOrder={handleCreateSalesOrder} username={username} />
            ) : (
              <SalesOrderList salesOrders={salesOrders} username={username} userId={userId} />
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;