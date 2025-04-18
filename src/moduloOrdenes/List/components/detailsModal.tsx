import React, { useState, useEffect, useCallback } from "react";
import {
    Download,
    Edit,
    X,
    Loader2,
    Package,
    FileText,
    CalendarDays,
    Clock4,
    DollarSign,
    Hash,
    AlertTriangle
} from "lucide-react";
import { OrderDetails } from "../../types.ts";
import { generatePDF } from "../pdfGeneratorButton.ts";
import { closeOrder } from "../closeOrder.ts";
import { ToastContainer, toast } from "react-toastify";
import { EditOrderModal } from "./editOrderModal.tsx";

const API_HOST = "192.168.1.157";

interface DetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCardCode?: number;
}

// Función para formatear números con puntos como separador de miles
const formatNumberWithPoints = (value: number | string): string => {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) {
        return '';
    }
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

export const DetailsModal: React.FC<DetailsModalProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              selectedCardCode,
                                                          }) => {
    const [loading, setLoading] = useState(false);
    const [loadingCancel, setLoadingCancel] = useState(false);
    const [loadingPDF, setLoadingPDF] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [details, setDetails] = useState<OrderDetails[]>([]);
    const [docStatus, setDocStatus] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDocEntry, setSelectedDocEntry] = useState<number | 0>(0);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isConfirmModalOpen) {
                    setIsConfirmModalOpen(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, isConfirmModalOpen]);

    const fetchDetails = useCallback(async () => {
        if (!isOpen || !selectedCardCode) return;

        setLoading(true);
        setError(null);

        try {
            const token = document.cookie.replace(
                /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
                "$1"
            );
            const response = await fetch(
                `http://${API_HOST}:3001/api/orders/details?orderId=${encodeURIComponent(
                    selectedCardCode
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setDetails(data || []);
            setDocStatus(data[0]?.docStatus === "C");
        } catch (err) {

            setError(
                `Failed to fetch details: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`
            );
        } finally {
            setLoading(false);
        }
    }, [isOpen, selectedCardCode]);

    useEffect(() => {
        fetchDetails();
    }, [isOpen, selectedCardCode]);

    const handleExportPDF = useCallback(async () => {
        await generatePDF(details, selectedCardCode);
    }, [details, selectedCardCode]);


    const handleConfirmCancel = () => {
        setIsConfirmModalOpen(true);
    };

    const handleCloseOrder = useCallback(async () => {
        setLoadingCancel(true);
        setIsConfirmModalOpen(false);
        try {
            await closeOrder(details);
            toast.success("Orden cancelada correctamente ✅");
            onClose();
        } catch (error) {
            toast.error("Error al cancelar la orden ❌");
        } finally {
            setLoadingCancel(false);
        }
    }, [details, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                role="dialog"
                aria-modal="true"
            >
                <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl flex flex-col max-h-[95vh]">
                    {/* Header */}
                    <div className="flex-none p-4 sm:p-6 border-b">
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                                    Detalle de Orden {selectedCardCode}
                                </h2>
                                <span
                                    className={`text-sm font-semibold w-fit px-2 py-1 rounded-full ${
                                        !docStatus
                                            ? "bg-gray-200 text-gray-600"
                                            : "bg-green-200 text-green-800"
                                    }`}
                                >
                                Estado: {docStatus || "Abierta"}
                            </span>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoadingPDF(true);
                                        handleExportPDF().finally(() => setLoadingPDF(false));
                                    }}
                                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!details?.length || loading || loadingPDF}
                                    aria-label="Exportar a PDF"
                                >
                                    {loadingPDF ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                    Exportar a PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (details && details.length > 0) {
                                            setSelectedDocEntry(details[0].docEntry);
                                            setIsEditModalOpen(true);
                                        }
                                    }}
                                    className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Editar Orden"
                                    disabled={docStatus || loading}
                                >
                                    <Edit size={18} />
                                    Editar Orden
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCancel}
                                    disabled={docStatus || loading || loadingCancel}
                                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Cancelar"
                                >
                                    {loadingCancel ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Cancelando...
                                        </>
                                    ) : (
                                        <>
                                            <X size={18} />
                                            Cancelar Orden
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                                    aria-label="Cerrar"
                                >
                                    <X className="text-gray-500" size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto min-h-0">
                        {loading && (
                            <div className="flex items-center justify-center h-full p-4">
                                <p className="text-gray-500">Cargando detalles...</p>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center justify-center h-full p-4">
                                <p className="text-red-500">{error}</p>
                            </div>
                        )}

                        {!loading && !error && details?.length > 0 && (
                            <div className="w-full overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <caption className="sr-only">Detalles de la Orden</caption>
                                    <thead>
                                    <tr>
                                        {[
                                            { icon: Package, label: "Tipo de Orden" },
                                            { icon: Hash, label: "Número de Artículo" },
                                            { icon: FileText, label: "Descripción" },
                                            { icon: DollarSign, label: "Cantidad" },
                                            { icon: DollarSign, label: "Precio por Unidad" },
                                            { icon: DollarSign, label: "Total" },
                                            { icon: CalendarDays, label: "Vencimiento" },
                                            { icon: Clock4, label: "Vence en" },
                                        ].map(({ icon: Icon, label }) => (
                                            <th
                                                key={label}
                                                className="bg-gray-50 px-4 py-3 text-left font-semibold text-gray-900 sticky top-0 border-b whitespace-nowrap"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Icon size={14} className="text-gray-500" />
                                                    {label}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {details.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-900">{item.series}</td>
                                            <td className="px-4 py-3 text-gray-900">{item.itemCode}</td>
                                            <td className="px-4 py-3 text-gray-900">{item.description || "N/A"}</td>
                                            <td className="px-4 py-3 text-gray-900 text-right">{formatNumberWithPoints(item.quantity ?? 0)}</td>
                                            <td className="px-4 py-3 text-gray-900 text-right">
                                                ${formatNumberWithPoints(item.price?.toFixed(2) || "0.00")}
                                            </td>
                                            <td className="px-4 py-3 text-gray-900 text-right">
                                                ${formatNumberWithPoints(item.total?.toFixed(2) || "0.00")}
                                            </td>
                                            <td className="px-4 py-3 text-gray-900">{item.vence || "N/A"}</td>
                                            <td className="px-4 py-3 text-gray-900">{item.venceMes || "N/A"}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 sticky bottom-0">
                                    {[
                                        {
                                            label: "Total antes de Impuestos",
                                            value: details[0]?.totalAntesDeImpuestos,
                                        },
                                        { label: "Impuestos", value: details[0]?.impuesto },
                                        { label: "Total Orden", value: details[0]?.totalOrdn },
                                    ].map(({ label, value }, idx) => (
                                        <tr key={idx} className={idx === 2 ? "border-t-2 border-gray-200" : ""}>
                                            <td colSpan={6} className="px-4 py-4 font-medium text-gray-900">
                                                {label}
                                            </td>
                                            <td colSpan={3} className="px-4 py-4 font-medium text-gray-900 text-right">
                                                ${formatNumberWithPoints((parseFloat(value as string).toFixed(2) || "0.00"))}
                                            </td>
                                        </tr>
                                    ))}
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de confirmación para cancelar orden */}
            {isConfirmModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in">
                        <div className="mb-4 flex items-center justify-center text-red-500">
                            <AlertTriangle size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                            ¿Estás seguro?
                        </h3>
                        <p className="text-gray-600 mb-6 text-center">
                            Estás a punto de cancelar la orden {selectedCardCode}. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                No, volver
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseOrder}
                                className="w-full sm:w-auto py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                disabled={loadingCancel}
                            >
                                {loadingCancel ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Cancelando...
                                    </>
                                ) : (
                                    <>Sí, cancelar orden</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
            <EditOrderModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    fetchDetails();
                }}
                docEntry={selectedDocEntry}
                details={details}
            />
        </>
    );

};

export default DetailsModal;