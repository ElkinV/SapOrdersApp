import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface ChangePasswordModalProps {
    username: string | null;
    onClose: () => void;
}

const host = "192.168.1.157";

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ username, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChangePassword = async () => {
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
            }

            toast.success("Contraseña actualizada satisfactoriamente");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (error) {
            if (typeof error === "object" && error && "message" in error && typeof error.message === "string") {
                toast.error('Error al cambiar la clave: ' + error.message);
                setErrorMessage(error.message);
            }
        }
    };

    return (
        <>
            {/* Fondo desenfocado */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Modal centrado */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                      bg-white text-gray-800 rounded-xl shadow-2xl z-50 w-[90%] max-w-md
                      border border-gray-200 p-6 transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Cambiar Contraseña</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-md">
                        <AlertCircle size={16} className="inline mr-1" />
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
                    <div className="mb-4">
                        <label htmlFor="old-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña Actual:
                        </label>
                        <input
                            type="password"
                            id="old-password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Nueva Contraseña:
                        </label>
                        <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                            minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres recomendado</p>
                    </div>

                    <div className="mb-5">
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Contraseña:
                        </label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                confirmPassword && newPassword !== confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            required
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
                            disabled={!oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        >
                            Confirmar Cambio
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ChangePasswordModal;
