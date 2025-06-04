import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useAuth } from '../funcoes/AuthContext';
import api from '../api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

type StatsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Stats'>;

interface StatsData {
  dailyStats: {
    total: number;
    correct: number;
    wrong: number;
  };
  totalQuestions: number;
  topics: Array<{
    name: string;
    total: number;
    correct: number;
    wrong: number;
    accuracyPercentage: number;
  }>;
  overallAccuracy: number;
}

const StatsScreen = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?._id) {
          const response = await api.get(`/users/stats/${user._id}`);
          setStats(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?._id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1f51ff" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Não foi possível carregar as estatísticas</Text>
      </View>
    );
  }

  // Tópicos ordenados por porcentagem de acerto
  const sortedTopics = [...stats.topics].sort((a, b) => b.accuracyPercentage - a.accuracyPercentage);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        {user?.profileImage && (
          <Image 
            source={{ uri: user.profileImage }} 
            style={styles.profileImage}
          />
        )}
        <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
      </View>

      {/* Cartões de estatísticas */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Text style={styles.statNumber}>{stats.totalQuestions}</Text>
          <Text style={styles.statLabel}>Total de Questões</Text>
        </View>
        
        <View style={[styles.statCard, styles.successCard]}>
          <Text style={styles.statNumber}>{stats.dailyStats.correct}</Text>
          <Text style={styles.statLabel}>Acertos Hoje</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.dangerCard]}>
          <Text style={styles.statNumber}>{stats.dailyStats.wrong}</Text>
          <Text style={styles.statLabel}>Erros Hoje</Text>
        </View>
        
        <View style={[styles.statCard, styles.primaryCard]}>
          <Text style={styles.statNumber}>{stats.overallAccuracy}%</Text>
          <Text style={styles.statLabel}>Precisão</Text>
        </View>
      </View>
iouio
      {/* Seção de tópicos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Desempenho por Tópico</Text>
        
        {sortedTopics.map((topic, index) => {
          const correctPercentage = (topic.correct / topic.total) * 100;
          const wrongPercentage = (topic.wrong / topic.total) * 100;

          return (
            <View key={index} style={styles.topicContainer}>
              <View style={styles.topicHeader}>
                <Text style={styles.topicName}>{topic.name}</Text>
                <Text style={styles.topicAccuracy}>{topic.accuracyPercentage}%</Text>
              </View>
              
              {/* Barra de progresso dupla (acertos/erros) */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressCorrect, { width: `${correctPercentage}%` }]} />
                <View style={[styles.progressWrong, { width: `${wrongPercentage}%` }]} />
              </View>
              
              <View style={styles.topicDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.correctIcon}>✔</Text>
                  <Text style={styles.detailText}>{topic.correct} acertos</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.wrongIcon}>✖</Text>
                  <Text style={styles.detailText}>{topic.wrong} erros</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.totalIcon}>📊</Text>
                  <Text style={styles.detailText}>{topic.total} total</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#1f51ff',
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    borderRadius: 12,
    padding: 20,
    width: width * 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryCard: {
    backgroundColor: '#2c2c2c',
    borderWidth: 1,
    borderColor: '#1f51ff',
  },
  successCard: {
    backgroundColor: '#2c2c2c',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  dangerCard: {
    backgroundColor: '#2c2c2c',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  statNumber: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingLeft: 10,
  },
  topicContainer: {
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topicName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  topicAccuracy: {
    color: '#1f51ff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressCorrect: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressWrong: {
    height: '100%',
    backgroundColor: '#F44336',
  },
  topicDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  correctIcon: {
    color: '#4CAF50',
    marginRight: 5,
  },
  wrongIcon: {
    color: '#F44336',
    marginRight: 5,
  },
  totalIcon: {
    color: '#1f51ff',
    marginRight: 5,
  },
  detailText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
});

export default StatsScreen;