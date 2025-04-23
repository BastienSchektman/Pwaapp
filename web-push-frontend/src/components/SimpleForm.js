import React, { useState } from 'react';
import './SimpleForm.css'; // Vous pouvez créer ce fichier pour les styles

const SimpleForm = () => {
  // État pour stocker les valeurs du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // État pour gérer les retours de la soumission
  const [status, setStatus] = useState({
    submitted: false,
    submitting: false,
    info: { error: false, msg: null }
  });

  // Gestion des changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(prevStatus => ({ ...prevStatus, submitting: true }));

    try {
      // Remplacez cette URL par votre endpoint API
      const response = await fetch('http://localhost:9000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Réinitialiser le formulaire en cas de succès
        setFormData({ name: '', email: '', password: '' });
        setStatus({
          submitted: true,
          submitting: false,
          info: { error: false, msg: 'Formulaire soumis avec succès!' }
        });
      } else {
        throw new Error(data.password || 'Une erreur est survenue');
      }
    } catch (error) {
      setStatus({
        submitted: false,
        submitting: false,
        info: { error: true, msg: error.password }
      });
    }
  };

  return (
    <div className="form-container">
      <h2>Formulaire de contact</h2>

      {status.info.error && (
        <div className="error-message">
          Erreur: {status.info.msg}
        </div>
      )}

      {status.submitted && !status.info.error && (
        <div className="success-message">
          {status.info.msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe:</label>
          <input
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={status.submitting}
          className="submit-button"
        >
          {status.submitting ? 'Envoi en cours...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
};

export default SimpleForm;
