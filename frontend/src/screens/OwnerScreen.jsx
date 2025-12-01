import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Alert, TextInput, ScrollView, Modal } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../config/api';

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
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{String(serviceTitle)}</Text>
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
      <View style={styles.actions}>
        {currentStatus?.toLowerCase() === 'en attente' && (
          <>
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
          </>
        )}
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
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });

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
      // Sanitize service data to ensure proper formatting
      const sanitizedServices = Array.isArray(data) ? data.map(s => ({
        id: s.id,
        name: String(s.name || ''),
        description: String(s.description || ''),
        price: Number(s.price || 0),
      })) : [];
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
        price: String(service.price || 0) 
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', price: '' });
    }
    setModalVisible(true);
  };

  const saveService = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return;
    }
    try {
      const token = await user.getIdToken();
      const body = { name: formData.name, description: formData.description, price: parseInt(formData.price) || 0 };
      
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
        // Ensure the service object has proper structure
        const serviceToAdd = {
          id: newService.id,
          name: newService.name || '',
          description: newService.description || '',
          price: newService.price || 0,
        };
        setServices([...services, serviceToAdd]);
      }
      setModalVisible(false);
    } catch (err) {
      console.error('Failed to save service', err);
      Alert.alert('Erreur', 'Impossible de sauvegarder le service');
    }
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
      ) : (
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name || 'Service'}</Text>
                  <Text style={styles.cardText}>{String(item.description || '')}</Text>
                  <Text style={[styles.cardText, { fontWeight: '700', color: '#1E40AF' }]}>Prix: {item.price || 0} DA</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable style={[styles.actionBtn, { backgroundColor: '#2563EB' }]} onPress={() => openServiceModal(item)}>
                    <Text style={styles.actionText}>✎</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { backgroundColor: '#DC2626' }]} onPress={() => deleteService(item.id)}>
                    <Text style={styles.actionText}>✕</Text>
                  </Pressable>
                </View>
              </View>
            )}
            ListEmptyComponent={() => <Text style={styles.empty}>Aucun service</Text>}
          />
        </View>
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
            <Text style={styles.label}>Nom</Text>
            <TextInput style={styles.input} placeholder="Nom du service" value={String(formData.name || '')} onChangeText={(t) => setFormData({ ...formData, name: t })} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} placeholder="Description" value={String(formData.description || '')} onChangeText={(d) => setFormData({ ...formData, description: d })} multiline />
            <Text style={styles.label}>Prix (DA)</Text>
            <TextInput style={styles.input} placeholder="Prix" value={String(formData.price || '')} onChangeText={(p) => setFormData({ ...formData, price: p })} keyboardType="numeric" />
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
  card: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginVertical: 6, marginHorizontal: 0, borderWidth: 1, borderColor: '#E6E9EE' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
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
});
