const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const mealSchema = new mongoose.Schema({
  idMeal: { type: String },
  strMeal: { type: String, required: true },
  strDrinkAlternate: { type: String },
  strCategory: { type: String },
  strArea: { type: String },
  strInstructions: { type: String },
  strMealThumb: { type: String },
  strTags: { type: String },
  strYoutube: { type: String },
  strSource: { type: String },
  ingredients: [{ ingredient: String, measure: String }],
  seasonalMonths: [{ type: Number }],

  // Nouveaux champs
  comments: [commentSchema],

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.models.Meal ||mongoose.model('Meal', mealSchema);