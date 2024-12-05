import React, { useState } from "react";
import {Plus} from "lucide-react";

interface Item {
    itemCode: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
    warehouse: string;
}

const ArticlesForm: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);

    const addItem = () => {
        setCurrentEditIndex(items.length); // Prepara el índice para el nuevo elemento
        setIsModalOpen(true); // Abre el modal para agregar el artículo
    };

    const handleSaveItem = (newItem: Item) => {
        const updatedItems = [...items];
        if (currentEditIndex !== null) {
            updatedItems[currentEditIndex] = newItem; // Editar un artículo existente
        } else {
            updatedItems.push(newItem); // Agregar un artículo nuevo
        }
        setItems(updatedItems);
        setIsModalOpen(false);
        setCurrentEditIndex(null);
    };

    const handleDeleteItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
    };

    const handleEditItem = (index: number) => {
        setCurrentEditIndex(index); // Establecer el índice para edición
        setIsModalOpen(true); // Abrir el modal
    };

    return (
        <div className="overflow-x-auto">

            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                <thead>
                <tr>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Número de Artículo</th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Descripción</th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Cantidad</th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Precio Unitario</th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Total</th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Almacén</th>
                    <th className="px-4 py-2"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                    <tr key={index}>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-900">{item.itemCode}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">{item.name}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">{item.quantity}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">${item.unitPrice.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">${item.total.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">{item.warehouse}</td>
                        <td className="whitespace-nowrap px-4 py-2">
                            <button
                                onClick={() => handleEditItem(index)}
                                className="px-2 py-1 bg-yellow-300 text-yellow-800 rounded-md hover:bg-yellow-400"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => handleDeleteItem(index)}
                                className="ml-2 px-2 py-1 bg-red-300 text-red-800 rounded-md hover:bg-red-400"
                            >
                                Eliminar
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button
                type="button"
                onClick={addItem}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
            >
                <Plus size={18} className="mr-2"/>
                Añadir Articulo
            </button>

            {isModalOpen && (
                <ItemModal
                    item={currentEditIndex !== null ? items[currentEditIndex] : undefined}
                    onSave={handleSaveItem}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

interface ItemModalProps {
    item?: Item;
    onSave: (item: Item) => void;
    onClose: () => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ item, onSave, onClose }) => {
    const [itemCode, setItemCode] = useState(item?.itemCode || "");
    const [name, setName] = useState(item?.name || "");
    const [quantity, setQuantity] = useState(item?.quantity || 1);
    const [unitPrice, setUnitPrice] = useState(item?.unitPrice || 0);
    const [warehouse, setWarehouse] = useState(item?.warehouse || "");

    const handleSave = () => {
        const total = quantity * unitPrice;
        onSave({ itemCode, name, quantity, unitPrice, total, warehouse });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md w-96">
                <h3 className="text-lg font-bold mb-4">Artículo</h3>
                <input
                    type="text"
                    placeholder="Número de artículo"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="block w-full mb-2 p-2 border rounded-md"
                />
                <input
                    type="text"
                    placeholder="Descripción"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full mb-2 p-2 border rounded-md"
                />
                <input
                    type="number"
                    placeholder="Cantidad"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="block w-full mb-2 p-2 border rounded-md"
                    min={1}
                />
                <input
                    type="number"
                    placeholder="Precio Unitario"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="block w-full mb-2 p-2 border rounded-md"
                    min={0}
                />
                <input
                    type="text"
                    placeholder="Almacén"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="block w-full mb-2 p-2 border rounded-md"
                />
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArticlesForm;
