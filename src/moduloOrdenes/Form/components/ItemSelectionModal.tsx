import React, { useState, KeyboardEvent } from 'react';
import { X, RefreshCw, Search } from 'lucide-react';
import Loader from "../../components/Loader.tsx"
import { Item } from "../../types.ts"

const host = "192.168.1.157";

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
    if (!searchTerm.trim()) return;
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
          throw new Error('No autorizado. Inicia sesión nuevamente.');
        }
        throw new Error('No se pudieron obtener los artículos.');
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener los artículos.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') fetchItems();
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg sm:max-w-2xl animate-in fade-in max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Listado de Artículos</h2>
            <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-2 mb-4 items-stretch sm:items-center">
              <input
                  type="text"
                  placeholder="Buscar artículos"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
              />
              <button
                  type="button"
                  onClick={fetchItems}
                  disabled={!searchTerm.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Search size={18} />
                Buscar
              </button>
              {searchTerm && (
                  <button
                      onClick={() => setSearchTerm('')}
                      className="text-sm text-blue-500 hover:underline whitespace-nowrap"
                  >
                    Limpiar
                  </button>
              )}
            </div>

            {loading && <Loader />}

            {error && (
                <div className="text-center py-4">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                      onClick={fetchItems}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center mx-auto gap-2"
                  >
                    <RefreshCw size={18} />
                    Reintentar
                  </button>
                </div>
            )}

            {!loading && !error && (
                <>
                  {items.length > 0 && (
                      <p className="text-sm text-gray-500 mb-2">{items.length} artículo(s) encontrado(s)</p>
                  )}
                  <ul className="max-h-[40vh] overflow-y-auto rounded-lg divide-y divide-gray-100">
                    {items.length > 0 ? (
                        items.map((item) => (
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
                </>
            )}
          </div>
        </div>
      </div>
  );

};

export default ItemSelectionModal;
