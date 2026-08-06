# CLAUDE.md

このリポジトリで作業する際のルール。

## アイコンは Material Symbols Rounded で統一する

- 画面に表示するアイコンは絵文字をそのまま出さず、`js/app.js` 先頭の `FLAT_ICONS`（絵文字 → SVG）に変換した上で表示する。
- アイコンの出典は [Material Symbols（Roundedスタイル）](https://fonts.google.com/icons?icon.style=Rounded)。新しいアイコンが必要な場合は
  `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/<アイコン名>/default/24px.svg`
  からSVGを取得し、`<svg ${SVG_ATTRS}>`（`viewBox="0 -960 960 960"`・`fill="currentColor"`）で包んだpath要素を
  `FLAT_ICONS` に追加する（既存エントリと同じ書式。行末コメントにアイコン名を残す）。呼び出し側では `iconFor(絵文字)` 経由で参照する。
- アイコンフォント（Web Font）は読み込まない。SVGパスの埋め込みのみ（オフラインPWA対応のため）。
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

## 旅程データの説明文に「過去の経緯」を書かない

旅程（`days` の `title`・`description` 等、サイトに表示される文言）は**現在のプランをそのまま記述する**。
プラン変更の経緯（例:「広島城はスキップし」「従来比45分前倒し」「旧プランでは〜」）を持ち込まない。
利用者（家族）には変更前のプランは見えておらず、経緯の説明はノイズになる。
検討の経緯・比較・理由は `travel_plan*.md` などの検討メモ側に書く。

## Googleマップのリンクは地点の共有リンクを使う

`spot.mapUrl`（`lodging[].spot.mapUrl` / 各イベントの `spot.mapUrl`）には、`https://www.google.com/maps?q=緯度,経度`
のような**座標から機械的に組み立てたリンクではなく**、Googleマップで実際にその地点を検索・共有して得られる
**共有リンク**（`https://maps.app.goo.gl/...` 形式）を使う。`mapUrl` が指定されていないスポットは
`js/app.js` が `lat`/`lng` から座標リンクを自動生成してフォールバックするが、これはあくまで暫定表示であり、
可能な限り共有リンクに置き換えること。
