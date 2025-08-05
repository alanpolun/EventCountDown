import { StyleSheet, Text, View, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type TimeUnit = 'days' | 'hours' | 'minutes' | 'seconds';

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
        case 'seconds':
          diff = differenceInSeconds(eventDate, now);
          break;
        default:
          diff = differenceInDays(eventDate, now);
      }

      if (diff < 0) {
        setTimeLeft(0); // Event has passed
        return;
      }
      
      setTimeLeft(diff);
    };

    calculateTimeLeft(); // Calculate initially

    // Set interval based on the selected time unit
    const intervalTime = timeUnit === 'seconds' ? 1000 : // 1 second
                        timeUnit === 'minutes' ? 60000 : // 1 minute
                        timeUnit === 'hours' ? 3600000 : // 1 hour
                        86400000; // 1 day

    const timerId = setInterval(calculateTimeLeft, intervalTime);

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
          case 'seconds':
              return 'Seconds';
          default:
              return 'Days';
      }
  }

  return (
    <LinearGradient
      colors={['#4a90e2', '#357abd']}
      style={styles.container}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>倒數計時器</ThemedText>
        {eventName && <ThemedText style={styles.eventName}>{eventName}</ThemedText>}
        {eventDate && (
          <ThemedText style={styles.eventDate}>
            {format(eventDate, 'yyyy-MM-dd HH:mm')}
          </ThemedText>
        )}
      </View>

      {timeLeft !== null && (
        <View style={styles.countdownContainer}>
          <ThemedText style={styles.countdownText}>
            {timeLeft === 0 ? "活動已結束！" : timeLeft.toString()}
          </ThemedText>
          {timeLeft !== 0 && (
            <ThemedText style={styles.unitText}>
              {displayTimeUnit()}
            </ThemedText>
          )}
        </View>
      )}

      <View style={styles.unitSelector}>
        {(['days', 'hours', 'minutes', 'seconds'] as TimeUnit[]).map((unit) => (
          <TouchableOpacity
            key={unit}
            style={[
              styles.unitButton,
              timeUnit === unit && styles.activeUnitButton
            ]}
            onPress={() => setTimeUnit(unit)}
            disabled={!eventDate}
          >
            <ThemedText style={[
              styles.unitButtonText,
              timeUnit === unit && styles.activeUnitButtonText
            ]}>
              {unit.charAt(0).toUpperCase() + unit.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  eventName: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  countdownContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  countdownText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  unitText: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 40,
    width: '100%',
  },
  unitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    minWidth: width / 4 - 20,
  },
  activeUnitButton: {
    backgroundColor: '#ffffff',
  },
  unitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  activeUnitButtonText: {
    color: '#4a90e2',
  }
});