# LPコメント機能 - GitHub Pages 対応版

LP上でピン留めコメントを書いて、GitHub Issues に投稿できる仕組みです。

## 仕組み

```
クライアント側（LP）
├─ コメント追加ボタンをクリック
├─ LPをピン留め
└─ ローカルストレージに保存

↓

あなた側（管理画面）
├─ admin.html を開く
├─ コメント一覧を確認
├─ GitHub PAT を入力
└─ 「投稿」ボタン → GitHub Issues に自動投稿
```

## セットアップ

### 1. ファイルを GitHub リポジトリに配置

```bash
your-repo/
├── index.html          ← あなたのLP（1行追加）
├── comments.js         ← 追加
├── admin.html          ← 追加
└── README.md           ← 追加（任意）
```

### 2. index.html を編集

`</body>` タグの直前に1行追加：

```html
<script src="comments.js"></script>
</body>
```

例：
```html
  <!-- 既存の内容 -->
  <script src="comments.js"></script>
</body>
```

### 3. GitHub に push

```bash
git add comments.js admin.html index.html
git commit -m "Add comment feature"
git push
```

### 4. LP にアクセス

https://yifansun-ui.github.io/FS_Sticker/

右上に白いツールバーが出ます。

## 使い方

### LP

1. **「💬 コメント追加」** をクリック
2. **カーソルが十字になる**
3. LPの好きな場所をクリック
4. **コメント内容を入力**
5. **赤いピンが立つ**（複数OK、スクロール先のどこでもOK）
6. ピンをクリックして内容確認・削除可能
7. **クライアントはここまで** → 投稿ボタンはない

### 管理画面

1. **https://yifansun-ui.github.io/FS_Sticker/admin.html** を開く
2. **GitHub PAT を入力**（Token フィールド）
   - 持ってない？ → https://github.com/settings/tokens でスコープ `repo` で作成
3. **コメント一覧を確認**
4. **「📤 選択を GitHub に投稿」** をクリック
5. クリックすると自動的に Issues に投稿される
6. ポップアップで完了確認

### GitHub Issues で確認

- https://github.com/yifansun-ui/FS_Sticker/issues
- 各 Issue に投稿者・位置・コメント内容が記録される

## データについて

- **クライアントが書いたコメント** → ブラウザの `localStorage` に保存
- **同じブラウザのどのタブからでもアクセス可能**
- **削除されるまで保持** → 複数回投稿できます
- **GitHub に投稿済みのコメント** → ピンが緑色になる

### コメント機能が出ない

- ブラウザの localStorage が有効か確認
- `comments.js` が同じフォルダに存在するか確認
- ブラウザコンソール（F12）でエラーがないか確認

### GitHub 投稿でエラー

- PAT が有効か確認（Settings > Developer settings > Personal access tokens）
- PAT のスコープに `repo` が含まれているか確認
- PAT の有効期限が切れていないか確認

### ピンの位置がズレる

- 画面の拡大縮小（Zoom）を100%にしてからコメントしてください
- ページのレイアウトが変わるとピンの位置も変わります

## ライセンス

MIT
