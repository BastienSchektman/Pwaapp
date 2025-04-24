const Meal = require('@models/meal.model.js');

// GET /recipes
const getAllRecipes = async (req, res) => {
  try {
    const filters = req.query;
    const recipes = await Meal.find(filters);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /recipes/:id
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Meal.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recette non trouvée' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /recipes
const createRecipe = async (req, res) => {
  try {
    const data = {
      ...req.body,
      createdBy: req.user ? req.user.id : null,
    };
    const newRecipe = new Meal(data);
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /recipes/:id
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Meal.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recette non trouvée' });

    if (recipe.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé à modifier cette recette' });
    }

    const updated = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /recipes/:id
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Meal.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recette non trouvée' });

    if (recipe.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé à supprimer cette recette' });
    }

    await Meal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recette supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /recipes/popular
const getPopularRecipes = async (req, res) => {
  try {
    const recipes = await Meal.find().sort({ likes: -1 }).limit(10);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /recipes/seasonal
const getSeasonalRecipes = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth(); // simplifié pour exemple
    const recipes = await Meal.find({ tags: { $regex: new RegExp(`saison-${currentMonth}`, 'i') } });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /recipes/:id/like
const likeRecipe = async (req, res) => {
  try {
    const recipe = await Meal.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recette non trouvée' });

    if (!recipe.likes.includes(req.user.id)) {
      recipe.likes.push(req.user.id);
      recipe.dislikes = recipe.dislikes.filter(id => id.toString() !== req.user.id);
    }

    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /recipes/:id/dislike
const dislikeRecipe = async (req, res) => {
  try {
    const recipe = await Meal.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recette non trouvée' });

    if (!recipe.dislikes.includes(req.user.id)) {
      recipe.dislikes.push(req.user.id);
      recipe.likes = recipe.likes.filter(id => id.toString() !== req.user.id);
    }

    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /recipes/:id/comments
const listComments = async (req, res) => {
    try {
      const recipe = await Meal.findById(req.params.id).select('comments');
      if (!recipe) return res.status(404).json({ error: 'Recette non trouvée' });
  
      res.status(200).json(recipe.comments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
// POST /recipes/:id/comments
const addComment = async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || content.length > 1000) {
        return res.status(400).json({ error: 'Le commentaire est requis et doit faire moins de 1000 caractères' });
      }
  
      const comment = {
        userId: req.user.id,
        content,
        createdAt: new Date()
      };
  
      const updatedRecipe = await Meal.findByIdAndUpdate(
        req.params.id,
        { $push: { comments: comment } },
        { new: true }
      );
  
      if (!updatedRecipe) return res.status(404).json({ error: 'Recette non trouvée' });
  
      res.status(201).json(updatedRecipe.comments.at(-1)); // renvoie le dernier commentaire ajouté
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // DELETE /recipes/:id/comments/:commentId
  const deleteComment = async (req, res) => {
    try {
      const recipe = await Meal.findById(req.params.id);
      if (!recipe) return res.status(404).json({ error: 'Recette non trouvée' });
  
      const comment = recipe.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ error: 'Commentaire introuvable' });
  
      // Vérifie que l'utilisateur qui fait la requête est bien l'auteur du commentaire
      if (!comment.userId.equals(req.user.id)) {
        return res.status(403).json({ error: 'Tu ne peux supprimer que tes propres commentaires' });
      }
  
      // Utilisation de $pull pour supprimer le commentaire du tableau
      recipe.comments.pull(req.params.commentId);
  
      await recipe.save();
  
      res.status(200).json({ message: 'Commentaire supprimé' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const getRecipesByName = async (req, res) => {
    const { name } = req.params; // Récupère le nom de la recette à partir des paramètres
  
    try {
      // Recherche insensible à la casse et partielle avec une expression régulière
      const recipes = await Meal.find({
        strMeal: { $regex: name, $options: 'i' } // 'i' rend la recherche insensible à la casse
      });
  
      if (recipes.length === 0) {
        return res.status(404).json({ error: 'Aucune recette trouvée' });
      }
  
      res.status(200).json(recipes); // Retourne un tableau de recettes
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getPopularRecipes,
  getSeasonalRecipes,
  likeRecipe,
  dislikeRecipe,
  addComment,
  listComments,
  deleteComment,
  getRecipesByName
};
