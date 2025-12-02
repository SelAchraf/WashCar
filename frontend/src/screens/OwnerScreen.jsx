import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Alert, TextInput, ScrollView, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../config/api';

// Owner Account Management Component
function OwnerAccountTab() {
  const { user, userProfile, logout } = useAuth();
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
      Alert.alert('Erreur', 'Le nom du lavage est requis');
      return;
    }
    
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        Alert.alert('Succès', 'Profil mis à jour avec succès');
        setEditMode(false);
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
      if (!confirmed) return;
    } else {
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: async () => {
              const result = await logout();
              if (!result.success) {
                Alert.alert('Erreur', 'Impossible de se déconnecter');
              }
            },
          },
        ]
      );
      return;
    }
    
    const result = await logout();
    if (!result.success) {
      alert('Erreur: Impossible de se déconnecter');
    }
  };

  return (
    <ScrollView style={styles.accountContainer} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <Ionicons name="business" size={48} color="#1E40AF" />
          <Text style={styles.accountTitle}>Informations du Lavage</Text>
        </View>

        {editMode ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom du lavage</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nom du lavage"
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
                  placeholder="Adresse du lavage"
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
              <Ionicons name="business-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nom du lavage</Text>
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


// Booking Item Card Component
function BookingItemCard({ item, user, BACKEND_URL, onUpdateStatus, onDelete }) {
  const [clientName, setClientName] = useState('Chargement...');
  const [loading, setLoading] = useState(true);

  // Fetch client name when component mounts
  useEffect(() => {
    // If booking already contains clientName (set by backend at creation), use it and skip extra API call
    if (item.clientName) {
      setClientName(item.clientName);
      setLoading(false);
      return;
    }

    if (!item.userId || !user) {
      setClientName('Client inconnu');
      setLoading(false);
      return;
    }

    const fetchClientName = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${BACKEND_URL}/api/users/${item.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userProfile = await res.json();
          setClientName(userProfile.name || userProfile.email || 'Client inconnu');
        } else {
          setClientName('Client inconnu');
        }
      } catch (err) {
        console.error('Failed to fetch client name:', err);
        setClientName('Client inconnu');
      } finally {
        setLoading(false);
      }
    };

    fetchClientName();
  }, [item.userId, user, BACKEND_URL]);

  // Format the service name - handle both string and object
  const serviceTitle = item.service ? item.service.name : (item.serviceName || item.name || 'Réservation');
  
  // Get service price - handle both string and object
  const servicePrice = item.service ? item.service.price : (item.price || 0);
  
  // Format the date properly - YYYY-MM-DD format
  const formatDateYYYYMMDD = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return 'N/A';
    }
  };
  
  const bookingDate = item.date ? formatDateYYYYMMDD(item.date) : (item.createdAt ? formatDateYYYYMMDD(item.createdAt) : 'N/A');
  
  // Get status display with appropriate color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'en attente':
        return '#EAB308'; // Yellow/Amber
      case 'confirmée':
        return '#059669'; // Green
      case 'annulée':
        return '#DC2626'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };
  
  const currentStatus = item.status || 'En attente';
  
  return (
    <View style={styles.card}>
      {/* Title row with action buttons */}
      <View style={styles.serviceTitleRow}>
        <Text style={styles.cardTitle}>{String(serviceTitle)}</Text>
        {currentStatus?.toLowerCase() === 'en attente' && (
          <View style={styles.actions}>
            <Pressable 
              style={[styles.actionBtn, { backgroundColor: '#059669' }]} 
              onPress={() => onUpdateStatus(item.id, 'Confirmée')}
            >
              <Text style={styles.actionText}>✓</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionBtn, { backgroundColor: '#DC2626' }]} 
              onPress={() => onUpdateStatus(item.id, 'Annulée')}
            >
              <Text style={styles.actionText}>✕</Text>
            </Pressable>
          </View>
        )}
      </View>
      
      {/* Booking details */}
      <View style={{ flex: 1 }}>
        <Text style={styles.cardText}>Client: {loading ? 'Chargement...' : String(clientName)}</Text>
        <Text style={styles.cardText}>Téléphone: {String(item.phone || 'N/A')}</Text>
        <Text style={styles.cardText}>Date: {String(bookingDate)}</Text>
        <Text style={styles.cardText}>Créneau: {String(item.slot?.label || 'N/A')}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Text style={[styles.cardText, { fontWeight: '700', color: getStatusColor(currentStatus) }]}>
            Status: {String(currentStatus)}
          </Text>
          <Text style={[styles.cardText, { fontWeight: '700', color: '#1E40AF' }]}>
            Prix: {String(servicePrice)} DA
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function OwnerScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    prices: { motorcycle: '', car: '', truck: '' },
    timeSlots: []
  });
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'bookings') {
      loadBookings();
    } else {
      loadServices();
    }
  }, [user, activeTab]);

  const loadBookings = async () => {
    if (!user) return;
    let isMounted = true;
    setLoadingBookings(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/owner/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!isMounted) return;
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (isMounted) setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load bookings', err);
      if (isMounted) Alert.alert('Erreur', 'Impossible de charger les réservations');
    } finally {
      if (isMounted) setLoadingBookings(false);
    }
    return () => { isMounted = false; };
  };

  const loadServices = async () => {
    if (!user) return;
    let isMounted = true;
    setLoadingServices(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/owner/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!isMounted) return;
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      // Log the raw data received from the backend
      console.log('=== SERVICES DATA RECEIVED ===');
      console.log('Number of services:', data.length);
      console.log('Full data:', JSON.stringify(data, null, 2));
      
      // Sanitize service data to ensure proper formatting
      const sanitizedServices = Array.isArray(data) ? data.map(s => ({
        id: s.id,
        name: String(s.name || ''),
        description: String(s.description || ''),
        price: Number(s.price || 0),
        prices: s.prices || null,
        timeSlots: s.timeSlots || [],
      })) : [];
      
      console.log('Sanitized services:', JSON.stringify(sanitizedServices, null, 2));
      console.log('==============================');
      
      if (isMounted) setServices(sanitizedServices);
    } catch (err) {
      console.error('Failed to load services', err);
      if (isMounted) Alert.alert('Erreur', 'Impossible de charger les services');
    } finally {
      if (isMounted) setLoadingServices(false);
    }
    return () => { isMounted = false; };
  };

  const updateBookingStatus = async (id, status) => {
    try {
      console.log('Updating booking status:', id, status);
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/owner/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b));
    } catch (err) {
      console.error('Failed to update booking', err);
      Alert.alert('Erreur', 'Impossible de mettre à jour la réservation');
    }
  };

  const deleteBooking = async (id) => {
    Alert.alert('Confirmer', 'Supprimer cette réservation ?', [
      { text: 'Annuler' },
      {
        text: 'Supprimer',
        onPress: async () => {
          try {
            const token = await user.getIdToken();
            const res = await fetch(`${BACKEND_URL}/api/owner/bookings/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(await res.text());
            setBookings(bs => bs.filter(b => b.id !== id));
          } catch (err) {
            console.error('Failed to delete booking', err);
            Alert.alert('Erreur', 'Impossible de supprimer la réservation');
          }
        },
      },
    ]);
  };

  const openServiceModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({ 
        name: String(service.name || ''), 
        description: String(service.description || ''), 
        prices: service.prices || { motorcycle: '', car: '', truck: '' },
        timeSlots: service.timeSlots || []
      });
    } else {
      setEditingService(null);
      setFormData({ 
        name: '', 
        description: '', 
        prices: { motorcycle: '', car: '', truck: '' },
        timeSlots: []
      });
    }
    setNewSlotStart('');
    setNewSlotEnd('');
    setModalVisible(true);
  };

  const saveService = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return;
    }
    
    // Validate that at least one vehicle type has a price
    const hasPrices = formData.prices.motorcycle || formData.prices.car || formData.prices.truck;
    if (!hasPrices) {
      Alert.alert('Erreur', 'Veuillez définir au moins un prix');
      return;
    }
    
    // Validate that there's at least one time slot
    if (formData.timeSlots.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins un créneau horaire');
      return;
    }
    
    try {
      const token = await user.getIdToken();
      const body = { 
        name: formData.name, 
        description: formData.description,
        prices: {
          motorcycle: parseInt(formData.prices.motorcycle) || 0,
          car: parseInt(formData.prices.car) || 0,
          truck: parseInt(formData.prices.truck) || 0
        },
        timeSlots: formData.timeSlots,
        // Keep old price field for backward compatibility (use car price as default)
        price: parseInt(formData.prices.car) || 0
      };
      
      if (editingService) {
        const res = await fetch(`${BACKEND_URL}/api/owner/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());
        setServices(svcs => svcs.map(s => s.id === editingService.id ? { ...s, ...body } : s));
      } else {
        const res = await fetch(`${BACKEND_URL}/api/owner/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());
        const newService = await res.json();
        setServices([...services, newService]);
      }
      setModalVisible(false);
    } catch (err) {
      console.error('Failed to save service', err);
      Alert.alert('Erreur', 'Impossible de sauvegarder le service');
    }
  };

  const addTimeSlot = () => {
    if (!newSlotStart.trim() || !newSlotEnd.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir l\'heure de début et de fin');
      return;
    }
    
    const newSlot = {
      id: Date.now().toString(),
      start: newSlotStart.trim(),
      end: newSlotEnd.trim(),
      label: `${newSlotStart.trim()} - ${newSlotEnd.trim()}`
    };
    
    setFormData({
      ...formData,
      timeSlots: [...formData.timeSlots, newSlot]
    });
    
    setNewSlotStart('');
    setNewSlotEnd('');
  };

  const removeTimeSlot = (slotId) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.filter(slot => slot.id !== slotId)
    });
  };

  const deleteService = async (id) => {
    Alert.alert('Confirmer', 'Supprimer ce service ?', [
      { text: 'Annuler' },
      {
        text: 'Supprimer',
        onPress: async () => {
          try {
            const token = await user.getIdToken();
            const res = await fetch(`${BACKEND_URL}/api/owner/services/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(await res.text());
            setServices(svcs => svcs.filter(s => s.id !== id));
          } catch (err) {
            console.error('Failed to delete service', err);
            Alert.alert('Erreur', 'Impossible de supprimer le service');
          }
        },
      },
    ]);
  };

  const isLoading = activeTab === 'bookings' ? loadingBookings : loadingServices;

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <Pressable style={[styles.tab, activeTab === 'bookings' && styles.tabActive]} onPress={() => setActiveTab('bookings')}>
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>Réservations</Text>
        </Pressable>
        <Pressable style={[styles.tab, activeTab === 'services' && styles.tabActive]} onPress={() => setActiveTab('services')}>
          <Text style={[styles.tabText, activeTab === 'services' && styles.tabTextActive]}>Services</Text>
        </Pressable>
        <Pressable style={[styles.tab, activeTab === 'account' && styles.tabActive]} onPress={() => setActiveTab('account')}>
          <Text style={[styles.tabText, activeTab === 'account' && styles.tabTextActive]}>Mon Compte</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1E40AF" />
        </View>
      ) : activeTab === 'bookings' ? (
        <FlatList
          data={bookings}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            return <BookingItemCard 
              item={item} 
              user={user}
              BACKEND_URL={BACKEND_URL}
              onUpdateStatus={updateBookingStatus}
              onDelete={deleteBooking}
            />;
          }}
          ListEmptyComponent={() => <Text style={styles.empty}>Aucune réservation</Text>}
        />
      ) : activeTab === 'services' ? (
        <View style={{ flex: 1 }}>
          <Pressable style={styles.addBtn} onPress={() => openServiceModal()}>
            <Text style={styles.addBtnText}>+ Ajouter service</Text>
          </Pressable>
          <FlatList
            data={services}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.card}>
                {/* Title row with action buttons */}
                <View style={styles.serviceTitleRow}>
                  <Text style={styles.cardTitle}>{item.name || 'Service'}</Text>
                  <View style={styles.actions}>
                    <Pressable style={[styles.actionBtn, { backgroundColor: '#2563EB' }]} onPress={() => openServiceModal(item)}>
                      <Text style={styles.actionText}>✎</Text>
                    </Pressable>
                    <Pressable style={[styles.actionBtn, { backgroundColor: '#DC2626' }]} onPress={() => deleteService(item.id)}>
                      <Text style={styles.actionText}>✕</Text>
                    </Pressable>
                  </View>
                </View>
                
                {/* Service details */}
                <View style={{ flex: 1 }}>
                  {item.description && (
                    <Text style={styles.cardText}>{String(item.description)}</Text>
                  )}
                  
                  {/* Vehicle prices */}
                  {item.prices ? (
                    <View style={styles.ownerVehiclePricesContainer}>
                      {item.prices.motorcycle > 0 && (
                        <View style={styles.ownerVehiclePriceItem}>
                          <Ionicons name="bicycle-outline" size={24} color="#1E40AF" />
                          <Text style={styles.ownerVehicleTypeLabel}>Moto</Text>
                          <Text style={styles.ownerVehiclePrice}>{item.prices.motorcycle} DA</Text>
                        </View>
                      )}
                      {item.prices.car > 0 && (
                        <View style={styles.ownerVehiclePriceItem}>
                          <Ionicons name="car-outline" size={24} color="#1E40AF" />
                          <Text style={styles.ownerVehicleTypeLabel}>Voiture</Text>
                          <Text style={styles.ownerVehiclePrice}>{item.prices.car} DA</Text>
                        </View>
                      )}
                      {item.prices.truck > 0 && (
                        <View style={styles.ownerVehiclePriceItem}>
                          <Ionicons name="bus-outline" size={24} color="#1E40AF" />
                          <Text style={styles.ownerVehicleTypeLabel}>Camion</Text>
                          <Text style={styles.ownerVehiclePrice}>{item.prices.truck} DA</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={[styles.cardText, { fontWeight: '700', color: '#1E40AF', marginTop: 8 }]}>Prix: {item.price || 0} DA</Text>
                  )}
                  
                  {/* Time slots */}
                  {item.timeSlots && item.timeSlots.length > 0 && (
                    <View style={styles.timeSlotsSection}>
                      <View style={styles.timeSlotHeader}>
                        <Ionicons name="time-outline" size={16} color="#6B7280" />
                        <Text style={styles.timeSlotHeaderText}>Créneaux horaires:</Text>
                      </View>
                      <View style={styles.timeSlotsGrid}>
                        {item.timeSlots.map((slot) => (
                          <View key={slot.id} style={styles.timeSlotChip}>
                            <Text style={styles.timeSlotChipText}>{slot.label}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={() => <Text style={styles.empty}>Aucun service</Text>}
          />
        </View>
      ) : (
        <OwnerAccountTab />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingService ? 'Modifier' : 'Ajouter'} Service</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Nom du service</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Lavage Standard" 
              value={String(formData.name || '')} 
              onChangeText={(t) => setFormData({ ...formData, name: t })} 
            />
            
            <Text style={styles.label}>Description</Text>
            <TextInput 
              style={[styles.input, { minHeight: 80 }]} 
              placeholder="Description du service" 
              value={String(formData.description || '')} 
              onChangeText={(d) => setFormData({ ...formData, description: d })} 
              multiline 
            />

            <Text style={[styles.label, { marginTop: 20, fontSize: 16, color: '#1E40AF' }]}>Prix par type de véhicule (DA)</Text>
            
            <View style={styles.vehicleTypeContainer}>
              <Ionicons name="bicycle-outline" size={24} color="#6B7280" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.vehicleLabel}>Moto</Text>
                <TextInput 
                  style={styles.priceInput} 
                  placeholder="Prix" 
                  value={String(formData.prices.motorcycle || '')} 
                  onChangeText={(p) => setFormData({ ...formData, prices: { ...formData.prices, motorcycle: p } })} 
                  keyboardType="numeric" 
                />
              </View>
            </View>

            <View style={styles.vehicleTypeContainer}>
              <Ionicons name="car-outline" size={24} color="#6B7280" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.vehicleLabel}>Voiture</Text>
                <TextInput 
                  style={styles.priceInput} 
                  placeholder="Prix" 
                  value={String(formData.prices.car || '')} 
                  onChangeText={(p) => setFormData({ ...formData, prices: { ...formData.prices, car: p } })} 
                  keyboardType="numeric" 
                />
              </View>
            </View>

            <View style={styles.vehicleTypeContainer}>
              <Ionicons name="bus-outline" size={24} color="#6B7280" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.vehicleLabel}>Camion</Text>
                <TextInput 
                  style={styles.priceInput} 
                  placeholder="Prix" 
                  value={String(formData.prices.truck || '')} 
                  onChangeText={(p) => setFormData({ ...formData, prices: { ...formData.prices, truck: p } })} 
                  keyboardType="numeric" 
                />
              </View>
            </View>

            <Text style={[styles.label, { marginTop: 20, fontSize: 16, color: '#1E40AF' }]}>Créneaux horaires</Text>
            
            <View style={styles.timeSlotInputContainer}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.timeSlotLabel}>Début</Text>
                <TextInput 
                  style={styles.timeInput} 
                  placeholder="08:00" 
                  value={newSlotStart} 
                  onChangeText={setNewSlotStart}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.timeSlotLabel}>Fin</Text>
                <TextInput 
                  style={styles.timeInput} 
                  placeholder="12:00" 
                  value={newSlotEnd} 
                  onChangeText={setNewSlotEnd}
                />
              </View>
              <Pressable style={styles.addSlotBtn} onPress={addTimeSlot}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            {formData.timeSlots.length > 0 && (
              <View style={styles.slotsListContainer}>
                {formData.timeSlots.map((slot) => (
                  <View key={slot.id} style={styles.slotItem}>
                    <Ionicons name="time-outline" size={20} color="#1E40AF" />
                    <Text style={styles.slotText}>{slot.label}</Text>
                    <Pressable onPress={() => removeTimeSlot(slot.id)} style={styles.removeSlotBtn}>
                      <Ionicons name="close-circle" size={20} color="#DC2626" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <Pressable style={styles.saveBtn} onPress={saveService}>
              <Text style={styles.saveBtnText}>Sauvegarder</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E6E9EE' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#1E40AF' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#1E40AF' },
  listContent: { padding: 12 },
  card: { padding: 12, backgroundColor: '#fff', borderRadius: 10, marginVertical: 6, marginHorizontal: 0, borderWidth: 1, borderColor: '#E6E9EE' },
  serviceTitleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1 },
  cardText: { fontSize: 13, color: '#475569', marginTop: 4 },
  actions: { justifyContent: 'space-between', alignItems: 'center', gap: 6, flexDirection: 'row' },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6 },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  addBtn: { backgroundColor: '#1E40AF', margin: 12, padding: 12, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 40 },
  modal: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#1E40AF' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  closeBtn: { fontSize: 24, color: '#fff' },
  modalBody: { flex: 1, padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 14 },
  saveBtn: { backgroundColor: '#1E40AF', marginVertical: 20, padding: 14, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  
  // Account tab styles
  accountContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  accountCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E6E9EE' },
  accountHeader: { alignItems: 'center', marginBottom: 24 },
  accountTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoContent: { flex: 1, marginLeft: 12 },
  infoLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#0F172A', fontWeight: '500' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 12 },
  accountButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginTop: 12 },
  accountButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  editButton: { backgroundColor: '#1E40AF' },
  saveButton: { backgroundColor: '#059669' },
  cancelButton: { backgroundColor: '#E5E7EB' },
  cancelButtonText: { color: '#374151', fontWeight: '600', fontSize: 14 },
  logoutButton: { backgroundColor: '#DC2626', marginTop: 8 },
  
  // Vehicle type pricing styles
  vehicleTypeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 8, 
    padding: 12, 
    marginTop: 8 
  },
  vehicleLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  priceInput: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: 6, 
    padding: 8, 
    fontSize: 14 
  },
  
  // Time slot styles
  timeSlotInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    marginTop: 8 
  },
  timeSlotLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  timeInput: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: 6, 
    padding: 10, 
    fontSize: 14 
  },
  addSlotBtn: { 
    backgroundColor: '#1E40AF', 
    borderRadius: 6, 
    padding: 10, 
    marginLeft: 8, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  slotsListContainer: { 
    marginTop: 12, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 8, 
    padding: 8 
  },
  slotItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 6, 
    padding: 10, 
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  slotText: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 14, 
    color: '#0F172A', 
    fontWeight: '500' 
  },
  removeSlotBtn: { 
    padding: 4 
  },
  
  // Owner service card vehicle prices
  ownerVehiclePricesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  ownerVehiclePriceItem: {
    flex: 1,
    minWidth: 100,
    borderWidth: 2,
    borderColor: '#1E40AF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  ownerVehicleTypeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginTop: 4,
  },
  ownerVehiclePrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    marginTop: 2,
  },
  
  // Time slots section in service card
  timeSlotsSection: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timeSlotHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeSlotChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  timeSlotChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
});
