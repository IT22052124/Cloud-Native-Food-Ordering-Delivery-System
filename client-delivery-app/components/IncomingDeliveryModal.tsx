import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface IncomingDeliveryModalProps {
  visible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
  data: {
    deliveryId: string;
    restaurant: { name: string };
    deliveryAddress: { street: string; city?: string };
    deliveryFee: number;
  } | null;
}

export default function IncomingDeliveryModal({ visible, onAccept, onDismiss, data }: IncomingDeliveryModalProps) {
  if (!data) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🚚 New Delivery Assigned!</Text>
          <Text style={styles.text}>Pickup from: {data.restaurant.name}</Text>
          <Text style={styles.text}>Deliver to: {data.deliveryAddress.street}</Text>
          <Text style={styles.text}>Fee: ${data.deliveryFee.toFixed(2)}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.accept]} onPress={onAccept}>
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.dismiss]} onPress={onDismiss}>
              <Text style={styles.buttonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: 'white', padding: 24, borderRadius: 12, width: '80%', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  text: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  buttons: { flexDirection: 'row', marginTop: 20 },
  button: { flex: 1, padding: 12, marginHorizontal: 4, borderRadius: 8, alignItems: 'center' },
  accept: { backgroundColor: '#06D6A0' },
  dismiss: { backgroundColor: '#EF476F' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
