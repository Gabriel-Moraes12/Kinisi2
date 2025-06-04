import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  Text, 
  TouchableOpacity,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../funcoes/AuthContext';

type RootStackParamList = {
  Perfil: undefined;
  Amigos: undefined;
  // Adicione outras rotas aqui se necessário
};

const TopBar: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(Date.now());

  const getUserImageKey = (userId: string) => `userProfileImage_${userId}`;

  useEffect(() => {
    const loadSavedImage = async () => {
      if (!user?._id) return;

      try {
        const userImageKey = getUserImageKey(user._id);
        const savedImage = await AsyncStorage.getItem(userImageKey);

        if (savedImage) {
          setProfileImage(savedImage);
        } else if (user?.profileImage) {
          setProfileImage(user.profileImage);
          await AsyncStorage.setItem(userImageKey, user.profileImage);
        }
        setImageKey(Date.now());
      } catch (error) {
        console.error('Erro ao carregar imagem do cache:', error);
      }
    };

    loadSavedImage();
  }, [user?._id, user?.profileImage]);

  return (
    <View style={styles.topBar}>
      {/* Ícone do perfil (lado esquerdo) */}
      <View style={styles.sideElement}>
        {profileImage ? (
          <Image 
            key={`topbar-img-${imageKey}`}
            source={{ uri: `${profileImage}?v=${imageKey}` }}
            style={styles.profileImage}
            onError={() => setProfileImage(null)}
          />
        ) : (
          <View style={styles.profilePlaceholder}>
            {user?.name ? (
              <Text style={styles.profileInitial}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person-outline" size={20} color="#FFFFFF" />
            )}
          </View>
        )}
      </View>

      {/* Logo centralizada */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('./KinisiTexto.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Ícone de adicionar amigos (lado direito) */}
      <TouchableOpacity style={styles.sideElement} onPress={() => navigation.navigate('Perfil')}>
        <Ionicons 
          name="person-add-outline" 
          size={20} 
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: "#2c2c2c",
    width: "100%",
    height: Platform.select({ ios: 60, android: 100 }), // Altura compacta e adaptável
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 0, android: 8 }), // Ajuste para status bar no Android
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 2 }, // Sombra mais sutil
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  sideElement: {
    width: 32, // Reduzido
    height: 32, // Reduzido
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    height: 150, // Altura reduzida
    width:150, // Largura proporcional
    marginTop: 70, // Ajuste fino
  },
  profileImage: {
    width: 40, // Reduzido
    height: 40, // Reduzido
    borderRadius: 16,
  },
  profilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1f51ff",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14, // Reduzido
  },
});

export default TopBar;