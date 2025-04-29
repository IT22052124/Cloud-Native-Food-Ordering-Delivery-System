import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { router } from 'expo-router';

interface DeliveryData {
  deliveryId: string;
  restaurant: { name: string };
  deliveryAddress: { street: string; city?: string };
  deliveryFee: number;
}

export function useSocketDeliveryAlert() {
  const { socket } = useSocket();
  const [modalVisible, setModalVisible] = useState(false);
  const [incomingData, setIncomingData] = useState<DeliveryData | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingDelivery = (data: DeliveryData) => {
      setIncomingData(data);
      setModalVisible(true);
    };

    socket.on('deliveryAssignedDirect', handleIncomingDelivery);

    return () => {
      socket.off('deliveryAssignedDirect', handleIncomingDelivery);
    };
  }, [socket]);

  const handleAccept = useCallback(() => {
    if (incomingData) {
      router.push(`/(delivery)/active-delivery?deliveryId=${incomingData.deliveryId}`);
      setModalVisible(false);
    }
  }, [incomingData]);

  const handleDismiss = useCallback(() => {
    setModalVisible(false);
  }, []);

  return {
    modalVisible,
    incomingData,
    handleAccept,
    handleDismiss,
  };
}
