import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Linking, Platform } from 'react-native';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import HomeScreen from './MenuScreens/HomeScreen';
import AprenderScreen from './MenuScreens/AprenderScreen';
import PerfilScreen from './MenuScreens/PerfilScreen';
import MaisScreen from './MenuScreens/MaisScreen';
import ModalidadesScreen from './JogarScreens/Modalidades';
import EmailVerifiedScreen from './screens/EmailVerifiedScreen';
import { RootStackParamList } from './types';
import { AuthProvider } from './funcoes/AuthContext';
import GameScreen from './JogarScreens/GameScreen';
import FriendSelectionScreen from './JogarScreens/FriendSelectionScreen';
import ResultsScreen from './JogarScreens/ResultsScreen';
import Perfil2Screen from './MenuScreens/Perfil2Screen';
import StatsScreen from './MenuScreens/StatsScreen';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    const handleDeepLink = (url: string | null) => {
      if (!url) return;

      console.log('Deep link recebido:', url);

      if (url.includes('/reset-password') || url.includes('token=')) {
        const token = url.split('token=')[1];
        if (token && navigationRef.current) {
          console.log('Navegando para ResetPassword com token:', token);
          navigationRef.current.navigate('ResetPassword', { token });
        }
      }

      if (url.includes('emailverified')) {
        if (navigationRef.current) {
          navigationRef.current.navigate('EmailVerifiedScreen');
        }
      }
    };

    Linking.getInitialURL()
      .then(url => {
        console.log('Initial URL:', url);
        handleDeepLink(url);
      })
      .catch(err => console.error('Erro ao obter initial URL:', err));

    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('URL recebida com app aberto:', url);
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer 
        ref={navigationRef}
        linking={{
          prefixes: [
            'http://localhost:8081',
            'kinisiapp://',
            Platform.OS === 'android' ? 'http://localhost:8081' : 'kinisiapp://'
          ],
          config: {
            screens: {
              ResetPassword: {
                path: 'auth/reset-password',
                parse: {
                  token: (token: string) => token,
                },
              },
              EmailVerified: 'emailverified',
            },
          },
        }}
      >
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          {/* Telas de Autenticação */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="EmailVerified" component={EmailVerifiedScreen} />

          {/* Telas Principais */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Aprender" component={AprenderScreen} />
          <Stack.Screen name="Perfil" component={PerfilScreen} />
          <Stack.Screen name="Amigos" component={Perfil2Screen} />
          <Stack.Screen name="Mais" component={MaisScreen} />
          <Stack.Screen name="Modalidades" component={ModalidadesScreen} />
          <Stack.Screen name="GameScreen" component={GameScreen} />
          <Stack.Screen name="FriendSelection" component={FriendSelectionScreen} />
          <Stack.Screen name="ResultsScreen" component={ResultsScreen} />
          <Stack.Screen name="Stats" component={StatsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;