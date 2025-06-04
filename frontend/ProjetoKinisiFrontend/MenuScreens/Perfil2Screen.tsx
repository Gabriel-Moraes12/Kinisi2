import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../funcoes/AuthContext';
import api from '../api';
import DownBar from '../componentes/DownBar';
import TopBar from '../componentes/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Perfil2Screen = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());

  const getUserImageKey = (userId: string) => `userProfileImage_${userId}`;

  useEffect(() => {
    if (user) {
      setName(user.name);
      loadSavedImage();
    }
  }, [user]);

  const loadSavedImage = async () => {
    if (!user?._id) return;
    
    try {
      const userImageKey = getUserImageKey(user._id);
      const savedImage = await AsyncStorage.getItem(userImageKey);
      
      if (savedImage) {
        setImage(savedImage);
      } else if (user?.profileImage) {
        setImage(user.profileImage);
        await AsyncStorage.setItem(userImageKey, user.profileImage);
      }
      setImageKey(Date.now());
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      Alert.alert('Erro', 'Não foi possível carregar a foto de perfil');
    }
  };

  const pickImage = async () => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const formData = new FormData();
      const filename = `profile-${Date.now()}${uri.endsWith('.png') ? '.png' : '.jpg'}`;
      
      formData.append('file', {
        uri,
        name: filename,
        type: uri.endsWith('.png') ? 'image/png' : 'image/jpeg',
      } as any);
      
      formData.append('userId', user._id);

      const response = await api.put('/users/upload-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.profileImage) {
        const newImageUrl = response.data.profileImage;
        const userImageKey = getUserImageKey(user._id);
        
        await AsyncStorage.setItem(userImageKey, newImageUrl);
        
        setImage(newImageUrl);
        setImageKey(Date.now());
        
        if (updateUser) {
          await updateUser({ 
            ...user, 
            profileImage: newImageUrl 
          });
        }
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      }
    } catch (error: any) {
      console.error('Erro no upload:', {
        error: error.response?.data || error.message,
        userId: user?._id
      });
      Alert.alert(
        'Erro', 
        error.response?.data?.error || 'Falha ao atualizar a foto'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user?._id || !name.trim()) return;
    
    try {
      setUpdating(true);
      const response = await api.put(`/users/${user._id}`, { name });
      
      if (response.data.name) {
        if (updateUser) {
          await updateUser({ ...user, name: response.data.name });
        }
        Alert.alert('Sucesso', 'Perfil atualizado!');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', {
        error: error.response?.data || error.message,
        userId: user?._id
      });
      Alert.alert('Erro', 'Não foi possível atualizar o nome');
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = async () => {
    if (user?._id) {
      try {
        await Clipboard.setStringAsync(user._id);
        Alert.alert('ID Copiado', 'O ID foi copiado para a área de transferência');
      } catch (error) {
        console.error('Erro ao copiar ID:', error);
        Alert.alert('Erro', 'Não foi possível copiar o ID');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TopBar />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Meu Perfil</Text>

        <TouchableOpacity onPress={pickImage} disabled={loading || updating}>
          <View style={styles.profileImageContainer}>
            {image ? (
              <Image 
                key={`profile-img-${imageKey}`}
                source={{ 
                  uri: `${image}?v=${imageKey}`,
                  cache: 'reload'
                }}
                style={[styles.profileImage, { backgroundColor: '#2c2c2c' }]}
                onError={() => {
                  console.log('Falha ao carregar imagem');
                  setImage(null);
                }}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'Foto'}
                </Text>
              </View>
            )}
            {(loading || updating) && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome de usuário</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Digite seu nome"
            placeholderTextColor="#aaa"
            editable={!updating}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Seu ID</Text>
          <View style={styles.idContainer}>
            <Text style={styles.idText}>{user?._id || 'Carregando...'}</Text>
            <TouchableOpacity 
              onPress={copyToClipboard} 
              style={styles.copyButton}
              disabled={updating}
            >
              <Text style={styles.copyButtonText}>Copiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.saveButton,
            (!name.trim() || updating) && styles.saveButtonDisabled
          ]} 
          onPress={updateProfile}
          disabled={updating || !name.trim()}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    flexGrow: 1,
    padding: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  profileImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#1f51ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: 'white',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
  },
  idText: {
    color: 'white',
    flex: 1,
    fontSize: 14,
  },
  copyButton: {
    backgroundColor: '#1f51ff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#1f51ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#555',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Perfil2Screen;