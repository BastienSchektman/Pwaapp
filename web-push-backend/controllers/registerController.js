const bcrypt = require('bcrypt');
const User = require('@models/User');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  console.log('[REGISTER] Données reçues:', { name, email, password: '[HIDDEN]' });

  if (!name || !email || !password) {
    console.warn('[REGISTER] Champs manquants');
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.warn('[REGISTER] Email invalide:', email);
    return res.status(400).json({ success: false, message: 'Email invalide.' });
  }

  try {
    console.log('[REGISTER] Vérification de l\'utilisateur existant...');
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.warn('[REGISTER] Email déjà utilisé:', email);
      return res.status(409).json({ success: false, message: 'Email déjà utilisé.' });
    }

    console.log('[REGISTER] Hashing du mot de passe...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('[REGISTER] Création du nouvel utilisateur...');
    const newUser = new User({ name, email, password: hashedPassword });

    console.log('[REGISTER] Sauvegarde dans la base de données...');
    await newUser.save();

    console.log('[REGISTER] Utilisateur enregistré avec succès:', email);
    res.status(201).json({ success: true, message: 'Inscription réussie.' });

  } catch (error) {
    console.error('[REGISTER] Erreur serveur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { register };
