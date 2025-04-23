const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('@models/User');
const Token = require('@models/Token');

const login = async (req, res) => {
  const { email, password } = req.body;

  console.log('[LOGIN] Tentative de connexion:', email);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 💾 Sauvegarde du token dans la collection Token
    await Token.create({ userId: user._id, token });

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('[LOGIN] Erreur serveur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { login };
