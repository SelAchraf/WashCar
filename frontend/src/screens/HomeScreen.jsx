import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../config/api';

export default function HomeScreen({ navigation }) {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    // Filter owners based on search query
    if (searchQuery.trim() === '') {
      setFilteredOwners(owners);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = owners.filter(owner => 
        owner.name.toLowerCase().includes(query) ||
        (owner.address && owner.address.toLowerCase().includes(query)) ||
        (owner.phone && owner.phone.includes(query))
      );
      setFilteredOwners(filtered);
    }
  }, [searchQuery, owners]);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/owners`);
      if (!res.ok) {
        console.warn('Failed to fetch owners from backend');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setOwners(data);
      setFilteredOwners(data);
    } catch (err) {
      console.error('Error fetching owners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerPress = (owner) => {
    navigation.navigate('OwnerDetails', { owner });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="car-sport" size={32} color="#1E40AF" />
          <Text style={styles.headerTitle}>Lavages Disponibles</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un lavage..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#1E40AF" style={{ marginTop: 20 }} />
        ) : filteredOwners.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Aucun résultat' : 'Aucun lavage disponible'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Essayez une autre recherche' 
                : 'Il n\'y a pas de lavages disponibles pour le moment'}
            </Text>
          </View>
        ) : (
          filteredOwners.map((owner) => (
            <Pressable
              key={owner.id}
              style={({ pressed }) => [
                styles.ownerCard,
                pressed && styles.ownerCardPressed
              ]}
              onPress={() => handleOwnerPress(owner)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconBadge}>
                  <Ionicons name="business" size={28} color="#1E40AF" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.ownerName}>{owner.name}</Text>
                  {owner.address ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="location" size={16} color="#6B7280" />
                      <Text style={styles.infoText} numberOfLines={1}>{owner.address}</Text>
                    </View>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
              </View>

              <View style={styles.cardFooter}>
                {owner.phone ? (
                  <View style={styles.footerItem}>
                    <Ionicons name="call" size={14} color="#6B7280" />
                    <Text style={styles.footerText}>{owner.phone}</Text>
                  </View>
                ) : null}
                {owner.email ? (
                  <View style={styles.footerItem}>
                    <Ionicons name="mail" size={14} color="#6B7280" />
                    <Text style={styles.footerText} numberOfLines={1}>{owner.email}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  ownerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ownerCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
});


