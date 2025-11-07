import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('Home');
    }, 2000);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>WashCar</Text>
      <Text style={styles.subtitle}>Lavage auto à domicile</Text>
      <ActivityIndicator style={styles.spinner} size="small" color="#1E40AF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' },
  brand: { fontSize: 24, fontWeight: '800', color: '#1E40AF' },
  subtitle: { marginTop: 4, color: '#4b5563' },
  spinner: { marginTop: 16 },
});


