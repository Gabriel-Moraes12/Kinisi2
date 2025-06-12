const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');

// Rota para enviar solicitação de amizade
router.post('/send-request', async (req, res) => {
  console.log('Corpo da requisição:', req.body);

  const { senderId, recipientId } = req.body;

  // Adiciona validação de ObjectId
  if (!senderId || !recipientId) {
    return res.status(400).json({ 
      error: 'Dados incompletos',
      details: { senderId, recipientId }
    });
  }
  if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(recipientId)) {
    return res.status(400).json({ 
      error: 'IDs inválidos',
      details: { senderId, recipientId }
    });
  }

  try {
    const [sender, recipient] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId)
    ]);

    if (!sender || !recipient) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        details: { senderExists: !!sender, recipientExists: !!recipient }
      });
    }

    const alreadyFriends = sender.friends.some(friend => 
      friend.userId.equals(recipient._id) && friend.status === 'accepted'
    );
    
    const alreadyRequested = recipient.friendRequests.some(request => 
      request.userId.equals(sender._id)
    );

    if (alreadyFriends) {
      return res.status(400).json({ error: 'Vocês já são amigos' });
    }

    if (alreadyRequested) {
      return res.status(400).json({ error: 'Solicitação já enviada' });
    }

    recipient.friendRequests.push({ userId: sender._id });
    await recipient.save();

    res.json({ 
      message: 'Solicitação de amizade enviada com sucesso',
      user: {
        _id: recipient._id,
        name: recipient.name,
        profileImage: recipient.profileImage
      }
    });
  } catch (error) {
    console.error('Erro ao enviar solicitação:', error);
    res.status(500).json({ 
      error: 'Erro ao enviar solicitação de amizade',
      details: error.message 
    });
  }
});

// Rota para buscar usuários por ID
router.get('/search', async (req, res) => {
  console.log('Parâmetros da busca:', req.query);
  
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID do usuário é necessário' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const user = await User.findById(id)
      .select('name _id profileImage')
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json([user]);
  } catch (error) {
    console.error('Erro na busca de usuários:', error);
    res.status(500).json({ 
      error: 'Erro na busca de usuários',
      details: error.message 
    });
  }
});

// Rota para aceitar solicitação de amizade
// ATENÇÃO: O corpo do POST deve ser:
// {
//   "userId": "<ID do usuário que está aceitando>",
//   "requestId": "<_id do objeto FriendRequest>"
// }
// O requestId NÃO é o userId do solicitante, é o _id da solicitação (FriendRequest._id)
router.post('/accept-request', async (req, res) => {
  console.log('Rota /accept-request chamada', req.body);

  const { userId, requestId } = req.body;

  if (!userId || !requestId) {
    return res.status(400).json({ error: 'userId e requestId são obrigatórios', details: { userId, requestId } });
  }

  try {
    const user = await User.findById(userId).populate('friendRequests.userId', 'name _id profileImage');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Encontre o índice da solicitação pelo _id da solicitação
    const requestIndex = user.friendRequests.findIndex(r => r._id.toString() === requestId);
    if (requestIndex === -1) {
      return res.status(400).json({ error: 'Solicitação não encontrada' });
    }
    const request = user.friendRequests[requestIndex];

    // O usuário que enviou a solicitação
    // Corrige para garantir que sempre pegamos o ObjectId
    let requesterId;
    if (request.userId && request.userId._id) {
      requesterId = request.userId._id;
    } else {
      requesterId = request.userId;
    }

    // Verifica se o requesterId é válido
    if (!requesterId) {
      return res.status(400).json({ error: 'Solicitante inválido na solicitação de amizade', details: { request } });
    }

    const requester = await User.findById(requesterId);

    if (!requester) {
      return res.status(404).json({ error: 'Solicitante não encontrado' });
    }

    // Remover a solicitação manualmente
    user.friendRequests.splice(requestIndex, 1);

    // Adicionar como amigo em ambos os usuários, se ainda não estiverem
    if (!user.friends.some(f => f.userId.equals(requester._id))) {
      user.friends.push({ userId: requester._id, status: 'accepted' });
    }
    if (!requester.friends.some(f => f.userId.equals(user._id))) {
      requester.friends.push({ userId: user._id, status: 'accepted' });
    }

    await Promise.all([user.save(), requester.save()]);

    res.json({
      message: 'Solicitação de amizade aceita com sucesso',
      friend: {
        _id: requester._id,
        name: requester.name,
        profileImage: requester.profileImage
      }
    });
  } catch (error) {
    console.error('Erro ao aceitar solicitação:', error, error?.message, error?.stack);
    res.status(500).json({ error: 'Erro ao aceitar solicitação de amizade', details: error?.message });
  }
});

// Rota para recusar solicitação de amizade
router.post('/reject-request', async (req, res) => {
  const { userId, requestId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Remover a solicitação pelo _id da solicitação manualmente
    const requestIndex = user.friendRequests.findIndex(r => r._id.toString() === requestId);
    if (requestIndex === -1) {
      return res.status(400).json({ error: 'Solicitação não encontrada' });
    }
    user.friendRequests.splice(requestIndex, 1);
    await user.save();

    res.json({ message: 'Solicitação de amizade recusada' });
  } catch (error) {
    console.error('Erro ao recusar solicitação:', error);
    res.status(500).json({ error: 'Erro ao recusar solicitação de amizade' });
  }
});

// Rota para listar amigos e solicitações pendentes
router.get('/list/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('friends.userId', 'name _id profileImage')
      .populate('friendRequests.userId', 'name _id profileImage');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      friends: user.friends.filter(friend => friend.status === 'accepted'),
      pendingRequests: user.friendRequests
    });
  } catch (error) {
    console.error('Erro ao listar amigos:', error);
    res.status(500).json({ error: 'Erro ao listar amigos' });
  }
});

// Rota para obter informações básicas do usuário
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name _id profileImage');
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ error: 'Erro ao obter informações do usuário' });
  }
});

module.exports = router;