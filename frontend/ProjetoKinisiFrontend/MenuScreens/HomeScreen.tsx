import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import TopBar from '../componentes/TopBar';
import DownBar from '../componentes/DownBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../funcoes/AuthContext';
import api from '../api';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [currentFact, setCurrentFact] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const [dailyStats, setDailyStats] = useState<{ total: number; correct: number; wrong: number }>({ total: 0, correct: 0, wrong: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Novo estado para amigos
  const [friends, setFriends] = useState<{ _id: string; name: string; profileImage?: string }[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  useEffect(() => {
    const checkAndUpdateFact = async () => {
      try {
        setIsLoading(true);
        const savedFact = await AsyncStorage.getItem('currentFact');
        const savedDate = await AsyncStorage.getItem('lastUpdateDate');
        const today = new Date();
        const lastUpdateDate = savedDate ? new Date(savedDate) : null;

        if (!lastUpdateDate || (today.getTime() - lastUpdateDate.getTime()) >= 24 * 60 * 60 * 1000) {
          await fetchNewFact();
        } else if (savedFact) {
          setCurrentFact(savedFact);
        }
      } catch (error) {
        console.error('Erro ao verificar fato:', error);
        handleError("Erro ao carregar curiosidade");
      } finally {
        setIsLoading(false);
      }
    };

    checkAndUpdateFact();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?._id) return;
      try {
        setStatsLoading(true);
        const response = await api.get(`/users/stats/${user._id}`);
        setDailyStats(response.data.dailyStats || { total: 0, correct: 0, wrong: 0 });
      } catch (e) {
        setDailyStats({ total: 0, correct: 0, wrong: 0 });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [user?._id]);

  // Carregar amigos aceitos
  useEffect(() => {
    const loadFriends = async () => {
      if (!user?._id) {
        setFriends([]);
        setFriendsLoading(false);
        return;
      }
      try {
        setFriendsLoading(true);
        const response = await api.get(`/friends/list/${user._id}`);
        const acceptedFriends = response.data.friends
          .filter((f: any) => f.status === 'accepted')
          .map((f: any) => {
            const u = typeof f.userId === 'object' ? f.userId : { _id: f.userId, name: 'Amigo' };
            return {
              _id: u._id,
              name: u.name,
              profileImage: u.profileImage
            };
          });
        setFriends(acceptedFriends);
      } catch (e) {
        setFriends([]);
      } finally {
        setFriendsLoading(false);
      }
    };
    loadFriends();
  }, [user?._id]);

  const fetchNewFact = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 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`,
          'HTTP-Referer': 'https://projetokinisi.com',
          'X-Title': 'ProjetoKinisi'
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Você é um assistente especializado em física. Forneça curiosidades interessantes e precisas sobre física."
            },
            {
              role: "user",
              content: "Por favor, me forneça uma curiosidade interessante sobre física. A resposta deve começar com 'Você sabia que' e ter no máximo 2 frases. Seja criativo e evite repetir curiosidades já enviadas anteriormente."
            }
          ],
          max_tokens: 100,
          temperature: 0.7,
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Erro na API");
      }

      const newFact = data.choices[0]?.message?.content;
      
      if (!newFact) {
        throw new Error("Resposta vazia da API");
      }
      
      setCurrentFact(newFact);
      await AsyncStorage.setItem('currentFact', newFact);
      await AsyncStorage.setItem('lastUpdateDate', new Date().toString());
      setRetryCount(0); // Resetar contador de tentativas
      
    } catch (error) {
      console.error('Erro ao buscar fato:', error);
      handleError("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (message: string) => {
    if (retryCount < 2) { // Tentar até 3 vezes (0, 1, 2)
      setRetryCount(retryCount + 1);
      setTimeout(fetchNewFact, 2000); // Tentar novamente após 2 segundos
      setError(`${message}... Tentando novamente (${retryCount + 1}/3)`);
    } else {
      setError(`${message}. Toque para tentar novamente`);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchNewFact();
  };

  return (
    <View style={styles.mainContainer}>
      <TopBar />
      
      <View style={styles.factContainer}>
        <Text style={styles.factTitle}>VOCÊ SABIA?</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4a90e2" />
        ) : error ? (
          <TouchableOpacity onPress={handleRetry}>
            <Text style={styles.errorText}>{error}</Text>
          </TouchableOpacity>
        ) : currentFact ? (
          <Text style={styles.factText}>{currentFact}</Text>
        ) : (
          <Text style={styles.factText}>Carregando curiosidade...</Text>
        )}
      </View>

      {/* Estatísticas de Hoje */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Estatísticas de Hoje</Text>
        {statsLoading ? (
          <ActivityIndicator size="small" color="#4a90e2" />
        ) : (
          <>
            <Text style={styles.statsSubtitle}>
              Questões feitas hoje: {dailyStats.total}
            </Text>
            <View style={styles.statsBarRow}>
              <Text style={styles.statsCorrect}>ACERTOS: {dailyStats.correct}</Text>
              <Text style={styles.statsWrong}>ERROS: {dailyStats.wrong}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressGreen,
                  { flex: dailyStats.correct, }
                ]}
              />
              <View
                style={[
                  styles.progressRed,
                  { flex: dailyStats.wrong, }
                ]}
              />
              {/* Se não houver questões, barra fica vazia */}
              {dailyStats.total === 0 && <View style={{ flex: 1 }} />}
            </View>
          </>
        )}
      </View>

      {/* Lista de amigos adicionados */}
      <View style={styles.friendsSection}>
        <Text style={styles.friendsTitle}>Seus Amigos</Text>
        {friendsLoading ? (
          <ActivityIndicator size="small" color="#4a90e2" />
        ) : friends.length === 0 ? (
          <Text style={styles.noFriendsText}>Você ainda não adicionou amigos</Text>
        ) : (
          <View>
            {friends.map(friend => (
              <View key={friend._id} style={styles.friendItem}>
                {friend.profileImage ? (
                  <Image source={{ uri: friend.profileImage }} style={styles.friendAvatar} />
                ) : (
                  <View style={styles.friendAvatarPlaceholder}>
                    <Text style={styles.friendAvatarInitial}>
                      {friend.name ? friend.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendId}>ID: {friend._id}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.emptySpace} />
      
      <DownBar />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  factContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  factTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  factText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 10,
  },
  statsContainer: {
    backgroundColor: '#232323',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    padding: 16,
    alignItems: 'center',
  },
  statsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statsSubtitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  statsBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  statsCorrect: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsWrong: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressBar: {
    flexDirection: 'row',
    height: 14,
    width: '100%',
    backgroundColor: '#444',
    borderRadius: 7,
    overflow: 'hidden',
    marginTop: 2,
    marginBottom: 2,
  },
  progressGreen: {
    backgroundColor: '#4CAF50',
    height: '100%',
  },
  progressRed: {
    backgroundColor: '#F44336',
    height: '100%',
  },
  emptySpace: {
    flex: 1,
  },
  // Amigos
  friendsSection: {
    backgroundColor: '#232323',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    padding: 16,
  },
  friendsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  noFriendsText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    padding: 10,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f51ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarInitial: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendId: {
    color: '#aaa',
    fontSize: 12,
  },
});

export default HomeScreen;