import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Alert,
  ActivityIndicator,
  ListRenderItem,
  Image
} from 'react-native';
import TopBar from '../componentes/TopBar';
import DownBar from '../componentes/DownBar';
import api from '../api';
import { useAuth } from '../funcoes/AuthContext';
import { Friend, FriendRequest, User } from '../types';

const PerfilScreen = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user?._id) {
      loadFriendData();
    }
  }, [user?._id]);

  const loadFriendData = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/friends/list/${user._id}`);
      
      const normalizedFriends = response.data.friends.map((friend: any) => ({
        ...friend,
        userId: typeof friend.userId === 'string' ? 
          { _id: friend.userId, name: 'Usuário' } : friend.userId
      }));
      
      const normalizedRequests = response.data.pendingRequests.map((request: any) => ({
        ...request,
        userId: typeof request.userId === 'string' ? 
          { _id: request.userId, name: 'Usuário' } : request.userId
      }));

      setFriendRequests(normalizedRequests);
      setFriends(normalizedFriends);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao carregar amigos');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Atenção', 'Por favor, digite um ID para buscar');
      return;
    }

    try {
      setLoading(true);
      setSearchResults([]);
      
      const response = await api.get(`/friends/search?id=${searchQuery}`);
      
      if (response.data.length === 0) {
        Alert.alert('Nenhum resultado', `Não encontramos usuários com o ID "${searchQuery}"`);
        return;
      }

      setSearchResults(response.data);
    } catch (error: any) {
      Alert.alert('Erro na busca', error.response?.data?.error || 'Falha na busca de usuários');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    if (!isAuthenticated || !user?._id) {
      Alert.alert('Erro', 'Você precisa estar logado para adicionar amigos');
      return;
    }

    if (userId === user._id) {
      Alert.alert('Ops!', 'Você não pode adicionar a si mesmo');
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        senderId: user._id,
        recipientId: userId
      };
      // Adiciona log para depuração
      console.log('Enviando solicitação de amizade:', requestData);

      const response = await api.post('/friends/send-request', requestData);
      
      Alert.alert('Sucesso', response.data.message || 'Solicitação enviada com sucesso!');
      setSearchQuery('');
      setSearchResults([]);
      await loadFriendData();
    } catch (error: any) {
      let errorMessage = 'Falha ao enviar solicitação';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    if (!isAuthenticated || !user?._id) return;
    try {
      setLoading(true);
      // O requestId aqui deve ser o FriendRequest._id
      const response = await api.post('/friends/accept-request', {
        userId: user._id,
        requestId: requestId
      });
      await loadFriendData();
      Alert.alert('Sucesso', response.data.message || 'Agora vocês são amigos!');
    } catch (error: any) {
      Alert.alert(
        'Erro', 
        error.response?.data?.error || 
        error.message || 
        'Falha ao aceitar solicitação'
      );
    } finally {
      setLoading(false);
    }
  };

  const rejectFriendRequest = async (requesterUserId: string) => {
    if (!isAuthenticated || !user?._id) return;
    
    try {
      setLoading(true);
      await api.post('/friends/reject-request', {
        userId: user._id,
        requestId: requesterUserId
      });
      await loadFriendData();
      Alert.alert('Sucesso', 'Solicitação recusada');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Falha ao recusar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const renderSearchResult: ListRenderItem<User> = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfoContainer}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profileInitial}>
              {item.name ? item.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <View style={styles.userDetails}>
          <Text style={styles.whiteText}>{item.name}</Text>
          <Text style={styles.userIdText}>ID: {item._id}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => sendFriendRequest(item._id)}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Adicionar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFriendRequest: ListRenderItem<FriendRequest> = ({ item }) => {
    // Garante que requestUser é sempre um objeto com _id e name
    const requestUser = typeof item.userId === 'string'
      ? { _id: item.userId, name: 'Usuário' }
      : item.userId;

    // O ID da solicitação é o _id do objeto FriendRequest
    const requestId = item._id;

    return (
      <View style={styles.requestItem}>
        <View style={styles.userInfoContainer}>
          {requestUser.profileImage ? (
            <Image source={{ uri: requestUser.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {requestUser.name ? requestUser.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <Text style={styles.whiteText}>{requestUser.name} quer ser seu amigo</Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => {
              if (!requestId) {
                Alert.alert('Erro', 'ID da solicitação não encontrado');
                return;
              }
              acceptFriendRequest(requestId);
            }}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Aceitar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => {
              if (!requestId) {
                Alert.alert('Erro', 'ID da solicitação não encontrado');
                return;
              }
              rejectFriendRequest(requestId);
            }}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Recusar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFriend: ListRenderItem<Friend> = ({ item }) => {
    const friendUser = typeof item.userId === 'string' ? 
      { _id: item.userId, name: 'Amigo' } : item.userId;
    
    return (
      <View style={styles.friendItem}>
        <View style={styles.userInfoContainer}>
          {friendUser.profileImage ? (
            <Image source={{ uri: friendUser.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {friendUser.name ? friendUser.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.whiteText}>{friendUser.name}</Text>
            <Text style={styles.userIdText}>ID: {friendUser._id}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.content}>
        <Text style={styles.title}>Gerenciar Amizades</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por ID"
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={[
              styles.searchButton, 
              (!searchQuery.trim() || loading) && styles.searchButtonDisabled
            ]} 
            onPress={searchUsers}
            disabled={!searchQuery.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" style={styles.loader} color="#fff" />}

        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resultados da Busca</Text>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item._id}
              renderItem={renderSearchResult}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solicitações Pendentes</Text>
          {friendRequests.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma solicitação pendente</Text>
          ) : (
            <FlatList
              data={friendRequests}
              keyExtractor={(item) => typeof item.userId === 'string' ? item.userId : item.userId._id}
              renderItem={renderFriendRequest}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seus Amigos</Text>
          {friends.length === 0 ? (
            <Text style={styles.emptyText}>Você ainda não tem amigos</Text>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={(item) => typeof item.userId === 'string' ? item.userId : item.userId._id}
              renderItem={renderFriend}
            />
          )}
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#333',
    color: 'white',
  },
  searchButton: {
    backgroundColor: '#1f51ff',
    paddingHorizontal: 15,
    borderRadius: 5,
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#555',
  },
  loader: {
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 10,
  },
  requestItem: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 10,
  },
  friendItem: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 10,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f51ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileInitial: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#1f51ff',
    padding: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  whiteText: {
    color: 'white',
  },
  emptyText: {
    textAlign: 'center',
    color: 'white',
    marginTop: 10,
  },
  userIdText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
});

export default PerfilScreen;