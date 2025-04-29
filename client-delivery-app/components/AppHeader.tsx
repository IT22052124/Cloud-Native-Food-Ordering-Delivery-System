// app/components/AppHeader.tsx
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ReactNode } from 'react';

interface AppHeaderProps {
  title?: string | React.ReactNode;
  titleStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  rightAction?: ReactNode;
}

export default function AppHeader({ title, rightAction }: AppHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.rightActionsContainer}>
        {rightAction ? (
          rightAction
        ) : (
          <TouchableOpacity 
            onPress={() => router.push('/(delivery)/profile')}
            style={styles.profileButton}
          >
            <MaterialIcons name="account-circle" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#3A86FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '600' 
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginLeft: 10,
  },
});