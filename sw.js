// =============================================
// 🚀 ARTistico PWA - Service Worker
// =============================================

const CACHE_NAME = 'artistico-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/track.html',
    '/track.css',
    '/track.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap'
];

// Install
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching files');
                return cache.addAll(urlsToCache.map(url => new Request(url, { credentials: 'same-origin' })))
                    .catch(err => console.log('⚠️ Some files failed to cache:', err));
            })
            .then(() => self.skipWaiting())
    );
});

// Activate
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Firebase ও Cloudinary রিকোয়েস্ট ক্যাশ করব না
    const url = event.request.url;
    if (url.includes('firebasedatabase.app') || url.includes('cloudinary.com')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // সফল হলে ক্যাশে সেভ করি
                if (response && response.status === 200 && event.request.method === 'GET') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // অফলাইন হলে ক্যাশ থেকে দিই
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached;
                    // যদি কিছু না পাই, index.html দেখাই
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

// Message (Update notification)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('🚀 ARTistico Service Worker loaded');
