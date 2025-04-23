const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cors = require('cors')
const webpush = require('web-push')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Pour hasher les mots de passe
const authRoute = require('./routes/auth/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerConfig');


const app = express()

dotenv.config()

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connecté à MongoDB avec succès !'))
.catch((err) => console.error('❌ Erreur de connexion à MongoDB :', err));


app.use(cors())
app.use(bodyParser.json())

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

app.listen(9000, () => console.log('The server has been started on the port 9000'))