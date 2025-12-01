import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('client'); // 'client' or 'owner'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await signIn(email.trim(), password);
      } else {
        result = await signUp(email.trim(), password, name.trim(), role);
      }

      if (!result.success) {
        let errorMessage = 'Une erreur est survenue';
        if (result.error.includes('auth/user-not-found')) {
          errorMessage = 'Aucun compte trouvé avec cet email';
        } else if (result.error.includes('auth/wrong-password')) {
          errorMessage = 'Mot de passe incorrect';
        } else if (result.error.includes('auth/email-already-in-use')) {
          errorMessage = 'Cet email est déjà utilisé';
        } else if (result.error.includes('auth/weak-password')) {
          errorMessage = 'Le mot de passe est trop faible';
        } else if (result.error.includes('auth/invalid-email')) {
          errorMessage = 'Email invalide';
        } else if (result.error.includes('auth/network-request-failed')) {
          errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
        } else if (result.error.includes('auth/operation-not-allowed') || result.code === 'auth/operation-not-allowed') {
          errorMessage = `L'authentification Email/Password n'est pas activée dans Firebase.

Étapes à suivre:
1. Allez sur https://console.firebase.google.com/
2. Sélectionnez le projet: washcar-55422
3. Cliquez sur "Authentication" > "Sign-in method"
4. Activez "Email/Password"
5. Attendez 2-3 minutes et réessayez

Consultez VERIFY_FIREBASE_SETUP.md pour plus de détails.`;
        } else if (result.error.includes('auth/invalid-credential')) {
          errorMessage = 'Email ou mot de passe incorrect';
        }
        Alert.alert('Erreur d\'authentification', errorMessage, [{ text: 'OK' }]);
      }
      // Navigation will be handled automatically by App.js when user state changes
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="car" size={48} color="#1E40AF" />
            </View>
            <Text style={styles.title}>WashCar</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nom complet"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.roleContainer}>
                  <Text style={styles.roleLabel}>Type de compte</Text>
                  <View style={styles.roleButtons}>
                    <Pressable
                      style={[styles.roleButton, role === 'client' && styles.roleButtonActive]}
                      onPress={() => setRole('client')}
                    >
                      <Ionicons
                        name="person"
                        size={24}
                        color={role === 'client' ? '#FFFFFF' : '#6B7280'}
                      />
                      <Text style={[styles.roleButtonText, role === 'client' && styles.roleButtonTextActive]}>
                        Client
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.roleButton, role === 'owner' && styles.roleButtonActive]}
                      onPress={() => setRole('owner')}
                    >
                      <Ionicons
                        name="business"
                        size={24}
                        color={role === 'owner' ? '#FFFFFF' : '#6B7280'}
                      />
                      <Text style={[styles.roleButtonText, role === 'owner' && styles.roleButtonTextActive]}>
                        Propriétaire
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
            </View>

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? 'Se connecter' : 'Créer un compte'}
                </Text>
              )}
            </Pressable>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? "Vous n'avez pas de compte ? " : 'Vous avez déjà un compte ? '}
              </Text>
              <Pressable 
                onPress={() => {
                  setIsLogin(!isLogin);
                  setEmail('');
                  setPassword('');
                  setName('');
                  setRole('client');
                }} 
                disabled={loading}
              >
                <Text style={styles.switchLink}>
                  {isLogin ? 'S\'inscrire' : 'Se connecter'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: {
    fontSize: 14,
    color: '#6B7280',
  },
  switchLink: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
});

