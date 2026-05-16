// import React from 'react'
// import { NavigationContainer } from '@react-navigation/native'
// import RootNavigator from './src/navigation/RootNavigator'

// const App = () => {
//   return (
//     <NavigationContainer>
//       <RootNavigator />
//     </NavigationContainer>
//   )
// }

// export default App




import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AlertProvider, AuthProvider } from './src/context';
import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  return (
    <AlertProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </AlertProvider>
  );
};

export default App;
