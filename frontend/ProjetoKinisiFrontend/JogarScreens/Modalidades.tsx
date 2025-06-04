import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image
} from 'react-native';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Modalidades'>;
};

const ModalidadesScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedMode, setSelectedMode] = useState<'infinito' | 'amigos'>('infinito');
  const [selectedTime, setSelectedTime] = useState<number>(10);
  const [selectedTopics, setSelectedTopics] = useState<{[key: string]: boolean}>({
    'Movimento uniforme': false,
    'Movimento uniformemente variado': false,
    'Energia e Trabalho': false,
    'Leis de Newton': false,
    'Calorimetria': false
  });

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const startGame = () => {
    const topics = Object.keys(selectedTopics).filter(topic => selectedTopics[topic]);
    if (topics.length === 0) {
      alert('Selecione pelo menos um tópico para jogar');
      return;
    }

    if (selectedMode === 'infinito') {
      navigation.navigate('GameScreen', {
        mode: 'infinito',
        timePerQuestion: selectedTime,
        topics
      });
    } else {
      navigation.navigate('FriendSelection');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>MODOS</Text>
        
        {/* Modo Infinito */}
        <TouchableOpacity 
          style={[
            styles.modeButton, 
            selectedMode === 'infinito' && styles.selectedMode
          ]}
          onPress={() => setSelectedMode('infinito')}
        >
          <Text style={styles.modeText}>KINISI</Text>
          <Text style={styles.modeSubText}>Infinito</Text>
        </TouchableOpacity>

        {/* Modo Contra Amigos */}
        <TouchableOpacity 
          style={[
            styles.modeButton, 
            selectedMode === 'amigos' && styles.selectedMode
          ]}
          onPress={() => setSelectedMode('amigos')}
        >
          <Text style={styles.modeText}>Contra amigos</Text>
        </TouchableOpacity>

        {/* Configurações do Modo Infinito */}
        {selectedMode === 'infinito' && (
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Tempo por questão</Text>
            <View style={styles.timeOptions}>
              {[5, 10, 15, 20].map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    selectedTime === time && styles.selectedTime
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={styles.timeText}>{time}min</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Assuntos</Text>
            <View style={styles.topicsContainer}>
              {Object.keys(selectedTopics).map(topic => (
                <TouchableOpacity
                  key={topic}
                  style={[
                    styles.topicButton,
                    selectedTopics[topic] && styles.selectedTopic
                  ]}
                  onPress={() => toggleTopic(topic)}
                >
                  <Text style={styles.topicText}>{topic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Configurações do Modo Contra Amigos */}
        {selectedMode === 'amigos' && (
          <View style={styles.friendModeContainer}>
            <View style={styles.playerContainer}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/80' }} 
                style={styles.avatar}
              />
              <Text style={styles.playerName}>Você</Text>
              <Text style={styles.versionTag}>V5</Text>
            </View>

            <View style={styles.vsTextContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <TouchableOpacity 
              style={styles.friendSelector}
              onPress={() => navigation.navigate('FriendSelection')}
            >
              <Image 
                source={{ uri: 'https://via.placeholder.com/80' }} 
                style={styles.avatar}
              />
              <Text style={styles.playerName}>Selecione um amigo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botão Iniciar */}
        <TouchableOpacity 
          style={styles.startButton}
          onPress={startGame}
        >
          <Text style={styles.startButtonText}>INICIAR</Text>
        </TouchableOpacity>
      </ScrollView>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  modeButton: {
    backgroundColor: '#2c2c2c',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedMode: {
    backgroundColor: '#1f51ff',
  },
  modeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modeSubText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  settingsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  timeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  timeButton: {
    backgroundColor: '#2c2c2c',
    padding: 10,
    borderRadius: 5,
    width: '22%',
    alignItems: 'center',
  },
  selectedTime: {
    backgroundColor: '#1f51ff',
  },
  timeText: {
    color: 'white',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicButton: {
    backgroundColor: '#2c2c2c',
    padding: 15,
    borderRadius: 5,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedTopic: {
    backgroundColor: '#1f51ff',
  },
  topicText: {
    color: 'white',
    textAlign: 'center',
  },
  friendModeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  playerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  playerName: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  versionTag: {
    color: '#1f51ff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  vsTextContainer: {
    backgroundColor: '#2c2c2c',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  vsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendSelector: {
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#1f51ff',
    borderRadius: 10,
    width: '100%',
  },
  startButton: {
    backgroundColor: '#1f51ff',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 30,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ModalidadesScreen;