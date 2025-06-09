import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../funcoes/AuthContext';
import api from '../api';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'FriendSelection'>;
};

interface Friend {
  _id: string;
  name: string;
  profileImage?: string;
}

const FriendSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        if (!user?._id) return;
        
        const response = await api.get(`/friends/list/${user._id}`);
        const acceptedFriends = response.data.friends
          .filter((f: any) => f.status === 'accepted')
          .map((f: any) => {
            // f.userId pode ser um objeto populado
            const u = typeof f.userId === 'object' ? f.userId : { _id: f.userId, name: 'Amigo' };
            return {
              _id: u._id,
              name: u.name,
              profileImage: u.profileImage
            };
          });
        
        setFriends(acceptedFriends);
      } catch (error: any) {
        Alert.alert('Erro', 'Não foi possível carregar a lista de amigos');
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [user?._id]);

  const handleSelectFriend = (friendId: string) => {
    setSelectedFriend(friendId === selectedFriend ? null : friendId);
  };

  const startGameWithFriend = () => {
    if (!selectedFriend) {
      Alert.alert('Atenção', 'Selecione um amigo para jogar');
      return;
    }
    
    const friend = friends.find(f => f._id === selectedFriend);
    if (!friend) return;
    
    navigation.navigate('GameScreen', {
      mode: 'amigos',
      opponentId: selectedFriend,
      opponentName: friend.name
    });
  };

  const renderItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={[
        styles.friendItem,
        selectedFriend === item._id && styles.selectedFriend
      ]}
      onPress={() => handleSelectFriend(item._id)}
    >
      {item.profileImage ? (
        <Image 
          source={{ uri: item.profileImage }} 
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
            {item.name ? item.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
      )}
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendId}>ID: {item._id}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1f51ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione um amigo</Text>
      
      {friends.length === 0 ? (
        <Text style={styles.noFriendsText}>Você não tem amigos adicionados ainda</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}

      <TouchableOpacity 
        style={[
          styles.startButton,
          !selectedFriend && styles.startButtonDisabled
        ]}
        onPress={startGameWithFriend}
        disabled={!selectedFriend}
      >
        <Text style={styles.startButtonText}>CONFIRMAR E INICIAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    padding: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  noFriendsText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedFriend: {
    backgroundColor: '#1f51ff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1f51ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarInitial: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
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
  startButton: {
    backgroundColor: '#1f51ff',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonDisabled: {
    backgroundColor: '#555',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FriendSelectionScreen;
