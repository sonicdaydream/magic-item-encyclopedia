'use client';

export default function ContactPage() {
  return (
    <div className="contact-container">
      <header className="contact-header">
        <h1>⚔️ お問い合わせ</h1>
        <p className="subtitle">魔法アイテム図鑑に関するご質問・ご要望をお聞かせください</p>
      </header>

      <main className="contact-content">
        <section className="section">
          <h2>📧 お問い合わせ方法</h2>
          
          <div className="contact-methods">
            <div className="contact-method">
              <h3>🌐 GitHub Issues</h3>
              <p>バグ報告や機能要望は、GitHubのIssuesページでお受けしています。開発者が直接確認でき、他のユーザーとも情報共有できます。</p>
              <a 
                href="https://github.com/sonicdaydream/magic-item-encyclopedia/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-link"
              >
                🔗 GitHub Issues を開く
              </a>
              <div className="method-details">
                <h4>こんな時におすすめ：</h4>
                <ul>
                  <li>🐛 バグや不具合を発見した</li>
                  <li>✨ 新機能の要望がある</li>
                  <li>💡 改善のアイデアがある</li>
                  <li>📖 技術的な質問がある</li>
                </ul>
              </div>
            </div>

            <div className="contact-method">
              <h3>📝 フィードバックフォーム</h3>
              <p>簡単なフィードバックや感想は、Googleフォームから匿名でお送りいただけます。</p>
              <a 
                href="https://forms.gle/nkB3dHkpq6mmMLYg9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-link"
              >
                📝 フィードバックを送る
              </a>
              <div className="method-details">
                <h4>こんな時におすすめ：</h4>
                <ul>
                  <li>😊 使用感や感想を伝えたい</li>
                  <li>💭 簡単な要望がある</li>
                  <li>🎯 匿名で意見したい</li>
                  <li>📊 利用統計に協力したい</li>
                </ul>
              </div>
            </div>

            {/* Twitter/X セクション - アカウント作成後に有効化 */}
            {/*
            <div className="contact-method">
              <h3>🐦 Twitter/X</h3>
              <p>最新情報やお知らせ、気軽な質問は公式アカウントまでどうぞ。</p>
              <a 
                href="https://twitter.com/your-account" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-link"
              >
                🔗 @your-account をフォロー
              </a>
              <div className="method-details">
                <h4>こんな時におすすめ：</h4>
                <ul>
                  <li>📢 最新情報をチェックしたい</li>
                  <li>💬 気軽に質問したい</li>
                  <li>📸 鑑定結果をシェアしたい</li>
                  <li>🤝 開発者と交流したい</li>
                </ul>
              </div>
            </div>
            */}
          </div>
        </section>

        <section className="section">
          <h2>❓ よくある質問</h2>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3>📱 アプリが動作しない・重い</h3>
              <div className="faq-content">
                <p><strong>解決方法：</strong></p>
                <ol>
                  <li>ブラウザのキャッシュをクリア</li>
                  <li>ブラウザを再起動</li>
                  <li>別のブラウザで試してみる</li>
                </ol>
                <p><strong>Chrome の場合：</strong><br/>
                <code>設定 → プライバシーとセキュリティ → 閲覧履歴データの削除</code></p>
              </div>
            </div>

            <div className="faq-item">
              <h3>📸 写真がアップロードできない</h3>
              <div className="faq-content">
                <p><strong>対応形式：</strong> JPEG、PNG、WebP、HEIF（iPhone）、GIF、BMP</p>
                <p><strong>ファイルサイズ：</strong> 10MB以下</p>
                <p><strong>トラブル時：</strong></p>
                <ul>
                  <li>ファイルサイズを確認</li>
                  <li>別の画像で試してみる</li>
                  <li>JPEGに変換してから試す</li>
                </ul>
              </div>
            </div>

            <div className="faq-item">
              <h3>🎲 レア度の仕組みは？</h3>
              <div className="faq-content">
                <p>レア度はランダムで決定されます：</p>
                <div className="rarity-list">
                  <div className="rarity-item common">普通 (70%)</div>
                  <div className="rarity-item uncommon">珍しい (18%)</div>
                  <div className="rarity-item rare">希少 (8%)</div>
                  <div className="rarity-item epic">叙事詩 (3%)</div>
                  <div className="rarity-item legendary">伝説 (0.8%)</div>
                  <div className="rarity-item mythic">神話 (0.2%)</div>
                </div>
              </div>
            </div>

            <div className="faq-item">
              <h3>💾 データはどこに保存される？</h3>
              <div className="faq-content">
                <p><strong>🛡️ 安全性：</strong></p>
                <ul>
                  <li>アイテムコレクションは<strong>端末内のみ</strong>に保存</li>
                  <li>撮影した画像は<strong>サーバーに保存されません</strong></li>
                  <li>アプリを削除すると全データが削除されます</li>
                </ul>
                <p><strong>データ削除方法：</strong><br/>
                ブラウザ設定でローカルストレージをクリア</p>
              </div>
            </div>

            <div className="faq-item">
              <h3>🌐 オフラインで使える？</h3>
              <div className="faq-content">
                <p><strong>オフライン対応機能：</strong></p>
                <ul>
                  <li>✅ アプリの起動・基本UI</li>
                  <li>✅ 保存済みコレクションの閲覧</li>
                  <li>❌ 新しいアイテム鑑定（要ネット接続）</li>
                </ul>
                <p>PWA（Progressive Web App）として動作するため、一度読み込めば基本機能はオフラインでも利用可能です。</p>
              </div>
            </div>

            <div className="faq-item">
              <h3>📱 アプリをインストールできる？</h3>
              <div className="faq-content">
                <p><strong>インストール方法：</strong></p>
                <ul>
                  <li><strong>PC（Chrome）：</strong> アドレスバーの「インストール」ボタン</li>
                  <li><strong>iPhone（Safari）：</strong> 共有ボタン → 「ホーム画面に追加」</li>
                  <li><strong>Android（Chrome）：</strong> メニュー → 「ホーム画面に追加」</li>
                </ul>
                <p>インストールすると、ネイティブアプリのように使用できます。</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>💭 フィードバックのお願い</h2>
          <p>以下のような情報をお教えいただけると、アプリの改善に大変役立ちます：</p>
          
          <div className="feedback-grid">
            <div className="feedback-item">
              <h3>🔍 機能について</h3>
              <ul>
                <li>どのような機能を追加してほしいか</li>
                <li>使いにくいと感じる部分</li>
                <li>もっと改善してほしい機能</li>
              </ul>
            </div>

            <div className="feedback-item">
              <h3>🐛 技術的な問題</h3>
              <ul>
                <li>発見したバグや不具合</li>
                <li>エラーメッセージの詳細</li>
                <li>問題が発生した状況</li>
              </ul>
            </div>

            <div className="feedback-item">
              <h3>📱 環境情報</h3>
              <ul>
                <li>使用しているデバイス・OS</li>
                <li>ブラウザの種類・バージョン</li>
                <li>画面サイズや解像度</li>
              </ul>
            </div>

            <div className="feedback-item">
              <h3>✨ 使用感</h3>
              <ul>
                <li>アプリの全体的な感想</li>
                <li>面白かった・楽しかった点</li>
                <li>期待していた機能との違い</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>ℹ️ アプリ情報</h2>
          <div className="app-info-grid">
            <div className="info-item">
              <h3>📱 アプリ詳細</h3>
              <div className="info-content">
                <p><strong>アプリ名：</strong> 魔法アイテム図鑑</p>
                <p><strong>バージョン：</strong> 1.0.0</p>
                <p><strong>リリース日：</strong> 2025年6月15日</p>
                <p><strong>アップデート：</strong> 随時</p>
              </div>
            </div>

            <div className="info-item">
              <h3>🌐 対応環境</h3>
              <div className="info-content">
                <p><strong>ブラウザ：</strong> Chrome, Safari, Edge, Firefox</p>
                <p><strong>OS：</strong> iOS, Android, Windows, macOS</p>
                <p><strong>画面サイズ：</strong> スマートフォン〜デスクトップ</p>
                <p><strong>接続：</strong> インターネット接続必須（鑑定時）</p>
              </div>
            </div>

            <div className="info-item">
              <h3>🛠️ 使用技術</h3>
              <div className="info-content">
                <p><strong>フロントエンド：</strong> Next.js, React, TypeScript</p>
                <p><strong>AI：</strong> Google Gemini API</p>
                <p><strong>分析：</strong> Google Analytics 4</p>
                <p><strong>ホスティング：</strong> Vercel</p>
              </div>
            </div>

            <div className="info-item">
              <h3>🎯 開発方針</h3>
              <div className="info-content">
                <p><strong>プライバシー：</strong> データ保護を最優先</p>
                <p><strong>ユーザビリティ：</strong> 使いやすさを重視</p>
                <p><strong>パフォーマンス：</strong> 高速動作を追求</p>
                <p><strong>アクセシビリティ：</strong> 全ての人が使えるように</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav className="navigation">
        <a href="/" className="nav-link home">🏠 ホームに戻る</a>
        <a href="/privacy" className="nav-link privacy">🔒 プライバシーポリシー</a>
      </nav>

      <style jsx>{`
        .contact-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #e0e0e0;
          font-family: 'Georgia', serif;
          padding: 2rem;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 3rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .contact-header h1 {
          color: #ff8000;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }

        .subtitle {
          color: #ccc;
          font-size: 1.1rem;
          font-style: italic;
          line-height: 1.6;
        }

        .contact-content {
          max-width: 1000px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .section {
          margin-bottom: 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #444;
          border-radius: 8px;
          padding: 2rem;
        }

        .section h2 {
          color: #ff8000;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #444;
          padding-bottom: 0.5rem;
        }

        .contact-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .contact-method {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #666;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .contact-method h3 {
          color: #ffb347;
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .contact-method p {
          margin-bottom: 1.5rem;
        }

        .contact-link {
          display: inline-block;
          background: linear-gradient(45deg, #ff8000, #ffb347);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .contact-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(255, 128, 0, 0.3);
        }

        .method-details {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 1rem;
          margin-top: 1rem;
        }

        .method-details h4 {
          color: #ffb347;
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
        }

        .method-details ul {
          margin: 0;
          padding-left: 1.2rem;
        }

        .method-details li {
          margin-bottom: 0.3rem;
          font-size: 0.9rem;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .faq-item {
          background: rgba(0, 0, 0, 0.3);
          border-left: 4px solid #ff8000;
          border-radius: 0 8px 8px 0;
          padding: 1.5rem;
        }

        .faq-item h3 {
          color: #ffb347;
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .faq-content p {
          margin-bottom: 1rem;
        }

        .faq-content ol,
        .faq-content ul {
          padding-left: 1.2rem;
          margin-bottom: 1rem;
        }

        .faq-content li {
          margin-bottom: 0.3rem;
        }

        .faq-content code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.8rem;
          display: inline-block;
          margin-top: 0.5rem;
        }

        .rarity-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .rarity-item {
          padding: 0.5rem;
          border-radius: 4px;
          text-align: center;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .rarity-item.common { background: rgba(136, 136, 136, 0.3); color: #888; }
        .rarity-item.uncommon { background: rgba(30, 255, 0, 0.2); color: #1eff00; }
        .rarity-item.rare { background: rgba(0, 112, 243, 0.2); color: #0070f3; }
        .rarity-item.epic { background: rgba(163, 53, 238, 0.2); color: #a335ee; }
        .rarity-item.legendary { background: rgba(255, 128, 0, 0.2); color: #ff8000; }
        .rarity-item.mythic { background: rgba(230, 204, 128, 0.2); color: #e6cc80; }

        .feedback-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .feedback-item {
          background: rgba(255, 128, 0, 0.1);
          border: 1px solid #ff8000;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .feedback-item h3 {
          color: #ff8000;
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .feedback-item ul {
          margin: 0;
          padding-left: 1.2rem;
        }

        .feedback-item li {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .app-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #555;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .info-item h3 {
          color: #ffb347;
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .info-content p {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .info-content strong {
          color: #ff8000;
        }

        .navigation {
          max-width: 1000px;
          margin: 3rem auto 0;
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid #444;
        }

        .nav-link {
          display: inline-block;
          margin: 0 1rem;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .nav-link.home {
          background: linear-gradient(45deg, #ff8000, #ffb347);
          color: white;
        }

        .nav-link.privacy {
          background: rgba(255, 255, 255, 0.1);
          color: #ff8000;
          border: 1px solid #ff8000;
        }

        .nav-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .nav-link.home:hover {
          box-shadow: 0 4px 8px rgba(255, 128, 0, 0.3);
        }

        .nav-link.privacy:hover {
          background: rgba(255, 128, 0, 0.1);
        }

        @media (max-width: 768px) {
          .contact-container {
            padding: 1rem;
          }

          .contact-header h1 {
            font-size: 2rem;
          }

          .section {
            padding: 1.5rem;
          }

          .contact-methods,
          .faq-grid,
          .feedback-grid,
          .app-info-grid {
            grid-template-columns: 1fr;
          }

          .rarity-list {
            grid-template-columns: repeat(2, 1fr);
          }

          .navigation {
            margin-top: 2rem;
          }

          .nav-link {
            display: block;
            margin: 0.5rem auto;
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  );
}