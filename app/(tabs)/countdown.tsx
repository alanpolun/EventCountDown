import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type TimeUnit = 'days' | 'hours' | 'minutes';

export default function CountdownScreen() {
  const params = useLocalSearchParams();
  const { name, date } = params;
  const eventName = typeof name === 'string' ? name : null;
  const eventDateString = typeof date === 'string' ? date : null;

  const eventDate = eventDateString ? new Date(eventDateString) : null;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('days');
  useEffect(() => {
    if (!eventDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      let diff;
      switch (timeUnit) {
        case 'days':
          diff = differenceInDays(eventDate, now);
          break;
        case 'hours':
          diff = differenceInHours(eventDate, now);
          break;
        case 'minutes':
          diff = differenceInMinutes(eventDate, now);
          break;
        default:
          diff = differenceInDays(eventDate, now);
      }
      setTimeLeft(diff);
    };

    calculateTimeLeft(); // Calculate initially

    const timerId = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(timerId); // Cleanup on unmount
  }, [eventDate, timeUnit]); // Dependency array includes eventDate and timeUnit

  const displayTimeUnit = () => {
      switch (timeUnit) {
          case 'days':
              return 'Days';
          case 'hours':
              return 'Hours';
          case 'minutes':
              return 'Minutes';
          default:
              return 'Days';
      }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Countdown Timer</ThemedText>
      {/* Display event name if available */}
      {eventName && <ThemedText type="subtitle">Event: {eventName}</ThemedText>}
      {eventDate && <ThemedText>Event Date: {format(eventDate, 'yyyy-MM-dd HH:mm')}</ThemedText>}

      {timeLeft !== null && (
          <ThemedText type="defaultSemiBold" style={styles.countdownText}>
              Time Left: {timeLeft} {displayTimeUnit()}
          </ThemedText>
      )}

      <View style={styles.unitSelector}>
          <Button title="Days" onPress={() => setTimeUnit('days')} disabled={!eventDate} />\
          <Button title="Hours" onPress={() => setTimeUnit('hours')} disabled={!eventDate} />\
          <Button title="Minutes" onPress={() => setTimeUnit('minutes')} disabled={!eventDate} />\
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Align items in the center
    flex: 1, // Added flex: 1 for proper layout
    padding: 20,
  },
  countdownText: {
      fontSize: 24,
      marginVertical: 20,
  },
  unitSelector: {
      flexDirection: 'row',
      marginTop: 20,
      justifyContent: 'space-around',
      width: '100%',
  }
});