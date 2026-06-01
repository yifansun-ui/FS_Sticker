# LPコメント機能 - GitHub Pages 対応版

クライアントがLP上でピン留めコメントを書いて、あなたが GitHub Issues に投稿し、投稿済みコメントを **全員に見える化** する仕組みです。

## 仕組み

```
クライアント側（LP）
├─ コメント追加 → ピン留め
├─ 「📤 送信待ち」ボタン
└─ admin.html へ移動

↓

あなた側（admin.html）
├─ コメント一覧を確認
├─ GitHub PAT を入力
├─ 「📤 選択を GitHub に投稿」
├─ GitHub Issues に自動投稿
└─ 「📥 投稿済み JSON をダウンロード」

↓ あなたが comments-posted.json を GitHub にアップロード

↓

すべてのクライアント（LP）
└─ 投稿済みコメント（緑色ピン）を自動表示 ✓
```

## セットアップ

### 1. ファイルを GitHub リポジトリに配置

```bash
your-repo/
├── index.html          ← あなたのLP（1行追加）
├── comments.js         ← 追加
├── admin.html          ← 追加
├── comments-posted.json ← 後で自動生成（初回は不要）
└── README.md           ← 追加（任意）
```

### 2. index.html を編集

`</body>` タグの直前に1行追加：

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

### 4. LP にアクセス

https://yifansun-ui.github.io/FS_Sticker/

右上に白いツールバーが出ます。

## 使い方

### クライアント側（LP）

1. **「💬 コメント追加」** をクリック
2. **カーソルが十字になる**
3. **LPの好きな場所をクリック**
4. **コメント内容を入力**
5. **赤いピン（未送信）が立つ**
6. **「📤 送信待ち」ボタンをクリック** → admin.html へ移動
7. **投稿後、ページをリロード** → 投稿済みコメント（緑色ピン✓）が表示される

### あなた側（admin.html）

1. **https://yifansun-ui.github.io/FS_Sticker/admin.html** を開く
2. **GitHub PAT を入力**
   - 持ってない？ → https://github.com/settings/tokens でスコープ `repo` で作成
3. **「📤 選択を GitHub に投稿」** をクリック
4. **GitHub Issues に自動投稿される**
5. **「📥 投稿済み JSON をダウンロード」** をクリック
6. **ダウンロードされた `comments-posted.json` をリポジトリにアップロード**
   ```bash
   git add comments-posted.json
   git commit -m "Update posted comments"
   git push
   ```

### GitHub Issues で確認

- https://github.com/yifansun-ui/FS_Sticker/issues
- 各 Issue に投稿者・位置・コメント内容が記録される

## データについて

- **クライアント側のコメント** → ブラウザの `localStorage`（送信待ち）
- **投稿済みコメント** → `comments-posted.json`（GitHub に保存）
- **全員が見える** → LP側が起動時に `comments-posted.json` を自動読み込み

## FAQs

### Q. クライアント側で「送信」とは？

A. 「送信」ボタンを押すと admin.html へ移動します。あなたがそこで GitHub Issues に投稿すると、投稿済み JSON をダウンロードして GitHub にアップロードすることで、全員に見える化します。

### Q. 複数ページのLPでも使える？

A. はい。各ページに `<script src="comments.js"></script>` を1行追加すれば、全ページで使えます。

### Q. `comments-posted.json` をアップロードすることが大事？

A. はい。このファイルをアップロードすると、すべてのクライアントがそれを読み込んで投稿済みコメント（緑色ピン）を自動表示します。アップロードしないと、クライアント側では「送信待ち」のままです。

### Q. PAT をいちいち入力したくない

A. `admin.html` を開くたびに一度は入力が必要です。ブラウザに自動保存されるので、次回以降は自動入力されます。

## トラブルシューティング

### コメント機能が出ない

- ブラウザの localStorage が有効か確認
- `comments.js` が同じフォルダに存在するか確認
- ブラウザコンソール（F12）でエラーがないか確認

### GitHub 投稿でエラー

- PAT が有効か確認（Settings > Developer settings > Personal access tokens）
- PAT のスコープに `repo` が含まれているか確認
- PAT の有効期限が切れていないか確認

### 投稿済みコメントが見えない

- `comments-posted.json` が GitHub にアップロードされているか確認
- ファイル名が正確か確認（大文字小文字も区別される）
- ページをリロードして再度アクセスしてください

### ピンの位置がズレる

- 画面の拡大縮小（Zoom）を100%にしてからコメントしてください

## ライセンス

MIT
