const jwt = require('jsonwebtoken');
const Token = require('@models/Token');
const mongoose = require('mongoose');

const authMiddleware = async (req, res, next) => {
  console.log('TEsting authMiddleware');
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Non autorisé (token manquant).' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔎 On vérifie que le token est bien en base (pas révoqué)
    const tokenExists = await Token.findOne({ token });
    if (!tokenExists) {
      return res.status(401).json({ success: false, message: 'Token invalide ou expiré.' });
    }

    // Ajout de l'id et du username à req.user
    req.user = {
      id: decoded.id, // On conserve l'id directement depuis le token
      email: decoded.email, // On suppose que le username est dans le token
    };
    req.token = token;
    next();

  } catch (error) {
    console.error('[AUTH] Erreur middleware:', error);
    return res.status(401).json({ success: false, message: 'Token invalide.' });
  }
};

module.exports = authMiddleware;
