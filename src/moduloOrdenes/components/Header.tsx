import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {  Key, LogOut, User, X, AlertCircle } from "lucide-react";




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
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\s*([^;]*).*$)|^.*$/, "$1");
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
      <header className="bg-blue-500 text-white p-3 shadow-md">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          {/* Logo y título con mejor asociación visual */}
          <div className="flex items-center py-1">
            <BarChart2 className="mr-2 text-white" size={24} aria-hidden="true" />
            <h1 className="text-xl font-bold">Orden de Venta</h1>
          </div>

          {username && (
              <div className="flex flex-wrap items-center gap-1">
                {/* Información de usuario más clara */}
                <div className="flex items-center  px-3 py-1 rounded-md">
                  <User size={16} className="mr-1" aria-hidden="true" />
                  <span className="font-medium">{username}</span>
                </div>

                {/* Botones de acción con mejor jerarquía visual */}
                <div className="flex gap-2">
                  <button
                      type="button"
                      className="bg-white text-blue-600 px-3 py-1.5 rounded hover:bg-gray-100 transition flex items-center"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      aria-expanded={isMenuOpen}
                      aria-controls="password-modal"
                  >
                    <Key size={16} className="mr-1" aria-hidden="true" />
                    <span>Cambiar Clave</span>
                  </button>

                  <button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition flex items-center"
                      onClick={handleLogout}
                      aria-label="Cerrar sesión"
                  >
                    <LogOut size={16} className="mr-1" aria-hidden="true" />
                    <span>Salir</span>
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* Modal de cambio de contraseña mejorado */}
        {isMenuOpen && (
            <>
              {/* Overlay para indicar estado modal */}
              <div
                  className="fixed inset-0 bg-black bg-opacity-30"
                  onClick={() => setIsMenuOpen(false)}
                  aria-hidden="true"
              ></div>

              {/* Modal con mejor estructura y feedback */}
              <div
                  id="password-modal"
                  className="absolute right-4 top-16 p-4 bg-white text-gray-800 rounded-lg shadow-lg z-50 w-80 border border-gray-200"
                  role="dialog"
                  aria-labelledby="modal-title"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 id="modal-title" className="text-lg font-semibold text-gray-800">Cambiar Contraseña</h2>
                  <button
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Cerrar ventana"
                  >
                    <X size={20} />
                  </button>
                </div>

                {errorMessage && (
                    <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                      <AlertCircle size={16} className="inline mr-1" />
                      {errorMessage}
                    </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
                  <div className="mb-3">
                    <label htmlFor="old-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña Actual:
                    </label>
                    <input
                        type="password"
                        id="old-password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva Contraseña:
                    </label>
                    <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                        minLength= {6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres recomendado</p>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Contraseña:
                    </label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`border p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500 ${
                            confirmPassword && newPassword !== confirmPassword
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                        }`}
                        required
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        disabled={!oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    >
                      Confirmar Cambio
                    </button>
                  </div>
                </form>
              </div>
            </>
        )}
      </header>
  );
};

export default Header;
