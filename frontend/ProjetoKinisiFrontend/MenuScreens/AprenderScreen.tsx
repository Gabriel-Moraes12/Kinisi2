import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../componentes/TopBar';
import DownBar from '../componentes/DownBar';

const TheoryScreen = () => {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Dados dos tópicos teóricos
  const topics = [
    {
      title: 'M.U. (Movimento uniforme)',
      content: `O Movimento Uniforme (M.U.) é um tipo de movimento retilíneo no qual um corpo se desloca com velocidade constante e sem aceleração. Isso significa que a velocidade não muda ao longo do tempo e que o objeto percorre distâncias iguais em intervalos de tempo iguais.

Fórmula do M.U.:
S = S₀ + v·t

Onde:
- S → posição final do móvel
- S₀ → posição inicial
- v → velocidade do móvel
- t → tempo

Se a velocidade for positiva (v > 0), o movimento é progressivo (o móvel se afasta da posição inicial). Se for negativa (v < 0), o movimento é retrógrado (o móvel se aproxima da posição inicial).`
    },
    {
      title: 'M.U.V.(Movimento uniformemente variado)',
      content: `Principais Equações do M.U.V.:

1. Equação da velocidade:  
v = v₀ + a·t  
- v = velocidade final (m/s)  
- v₀ = velocidade inicial (m/s)  
- a = aceleração (m/s²)  
- t = tempo (s)  

2. Equação de Torricelli (sem tempo):  
v² = v₀² + 2·a·Δs  
- Δs = deslocamento (m)  

3. Equação horária da posição:  
s = s₀ + v₀·t + (1/2)·a·t²  
- s = posição final (m)  
- s₀ = posição inicial (m)  

Características do M.U.V.:
- Se a > 0, o corpo acelera (a favor da velocidade)  
- Se a < 0, o corpo desacelera (contrário à velocidade)  
- O gráfico da velocidade pelo tempo é linear  
- O gráfico da posição pelo tempo é parabólico  

O M.U.V. ocorre, por exemplo, na queda livre dos corpos e nos movimentos de aceleração e frenagem de veículos.`
    },
    {
      title: 'Energia e Trabalho',
      content: `Trabalho (W):
O trabalho é a energia transferida para um corpo por meio da aplicação de uma força.  
Ele é calculado por:  
W = F·d·cos(θ)  

Onde:
- W = trabalho (J)  
- F = força aplicada (N)  
- d = deslocamento (m)  
- θ = ângulo entre a força e o deslocamento  

Se W > 0, a força aumenta a energia do corpo.  
Se W < 0, a força reduz a energia do corpo.  
Se W = 0, a força é perpendicular ao deslocamento (ex: força normal).  

Energia Cinética (Ec):
É a energia associada ao movimento de um corpo:  
Ec = (1/2)·m·v²  

Onde:
- m = massa (kg)  
- v = velocidade (m/s)  

Energia Potencial:

1. Gravitacional (Epg):  
Energia armazenada devido à altura de um corpo:  
Epg = m·g·h  

Onde:
- g = gravidade (9,8 m/s²)  
- h = altura (m)  

2. Elástica (Epe):  
Energia armazenada em molas ou elásticos:  
Epe = (1/2)·k·x²  

Onde:
- k = constante elástica (N/m)  
- x = deformação da mola (m)  

Teorema da Energia Cinética:
O trabalho da força resultante sobre um corpo é igual à variação da sua energia cinética:  
W = ΔEc = Ec_final - Ec_inicial  

Princípio da Conservação da Energia:
A energia total de um sistema isolado se mantém constante:  
E_mecânica_inicial = E_mecânica_final  

Ou seja:  
Ec₀ + Epg₀ + Epe₀ = Ec + Epg + Epe  

Esse princípio é aplicado em quedas livres, lançamentos, molas e montanhas-russas.`
    },
    {
      title: 'Leis de Newton',
      content: `1ª Lei de Newton – Lei da Inércia:  
Um corpo em repouso permanece em repouso, e um corpo em movimento continua em movimento retilíneo uniforme, a menos que uma força resultante atue sobre ele.  

Consequência:  
- Se FR = 0, o corpo mantém seu estado (repouso ou MRU)  
- A inércia depende da massa (corpos mais massivos são mais difíceis de acelerar ou parar)  

2ª Lei de Newton – Princípio Fundamental da Dinâmica:  
"A força resultante que atua sobre um corpo é igual ao produto da sua massa pela aceleração."  

FR = m·a  
Onde:  
- FR = força resultante (N)  
- m = massa (kg)  
- a = aceleração (m/s²)  

Consequência:  
- Se FR ≠ 0, o corpo sofre aceleração  
- Quanto maior a força, maior a aceleração para a mesma massa  

3ª Lei de Newton – Ação e Reação:  
"Para toda força de ação, existe uma força de reação de mesma intensidade, mesma direção e sentido oposto."  

Consequência:  
- As forças sempre ocorrem em pares (ação e reação)  
- Exemplos:  
  - Empurrar uma parede → ela empurra você de volta  
  - Andar → o chão empurra seus pés para frente  

Forças Importantes:  
- Peso (P): força gravitacional → P = m·g  
- Normal (N): força de contato perpendicular à superfície  
- Força de Atrito (Fat): resistência ao movimento  
- Tensão (T): força transmitida por cabos ou cordas`
    },
    {
      title: 'Calorimetria',
      content: `A calorimetria estuda as trocas de calor entre corpos e as variações de temperatura e estado físico.

Calor (Q):
O calor é a energia térmica transferida entre corpos com temperaturas diferentes. É medido em Joules (J) ou calorias (cal).

1 cal = 4,18 J

Equação do Calor Sensível:
Quando um corpo recebe ou perde calor sem mudar de estado físico:
Q = m·c·ΔT

Onde:
- Q = quantidade de calor (J ou cal)
- m = massa (kg ou g)
- c = calor específico (J/kg°C ou cal/g°C)
- ΔT = variação de temperatura (°C ou K)

Se Q > 0 → o corpo aquece (ganha calor)
Se Q < 0 → o corpo esfria (perde calor)

Calor Latente – Mudança de Estado:
Quando o calor provoca mudança de estado físico:
Q = m·L

Onde:
- L = calor latente (J/kg ou cal/g)
- m = massa (kg ou g)

Fusão (sólido → líquido) e vaporização (líquido → gasoso) absorvem calor.
Condensação (gás → líquido) e solidificação (líquido → sólido) liberam calor.

Princípio da Troca de Calor:
Em um sistema isolado, o calor cedido é igual ao calor recebido:
Q_perdido = Q_ganho

Modos de Propagação do Calor:
1. Condução: ocorre em sólidos (ex: colher metálica aquecendo)
2. Convecção: ocorre em líquidos e gases (ex: brisas marítimas)
3. Irradiação: ocorre através de ondas eletromagnéticas (ex: calor do Sol)

A calorimetria explica fenômenos como aquecimento do corpo, fusão de gelo e funcionamento de sistemas térmicos!`
    }
  ];

  const toggleTopic = (title: string) => {
    setExpandedTopic(expandedTopic === title ? null : title);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TopBar />
        
        <View style={styles.content}>
          <Text style={styles.header}>Aprender</Text>
          
          <ScrollView 
            style={styles.topicsContainer}
            contentContainerStyle={styles.scrollContent}
          >
            {topics.map((topic) => (
              <View key={topic.title} style={styles.topicItem}>
                <TouchableOpacity 
                  style={styles.topicHeader}
                  onPress={() => toggleTopic(topic.title)}
                >
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Ionicons 
                    name={expandedTopic === topic.title ? 'chevron-up' : 'chevron-down'} 
                    size={24} 
                    color="#ffffff" 
                  />
                </TouchableOpacity>
                
                {expandedTopic === topic.title && (
                  <View style={styles.topicContent}>
                    <Text style={styles.topicText}>{topic.content}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <DownBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 20,
  },
  topicsContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Espaço extra para rolar acima da DownBar
  },
  topicItem: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  topicContent: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#3d3d3d',
  },
  topicText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
  },
});

export default TheoryScreen;