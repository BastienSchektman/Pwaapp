require('module-alias/register');
const express = require('express');
const router = express.Router();
const { register } = require('@controllers/registerController'); 
const { login } = require('@controllers/loginController');
const { logout } = require('@controllers/logoutController');

const authMiddleware = require('@middlewares/authMiddleware');

// Route POST /auth/register
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Enregistre un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jean Dupont
 *               email:
 *                 type: string
 *                 example: jean@exemple.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Utilisateur enregistré avec succès
 *       400:
 *         description: Champs manquants ou email invalide
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/register', register);

// Route POST /auth/login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connecte un utilisateur existant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jean@exemple.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Connexion réussie avec retour du token
 *       400:
 *         description: Champs manquants
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post('/login', login);

// Route POST /auth/logout
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnecte l'utilisateur courant
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       400:
 *         description: Aucun token fourni
 *       500:
 *         description: Erreur serveur
 */
router.post('/logout', authMiddleware, logout);

module.exports = router;
