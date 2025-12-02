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
      <View style={styles.footerRow}>
        <Text style={styles.price}>{formatDA(service.price)}</Text>
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  price: { color: '#1E40AF', fontWeight: '700', fontSize: 16 },
});


