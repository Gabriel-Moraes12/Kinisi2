import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ActivityIndicator, 
  Image, 
  Pressable, 
  Dimensions,
  Alert,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import api from '../api';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('E-mail inválido', 'Por favor, insira um e-mail válido.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      Alert.alert(
        'Verificação necessária',
        `Um e-mail de confirmação foi enviado para:\n\n${email}\n\nPor favor, verifique sua caixa de entrada e clique no link para ativar sua conta.`,
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Login') 
          }
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao cadastrar. Tente novamente.';
      Alert.alert('Erro no cadastro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('./logo.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#b3b3b3"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#b3b3b3"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          placeholderTextColor="#b3b3b3"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <MaterialIcons 
            name={showPassword ? 'visibility' : 'visibility-off'} 
            size={24} 
            color="#b3b3b3" 
          />
        </TouchableOpacity>
      </View>
      
      <Pressable 
        style={styles.registerButton} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.registerButtonText}>REGISTRAR</Text>
        )}
      </Pressable>
      
      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>
          Já tem uma conta? <Text style={styles.loginLinkBold}>Faça login</Text>
        </Text>
      </Pressable>
    </View>
  );
};

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    padding: 20,
  },
  logo: {
    width: '100%',
    height: windowHeight * 0.3,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#364045',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#364045',
    borderRadius: 25,
    paddingHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 10,
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#1f51ff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    color: '#b3b3b3',
    textAlign: 'center',
  },
  loginLinkBold: {
    fontWeight: 'bold',
    color: '#1f51ff',
  },
});

export default RegisterScreen;