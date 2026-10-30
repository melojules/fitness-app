import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { NutritionScreen } from '../screens/Nutrition/NutritionScreen';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeDashboard" component={HomeScreen} />
    <Stack.Screen name="Nutrition" component={NutritionScreen} />
  </Stack.Navigator>;
}
