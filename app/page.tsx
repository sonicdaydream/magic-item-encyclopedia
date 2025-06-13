'use client';

import { useState, useEffect, useRef } from 'react';

// 型定義を更新（loreとdescriptionを統合）
interface Item {
  id: number;
  name: string;
  description: string; // 説明と伝承を統合
  effect: string;
  rarity: string;
  image: string;
  timestamp: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [showCollection, setShowCollection] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalItem, setModalItem] = useState<Item | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'camera' | 'file'>('camera');

  // サポートする画像形式を拡張
  const supportedImageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
    'image/avif',
    'image/heic',
    'image/heif'
  ];

  // ファイルサイズ制限（10MB）
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // レア度の定義
  const rarities = {
    common: { name: '普通', color: '#888888', glow: 'none' },
    uncommon: { name: '珍しい', color: '#1eff00', glow: '0 0 10px #1eff00' },
    rare: { name: '希少', color: '#0070f3', glow: '0 0 15px #0070f3' },
    epic: { name: '叙事詩', color: '#a335ee', glow: '0 0 20px #a335ee' },
    legendary: { name: '伝説', color: '#ff8000', glow: '0 0 25px #ff8000' },
    mythic: { name: '神話', color: '#e6cc80', glow: '0 0 30px #e6cc80' }
  };

  // ローカルストレージからコレクションを読み込み
  useEffect(() => {
    const savedItems = localStorage.getItem('magicItemCollection');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  // コレクションをローカルストレージに保存（エラーハンドリング付き）
  const saveItems = (newItems: Item[]) => {
    try {
      setItems(newItems);
      
      // アイテム数を制限（最新50件のみ保持）
      const limitedItems = newItems.slice(0, 50);
      
      localStorage.setItem('magicItemCollection', JSON.stringify(limitedItems));
      console.log('✅ Items saved successfully:', limitedItems.length, 'items');
    } catch (error) {
      console.warn('⚠️ localStorage save failed:', error);
      
      // 容量オーバーの場合、古いデータを削除して再試行
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        try {
          // 最新20件のみに制限
          const reducedItems = newItems.slice(0, 20);
          localStorage.setItem('magicItemCollection', JSON.stringify(reducedItems));
          console.log('✅ Items saved with reduced count:', reducedItems.length, 'items');
          
          // ユーザーに通知
          alert('図鑑が満杯になったため、古いアイテムを整理しました。最新の発見を優先して保存します。');
        } catch (secondError) {
          console.error('❌ Failed to save even reduced items:', secondError);
          
          // 完全にクリアして新しいアイテムのみ保存
          try {
            localStorage.removeItem('magicItemCollection');
            localStorage.setItem('magicItemCollection', JSON.stringify([newItems[0]]));
            console.log('✅ Storage cleared and new item saved');
            alert('図鑑をリセットして、新しい発見を記録しました。');
          } catch (finalError) {
            console.error('❌ Complete storage failure:', finalError);
            alert('図鑑の保存に問題が発生しました。ブラウザの設定をご確認ください。');
          }
        }
      }
      
      // メモリ上のstateは更新（表示は正常に機能）
      setItems(newItems);
    }
  };

  // 画像ファイルのバリデーション
  const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `ファイルサイズが大きすぎます。${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB以下のファイルを選択してください。`
      };
    }

    // ファイル形式チェック
    if (!supportedImageTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `対応していないファイル形式です。JPEG、PNG、WebP、GIF、BMP等の画像ファイルを選択してください。`
      };
    }

    return { isValid: true };
  };

  // 入力モード切り替え
  const switchInputMode = (mode: 'camera' | 'file') => {
    setInputMode(mode);
    if (mode === 'file') {
      stopCamera();
    } else {
      setSelectedImage(null);
    }
  };

  // カメラ開始
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('カメラアクセスエラー:', error);
      alert('カメラにアクセスできませんでした。カメラの使用許可を確認してください。');
    }
  };

  // カメラ停止
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // ファイル選択
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // 画像を読み込み
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.onerror = () => {
      alert('画像ファイルの読み込みに失敗しました。別のファイルをお試しください。');
    };
    reader.readAsDataURL(file);
  };

  // 写真撮影
  const capturePhoto = (): string => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return '';
    
    const context = canvas.getContext('2d');
    if (!context) return '';
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // レア度を決定する関数
  const determineRarity = (): string => {
    const rand = Math.random();
    if (rand < 0.40) return 'common';
    if (rand < 0.65) return 'uncommon';
    if (rand < 0.80) return 'rare';
    if (rand < 0.92) return 'epic';
    if (rand < 0.98) return 'legendary';
    return 'mythic';
  };

  // アイテム分析
  const analyzeItem = async () => {
    let imageData: string;
    
    if (inputMode === 'camera') {
      if (!stream) {
        alert('まずカメラを開始してください。');
        return;
      }
      imageData = capturePhoto();
      if (!imageData) {
        alert('写真の撮影に失敗しました。');
        return;
      }
    } else {
      if (!selectedImage) {
        alert('まず画像を選択してください。');
        return;
      }
      imageData = selectedImage;
    }

    setIsLoading(true);

    try {
      const rarity = determineRarity();
      
      const response = await fetch('/api/analyze-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData.split(',')[1], // base64部分のみ
          rarity: rarity
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API呼び出しに失敗しました: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      // APIレスポンスのバリデーション
      if (!result.name || !result.description) {
        throw new Error('APIから不正なレスポンスが返されました。');
      }
      
      const newItem: Item = {
        id: Date.now(),
        name: result.name,
        description: result.description, // 説明と伝承を統合
        effect: result.effect || '',
        rarity: rarity,
        image: imageData,
        timestamp: new Date().toISOString()
      };

      setCurrentItem(newItem);
      const updatedItems = [newItem, ...items];
      saveItems(updatedItems);
      
    } catch (error) {
      console.error('分析エラー:', error);
      
      let errorMessage = 'アイテムの分析に失敗しました。';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'ネットワークエラー: インターネット接続を確認してください。';
        } else if (error.message.includes('413')) {
          errorMessage = '画像ファイルが大きすぎます。より小さいファイルをお試しください。';
        } else if (error.message.includes('400')) {
          errorMessage = '画像の形式に問題があります。別の画像をお試しください。';
        } else {
          errorMessage += ` (${error.message})`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // アイテム削除
  const deleteItem = (id: number) => {
    const updatedItems = items.filter(item => item.id !== id);
    saveItems(updatedItems);
    if (currentItem && currentItem.id === id) {
      setCurrentItem(null);
    }
    if (modalItem && modalItem.id === id) {
      setShowItemModal(false);
      setModalItem(null);
    }
  };

  // コレクションアイテムクリック
  const handleCollectionItemClick = (item: Item) => {
    setModalItem(item);
    setShowItemModal(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setShowItemModal(false);
    setModalItem(null);
  };

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.keyCode === 27) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>⚔️ 魔法アイテム図鑑</h1>
        <p className="subtitle">身の回りのアイテムに秘められた魔法の力を解き明かそう</p>
        <div className="nav-buttons">
          <button 
            className={`nav-btn ${!showCollection ? 'active' : ''}`}
            onClick={() => setShowCollection(false)}
          >
            🔍 鑑定
          </button>
          <button 
            className={`nav-btn ${showCollection ? 'active' : ''}`}
            onClick={() => setShowCollection(true)}
          >
            📚 図鑑 ({items.length})
          </button>
        </div>
      </header>

      {!showCollection ? (
        <main className="main-content">
          {/* 入力モード選択 */}
          <div className="input-mode-selector">
            <button 
              className={`mode-btn ${inputMode === 'camera' ? 'active' : ''}`}
              onClick={() => switchInputMode('camera')}
            >
              📹 カメラ撮影
            </button>
            <button 
              className={`mode-btn ${inputMode === 'file' ? 'active' : ''}`}
              onClick={() => switchInputMode('file')}
            >
              📁 ファイル選択
            </button>
          </div>

          {inputMode === 'camera' ? (
            <div className="camera-section">
              <div className="video-container">
                <video ref={videoRef} autoPlay playsInline className="camera-video" />
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="camera-controls">
                {!stream ? (
                  <button onClick={startCamera} className="camera-btn start">
                    📹 カメラ開始
                  </button>
                ) : (
                  <>
                    <button onClick={stopCamera} className="camera-btn stop">
                      ⏹️ カメラ停止
                    </button>
                    <button 
                      onClick={analyzeItem} 
                      className="camera-btn analyze"
                      disabled={isLoading}
                    >
                      {isLoading ? '🔄 鑑定中...' : '✨ アイテム鑑定'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="file-section">
              <input
                type="file"
                accept={supportedImageTypes.join(',')}
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <div className="file-upload-area">
                {selectedImage ? (
                  <div className="selected-image-preview">
                    <div className="image-container">
                      <img src={selectedImage} alt="選択された画像" className="preview-image" />
                    </div>
                    <div className="image-actions">
                      <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="change-image-btn"
                      >
                        📎 画像を変更
                      </button>
                      <button 
                        onClick={analyzeItem} 
                        className="analyze-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? '🔄 鑑定中...' : '✨ アイテム鑑定'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="file-drop-zone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="drop-zone-content">
                      <div className="drop-icon">📸</div>
                      <p>画像をクリックして選択</p>
                      <p className="drop-hint">JPEG, PNG, WebP, GIF, BMP等に対応</p>
                      <p className="drop-hint">最大ファイルサイズ: 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentItem && (
            <div className="item-display">
              <div 
                className="item-card"
                style={{ 
                  borderColor: rarities[currentItem.rarity as keyof typeof rarities].color,
                  boxShadow: rarities[currentItem.rarity as keyof typeof rarities].glow
                }}
              >
                <div className="item-header">
                  <h2 style={{ color: rarities[currentItem.rarity as keyof typeof rarities].color }}>
                    {currentItem.name}
                  </h2>
                  <span className="rarity-badge" style={{ color: rarities[currentItem.rarity as keyof typeof rarities].color }}>
                    {rarities[currentItem.rarity as keyof typeof rarities].name}
                  </span>
                </div>
                
                <div className="image-container">
                  <img src={currentItem.image} alt={currentItem.name} className="item-image" />
                </div>
                
                <div className="item-description">
                  <h3>説明</h3>
                  <p>{currentItem.description}</p>
                </div>
                
                {currentItem.effect && (
                  <div className="item-effect">
                    <h3>魔法効果</h3>
                    <p>{currentItem.effect}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      ) : (
        <div className="collection">
          <h2>アイテム図鑑</h2>
          {items.length === 0 ? (
            <p className="empty-collection">まだアイテムが記録されていません。鑑定して図鑑を充実させましょう！</p>
          ) : (
            <div className="collection-grid">
              {items.map(item => (
                <div 
                  key={item.id} 
                  className="collection-item"
                  style={{ borderColor: rarities[item.rarity as keyof typeof rarities].color }}
                  onClick={() => handleCollectionItemClick(item)}
                >
                  <div className="collection-image-container">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="collection-item-info">
                    <h3 style={{ color: rarities[item.rarity as keyof typeof rarities].color }}>{item.name}</h3>
                    <span className="rarity-badge" style={{ color: rarities[item.rarity as keyof typeof rarities].color }}>
                      {rarities[item.rarity as keyof typeof rarities].name}
                    </span>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* アイテム詳細モーダル */}
      {showItemModal && modalItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ color: rarities[modalItem.rarity as keyof typeof rarities].color }}>
                {modalItem.name}
              </h2>
              <span className="rarity-badge" style={{ color: rarities[modalItem.rarity as keyof typeof rarities].color }}>
                {rarities[modalItem.rarity as keyof typeof rarities].name}
              </span>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-image-container">
                <img src={modalItem.image} alt={modalItem.name} className="modal-image" />
              </div>
              
              <div className="modal-text">
                <div className="modal-description">
                  <h3>説明</h3>
                  <p>{modalItem.description}</p>
                </div>
                
                {modalItem.effect && (
                  <div className="modal-effect">
                    <h3>魔法効果</h3>
                    <p>{modalItem.effect}</p>
                  </div>
                )}
                
                <div className="modal-timestamp">
                  <small>発見日時: {new Date(modalItem.timestamp).toLocaleString('ja-JP')}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #e0e0e0;
          font-family: 'Georgia', serif;
        }

        .header {
          background: rgba(0, 0, 0, 0.8);
          padding: 1.5rem;
          text-align: center;
          border-bottom: 2px solid #444;
        }

        .header h1 {
          margin: 0 0 0.5rem 0;
          color: #ff8000;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          font-size: 2rem;
        }

        .subtitle {
          margin: 0 0 1.5rem 0;
          color: #ccc;
          font-size: 1rem;
          font-style: italic;
        }

        .nav-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .nav-btn {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #666;
          border-radius: 4px;
          color: #e0e0e0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-btn.active {
          background: rgba(255, 128, 0, 0.3);
          border-color: #ff8000;
          color: #ff8000;
        }

        .main-content {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .input-mode-selector {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .mode-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #666;
          border-radius: 6px;
          color: #e0e0e0;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .mode-btn.active {
          background: rgba(255, 128, 0, 0.2);
          border-color: #ff8000;
          color: #ff8000;
        }

        .mode-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .camera-section {
          margin-bottom: 2rem;
          text-align: center;
        }

        .video-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .camera-video {
          max-width: 100%;
          max-height: 400px;
          border-radius: 8px;
          border: 2px solid #444;
        }

        .camera-controls {
          margin-top: 1rem;
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .file-section {
          margin-bottom: 2rem;
        }

        .file-drop-zone {
          border: 2px dashed #666;
          border-radius: 12px;
          padding: 3rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.05);
        }

        .file-drop-zone:hover {
          border-color: #ff8000;
          background: rgba(255, 128, 0, 0.1);
        }

        .drop-zone-content {
          pointer-events: none;
        }

        .drop-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .drop-zone-content p {
          margin: 0.5rem 0;
          font-size: 1.1rem;
        }

        .drop-hint {
          color: #888;
          font-size: 0.9rem !important;
        }

        .selected-image-preview {
          text-align: center;
        }

        .image-container {
          display: flex;
          justify-content: center;
          align-items: center;
          background: #000;
          border-radius: 8px;
          border: 2px solid #444;
          margin-bottom: 1rem;
          min-height: 200px;
          overflow: hidden;
        }

        .preview-image, .item-image {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 6px;
        }

        .image-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .change-image-btn {
          padding: 0.75rem 1.5rem;
          background: #666;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .analyze-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(45deg, #ff8000, #ffb347);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .camera-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .camera-btn.start {
          background: #4CAF50;
          color: white;
        }

        .camera-btn.stop {
          background: #f44336;
          color: white;
        }

        .camera-btn.analyze {
          background: linear-gradient(45deg, #ff8000, #ffb347);
          color: white;
          font-weight: bold;
        }

        .camera-btn:hover, .change-image-btn:hover, .analyze-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .camera-btn:disabled, .analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .item-display {
          display: flex;
          justify-content: center;
        }

        .item-card {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid;
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 500px;
          width: 100%;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .item-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .rarity-badge {
          font-size: 0.9rem;
          font-weight: bold;
          text-transform: uppercase;
        }

        .item-description, .item-effect {
          margin-bottom: 1.5rem;
        }

        .item-description h3, .item-effect h3 {
          color: #ff8000;
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .item-description p, .item-effect p {
          margin: 0;
          line-height: 1.6;
        }

        .item-effect {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 6px;
        }

        .collection {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .collection h2 {
          text-align: center;
          color: #ff8000;
          margin-bottom: 2rem;
        }

        .empty-collection {
          text-align: center;
          color: #888;
          font-style: italic;
        }

        .collection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .collection-item {
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid;
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .collection-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
        }

        .collection-image-container {
          display: flex;
          justify-content: center;
          align-items: center;
          background: #000;
          border-radius: 6px;
          height: 120px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .collection-image-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .collection-item-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }

        .delete-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(244, 67, 54, 0.8);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 0.8rem;
          z-index: 10;
        }

        /* モーダルスタイル */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
          border-radius: 12px;
          border: 2px solid #444;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #444;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: #ccc;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-image-container {
          display: flex;
          justify-content: center;
          align-items: center;
          background: #000;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          min-height: 200px;
          max-height: 400px;
          overflow: hidden;
        }

        .modal-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .modal-text h3 {
          color: #ff8000;
          margin: 1rem 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .modal-text h3:first-child {
          margin-top: 0;
        }

        .modal-text p {
          line-height: 1.6;
          margin: 0 0 1rem 0;
        }

        .modal-description {
          margin-bottom: 1.5rem;
        }

        .modal-effect {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .modal-timestamp {
          text-align: center;
          color: #888;
          border-top: 1px solid #444;
          padding-top: 1rem;
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 1.5rem;
          }
          
          .main-content {
            padding: 1rem;
          }
          
          .camera-controls, .image-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .camera-btn, .change-image-btn, .analyze-btn {
            width: 100%;
            max-width: 300px;
          }

          .input-mode-selector {
            flex-direction: column;
            align-items: center;
          }

          .mode-btn {
            width: 100%;
            max-width: 300px;
          }

          .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }

          .modal-header {
            padding: 1rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .modal-header h2 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}