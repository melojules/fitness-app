import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Platform, StyleSheet, Text } from 'react-native';
import { colors, fontFamily, layout } from '../theme';
import { HomeIcon, LogIcon, ProfileIcon, ProgramsIcon, ProgressIcon } from '../components/TabIcons';
import { HomeStack } from './HomeStack';
import { ProgramsStack } from './ProgramsStack';
import { LogStack } from './LogStack';
import { ProgressScreen } from '../screens/Progress/ProgressScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import type { MainTabParamList } from './types';

const LOG_HIDDEN_ROUTES = ['LiveWorkout', 'SessionSummary', 'ExerciseSwap'];
const PROGRAMS_HIDDEN_ROUTES = ['CustomBuilder'];

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<keyof MainTabParamList, (props: { color: string }) => React.ReactElement> = {
  Home: ({ color }) => <HomeIcon color={color} />,
  Programs: ({ color }) => <ProgramsIcon color={color} />,
  Log: ({ color }) => <LogIcon color={color} />,
  Progress: ({ color }) => <ProgressIcon color={color} />,
  Profile: ({ color }) => <ProfileIcon color={color} />,
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const focusedRoute = getFocusedRouteNameFromRoute(route);
        const hideTabBar =
          (route.name === 'Log' && focusedRoute && LOG_HIDDEN_ROUTES.includes(focusedRoute)) ||
          (route.name === 'Programs' && focusedRoute && PROGRAMS_HIDDEN_ROUTES.includes(focusedRoute));
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.inkFaint,
          tabBarStyle: hideTabBar ? { display: 'none' as const } : styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          tabBarIcon: ({ color }: { color: string }) => icons[route.name as keyof MainTabParamList]({ color }),
          tabBarLabel: ({ color, children }: { color: string; children: string }) => (
            <Text style={[styles.tabLabel, { color }]}>{children}</Text>
          ),
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Programs" component={ProgramsStack} />
      <Tab.Screen name="Log" component={LogStack} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.hairline,
    borderTopWidth: 1,
    height: layout.tabBarHeight,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? layout.homeIndicator : 12,
  },
  tabItem: {
    gap: 3,
  },
  tabLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
  },
});
