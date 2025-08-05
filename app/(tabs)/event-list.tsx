import { StyleSheet, FlatList, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

type Event = {
  id: string;
  name: string;
  date: string; // Stored as ISO string
};

export default function EventListScreen() {
  const [events, setEvents] = useState<Event[]>([]);

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
      // Call the async function inside the effect
      (async () => {
        await loadEvents();
      })();

      // Optional cleanup function
      return () => {};
    }, [loadEvents])
  );

  const handleRemoveEvent = useCallback(async (id: string) => {
    try {
      const existingEventsString = await AsyncStorage.getItem('scheduledEvents');
      if (existingEventsString !== null) {
        const existingEvents: Event[] = JSON.parse(existingEventsString);
        const updatedEvents = existingEvents.filter(event => event.id !== id);
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

  const renderItem = ({ item }: { item: Event }) => {
    const eventDate = new Date(item.date);
    const isUpcoming = eventDate > new Date();
    
    return (
      <TouchableOpacity 
        style={[styles.eventItemContainer, !isUpcoming && styles.pastEvent]}
        onPress={() => handleEventPress(item)}
      >
        <LinearGradient
          colors={isUpcoming ? ['#4a90e2', '#357abd'] : ['#9e9e9e', '#757575']}
          style={styles.eventGradient}
        >
          <View style={styles.eventDetails}>
            <ThemedText style={styles.eventName} type="defaultSemiBold">{item.name}</ThemedText>
            <ThemedText style={styles.eventDate}>{new Date(item.date).toLocaleString()}</ThemedText>
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
            <IconSymbol size={24} name="trash.circle.fill" color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Event List</ThemedText>
      <FlatList
        data={events}
        renderItem={renderItem}
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