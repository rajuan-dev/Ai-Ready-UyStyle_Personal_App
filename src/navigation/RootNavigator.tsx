// import React, { useState } from 'react'
// import { createNativeStackNavigator } from '@react-navigation/native-stack'
// import OnBoardingScreen from '../Screens/Onbording/OnBordingScreen'
// import SignupScreen from '../Screens/signup/SignupScreen'
// import SignInScreen from '../Screens/signin/SignInScreen'
// import BottomBar from './BottomBar'
// import ProfileEditScreen from '../Screens/profile/Profileeditscreen'
// import StylePreferenceScreen from '../Screens/profile/StylePreferenceScreen'
// import CombineScreen from '../Screens/combin/Combinescreen'
// import SaveSuccessScreen from '../Screens/combin/SaveSuccessScreen'
// import PreviewScreen from '../Screens/combin/PreviewScreen'
// import NotificationScreen from '../settings/NotificationScreen'
// import AccountSettingsScreen from '../settings/AccountSettingsScreen'
// import PrivacyPolicyScreen from '../settings/PrivacyPolicyScreen'
// import HelpScreen from '../settings/HelpScreen'
// import SplashScreen from '../Screens/splash/Splashscreen'



// const Stack = createNativeStackNavigator()


// export default function App() {
//     const [splashDone, setSplashDone] = useState(false)

//     if (!splashDone) {
//         return <SplashScreen onFinish={() => setSplashDone(true)} />
//     }
//     return (
//         <Stack.Navigator screenOptions={{ headerShown: false }}>
//             <Stack.Screen name="onboarding" component={OnBoardingScreen} />
//             <Stack.Screen name="signup" component={SignupScreen} />
//             <Stack.Screen name="signin" component={SignInScreen} />
//             <Stack.Screen name="profileedit" component={ProfileEditScreen} />
//             <Stack.Screen name="notification" component={NotificationScreen} />
//             <Stack.Screen name="accountsettings" component={AccountSettingsScreen} />
//             <Stack.Screen name="privacypolicy" component={PrivacyPolicyScreen} />
//             <Stack.Screen name="help" component={HelpScreen} />
//             <Stack.Screen name="preference" component={StylePreferenceScreen} />
//             <Stack.Screen name="combine" component={CombineScreen} />
//             <Stack.Screen name="preview" component={PreviewScreen} />
//             <Stack.Screen name="saveSuccess" component={SaveSuccessScreen} />
//             <Stack.Screen name="bottombar" component={BottomBar} />
//         </Stack.Navigator>
//     )
// }



import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../Screens/splash/Splashscreen';

// Auth Screens
import OnBoardingScreen     from '../Screens/Onbording/OnBordingScreen';
import SignupScreen          from '../Screens/signup/SignupScreen';
import SignInScreen          from '../Screens/signin/SignInScreen';
import ForgotPasswordScreen  from '../Screens/signin/ForgotPasswordScreen';

// App Screens
import BottomBar             from './BottomBar';
import ProfileEditScreen     from '../Screens/profile/Profileeditscreen';
import StylePreferenceScreen from '../Screens/profile/StylePreferenceScreen';
import CombineScreen         from '../Screens/combin/Combinescreen';
import SaveSuccessScreen     from '../Screens/combin/SaveSuccessScreen';
import PreviewScreen         from '../Screens/combin/PreviewScreen';
import NotificationScreen    from '../settings/NotificationScreen';
import AccountSettingsScreen from '../settings/AccountSettingsScreen';
import PrivacyPolicyScreen   from '../settings/PrivacyPolicyScreen';
import HelpScreen            from '../settings/HelpScreen';
import ChangePasswordScreen from '../Screens/profile/Changepassword/ChangePasswordScreen';
import AIChatScreen from '../Screens/AIChatScreen/AIChatScreen';
import FavoriteLooksScreen from '../Screens/FavoriteLooksScreen/FavoriteLooksScreen';
import AdditemScreen from '../Screens/addItem/AdditemScreen';

import AllitemsScreen from '../Screens/AllItems/Allitems';
import Recentitems from '../Screens/Recentitems/Recentitems';


const Stack = createNativeStackNavigator();

// Logged out — first-time users see onboarding, returning users see sign-in
const AuthStack = ({ hasAccount }: { hasAccount: boolean }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}
    initialRouteName={hasAccount ? 'signin' : 'onboarding'}
  >
    <Stack.Screen name="onboarding" component={OnBoardingScreen} />
    <Stack.Screen name="signup"  component={SignupScreen} />
    <Stack.Screen name="signin"  component={SignInScreen} />
    <Stack.Screen name="forgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

//  Logged in → Home first
const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="bottombar"       component={BottomBar} />
    <Stack.Screen name="profileedit"     component={ProfileEditScreen} />
    <Stack.Screen name="ChangePassword"     component={ChangePasswordScreen} />
    <Stack.Screen name="AIChatScreen"     component={AIChatScreen} />
    <Stack.Screen name="preference"      component={StylePreferenceScreen} />
    <Stack.Screen name="combine"         component={CombineScreen} />
    <Stack.Screen name="preview"         component={PreviewScreen} />
    <Stack.Screen name="saveSuccess"     component={SaveSuccessScreen} />
    <Stack.Screen name="notification"    component={NotificationScreen} />
    <Stack.Screen name="accountsettings" component={AccountSettingsScreen} />
    <Stack.Screen name="privacypolicy"   component={PrivacyPolicyScreen} />
    <Stack.Screen name="help"            component={HelpScreen} />
    <Stack.Screen name="FavoriteLooksScreen"component={FavoriteLooksScreen} />
    <Stack.Screen name="Recentitems"component={Recentitems} />
    <Stack.Screen name="outfits"component={AllitemsScreen} />
    <Stack.Screen name="Add"component={AdditemScreen} />

  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user, loading, hasAccount } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  // Keep showing splash screen until minimum time elapsed (3s) OR user context finished loading
  if (!splashDone || loading) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  return user ? <AppStack /> : <AuthStack hasAccount={hasAccount} />;
};

export default RootNavigator;