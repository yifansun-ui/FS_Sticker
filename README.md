# LPコメント機能 - 最速版

クライアントが LP でコメント → JSON ダウンロード → あなたがワンクリック → GitHub Issues 自動作成

## 仕組み

```
クライアント側（LP）
├─ コメント追加 → ピン立つ
└─ 「📥 送信」ボタン → JSON ダウンロード

あなた側（admin.html）
├─ JSON をアップロード（ドラッグ&ドロップ）
├─ Token を入力
└─ 「🚀 Issues を作成」ボタン → 全部自動作成
```

## セットアップ（5分）

### 1. ファイルを GitHub リポジトリに配置

```
FS_Sticker/
├── index.html          ← 既存
├── comments.js         ← 追加
├── admin.html          ← 追加
└── README.md           ← 任意
```

### 2. index.html を編集

`</body>` の直前に1行追加：

```html
<script src="comments.js"></script>
</body>
```

### 3. GitHub に push

```bash
cd FS_Sticker
git add comments.js admin.html README.md index.html
git commit -m "Add LP comment feature"
git push
```

## 使い方

### クライアント側（LP を見ている人）

1. **「💬 コメント」** ボタン → ピン立て
2. **「📥 送信」** ボタン → JSON ダウンロード（完全自動）

### あなた側（管理画面）

1. **admin.html** を開く
   - URL: https://yifansun-ui.github.io/FS_Sticker/admin.html
2. **JSON ファイルをドラッグ&ドロップ**（または「選択」ボタン）
3. **GitHub Token を入力**
   - https://github.com/settings/tokens で「Generate new token」
   - スコープ: `repo` にチェック
   - Token をコピペ
4. **「🚀 Issues を作成」** ボタン → 完全自動作成

## GitHub Issues 確認

https://github.com/yifansun-ui/FS_Sticker/issues

全員のコメントが Issues として作成されます。

## ポイント

✅ **クライアント側は簡単** - 「📥 送信」ボタンクリック → JSON 自動ダウンロード
✅ **あなた側はワンクリック** - JSON アップロード → Issues 全自動作成
✅ **Token は秘密** - ブラウザに保存（サーバーに送信されない）
✅ **GitHub Issues で管理** - 公開・検索・返信が可能

## FAQs

### Q. クライアント側で「送信」ボタンは？

A. クリックすると自動的に JSON（lp-feedback.json）がダウンロードされます。それをあなたに送付（メール・Slack など）してください。

### Q. Token をどうやって作る？

A. 
1. https://github.com/settings/tokens にアクセス
2. 「Generate new token (classic)」
3. Name: `FS_Sticker_comments` など
4. Scope: `repo` にチェック
5. 「Generate token」
6. 表示されたトークンをコピー

### Q. 複数ページのLPでも使える？

A. はい。各ページに `<script src="comments.js"></script>` を追加すれば OK。

### Q. コメント内容を修正したい

A. JSON ファイルをテキストエディタで編集 → もう一度アップロード

## トラブルシューティング

### JSON ファイルが作成されない

- ブラウザの localStorage が有効か確認
- `comments.js` が読み込まれているか確認（F12 → Console でエラー確認）

### Issues が作成されない

- Token が正しいか確認
- Token に `repo` スコープがあるか確認
- GitHub が正しく接続されているか確認（画面に「Error」と出ないか）

### ポップアップブロッカーが出た

- ブラウザの設定でポップアップを許可してください

## ライセンス

MIT
