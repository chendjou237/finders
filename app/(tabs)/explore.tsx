import { useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, Alert, ViewStyle } from 'react-native';
import DateTimePicker, { AndroidMode } from '@react-native-community/datetimepicker';

interface SearchResult {
  lac: number;
  cellID: number;
  coordinates: string;
}

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SearchScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    if (!phoneNumber) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone');
      return;
    }

    setLoading(true);
    try {
      // TODO: Remplacer par l'URL de votre API
      const response = await fetch('lo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Ajouter votre token d'authentification
          'Authorization': 'Bearer YOUR_TOKEN'
        },
        body: JSON.stringify({
          phoneNumber,
          datetime: date.toISOString()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Réponse API:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Erreur ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Données reçues:', data);
      setResult(data);
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="magnifyingglass"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Recherche</ThemedText>
      </ThemedView>

      <ThemedView style={styles.formContainer}>
        <ThemedText type="subtitle">Numéro de téléphone</ThemedText>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Entrez le numéro de téléphone"
          keyboardType="phone-pad"
        />

        <ThemedText type="subtitle" style={styles.dateLabel}>Date et heure</ThemedText>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <ThemedText>{date.toLocaleString()}</ThemedText>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode={Platform.OS === 'ios' ? 'datetime' : 'date' as AndroidMode}
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? 'Recherche en cours...' : 'Rechercher'}
          </ThemedText>
        </TouchableOpacity>

        {result && (
          <ThemedView style={styles.resultContainer}>
            <ThemedText type="subtitle">Résultats</ThemedText>
            <ThemedText>LAC: {result.lac}</ThemedText>
            <ThemedText>Cell ID: {result.cellID}</ThemedText>
            <ThemedText>Coordonnées GPS: {result.coordinates}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    opacity: 0.3,
    position: 'absolute',
    bottom: -90,
    left: -35,
    color: '#808080'
  } as ViewStyle,
  titleContainer: {
    marginBottom: 20
  } as ViewStyle,
  formContainer: {
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.8)',
      android: '#ffffff',
      default: '#ffffff'
    })
  } as ViewStyle,
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff'
  } as ViewStyle,
  dateLabel: {
    marginTop: 16
  },
  dateButton: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#fff'
  } as ViewStyle,
  searchButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  } as ViewStyle,
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  resultContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.9)',
      android: '#f5f5f5',
      default: '#f5f5f5'
    }),
    gap: 8
 } as ViewStyle
});
