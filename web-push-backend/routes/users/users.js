import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import {
  getPublicUserInfo,
  getAllUsers,
  getMyInfo,
  addFavorite,
  getMyFavorites,
  removeFavorite
} from '../../controllers/users.controller.js';
const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtenir mes informations personnelles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données de l'utilisateur connecté
 *       401:
 *         description: Non autorisé
 */
router.get('/me', authMiddleware, getMyInfo);

/**
 * @swagger
 * /users/me/favorites/{mealId}:
 *   post:
 *     summary: Ajouter une recette aux favoris
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la recette à ajouter
 *     responses:
 *       200:
 *         description: Recette ajoutée aux favoris
 *       404:
 *         description: Recette non trouvée
 */
router.post('/me/favorites/:mealId', authMiddleware, addFavorite);

/**
 * @swagger
 * /users/me/favorites:
 *   get:
 *     summary: Obtenir la liste de mes recettes favorites
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des recettes favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Meal'
 */
router.get('/me/favorites', authMiddleware, getMyFavorites);

/**
 * @swagger
 * /users/me/favorites/{mealId}:
 *   delete:
 *     summary: Supprimer une recette des favoris
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la recette à retirer
 *     responses:
 *       200:
 *         description: Recette supprimée des favoris
 *       404:
 *         description: Recette non trouvée dans les favoris
 */
router.delete('/me/favorites/:mealId', authMiddleware, removeFavorite);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtenir les informations publiques d'un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Informations publiques de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:id', getPublicUserInfo);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtenir la liste de tous les utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 */
router.get('/', getAllUsers);

export default router;