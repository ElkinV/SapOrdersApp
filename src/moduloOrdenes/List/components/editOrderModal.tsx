    import React, { useState, useEffect } from "react";
    import { X, PlusCircle, Trash2, Loader2 } from "lucide-react";
    import { DocumentLineItems, OrderDetails } from "../../types.ts";
    import ItemSelectionModal from "../../Form/components/ItemSelectionModal.tsx";
    import {handleSelectItem} from "../../components/handleSelectItem.tsx";
    import { toast } from 'react-toastify';

    const API_HOST = "192.168.1.157";

    interface EditOrderProps {
        isOpen: boolean;
        onClose: () => void;
        docEntry: number;
        details: OrderDetails[];
    }

    export const EditOrderModal: React.FC<EditOrderProps> = ({ isOpen, onClose, docEntry, details }) => {
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [items, setItems] = useState<DocumentLineItems[]>([]);
        const [isItemModalOpen, setIsItemModalOpen] = useState(false);
        const [listNum, setListNum] = useState<number | 0>(-9);

        useEffect(() => {
            const handleKeyDown = (e) => {
                if (e.key === "Escape") {
                    onClose();
                }
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }, [onClose]);



        useEffect(() => {
            if (isOpen) {
                setItems(details);
                setListNum(details[0].listNum)
                console.log(listNum)
               // Sincroniza `items` con `details` al abrir el modal


            }
            const fetchDetails = async () => {
                if (!isOpen || !docEntry) return;

                setLoading(true);
                setError(null);

                try {
                    const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
                    const response = await fetch(
                        `http://${API_HOST}:3001/api/orders/itemByOrder?docEntry=${docEntry}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data: DocumentLineItems[] = await response.json();
                    console.log("DATA",data);
                    setItems(data || []);
                } catch (err) {
                    console.error("Error fetching orders:", err);
                    setError(`Failed to fetch details: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                    setLoading(false);
                }
            };

            fetchDetails();
        }, [isOpen, docEntry, details, listNum]);

        const handleInputChange = (index: number, field: string, value: number) => {
            setItems((prevItems) => {
                const updatedItems = [...prevItems];
                updatedItems[index] = {
                    ...updatedItems[index],
                    [field]: value,
                };
                return updatedItems;
            });
        };

        const handleDeleteItem = (index: number,e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault(); // Prevenir la acción predeterminada (enviar formulario)
            const updatedItems = items.filter((_, i) => i !== index);
            setItems(updatedItems);
        }


        const handleAddItem = () => {
            setIsItemModalOpen(true);
        };

        const updateSalesOrder = async(data: DocumentLineItems[], docEntry: number) =>{
            const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            const body = {
                items: data,
                docEntry: docEntry,
            }
            const response = await fetch(`http://${API_HOST}:3001/api/orders/edit`,{
                method: "PATCH",
                headers: { "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })
            console.log("Enviar post", data)
        }

        const handleUpdate = async (data: DocumentLineItems[], docEntry:number)  => {

            try {
                await updateSalesOrder(data, docEntry); // Aquí va tu lógica real
                toast.success("Orden actualizada correctamente ✅");
            } catch (error) {
                console.error(error);
                toast.error("Error al actualizar la orden ❌");
            }

        }

        return (
            isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden sm:w-full sm:max-w-[90%] lg:max-w-4xl">
                        {/* Header */}
                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-2xl font-semibold text-gray-900">Editar Orden</h2>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Cerrar">
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Add Item */}
                        <div className="p-4">
                            <button
                                onClick={handleAddItem}
                                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            >
                                <PlusCircle size={18} />
                                Añadir 1 Artículo
                            </button>
                        </div>

                        {/* Error */}
                        {error && <p className="text-red-500 text-center px-4">{error}</p>}

                        {/* Table */}
                        <div className="overflow-auto flex-1 px-4 pb-4">
                            {loading ? (
                                <div className="flex justify-center items-center h-40 text-gray-700">
                                    <Loader2 size={24} className="animate-spin mr-2" />
                                    Cargando...
                                </div>
                            ) : items.length > 0 ? (
                                <table className="w-full text-sm border-collapse">
                                    <thead className="sticky top-0 bg-gray-100 text-gray-800 border-b">
                                    <tr>
                                        {["#", "Código", "Cantidad", "Precio Unitario", "Total", "Acciones"].map((header) => (
                                            <th key={header} className="px-4 py-2 text-left font-medium">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-2">{index + 1}</td>
                                            <td className="px-4 py-2">{item.ItemCode}</td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={items[index]?.Quantity ?? item.Quantity}
                                                    onChange={(e) => handleInputChange(index, "Quantity", Number(e.target.value))}
                                                    className="w-20 px-2 py-1 border rounded text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={items[index]?.Price ?? item.Price}
                                                    onChange={(e) => handleInputChange(index, "Price", Number(e.target.value))}
                                                    className="w-28 px-2 py-1 border rounded text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                $
                                                {(
                                                    (items[index]?.Quantity ?? item.Quantity) *
                                                    (items[index]?.Price ?? item.Price)
                                                ).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteItem(index, e)}
                                                    className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                >
                                                    <Trash2 size={16} />
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-gray-700">No hay artículos en esta orden.</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t flex justify-center">
                            <button
                                onClick={() => handleUpdate(items, docEntry)}
                                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Actualizar
                            </button>
                        </div>
                    </div>

                    <ItemSelectionModal
                        isOpen={isItemModalOpen}
                        onClose={() => setIsItemModalOpen(false)}
                        onSelectItem={(item) =>
                            handleSelectItem(item, setItems, listNum)
                        }
                    />
                </div>
            )
        );

    };
