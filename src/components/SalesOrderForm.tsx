import React, { useState } from 'react';
import { SalesOrder, SalesOrderItem } from '../types';
import ItemSelectionModal, { Item } from './ItemSelectionModal';
import { Plus } from 'lucide-react';
import CustomerSelectionModal, { Customer } from './CustomerSelectionModal';
//import './styles.css'; // Asegúrate de importar el CSS

interface SalesOrderFormProps {
  onCreateSalesOrder: (order: SalesOrder) => void;
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ onCreateSalesOrder }) => {
  const [customerName, setCustomerName] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [items, setItems] = useState<SalesOrderItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const newOrder: SalesOrder = {
      customerName: customerName,
      cardCode: cardCode,
      date: new Date().toISOString(),
      items ,
      total: items.reduce((sum, item) => sum + item.quantity * (item.unitPrice || 0), 0),
      comments: comments,
    };

    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      console.log('Order created successfully:', result);

      onCreateSalesOrder(newOrder);
      setCustomerName('');
      setItems([]);
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
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

  const addItem = () => {
    setCurrentEditIndex(items.length);
    setIsModalOpen(true);
  };

  const handleSelectItem = (selectedItem: Item) => {
    if (currentEditIndex !== null) {
      const newItems = [...items];
      newItems[currentEditIndex] = {
        name: selectedItem.name,
        itemCode: selectedItem.id,
        quantity: selectedItem.quantity,
        unitPrice: selectedItem.unitPrice
      };
      setItems(newItems);
      setCurrentEditIndex(null);
    }
  };

  const handleSelectCustomer = (selectedCustomer: Customer) => {
    setCardCode(selectedCustomer.id);
    setCustomerName(selectedCustomer.name);
  };


  return (
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
      <span className="flex items-center">
        <span className="h-px flex-1 bg-gray-300"></span>
        <span className="block text-sm font-medium text-gray-700 shrink-0 px-6 ">Articulos</span>
        <span className="h-px flex-1 bg-gray-300"></span>
      </span>
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={item.itemCode}
              onChange={(e) => handleItemChange(index, 'itemCode', e.target.value)}
              className="block w-1/2 rounded-md bg-gray-50 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              readOnly
            />
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
              className="block w-1/2 rounded-md border-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 "
              readOnly
            />
            <button
              type="button"
              onClick={() => {
                setCurrentEditIndex(index);
                setIsModalOpen(true);
              }}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Editar
            </button>
          </div>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Cantidad"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              min="1"
              className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
            <input
              type="number"
              placeholder="Precio"
              value={item.unitPrice}
              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
              min="0"
              step="0.01"
              className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
      >
        <Plus size={18} className="mr-2"/>
        Añadir Articulo
      </button>
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
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
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
  );
};

export default SalesOrderForm;
