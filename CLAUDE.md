# CLAUDE.md

このリポジトリで作業する際のルール。

## アイコンはフラットデザインで統一する

- 画面に表示するアイコンは絵文字をそのまま出さず、`js/app.js` 先頭の `FLAT_ICONS`（絵文字 → SVGパス）に変換した上で表示する。
- 新しいアイコンが必要な場合は、他のエントリと同じ書式（`SVG_ATTRS` を使った 24x24 のストローク線画、`fill="none"`）で `FLAT_ICONS` に追加し、呼び出し側では `iconFor(絵文字)` 経由で参照する。
- HTML の `innerHTML` に絵文字を直接埋め込まない（例: `${n.icon}` ではなく `${iconFor(n.icon)}`）。

## data/itinerary.json を編集しても本番表示は変わらない（重要）

このサイトのデータ本体は **Firestore（`trip/main` ドキュメント）** であり、`data/itinerary.json` は
「Firestoreにドキュメントがまだ存在しない場合の初回シード」にしか使われない（`js/app.js` の
`initDataLayer` 参照）。既に旅行の準備が始まっており `trip/main` は作成済みのため、
**`itinerary.json` だけを書き換えてコミット・pushしても、公開サイトの表示は一切変わらない。**
サービスワーカーのキャッシュとは別問題なので、`CACHE_VERSION` を上げても解決しない。

- 旅程（`days`）や`packingList`などの内容を変更してサイトに反映したい場合は、`itinerary.json`を
  更新するのに加えて **Firestoreの`trip/main`ドキュメントも直接更新する** 必要がある。
- Firestoreへの読み書きは認証なしで許可されている（`allow read, write: if true` — 詳細は
  `SETUP-FIREBASE.md`）。プロジェクトIDとAPIキーは `js/firebase-config.js` にある（公開情報）。
  REST API（`https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/trip/main`）
  で直接GET/PATCHできる。
- **絶対に文書全体を上書きしない。** `lodging[].roomNumber` や `lodging[].wifi` は、サイトの編集画面から
  家族が個別に入力した実データが入っていることがあり（`itinerary.json`側は`"TBD（未入力）"`のプレース
  ホルダのまま）、これを持つ現在の値をFirestoreから一度読み出し、変更したいフィールド（例:
  `days`・`packingList`）だけを `updateMask.fieldPaths` で指定してPATCHし、他のフィールドには触れないこと。

## Googleマップのリンクは地点の共有リンクを使う

`spot.mapUrl`（`lodging[].spot.mapUrl` / 各イベントの `spot.mapUrl`）には、`https://www.google.com/maps?q=緯度,経度`
のような**座標から機械的に組み立てたリンクではなく**、Googleマップで実際にその地点を検索・共有して得られる
**共有リンク**（`https://maps.app.goo.gl/...` 形式）を使う。`mapUrl` が指定されていないスポットは
`js/app.js` が `lat`/`lng` から座標リンクを自動生成してフォールバックするが、これはあくまで暫定表示であり、
可能な限り共有リンクに置き換えること。
