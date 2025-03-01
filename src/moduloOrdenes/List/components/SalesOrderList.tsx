import React, { useEffect, useState } from 'react';
import { SalesOrder } from '../../types.ts';

const host = "192.168.1.157";

interface SalesOrderListProps {
  userId: string | null;
  onSelectCardCode: (cardCode: number) => void; // Callback para enviar el cardCode al componente padre
}

const SalesOrderList: React.FC<SalesOrderListProps> = ({ userId, onSelectCardCode }) => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;

      try {
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
        const response = await fetch(`http://${host}:3001/api/orders/list?userId=${userId}`,
            {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setSalesOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [userId]);

  return (
      <div className="border border-gray-300 rounded-md p-4 max-h-[65vh] overflow-y-auto">
        {salesOrders.length === 0 ? (
            <p className="text-center text-gray-500">No hay órdenes aún...</p>
        ) : (
            salesOrders.map((order) => (
                <div
                    key={order.cardCode}
                    className={`shadow-md rounded-lg p-4 mb-4 cursor-pointer hover:bg-blue-100 ${
                        order.docStatus === "Cerrado" ? "bg-gray-100" : "bg-green-50"
                    }`}
                    onClick={() => onSelectCardCode(order.docNum)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">{order.customerName}</h3>
                    <span className="text-sm text-gray-500">
              {new Date(order.date).toLocaleDateString()}
            </span>
                  </div>
                  <p className="text-sm">Número de Orden: {order.docNum}</p>
                  <p className="text-sm">Código de Cliente: {order.cardCode}</p>
                  <p className="text-sm">Estado: {order.docStatus} </p>
                </div>
            ))
        )}
      </div>
  );

};

export default SalesOrderList;

