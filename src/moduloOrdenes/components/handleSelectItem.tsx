import { toast } from "react-toastify";
import { DocumentLineItems, Item } from "../types.ts"; // Usamos DocumentLineItems para asegurar la estructura

const getToken = () => {
    return document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
        "$1"
    );
};

export const handleSelectItem = async (
    selectedItem: Item,
    setItems: React.Dispatch<React.SetStateAction<DocumentLineItems[]>>,
    priceList: number,
    host: string = "192.168.1.157"
) => {
    try {
        const token = getToken();
        const response = await fetch(
            `http://${host}:3001/api/items/price?itemCode=${selectedItem.itemCode}&priceList=${priceList}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (!response.ok) {
            throw new Error("Error al obtener el precio");
        }

        const priceData = await response.json();

        setItems((prevItems) => {
            console.log("Lista antes de actualizar:", prevItems);

            const exists = prevItems.some(
                (item) => item.ItemCode === selectedItem.itemCode
            );

            if (exists) {
                console.log("El item ya está en la lista.");
                return prevItems; // Evita duplicados
            }

            // Nuevo ítem con la estructura de DocumentLineItems
            const newOrderDetail: DocumentLineItems = {
                LineNum: prevItems.length, // Index automático
                ItemCode: selectedItem.itemCode,
                Quantity: 1,
                Currency:"$", // Ajustar según lógica
                CostingCode:"1", // Ajustar según lógica
                COGSCostingCode2:"1.8", // Ajustar según lógica
                Price: priceData.price,
                WarehouseCode: selectedItem.WarehouseCode
            };


            const updatedItems = [...prevItems, newOrderDetail];
            console.log("Lista después de actualizar:", updatedItems);
            setItems(updatedItems);
            return updatedItems;
        });
    } catch (error) {
        console.error("Error obteniendo precio:", error);
        toast.error("No se pudo obtener el precio del artículo.");
    }
};
