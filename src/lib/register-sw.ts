// Fonction pour enregistrer le service worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service worker enregistré avec succès:', registration);
        })
        .catch((error) => {
          console.log('Erreur lors de l\'enregistrement du service worker:', error);
        });
    });
  }
}