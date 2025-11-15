import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen({ navigation }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => {
        if (user) {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [navigation, user, loading]);

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


