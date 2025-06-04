import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Question } from '../types';
import api from '../api';
import { useAuth } from '../funcoes/AuthContext';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameScreen'>;
type GameScreenRouteProp = RouteProp<RootStackParamList, 'GameScreen'>;

type Props = {
  navigation: GameScreenNavigationProp;
  route: GameScreenRouteProp;
};

const GameScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const { user } = useAuth(); // Obter usuário do contexto de autenticação
  const { mode, timePerQuestion = 10, topics = [] } = route.params;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion * 60);
  const [answers, setAnswers] = useState<{ question: Question; selected: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const generateQuestion = useCallback(async () => {
    if (topics.length === 0) return;

    try {
      setLoading(true);

      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      const response = await api.post('/questions/generate', {
        topic: randomTopic,
        difficulty: 'medium',
      });

      const newQuestion: Question = {
        ...response.data,
        id: Date.now().toString(),
        topic: randomTopic,
      };

      const isDuplicate = questions.some(q => q.question === newQuestion.question);

      if (!isDuplicate) {
        setQuestions(prev => [...prev, newQuestion]);
        setCurrentQuestion(newQuestion);
      } else {
        generateQuestion(); // Gera outra se repetir
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar uma nova questão');
    } finally {
      setLoading(false);
    }
  }, [questions, topics]);

  const updateQuestionStats = async (topic: string, isCorrect: boolean) => {
  try {
    if (!user?._id) {
      console.error('ID do usuário não disponível');
      return;
    }

    // Verifica se o tópico está vazio ou undefined
    const validTopic = topic || 'Geral'; // Fallback para 'Geral' se não houver tópico
    
    await api.post('/questions/update-stats', {
      userId: user._id,
      topic: validTopic,
      isCorrect
    });
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
};

  useEffect(() => {
    generateQuestion();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1) {
          clearInterval(timer);
          navigation.replace('ResultsScreen', {
            score,
            totalQuestions: questions.length,
            correctAnswers: answers.filter(a => a.selected === a.question.correctAnswer).length,
            wrongAnswers: answers.filter(a => a.selected !== a.question.correctAnswer).length,
            answeredQuestions: answers.map(a => ({
              ...a.question,
              selectedAnswer: a.selected
            })),
            mode: route.params.mode,
            opponentId: route.params.opponentId,
            opponentName: route.params.opponentName,
          });
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => clearInterval(timer);
  }, [answers, navigation]);

  const handleAnswer = (option: string) => {
    if (!currentQuestion) return;

    setSelectedOption(option);
    const isCorrect = option === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    updateQuestionStats(currentQuestion.topic, isCorrect);
    setAnswers(prev => [...prev, { question: currentQuestion, selected: option }]);

    setTimeout(() => {
      setSelectedOption(null);
      generateQuestion();
    }, 1500);
  };

  if (loading || !currentQuestion) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1f51ff" />
        <Text style={styles.loadingText}>Gerando questão...</Text>
      </View>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.score}>Pontuação: {score}</Text>
        <Text style={styles.timer}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </Text>
        <Text style={styles.questionCount}>Questões: {questions.length}</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.topic}>{currentQuestion.topic}</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOption === option && styles.selectedOption,
              selectedOption && option === currentQuestion.correctAnswer && styles.correctOption,
              selectedOption && selectedOption === option && option !== currentQuestion.correctAnswer && styles.wrongOption
            ]}
            onPress={() => !selectedOption && handleAnswer(option)}
            disabled={!!selectedOption}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1C1C1C', 
    padding: 20 
  },
  loadingText: { 
    color: 'white', 
    marginTop: 20 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 30 
  },
  score: { 
    color: 'white', 
    fontSize: 16 
  },
  timer: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  questionCount: { 
    color: 'white', 
    fontSize: 16 
  },
  questionContainer: { 
    marginBottom: 30 
  },
  topic: { 
    color: '#1f51ff', 
    fontSize: 16, 
    marginBottom: 10 
  },
  questionText: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  optionsContainer: { 
    marginTop: 20 
  },
  optionButton: { 
    backgroundColor: '#2c2c2c', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15 
  },
  selectedOption: { 
    backgroundColor: '#1f51ff' 
  },
  correctOption: { 
    backgroundColor: '#4CAF50' 
  },
  wrongOption: { 
    backgroundColor: '#F44336' 
  },
  optionText: { 
    color: 'white', 
    fontSize: 16 
  },
});

export default GameScreen;