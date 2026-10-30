import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { LogHomeScreen } from '../screens/Log/LogHomeScreen';
import { WorkoutDayScreen } from '../screens/Log/WorkoutDayScreen';
import { ExerciseSwapScreen } from '../screens/Log/ExerciseSwapScreen';
import { LiveWorkoutScreen } from '../screens/Log/LiveWorkoutScreen';
import { SessionSummaryScreen } from '../screens/Log/SessionSummaryScreen';
import type { LogStackParamList } from './types';

const Stack = createNativeStackNavigator<LogStackParamList>();

export function LogStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="LogHome" component={LogHomeScreen} />
      <Stack.Screen name="WorkoutDay" component={WorkoutDayScreen} />
      <Stack.Screen name="LiveWorkout" component={LiveWorkoutScreen} />
      <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />
      <Stack.Screen name="ExerciseSwap" component={ExerciseSwapScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
