import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function MonCompteScreen() {
  const { profile, saveProfile } = useBooking();
  const { logout, userProfile, updateUserProfile } = useAuth();
  const navigation = useNavigation();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return;
    }
    
    try {
      const result = await updateUserProfile({
        ...userProfile,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });
      
      if (result.success) {
        Alert.alert('Succès', 'Profil mis à jour avec succès');
        setEditMode(false);
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de mettre à jour le profil');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleLogout = async () => {
    console.log('Logout button clicked (MonCompte)');
    
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
    <ScrollView style={styles.accountContainer} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <Ionicons name="person-circle" size={48} color="#1E40AF" />
          <Text style={styles.accountTitle}>Mes Informations</Text>
        </View>

        {editMode ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Votre nom"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Adresse</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Votre adresse"
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Téléphone</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Numéro de téléphone"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.accountButton, styles.cancelButton]}
                onPress={() => {
                  setEditMode(false);
                  setFormData({
                    name: userProfile?.name || '',
                    phone: userProfile?.phone || '',
                    address: userProfile?.address || '',
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>
              <Pressable style={[styles.accountButton, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.accountButtonText}>Enregistrer</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nom</Text>
                <Text style={styles.infoValue}>{userProfile?.name || 'Non défini'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userProfile?.email || 'Non défini'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={styles.infoValue}>{userProfile?.address || 'Non définie'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{userProfile?.phone || 'Non défini'}</Text>
              </View>
            </View>

            <Pressable style={[styles.accountButton, styles.editButton]} onPress={() => setEditMode(true)}>
              <Ionicons name="create-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.accountButtonText}>Modifier les informations</Text>
            </Pressable>
          </>
        )}
      </View>

      <Pressable style={[styles.accountButton, styles.logoutButton]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.accountButtonText}>Se déconnecter</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  accountContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  accountTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  accountButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  editButton: {
    backgroundColor: '#1E40AF',
  },
  saveButton: {
    backgroundColor: '#10B981',
    flex: 1,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  accountButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});



