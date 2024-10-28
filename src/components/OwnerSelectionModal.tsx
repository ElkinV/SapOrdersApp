import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface Owner {
  id: string;
  name: string;
}

interface OwnerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOwner: (owner: Owner) => void;
}



const OwnerSelectionModal: React.FC<OwnerSelectionModalProps> = ({ isOpen, onClose, onSelectOwner }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const owners: Owner[] = [
    { id: '34', name: 'Acosta Nieto' },
    { id: '74', name: 'Arellano' },
    { id: '80', name: 'Atencia Valeta' },
    { id: '35', name: 'Banquez Salas' },
    { id: '36', name: 'Bossio De santis' },
    { id: '37', name: 'Camacho Villarreal' },
    { id: '38', name: 'Camargo Arroyo' },
    { id: '6', name: 'Cantor' },
    { id: '39', name: 'Carrillo Borja' },
    { id: '78', name: 'Castro Florez' },
    { id: '40', name: 'Diaz Crespo' },
    { id: '76', name: 'Gaviria' },
    { id: '82', name: 'Gomez Ortiz' },
    { id: '41', name: 'Guerra Sevilla' },
    { id: '42', name: 'Guerrero Alvarez' },
    { id: '69', name: 'Haad Salgado' },
    { id: '43', name: 'Julio Galvis' },
    { id: '44', name: 'Lemus Yidios' },
    { id: '45', name: 'Leones Arias' },
    { id: '46', name: 'Lopez Ballesta' },
    { id: '64', name: 'Lubo Prado' },
    { id: '47', name: 'Magallanes Torres' },
    { id: '62', name: 'Martinez Quevedo' },
    { id: '48', name: 'Mogollon Marquez' },
    { id: '49', name: 'Morales Acuña' },
    { id: '50', name: 'Olivo Ortega' },
    { id: '51', name: 'Otero Juris' },
    { id: '52', name: 'Padilla Padilla' },
    { id: '67', name: 'Palacio Pantoja' },
    { id: '53', name: 'Perez Garcia' },
    { id: '54', name: 'Rodriguez Arana' },
    { id: '84', name: 'Rodriguez Sulbaran' },
    { id: '61', name: 'Rodriguez Valero' },
    { id: '88', name: 'Ruiz Rambal' },
    { id: '71', name: 'Sanchez' },
    { id: '86', name: 'Sotomayor' },
    { id: '55', name: 'Suarez Herrera' },
    { id: '56', name: 'Suarez Manrique' },
    { id: '57', name: 'Torres Sanchez' },
    { id: '58', name: 'Valiente Castilla' },
    { id: '59', name: 'Zabala Ramirez' },

    // Agrega más propietarios según sea necesario
  ];

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Seleccionar Propietario</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <input
          type="text"
          placeholder="Buscar propietario"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <ul className="max-h-60 overflow-y-auto">
          {filteredOwners.length > 0 ? (
            filteredOwners.map((owner) => (
              <li
                key={owner.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onSelectOwner(owner);
                  onClose();
                }}
              >
                {owner.name}
              </li>
            ))
          ) : (
            <li className="p-2 text-center text-gray-500">No owners found</li>
          )}
        </ul>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
          Cerrar
        </button>
      </div>
    </div>
  );
};
    

export default OwnerSelectionModal;
