import axios from 'axios';
import mongoose from 'mongoose';
import Meal from './models/meal.model.js'; // adapte le chemin si nécessaire

const MEALDB_RANDOM_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';
const TOTAL_MEALS = 100;

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

// Lance la fonction si tu exécutes ce fichier directement
// fetchAndSaveMeals();
