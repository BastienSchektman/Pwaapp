const User = require('../models/user');
const Meal = require('../models/meal.model.js');

// GET /users/me
const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /users/me/favorites/:mealId
const addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const mealId = req.params.mealId;

    // Vérifier si la recette existe
    const meal = await Meal.findById(mealId);
    if (!meal) return res.status(404).json({ error: 'Recette non trouvée' });

    // Éviter les doublons
    if (!user.favorites.includes(mealId)) {
      user.favorites.push(mealId);
      await user.save();
    }

    res.status(200).json({ message: 'Ajoutée aux favoris', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /users/me/favorites
const getMyFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.status(200).json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /users/me/favorites/:mealId
const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const mealId = req.params.mealId;

    const index = user.favorites.indexOf(mealId);
    if (index === -1) return res.status(404).json({ error: 'Recette non présente dans les favoris' });

    user.favorites.splice(index, 1);
    await user.save();

    res.status(200).json({ message: 'Recette retirée des favoris', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /users/:id
const getPublicUserInfo = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('email');
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // GET /users
  const getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select('email');
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

module.exports = {
  getPublicUserInfo,
  getAllUsers,
  getMyInfo,
  addFavorite,
  getMyFavorites,
  removeFavorite
};
