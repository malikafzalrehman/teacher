import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MySchoolScreen from '../screens/MySchoolScreen';
import SelfStudyScreen from '../screens/SelfStudyScreen';
import AiTuitionScreen from '../screens/AiTuitionScreen';
import OnlineBooksScreen from '../screens/OnlineBooksScreen';
import OnlineAcademyScreen from '../screens/OnlineAcademyScreen';
import KidsSectionScreen from '../screens/KidsSectionScreen';
import CertificateCheckerScreen from '../screens/CertificateCheckerScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="MySchool">
      <Tab.Screen name="MySchool" component={MySchoolScreen} />
      <Tab.Screen name="SelfStudy" component={SelfStudyScreen} />
      <Tab.Screen name="AiTuition" component={AiTuitionScreen} />
      <Tab.Screen name="OnlineBooks" component={OnlineBooksScreen} />
      <Tab.Screen name="Academy" component={OnlineAcademyScreen} />
      <Tab.Screen name="Kids" component={KidsSectionScreen} />
      <Tab.Screen name="Certificate" component={CertificateCheckerScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
