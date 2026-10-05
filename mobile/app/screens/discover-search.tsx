import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { PrimaryButton } from '../components/primary-button';
import { Link } from 'expo-router';

export default function DiscoverSearchScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 }}>
        <ThemedText type="title">Discover</ThemedText>
        <ThemedText>Search for clothes, styles, colors...</ThemedText>

          <PrimaryButton label="View Item" />
      </ThemedView>
    </ThemedView>
  );
} 
// search by all the categories, colors, styles, and brands. case in-sensitive 
// if not filters then show all items 
// for recommendations --> backend sends the top 10 
// for the letters, show suggestions as the user types 
// ill send little list of colors, styles, and brands to use for the search bar. eg: 

