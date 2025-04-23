const jwt = require('jsonwebtoken');
const Token = require('@models/Token');

const authMiddleware = async (req, res, next) => {
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

    req.user = decoded;
    req.token = token;
    next();

  } catch (error) {
    console.error('[AUTH] Erreur middleware:', error);
    return res.status(401).json({ success: false, message: 'Token invalide.' });
  }
};

module.exports = authMiddleware;
