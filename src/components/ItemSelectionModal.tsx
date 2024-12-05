import React, { useState, } from 'react';
import { X, RefreshCw, Search } from 'lucide-react';
import Loader from "./Loader"

export interface Item {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ItemSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: Item) => void;
}

const ItemSelectionModal: React.FC<ItemSelectionModalProps> = ({ isOpen, onClose, onSelectItem }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://192.168.1.130:3001/api/items?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError('Error fetching items. Please check if the server is running and try again.');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Listado de Articulos</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center mb-4">
            <input
                type="text"
                placeholder="Buscar articulos"
                className="w-full p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
                type="button" // Aquí cambiamos el tipo a "button" para evitar el submit
                onClick={fetchItems}
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center"
            >
              <Search size={18} className="mr-1" />
              Buscar
            </button>
          </div>
          {loading && <Loader/>}
          {error && (
              <div className="text-center">
                <p className="text-red-500 mb-2">{error}</p>
                <button
                    onClick={fetchItems}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center mx-auto"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Reintentar
                </button>
              </div>
          )}
          {!loading && !error && (
              <ul className="max-h-60 overflow-y-auto">
                {items.length > 0 ? (
                    items.map(item => (
                        <li
                            key={item.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              onSelectItem(item);
                              onClose();
                            }}
                        >
                          {item.id + " - " + item.name}
                        </li>
                    ))
                ) : (
                    <li className="p-2 text-center text-gray-500">No se encontraron artículos</li>
                )}
              </ul>
          )}
        </div>
      </div>
  );
};

export default ItemSelectionModal;
