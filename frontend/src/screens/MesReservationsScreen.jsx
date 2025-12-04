import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../context/BookingContext.jsx';
import { formatDA } from '../utils/format.js';

function StatusBadge({ status }) {
  const map = {
    'En attente': { bg: '#FEF3C7', text: '#92400E', icon: 'time' },
    'Confirmée': { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle' },
    'Annulée': { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle' },
    'En cours': { bg: '#DBEAFE', text: '#1E40AF', icon: 'car' },
    'Terminée': { bg: '#ECFDF5', text: '#065F46', icon: 'checkmark-done' },
  };
  const c = map[status] || map['En attente'];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={14} color={c.text} />
      <Text style={[styles.badgeText, { color: c.text }]}>{status}</Text>
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
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.serviceIconBadge}>
            <Ionicons name="water" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.serviceName}>{item.service.name || item.service}</Text>
            {item.service.ownerName && (
              <View style={styles.ownerInfo}>
                <Ionicons name="business-outline" size={14} color="#6B7280" />
                <Text style={styles.ownerName}>{item.service.ownerName}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <StatusBadge status={item.status} />
          </View>
        </View>

        {/* Details */}
        <View style={styles.cardBody}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <View style={styles.detailIconBadge}>
                <Ionicons name="calendar" size={20} color="#1E40AF" />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{d}</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailIconBadge}>
                <Ionicons name="time" size={20} color="#1E40AF" />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Créneau</Text>
                <Text style={styles.detailValue}>{item.slot?.label || item.slot}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            {item.vehicleType && (
              <View style={styles.detailCard}>
                <View style={styles.detailIconBadge}>
                  <Ionicons 
                    name={item.vehicleType === 'motorcycle' ? 'bicycle' : item.vehicleType === 'truck' ? 'bus' : 'car'} 
                    size={20} 
                    color="#1E40AF" 
                  />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Véhicule</Text>
                  <Text style={styles.detailValue}>
                    {item.vehicleType === 'motorcycle' ? 'Moto' : item.vehicleType === 'truck' ? 'Camion' : 'Voiture'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.detailCard}>
              <View style={styles.detailIconBadge}>
                <Ionicons name="location" size={20} color="#1E40AF" />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Adresse</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{item.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          {canCancel && (
            <Pressable onPress={() => cancelBooking(item.id)} style={styles.cancelBtn}>
              <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>
          )}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Prix total</Text>
            <Text style={styles.price}>{item.selectedPrice || item.service.price || 0} DA</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {bookings.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Aucune réservation</Text>
          <Text style={styles.emptySub}>Vos réservations apparaîtront ici.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1E40AF']} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6' 
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  serviceName: { 
    fontSize: 17,
    fontWeight: 'bold', 
    color: '#1F2937',
    marginBottom: 4,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownerName: { 
    fontSize: 13,
    color: '#6B7280',
  },
  badge: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  detailCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  detailIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  price: { 
    fontSize: 18,
    color: '#1E40AF', 
    fontWeight: 'bold',
  },
  cancelBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5, 
    borderColor: '#FCA5A5', 
    backgroundColor: '#FEE2E2',
    borderRadius: 10, 
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: { 
    color: '#DC2626', 
    fontWeight: '600',
    fontSize: 14,
  },
  empty: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#4B5563',
    marginTop: 16,
  },
  emptySub: { 
    marginTop: 8, 
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
  },
});


