# ⛩️ 広島・宮島 2泊3日 旅のしおり

家族旅行用の旅行プランサイトです。旅程タイムラインと地図（Leaflet + OpenStreetMap）を内包しています。

🔗 **サイト:** https://morinaoden.github.io/hiroshima/

## 旅程の編集方法

旅程はすべて [`data/itinerary.json`](data/itinerary.json) に入っています。このファイルを編集して push するだけでサイトに反映されます。

### イベントの形式

```json
{
  "time": "10:00",
  "icon": "🛬",
  "title": "広島空港に到着",
  "description": "補足説明（空文字でもOK）",
  "spot": { "name": "広島空港", "lat": 34.4361, "lng": 132.9195 }
}
```

- `spot` を `null` にすると地図にピンを立てません（移動・チェックアウトなど）
- 緯度経度は Google マップで場所を右クリックするとコピーできます

## 構成

| ファイル | 役割 |
|---|---|
| `index.html` | ページ本体 |
| `css/style.css` | デザイン（和モダン） |
| `js/app.js` | タイムライン・地図の描画ロジック |
| `data/itinerary.json` | **旅程データ（編集はここ）** |

ビルド不要の静的サイトです。GitHub Pages でそのまま公開できます。
