import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { BottomTabNavigator } from './BottomTabNavigator';
import QuizScreen from '../screens/QuizScreen';
import MockTestScreen from '../screens/MockTestScreen';
import HazardScreen from '../screens/HazardScreen';
import ResultScreen from '../screens/ResultScreen';
import ReviewScreen from '../screens/ReviewScreen';
import TopicListScreen from '../screens/TopicListScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="TopicList" component={TopicListScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="MockTest" component={MockTestScreen} />
        <Stack.Screen name="Hazard" component={HazardScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
