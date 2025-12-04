import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Platform, Pressable, View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen.jsx';
import LoginScreen from './src/screens/LoginScreen.jsx';
import HomeScreen from './src/screens/HomeScreen.jsx';
import OwnerDetailsScreen from './src/screens/OwnerDetailsScreen.jsx';
import BookingScreen from './src/screens/BookingScreen.jsx';
import ConfirmationScreen from './src/screens/ConfirmationScreen.jsx';
import MesReservationsScreen from './src/screens/MesReservationsScreen.jsx';
import MonCompteScreen from './src/screens/MonCompteScreen.jsx';
import OwnerScreen from './src/screens/OwnerScreen.jsx';
import { AuthProvider, useAuth } from './src/context/AuthContext.jsx';
import { BookingProvider } from './src/context/BookingContext.jsx';
import { DrawerProvider, useDrawer } from './src/components/DrawerProvider.jsx';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading, userProfile } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  // Check if user is owner
  const isOwner = user && userProfile && userProfile.role === 'owner';

  // Decide initial route: if owner, go to Owner screen automatically
  const initialRoute = user ? (isOwner ? 'Owner' : 'Home') : 'Login';

  // Use key to force NavigationContainer remount when auth state changes
  // This ensures clean navigation state transition between authenticated/unauthenticated
  return (
    <NavigationContainer key={user ? 'authenticated' : 'unauthenticated'}>
      <DrawerProvider>
        <StatusBar barStyle="light-content" />
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: true,
            headerTintColor: '#ffffff',
            headerTitleStyle: { fontWeight: '700' },
            header: (props) => <CustomHeader {...props} />,
          }}
        >
          {user ? (
            // Authenticated screens
            isOwner ? (
              // Owner-only screens
              <Stack.Screen name="Owner" component={OwnerScreen} options={{ title: 'Gestion Lavage', headerLeft: () => <OwnerLogoutButton /> }} />
            ) : (
              // Regular user screens
              <>
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil', headerLeft: () => <MenuButton /> }} />
                <Stack.Screen name="OwnerDetails" component={OwnerDetailsScreen} options={{ title: 'Détails du Lavage' }} />
                <Stack.Screen name="Reservations" component={MesReservationsScreen} options={{ title: 'Mes Réservations', headerLeft: () => <MenuButton /> }} />
                <Stack.Screen name="Account" component={MonCompteScreen} options={{ title: 'Mon Compte', headerLeft: () => <MenuButton /> }} />
                <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Réserver' }} />
                <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ title: 'Confirmation' }} />
              </>
            )
          ) : (
            // Unauthenticated screens
            <>
              <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </DrawerProvider>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppNavigator />
      </BookingProvider>
    </AuthProvider>
  );
}

// providers moved to wrap the entire NavigationContainer above

function MenuButton() {
  const ctx = useDrawer() || { openDrawer: () => {} };
  return (
    <Pressable onPress={ctx.openDrawer} style={{ paddingHorizontal: 12 }} accessibilityRole="button">
      <Ionicons name="menu" size={28} color="#ffffff" />
    </Pressable>
  );
}

function OwnerLogoutButton() {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
      if (!confirmed) return;
    } else {
      return Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: async () => {
              try {
                await logout();
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
              }
            },
          },
        ]
      );
    }
    
    // Web logout flow
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      alert('Erreur: Une erreur est survenue lors de la déconnexion');
    }
  };

  return (
    <Pressable onPress={handleLogout} style={{ paddingHorizontal: 12 }} accessibilityRole="button">
      <Ionicons name="log-out" size={28} color="#ffffff" />
    </Pressable>
  );
}

function CustomHeader({ navigation, route, options, back }) {
  const tintColor = options.headerTintColor ?? '#ffffff';
  const backgroundColor = options.headerStyle?.backgroundColor ?? '#1E40AF';
  const borderBottomColor = options.headerStyle?.borderBottomColor;
  const titleText = options.title ?? route.name;
  const titleContent = typeof options.headerTitle === 'function'
    ? options.headerTitle({ tintColor, children: titleText })
    : typeof options.headerTitle === 'string'
      ? options.headerTitle
      : titleText;

  const leftNode = options.headerLeft
    ? options.headerLeft({ tintColor, canGoBack: !!back })
    : back
      ? (
        <Pressable onPress={navigation.goBack} accessibilityRole="button" style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={tintColor} />
        </Pressable>
      )
      : null;

  const rightNode = options.headerRight ? options.headerRight({ tintColor }) : null;

  const titleNode = React.isValidElement(titleContent)
    ? titleContent
    : (
      <Text style={[styles.titleText, { color: tintColor }]} numberOfLines={1}>
        {titleContent}
      </Text>
    );

  return (
    <View style={[styles.headerWrapper, { backgroundColor, borderBottomColor }]}> 
      <SafeAreaView edges={['top']}>
        <View style={styles.headerRow}>
          <View style={styles.side}>{leftNode}</View>
          <View style={styles.titleContainer}>{titleNode}</View>
          <View style={styles.side}>{rightNode}</View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    borderBottomWidth: Platform.OS === 'web' ? 0 : StyleSheet.hairlineWidth,
    ...(Platform.OS === 'web' ? { boxShadow: 'none' } : {}),
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  side: {
    width: 72,
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
  },
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
});


