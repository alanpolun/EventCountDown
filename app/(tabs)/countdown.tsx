import { StyleSheet, Text, View, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.header}>
            <IconSymbol size={32} name="clock.circle.fill" color="#4a90e2" />
            <ThemedText style={styles.title}>倒數計時器</ThemedText>
            {eventName && (
              <View style={styles.eventInfo}>
                <IconSymbol size={20} name="calendar.badge.clock" color="#666" />
                <ThemedText style={styles.eventName}>{eventName}</ThemedText>
              </View>
            )}
            {eventDate && (
              <View style={styles.eventInfo}>
                <IconSymbol size={20} name="clock.fill" color="#666" />
                <ThemedText style={styles.eventDate}>
                  {format(eventDate, 'yyyy-MM-dd HH:mm')}
                </ThemedText>
              </View>
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
        </View>

        <View style={styles.unitSelectorCard}>
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
              <IconSymbol 
                size={24} 
                name={
                  unit === 'days' ? 'calendar' :
                  unit === 'hours' ? 'clock' :
                  unit === 'minutes' ? 'timer' :
                  'stopwatch'
                } 
                color={timeUnit === unit ? '#ffffff' : '#4a90e2'} 
              />
              <ThemedText style={[
                styles.unitButtonText,
                timeUnit === unit && styles.activeUnitButtonText
              ]}>
                {unit === 'days' ? '天數' :
                 unit === 'hours' ? '小時' :
                 unit === 'minutes' ? '分鐘' :
                 '秒數'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
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
  header: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  eventName: {
    fontSize: 20,
    color: '#333',
    marginLeft: 8,
  },
  eventDate: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  countdownContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginTop: 20,
  },
  countdownText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  unitText: {
    fontSize: 24,
    color: '#666',
    marginTop: 10,
  },
  unitSelectorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    minWidth: (width - 100) / 2,
    marginHorizontal: 5,
    marginVertical: 5,
    justifyContent: 'center',
  },
  activeUnitButton: {
    backgroundColor: '#4a90e2',
  },
  unitButtonText: {
    color: '#4a90e2',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  activeUnitButtonText: {
    color: '#ffffff',
  }
});