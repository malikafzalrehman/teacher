import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Splash from './Splash';
import Login from './login';
import NewFile from './Newfile';
import MainHome from './HomeScreen';
import SelfStudy from './SelfStudyScreen';
import AIScreen from './AIScreen';
import AItuition from './AIScreen';
import books from './Books';
import Books from './Books';
import Bookscreen from './Books';
import Onlineacademy from './Onlineacademy';
import CertificateCheckerScreen from './CertificateCheckerScreen';
import AdminDash from './AdminDash';
import KidsScreen from './KidsScreen';
import QuranScreen from './QuranScreen';
import Schoolonlinesetup from './Schoolonlinesetup';
import Mycollege from './Mycollege';
import Myuniversity from './Myuniversity';
import Headpanel from './Headpanel';
import Teacherdashborad from './Teacherdashborad';
import Classmanagement from './Classmanagement';
import Attendance from './Attendance';
import Homework from './Homework';
import Exammanagement from './Exammanagement';
import Studentportal from './Studentportal';
import Feemanagement from './Feemanagement';
import Messages from './Massages';
import Notifications from './Notifications';
import Report from './Report';
import Parentprotal from './Parentprotal';
import SignUp from './Singup';
import Teacherprofile from './Teacherprofile';
import Teachercclassmanagement from './Teachersclassmanagement';
 
import Headteacherdash from './Headteacherdash';

import { Provider } from 'react-redux';
import { store } from './redux/store';
import Teacherattendance from './Teacherattendance';
import Headexammanagement from './Headexammanagement';
import Studentportal1 from './Studentprotal1';
import Teacherhomework from './Teacherhomework';
import Studenthomework from './studenthomework';
import Acconuntantfee from './Afee';
import Parentprotal1 from './Parentprotal1';
import Headmessages from './Headmessages';
import Teachermessages from './Teachermessages';
import Studentmessages from './Studentmessages';
import Parentmassages from './Parentmassages';
import Afee from './Afee';
import Parenthomework from './Prenthomework';
import Headreport from './Headreport';
import Accountantreport from './Accountanatreport';
import Hnotification from './Hnotification';
import Studentnotification from './Studentnotification';
import Parentnotification from './Parentnotification';
import Teachernotification from './Teachernotification';

const Stack = createStackNavigator();

const App = () => {
  return (
     <Provider store={store}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="splash">
        <Stack.Screen name="splash" component={Splash} options={{ headerShown: false }} />
        <Stack.Screen name="singup" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen name="login" component={Login} options={{ headerShown: false }} />

        <Stack.Screen name="Home" component={MainHome} options={{ headerShown: false }} />
        <Stack.Screen name="newFile" component={NewFile} options={{ headerShown: false }} />
        <Stack.Screen name="selfStudy" component={SelfStudy} options={{ headerShown: false }} />
        <Stack.Screen name="aituition" component={AItuition} options={{ headerShown: false }} />
        <Stack.Screen name="bookscreen" component={Books} options={{ headerShown: false }} />
        <Stack.Screen name="academy" component={Onlineacademy} options={{ headerShown: false }} />
        <Stack.Screen name="cck" component={CertificateCheckerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="books" component={Books} />
        <Stack.Screen name="admin" component={AdminDash} />
         <Stack.Screen name="kids" component={KidsScreen} />   
         <Stack.Screen name="quran" component={QuranScreen} />  
          <Stack.Screen name="schoolonlinesetup" component={Schoolonlinesetup} /> 
          
           <Stack.Screen name="college" component={Mycollege} /> 
             <Stack.Screen name="university" component={Myuniversity} /> 
             <Stack.Screen name="headpanel" component={Headpanel} />
             <Stack.Screen name="teacherdashborad" component={Teacherdashborad} />
             <Stack.Screen name="classmanagement" component={Classmanagement} />
             <Stack.Screen name="attendanc" component={Attendance} />
             <Stack.Screen name="homework" component={Homework} />  
             <Stack.Screen name="exammanagement" component={Exammanagement} />  
             <Stack.Screen name="studentportal" component={Studentportal} />  
             <Stack.Screen name="parentprotal" component={Parentprotal} />  
             <Stack.Screen name="feemanagement" component={Feemanagement} /> 
             <Stack.Screen name="massages" component={Messages} /> 
             <Stack.Screen name="notifications" component={Notifications} />  
             <Stack.Screen name="report" component={Report} /> 
              <Stack.Screen name="teacherprofile" component={Teacherprofile} />
              <Stack.Screen name="teacherclass" component={Teachercclassmanagement} />
              <Stack.Screen name="teacherattendance" component={Teacherattendance} />
              <Stack.Screen name="headteacherdash" component={Headteacherdash} />
               <Stack.Screen name="teacherclassmanagement" component={Teachercclassmanagement} />
            <Stack.Screen name="headexammanagement" component={Headexammanagement} />
               <Stack.Screen name="studentportal1" component={Studentportal1} />
               <Stack.Screen name="teacherhomework" component={Teacherhomework} />
                <Stack.Screen name="studenthomework" component={Studenthomework} />
              <Stack.Screen name="acconuntantfee" component={Acconuntantfee} />
               <Stack.Screen name="parentprotal1" component={Parentprotal1} />
                <Stack.Screen name="headmessages" component={Headmessages} />
                <Stack.Screen name="teachermessages" component={Teachermessages} />
                 <Stack.Screen name="studentmessages" component={Studentmessages} />
                 <Stack.Screen name="parentmessages" component={Parentmassages} />
                  <Stack.Screen name="afee" component={Afee} />
                  <Stack.Screen name="parenthomwork" component={Parenthomework} />
                   <Stack.Screen name="headreport" component={Headreport} />
                   <Stack.Screen name="accountantreport" component={Accountantreport} />
                    <Stack.Screen name="headnotification" component={Hnotification} />
                     <Stack.Screen name="tnotification" component={Teachernotification} />
                      <Stack.Screen name="studentnotification" component={Studentnotification} />
                       <Stack.Screen name="parentnotification" component={Parentnotification} />


      </Stack.Navigator>
    </NavigationContainer>
    </Provider>
  );
};

export default App;