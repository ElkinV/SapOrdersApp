import React, { useState } from 'react';
import {Customer, SalesOrder, Item} from '../../types.ts';
import { Plus } from 'lucide-react';
import CustomerSelectionModal from './CustomerSelectionModal.tsx';
import DropdownMenu from './dropdownMenu.tsx';
import { ToastContainer, toast } from 'react-toastify';
import Loader from "../../components/Loader.tsx"
import ItemSelectionModal from "./ItemSelectionModal.tsx";
import LoadItemModal from "../../components/loadItemsModal.tsx";

const host = "192.168.1.157";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface SalesOrderFormProps {
  onCreateSalesOrder: (order: SalesOrder) => void;
  username: string | null;
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ onCreateSalesOrder, username}) => {
  const [customerName, setCustomerName] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [margen, setMargen] = useState('');
  const [priceList, setPriceList] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [selectedMenuOption, setSelectedMenuOption] = useState<number | null>(null);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [tableData, setTableData] = useState<string[]>(Array(3).fill(""));

  const handleOptionSelect = (option: number) => {
    setSelectedMenuOption(option); // Actualiza la opción seleccionada
    console.log("Opción seleccionada:", option); // Lógica adicional para usar la opción
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let userId: string | 'Usuario'= 'Usuario';
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const userResponse = await fetch(`http://${host}:3001/api/auth/get-userid?username=${username}`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!userResponse.ok) {
        throw new Error('Failed to fetch USERID');
      }
      const userData = await userResponse.json();
      userId = userData.USERID;
    } catch (err) {
      if( typeof err === "object" && err && "message" in err && typeof err.message === "string"){
        console.error('Error fetching USERID:', err);
        setError(err.message);
        toast.error(`Error al obtener el USERID: ${err.message}`);
        setIsSubmitting(false);
        return;
      }
    }

    const newOrder: SalesOrder = {
      customerName: customerName,
      cardCode: cardCode,
      date: new Date().toISOString(),
      items: items,
      total: items.reduce((sum, item) => sum + item.quantity * (item.unitPrice || 0), 0),
      comments: comments,
      user: userId,
      series:selectedMenuOption ?? 0
    };

    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch(`http://${host}:3001/api/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        const errorMessage = errorDetails.error?.message?.value || 'Failed to create order';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Order created successfully:', result);

      onCreateSalesOrder(newOrder);
      setCustomerName('');
      setItems([]);

      toast.success('Orden de venta creada exitosamente!');
    } catch (err) {
      if( typeof err === "object" && err && "message" in err && typeof err.message === "string"){
        console.error('Error creating order:', err);
        setError(err.message);
        toast.error(`Error al crear la orden: ${err.message}`);
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index] = { ...newItems[index], [field]: Math.max(0, parseInt(value.toString())) };
    } else if (field === 'unitPrice') {
      newItems[index] = { ...newItems[index], [field]: Math.max(0, parseFloat(value.toString()) || 0) };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const addItem = async()=> {
    setLoading(true);
    setCurrentEditIndex(items.length);
    setIsModalOpen(true);
    setLoading(false);

  };

  const loadItems = async () => {
    setIsLoadModalOpen(true);
  }

  const handleSelectItem = async (selectedItem: Item) => {
    if (priceList !== null) {
      try {
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        const response = await fetch(`http://${host}:3001/api/items/price?itemCode=${selectedItem.itemCode}&priceList=${priceList}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch item price');
        }
        const priceData = await response.json();
        const margenDecimal = parseFloat(parseFloat(margen).toFixed())
        console.log(typeof margenDecimal, margenDecimal);
        const updatedItem = {
          name: selectedItem.name,
          itemCode: selectedItem.itemCode,
          quantity: selectedItem.quantity || 1,
          unitPrice: priceData.price,
          U_RL_Margen: margenDecimal
        };

        setItems((prevItems) => {
          if (currentEditIndex !== null) {
            const newItems = [...prevItems];
            newItems[currentEditIndex] = updatedItem;
            return newItems;
          }
          return [...prevItems, updatedItem];
        });
        setCurrentEditIndex(null);
      } catch (error) {
        console.error('Error fetching item price:', error);
        toast.error('Error al obtener el precio del artículo.');
      }
    }
  };

  const handleChargeItems=async (item: string)=>{
    if (priceList !== null) {
      try {
        await delay(1000);
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        const priceResponse = await fetch(`http://${host}:3001/api/items/price?itemCode=${item}&priceList=${priceList}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const itemResponse = await fetch(`http://${host}:3001/api/items/?search=${encodeURIComponent(item)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // Validar ambas respuestas
        if (!priceResponse.ok) {
          throw new Error(`Error al obtener el precio del artículo: ${priceResponse.statusText}`);
        }
        if (!itemResponse.ok) {
          throw new Error(`Error al obtener los datos del artículo: ${itemResponse.statusText}`);
        }

        // Parsear los datos de las respuestas
        const priceData = await priceResponse.json();
        const itemData = await itemResponse.json();

        // Validar los datos obtenidos
        if (!priceData || typeof priceData.price !== "number") {
          throw new Error("Los datos del precio no son válidos.");
        }
        if (!itemData || !itemData[0] || typeof itemData[0].name !== "string") {
          throw new Error("Los datos del artículo no son válidos.");
        }

        // Crear el objeto actualizado
        const updatedItem = {
          name: itemData[0].name,
          itemCode: item,
          quantity: 1,
          unitPrice: priceData.price,
        };

        // Actualizar la lista de ítems
        setItems((prevItems) => {
          if (currentEditIndex !== null) {
            const newItems = [...prevItems];
            newItems[currentEditIndex] = updatedItem;
            return newItems;
          }
          return [...prevItems, updatedItem];
        });

        // Restablecer el índice de edición actual
        setCurrentEditIndex(null);
      } catch (error) {
        console.error("Error fetching item price or data:", error);
        toast.error("Error al obtener los datos del artículo o su precio.");
      }
    }

  }

  const handleSelectCustomer = async (selectedCustomer: Customer) => {
    setCardCode(selectedCustomer.id);
    setCustomerName(selectedCustomer.name);
    setPriceList(selectedCustomer.priceList);
    setMargen(selectedCustomer.margen);

    // Si la lista de precios no es válida, salimos
    if (selectedCustomer.priceList === null) return;

    try {
      // Extraemos el token una vez
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");

      // Actualizamos los precios de los items
      const updatedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const response = await fetch(
                  `http://${host}:3001/api/items/price?itemCode=${item.itemCode}&priceList=${selectedCustomer.priceList}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
              );

              if (!response.ok) {
                console.error(`Failed to fetch price for item ${item.itemCode}: ${response.statusText}`);
                return item; // Retornamos el item sin cambios en caso de error
              }

              const priceData = await response.json();
              return {
                ...item,
                unitPrice: priceData.price,
              };
            } catch (error) {
              console.error(`Error fetching price for item ${item.itemCode}:`, error);
              return item; // Retornamos el item sin cambios en caso de error
            }
          })
      );

      // Actualizamos el estado con los nuevos precios
      setItems(updatedItems);
    } catch (error) {
      console.error("Error updating items prices:", error);
    }
  };


  const handleDeleteItem = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevenir la acción predeterminada (enviar formulario)
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleloadsItems = async (data: string[]) => {
    setTableData(data); // Actualiza los datos en el padre
    console.log("Datos guardados:", data);

    for (let i = 0; i < data.length; i++) {
      await handleChargeItems(data[i]);
    }
  };


  return <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label htmlFor="cardCode" className="block text-sm font-medium text-gray-700">
            Código del Cliente
          </label>
          <input
              type="text"
              id="cardCode"
              value={cardCode}
              className="mt-1 block w-full rounded-md bg-gray-50 border-gray-800 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              readOnly
              required
          />
        </div>
        <div className="flex-1">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
            Nombre del Cliente
          </label>
          <input
              type="text"
              id="customerName"
              value={customerName}
              className="mt-1 block w-full rounded-md bg-gray-50 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              readOnly
              required
          />
        </div>
        <div className="flex-2">
          <label htmlFor="margen" className="block text-sm font-medium text-gray-700">
            Margen
          </label>
          <input
              type="text"
              id="margen"
              value={margen}
              className="mt-1 block w-full rounded-md bg-gray-50 border-gray-800 shadow-sm text-center focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              readOnly
              required
          />
        </div>
        <button
            type="button"
            onClick={() => setIsCustomerModalOpen(true)}
            className="mt-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Seleccionar Cliente
        </button>
        <DropdownMenu onOptionSelect={handleOptionSelect}></DropdownMenu>
      </div>
      {loading && <Loader/>}
      <span className="flex items-center">
      <span className="h-px flex-1 bg-gray-300"></span>
      <span className="block text-sm font-medium text-gray-700 shrink-0 px-6 ">Articulos</span>
      <span className="h-px flex-1 bg-gray-300"></span>
    </span>
      <div className="flex items-center space-x-4">
        <div className="">
          <button
              type="button"
              onClick={addItem}
              className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
          >
            <Plus size={18} className="mr-2"/>
            Añadir Articulo
          </button>
        </div>
        <div className= ""></div>
          <button
              type="button"
              onClick={loadItems}
              className="mt-2 px-4 py-2 bg-orange-100 text-gray-700 rounded-md hover:bg-orange-300 flex items-center"
          >
            <Plus size={18} className="mr-2"/>
            Cargar Articulo
          </button>

      </div>

      <div className="mt-4 border border-gray-300 rounded-md">
        <div className="overflow-y-auto max-h-80">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Unitario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.itemCode}</td>
              <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  title={item.name} // Aquí se usa el atributo title

              >
                {item.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <input
                    type="number"
                    value={isNaN(item.quantity) ? 0 : item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-16 text-center border border-gray-300 rounded"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <input
                    type="number"
                    value={isNaN(item.unitPrice) ? 0 : item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    className="w-20 text-center border border-gray-300 rounded"

                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${(item.quantity * item.unitPrice || 0).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                    type="button" // Importante para que no actúe como "submit" por defecto
                    onClick={(e) => handleDeleteItem(index, e)}
                    className="px-2 py-1 bg-red-300 text-red-800 rounded-md hover:bg-red-400"
                >
                  Eliminar
                </button>
              </td>
            </tr>)}
            </tbody>
          </table>

        </div>
      </div>


      {error && <p className="text-red-500">{error}</p>}

      <span className="flex items-center">
      <span className="h-px flex-1 bg-gray-300"></span>
    </span>
      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
          Comentarios
        </label>
        <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="mt-1 block w-full bg-gray-50 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>
      <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 disabled:bg-blue-300"
          disabled={isSubmitting}
      >
        {isSubmitting ? 'Creando Orden...' : 'Crear Orden de venta'}
      </button>
      <ItemSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectItem={handleSelectItem}
      />
      <CustomerSelectionModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSelectCustomer={handleSelectCustomer}
      />

      <LoadItemModal
          isOpen={isLoadModalOpen}
          onClose={() => setIsLoadModalOpen(false)}
          initialData={tableData}
          onSubmit={handleloadsItems}
      />
    </form>

    <ToastContainer/>
  </>;
};

export default SalesOrderForm;
