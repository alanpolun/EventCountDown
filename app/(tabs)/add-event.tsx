import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, Platform, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

export default function AddEventScreen() {
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleSaveEvent = async () => {
    console.log('Event Name:', eventName);
    console.log('Event Date and Time:', date);

    const newEvent = {
      id: Date.now().toString(), // Simple unique ID
      name: eventName,
      date: date.toISOString(), // Save date as ISO string
    };

    const existingEvents = await AsyncStorage.getItem('scheduledEvents');
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    events.push(newEvent);
    await AsyncStorage.setItem('scheduledEvents', JSON.stringify(events));
    setEventName('');
    setDate(new Date());
    router.push('/(tabs)/event-list'); // Navigate to the event list
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

      <View style={styles.dateTimeContainer}>
        <ThemedText>Selected Date: {format(date, 'yyyy-MM-dd')}</ThemedText>
        <Button onPress={() => { setMode('date'); setShow(true); }} title="Select Date" />
      </View>

      <View style={styles.dateTimeContainer}>
         <ThemedText>Selected Time: {format(date, 'HH:mm')}</ThemedText>
         <Button onPress={() => { setMode('time'); setShow(true); }} title="Select Time" />
      </View>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}

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
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
});