import React, { useState } from 'react';
import { TextInput, Button, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function AddEventScreen() {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  const handleSaveEvent = () => {
    // Here you would typically save the event data
    // For now, let's just log the values
    console.log('Event Name:', eventName);
    console.log('Event Date:', eventDate);
    console.log('Event Time:', eventTime);

    // Clear the input fields after saving (optional)
    setEventName('');
    setEventDate('');
    setEventTime('');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Add New Event</ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={eventName}
        onChangeText={setEventName}
      />

      <TextInput
        style={styles.input}
        placeholder="Date (e.g., YYYY-MM-DD)"
        value={eventDate}
        onChangeText={setEventDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Time (e.g., HH:MM)"
        value={eventTime}
        onChangeText={setEventTime}
      />

      <Button title="Save Event" onPress={handleSaveEvent} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: '#000', // Ensure text is visible in light mode
    backgroundColor: '#fff', // Ensure background is visible in light mode
  },
});