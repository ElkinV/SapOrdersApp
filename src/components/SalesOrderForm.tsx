import React, { useState } from 'react';
import { SalesOrder, SalesOrderItem } from '../types';
import ItemSelectionModal, { Item } from './ItemSelectionModal';
import { Plus } from 'lucide-react';
import CustomerSelectionModal, { Customer } from './CustomerSelectionModal';
import { ToastContainer, toast } from 'react-toastify';
import Loader from "./Loader"


interface SalesOrderFormProps {
  onCreateSalesOrder: (order: SalesOrder) => void;
  username: string | null;
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ onCreateSalesOrder, username }) => {
  const [customerName, setCustomerName] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [priceList, setPriceList] = useState<number | null>(null);
  const [items, setItems] = useState<SalesOrderItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let userId: string | null = null;
    try {
        const userResponse = await fetch(`http://192.168.1.130:3001/api/get-userid?username=${username}`);
        if (!userResponse.ok) {
            throw new Error('Failed to fetch USERID');
        }
        const userData = await userResponse.json();
        userId = userData.USERID;
    } catch (err) {
        console.error('Error fetching USERID:', err);
        setError(err.message);
        toast.error(`Error al obtener el USERID: ${err.message}`);
        setIsSubmitting(false);
        return;
    }

    const newOrder: SalesOrder = {
      customerName: customerName,
      cardCode: cardCode,
      date: new Date().toISOString(),
      items ,
      total: items.reduce((sum, item) => sum + item.quantity * (item.unitPrice || 0), 0),
      comments: comments,
      user: userId,
    };

    try {
      const response = await fetch('http://192.168.1.130:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      console.error('Error creating order:', err);
      setError(err.message);

      toast.error(`Error al crear la orden: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index] = { ...newItems[index], [field]: Math.max(1, parseInt(value.toString()) || 1) };
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

  const handleSelectItem = async (selectedItem: Item) => {
    if (currentEditIndex !== null && priceList !== null) {
      try {
        const response = await fetch(`http://192.168.1.130:3001/api/item-price?itemCode=${selectedItem.id}&priceList=${priceList}`);
        if (!response.ok) {
          throw new Error('Failed to fetch item price');
        }
        const priceData = await response.json();
        const newItems = [...items];
        newItems[currentEditIndex] = {
          name: selectedItem.name,
          itemCode: selectedItem.id,
          quantity: selectedItem.quantity,
          unitPrice: priceData.price
        };
        setItems(newItems);
        setCurrentEditIndex(null);
      } catch (error) {
        console.error('Error fetching item price:', error);
        toast.error('Error al obtener el precio del artículo.');
      }
    }
  };

  const handleSelectCustomer = (selectedCustomer: Customer) => {
    setCardCode(selectedCustomer.id);
    setCustomerName(selectedCustomer.name);
    setPriceList(selectedCustomer.priceList);
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
    <>
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
          <button
              type="button"
              onClick={() => setIsCustomerModalOpen(true)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Seleccionar Cliente
          </button>
        </div>
        {loading && <Loader/>}
        <span className="flex items-center">
          <span className="h-px flex-1 bg-gray-300"></span>
          <span className="block text-sm font-medium text-gray-700 shrink-0 px-6 ">Articulos</span>
          <span className="h-px flex-1 bg-gray-300"></span>
        </span>
        <button
            type="button"
            onClick={addItem}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
        >
          <Plus size={18} className="mr-2"/>
          Añadir Articulo
        </button>
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead>
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Número de Artículo</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Descripción</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Cantidad</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Precio Unitario</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Total</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Acciones</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
          {items.map((item, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                  <input
                      type="text"
                      placeholder="Número de artículo"
                      value={item.itemCode ?? ''}
                      onChange={(e) => handleItemChange(index, 'itemCode', e.target.value)}
                      className="w-full bg-transparent border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                  <input
                      type="text"
                      value={item.name ?? ''}
                      placeholder="Descripción"
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className="w-full bg-transparent border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                      readOnly
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                  <input
                      type="number"
                      value={item.quantity ?? 1}
                      placeholder="Cantidad"
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      min="1"
                      className="w-full bg-transparent border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                  <input
                      type="number"
                      value={item.unitPrice ?? 0}
                      placeholder="Precio Unitario"
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      min="0"
                      className="w-full bg-transparent border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                      readOnly
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                  ${(item.quantity * item.unitPrice || 0).toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
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
          {isSubmitting ? 'Creating Order...' : 'Crear Orden de venta'}
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
      </form>
      <ToastContainer/>
    </>
  );
};

export default SalesOrderForm;
