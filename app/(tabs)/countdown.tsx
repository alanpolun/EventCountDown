import { StyleSheet, Text } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function CountdownScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Countdown Timer</ThemedText>
      <Text>Countdown timer will be displayed here.</Text>
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