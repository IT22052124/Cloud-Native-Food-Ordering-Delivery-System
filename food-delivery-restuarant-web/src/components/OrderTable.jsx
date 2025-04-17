import React from 'react';

const OrderTable = ({ orders, onAccept, onReject }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg dark:bg-gray-800">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th className="p-3 text-left">Order ID</th>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Items</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-b dark:border-gray-600">
              <td className="p-3">{order._id}</td>
              <td className="p-3">{order.customerName}</td>
              <td className="p-3">{order.items.join(', ')}</td>
              <td className="p-3">{order.status}</td>
              <td className="p-3 flex space-x-2">
                {order.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => onAccept(order._id)}
                      className="text-green-600 hover:underline dark:text-green-400"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onReject(order._id)}
                      className="text-red-600 hover:underline dark:text-red-400"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;