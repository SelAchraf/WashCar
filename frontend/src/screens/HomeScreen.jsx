import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVICES } from '../data/services.js';
import ServiceCard from '../components/ServiceCard.jsx';

export default function HomeScreen({ navigation }) {
  const handleReserve = (service) => {
    navigation.navigate('Booking', { service });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Choisissez un service et réservez</Text>
        {SERVICES.map((s) => (
          <ServiceCard key={s.id} service={s} onReserve={handleReserve} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#111827' },
});


