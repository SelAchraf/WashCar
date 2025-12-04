import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Platform, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDA } from '../utils/format.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TIME_SLOTS } from '../data/services.js';
import Button from '../components/Button.jsx';
import { useBooking } from '../context/BookingContext.jsx';

export default function BookingScreen({ route, navigation }) {
  const { service } = route.params || {};
  const { addBooking } = useBooking();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  
  // Use service's custom time slots if available, otherwise use default TIME_SLOTS
  const availableSlots = service?.timeSlots && service.timeSlots.length > 0 ? service.timeSlots : TIME_SLOTS;
  const [slot, setSlot] = useState(availableSlots[0]);
  
  // Vehicle type selection (motorcycle, car, truck)
  const [vehicleType, setVehicleType] = useState('car');
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({
    address: '',
    phone: ''
  });
  const webDateInputRef = useRef(null);
  const isWeb = Platform.OS === 'web';
  
  // Calculate price based on selected vehicle type
  const selectedPrice = useMemo(() => {
    if (service?.prices) {
      return service.prices[vehicleType] || service.price || 0;
    }
    return service?.price || 0;
  }, [service, vehicleType]);
  const dateDisplay = useMemo(() => date.toLocaleDateString(), [date]);
  const htmlDateValue = useMemo(() => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [date]);
  const minHtmlDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const openDateSelector = useCallback(() => {
    if (isWeb) {
      if (webDateInputRef.current) {
        webDateInputRef.current.showPicker?.();
        webDateInputRef.current.focus();
      }
    } else {
      setShowPicker(true);
    }
  }, [isWeb]);

  const onChange = (event, selected) => {
    setShowPicker(false);
    if (selected) setDate(selected);
  };

  const onWebDateChange = useCallback((event) => {
    const value = event.target.value;
    if (!value) return;
    const parsed = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      setDate(parsed);
    }
  }, []);

  const validate = () => {
    if (!service) return 'Service manquant';
    if (!address.trim()) return 'Adresse requise';
    if (!phone.trim()) return 'Téléphone requis';
    if (!/^\+?\d[\d\s]{6,}$/.test(phone.trim())) return 'Téléphone invalide';
    return '';
  };

  const handleConfirm = async () => {
    // Clear previous errors
    setErrors({
      address: '',
      phone: ''
    });
    setError('');
    
    let hasError = false;
    
    // Validate service
    if (!service) {
      setError('Service manquant');
      return;
    }
    
    // Validate address
    if (!address.trim()) {
      setErrors(prev => ({ ...prev, address: 'L\'adresse de livraison est requise' }));
      hasError = true;
    }
    
    // Validate phone
    if (!phone.trim()) {
      setErrors(prev => ({ ...prev, phone: 'Le numéro de téléphone est requis' }));
      hasError = true;
    } else if (!/^\+?\d[\d\s]{6,}$/.test(phone.trim())) {
      setErrors(prev => ({ ...prev, phone: 'Numéro de téléphone invalide' }));
      hasError = true;
    }
    
    if (hasError) {
      return;
    }
    
    const booking = {
      service,
      vehicleType,
      selectedPrice,
      date: date.toISOString(),
      slot,
      address,
      phone,
      status: 'En attente',
      createdAt: new Date().toISOString(),
    };
    try {
      await addBooking(booking);
      navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Reservations' }] });
    } catch (error) {
      setError('Erreur lors de l\'enregistrement de la réservation');
      console.error('Booking error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Service Header Card */}
        <View style={styles.serviceHeaderCard}>
          <View style={styles.serviceIconBadge}>
            <Ionicons name="water" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.serviceHeaderInfo}>
            <Text style={styles.headerTitle}>{service?.name}</Text>
            {service?.ownerName && (
              <View style={styles.ownerInfo}>
                <Ionicons name="business-outline" size={14} color="#6B7280" />
                <Text style={styles.headerSubtitle}>{service.ownerName}</Text>
              </View>
            )}
          </View>
          {selectedPrice > 0 && (
            <View style={styles.priceBadge}>
              <Text style={styles.headerPrice}>{selectedPrice} DA</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Vehicle Type Selection */}
          {service?.prices && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="car" size={20} color="#1E40AF" />
                <Text style={styles.sectionTitle}>Type de véhicule</Text>
              </View>
              <View style={styles.vehicleTypeBox}>
                {service.prices.motorcycle > 0 && (
                  <Pressable
                    onPress={() => setVehicleType('motorcycle')}
                    style={[styles.vehicleTypeItem, vehicleType === 'motorcycle' && styles.vehicleTypeItemActive]}
                  >
                    <Ionicons 
                      name="bicycle-outline" 
                      size={28} 
                      color={vehicleType === 'motorcycle' ? '#FFFFFF' : '#6B7280'} 
                    />
                    <Text style={[styles.vehicleTypeText, vehicleType === 'motorcycle' && styles.vehicleTypeTextActive]}>
                      Moto
                    </Text>
                    <Text style={[styles.vehicleTypePrice, vehicleType === 'motorcycle' && styles.vehicleTypePriceActive]}>
                      {service.prices.motorcycle} DA
                    </Text>
                  </Pressable>
                )}
                {service.prices.car > 0 && (
                  <Pressable
                    onPress={() => setVehicleType('car')}
                    style={[styles.vehicleTypeItem, vehicleType === 'car' && styles.vehicleTypeItemActive]}
                  >
                    <Ionicons 
                      name="car-outline" 
                      size={28} 
                      color={vehicleType === 'car' ? '#FFFFFF' : '#6B7280'} 
                    />
                    <Text style={[styles.vehicleTypeText, vehicleType === 'car' && styles.vehicleTypeTextActive]}>
                      Voiture
                    </Text>
                    <Text style={[styles.vehicleTypePrice, vehicleType === 'car' && styles.vehicleTypePriceActive]}>
                      {service.prices.car} DA
                    </Text>
                  </Pressable>
                )}
                {service.prices.truck > 0 && (
                  <Pressable
                    onPress={() => setVehicleType('truck')}
                    style={[styles.vehicleTypeItem, vehicleType === 'truck' && styles.vehicleTypeItemActive]}
                  >
                    <Ionicons 
                      name="bus-outline" 
                      size={28} 
                      color={vehicleType === 'truck' ? '#FFFFFF' : '#6B7280'} 
                    />
                    <Text style={[styles.vehicleTypeText, vehicleType === 'truck' && styles.vehicleTypeTextActive]}>
                      Camion
                    </Text>
                    <Text style={[styles.vehicleTypePrice, vehicleType === 'truck' && styles.vehicleTypePriceActive]}>
                      {service.prices.truck} DA
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
          
          {/* Date Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color="#1E40AF" />
              <Text style={styles.sectionTitle}>Date</Text>
            </View>
            <Pressable onPress={openDateSelector} style={styles.dateSelector}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.dateSelectorText}>{dateDisplay}</Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </Pressable>
            {isWeb ? (
              <input
                ref={webDateInputRef}
                type="date"
                value={htmlDateValue}
                min={minHtmlDate}
                onChange={onWebDateChange}
                style={{ display: 'none' }}
              />
            ) : showPicker ? (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={new Date()}
                onChange={onChange}
              />
            ) : null}
          </View>

          {/* Time Slot Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color="#1E40AF" />
              <Text style={styles.sectionTitle}>Créneau horaire</Text>
            </View>
            <View style={styles.slotGrid}>
              {availableSlots.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => setSlot(opt)}
                  style={[styles.slotChip, slot.id === opt.id && styles.slotChipActive]}
                >
                  <Ionicons 
                    name="time-outline" 
                    size={16} 
                    color={slot.id === opt.id ? '#FFFFFF' : '#6B7280'} 
                  />
                  <Text style={[styles.slotChipText, slot.id === opt.id && styles.slotChipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Address Input */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#1E40AF" />
              <Text style={styles.sectionTitle}>Adresse</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput 
                placeholder="Votre adresse complète" 
                value={address} 
                onChangeText={setAddress} 
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
          </View>

          {/* Phone Input */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color="#1E40AF" />
              <Text style={styles.sectionTitle}>Téléphone</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput 
                placeholder="06 12 34 56 78" 
                keyboardType="phone-pad" 
                value={phone} 
                onChangeText={setPhone} 
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <Pressable style={styles.confirmButton} onPress={handleConfirm}>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Confirmer la réservation</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6' 
  },
  serviceHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceHeaderInfo: {
    flex: 1,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1F2937',
    marginBottom: 4,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerSubtitle: { 
    fontSize: 13, 
    color: '#6B7280',
  },
  priceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  headerPrice: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1E40AF' 
  },
  content: { 
    padding: 16 
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  vehicleTypeBox: { 
    flexDirection: 'row', 
    gap: 10, 
    flexWrap: 'wrap',
  },
  vehicleTypeItem: { 
    flex: 1,
    minWidth: 100,
    borderWidth: 2, 
    borderColor: '#D1D5DB', 
    borderRadius: 16, 
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  vehicleTypeItemActive: { 
    borderColor: '#1E40AF',
    backgroundColor: '#1E40AF',
  },
  vehicleTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  vehicleTypeTextActive: {
    color: '#FFFFFF',
  },
  vehicleTypePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  vehicleTypePriceActive: {
    color: '#E0E7FF',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  dateSelectorText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  slotChipActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  slotChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  slotChipTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  error: { 
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});


