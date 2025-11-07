import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDA } from '../utils/format.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TIME_SLOTS } from '../data/services.js';
import Button from '../components/Button.jsx';
import { saveBooking } from '../utils/storage.js';
import { useBooking } from '../context/BookingContext.jsx';

export default function BookingScreen({ route, navigation }) {
  const { service } = route.params || {};
  const { addBooking } = useBooking();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [slot, setSlot] = useState(TIME_SLOTS[0]);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const webDateInputRef = useRef(null);
  const isWeb = Platform.OS === 'web';
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
      id: `${Date.now()}`,
      service,
      date: date.toISOString(),
      slot,
      address,
      phone,
      status: 'Confirmée',
      createdAt: new Date().toISOString(),
    };
    await saveBooking(booking);
    await addBooking(booking);
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Reservations' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSpace} />
      <View style={styles.headerInline}>
        <Text style={styles.headerTitle}>{service?.title}</Text>
        <Text style={styles.headerPrice}>{formatDA(service?.price ?? 0)}</Text>
      </View>
      <View style={styles.content}>
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
          {TIME_SLOTS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => setSlot(opt)}
              style={[styles.slotItem, slot.id === opt.id ? styles.slotItemActive : null]}
            >
              <Text>{opt.label}</Text>
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
          Astuce: les données sont enregistrées localement (mode hors-ligne simulé).
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
  headerPrice: { fontSize: 16, fontWeight: '700', color: '#1E40AF' },
  content: { padding: 20 },
  label: { fontSize: 12, color: '#374151', marginBottom: 4 },
  inputLike: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  slotBox: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, marginBottom: 12 },
  slotItem: { padding: 12 },
  slotItemActive: { backgroundColor: '#f3f4f6' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, marginBottom: 12 },
  error: { color: '#dc2626', marginBottom: 12 },
  hint: { fontSize: 12, color: '#6b7280', marginTop: 12 },
});


