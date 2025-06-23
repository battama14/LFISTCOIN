// LFIST Game Service Worker for Offline Caching
const CACHE_NAME = 'lfist-game-v1.0';
const urlsToCache = [
  './',
  './index.html',
  './lfist-game-optimized.html',
  './lfist-game-optimized.js',
  './game-config.js',
  './bonus.png',
  './ambiance.mp3',
  './coup.mp3',
  './bonus.mp3',
  './memecoins/binance-peg-dogecoin.png',
  './memecoins/shiba-inu.png',
  './memecoins/akita-inu.png',
  './memecoins/catecoin.png',
  './memecoins/samoyedcoin.png',
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('LFIST Game: Caching assets');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('LFIST Game: Cache install failed', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a stream
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Return offline page or cached content
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('LFIST Game: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for score submission (if implemented)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-score') {
    event.waitUntil(
      // Handle background score sync here
      console.log('LFIST Game: Background sync triggered')
    );
  }
});

// Push notifications (if implemented)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New LFIST Game update available!',
    icon: './bonus.png',
    badge: './bonus.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Play Now',
        icon: './bonus.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: './bonus.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('LFIST Game', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./lfist-game-optimized.html')
    );
  }
});