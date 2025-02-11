import React, { useState } from "react";

interface LoadItemModalProps {
    isOpen: boolean;
    initialData: string[]; // Datos iniciales para la tabla
    onClose: () => void;
    onSubmit: (data: string[]) => void; // Callback para enviar los datos procesados
}

const LoadItemModal: React.FC<LoadItemModalProps> = ({ isOpen, initialData, onClose, onSubmit }) => {
    const [tableData, setTableData] = useState<string[]>(initialData);

    const handleCellChange = (rowIndex: number, value: string) => {
        const newData = [...tableData];
        newData[rowIndex] = value;
        setTableData(newData);
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const pastedData = event.clipboardData.getData("text");
        const rows = pastedData
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line !== "");

        const updatedData = [...tableData];
        for (let i = 0; i < rows.length; i++) {
            if (i < updatedData.length) {
                updatedData[i] = rows[i];
            } else {
                updatedData.push(rows[i]);
            }
        }

        setTableData(updatedData);
    };

    const handleSubmit = () => {
        onSubmit(tableData);
        onClose();
    };

    const handleCancel = () => {
        setTableData(initialData); // Restaura los datos iniciales
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-[30%] min-w-[300px] flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Editar Tabla</h2>
                </div>

                <div className="p-4 flex-1 overflow-hidden">
                    <div
                        className="rounded-lg border border-gray-200 overflow-hidden"
                        onPaste={handlePaste}
                    >
                        <table className="w-full border-collapse">
                            <tbody>
                            {tableData.map((cell, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="border-b border-gray-200 last:border-b-0">
                                        <input
                                            type="text"
                                            value={cell}
                                            onChange={(e) => handleCellChange(rowIndex, e.target.value)}
                                            className="w-full px-4 py-2.5 text-center focus:outline-none focus:bg-blue-50 transition-colors"
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                    <button
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={handleSubmit}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoadItemModal;
