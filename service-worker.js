/**
 * 小眠 PWA - Service Worker
 * 适配 GitHub Pages 路径：/xiaomian/
 */

const CACHE_NAME = 'xiaomian-v3';
const BASE = '/xiaomian';

const PRECACHE_URLS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/service-worker.js',
  BASE + '/splash.html',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
  BASE + '/icon-advanced.svg',
  BASE + '/icon.svg',
  BASE + '/assets/index-B2eS-xCi.css',
  BASE + '/assets/index-BH6dMX99.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match(BASE + '/index.html');
          }
          return new Response('', { status: 408, statusText: '离线状态' });
        });
    })
  );
});
