
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../funcoes/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // false = senha oculta por padrão
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword); // Alterna entre true/false
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
          secureTextEntry={!showPassword} // Invertido para corresponder à lógica correta
        />
        <TouchableOpacity 
          style={styles.eyeIcon}
          onPress={toggleShowPassword}
        >
          <MaterialIcons 
            name={showPassword ? 'visibility' : 'visibility-off'} // Corrigido para mostrar o ícone adequado
            size={24} 
            color="#b3b3b3" 
          />
        </TouchableOpacity>
      </View>

      <Pressable 
        style={styles.forgotPasswordLink}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
      </Pressable>

      <Pressable 
        style={styles.loginButton} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>LOGIN</Text>
        )}
      </Pressable>

      <Pressable 
        style={styles.registerLink} 
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>
          Não tem uma conta? <Text style={styles.registerBold}>Registre-se</Text>
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
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#364045',
    borderRadius: 25,
    paddingHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
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
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#be2525',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#1f51ff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 25,
  },
  registerText: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
  },
  registerBold: {
    color: '#1f51ff',
    fontWeight: 'bold',
  },
});



export default LoginScreen;