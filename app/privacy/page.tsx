'use client';

export default function PrivacyPage() {
  return (
    <div className="privacy-container">
      <header className="privacy-header">
        <h1>🔒 プライバシーポリシー</h1>
        <p className="subtitle"><strong>魔法アイテム図鑑</strong>（以下「本アプリ」）のプライバシーポリシーです。</p>
      </header>

      <main className="privacy-content">
        <section className="section">
          <h2>1. 情報の収集と利用</h2>

          <h3>1.1 収集する情報</h3>
          <ul>
            <li><strong>画像データ</strong>: アイテム鑑定のために撮影・アップロードされた画像</li>
            <li><strong>使用統計</strong>: Google Analyticsによるアクセス解析情報</li>
            <li><strong>ローカルデータ</strong>: 端末内に保存されるアイテムコレクション</li>
          </ul>

          <h3>1.2 利用目的</h3>
          <ul>
            <li>アイテム鑑定サービスの提供</li>
            <li>アプリの改善・最適化</li>
            <li>統計データの分析</li>
          </ul>
        </section>

        <section className="section">
          <h2>2. 情報の保存と管理</h2>

          <div className="highlight-box">
            <h3>🛡️ 重要: データの安全性</h3>
            <p>アップロードされた画像は<strong>一時的に処理のみに使用</strong>され、<strong>サーバーに永続保存されません</strong>。処理完了後は自動的に削除されます。</p>
          </div>

          <h3>2.1 画像データ</h3>
          <ul>
            <li>アップロードされた画像は<strong>一時的に処理のみに使用</strong>されます</li>
            <li>画像データは<strong>サーバーに永続保存されません</strong></li>
            <li>処理完了後は自動的に削除されます</li>
          </ul>

          <h3>2.2 鑑定結果</h3>
          <ul>
            <li>鑑定結果（アイテム名、説明、効果）は<strong>端末内にのみ保存</strong>されます</li>
            <li>鑑定結果は<strong>外部サーバーに送信されません</strong></li>
          </ul>

          <h3>2.3 ローカルストレージ</h3>
          <ul>
            <li>アイテムコレクションは端末のローカルストレージに保存されます</li>
            <li>アプリを削除すると、保存されたデータも削除されます</li>
          </ul>
        </section>

        <section className="section">
          <h2>3. 第三者サービス</h2>

          <div className="service-grid">
            <div className="service-item">
              <h3>📊 Google Analytics</h3>
              <ul>
                <li>アクセス解析のためGoogle Analytics 4を使用しています</li>
                <li>収集される情報：ページビュー、イベント、大まかな地域情報</li>
                <li>個人を特定できる情報は収集していません</li>
                <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Analyticsプライバシーポリシー</a></li>
              </ul>
            </div>

            <div className="service-item">
              <h3>🤖 Gemini API（Google）</h3>
              <ul>
                <li>アイテム鑑定処理にGoogle Gemini APIを使用しています</li>
                <li>画像データは鑑定処理のみに使用され、保存されません</li>
                <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google APIプライバシーポリシー</a></li>
              </ul>
            </div>

            <div className="service-item">
              <h3>☁️ Vercel（ホスティング）</h3>
              <ul>
                <li>アプリのホスティングにVercelを使用しています</li>
                <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercelプライバシーポリシー</a></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>4. 情報の共有</h2>

          <h3>4.1 第三者への提供</h3>
          <p>本アプリは、以下の場合を除き、個人情報を第三者に提供しません：</p>
          <ul>
            <li>法令に基づく開示要求がある場合</li>
            <li>利用者の同意がある場合</li>
            <li>アプリの機能提供に必要なAPI連携（鑑定処理等）</li>
          </ul>

          <h3>4.2 匿名統計データ</h3>
          <ul>
            <li>個人を特定できない統計データは、サービス改善のために利用する場合があります</li>
          </ul>
        </section>

        <section className="section">
          <h2>5. セキュリティ</h2>

          <div className="security-grid">
            <div className="security-item">
              <h3>🔐 データ保護</h3>
              <p>適切な技術的・管理的安全対策を実施しています</p>
            </div>
            <div className="security-item">
              <h3>🔒 通信暗号化</h3>
              <p>全ての通信は暗号化（HTTPS）されています</p>
            </div>
            <div className="security-item">
              <h3>🗑️ データ削除</h3>
              <p>アプリを削除すると、端末内の全てのデータが削除されます</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>6. 利用者の権利</h2>

          <h3>6.1 データの管理</h3>
          <ul>
            <li>端末内のデータは利用者が完全に管理できます</li>
            <li>ブラウザの設定でローカルストレージを削除できます</li>
          </ul>

          <h3>6.2 Analytics の無効化</h3>
          <ul>
            <li>ブラウザの設定やアドブロッカーでGoogle Analyticsを無効にできます</li>
          </ul>
        </section>

        <section className="section">
          <h2>7. 年齢制限</h2>
          <ul>
            <li>本アプリは13歳未満の利用者を対象としていません</li>
            <li>13歳未満の方は保護者の同意のもとでご利用ください</li>
          </ul>
        </section>

        <section className="section">
          <h2>8. プライバシーポリシーの変更</h2>
          <ul>
            <li>本ポリシーは必要に応じて変更される場合があります</li>
            <li>重要な変更がある場合は、アプリ内で通知します</li>
          </ul>
        </section>

        <section className="section">
          <h2>9. お問い合わせ</h2>
          <p>プライバシーに関するご質問やご懸念は、以下の連絡先までお気軽にお問い合わせください：</p>
          <div className="contact-info">
            <p><strong>連絡先</strong>: <a href="/contact">📧 お問い合わせページ</a></p>
          </div>
        </section>

        <div className="policy-info">
          <hr />
          <p><strong>最終更新日</strong>: 2025年6月15日</p>
          <p><strong>アプリ名</strong>: 魔法アイテム図鑑</p>
          <p><strong>バージョン</strong>: 1.0.0</p>
        </div>
      </main>

      <nav className="navigation">
        <a href="/" className="nav-link home">🏠 ホームに戻る</a>
        <a href="/contact" className="nav-link contact">📧 お問い合わせ</a>
      </nav>

      <style jsx>{`
        .privacy-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #e0e0e0;
          font-family: 'Georgia', serif;
          padding: 2rem;
        }

        .privacy-header {
          text-align: center;
          margin-bottom: 3rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .privacy-header h1 {
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

        .privacy-content {
          max-width: 800px;
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

        .section h3 {
          color: #ffb347;
          font-size: 1.2rem;
          margin: 1.5rem 0 1rem 0;
        }

        .section ul {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .section li {
          margin-bottom: 0.5rem;
        }

        .section p {
          margin-bottom: 1rem;
        }

        .highlight-box {
          background: rgba(255, 128, 0, 0.1);
          border: 2px solid #ff8000;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }

        .highlight-box h3 {
          color: #ff8000;
          margin-top: 0;
        }

        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 1.5rem 0;
        }

        .service-item {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #666;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .service-item h3 {
          color: #ffb347;
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .service-item ul {
          padding-left: 1.2rem;
          margin: 1rem 0;
        }

        .security-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .security-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #555;
          border-radius: 6px;
          padding: 1rem;
          text-align: center;
        }

        .security-item h3 {
          color: #ffb347;
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .security-item p {
          margin: 0;
          font-size: 0.9rem;
        }

        .contact-info {
          text-align: center;
          margin: 2rem 0;
        }

        .policy-info {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #555;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          margin-top: 2rem;
        }

        .policy-info p {
          margin: 0.5rem 0;
          color: #ccc;
        }

        .policy-info hr {
          border: none;
          border-top: 1px solid #444;
          margin: 0 0 1rem 0;
        }

        .navigation {
          max-width: 800px;
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

        .nav-link.contact {
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

        .nav-link.contact:hover {
          background: rgba(255, 128, 0, 0.1);
        }

        a {
          color: #ff8000;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        a:hover {
          color: #ffb347;
          text-decoration: underline;
        }

        strong {
          color: #ffb347;
        }

        @media (max-width: 768px) {
          .privacy-container {
            padding: 1rem;
          }

          .privacy-header h1 {
            font-size: 2rem;
          }

          .section {
            padding: 1.5rem;
          }

          .service-grid,
          .security-grid {
            grid-template-columns: 1fr;
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