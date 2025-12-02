import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVICES as FALLBACK_SERVICES } from '../data/services.js';
import ServiceCard from '../components/ServiceCard.jsx';

import { BACKEND_URL } from '../config/api';

export default function HomeScreen({ navigation }) {
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(false);

  const handleReserve = (service) => {
    navigation.navigate('Booking', { service });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/services`);
        if (!mounted) return;
        if (!res.ok) {
          console.warn('Failed to fetch services from backend, using fallback');
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) setServices(data);
      } catch (err) {
        console.warn('Error fetching services, using fallback', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#1E40AF" style={{ marginTop: 20 }} />
        ) : (
          services.map((s) => (
            <ServiceCard key={s.id} service={s} onReserve={handleReserve} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#111827' },
});


