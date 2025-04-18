import React, { useState, KeyboardEvent } from 'react';
import {RefreshCw, Search, X} from 'lucide-react';
import { Customer } from "../../types.ts";
import {getToken, CONFIG} from "../../../utils/utils.ts";



interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({ isOpen, onClose, onSelectCustomer }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    setCustomers([]); // Limpiar resultados anteriores
    try {
      if (!searchTerm.trim()) return;
      const token = getToken();
      const response = await fetch(`http://${CONFIG.host}:3001/api/customers/list/?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('No se pudieron obtener los clientes');
      const data = await response.json();
      setCustomers(data.length ? data : []); // Asegurar que esté limpio si no hay resultados
    } catch (err) {
      setError(`Error al obtener los clientes. Verifica si el servidor está disponible. ${err}`);
    } finally {
      setLoading(false);
    }
  };


  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') fetchCustomers();
  };



  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg sm:max-w-2xl animate-in fade-in max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Lista de Socios de Negocios</h2>
            <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mb-4">
              <input
                  type="text"
                  placeholder="Buscar clientes..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
              />

              {searchTerm && (
                  <button
                      onClick={() => setSearchTerm('')}
                      className="text-sm text-blue-500 hover:underline sm:whitespace-nowrap"
                  >
                    Limpiar
                  </button>
              )}

              <button
                  type="button"
                  onClick={fetchCustomers}
                  disabled={!searchTerm.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 sm:flex-shrink-0"
              >
                <Search size={18} />
                Buscar
              </button>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500" />
                </div>
            )}

            {error && (
                <div className="text-center py-4">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                      onClick={fetchCustomers}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center mx-auto gap-2"
                  >
                    <RefreshCw size={18} />
                    Reintentar
                  </button>
                </div>
            )}

            {!loading && !error && (
                <>
                  {customers.length > 0 && (
                      <p className="text-sm text-gray-500 mb-2">{customers.length} cliente(s) encontrado(s)</p>
                  )}
                  <ul className="max-h-[40vh] overflow-y-auto rounded-lg divide-y divide-gray-100">
                    {customers.length > 0 ? (
                        customers.map((customer) => (
                            <li
                                key={customer.id}
                                className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => {
                                  onSelectCustomer(customer);
                                  onClose();
                                }}
                            >
                              {customer.id} - {customer.name}
                            </li>
                        ))
                    ) : (
                        <li className="py-6 text-center text-gray-500 bg-gray-50 rounded-lg">
                          No se encontraron clientes
                        </li>
                    )}
                  </ul>
                </>
            )}
          </div>
        </div>
      </div>
  );

};

export default CustomerSelectionModal;
