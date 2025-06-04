import React, { useState, useEffect } from 'react'; // Importa React e hooks para estado e efeitos colaterais
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
} from 'react-native'; // Importa componentes do React Native
import TopBar from '../componentes/TopBar'; // Importa o componente de barra superior
import DownBar from '../componentes/DownBar'; // Importa o componente de barra inferior
import api from '../api'; // Importa a instância de API para requisições HTTP
import { useAuth } from '../funcoes/AuthContext'; // Importa contexto de autenticação

// Define a interface para o usuário
interface User {
  _id: string;
  name: string;
  profileImage?: string;
}

// Define a interface para solicitações de amizade
interface FriendRequest {
  userId: string | User;
  date: Date;
}

// Define a interface para amigos
interface Friend {
  userId: string | User;
  status: 'pending' | 'accepted';
  date: Date;
}

// Componente principal da tela de perfil
const PerfilScreen = () => {
  const { user, isAuthenticated } = useAuth(); // Obtém usuário autenticado e status de autenticação
  const [searchQuery, setSearchQuery] = useState<string>(''); // Estado para consulta de busca
  const [searchResults, setSearchResults] = useState<User[]>([]); // Estado para resultados da busca
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]); // Estado para solicitações de amizade
  const [friends, setFriends] = useState<Friend[]>([]); // Estado para lista de amigos
  const [loading, setLoading] = useState<boolean>(false); // Estado para loading

  // Efeito para carregar dados de amizade quando o usuário muda
  useEffect(() => {
    if (user?._id) {
      loadFriendData();
    }
  }, [user?._id]);

  // Função para carregar amigos e solicitações pendentes
  const loadFriendData = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true); // Ativa loading
      const response = await api.get(`/list/${user._id}`); // Busca dados do backend
      
      // Normaliza os dados dos amigos
      const normalizedFriends = response.data.friends.map((friend: any) => ({
        ...friend,
        userId: typeof friend.userId === 'string' ? 
          { _id: friend.userId, name: 'Usuário' } : friend.userId
      }));
      
      // Normaliza os dados das solicitações
      const normalizedRequests = response.data.pendingRequests.map((request: any) => ({
        ...request,
        userId: typeof request.userId === 'string' ? 
          { _id: request.userId, name: 'Usuário' } : request.userId
      }));

      setFriendRequests(normalizedRequests); // Atualiza estado das solicitações
      setFriends(normalizedFriends); // Atualiza estado dos amigos
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao carregar amigos'); // Mostra erro
    } finally {
      setLoading(false); // Desativa loading
    }
  };

  // Função para buscar usuários pelo ID
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Atenção', 'Por favor, digite um ID para buscar');
      return;
    }

    try {
      setLoading(true);
      setSearchResults([]);
      
      const response = await api.get(`/search?id=${searchQuery}`); // Busca usuários
      
      if (response.data.length === 0) {
        Alert.alert('Nenhum resultado', `Não encontramos usuários com o ID "${searchQuery}"`);
        return;
      }

      setSearchResults(response.data); // Atualiza resultados da busca
    } catch (error: any) {
      Alert.alert('Erro na busca', error.response?.data?.error || 'Falha na busca de usuários');
    } finally {
      setLoading(false);
    }
  };

  // Função para enviar solicitação de amizade
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
      
      const response = await api.post('/send-request', requestData); // Envia solicitação
      
      Alert.alert('Sucesso', response.data.message || 'Solicitação enviada com sucesso!');
      setSearchQuery('');
      setSearchResults([]);
      await loadFriendData(); // Atualiza dados após envio
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

  // Função para aceitar solicitação de amizade
  const acceptFriendRequest = async (requestId: string) => {
    if (!isAuthenticated || !user?._id) return;
    
    try {
      setLoading(true);
      const response = await api.post('/accept-request', {
        userId: user._id,
        requestId
      });
      await loadFriendData();
      Alert.alert('Sucesso', response.data.message || 'Agora vocês são amigos!');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Falha ao aceitar solicitação');
    } finally {
      setLoading(false);
    }
  };

  // Função para recusar solicitação de amizade
  const rejectFriendRequest = async (requestId: string) => {
    if (!isAuthenticated || !user?._id) return;
    
    try {
      setLoading(true);
      await api.post('/reject-request', {
        userId: user._id,
        requestId
      });
      await loadFriendData();
      Alert.alert('Sucesso', 'Solicitação recusada');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Falha ao recusar solicitação');
    } finally {
      setLoading(false);
    }
  };

  // Renderiza um resultado da busca de usuário
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

  // Renderiza uma solicitação de amizade pendente
  const renderFriendRequest: ListRenderItem<FriendRequest> = ({ item }) => {
    const requestUser = typeof item.userId === 'string' ? 
      { _id: item.userId, name: 'Usuário' } : item.userId;
    
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
            onPress={() => acceptFriendRequest(requestUser._id)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Aceitar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => rejectFriendRequest(requestUser._id)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Recusar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Renderiza um amigo aceito
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

  // Renderização principal da tela
  return (
    <View style={styles.container}>
      <TopBar /> {/* Barra superior */}
      <View style={styles.content}>
        <Text style={styles.title}>Gerenciar Amizades</Text>

        {/* Campo de busca */}
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

        {/* Loader global */}
        {loading && <ActivityIndicator size="large" style={styles.loader} color="#fff" />}

        {/* Resultados da busca */}
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

        {/* Solicitações pendentes */}
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

        {/* Lista de amigos */}
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
      <DownBar /> {/* Barra inferior */}
    </View>
  );
};

// Estilos da tela
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

export default PerfilScreen; // Exporta o componente principal
