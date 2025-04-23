const Token = require('@models/Token');

const logout = async (req, res) => {
  const token = req.token; // injecté par le middleware d’auth

  if (!token) {
    return res.status(400).json({ success: false, message: 'Aucun token fourni.' });
  }

  try {
    await Token.findOneAndDelete({ token });
    console.log('[LOGOUT] Token supprimé avec succès.');
    res.status(200).json({ success: true, message: 'Déconnexion réussie.' });
  } catch (error) {
    console.error('[LOGOUT] Erreur lors de la déconnexion :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { logout };
