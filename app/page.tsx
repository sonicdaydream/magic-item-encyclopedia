'use client';

import { useState, useEffect, useRef } from 'react';

// Google Analytics 型定義
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Google Analytics トラッキング関数
const trackEvent = (eventName: string, parameters: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
    console.log('📊 GA Event:', eventName, parameters);
  }
};

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
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null); // 撮影した写真

  // サポートする画像形式を拡張（HEIF/HEIC変換対応）
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
    'image/heic',  // iPhone標準形式
    'image/heif'   // iPhone標準形式
  ];

  // ファイル入力のaccept属性用（HEIF/HEIC対応）
  const acceptedFileTypes = [
    ...supportedImageTypes,
    '.heic',  // 拡張子での指定も追加
    '.heif'   // 拡張子での指定も追加
  ].join(',');

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

  // 画像ファイルのバリデーション（HEIF/HEIC対応強化）
  const validateImageFile = (file: File): { isValid: boolean; error?: string; needsConversion?: boolean } => {
    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `ファイルサイズが大きすぎます。${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB以下のファイルを選択してください。`
      };
    }

    // HEIF/HEIC形式の検出
    const isHeifFormat = file.type === 'image/heif' || file.type === 'image/heic' ||
      file.name.toLowerCase().endsWith('.heif') ||
      file.name.toLowerCase().endsWith('.heic');

    // サポートする形式または変換可能な形式かチェック
    const isSupportedFormat = supportedImageTypes.includes(file.type);

    if (!isSupportedFormat && !isHeifFormat) {
      return {
        isValid: false,
        error: `対応していないファイル形式です。JPEG、PNG、WebP、HEIF等の画像ファイルを選択してください。`
      };
    }

    return {
      isValid: true,
      needsConversion: isHeifFormat
    };
  };

  // 入力モード切り替え
  const switchInputMode = (mode: 'camera' | 'file') => {
    setInputMode(mode);
    if (mode === 'file') {
      stopCamera();
      setCapturedPhoto(null); // カメラで撮影した写真をクリア
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

  // 画像を圧縮・変換する関数（HEIF→JPEG変換対応）
  const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        // HEIF/HEIC形式の検出
        const isHeifFormat = file.type === 'image/heif' || file.type === 'image/heic' ||
          file.name.toLowerCase().endsWith('.heif') ||
          file.name.toLowerCase().endsWith('.heic');

        let processFile = file;

        // HEIF/HEIC形式の場合、事前にJPEGに変換
        if (isHeifFormat) {
          console.log('🔄 Converting HEIF/HEIC to JPEG...');

          try {
            // heic2anyライブラリを使用してJPEGに変換
            if (typeof (window as any).heic2any === 'undefined') {
              throw new Error('HEIF変換ライブラリが読み込まれていません');
            }

            const convertedBlob = await window.heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.9
            });

            // BlobからFileオブジェクトを作成
            processFile = new File([convertedBlob as Blob],
              file.name.replace(/\.(heif|heic)$/i, '.jpg'),
              { type: 'image/jpeg' });

            console.log('✅ HEIF → JPEG conversion successful');
          } catch (heifError) {
            console.error('❌ HEIF conversion failed:', heifError);
            reject(new Error('HEIF形式の変換に失敗しました。JPEGまたはPNG形式の画像をお試しください。'));
            return;
          }
        }

        // 通常の画像処理
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          try {
            // アスペクト比を保持してリサイズ
            let { width, height } = img;
            const originalWidth = width;
            const originalHeight = height;

            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;

            if (ctx) {
              // 白い背景を設定
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);

              // 高品質な描画設定
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';

              ctx.drawImage(img, 0, 0, width, height);

              // JPEGで出力
              const dataUrl = canvas.toDataURL('image/jpeg', quality);

              console.log('✅ Image processing successful:', {
                originalFormat: file.type || 'unknown',
                originalSize: file.size,
                originalDimensions: `${originalWidth}x${originalHeight}`,
                outputDimensions: `${width}x${height}`,
                outputFormat: 'JPEG',
                outputSize: dataUrl.length,
                wasHeifConverted: isHeifFormat,
                conversionRatio: Math.round((dataUrl.length / file.size) * 100) + '%'
              });

              // URL cleanup
              URL.revokeObjectURL(img.src);

              resolve(dataUrl);
            } else {
              reject(new Error('Canvas context not available'));
            }
          } catch (error) {
            console.error('❌ Canvas processing failed:', error);
            URL.revokeObjectURL(img.src);
            reject(error);
          }
        };

        img.onerror = (error) => {
          console.error('❌ Image load failed:', {
            fileName: processFile.name,
            fileType: processFile.type,
            fileSize: processFile.size,
            error: error
          });
          URL.revokeObjectURL(img.src);
          reject(new Error('画像の読み込みに失敗しました。ファイル形式に問題がある可能性があります。'));
        };

        // 変換後のファイルを読み込み
        img.src = URL.createObjectURL(processFile);

      } catch (error) {
        console.error('❌ Image processing failed:', error);
        reject(error);
      }
    });
  };

  // TypeScript型定義の追加
  declare global {
    interface Window {
      heic2any: (options: {
        blob: File | Blob;
        toType: string;
        quality?: number;
      }) => Promise<Blob | Blob[]>;
    }
  }

  // ファイル選択（HEIF→JPEG変換対応）
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // HEIF形式の場合、変換処理の説明を表示
    if (validation.needsConversion) {
      console.log('🔄 HEIF format detected, converting to JPEG...');
    }

    try {
      setIsLoading(true); // 変換中の表示

      // 画像を圧縮・変換してプレビュー
      const processedImage = await compressImage(file);
      setSelectedImage(processedImage);

      // GA4 イベント送信: 画像アップロード
      trackEvent('image_uploaded', {
        event_category: 'user_action',
        file_type: file.type || 'unknown',
        file_size_kb: Math.round(file.size / 1024),
        was_heif_converted: validation.needsConversion || false,
        upload_method: 'file_select'
      });

      // 変換成功メッセージ
      if (validation.needsConversion) {
        console.log('✅ HEIF → JPEG conversion completed successfully');
      } else {
        console.log('✅ Image processing completed successfully');
      }

    } catch (error) {
      console.error('❌ Image processing failed:', error);

      // エラーメッセージの詳細化
      let errorMessage = '画像の処理に失敗しました。';
      if (validation.needsConversion) {
        errorMessage = 'HEIF形式の変換に失敗しました。別の形式（JPEG、PNG等）の画像をお試しください。';
      } else if (error instanceof Error) {
        if (error.message.includes('load failed')) {
          errorMessage = '画像ファイルの読み込みに失敗しました。ファイルが破損している可能性があります。';
        } else if (error.message.includes('Canvas')) {
          errorMessage = 'ブラウザの画像処理機能でエラーが発生しました。別のブラウザまたは別の画像をお試しください。';
        }
      }

      alert(errorMessage);

      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 写真撮影（プレビュー用）
  const takePhoto = (): void => {
    const dataUrl = capturePhoto();
    if (dataUrl) {
      setCapturedPhoto(dataUrl);
      console.log('📸 Photo captured for preview');

      // GA4 イベント送信: 写真撮影
      trackEvent('photo_taken', {
        event_category: 'camera_interaction',
        action: 'capture_for_preview'
      });
    } else {
      alert('写真の撮影に失敗しました。');
    }
  };

  // 撮影をやり直す
  const retakePhoto = (): void => {
    setCapturedPhoto(null);
    console.log('🔄 Retaking photo');

    // GA4 イベント送信: 撮り直し
    trackEvent('photo_retaken', {
      event_category: 'camera_interaction',
      action: 'retake_photo'
    });
  };

  // 写真撮影（圧縮機能付き）
  const capturePhoto = (): string => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return '';

    const context = canvas.getContext('2d');
    if (!context) return '';

    // リサイズして圧縮
    const maxWidth = 800;
    const maxHeight = 600;
    let { width, height } = { width: video.videoWidth, height: video.videoHeight };

    if (width > height) {
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    // GA4 イベント送信: カメラ撮影
    if (dataUrl) {
      trackEvent('camera_capture', {
        event_category: 'user_action',
        dimensions: `${width}x${height}`,
        upload_method: 'camera'
      });
    }

    return dataUrl;
  };

  // レア度を決定する関数（より現実的な分布に調整）
  const determineRarity = (): string => {
    const rand = Math.random();
    if (rand < 0.70) return 'common';      // 70% - 普通のアイテムが大半
    if (rand < 0.88) return 'uncommon';    // 18% - 時々珍しいものが出る
    if (rand < 0.96) return 'rare';        // 8% - 希少なアイテム
    if (rand < 0.99) return 'epic';        // 3% - 叙事詩級は滅多に出ない
    if (rand < 0.998) return 'legendary';  // 0.8% - 伝説級は非常に稀
    return 'mythic';                       // 0.2% - 神話級は超レア
  };

  // アイテム分析
  const analyzeItem = async () => {
    let imageData: string;

    if (inputMode === 'camera') {
      if (!capturedPhoto) {
        alert('まず写真を撮影してください。');
        return;
      }
      imageData = capturedPhoto;
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

      // GA4 イベント送信: アイテム鑑定
      trackEvent('item_analyzed', {
        event_category: 'engagement',
        event_label: rarity,
        rarity: rarity,
        item_name: result.name || 'unknown',
        input_method: inputMode
      });

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

  // PWA Service Worker 登録
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration);

          // GA4 イベント送信: PWA対応
          trackEvent('pwa_ready', {
            event_category: 'pwa',
            service_worker_status: 'registered'
          });
        })
        .catch((error) => {
          console.log('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  // ショートカットパラメータの処理
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shortcut = urlParams.get('shortcut');

    if (shortcut === 'collection') {
      setShowCollection(true);
    } else if (shortcut === 'analyze') {
      setShowCollection(false);
    }
  }, []);

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
            onClick={() => {
              setShowCollection(true);

              // GA4 イベント送信: 図鑑表示
              trackEvent('collection_viewed', {
                event_category: 'navigation',
                collection_size: items.length
              });
            }}
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
              {!capturedPhoto ? (
                // ライブカメラビューまたは撮影ボタン
                <>
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
                          onClick={takePhoto}
                          className="camera-btn capture"
                          disabled={isLoading}
                        >
                          📷 写真を撮る
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                // 撮影した写真のプレビュー
                <div className="captured-photo-preview">
                  <div className="image-container">
                    <img src={capturedPhoto} alt="撮影した写真" className="preview-image" />
                  </div>
                  <div className="photo-actions">
                    <button
                      onClick={retakePhoto}
                      className="retake-btn"
                      disabled={isLoading}
                    >
                      🔄 撮り直し
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
              )}
            </div>
          ) : (
            <div className="file-section">
              <input
                type="file"
                accept={acceptedFileTypes}
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
                        disabled={isLoading}
                      >
                        {isLoading ? '🔄 変換中...' : '📎 画像を変更'}
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
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                    style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                  >
                    <div className="drop-zone-content">
                      <div className="drop-icon">{isLoading ? '🔄' : '📸'}</div>
                      <p>{isLoading ? '画像を変換中...' : '画像をクリックして選択'}</p>
                      {!isLoading && (
                        <>
                          <p className="drop-hint">JPEG, PNG, WebP, HEIF等に対応</p>
                          <p className="drop-hint">iPhoneのHEIF形式も自動変換</p>
                          <p className="drop-hint">最大ファイルサイズ: 10MB</p>
                        </>
                      )}
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

      {/* フッター */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="/privacy" className="footer-link">🔒 プライバシーポリシー</a>
            <a href="/contact" className="footer-link">📧 お問い合わせ</a>
          </div>
          <div className="footer-info">
            <p>&copy; 2025 魔法アイテム図鑑 v1.0.0</p>
          </div>
        </div>
      </footer>

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

        .camera-btn.capture {
          background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
          padding: 1rem 2rem;
        }

        .captured-photo-preview {
          text-align: center;
        }

        .photo-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .retake-btn {
          padding: 0.75rem 1.5rem;
          background: #666;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retake-btn:hover {
          background: #555;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .retake-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
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

        /* フッタースタイル */
        .app-footer {
          background: rgba(0, 0, 0, 0.9);
          border-top: 2px solid #444;
          margin-top: 3rem;
          padding: 2rem 0;
        }

        .footer-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          padding: 0 2rem;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .footer-link {
          color: #ff8000;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          padding: 0.5rem 1rem;
          border-radius: 4px;
        }

        .footer-link:hover {
          color: #ffb347;
          background: rgba(255, 128, 0, 0.1);
          transform: translateY(-1px);
        }

        .footer-info {
          color: #666;
          font-size: 0.8rem;
          border-top: 1px solid #333;
          padding-top: 1rem;
        }

        .footer-info p {
          margin: 0;
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 1.5rem;
          }
          
          .main-content {
            padding: 1rem;
          }
          
          .camera-controls, .image-actions, .photo-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .camera-btn, .change-image-btn, .analyze-btn, .retake-btn {
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

          .footer-links {
            flex-direction: column;
            gap: 1rem;
          }

          .footer-link {
            font-size: 1rem;
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}