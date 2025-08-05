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
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

type Event = {
  id: string;
  name: string;
  date: string; // Stored as ISO string
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  return token;
}

async function scheduleNotification(event: Event) {
  const eventDate = new Date(event.date);
  const now = new Date();
  const timeDiff = eventDate.getTime() - now.getTime();
  const hoursBefore = 1; // 在事件開始前1小時提醒
  
  // 如果事件時間在未來
  if (timeDiff > 0) {
    const notificationTime = new Date(eventDate);
    notificationTime.setHours(notificationTime.getHours() - hoursBefore);

    if (notificationTime > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `活動提醒：${event.name}`,
          body: `您的活動將在 1 小時後開始`,
          data: { eventId: event.id },
        },
        trigger: null,
      });
    }
  }
}

export default function AddEventScreen() {
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);

  // 初始化通知處理
  React.useEffect(() => {
    registerForPushNotificationsAsync();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true
      }),
    });
  }, []);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleSaveEvent = async () => {
    try {
      if (!eventName.trim()) {
        // 如果沒有輸入事件名稱，不要儲存
        console.log('Event name is required');
        return;
      }

      console.log('Saving event:', eventName);
      console.log('Event Date and Time:', date);

      const newEvent = {
        id: Date.now().toString(), // Simple unique ID
        name: eventName.trim(),
        date: date.toISOString(), // Save date as ISO string
      };

      // 先檢查是否可以讀取現有事件
      const existingEventsString = await AsyncStorage.getItem('scheduledEvents');
      let events = [];
      if (existingEventsString) {
        events = JSON.parse(existingEventsString);
      }
      
      // 新增事件到列表
      events.push(newEvent);
      
      // 儲存更新後的事件列表
      await AsyncStorage.setItem('scheduledEvents', JSON.stringify(events));
      console.log('Event saved successfully');

      // 檢查通知權限並註冊
      await registerForPushNotificationsAsync();

      // 設定此事件的通知
      await scheduleNotification(newEvent);
      console.log('Notification scheduled');

      // 重置表單
      setEventName('');
      setDate(new Date());
      
      // 導航回事件列表
      router.push('/(tabs)/event-list');
    } catch (error) {
      console.error('Error saving event:', error);
    }
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