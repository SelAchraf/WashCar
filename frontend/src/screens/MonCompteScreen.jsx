import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, Platform } from 'react-native';
import { useBooking } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function MonCompteScreen() {
  const { profile, saveProfile } = useBooking();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(profile);

  const open = () => { setForm(profile); setEditOpen(true); };
  const onSave = async () => {
    try {
      await saveProfile(form);
      setEditOpen(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
    }
  };

  const handleLogout = async () => {
    console.log('Logout button clicked (MonCompte)');
    
    // For web, use confirm dialog, for mobile use Alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
      if (!confirmed) {
        console.log('Logout cancelled');
        return;
      }
    } else {
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel', onPress: () => console.log('Logout cancelled') },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: async () => {
              console.log('Logout confirmed, starting logout...');
              try {
                const result = await logout();
                console.log('Logout result:', result);
                if (!result.success) {
                  Alert.alert('Erreur', 'Impossible de se déconnecter');
                }
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
              }
            },
          },
        ]
      );
      return;
    }
    
    // Web logout flow
    console.log('Starting logout (web)...');
    try {
      const result = await logout();
      console.log('Logout result:', result);
      if (!result.success) {
        alert('Erreur: Impossible de se déconnecter');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Erreur: Une erreur est survenue lors de la déconnexion');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{profile.name}</Text>
        <Text style={styles.sub}>{profile.email}</Text>
        <Text style={styles.sub}>{profile.phone || 'Téléphone non défini'}</Text>
        <Text style={styles.sub}>{profile.address || 'Adresse non définie'}</Text>
        <Pressable style={styles.btn} onPress={open}><Text style={styles.btnText}>Modifier</Text></Pressable>
      </View>

      {editOpen ? (
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <TextInput placeholder="Nom" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.input} />
            <TextInput placeholder="Téléphone" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" style={styles.input} />
            <TextInput placeholder="Adresse" value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} style={styles.input} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <Pressable onPress={() => setEditOpen(false)} style={[styles.btn, { backgroundColor: '#e5e7eb', marginRight: 8 }]}><Text>Annuler</Text></Pressable>
              <Pressable onPress={onSave} style={styles.btn}><Text style={styles.btnText}>Enregistrer</Text></Pressable>
            </View>
          </View>
        </View>
      ) : null}

      <Pressable 
        style={({ pressed }) => [
          styles.btn, 
          styles.logoutBtn,
          pressed && { opacity: 0.7 }
        ]} 
        onPress={handleLogout}
        testID="logout-button-account"
      >
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 16 },
  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  sub: { color: '#4b5563', marginTop: 4 },
  btn: { marginTop: 12, backgroundColor: '#1E40AF', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start' },
  btnText: { color: '#ffffff', fontWeight: '600' },
  modalWrap: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10, marginTop: 8 },
  logoutBtn: { marginTop: 24, backgroundColor: '#dc2626' },
  logoutText: { color: '#ffffff', fontWeight: '600' },
});


