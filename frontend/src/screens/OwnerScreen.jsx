import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Alert, TextInput, ScrollView, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../config/api';

// Car wash service types with applicable vehicle types
const SERVICE_TYPES = [
  { value: '', label: '-- Sélectionner un type --', vehicles: [] },
  { value: 'Lavage Extérieur Simple', label: 'Lavage Extérieur Simple', vehicles: ['motorcycle', 'car', 'truck'] },
  { value: 'Lavage Extérieur Complet', label: 'Lavage Extérieur Complet', vehicles: ['motorcycle', 'car', 'truck'] },
  { value: 'Lavage Intérieur Simple', label: 'Lavage Intérieur Simple', vehicles: ['car', 'truck'] },
  { value: 'Lavage Intérieur Complet', label: 'Lavage Intérieur Complet', vehicles: ['car', 'truck'] },
  { value: 'Lavage Complet (Int + Ext)', label: 'Lavage Complet (Int + Ext)', vehicles: ['car', 'truck'] },
  { value: 'Lavage Premium', label: 'Lavage Premium', vehicles: ['car', 'truck'] },
  { value: 'Lavage Express', label: 'Lavage Express', vehicles: ['motorcycle', 'car'] },
  { value: 'Nettoyage Moteur', label: 'Nettoyage Moteur', vehicles: ['motorcycle', 'car', 'truck'] },
  { value: 'Polissage', label: 'Polissage', vehicles: ['motorcycle', 'car', 'truck'] },
  { value: 'Lustrage', label: 'Lustrage', vehicles: ['car', 'truck'] },
  { value: 'Cire & Protection', label: 'Cire & Protection', vehicles: ['car', 'truck'] },
  { value: 'Traitement Céramique', label: 'Traitement Céramique', vehicles: ['car', 'truck'] },
  { value: 'Nettoyage Sièges', label: 'Nettoyage Sièges', vehicles: ['car', 'truck'] },
  { value: 'Nettoyage Moquettes', label: 'Nettoyage Moquettes', vehicles: ['car', 'truck'] },
  { value: 'Nettoyage Vitres', label: 'Nettoyage Vitres', vehicles: ['motorcycle', 'car', 'truck'] },
  { value: 'Désinfection Intérieur', label: 'Désinfection Intérieur', vehicles: ['car', 'truck'] },
  { value: 'Traitement Anti-odeur', label: 'Traitement Anti-odeur', vehicles: ['car', 'truck'] },
  { value: 'Nettoyage Jantes', label: 'Nettoyage Jantes', vehicles: ['motorcycle', 'car', 'truck'] },
  { value: 'Lavage Sans Eau', label: 'Lavage Sans Eau', vehicles: ['motorcycle', 'car', 'truck'] },
];

// Get applicable vehicles for a service type
const getApplicableVehicles = (serviceType) => {
  const service = SERVICE_TYPES.find(s => s.value === serviceType);
  return service ? service.vehicles : ['motorcycle', 'car', 'truck'];
};

