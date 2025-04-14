import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface ClassItemProps {
  name: string;
  studentCount: number;
  isSelected: boolean;
  onPress: () => void;
  onDelete: () => void;
}

const ClassItem: React.FC<ClassItemProps> = ({
  name,
  studentCount,
  isSelected,
  onPress,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onPress}
    >
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.count}>{studentCount} học sinh</Text>
      </View>
      <TouchableOpacity onPress={onDelete}>
        <FontAwesome name="trash" size={18} color="#D92D20" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
  },
  selectedContainer: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#1E88E5',
  },
  infoContainer: { flex: 1 },
  name: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  count: { fontSize: 14, color: '#666', marginTop: 5 },
});

export default ClassItem;
