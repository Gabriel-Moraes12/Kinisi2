import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Tipos para dados do jogo
/**
 * Representa uma questão do jogo.
 */
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

/**
 * Representa uma questão respondida, incluindo a resposta selecionada.
 */
export interface AnsweredQuestion extends Question {
  selectedAnswer: string;
}

// Parâmetros de navegação entre telas
/**
 * Lista de parâmetros para as rotas do stack navigator.
 */
export type RootStackParamList = {
  // Telas de Autenticação
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerified: { status?: 'success' | 'failed' | 'error' };

  // Telas Principais
  Home: undefined;
  Aprender: undefined;
  Perfil: undefined;
  Mais: undefined;
  Amigos: undefined;
  Stats: undefined;
  Configuracoes: undefined;

  // Telas de Jogo
  Modalidades: undefined;
  FriendSelection: undefined;
  GameScreen: {
    mode: 'infinito' | 'amigos';
    timePerQuestion?: number;
    topics?: string[];
    opponentId?: string;
    opponentName?: string;
  };
  ResultsScreen: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    answeredQuestions: AnsweredQuestion[];
    mode: 'infinito' | 'amigos';
    opponentId?: string;
    opponentName?: string;
  };
};

// Tipos para navegação genérica
export type StackNavigation = StackNavigationProp<RootStackParamList>;

// Tipos específicos para cada tela

// Telas de Autenticação
/**
 * Navigation prop para a tela de login.
 */
export type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

/**
 * Navigation prop para a tela de registro.
 */
export type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Register'
>;

/**
 * Navigation prop para a tela de recuperação de senha.
 */
export type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

/**
 * Navigation prop para a tela de redefinição de senha.
 */
export type ResetPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ResetPassword'
>;

/**
 * Route prop para a tela de redefinição de senha.
 */
export type ResetPasswordScreenRouteProp = RouteProp<
  RootStackParamList,
  'ResetPassword'
>;

/**
 * Navigation prop para a tela de verificação de email.
 */
export type EmailVerifiedScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EmailVerified'
>;

/**
 * Route prop para a tela de verificação de email.
 */
export type EmailVerifiedScreenRouteProp = RouteProp<
  RootStackParamList,
  'EmailVerified'
>;

// Telas Principais
/**
 * Navigation prop para a tela inicial.
 */
export type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

/**
 * Navigation prop para a tela de aprendizado.
 */
export type AprenderScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Aprender'
>;

/**
 * Navigation prop para a tela de perfil.
 */
export type PerfilScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Perfil'
>;

/**
 * Navigation prop para a tela de opções adicionais.
 */
export type MaisScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Mais'
>;

// Telas de Jogo
/**
 * Navigation prop para a tela de modalidades.
 */
export type ModalidadesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Modalidades'
>;

/**
 * Navigation prop para a tela de seleção de amigos.
 */
export type FriendSelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'FriendSelection'
>;

/**
 * Navigation prop para a tela de jogo.
 */
export type GameScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GameScreen'
>;

/**
 * Route prop para a tela de jogo.
 */
export type GameScreenRouteProp = RouteProp<
  RootStackParamList,
  'GameScreen'
>;

/**
 * Navigation prop para a tela de resultados.
 */
export type ResultsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ResultsScreen'
>;

/**
 * Route prop para a tela de resultados.
 */
export type ResultsScreenRouteProp = RouteProp<
  RootStackParamList,
  'ResultsScreen'
>;

// Tipo para componentes que usam navigation e route
/**
 * Props padrão para componentes de tela que usam navigation e route.
 */
export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

// Tipos para configurações de partida
/**
 * Configurações de uma partida do jogo.
 */
export interface GameSettings {
  mode: 'infinito' | 'amigos';
  timePerQuestion: number;
  topics: string[];
  opponentId?: string;
  opponentName?: string;
}

// Resultado de uma partida
/**
 * Representa o resultado de uma partida.
 */
export interface GameResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  timePerQuestion: number;
  date: Date;
  opponentId?: string;
  opponentName?: string;
  opponentScore?: number;
}

// Tipos para o contexto de autenticação
/**
 * Representa um usuário autenticado.
 */
export interface User {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  isVerified?: boolean;
  profileImage?: string;
  stats?: {
    totalGames: number;
    totalWins: number;
    totalQuestionsAnswered: number;
    correctAnswers: number;
    favoriteTopic?: string;
    bestScore?: number;
  };
}

/**
 * Interface do contexto de autenticação.
 */
export interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserStats: (gameResult: GameResult) => Promise<void>;
}

// Tipos para amigos
/**
 * Representa um amigo do usuário.
 */
export interface Friend {
  userId: string | User;
  status: 'pending' | 'accepted';
  date: Date;
}

/**
 * Representa um convite de jogo entre amigos.
 */
export interface GameInvite {
  _id: string;
  from: string | User;
  to: string | User;
  topics: string[];
  timePerQuestion: number;
  status: 'pending' | 'accepted' | 'rejected';
  date: Date;
}

/**
 * Representa uma solicitação de amizade.
 */
export interface FriendRequest {
  _id: string;
  userId: string | User;
  date: Date;
}
