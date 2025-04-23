const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
          title: 'Mon API Auth',
          version: '1.0.0',
          description: 'API d’authentification avec JWT',
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
        },
        security: [{ bearerAuth: [] }],
      },
      
  apis: ['./routes/**/*.js'], // Tu peux ajuster selon la structure de ton projet
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
