import { toast } from "react-toastify";
import { OrderDetails } from "../types.ts";

export const closeOrder = async (details: OrderDetails[] | null): Promise<void> => {
    const host = "192.168.1.157";
    const url = `http://${host}:3001/api/orders/close`;
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    const docEntry = details ? details[0].docEntry : null;

    if (!docEntry) {
        toast.error("No se encontró el docEntry.");
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ docEntry }),
        });

        toast.info(`Orden ${details[0].docNum} Cerrada exitosamente`);
        const result = await response.json();
        console.log('Order closed :', result);


    } catch (err) {
        if (err instanceof Error) {
            console.error('Error closing:', err);
            toast.error(`Error al cancelar la orden: ${err.message}`);
        }
    }
};
