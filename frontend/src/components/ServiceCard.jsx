import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDA } from '../utils/format.js';
import Button from './Button.jsx';

export default function ServiceCard({ service, onReserve }) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="car-sport-outline" size={18} color="#1E40AF" />
        </View>
        <Text style={styles.title}>{service.name}</Text>
      </View>
      {service.ownerName && (
        <View style={styles.ownerRow}>
          <Ionicons name="business-outline" size={14} color="#6B7280" />
          <Text style={styles.ownerText}>{service.ownerName}</Text>
        </View>
      )}
      {service.description ? <Text style={styles.desc}>{service.description}</Text> : null}
      
      {/* Vehicle type pricing */}
      {service.prices ? (
        <View style={styles.vehiclePricesContainer}>
          {service.prices.motorcycle > 0 && (
            <View style={styles.vehiclePriceItem}>
              <Ionicons name="bicycle-outline" size={24} color="#1E40AF" />
              <Text style={styles.vehicleTypeLabel}>Moto</Text>
              <Text style={styles.vehiclePrice}>{service.prices.motorcycle} DA</Text>
            </View>
          )}
          {service.prices.car > 0 && (
            <View style={styles.vehiclePriceItem}>
              <Ionicons name="car-outline" size={24} color="#1E40AF" />
              <Text style={styles.vehicleTypeLabel}>Voiture</Text>
              <Text style={styles.vehiclePrice}>{service.prices.car} DA</Text>
            </View>
          )}
          {service.prices.truck > 0 && (
            <View style={styles.vehiclePriceItem}>
              <Ionicons name="bus-outline" size={24} color="#1E40AF" />
              <Text style={styles.vehicleTypeLabel}>Camion</Text>
              <Text style={styles.vehiclePrice}>{service.prices.truck} DA</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.oldPrice}>{formatDA(service.price)}</Text>
      )}
      
      <View style={styles.footerRow}>
        <Button title="Réserver" onPress={() => onReserve(service)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
      : { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }),
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#111827' },
  ownerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4,
    gap: 4,
  },
  ownerText: { 
    fontSize: 13, 
    color: '#6B7280',
    fontWeight: '500',
  },
  desc: { color: '#4b5563', marginTop: 4 },
  vehiclePricesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  vehiclePriceItem: {
    flex: 1,
    minWidth: 100,
    borderWidth: 2,
    borderColor: '#1E40AF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  vehicleTypeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginTop: 4,
  },
  vehiclePrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    marginTop: 2,
  },
  oldPrice: { 
    color: '#1E40AF', 
    fontWeight: '700', 
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});


