import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { useBooking } from '../context/BookingContext.jsx';
import { formatDA } from '../utils/format.js';

function StatusBadge({ status }) {
  const map = {
    'En attente': { bg: '#fef3c7', text: '#92400e' },      // Yellow for pending
    'Confirmée': { bg: '#d1fae5', text: '#065f46' },        // Green for confirmed
    'Annulée': { bg: '#fee2e2', text: '#991b1b' },          // Red for cancelled
    'En cours': { bg: '#fffbeb', text: '#92400e' },
    'Terminée': { bg: '#ecfdf5', text: '#065f46' },
  };
  const c = map[status] || map['En attente'];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={{ color: c.text, fontWeight: '600' }}>{status}</Text>
    </View>
  );
}

export default function MesReservationsScreen() {
  const { bookings, cancelBooking } = useBooking();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const now = new Date();

  const renderItem = ({ item }) => {
    const canCancel = item.status === 'Confirmée' && new Date(item.date) > now;
    const d = new Date(item.date).toLocaleDateString('fr-FR');
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.title}>{item.service.name || item.service}</Text>
          <StatusBadge status={item.status} />
        </View>
        {item.service.ownerName && (
          <Text style={styles.sub}>Wash Car: {item.service.ownerName}</Text>
        )}
        <Text style={styles.sub}>Date: {d} • {item.slot?.label || item.slot}</Text>
        <Text style={styles.sub}>Adresse: {item.address}</Text>
        <Text style={styles.price}>{formatDA(item.service.price || 0)}</Text>
        {canCancel && (
          <Pressable onPress={() => cancelBooking(item.id)} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {bookings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Aucune réservation</Text>
          <Text style={styles.emptySub}>Vos réservations apparaîtront ici.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  title: { color: '#111827', fontWeight: '700' },
  sub: { color: '#4b5563', marginTop: 4 },
  price: { marginTop: 8, color: '#1E40AF', fontWeight: '700' },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 9999 },
  cancelBtn: { marginTop: 10, borderWidth: 1, borderColor: '#ef4444', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  cancelText: { color: '#b91c1c', fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptySub: { marginTop: 4, color: '#6b7280' },
});


