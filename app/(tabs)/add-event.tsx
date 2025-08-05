import React, { useState } from 'react';
import { TextInput, StyleSheet, Platform, View, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
    <LinearGradient
      colors={['#4a90e2', '#357abd']}
      style={styles.container}
    >
      <ThemedText type="title" style={styles.title}>新增活動</ThemedText>

      <View style={styles.card}>
        <View style={styles.inputContainer}>
          <IconSymbol size={24} name="pencil.circle.fill" color="#4a90e2" />
          <TextInput
            style={styles.input}
            placeholder="活動名稱"
            placeholderTextColor="#999"
            value={eventName}
            onChangeText={setEventName}
          />
        </View>

        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => { setMode('date'); setShow(true); }}
          >
            <IconSymbol size={24} name="calendar" color="#4a90e2" />
            <View style={styles.dateTimeText}>
              <ThemedText style={styles.dateTimeLabel}>日期</ThemedText>
              <ThemedText style={styles.dateTimeValue}>{format(date, 'yyyy-MM-dd')}</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => { setMode('time'); setShow(true); }}
          >
            <IconSymbol size={24} name="clock" color="#4a90e2" />
            <View style={styles.dateTimeText}>
              <ThemedText style={styles.dateTimeLabel}>時間</ThemedText>
              <ThemedText style={styles.dateTimeValue}>{format(date, 'HH:mm')}</ThemedText>
            </View>
          </TouchableOpacity>
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
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveEvent}
      >
        <LinearGradient
          colors={['#34c759', '#30b350']}
          style={styles.saveButtonGradient}
        >
          <IconSymbol size={24} name="checkmark.circle.fill" color="#ffffff" />
          <ThemedText style={styles.saveButtonText}>儲存活動</ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}


const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  dateTimeContainer: {
    marginBottom: 15,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
  },
  dateTimeText: {
    marginLeft: 12,
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});