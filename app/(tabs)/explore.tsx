import { useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, Alert, ViewStyle, TextStyle } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SearchResult {
  lac: number;
  cellid: number;
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
      const newDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
      // TODO: Remplacer par l'URL de votre API
      const response = await fetch('https://finder-api-production-7bb8.up.railway.app/phone-calls/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Ajouter votre token d'authentification
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjaGVuIiwiaWF0IjoxNzU0MTM4MTMyLCJleHAiOjE3NTQxNDE3MzJ9.0dwQ82zvS0O_XZbhCe5ojEbRIGDDLoMMVUsFK9EGGHA'
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          datetime: newDate
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
      //   console.error('Réponse API:', {
      //     status: response.status,
      //     statusText: response.statusText,
      //     body: errorText
      //   });
        let errorMessage = `Erreur ${response.status}`; if (response.status === 404) { errorMessage = `Aucune donnée trouvée pour ce numéro et cette date/heure.  ${errorText}`; } else if (errorText) { try { const errorJson = JSON.parse(errorText); errorMessage += `: ${errorJson.message || errorText}`; } catch (e) { errorMessage += `: ${errorText}`; } } else if (response.statusText) { errorMessage += `: ${response.statusText}`; } throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Données reçues:', data);
      setResult(data);
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Une erreur inattendue est survenue. Veuillez réessayer.');
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
            mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
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
            <ThemedText>Cell ID: {result.cellid}</ThemedText>
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
  } as TextStyle,
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
  } as TextStyle,
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
