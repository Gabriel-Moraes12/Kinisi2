import React from 'react';
import { View, Pressable, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// 1. Definindo o tipo de navegação específico para a DownBar
type DownBarNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home' | 'Aprender' | 'Perfil' | 'Mais' | 'Modalidades'
>;

const DownBar = () => {
  // 2. Usando a tipagem correta para navegação e rota
  const navigation = useNavigation<DownBarNavigationProp>();
  const route = useRoute();

  // 3. Função com tipagem segura para verificar rota ativa
  const isActive = (screenName: keyof RootStackParamList): boolean => {
    return route.name === screenName;
  };

  return (
    <View style={styles.container}>
      {/* Barra escura */}
      <View style={styles.barBackground} />
      
      {/* Botão COMEÇAR */}
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => navigation.navigate('Modalidades')}
      >
        <Text style={styles.startButtonText}>COMEÇAR</Text>
      </TouchableOpacity>

      {/* Container dos ícones */}
      <View style={styles.iconsContainer}>
        {/* Ícone Casa */}
        <Pressable 
          onPress={() => navigation.navigate('Home')}
          style={styles.iconButton}
        >
          <MaterialIcons 
            name="home" 
            size={32} 
            color={isActive('Home') ? '#007AFF' : '#FFFFFF'} 
          />
        </Pressable>

        {/* Ícone Livro */}
        <Pressable 
          onPress={() => navigation.navigate('Aprender')}
          style={styles.iconButton}
        >
          <MaterialIcons 
            name="menu-book" 
            size={32} 
            color={isActive('Aprender') ? '#007AFF' : '#FFFFFF'} 
          />
        </Pressable>

        {/* Ícone Usuário */}
        <Pressable 
          onPress={() => navigation.navigate('Amigos')}
          style={styles.iconButton}
        >
          <MaterialIcons 
            name="person" 
            size={32} 
            color={isActive('Amigos') ? '#007AFF' : '#FFFFFF'} 
          />
        </Pressable>

        {/* Ícone Menu */}
        <Pressable 
          onPress={() => navigation.navigate('Mais')}
          style={styles.iconButton}
        >
          <MaterialIcons 
            name="menu" 
            size={32} 
            color={isActive('Mais') ? '#007AFF' : '#FFFFFF'} 
          />
        </Pressable>
      </View>
    </View>
  );
};

// ... (mantenha os mesmos estilos do seu código original)
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  barBackground: {
    backgroundColor: '#2c2c2c',
    height: 140,
    width: '100%',
  },
  startButton: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    height: 50,
    width:400,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    zIndex: 1,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center'
  },
  iconsContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
  },
  iconButton: {
    alignItems: 'center',
    padding: 10,
  },
});

export default DownBar;