import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SimpleForm from './components/SimpleForm';
import * as serviceWorker from './serviceWorker';

function App() {
  useEffect(() => {
    // Enregistrement du service worker
    const wb = serviceWorker.register({
      onSuccess: () => {
        console.log('Service Worker enregistré avec succès');
        toast.success('Application prête pour le mode hors ligne');
      },
      onUpdate: () => {
        toast.info('Mise à jour disponible. Veuillez rafraîchir.');
      }
    });

    // Configuration des gestionnaires d'événements pour les toasts
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'REQUEST_QUEUED') {
          toast.info('Requête enregistrée et sera envoyée dès que possible.');
        } else if (event.data && event.data.type === 'SYNC_COMPLETED') {
          toast.success(`${event.data.count} requête(s) synchronisée(s) avec succès!`);
        } else if (event.data && event.data.type === 'monevenementcustom') {
          const notificationData = event.data.payload;
          toast(
            <div>
              {notificationData.title && <div style={{ fontWeight: 'bold' }}>{notificationData.title}</div>}
              <div>{notificationData.body}</div>
            </div>
          );
        }
      });
    }
  }, []);

  return (
    <div className="App">
      <ToastContainer />
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <SimpleForm />
    </div>
  );
}

export default App;