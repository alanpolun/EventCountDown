import { StyleSheet, FlatList, View, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

type Event = {
  id: string;
  name: string;
  date: string; // Stored as ISO string
};

async function requestNotificationPermission() {
  // 只需要請求通知權限，不需要推送通知的token
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

async function scheduleNotification(event: Event) {
  try {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    // 設置多個通知時間點
    const notificationTimes = [
      { minutes: 10080, message: '7 天' },  // 7 days
      { minutes: 4320, message: '3 天' },   // 3 days
      { minutes: 1440, message: '1 天' },   // 1 day
      { minutes: 720, message: '12 小時' },  // 12 hours
      { minutes: 360, message: '6 小時' },   // 6 hours
      { minutes: 60, message: '1 小時' },    // 1 hour
      { minutes: 30, message: '30 分鐘' },   // 30 minutes
      { minutes: 10, message: '10 分鐘' },   // 10 minutes
      { minutes: 1, message: '1 分鐘' }      // 1 minute
    ];

    for (const { minutes, message } of notificationTimes) {
      const notificationTime = new Date(eventDate);
      notificationTime.setMinutes(notificationTime.getMinutes() - minutes);

      if (notificationTime > now) {
        const seconds = Math.floor((notificationTime.getTime() - now.getTime()) / 1000);
        console.log(`Scheduling notification for ${event.name}: ${seconds} seconds from now (${message}前)`);
        
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `活動提醒：${event.name}`,
            body: `您的活動「${event.name}」將在${message}後結束`,
            data: { eventId: event.id },
          },
          trigger: seconds > 0 ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
            repeats: false
          } as Notifications.TimeIntervalTriggerInput : null,
        });
        console.log(`Scheduled notification with ID: ${notificationId} for ${message}前`);
      }
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

export default function EventListScreen() {
  const [events, setEvents] = useState<Event[]>([]);

  // 初始化通知設置
  useEffect(() => {
    requestNotificationPermission();
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const savedEvents = await AsyncStorage.getItem('scheduledEvents');
      if (savedEvents !== null) {
        setEvents(JSON.parse(savedEvents));
      } else {
        setEvents([]); // Set empty array if no events are saved
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]); // Set empty array in case of error
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Event List screen focused - loading events');
      loadEvents();
      
      return () => {
        // Cleanup if needed
      };
    }, [loadEvents])
  );

  const handleRemoveEvent = useCallback(async (id: string) => {
    try {
      const existingEventsString = await AsyncStorage.getItem('scheduledEvents');
      if (existingEventsString !== null) {
        const existingEvents: Event[] = JSON.parse(existingEventsString);
        const updatedEvents = existingEvents.filter(event => event.id !== id);
        
        // 取消所有通知
        await Notifications.cancelAllScheduledNotificationsAsync();
        
        // 為剩餘的事件重新設置通知
        for (const event of updatedEvents) {
          await scheduleNotification(event);
        }
        
        await AsyncStorage.setItem('scheduledEvents', JSON.stringify(updatedEvents));
        setEvents(updatedEvents); // Update state to re-render
      }
    } catch (error) {
      console.error('Error removing event:', error);
    }
  }, []);

  const handleEventPress = (event: Event) => {
    router.navigate({
      pathname: "/(tabs)/countdown",
      params: { name: event.name, date: event.date }
    });
  };

  const calculateTimeLeft = (targetDate: Date) => {
    const now = new Date();
    const days = differenceInDays(targetDate, now);
    const hours = differenceInHours(targetDate, now);
    const minutes = differenceInMinutes(targetDate, now);
    const seconds = differenceInSeconds(targetDate, now);

    if (days > 7) {
      return `${days} 天`;
    } else if (days >= 1) {
      return `${hours} 小時`;
    } else if (hours >= 12) {
      return `${minutes} 分鐘`;
    } else if (seconds > 0) {
      return `${seconds} 秒`;
    }
    return '已過期';
  };

  const EventItem = ({ item }: { item: Event }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const eventDate = new Date(item.date);
    const isUpcoming = eventDate > new Date();
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const isWithinOneDay = differenceInHours(eventDate, new Date()) <= 24 && isUpcoming;

    // 閃爍動畫效果
    useEffect(() => {
      let animation: Animated.CompositeAnimation;
      if (isWithinOneDay) {
        animation = Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ]);

        Animated.loop(animation).start();
      } else {
        opacityAnim.setValue(1);
      }

      return () => {
        if (animation) {
          animation.stop();
        }
      };
    }, [isWithinOneDay, opacityAnim]);

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(eventDate));
      }, 1000);

      return () => clearInterval(timer);
    }, [eventDate]);
    
    return (
      <Animated.View style={{ opacity: opacityAnim }}>
        <TouchableOpacity 
          style={[styles.eventItemContainer, !isUpcoming && styles.pastEvent]}
          onPress={() => handleEventPress(item)}
        >
          <LinearGradient
            colors={
              isWithinOneDay ? ['#ff3b30', '#ff6b6b'] :
              isUpcoming ? ['#4a90e2', '#357abd'] : 
              ['#9e9e9e', '#757575']
            }
            style={styles.eventGradient}
          >
          <View style={styles.eventDetails}>
            <ThemedText style={styles.eventName} type="defaultSemiBold">{item.name}</ThemedText>
            <View style={styles.timeRow}>
              <ThemedText style={styles.eventDate}>{new Date(item.date).toLocaleString()}</ThemedText>
              <View style={styles.countdownBadge}>
                <IconSymbol size={14} name="clock.fill" color="rgba(255,255,255,0.9)" />
                <ThemedText style={styles.countdownText}>{timeLeft}</ThemedText>
              </View>
            </View>
            {!isUpcoming && (
              <ThemedText style={styles.pastEventLabel}>已過期</ThemedText>
            )}
          </View>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              handleRemoveEvent(item.id);
            }}
            style={styles.deleteButton}
          >
            <IconSymbol size={24} name="trash.circle.fill" color="#000000" />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Event List</ThemedText>
      <FlatList
        data={events}
        renderItem={({ item }) => <EventItem item={item} />}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={() => (
          <ThemedText style={styles.noEventsText}>No events scheduled yet.</ThemedText>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countdownText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 4,
  },
  eventItemContainer: {
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden'
  },
  pastEvent: {
    opacity: 0.7
  },
  eventGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15
  },
  eventDetails: {
    flex: 1,
    marginRight: 10
  },
  eventName: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 5
  },
  eventDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)'
  },
  pastEventLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20
  },
  noEventsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
    fontSize: 16
  }
});