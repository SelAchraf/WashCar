import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View, Text, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBooking } from '../context/BookingContext.jsx';

const DrawerCtx = createContext(null);

export function useDrawer() {
  return useContext(DrawerCtx);
}

export function DrawerProvider({ children }) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const canUseNativeDriver = Platform.OS === 'ios' || Platform.OS === 'android';

  const openDrawer = useCallback(() => {
    setOpen(true);
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: canUseNativeDriver }).start();
  }, [anim, canUseNativeDriver]);
  const closeDrawer = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: canUseNativeDriver }).start(({ finished }) => {
      if (finished) setOpen(false);
    });
  }, [anim, canUseNativeDriver]);

  const value = useMemo(() => ({ openDrawer, closeDrawer }), [openDrawer, closeDrawer]);

  return (
    <DrawerCtx.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        {open && <DrawerContent anim={anim} onClose={closeDrawer} />}
      </View>
    </DrawerCtx.Provider>
  );
}

function DrawerContent({ anim, onClose }) {
  const width = Dimensions.get('window').width * 0.75;
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-width, 0] });
  return (
    <View style={styles.backdropArea}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <Animated.View style={[styles.drawer, { width, transform: [{ translateX }] }]}> 
        <DrawerInner onNavigate={onClose} />
      </Animated.View>
    </View>
  );
}

function DrawerInner({ onNavigate }) {
  const nav = useNavigation();
  const { profile } = useBooking();
  const entries = [
    { key: 'Home', label: 'Accueil' },
    { key: 'Reservations', label: 'Mes Réservations' },
    { key: 'Account', label: 'Mon Compte' },
  ];
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>
      <View style={{ paddingVertical: 8 }}>
        {entries.map((e) => {
          const current = typeof nav.getCurrentRoute === 'function' ? nav.getCurrentRoute() : null;
          const active = current?.name === e.key;
          return (
            <Pressable key={e.key} onPress={() => { nav.navigate(e.key); onNavigate(); }}
              style={[styles.item, active ? styles.itemActive : null]}
            >
              <Text style={[styles.itemText, active ? styles.itemTextActive : null]}>{e.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ marginTop: 'auto', padding: 16 }}>
        <Pressable onPress={onNavigate} style={[styles.logout]}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdropArea: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }
      : { elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }),
  },
  header: { paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: '#1E40AF' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ffffff' },
  name: { marginTop: 8, color: '#ffffff', fontWeight: '700', fontSize: 16 },
  email: { color: '#e5e7eb' },
  item: { paddingVertical: 14, paddingHorizontal: 16 },
  itemActive: { backgroundColor: '#eff6ff' },
  itemText: { color: '#111827', fontSize: 16 },
  itemTextActive: { color: '#1E40AF', fontWeight: '700' },
  logout: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#111827', fontWeight: '600' },
});


