import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';

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

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventItemContainer}
      onPress={() => handleEventPress(item)}
    >
      <View style={styles.eventDetails}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText>{`${new Date(item.date).toLocaleString()}`}</ThemedText>
      </View>
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation();
          handleRemoveEvent(item.id);
        }}
        style={styles.deleteButton}
      >
        <IconSymbol size={24} name="trash.circle.fill" color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
    padding: 20
  },
  title: {
    marginBottom: 20,
    textAlign: 'center'
  },
  eventItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10
  },
  deleteButton: {
    padding: 8
  },
  eventDetails: {
    flex: 1,
    marginRight: 10
  },
  noEventsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic'
  }
});