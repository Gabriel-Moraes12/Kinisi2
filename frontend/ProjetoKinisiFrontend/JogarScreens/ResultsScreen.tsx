import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, AnsweredQuestion } from '../types';

type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'ResultsScreen'>;

type Props = {
  route: ResultsScreenRouteProp;
};

const ResultsScreen: React.FC<Props> = ({ route }) => {
  const { 
    score,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    answeredQuestions,
    mode,
    opponentId,
    opponentName
  } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Resultados</Text>
      <Text style={styles.summary}>
        Pontuação: {score} | Acertos: {correctAnswers}/{totalQuestions}
      </Text>

      {answeredQuestions.map((ans: AnsweredQuestion, index: number) => (
        <View key={index} style={[
          styles.answerContainer,
          ans.selectedAnswer === ans.correctAnswer 
            ? styles.correctAnswer 
            : styles.wrongAnswer
        ]}>
          <Text style={styles.question}>{ans.question}</Text>
          <Text style={styles.selected}>
            Sua resposta: {ans.selectedAnswer}
            {'\n'}
            Resposta correta: {ans.correctAnswer}
          </Text>
          {ans.explanation && (
            <Text style={styles.explanation}>Explicação: {ans.explanation}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1C', padding: 20 },
  title: { 
    color: 'white', 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  summary: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  answerContainer: { 
    marginBottom: 20, 
    padding: 15, 
    borderRadius: 10 
  },
  correctAnswer: {
    backgroundColor: '#2d7a5a', // Verde para respostas corretas
  },
  wrongAnswer: {
    backgroundColor: '#7a2d3e', // Vermelho para respostas erradas
  },
  question: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  selected: { 
    color: 'white', 
    fontSize: 14, 
    marginTop: 5 
  },
  explanation: { 
    color: '#ddd', 
    fontSize: 13, 
    marginTop: 5, 
    fontStyle: 'italic' 
  },
});

export default ResultsScreen;