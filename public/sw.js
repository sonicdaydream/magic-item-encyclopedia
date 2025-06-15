const CACHE_NAME = 'magic-item-catalog-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// キャッシュするファイル
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Service Workerのインストール
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Service Workerのアクティベーション
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 古いキャッシュを削除
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// ネットワークリクエストの処理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // APIリクエストは常にネットワークを優先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          console.log('🌐 Service Worker: API request successful');
          return response;
        })
        .catch((error) => {
          console.log('❌ Service Worker: API request failed:', error);
          // APIが失敗した場合のフォールバック
          return new Response(
            JSON.stringify({ 
              error: 'オフラインのため、アイテム鑑定ができません。ネットワーク接続を確認してください。' 
            }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
  
  // 静的ファイルの処理（キャッシュファースト戦略）
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('📦 Service Worker: Serving from cache:', request.url);
            return cachedResponse;
          }
          
          // キャッシュにない場合はネットワークから取得
          return fetch(request)
            .then((response) => {
              // レスポンスをクローン（一度しか読めないため）
              const responseClone = response.clone();
              
              // 動的キャッシュに保存
              if (response.status === 200) {
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                    console.log('💾 Service Worker: Added to dynamic cache:', request.url);
                  });
              }
              
              return response;
            })
            .catch((error) => {
              console.log('❌ Service Worker: Network request failed:', error);
              
              // オフラインページを表示（作成する場合）
              if (request.destination === 'document') {
                return caches.match('/offline.html') || 
                       new Response('オフラインです。ネットワーク接続を確認してください。', {
                         headers: { 'Content-Type': 'text/html; charset=utf-8' }
                       });
              }
            });
        })
    );
  }
});

// バックグラウンド同期（将来的な機能拡張用）
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 未送信データの処理など
      console.log('📤 Service Worker: Processing background sync')
    );
  }
});

// プッシュ通知（将来的な機能拡張用）
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : '新しい魔法アイテムが発見されました！',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '図鑑を開く',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: '閉じる'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('魔法アイテム図鑑', options)
  );
});

// 通知のクリック処理
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});