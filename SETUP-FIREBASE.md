# Firebase セットアップ手順（所要 約30分・カード登録不要）

サイトの編集モードを有効にするための設定です。Googleアカウントがあれば無料で完了します。

## 1. Firebaseプロジェクトを作成

1. https://console.firebase.google.com を開き、Googleアカウントでログイン
2. 「プロジェクトを作成」をクリック
3. プロジェクト名：`hiroshima-trip`（任意の名前でOK）
4. Googleアナリティクスは **無効** でOK →「プロジェクトを作成」

## 2. Firestore データベースを作成

1. 左メニューの「構築」→「**Firestore Database**」
2. 「データベースを作成」をクリック
3. ロケーション：**asia-northeast1（東京）** を選択
4. セキュリティルール：「**本番環境モード**」を選択して作成

## 3. セキュリティルールを設定

1. Firestore画面の「**ルール**」タブを開く
2. 中身をすべて消して、以下を貼り付ける：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 旅程データ（1ドキュメントのみ読み書き許可）
    match /trip/main {
      allow read, write: if true;
    }
    // アップロード画像（サイズ上限つき）
    match /images/{imageId} {
      allow read: if true;
      allow create: if request.resource.data.data is string
                    && request.resource.data.data.size() < 950000;
      allow delete: if true;
    }
  }
}
```

3. 「**公開**」をクリック

> ⚠️ このルールは「URLを知っている人は誰でも編集できる」設定です（家族向けサイトとしての割り切り）。

## 4. ウェブアプリを登録して設定値を取得

1. 左上の歯車アイコン →「**プロジェクトの設定**」
2. 下の方の「マイアプリ」で **`</>`（ウェブ）** アイコンをクリック
3. アプリのニックネーム：`hiroshima-site`（任意）→「アプリを登録」
   - Firebase Hosting のチェックは **不要**
4. 表示されるコードの中の `firebaseConfig = { ... }` の部分（apiKey〜appIdまで）を**コピーして共有してください**

```js
// この部分だけあればOK
const firebaseConfig = {
  apiKey: "AIza....",
  authDomain: "hiroshima-trip.firebaseapp.com",
  projectId: "hiroshima-trip",
  storageBucket: "hiroshima-trip.appspot.com",
  messagingSenderId: "...",
  appId: "1:..."
};
```

> この設定値は公開サイトに埋め込む前提のもので、秘密情報ではありません（アクセス制御はステップ3のルールが担います）。

## 5. 設定値の反映（こちらで実施）

受け取った設定値を `js/firebase-config.js` に反映してプッシュします。反映後：

- サイト初回アクセス時に `data/itinerary.json` の内容が自動でFirestoreへ投入されます
- 「旅程と地図」の見出し右に **「編集」ボタン** が表示されます
- 以後の旅程データはFirestoreが本体になります（JSONは接続失敗時のフォールバック）
