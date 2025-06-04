import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useRoute } from '@react-navigation/native';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'EmailVerified'>;
};

type RouteParams = {
  status?: 'success' | 'failed' | 'error';
};

const EmailVerifiedScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute();
  const { status } = route.params as RouteParams || {};

  useEffect(() => {
    if (status === 'success') {
      Alert.alert(
        'Sucesso!', 
        'Seu e-mail foi verificado com sucesso. Agora você pode fazer login normalmente.',
        [{ text: 'OK' }]
      );
    } else if (status === 'failed') {
      Alert.alert(
        'Link inválido', 
        'Este link de verificação é inválido ou expirou. Por favor, solicite um novo e-mail de verificação.',
        [{ text: 'OK' }]
      );
    } else if (status === 'error') {
      Alert.alert(
        'Erro', 
        'Ocorreu um problema ao verificar seu e-mail. Por favor, tente novamente.',
        [{ text: 'OK' }]
      );
    }
  }, [status]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {status === 'success' 
          ? '✅ E-mail Verificado'
          : '❌ Problema na Verificação'}
      </Text>
      
      <Text style={styles.message}>
        {status === 'success'
          ? 'Sua conta foi ativada com sucesso!'
          : 'Não foi possível verificar seu e-mail.'}
      </Text>
      
      <Button
        title="Ir para Login"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default EmailVerifiedScreen;