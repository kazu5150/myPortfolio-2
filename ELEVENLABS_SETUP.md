# ElevenLabs Conversational AI ウィジェット設定ガイド

## Vercel環境での"Permission denied"エラーの解決方法

### 問題の原因
Vercel環境でElevenLabsウィジェットが"Permission denied"エラーを出す主な原因：

1. **ドメイン制限**: ElevenLabsのエージェント設定でドメインのホワイトリストが設定されていない
2. **セキュリティポリシー**: Vercel環境のドメインが許可されていない
3. **CORS設定**: クロスオリジンリクエストが拒否されている

### Embed Codeの取得場所

ElevenLabsダッシュボードの**Widget**タブで、以下の2つのコードスニペットが取得できます：

1. **Scriptタグ**:
   ```html
   <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
   ```

2. **ウィジェット要素**:
   ```html
   <elevenlabs-convai agent-id="YOUR_AGENT_ID"></elevenlabs-convai>
   ```

**Widgetタブでできること**：
- ウィジェットの外観カスタマイズ
- テキストコンテンツの設定
- 言語選択
- カラーやシェイプのブランドマッチング

### 解決手順

#### 1. ElevenLabsダッシュボードでの設定

1. [ElevenLabs Dashboard](https://elevenlabs.io)にログイン
2. 使用しているエージェント（agent_7601k0zm6kdvenrb5d1wn5xptvxb）の設定を開く
3. エージェントが**Public**として設定されていることを確認（すでに確認済み）

4. **Security**タブで以下を設定：
   - "Allowlist"にドメインを追加する際の**重要な注意点**：
     - **プロトコル（http://、https://）を含めない**
     - **末尾のスラッシュ（/）を含めない**
   
   正しい例：
   - ✅ `127.0.0.1:3000` (開発環境 - localhostの代わりにIPアドレスを使用)
   - ✅ `my-portfolio-2-tau-lovat.vercel.app` (Vercelプレビュー環境)
   - ✅ `your-custom-domain.com` (本番環境のカスタムドメイン)
   
   **注意**: `localhost:3000`はドメインとして認識されない場合があるため、代わりに`127.0.0.1:3000`を使用してください。
   
   間違った例：
   - ❌ `http://localhost:3000`
   - ❌ `https://my-portfolio-2-tau-lovat.vercel.app/`
   
   **重要**: ドメインは完全一致で追加する必要があります。サブドメインも個別に追加が必要です。
   例：
   - `example.com`
   - `www.example.com`
   - `app.example.com`

#### 2. コード側の改善（実装済み）

ウィジェットコンポーネントに以下の改善を実装しました：

- エラーハンドリングの追加
- ロード状態の管理
- エラー時にウィジェットを非表示にする機能

#### 3. デバッグ方法

ブラウザのコンソールで以下を確認：

```javascript
// コンソールで確認すべきログ
// 成功時: "ElevenLabs widget loaded successfully"
// 失敗時: "Failed to load ElevenLabs widget"
```

### 追加の確認事項

1. **CORS設定**: ElevenLabsのエージェント設定でCORSが適切に設定されているか確認
2. **SSL証明書**: Vercel環境がHTTPSで動作していることを確認
3. **ブラウザの拡張機能**: 広告ブロッカーなどがウィジェットをブロックしていないか確認

### ローカル開発環境での注意

ElevenLabsのAllowlistは`localhost`や`127.0.0.1`などのローカルアドレスを受け付けない仕様のようです。

**推奨される開発方法**：

1. **Allowlistを一時的に無効化**：
   - 開発時は全てのドメインを削除（空のAllowlist = 全てのドメインを許可）
   - 本番環境にデプロイする前にVercelドメインのみを追加

2. **ngrokなどのトンネリングサービスを使用**：
   - ngrokで一時的な公開URLを作成
   - そのURLをAllowlistに追加
   - 例：`your-temp-domain.ngrok.io`

3. **Vercelプレビュー環境で直接テスト**：
   - ローカルでの動作確認をスキップ
   - Vercelにプッシュしてプレビュー環境でテスト

### それでも解決しない場合

1. **ブラウザのコンソールを確認**:
   - 具体的なエラーメッセージを確認
   - CORSエラーの詳細を確認

2. **Allowlistの設定を確認**:
   - 一時的にAllowlistを空にして、全てのドメインを許可してテスト
   - 問題が解決したら、必要なドメインのみを追加

3. **Vercelのデプロイメント設定**:
   - Vercelのプレビューデプロイメントのドメインが変わる場合があるので注意
   - 本番環境のカスタムドメインでテストすることを推奨

4. **新しいエージェントを作成**:
   - 現在のエージェントに問題がある場合は、新しいエージェントを作成して試す

### 注意事項

- **認証設定について**: 現在のElevenLabsのインターフェースでは、Advancedタブに「Authentication」の明示的な無効化オプションは表示されていません。エージェントが「Public」として設定されていれば、ウィジェットは動作するはずです。

- **プレビューモードでの制限**: Wixなどのプレビューモードでは動作しない場合があります。実際にデプロイされたドメインでテストしてください。

### 参考リンク

- [ElevenLabs Conversational AI Documentation](https://elevenlabs.io/docs/conversational-ai/overview)
- [Widget Customization Guide](https://elevenlabs.io/docs/conversational-ai/customization/widget)
- [Next.js Integration Guide](https://elevenlabs.io/docs/conversational-ai/guides/quickstarts/next-js)