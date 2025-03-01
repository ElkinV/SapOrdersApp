import React, { useState, } from 'react';
import { X, RefreshCw, Search } from 'lucide-react';
import Loader from "../../components/Loader.tsx"
import {Item} from "../../types.ts"

const host ="192.168.1.157";

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
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");

      const response = await fetch(`http://${host}:3001/api/items/?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-in fade-in">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Listado de Artículos</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
              <X size={24}/>
            </button>
          </div>
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <input
                  type="text"
                  placeholder="Buscar artículos"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                  type="button"
                  onClick={fetchItems}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <Search size={18}/>
                Buscar
              </button>
            </div>

            {loading && <Loader/>}

            {error && (
                <div className="text-center py-4">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                      onClick={fetchItems}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center mx-auto gap-2"
                  >
                    <RefreshCw size={18}/>
                    Reintentar
                  </button>
                </div>
            )}

            {!loading && !error && (
                <ul className="max-h-[40vh] overflow-y-auto rounded-lg divide-y divide-gray-100">
                  {items.length > 0 ? (
                      items.map(item => (
                          <li
                              key={item.itemCode}
                              className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => {
                                onSelectItem(item);
                                onClose();
                              }}
                          >
                            {item.itemCode + " - " + item.name}
                          </li>
                      ))
                  ) : (
                      <li className="py-6 text-center text-gray-500 bg-gray-50 rounded-lg">
                        No se encontraron artículos
                      </li>
                  )}
                </ul>
            )}
          </div>
        </div>
      </div>
  );
};

export default ItemSelectionModal;
