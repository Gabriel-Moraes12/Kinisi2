const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const mongoose = require('mongoose');
const UsedQuestion = require('../models/UsedQuestion');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Rota para gerar uma nova questão de física usando IA
router.post('/generate', async (req, res) => {
  const { topic, difficulty } = req.body;

  try {
    // Busca todas as questões já usadas (independente do tópico)
    const usedQuestions = await UsedQuestion.find().select('question -_id');
    const usedQuestionsSet = new Set(usedQuestions.map(q => q.question));

    let question = null;
    let aiMessage = null;
    let attempts = 0;
    const maxAttempts = 7; // aumenta tentativas para garantir ineditismo

    while (attempts < maxAttempts) {
      attempts++;

      const prompt = `Gere uma questão de física sobre ${topic} com dificuldade Difícil.Seja muito criativo e único no enunciado das questões, você deve ter uma criatividade única. A resposta deve ser APENAS um objeto JSON válido, sem texto adicional, com a seguinte estrutura exata:

{
  "question": "Texto da pergunta",
  "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
  "correctAnswer": "Opção correta",
  "explanation": "Explicação detalhada"
}

NÃO inclua qualquer texto fora do objeto JSON.`;

      let response;
      try {
        response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: "openai/gpt-3.5-turbo",
            messages: [
              { role: "user", content: prompt }
            ],
            temperature: 0.9,
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (apiError) {
        console.error('Erro na chamada à OpenRouter:', apiError?.response?.data || apiError.message);
        return res.status(502).json({
          error: 'Erro ao se comunicar com o serviço de IA',
          details: apiError?.response?.data || apiError.message
        });
      }

      aiMessage = response.data.choices?.[0]?.message?.content;
      if (!aiMessage) {
        console.error('Resposta da IA vazia ou inválida:', response.data);
        return res.status(502).json({
          error: 'Resposta da IA vazia ou inválida',
          details: response.data
        });
      }

      try {
        question = JSON.parse(aiMessage);
      } catch (e) {
        console.error('Falha ao fazer parse do JSON retornado pela IA:', aiMessage);
        continue; // Tenta de novo se não for JSON válido
      }

      // Checa se a questão já foi usada em qualquer tópico
      if (!usedQuestionsSet.has(question.question)) {
        // Salva no banco
        await UsedQuestion.create({ question: question.question, topic });
        return res.json(question);
      }
      // Se repetida, tenta de novo
    }

    // Se chegou aqui, não conseguiu gerar questão nova
    return res.status(429).json({ 
      error: 'Não foi possível gerar uma questão inédita após várias tentativas. Tente outro tópico ou dificuldade.' 
    });
  } catch (error) {
    console.error('Erro ao gerar questão:', error?.response?.data || error.message);
    res.status(500).json({ 
      error: 'Erro ao gerar questão', 
      details: error?.response?.data || error.message 
    });
  }
});

// Rota para atualizar estatísticas do usuário após responder uma questão
router.post('/update-stats', async (req, res) => {
  try {
    const { userId, topic, isCorrect } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'ID de usuário inválido' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await user.updateQuestionStats(topic, isCorrect);
    
    // Busca o usuário atualizado para retornar dados frescos
    const updatedUser = await User.findById(userId)
      .select('questionStats')
      .lean();

    // Calcula accuracyPercentage para cada tópico
    const topicsWithPercentages = (updatedUser.questionStats.topics || []).map(topic => ({
      ...topic,
      accuracyPercentage: topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0,
      errorPercentage: topic.total > 0 ? Math.round((topic.wrong / topic.total) * 100) : 0
    }));

    res.json({ 
      success: true,
      stats: {
        daily: updatedUser.questionStats.daily,
        totalQuestions: updatedUser.questionStats.totalQuestions,
        topics: topicsWithPercentages,
        overallAccuracy: updatedUser.questionStats.daily.total > 0 
          ? Math.round((updatedUser.questionStats.daily.correct / updatedUser.questionStats.daily.total) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar estatísticas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
module.exports = router;