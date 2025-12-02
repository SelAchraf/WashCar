import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDA } from '../utils/format.js';
import Button from '../components/Button.jsx';

export default function ConfirmationScreen({ route, navigation }) {
  const { booking } = route.params || {};
  const formattedDate = booking ? new Date(booking.date).toLocaleDateString() : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: 8 }} />
      <View style={styles.content}>
        <Text style={styles.success}>Réservation confirmée! Un laveur vous contactera bientôt.</Text>
        {booking && (
          <View style={styles.card}>
            <Text style={styles.itemTitle}>{booking.service.name} • {formatDA(booking.service.price)}</Text>
            {booking.service.ownerName && (
              <Text style={styles.itemText}>Wash Car: {booking.service.ownerName}</Text>
            )}
            <Text style={styles.itemText}>Date: {formattedDate}</Text>
            <Text style={styles.itemText}>Créneau: {booking.slot.label}</Text>
            <Text style={styles.itemText}>Adresse: {booking.address}</Text>
            <Text style={styles.itemText}>Téléphone: {booking.phone}</Text>
          </View>
        )}
        <Button title="Retour à l'accueil" onPress={() => navigation.popToTop()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20 },
  success: { color: '#047857', fontWeight: '600', fontSize: 18, marginBottom: 8 },
  card: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemTitle: { color: '#111827', fontWeight: '600' },
  itemText: { color: '#374151', marginTop: 4 },
});


