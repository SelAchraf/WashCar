import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Platform, StyleSheet } from 'react-native';
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
    const v = validate();
    if (v) {
      setError(v);
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
      <View style={styles.headerSpace} />
      <View style={styles.headerInline}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{service?.name}</Text>
          {service?.ownerName && (
            <Text style={styles.headerSubtitle}>Wash Car: {service.ownerName}</Text>
          )}
        </View>
        <Text style={styles.headerPrice}>{formatDA(selectedPrice)}</Text>
      </View>
      <View style={styles.content}>
        {service?.prices && (
          <>
            <Text style={styles.label}>Type de véhicule</Text>
            <View style={styles.vehicleTypeBox}>
              {service.prices.motorcycle > 0 && (
                <Pressable
                  onPress={() => setVehicleType('motorcycle')}
                  style={[styles.vehicleTypeItem, vehicleType === 'motorcycle' && styles.vehicleTypeItemActive]}
                >
                  <Ionicons 
                    name="bicycle-outline" 
                    size={24} 
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
                    size={24} 
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
                    size={24} 
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
          </>
        )}
        
        <Text style={styles.label}>Date</Text>
        <Pressable onPress={openDateSelector} style={styles.inputLike}>
          <Text>{dateDisplay}</Text>
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

        <Text style={styles.label}>Créneau</Text>
        <View style={styles.slotBox}>
          {availableSlots.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => setSlot(opt)}
              style={[styles.slotItem, slot.id === opt.id ? styles.slotItemActive : null]}
            >
              <Text style={[styles.slotText, slot.id === opt.id && styles.slotTextActive]}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Adresse</Text>
        <TextInput placeholder="Adresse complète" value={address} onChangeText={setAddress} style={styles.input} />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput placeholder="06 12 34 56 78" keyboardType="phone-pad" value={phone} onChangeText={setPhone} style={[styles.input, { marginBottom: 16 }]} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Confirmer" onPress={handleConfirm} />

        <Text style={styles.hint}>
          Astuce: vos réservations sont sauvegardées en ligne et accessibles sur tous vos appareils.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerSpace: { height: 8 },
  headerInline: { paddingHorizontal: 20, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  headerPrice: { fontSize: 16, fontWeight: '700', color: '#1E40AF' },
  content: { padding: 20 },
  label: { fontSize: 12, color: '#374151', marginBottom: 4, fontWeight: '600' },
  inputLike: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  vehicleTypeBox: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 12,
    flexWrap: 'wrap'
  },
  vehicleTypeItem: { 
    flex: 1,
    minWidth: 100,
    borderWidth: 2, 
    borderColor: '#d1d5db', 
    borderRadius: 12, 
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  vehicleTypeItemActive: { 
    borderColor: '#1E40AF',
    backgroundColor: '#1E40AF'
  },
  vehicleTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4
  },
  vehicleTypeTextActive: {
    color: '#FFFFFF'
  },
  vehicleTypePrice: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  vehicleTypePriceActive: {
    color: '#E0E7FF'
  },
  slotBox: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, marginBottom: 12 },
  slotItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  slotItemActive: { backgroundColor: '#EFF6FF' },
  slotText: { color: '#374151', fontSize: 14 },
  slotTextActive: { color: '#1E40AF', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, marginBottom: 12 },
  error: { color: '#dc2626', marginBottom: 12 },
  hint: { fontSize: 12, color: '#6b7280', marginTop: 12 },
});


