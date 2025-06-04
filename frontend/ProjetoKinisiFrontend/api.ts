import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


/**
 * Interface para erros da API.
 */
interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

// Criação da instância do axios para requisições à API
const api: AxiosInstance = axios.create({
  baseURL: 'http://192.168.110.198:5000',
  timeout: 10000,
  headers: new AxiosHeaders({
    'Content-Type': 'application/json'
  })
});

// Interceptor para modificar requisições antes de serem enviadas
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Log de requisições
    console.log('[API Request]', {
      url: config.url,
      method: config.method,
      data: config.data
    });

    // Adiciona prefixos de rota para autenticação e amigos
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
    const friendRoutes = ['/send-request', '/accept-request', '/reject-request', '/list', '/search'];

    if (config.url) {
      const shouldAddAuthPrefix = authRoutes.some(route => config.url?.startsWith(route));
      const shouldAddFriendPrefix = friendRoutes.some(route => config.url?.startsWith(route));

      if (shouldAddAuthPrefix) {
        config.url = '/auth' + config.url;
      } else if (shouldAddFriendPrefix) {
        config.url = '/friends' + config.url;
      }
    }

    // Adiciona Authorization header se usuário estiver logado
    const user = await AsyncStorage.getItem('@user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser._id) {
        config.headers['Authorization'] = `Bearer ${parsedUser._id}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros da API
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de respostas
    console.log('[API Response]', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  (error: AxiosError) => {
    // Tratamento de erros
    const apiError: ApiError = {
      message: 'Ocorreu um erro inesperado',
    };

    if (error.response) {
      apiError.status = error.response.status;
      apiError.data = error.response.data;
      
      if (typeof error.response.data === 'object' && error.response.data !== null) {
        const responseData = error.response.data as Record<string, unknown>;
        if (typeof responseData.error === 'string') {
          apiError.message = responseData.error;
        }
      } else if (typeof error.response.data === 'string') {
        apiError.message = error.response.data;
      }
    }

    return Promise.reject(apiError);
  }
);

export default api;