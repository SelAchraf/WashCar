import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../config/api';

export default function OwnerDetailsScreen({ route, navigation }) {
  const { owner } = route.params;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnerServices();
  }, [owner.id]);

  const fetchOwnerServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/owners/${owner.id}/services`);
      if (!res.ok) {
        console.warn('Failed to fetch owner services');
        return;
      }
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error('Error fetching owner services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = (service) => {
    navigation.navigate('Booking', { 
      service: {
        ...service,
        ownerName: owner.name,
        ownerId: owner.id,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Owner Info Card */}
        <View style={styles.ownerCard}>
          <View style={styles.ownerHeader}>
            <View style={styles.iconBadge}>
              <Ionicons name="business" size={32} color="#1E40AF" />
            </View>
            <Text style={styles.ownerName}>{owner.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#6B7280" />
            <Text style={styles.infoText}>{owner.address || 'Adresse non définie'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#6B7280" />
            <Text style={styles.infoText}>{owner.phone || 'Téléphone non défini'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color="#6B7280" />
            <Text style={styles.infoText}>{owner.email}</Text>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.servicesHeader}>
          <Ionicons name="car-sport" size={24} color="#1E40AF" />
          <Text style={styles.servicesTitle}>Services Disponibles</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1E40AF" style={{ marginTop: 20 }} />
        ) : services.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="information-circle-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Aucun service disponible</Text>
          </View>
        ) : (
          services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIconBadge}>
                  <Ionicons name="water" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceType}>{service.type || 'Service de lavage'}</Text>
                </View>
              </View>

              {service.description ? (
                <View style={styles.descriptionContainer}>
                  <View style={styles.descriptionHeader}>
                    <Ionicons name="information-circle" size={18} color="#1E40AF" />
                    <Text style={styles.descriptionTitle}>Description</Text>
                  </View>
                  <Text style={styles.descriptionText}>{service.description}</Text>
                </View>
              ) : null}

              {/* Time Slots */}
              {service.timeSlots && service.timeSlots.length > 0 && (
                <View style={styles.slotsContainer}>
                  <View style={styles.slotsHeader}>
                    <Ionicons name="time" size={18} color="#1E40AF" />
                    <Text style={styles.slotsTitle}>Créneaux horaires</Text>
                  </View>
                  <View style={styles.slotsGrid}>
                    {service.timeSlots.map((slot, index) => (
                      <View key={index} style={styles.slotChip}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.slotText}>{slot.label || slot}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Pricing - All in one line */}
              {service.prices && (service.prices.car || service.prices.motorcycle || service.prices.truck) && (
                <View style={styles.pricingRow}>
                  {service.prices.motorcycle > 0 && (
                    <View style={styles.priceItem}>
                      <Ionicons name="bicycle-outline" size={24} color="#1E40AF" />
                      <Text style={styles.vehicleLabel}>Moto</Text>
                      <Text style={styles.priceText}>{service.prices.motorcycle} DA</Text>
                    </View>
                  )}
                  {service.prices.car > 0 && (
                    <View style={styles.priceItem}>
                      <Ionicons name="car-outline" size={24} color="#1E40AF" />
                      <Text style={styles.vehicleLabel}>Voiture</Text>
                      <Text style={styles.priceText}>{service.prices.car} DA</Text>
                    </View>
                  )}
                  {service.prices.truck > 0 && (
                    <View style={styles.priceItem}>
                      <Ionicons name="bus-outline" size={24} color="#1E40AF" />
                      <Text style={styles.vehicleLabel}>Camion</Text>
                      <Text style={styles.priceText}>{service.prices.truck} DA</Text>
                    </View>
                  )}
                </View>
              )}

              <Pressable 
                style={styles.reserveButton}
                onPress={() => handleReserve(service)}
              >
                <Ionicons name="calendar" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.reserveButtonText}>Réserver</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  ownerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ownerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  servicesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  serviceCard: {
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
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: '#6B7280',
  },
  descriptionContainer: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#1E40AF',
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  descriptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  slotsContainer: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#1E40AF',
  },
  slotsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  slotsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 6,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 4,
  },
  slotText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  vehicleLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  reserveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
