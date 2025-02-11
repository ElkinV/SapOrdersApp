import React, { useState, useEffect, useCallback } from "react";
import { X, Download } from "lucide-react";
import {OrderDetails} from "../../types.ts";
import {generatePDF} from "../pdfGeneratorButton.ts";

const API_HOST = "152.200.153.166";

interface DetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCardCode?: number;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              selectedCardCode
                                                          }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [details, setDetails] = useState<OrderDetails[] | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!isOpen || !selectedCardCode) return;

            setLoading(true);
            setError(null);

            try {
                const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
                const response = await fetch(
                    `http://${API_HOST}:3001/api/orders/details?orderId=${encodeURIComponent(selectedCardCode)}`,
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
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError(`Failed to fetch details: ${err instanceof Error ? err.message : 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [isOpen, selectedCardCode]);

    const handleExportPDF = useCallback(() => {
        generatePDF(details, selectedCardCode);
    }, [details, selectedCardCode]);

    if (!isOpen) return null;



    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex-none p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            Detalle de Orden {selectedCardCode}
                        </h2>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!details?.length || loading}
                                aria-label="Exportar a PDF"
                            >
                                <Download size={18} />
                                Exportar a PDF
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
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Cargando detalles...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}

                    {!loading && !error && details?.length > 0 && (
                        <table className="w-full border-collapse">
                            <caption className="sr-only">Detalles de la Orden</caption>
                            <thead>
                            <tr>
                                {[
                                    "Tipo de Orden",
                                    "Número de Artículo",
                                    "Descripción",
                                    "Cantidad",
                                    "Precio por Unidad",
                                    "Margen",
                                    "Total",
                                    "Vencimiento",
                                    "Vence en"
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-900 sticky top-0 border-b"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {details.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{item.series}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{item.itemCode}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {item.description || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                        {item.quantity ?? 0}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                        ${item.price?.toFixed(2) || "0.00"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                        {item.margen ? `${item.margen}%` : "0%"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                        ${item.total?.toFixed(2) || "0.00"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{item.vence || "N/A"}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {item.venceMes || "N/A"}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot className="bg-gray-50 sticky bottom-0">
                            {[
                                {
                                    label: "Total antes de Impuestos",
                                    value: details[0]?.totalAntesDeImpuestos
                                },
                                { label: "Impuestos", value: details[0]?.impuesto },
                                { label: "Total Orden", value: details[0]?.totalOrdn }
                            ].map(({ label, value }, idx) => (
                                <tr key={idx} className={idx === 2 ? "border-t-2 border-gray-200" : ""}>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-4 text-sm font-medium text-gray-900"
                                    >
                                        {label}
                                    </td>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                                    >
                                        ${value?.toFixed(2) || "0.00"}
                                    </td>
                                </tr>
                            ))}
                            </tfoot>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailsModal;