import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { toast } from 'react-toastify';



const host = "192.168.1.157";

interface HeaderProps {
  username: string | null;
}


const Header: React.FC<HeaderProps> = ({ username}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChangePassword = async () => {
    // Validación del lado del cliente
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas nuevas no coinciden.');
      return;
    }

    setErrorMessage(null);

    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch(`http://${host}:3001/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          oldPassword,
          newPassword,
          confirmPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error desconocido');
      }else{
        toast.success("Contraseña Actualizada satisfactoriamente")
      }
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsMenuOpen(false);
    } catch (error) {
        if( typeof error === "object" && error && "message" in error && typeof error.message === "string"){
          console.error('Error changing password:', error);
          toast.error('Error al Cambiar la clave: '+ error.message);
          setErrorMessage(error.message);
        }
    }
  };

  const handleLogout = () => {
    // Eliminar el token de las cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Recargar la página para volver al login
    window.location.reload();
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
                    className="bg-white text-blue-600 px-4 py-2 rounded mr-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  Cambiar Clave
                </button>
                <button
                    className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded"
                    onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </div>
          )}
        </div>
        {isMenuOpen && (
            <div className="absolute right-2 top-20 p-3 bg-white text-black rounded shadow z-50 w-80">
              <h2 className="text-lg font-bold mb-2">Cambiar Clave</h2>
              {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
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
                  className="bg-blue-600 text-white px-4 py-2 rounded w-full"
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
