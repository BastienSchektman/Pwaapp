import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const convertedVapidKey = urlBase64ToUint8Array(process.env.REACT_APP_PUBLIC_VAPID_KEY)

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4)
  // eslint-disable-next-line
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function sendSubscription(subscription) {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:9000';
  return fetch(`${apiUrl}/notifications/subscribe`, {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function subscribeUser() {
  if ('serviceWorker' in navigator) {
    // Configuration de l'écouteur d'événements pour les notifications
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'monevenementcustom') {
        const notificationData = event.data.payload;

        // Afficher un toast avec les données de notification
        toast(
          <div>
            {notificationData.title && <div style={{ fontWeight: 'bold' }}>{notificationData.title}</div>}
            <div>{notificationData.body}</div>
          </div>,
          { 
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          }
        );

        console.log('Received notification data:', notificationData);
      }
    });

    navigator.serviceWorker.ready.then(function(registration) {
      if (!registration.pushManager) {
        console.log('Push manager unavailable.')
        return
      }

      registration.pushManager.getSubscription().then(function(existedSubscription) {
        if (existedSubscription === null) {
          console.log('No subscription detected, make a request.')
          registration.pushManager.subscribe({
            applicationServerKey: convertedVapidKey,
            userVisibleOnly: true,
          }).then(function(newSubscription) {
            console.log('New subscription added.', newSubscription)
            sendSubscription(newSubscription)
            // Afficher un toast pour indiquer l'abonnement réussi
            toast.success('Notifications activées avec succès!', {
              position: "top-right",
              autoClose: 3000
            });
          }).catch(function(e) {
            if (Notification.permission !== 'granted') {
              console.log('Permission was not granted.')
              // Afficher un toast pour indiquer que la permission n'a pas été accordée
              toast.error('Permission de notification refusée', {
                position: "top-right",
                autoClose: 5000
              });
            } else {
              console.error('An error ocurred during the subscription process.', e)
              // Afficher un toast pour indiquer une erreur
              toast.error('Une erreur est survenue lors de l\'activation des notifications', {
                position: "top-right",
                autoClose: 5000
              });
            }
          })
        } else {
          console.log('Existed subscription detected.')
          sendSubscription(existedSubscription)
        }
      })
    })
    .catch(function(e) {
      console.error('An error ocurred during Service Worker registration.', e)
      // Afficher un toast pour indiquer une erreur d'enregistrement du service worker
      toast.error('Erreur lors de l\'enregistrement du service worker', {
        position: "top-right",
        autoClose: 5000
      });
    })
  }
}