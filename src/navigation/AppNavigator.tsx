import React from 'react';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { BottomTabNavigator } from './BottomTabNavigator';
import QuizScreen from '../screens/QuizScreen';
import MockTestScreen from '../screens/MockTestScreen';
import HazardScreen from '../screens/HazardScreen';
import ResultScreen from '../screens/ResultScreen';
import ReviewScreen from '../screens/ReviewScreen';
import TopicListScreen from '../screens/TopicListScreen';
import HighwayCodeSectionScreen from '../screens/learn/HighwayCodeSectionScreen';
import SignDetailScreen from '../screens/learn/SignDetailScreen';
import SignInScreen from '../screens/account/SignInScreen';
import PhoneAuthScreen from '../screens/account/PhoneAuthScreen';
import AccountScreen from '../screens/account/AccountScreen';
import PaywallScreen from '../screens/PaywallScreen';
import LegalScreen from '../screens/LegalScreen';

const Stack = createStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['uktheory://'],
  config: {
    screens: {
      Main: '',
      TopicList: 'topics',
      Quiz: 'quiz',
      MockTest: 'mock-test',
      Hazard: 'hazard',
      Result: 'result',
      Review: 'review',
      HighwayCodeSection: 'highway-code/:sectionId',
      SignDetail: 'signs/:signId',
      SignIn: 'sign-in',
      PhoneAuth: 'phone-auth',
      Account: 'account',
      Paywall: 'paywall',
      Legal: 'legal/:doc',
    },
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="TopicList" component={TopicListScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="MockTest" component={MockTestScreen} />
        <Stack.Screen name="Hazard" component={HazardScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        {/* Reference content – also reachable from inside the Learn tab. Registered
            here so rule chips inside Quiz/Review can deep-link without changing tabs. */}
        <Stack.Screen name="HighwayCodeSection" component={HighwayCodeSectionScreen} />
        <Stack.Screen name="SignDetail" component={SignDetailScreen} />
        <Stack.Screen name="Legal" component={LegalScreen} />
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
          <Stack.Screen name="Account" component={AccountScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
