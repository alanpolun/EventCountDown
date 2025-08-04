import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function EventListScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Event List</ThemedText>
      {/* Placeholder for the event list */}
      <ThemedText>Event list will appear here.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});