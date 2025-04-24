import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import webpush from 'web-push';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import authRoute from './routes/auth/auth.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger/swaggerConfig.js';
import recipesRoute from './routes/recipes/recipes.js';
import userRoute from './routes/users/users.js';
import axios from 'axios';
import Meal from './models/meal.model.js'; // adapte le chemin si nécessaire


const app = express()

dotenv.config()

function transformMeal(raw) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = raw[`strIngredient${i}`]?.trim();
    const measure = raw[`strMeasure${i}`]?.trim();
    if (ingredient && ingredient !== "") {
      ingredients.push({ ingredient, measure });
    }
  }

  return {
    idMeal: raw.idMeal,
    strMeal: raw.strMeal,
    strDrinkAlternate: raw.strDrinkAlternate || null,
    strCategory: raw.strCategory || null,
    strArea: raw.strArea || null,
    strInstructions: raw.strInstructions || null,
    strMealThumb: raw.strMealThumb || null,
    strTags: raw.strTags || null,
    strYoutube: raw.strYoutube || null,
    strSource: raw.strSource || null,
    ingredients,
    seasonalMonths: [], // tu peux mettre de la logique plus tard pour les saisons

    comments: [],        // vide pour le moment
    likes: [],           // vide pour le moment
    dislikes: [],        // vide pour le moment
    createdBy: null      // sera mis à jour si besoin via le user connecté
  };
}

async function fetchAndSaveMeals(count = TOTAL_MEALS) {
  const savedMealIds = new Set();

  for (let i = 0; i < count; i++) {
    try {
      const { data } = await axios.get(MEALDB_RANDOM_URL);
      const mealData = data.meals[0];
      const meal = transformMeal(mealData);

      // Évite les doublons par idMeal
      if (savedMealIds.has(meal.idMeal)) {
        i--;
        continue;
      }

      const exists = await Meal.findOne({ idMeal: meal.idMeal });
      if (exists) {
        i--;
        continue;
      }

      await Meal.create(meal);
      savedMealIds.add(meal.idMeal);

      console.log(`✅ [${i + 1}/${count}] Meal "${meal.strMeal}" saved`);
    } catch (error) {
      console.error('❌ Error importing meal:', error.message);
      i--; // réessaie ce tour
    }
  }

  console.log('🎉 Import complete!');
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('🚀 Connected to MongoDB');
  // fetchAndSaveMeals();
})
.catch((err) => console.error('❌ Erreur de connexion à MongoDB :', err));


app.use(cors())
app.use(bodyParser.json())

const MEALDB_RANDOM_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';
const TOTAL_MEALS = 100;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


webpush.setVapidDetails(process.env.WEB_PUSH_CONTACT, process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY)

app.get('/', (req, res) => {
  res.send('Hello world!')
})

app.post('/notifications/subscribe', (req, res) => {
  const subscription = req.body

  console.log(subscription)

  const payload = JSON.stringify({
    title: 'salut epitech!',
    body: 'It works',
  })

  setTimeout(() => {
    webpush.sendNotification(subscription, payload)
    .then(result => console.log(result))
    .catch(e => console.log(e.stack))
    res.status(200).json({'success': true})
  }, 2000);

});

app.post('/submit', (req, res) => {
  try {
    // Récupérer les données envoyées par le frontend
    const { name, email, message } = req.body;

    // Validation simple des données
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs'
      });
    }

    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Adresse email invalide'
      });
    }

    // Ici, vous pouvez traiter les données (enregistrer dans une base de données, envoyer un email, etc.)
    console.log('Données du formulaire reçues:', { name, email, message });

    // Simuler un délai pour le traitement (à supprimer en production)
    setTimeout(() => {
      // Répondre avec un succès
      res.status(200).json({
        success: true,
        message: 'Formulaire soumis avec succès!'
      });
    }, 1000);

  } catch (error) {
    console.error('Erreur lors du traitement du formulaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du traitement du formulaire'
    });
  }
});

app.use('/auth', authRoute);
app.use('/recipes', recipesRoute);
app.use('/users', userRoute);

app.listen(9000, () => console.log('The server has been started on the port 9000'))