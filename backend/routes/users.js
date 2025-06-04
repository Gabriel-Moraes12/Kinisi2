const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// ✅ Caminho absoluto baseado na raiz correta do projeto
const uploadPath = path.resolve(__dirname, '..', 'uploads', 'profiles');

// ✅ Garante que a pasta existe
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuração do armazenamento para upload de imagens de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'), false);
    }
  }
});

// Rota para upload de imagem de perfil
router.put('/upload-profile', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const { userId } = req.body;
    const profileImage = `http://${req.get('host')}/uploads/profiles/${req.file.filename}`;

    const user = await User.findById(userId);

    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Remove a imagem antiga se existir
    if (user.profileImage && user.profileImage.includes('/uploads/profiles/')) {
      const oldFilename = user.profileImage.split('/').pop();
      const oldImagePath = path.join(uploadPath, oldFilename);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    user.profileImage = profileImage;
    await user.save();

    res.json({ 
      profileImage,
      message: "Foto atualizada com sucesso" 
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Erro ao atualizar imagem de perfil' });
  }
});

// Rota para obter estatísticas do usuário
router.get('/stats/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('questionStats')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Calcular percentuais por tópico
    const topicsWithPercentages = (user.questionStats.topics || []).map(topic => ({
      ...topic,
      accuracyPercentage: topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0,
      errorPercentage: topic.total > 0 ? Math.round((topic.wrong / topic.total) * 100) : 0
    }));

    res.json({
      dailyStats: user.questionStats.daily,
      totalQuestions: user.questionStats.totalQuestions,
      topics: topicsWithPercentages,
      overallAccuracy: user.questionStats.daily.total > 0 
        ? Math.round((user.questionStats.daily.correct / user.questionStats.daily.total) * 100)
        : 0
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Rota para atualizar nome do usuário
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ error: 'Nome deve ter pelo menos 3 caracteres' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ name: user.name });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

module.exports = router;