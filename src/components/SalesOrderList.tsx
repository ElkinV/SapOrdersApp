import React, { useEffect, useState } from 'react';
import { SalesOrder } from '../types';

interface SalesOrderListProps {
  salesOrders: SalesOrder[];
}

const SalesOrderList: React.FC<SalesOrderListProps> = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/orderslist');
        const data = await response.json();
        setSalesOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="space-y-4">
      {salesOrders.length === 0 ? (
        <p className="text-center text-gray-500">No hay ordenes aun...</p>
      ) : (
        salesOrders.map((order) => (
          <div key={order.id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{order.cardName}</h3>
              <span className="text-sm text-gray-500">
                {new Date(order.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm">Codigo de cliente: {order.cardCode}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default SalesOrderList;