// Owner Account Management Component
function OwnerAccountTab() {
  const { user, userProfile, logout, updateUserProfile } = useAuth();
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
  
  // Format date in a more readable way (e.g., "2 Déc 2025")
  const formatDateReadable = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return 'N/A';
    }
  };
  
  const bookingDate = item.date ? formatDateReadable(item.date) : (item.createdAt ? formatDateReadable(item.createdAt) : 'N/A');
  
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
  const statusColor = getStatusColor(currentStatus);
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'en attente':
        return 'time-outline';
      case 'confirmée':
        return 'checkmark-circle';
      case 'annulée':
        return 'close-circle';
      default:
        return 'ellipse-outline';
    }
  };
  
  // Get vehicle icon based on vehicle type
  const getVehicleIcon = (vehicleType) => {
    switch(vehicleType) {
      case 'motorcycle':
        return 'bicycle';
      case 'truck':
        return 'bus';
      case 'car':
      default:
        return 'car-sport';
    }
  };
  
  return (
    <View style={styles.bookingCard}>
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Ionicons name={getStatusIcon(currentStatus)} size={16} color="#FFFFFF" />
        <Text style={styles.statusBadgeText}>{String(currentStatus)}</Text>
      </View>

      {/* Service Title & Actions */}
      <View style={styles.bookingHeader}>
        <View style={styles.serviceIconContainer}>
          <Ionicons name={getVehicleIcon(item.vehicleType)} size={24} color="#1E40AF" />
        </View>
        <View style={styles.bookingHeaderContent}>
          <Text style={styles.bookingServiceTitle}>{String(serviceTitle)}</Text>
          <Text style={styles.bookingPrice}>{String(servicePrice)} DA</Text>
        </View>
        {currentStatus?.toLowerCase() === 'en attente' && (
          <View style={styles.bookingActions}>
            <Pressable 
              style={[styles.bookingActionBtn, styles.confirmBtn]} 
              onPress={() => onUpdateStatus(item.id, 'Confirmée')}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable 
              style={[styles.bookingActionBtn, styles.rejectBtn]} 
              onPress={() => onUpdateStatus(item.id, 'Annulée')}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </View>

      {/* Client & Date Information (Left Column) */}
      <View style={styles.bookingSection}>
        <View style={styles.bookingInfoRow}>
          <View style={styles.bookingInfoColumn}>
            <View style={styles.bookingInfoItem}>
              <Ionicons name="person-outline" size={18} color="#6B7280" />
              <View style={styles.bookingInfoContent}>
                <Text style={styles.bookingInfoLabel}>Client</Text>
                <Text style={styles.bookingInfoValue}>
                  {loading ? 'Chargement...' : String(clientName)}
                </Text>
              </View>
            </View>
            <View style={[styles.bookingInfoItem, { marginTop: 12 }]}>
              <Ionicons name="call-outline" size={18} color="#6B7280" />
              <View style={styles.bookingInfoContent}>
                <Text style={styles.bookingInfoLabel}>Téléphone</Text>
                <Text style={styles.bookingInfoValue}>{String(item.phone || 'N/A')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.bookingInfoColumn}>
            <View style={styles.bookingInfoItem}>
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              <View style={styles.bookingInfoContent}>
                <Text style={styles.bookingInfoLabel}>Date</Text>
                <Text style={styles.bookingInfoValue}>{String(bookingDate)}</Text>
              </View>
            </View>
            <View style={[styles.bookingInfoItem, { marginTop: 12 }]}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <View style={styles.bookingInfoContent}>
                <Text style={styles.bookingInfoLabel}>Créneau</Text>
                <Text style={styles.bookingInfoValue}>{String(item.slot?.label || 'N/A')}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Address Information */}
      {item.address && (
        <View style={styles.bookingSection}>
          <View style={styles.bookingInfoItem}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <View style={styles.bookingInfoContent}>
              <Text style={styles.bookingInfoLabel}>Adresse</Text>
              <Text style={styles.bookingInfoValue}>{String(item.address)}</Text>
            </View>
          </View>
        </View>
      )}
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
  const [serviceTypePickerVisible, setServiceTypePickerVisible] = useState(false);
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
      Alert.alert('Erreur', 'Le type de service est requis');
      return;
    }
    
    // Get applicable vehicles for this service type
    const applicableVehicles = getApplicableVehicles(formData.name);
    
    // Validate that at least one applicable vehicle type has a price
    const hasApplicablePrice = applicableVehicles.some(vehicle => {
      return formData.prices[vehicle] && parseInt(formData.prices[vehicle]) > 0;
    });
    
    if (!hasApplicablePrice) {
      Alert.alert('Erreur', 'Veuillez définir au moins un prix pour ce type de service');
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
              <View style={styles.serviceCard}>
                {/* Enhanced Service Header */}
                <View style={styles.serviceCardHeader}>
                  <View style={styles.serviceIconBadge}>
                    <Ionicons name="sparkles" size={20} color="#1E40AF" />
                  </View>
                  <View style={styles.serviceHeaderContent}>
                    <Text style={styles.serviceTypeLabel}>Type de service</Text>
                    <Text style={styles.serviceTypeName}>{item.name || 'Service'}</Text>
                  </View>
                  <View style={styles.serviceActions}>
                    <Pressable 
                      style={[styles.serviceActionBtn, styles.editActionBtn]} 
                      onPress={() => openServiceModal(item)}
                    >
                      <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                    </Pressable>
                    <Pressable 
                      style={[styles.serviceActionBtn, styles.deleteActionBtn]} 
                      onPress={() => deleteService(item.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                    </Pressable>
                  </View>
                </View>
                
                {/* Service details */}
                <View style={styles.serviceCardContent}>
                  {item.description && (
                    <View style={styles.descriptionContainer}>
                      <View style={styles.descriptionHeader}>
                        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                        <Text style={styles.descriptionLabel}>Description</Text>
                      </View>
                      <Text style={styles.descriptionText}>{String(item.description)}</Text>
                    </View>
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
            <Text style={styles.label}>Type de service</Text>
            <Pressable 
              style={styles.dropdownButton}
              onPress={() => setServiceTypePickerVisible(true)}
            >
              <Text style={[styles.dropdownButtonText, !formData.name && styles.dropdownPlaceholder]}>
                {formData.name || '-- Sélectionner un type --'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </Pressable>
            
            <Text style={styles.label}>Description</Text>
            <TextInput 
              style={[styles.input, { minHeight: 80 }]} 
              placeholder="Description du service" 
              value={String(formData.description || '')} 
              onChangeText={(d) => setFormData({ ...formData, description: d })} 
              multiline 
            />

            <Text style={[styles.label, { marginTop: 20, fontSize: 16, color: '#1E40AF' }]}>Prix par type de véhicule (DA)</Text>
            
            {!formData.name ? (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
                <Text style={styles.infoBoxText}>
                  Sélectionnez d'abord un type de service pour voir les options de prix disponibles
                </Text>
              </View>
            ) : (
              <View style={styles.pricesRowContainer}>
                {getApplicableVehicles(formData.name).includes('motorcycle') && (
                  <View style={styles.priceItemContainer}>
                    <Ionicons name="bicycle-outline" size={28} color="#1E40AF" />
                    <Text style={styles.vehicleLabel}>Moto</Text>
                    <TextInput 
                      style={styles.priceInputCompact} 
                      placeholder="0" 
                      value={String(formData.prices.motorcycle || '')} 
                      onChangeText={(p) => setFormData({ ...formData, prices: { ...formData.prices, motorcycle: p } })} 
                      keyboardType="numeric" 
                    />
                  </View>
                )}

                {getApplicableVehicles(formData.name).includes('car') && (
                  <View style={styles.priceItemContainer}>
                    <Ionicons name="car-outline" size={28} color="#1E40AF" />
                    <Text style={styles.vehicleLabel}>Voiture</Text>
                    <TextInput 
                      style={styles.priceInputCompact} 
                      placeholder="0" 
                      value={String(formData.prices.car || '')} 
                      onChangeText={(p) => setFormData({ ...formData, prices: { ...formData.prices, car: p } })} 
                      keyboardType="numeric" 
                    />
                  </View>
                )}

                {getApplicableVehicles(formData.name).includes('truck') && (
                  <View style={styles.priceItemContainer}>
                    <Ionicons name="bus-outline" size={28} color="#1E40AF" />
                    <Text style={styles.vehicleLabel}>Camion</Text>
                    <TextInput 
                      style={styles.priceInputCompact} 
                      placeholder="0" 
                      value={String(formData.prices.truck || '')} 
                      onChangeText={(p) => setFormData({ ...formData, prices: { ...formData.prices, truck: p } })} 
                      keyboardType="numeric" 
                    />
                  </View>
                )}
              </View>
            )}

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

      {/* Service Type Picker Modal */}
      <Modal 
        visible={serviceTypePickerVisible} 
        animationType="slide"
        transparent={true}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Sélectionner un type de service</Text>
              <Pressable onPress={() => setServiceTypePickerVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </Pressable>
            </View>
            <FlatList
              data={SERVICE_TYPES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.pickerItem,
                    formData.name === item.value && styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    if (item.value) { // Don't select the placeholder
                      setFormData({ ...formData, name: item.value });
                      setServiceTypePickerVisible(false);
                    }
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    formData.name === item.value && styles.pickerItemTextSelected,
                    !item.value && styles.pickerItemPlaceholder
                  ]}>
                    {item.label}
                  </Text>
                  {formData.name === item.value && (
                    <Ionicons name="checkmark" size={24} color="#1E40AF" />
                  )}
                </Pressable>
              )}
            />
          </View>
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
  
  // Enhanced Booking Card Styles
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingHeaderContent: {
    flex: 1,
  },
  bookingServiceTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bookingActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  confirmBtn: {
    backgroundColor: '#059669',
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
  },
  bookingSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bookingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 32,
  },
  bookingInfoColumn: {
    flexShrink: 0,
  },
  bookingInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bookingInfoContent: {
    flex: 1,
  },
  bookingInfoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bookingInfoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  
  // Enhanced Service Card Styles
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  serviceIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceHeaderContent: {
    flex: 1,
  },
  serviceTypeLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  serviceTypeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E40AF',
    lineHeight: 22,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  serviceActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editActionBtn: {
    backgroundColor: '#2563EB',
  },
  deleteActionBtn: {
    backgroundColor: '#DC2626',
  },
  serviceCardContent: {
    flex: 1,
    padding: 16,
  },
  
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
  dropdownButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#0F172A',
    flex: 1,
  },
  pickerItemTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  pickerItemPlaceholder: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
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
  
  // Info box for service selection
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 10,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  
  // Vehicle type pricing styles (horizontal layout)
  pricesRowContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  priceItemContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#1E40AF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  vehicleLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#1E40AF', 
    marginTop: 6,
    marginBottom: 8,
    textAlign: 'center',
  },
  priceInputCompact: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: 6, 
    padding: 8, 
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    color: '#1E40AF',
  },
  // Old styles kept for backward compatibility
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
  
  // Description section in service card
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontStyle: 'italic',
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
