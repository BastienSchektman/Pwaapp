const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mon API Auth',
      version: '1.0.0',
      description: 'API de gestion des recettes et des favoris',
    },
    servers: [
      {
        url: 'http://localhost:9000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // Définition du schéma pour une recette (Meal)
        Meal: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'L\'ID unique de la recette',
            },
            strMeal: {
              type: 'string',
              description: 'Le nom de la recette',
            },
            strCategory: {
              type: 'string',
              description: 'La catégorie de la recette',
            },
            strArea: {
              type: 'string',
              description: 'La zone géographique (ex: Italie, Mexique)',
            },
            strInstructions: {
              type: 'string',
              description: 'Les instructions de préparation',
            },
            strMealThumb: {
              type: 'string',
              description: 'L\'URL de l\'image de la recette',
            },
            strTags: {
              type: 'string',
              description: 'Les tags associés à la recette',
            },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ingredient: {
                    type: 'string',
                    description: 'Nom de l\'ingrédient',
                  },
                  measure: {
                    type: 'string',
                    description: 'Quantité de l\'ingrédient',
                  },
                },
              },
            },
          },
          required: ['strMeal', 'strCategory', 'strInstructions', 'strMealThumb'],
        },
      },
    },
  },
  apis: ['./routes/**/*.js'], // Ajuste ce chemin en fonction de ton projet
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
