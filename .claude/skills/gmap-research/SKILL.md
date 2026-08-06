---
name: gmap-research
description: "playwright-cliのヘッドレスブラウザ（未ログイン）でGoogle Mapsを検索し、調査の元データを取得するスキル。車・公共交通の所要時間/距離/ルート候補の取得、出発・到着時刻指定の交通量込み見積もり、スポットの営業時間・住所・定休日の確認で使用する。「Google Mapsで調べて」「所要時間を実測して」「移動時間の根拠を取って」「営業時間を確認して」等で発動。ユーザーのChromeへのattachが必要な操作は playwright-attach を使う。"
---

# Google Maps ヘッドレス調査（playwright-cli）

playwright-cli のヘッドレスブラウザで Google Maps を検索し、所要時間・ルート・スポット情報を取得する。
未ログインでOK。ユーザーのChromeには触れない（attachしない）。

## 前提

- `@playwright/cli` がインストール済み（確認: `playwright-cli --version`）
- `open` はデフォルトでヘッドレス起動（`--headed` を付けない）
- セッション名は `-s=gmap` などタスクごとに固定し、以降の全コマンドに付ける

## Phase 1: セッション開始と検索URL

検索語は必ずURLエンコードする（日本語をそのまま埋め込まない）。

### A. 経路検索（所要時間・距離・ルート候補）

```bash
playwright-cli -s=gmap open "https://www.google.com/maps/dir/?api=1&origin=<出発地>&destination=<目的地>&travelmode=driving" --browser=chrome
```

- `travelmode`: `driving` / `transit` / `walking` / `bicycling`
- 出発地・目的地は施設名（例: `大和ミュージアム`）で可。曖昧な地名は「施設名+市区町村」で絞る
- 座標指定も可: `origin=34.2415,132.5557`

### B. スポット検索（営業時間・住所・定休日）

```bash
playwright-cli -s=gmap goto "https://www.google.com/maps/search/?api=1&query=<店名・施設名+地名>"
```

2回目以降の検索は `open` ではなく `goto` でページ遷移する。

## Phase 2: 結果の抽出

描画完了を待ってから `find` で抽出する（`sleep 4` 程度。結果が空なら追加で待って再実行）:

```bash
# 経路: 所要時間の一覧（移動手段タブ + ルート候補）
playwright-cli -s=gmap find "分"
# 経路: ルート候補の詳細（時間・距離・経由道路・交通状況・有料区間警告）
playwright-cli -s=gmap find "経由"
# スポット: 営業時間・営業状態
playwright-cli -s=gmap find "営業"
```

取得できる情報の例:

- `運転 55 分 42.6 km 広島呉道路 と 国道2号 経由 最速ルート（通常の交通量）このルートには有料区間が含まれます`
- 第2・第3ルート候補も同様に取得可能
- スポット: `営業時間外 · 営業開始: 11:00`、住所、ウェブサイト

`find` で拾えない場合は `snapshot` で全体を取り、ref を特定して `click` で展開する（例: 「詳しい営業時間を見る」ボタン → 曜日別営業時間）。

## Phase 3: 出発・到着時刻の指定（交通量込みの見積もり）

経路検索ページで時刻を指定すると「通常 45 分～1 時間 5 分・13:35 頃に到着」のような幅付き見積もりが得られる。旅程のシビアな区間検証に使う。

```bash
playwright-cli -s=gmap find "すぐに出発"        # ボタンのrefを取得
playwright-cli -s=gmap click <ref>              # メニュー展開
playwright-cli -s=gmap find "出発時刻"           # 「出発時刻」「到着時刻」のrefを取得
playwright-cli -s=gmap click <ref>
playwright-cli -s=gmap snapshot | grep textbox   # 時刻textboxのrefを特定（例: "7:50"）
playwright-cli -s=gmap fill <ref> "12:30"
playwright-cli -s=gmap press Enter
sleep 4 && playwright-cli -s=gmap find "経由"
```

- 日付は時刻textbox付近の日付ピッカーで変更（snapshotでrefを特定）
- 制約: 出発時刻指定と複数目的地（経由地）は併用できない

## Phase 4: 終了

```bash
playwright-cli -s=gmap close
```

## 報告時の注意

- 時刻未指定の所要時間は「通常の交通量」ベースの点推定。旅程判断に使うときは Phase 3 の幅付き見積もりを優先し、**上限側**で計画する
- 取得値は「Google Maps 実測（取得日時・条件付き）」として出典明記する。手書きの見積もり値と混同しない
- 検索結果が複数候補に割れた場合（同名施設など）はページタイトル・住所で対象を確認してから値を使う

## 禁止事項

- ユーザーのChromeへのattach（それが必要なら playwright-attach を使う）
- `--headed` での起動（本スキルはヘッドレス前提。画面確認が必要なら screenshot で代替）
- ログインが必要な操作（タイムライン、保存済みリスト等）への流用
