console.log('Service worker file is loaded!');

// Importation de Workbox depuis le CDN
importScripts('./workbox-sw.js');

// Vérification que Workbox est bien chargé
if (workbox) {
    console.log('Workbox est chargé!');
    workbox.setConfig({ debug: true });

    const { registerRoute } = workbox.routing;
    const { NetworkOnly, NetworkFirst, CacheFirst, StaleWhileRevalidate } = workbox.strategies;
    const { BackgroundSyncPlugin, Queue } = workbox.backgroundSync;
    const { ExpirationPlugin } = workbox.expiration;
    const { precacheAndRoute } = workbox.precaching;

    // Définition d'une seule instance de la file d'attente pour les requêtes POST
    const postQueue = new Queue('postQueueDirect', {
        maxRetentionTime: 24 * 60 // 24 heures en minutes
    });



    // Mise en cache des ressources statiques
    precacheAndRoute([
        { url: '/', revision: '1' },
    ]);

    // Gestion des requêtes POST (interception et mise en file d'attente)
    self.addEventListener('fetch', event => {
        if (event.request.method === 'POST') {
            console.log('Interception directe de requête POST:', event.request.url);

            event.respondWith((async () => {
                try {
                    // Essayer d'envoyer la requête normalement
                    return await fetch(event.request.clone());
                } catch (error) {
                    console.log('Requête POST échouée (offline), mise en file d\'attente:', event.request.url);

                    await postQueue.pushRequest({ request: event.request.clone() });

                    // Notifier les clients que la requête est en file d'attente
                    const clients = await self.clients.matchAll({ type: 'window' });
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'REQUEST_QUEUED',
                            url: event.request.url
                        });
                    });

                    return new Response(JSON.stringify({
                        success: true,
                        offline: true,
                        message: 'Requête enregistrée et sera envoyée quand vous serez en ligne.'
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            })());
        }
    });

    // Stratégie de cache pour les fichiers statiques (CSS, JS, images)
    registerRoute(
        ({ request }) => ['style', 'script', 'image'].includes(request.destination),
        new CacheFirst({
            cacheName: 'static-assets',
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
                }),
            ],
        })
    );

    // Stratégie pour les requêtes API (GET)
    registerRoute(
        ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/'),
        new NetworkFirst({
            cacheName: 'api-responses',
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60, // 5 minutes
                }),
            ],
        })
    );

    // Stratégie par défaut pour les autres contenus
    registerRoute(
        () => true,
        new StaleWhileRevalidate({
            cacheName: 'default-cache',
        })
    );

    // Gestion des notifications push
    self.addEventListener('push', event => {
        const data = event.data.json();
        console.log('Nouvelle notification', data);
        const options = {
            body: data.body,
        };

        if (self.clients && self.clients.matchAll) {
            event.waitUntil(
                self.clients.matchAll({ type: 'window', includeUncontrolled: true })
                    .then(clients => {
                        if (clients && clients.length) {
                            console.log('Fenêtre déjà active');
                            clients.forEach(client => {
                                client.postMessage({
                                    type: 'monevenementcustom',
                                    payload: data
                                });
                            });
                            return Promise.resolve();
                        } else {
                            return self.registration.showNotification(data.title, options);
                        }
                    })
            );
        } else {
            event.waitUntil(self.registration.showNotification(data.title, options));
        }
    });

    // Synchronisation manuelle en cas de reconnexion
    self.addEventListener('message', event => {
        if (event.data && event.data.type === 'ONLINE_STATUS_CHANGE' && event.data.online) {
            console.log('Connexion rétablie, synchronisation manuelle...');
            postQueue.replayRequests().then(() => {
                console.log('Synchronisation manuelle terminée avec succès');
            }).catch(error => {
                console.error('Erreur lors de la synchronisation manuelle:', error);
            });
        }
    });

    // Vérification régulière pour synchroniser les requêtes en attente
    setInterval(() => {
        if (navigator.onLine) {
            console.log('Vérification périodique de la file d\'attente...');
            postQueue.replayRequests().then(() => {
              console.log('Synchronisation manuelle terminée avec succès');
          }).catch(error => {
              console.error('Erreur lors de la synchronisation manuelle:', error);
          });
        }
    }, 60000); // Vérifier toutes les minutes

    // Gestion de l'installation du Service Worker
    self.addEventListener('install', event => {
        console.log('Service Worker installé');
        self.skipWaiting();
    });

    // Gestion de l'activation du Service Worker
    self.addEventListener('activate', event => {
        console.log('Service Worker activé');
        event.waitUntil(clients.claim());
    });

} else {
    console.error('Workbox n\'a pas pu être chargé. Les fonctionnalités offline ne seront pas disponibles.');
}
