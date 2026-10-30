import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { ProgramsScreen } from '../screens/Programs/ProgramsScreen';
import { CustomBuilderScreen } from '../screens/Programs/CustomBuilderScreen';
import type { ProgramsStackParamList } from './types';

const Stack = createNativeStackNavigator<ProgramsStackParamList>();

export function ProgramsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="ProgramsHome" component={ProgramsScreen} />
      <Stack.Screen name="CustomBuilder" component={CustomBuilderScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
