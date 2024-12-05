import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';

interface HeaderProps {
  username: string | null;
  onChangePassword: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onChangePassword }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    console.log('Button clicked');
    try {
      const response = await fetch('http://192.168.1.130:3001/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error desconocido');
      }

      const data = await response.json();
      alert(data.message);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.message);
    }
  };

  return (
    <header className="bg-blue-400 text-white p-4 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <BarChart2 className="mr-2" size={24} />
          <h1 className="text-2xl font-bold">Orden de Venta</h1>
        </div>
        {username && (
          <div className="flex items-center">
            <div className="text-lg font-semibold underline mr-4">RL | {username}</div>
            <button 
              className="bg-white text-blue-600 px-4 py-2 rounded" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              Cambiar Clave
            </button>
          </div>
        )}
      </div>
      {isMenuOpen && (
        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 p-4 bg-white text-black rounded shadow z-10">
          <h2 className="text-lg font-bold mb-2">Cambiar Clave</h2>
          <div className="mb-2">
            <label className="block mb-1">Clave Anterior:</label>
            <input 
              type="password" 
              value={oldPassword} 
              onChange={(e) => setOldPassword(e.target.value)} 
              className="border p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Clave Nueva:</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="border p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Confirmación Clave Nueva:</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="border p-2 w-full"
            />
          </div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded" 
            onClick={handleChangePassword}
          >
            Confirmar
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;