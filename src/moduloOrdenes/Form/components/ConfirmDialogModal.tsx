import React from 'react';
import { X } from 'lucide-react';

/**
 * Componente de diálogo de confirmación modal
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla si el diálogo está abierto o cerrado
 * @param {Function} props.onClose - Función a ejecutar al cerrar el diálogo
 * @param {Function} props.onConfirm - Función a ejecutar al confirmar la acción
 * @param {string} props.title - Título del diálogo
 * @param {string} props.message - Mensaje principal del diálogo
 * @param {string} [props.confirmText="Confirmar"] - Texto del botón de confirmación
 * @param {string} [props.cancelText="Cancelar"] - Texto del botón de cancelación
 * @param {string} [props.confirmButtonClass="bg-red-600"] - Clase CSS para el botón de confirmación
 */
const ConfirmDialog = ({
                           isOpen,
                           onClose,
                           onConfirm,
                           title,
                           message,
                           confirmText = "Confirmar",
                           cancelText = "Cancelar",
                           confirmButtonClass = "bg-red-600 hover:bg-red-700"
                       }) => {
    if (!isOpen) return null;

    // Manejador para cerrar el modal al hacer clic fuera de él
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Prevenir que el evento de clic se propague al backdrop
    const handleDialogClick = (e) => {
        e.stopPropagation();
    };

    // Manejar tecla Escape para cerrar el modal
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevenir scroll en el fondo cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    // Enfocar el botón cancelar cuando se abre el modal (para mejor accesibilidad)
    React.useEffect(() => {
        if (isOpen) {
            const cancelButton = document.getElementById('cancel-button');
            if (cancelButton) {
                cancelButton.focus();
            }
        }
    }, [isOpen]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all"
                onClick={handleDialogClick}
            >
                <div className="flex justify-between items-center border-b border-gray-200 p-4">
                    <h3 id="dialog-title" className="text-lg font-medium text-gray-900">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="text-sm text-gray-600">
                        {message}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            id="cancel-button"
                            type="button"
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${confirmButtonClass}`}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;