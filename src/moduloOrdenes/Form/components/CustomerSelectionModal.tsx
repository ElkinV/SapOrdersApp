import React, {useEffect, useState} from 'react';
import {RefreshCw, X} from 'lucide-react';
import {Customer} from "../../types.ts";

const host = "192.168.1.109";

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

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch(`http://${host}:3001/api/customers/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError('Error fetching customers. Please check if the server is running and try again.');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>

    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-in fade-in">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Lista de Socios de Negocios</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
              <X size={24}/>
            </button>
          </div>
          <div className="p-4">
            <input
                type="text"
                placeholder="Search customers..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500"/>
                </div>
            )}
            {error && (
                <div className="text-center py-4">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                      onClick={fetchCustomers}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center mx-auto gap-2"
                  >
                    <RefreshCw size={18}/>
                    Retry
                  </button>
                </div>
            )}
            {!loading && !error && (
                <ul className="max-h-[40vh] overflow-y-auto rounded-lg divide-y divide-gray-100">
                  {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(customer => (
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
                        No customers found
                      </li>
                  )}
                </ul>
            )}
          </div>
        </div>
      </div>
  );
};

export default CustomerSelectionModal;
