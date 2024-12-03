import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';

export interface Customer {
  id: string;
  name: string;
}

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
      const response = await fetch('http://192.168.1.130:3001/api/customers');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Lista de Socios de Negocios</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <input
          type="text"
          placeholder="Search customers..."
          className="w-full p-2 border rounded mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading && <p className="text-center">Loading customers...</p>}
        {error && (
          <div className="text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <button
              onClick={fetchCustomers}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center mx-auto"
            >
              <RefreshCw size={18} className="mr-2" />
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <ul className="max-h-60 overflow-y-auto">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                <li
                  key={customer.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onSelectCustomer(customer);
                    onClose();
                  }}
                >
                  {customer.id} - {customer.name}
                </li>
              ))
            ) : (
              <li className="p-2 text-center text-gray-500">No customers found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CustomerSelectionModal;
