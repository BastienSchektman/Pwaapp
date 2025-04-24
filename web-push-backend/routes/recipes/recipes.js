// routes/recipe.routes.js
import express from 'express';
import {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getPopularRecipes,
    getSeasonalRecipes,
    likeRecipe,
    dislikeRecipe,
    listComments,
    addComment,
    deleteComment,
    getRecipesByName
  } from '../../controllers/recipe.controller.js'; // adjust as needed  
import authMiddleware from '../../middlewares/authMiddleware.js';
const router = express.Router();

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Obtenir toutes les recettes (filtrable)
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Liste des recettes.
 */
router.get('/', getAllRecipes);

/**
 * @swagger
 * /recipes/popular:
 *   get:
 *     summary: Obtenir les recettes populaires
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Liste des recettes populaires.
 */
router.get('/popular', getPopularRecipes);

/**
 * @swagger
 * /recipes/seasonal:
 *   get:
 *     summary: Obtenir les recettes de saison
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Liste des recettes de saison.
 */
router.get('/seasonal', getSeasonalRecipes);

/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     summary: Obtenir le détail d'une recette
 *     tags: [Recipes]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la recette
 *     responses:
 *       200:
 *         description: Détails de la recette.
 */
router.get('/:id', getRecipeById);

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Créer une recette
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               strMeal:
 *                 type: string
 *                 example: "Tacos maison"
 *               strDrinkAlternate:
 *                 type: string
 *                 example: "Coca-Cola"
 *               strCategory:
 *                 type: string
 *                 example: "Street Food"
 *               strArea:
 *                 type: string
 *                 example: "Mexican"
 *               strInstructions:
 *                 type: string
 *                 example: "Mélanger les ingrédients, cuire à feu doux, servir chaud."
 *               strMealThumb:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               strTags:
 *                 type: string
 *                 example: "tacos,rapide,spicy"
 *               strYoutube:
 *                 type: string
 *                 example: "https://youtube.com/watch?v=dQw4w9WgXcQ"
 *               strSource:
 *                 type: string
 *                 example: "https://monblogcuisine.com/tacos-maison"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ingredient:
 *                       type: string
 *                       example: "Poulet"
 *                     measure:
 *                       type: string
 *                       example: "200g"
 *               seasonalMonths:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [5, 6, 7]
 *     responses:
 *       201:
 *         description: Recette créée avec succès
 *       500:
 *         description: Erreur serveur
 */

router.post('/', authMiddleware, createRecipe);

/**
 * @swagger
 * /recipes/{id}:
 *   put:
 *     summary: Modifier une recette
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la recette
 *     responses:
 *       200:
 *         description: Recette mise à jour.
 */
router.put('/:id', authMiddleware, updateRecipe);

/**
 * @swagger
 * /recipes/{id}:
 *   delete:
 *     summary: Supprimer une recette
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la recette
 *     responses:
 *       200:
 *         description: Recette supprimée.
 */
router.delete('/:id', authMiddleware, deleteRecipe);

/**
 * @swagger
 * /recipes/{id}/like:
 *   post:
 *     summary: Aimer une recette
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recette aimée.
 */
router.post('/:id/like', authMiddleware, likeRecipe);

/**
 * @swagger
 * /recipes/{id}/dislike:
 *   post:
 *     summary: Ne pas aimer une recette
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recette non aimée.
 */
router.post('/:id/dislike', authMiddleware, dislikeRecipe);

/**
 * @swagger
 * /recipes/{id}/comments:
 *   get:
 *     summary: Lister les commentaires d'une recette
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la recette
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des commentaires
 *         content:
 *           application/json:
 *             example:
 *               - _id: "661c2f6f8790e4d5f45b1123"
 *                 userId: "661c2eaf01f2d7d55a881234"
 *                 username: "john_doe"
 *                 content: "Super recette !"
 *                 createdAt: "2024-04-23T14:12:00.000Z"
 *       404:
 *         description: Recette non trouvée
 */
router.get('/:id/comments', authMiddleware, listComments);

/**
 * @swagger
 * /recipes/{id}/comments:
 *   post:
 *     summary: Ajouter un commentaire à une recette
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la recette
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             content: "Délicieux plat, je recommande !"
 *     responses:
 *       201:
 *         description: Commentaire ajouté
 *         content:
 *           application/json:
 *             example:
 *               _id: "661c2f6f8790e4d5f45b1123"
 *               userId: "661c2eaf01f2d7d55a881234"
 *               username: "john_doe"
 *               content: "Délicieux plat, je recommande !"
 *               createdAt: "2024-04-23T14:12:00.000Z"
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Recette non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id/comments', authMiddleware, addComment);

/**
 * @swagger
 * /recipes/{id}/comments/{commentId}:
 *   delete:
 *     summary: Supprimer un commentaire d'une recette
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la recette
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID du commentaire à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Commentaire supprimé
 *         content:
 *           application/json:
 *             example:
 *               message: "Commentaire supprimé"
 *       403:
 *         description: Accès interdit (non propriétaire)
 *       404:
 *         description: Recette ou commentaire non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id/comments/:commentId', authMiddleware, deleteComment);

/**
 * @swagger
 * /recipes/name/{name}:
 *   get:
 *     summary: Récupérer une recette par son nom
 *     tags: [Recipes]
 *     parameters:
 *       - name: name
 *         in: path
 *         description: Nom de la recette à rechercher
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recette trouvée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meal'
 *         examples:
 *           application/json:
 *             value:
 *               idMeal: "52874"
 *               strMeal: "Poutine"
 *               strDrinkAlternate: null
 *               strCategory: "Side"
 *               strArea: "Canadian"
 *               strInstructions: "1. Prepare fries. 2. Heat gravy. 3. Assemble with cheese curds."
 *               strMealThumb: "https://www.themealdb.com/images/media/meals/xyz.jpg"
 *               strTags: "comfort,canadian"
 *               strYoutube: "https://www.youtube.com/watch?v=example"
 *               strSource: "https://www.example.com/poutine"
 *               ingredients:
 *                 - ingredient: "Fries"
 *                   measure: "2 cups"
 *                 - ingredient: "Gravy"
 *                   measure: "1 cup"
 *                 - ingredient: "Cheese Curds"
 *                   measure: "1/2 cup"
 *               seasonalMonths: [1, 2, 3]
 *       404:
 *         description: Recette non trouvée.
 *       500:
 *         description: Erreur interne du serveur.
 */

router.get('/name/:name', getRecipesByName);

export default router;
