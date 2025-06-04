import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DownBar from '../componentes/DownBar';
import TopBar from '../componentes/TopBar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';

// Definindo o tipo de navegação para esta tela
type MaisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Mais'>;

const MaisScreen = () => {
  const navigation = useNavigation<MaisScreenNavigationProp>();

  return (
    <View style={styles.container}>
      {/* Barra superior importada */}
      <TopBar />
      
      {/* Conteúdo principal com os três botões com ícones */}
      <View style={styles.content}>
        {/* Botão Perfil */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Amigos')}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="person" size={24} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Perfil</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        
        {/* Botão Estatísticas */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Stats')}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="stats-chart" size={24} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Estatísticas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        
        {/* Botão Configurações */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Configuracoes')}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="settings" size={24} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Configurações</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <DownBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2c2c2c',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});

export default MaisScreen;