/* 広島・宮島 旅のしおり — アプリロジック
   データ本体: Firebase Firestore（js/firebase-config.js が設定済みの場合）
   フォールバック: data/itinerary.json（Firebase未設定でも従来どおり表示）
   絵文字アイコンは FLAT_ICONS でフラットSVGに変換されます */

import firebaseConfig from "./firebase-config.js";

// ---- フラットSVGアイコン（絵文字 → SVG 変換マップ） ----
const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

const FLAT_ICONS = {
  "🛬": `<svg ${SVG_ATTRS}><path d="M2 22h20"/><path d="M3.77 10.77 2 9l2-4.5 1.1.55c.55.28.9.84.9 1.45s.35 1.17.9 1.45L8 8.5l3-6 1.05.53a2 2 0 0 1 1.09 1.52l.72 5.4a2 2 0 0 0 1.09 1.52l4.4 2.2c.42.22.78.55 1.01.96l.6 1.03c.49.88-.06 1.98-1.06 2.1a5 5 0 0 1-2.07-.2L4.92 14.7a2.4 2.4 0 0 1-1.15-3.93Z"/></svg>`,
  "🛫": `<svg ${SVG_ATTRS}><path d="M2 22h20"/><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.4 2.4 0 0 1 3.2 1.06l.24.5a2.4 2.4 0 0 1-.91 3.06l-12.8 7.5a2 2 0 0 1-1.67.19Z"/></svg>`,
  "🚗": `<svg ${SVG_ATTRS}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
  "🥢": `<svg ${SVG_ATTRS}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  "🕊️": `<svg ${SVG_ATTRS}><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/></svg>`,
  "🏯": `<svg ${SVG_ATTRS}><path d="M12 3 5.5 7h13L12 3Z"/><path d="M7 7v3"/><path d="M17 7v3"/><path d="M4.5 10h15l-2 3h-11l-2-3Z"/><path d="M7 13v4"/><path d="M17 13v4"/><path d="M5 17h14v4H5z"/></svg>`,
  "🏨": `<svg ${SVG_ATTRS}><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
  "🍽️": `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>`,
  "⚓": `<svg ${SVG_ATTRS}><circle cx="12" cy="5" r="3"/><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`,
  "☕": `<svg ${SVG_ATTRS}><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2"/><path d="M10 2v2"/><path d="M14 2v2"/></svg>`,
  "🅿️": `<svg ${SVG_ATTRS}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
  "🚢": `<svg ${SVG_ATTRS}><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/></svg>`,
  "🍷": `<svg ${SVG_ATTRS}><path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>`,
  "🌙": `<svg ${SVG_ATTRS}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  "⛩️": `<svg ${SVG_ATTRS}><path d="M4 5c2.7.7 5.3 1 8 1s5.3-.3 8-1"/><path d="M4.5 5.2 5 9"/><path d="M19.5 5.2 19 9"/><path d="M5 9h14"/><path d="M6 9l.7 12"/><path d="M18 9l-.7 12"/><path d="M12 6v3"/><path d="M5.6 13.5h12.8"/></svg>`,
  "🍳": `<svg ${SVG_ATTRS}><circle cx="10" cy="12" r="7"/><circle cx="10" cy="12" r="2.5"/><path d="M17 12h5"/></svg>`,
  "🚡": `<svg ${SVG_ATTRS}><path d="M2 7c6.7-2 13.3-2 20-3"/><path d="M12 5.8V10"/><rect x="7" y="10" width="10" height="8" rx="1.5"/><path d="M12 10v8"/></svg>`,
  "🍰": `<svg ${SVG_ATTRS}><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>`,
  "⛽": `<svg ${SVG_ATTRS}><path d="M3 22h12"/><path d="M4 9h10"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>`,
  "🧳": `<svg ${SVG_ATTRS}><rect x="5" y="7" width="14" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M9 11v5"/><path d="M15 11v5"/></svg>`,
  "🛍️": `<svg ${SVG_ATTRS}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  "📍": `<svg ${SVG_ATTRS}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  "✕": `<svg ${SVG_ATTRS}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
};

const EDIT_ICONS = {
  up: `<svg ${SVG_ATTRS}><path d="m18 15-6-6-6 6"/></svg>`,
  down: `<svg ${SVG_ATTRS}><path d="m6 9 6 6 6-6"/></svg>`,
  edit: `<svg ${SVG_ATTRS}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
  trash: `<svg ${SVG_ATTRS}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  plus: `<svg ${SVG_ATTRS}><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
};

// フォームのアイコン選択肢（絵文字キー → 日本語ラベル）
const ICON_LABELS = {
  "🛬": "飛行機（到着）",
  "🛫": "飛行機（出発）",
  "🚗": "車",
  "🥢": "食事（和食）",
  "🍽️": "ディナー",
  "🍳": "朝食",
  "☕": "カフェ",
  "🍰": "スイーツ",
  "🍷": "お酒・ビュッフェ",
  "⛩️": "神社",
  "🏯": "城",
  "🕊️": "平和・祈り",
  "⚓": "港・船の見どころ",
  "🚢": "フェリー",
  "🚡": "ロープウェー",
  "🏨": "ホテル",
  "🅿️": "駐車場",
  "⛽": "給油",
  "🧳": "荷物",
  "🛍️": "買い物",
  "🌙": "夜のおでかけ",
};

function iconFor(emoji) {
  const key = (emoji || "").trim();
  return FLAT_ICONS[key] || FLAT_ICONS[key.replace(/️/g, "")] || key;
}

// ---- 日付ユーティリティ ----
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function parseDate(str) {
  if (!str) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str.trim());
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3]);
}

function dayDiff(from, to) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86400000);
}

function formatDate(d) {
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAYS[d.getDay()]})`;
}

function timeToMinutes(t) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((t || "").trim());
  return m ? +m[1] * 60 + +m[2] : null;
}

// ============================================================
// データ層: Firestore（設定済みなら）/ itinerary.json（フォールバック）
// ============================================================

let data = null;          // 旅程データ本体
let db = null;            // Firestore（未設定なら null）
let tripDocRef = null;
let fs = null;            // Firestore SDK モジュール
let canEdit = false;

async function fetchJsonFallback() {
  const res = await fetch("data/itinerary.json");
  return res.json();
}

async function initDataLayer(onData) {
  if (firebaseConfig) {
    try {
      const appMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
      fs = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      const app = appMod.initializeApp(firebaseConfig);
      db = fs.initializeFirestore(app, {
        localCache: fs.persistentLocalCache(),
      });
      tripDocRef = fs.doc(db, "trip", "main");

      // 初回シード: ドキュメントが無ければ itinerary.json を投入
      const snap = await fs.getDoc(tripDocRef);
      if (!snap.exists()) {
        const seed = await fetchJsonFallback();
        await fs.setDoc(tripDocRef, seed);
      }

      canEdit = true;
      fs.onSnapshot(tripDocRef, (s) => {
        if (s.exists()) onData(s.data());
      });
      return;
    } catch (err) {
      console.error("Firestore初期化に失敗。JSONフォールバックで表示します:", err);
    }
  }
  onData(await fetchJsonFallback());
}

async function saveTrip() {
  if (!canEdit || !tripDocRef) return;
  await fs.setDoc(tripDocRef, data);
}

// アップロード画像（fs:<id>）の解決キャッシュ
const imageCache = new Map();

async function resolveImage(imgEl, src) {
  if (!src.startsWith("fs:")) {
    imgEl.src = src;
    return;
  }
  const id = src.slice(3);
  // データURLはネットワークコストがないため lazy を外す
  // （detached要素にlazy+data URLを設定すると読み込まれないブラウザ挙動への対策も兼ねる）
  imgEl.loading = "eager";
  if (imageCache.has(id)) {
    imgEl.src = imageCache.get(id);
    return;
  }
  if (!db) { imgEl.closest(".timeline-photo")?.remove(); return; }
  try {
    const snap = await fs.getDoc(fs.doc(db, "images", id));
    if (snap.exists()) {
      imageCache.set(id, snap.data().data);
      imgEl.src = snap.data().data;
    } else {
      imgEl.closest(".timeline-photo")?.remove();
    }
  } catch {
    imgEl.closest(".timeline-photo")?.remove();
  }
}

// 画像を縮小してdata URLへ（長辺800px・目安150KB以下）
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("読み込み失敗"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("画像を解釈できません"));
      img.onload = () => {
        const MAX = 800;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        let quality = 0.75;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        // Firestoreの1MB制限に対して余裕を持たせる（base64で約900KB上限）
        while (dataUrl.length > 900 * 1024 && quality > 0.3) {
          quality -= 0.15;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadImage(dataUrl) {
  const ref = await fs.addDoc(fs.collection(db, "images"), {
    data: dataUrl,
    createdAt: Date.now(),
  });
  return `fs:${ref.id}`;
}

// ============================================================
// メイン
// ============================================================

const startOfToday = new Date();
let startDate = null;
let tripDayIndex = null;
let currentDayIndex = 0;
let editMode = false;

// ---- 地図 ----
const map = L.map("map", { scrollWheelZoom: true });
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
map.setView([34.34, 132.45], 10);

const markerLayer = L.layerGroup().addTo(map);
const routeLayer = L.layerGroup().addTo(map);

function makePin(number) {
  return L.divIcon({
    className: "pin-marker",
    html: `<div class="pin-inner"><span>${number}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  });
}

// ---- モバイル用ボトムシート ----
const mapPane = document.getElementById("map-pane");
const mapToggle = document.getElementById("map-toggle");
const mapClose = document.getElementById("map-close");
const isMobile = () => window.matchMedia("(max-width: 880px)").matches;

function openMapSheet() {
  mapPane.classList.add("open");
  mapToggle.setAttribute("aria-expanded", "true");
  setTimeout(() => map.invalidateSize(), 350);
}
function closeMapSheet() {
  mapPane.classList.remove("open");
  mapToggle.setAttribute("aria-expanded", "false");
}
mapToggle.addEventListener("click", () =>
  mapPane.classList.contains("open") ? closeMapSheet() : openMapSheet()
);
mapClose.addEventListener("click", () => {
  if (picking) cancelPick();
  closeMapSheet();
});

// ---- DOM参照 ----
const tabsEl = document.getElementById("day-tabs");
const themeEl = document.getElementById("day-theme");
const timelineEl = document.getElementById("timeline");
const countdownEl = document.getElementById("hero-countdown");
const editToggle = document.getElementById("edit-toggle");
const editToggleLabel = document.getElementById("edit-toggle-label");

function selectItem(li) {
  document
    .querySelectorAll(".timeline-item.selected")
    .forEach((el) => el.classList.remove("selected"));
  if (li) li.classList.add("selected");
}

// ---- ヘッダー・カウントダウン ----
function renderHeader() {
  document.getElementById("site-title").textContent = data.title;
  document.getElementById("site-subtitle").textContent = data.subtitle;
  document.title = `${data.title} ${data.subtitle}`;

  startDate = parseDate(data.startDate);
  tripDayIndex = startDate ? dayDiff(startDate, startOfToday) : null;

  countdownEl.hidden = true;
  if (startDate) {
    const diff = dayDiff(startOfToday, startDate);
    if (diff > 0) {
      countdownEl.textContent = `出発まで あと ${diff} 日`;
      countdownEl.hidden = false;
    } else if (tripDayIndex >= 0 && tripDayIndex < data.days.length) {
      countdownEl.textContent = `旅行 ${tripDayIndex + 1} 日目！`;
      countdownEl.hidden = false;
    }
  }
}

// ---- 日タブ ----
function renderTabs() {
  tabsEl.innerHTML = "";
  data.days.forEach((day, i) => {
    const btn = document.createElement("button");
    btn.className = "day-tab" + (i === currentDayIndex ? " active" : "");
    let label = day.label;
    if (startDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      label += `<small>${formatDate(d)}</small>`;
    }
    btn.innerHTML = label;
    btn.setAttribute("aria-pressed", i === currentDayIndex ? "true" : "false");
    btn.addEventListener("click", () => {
      currentDayIndex = i;
      renderTabs();
      renderDay();
    });
    tabsEl.appendChild(btn);
  });
}

// ---- 編集コントロール生成 ----
function makeEditControls(dayIdx, evIdx, total) {
  const wrap = document.createElement("div");
  wrap.className = "edit-controls";
  wrap.innerHTML = `
    <button type="button" class="ec-btn" data-act="up" title="上へ" ${evIdx === 0 ? "disabled" : ""}>${EDIT_ICONS.up}</button>
    <button type="button" class="ec-btn" data-act="down" title="下へ" ${evIdx === total - 1 ? "disabled" : ""}>${EDIT_ICONS.down}</button>
    <button type="button" class="ec-btn" data-act="edit" title="編集">${EDIT_ICONS.edit}</button>
    <button type="button" class="ec-btn danger" data-act="del" title="削除">${EDIT_ICONS.trash}</button>`;
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".ec-btn");
    if (!btn) return;
    e.stopPropagation();
    const act = btn.dataset.act;
    if (act === "up") moveEvent(dayIdx, evIdx, -1);
    else if (act === "down") moveEvent(dayIdx, evIdx, 1);
    else if (act === "edit") openEditForm(dayIdx, evIdx);
    else if (act === "del") deleteEvent(dayIdx, evIdx);
  });
  return wrap;
}

function makeAddButton(dayIdx, insertAt) {
  const li = document.createElement("li");
  li.className = "timeline-add";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "add-btn";
  btn.innerHTML = `${EDIT_ICONS.plus} ここに予定を追加`;
  btn.addEventListener("click", () => openEditForm(dayIdx, null, insertAt));
  li.appendChild(btn);
  return li;
}

// ---- 日の描画 ----
function renderDay() {
  const day = data.days[currentDayIndex];
  themeEl.textContent = day.theme;

  timelineEl.innerHTML = "";
  markerLayer.clearLayers();
  routeLayer.clearLayers();

  // 「いまここ」判定
  let nowIdx = -1;
  let nextIdx = -1;
  if (tripDayIndex === currentDayIndex) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    day.events.forEach((ev, i) => {
      const t = timeToMinutes(ev.time);
      if (t !== null && t <= nowMin) nowIdx = i;
    });
    if (nowIdx + 1 < day.events.length) nextIdx = nowIdx + 1;
    if (nowIdx === -1) nextIdx = 0;
  }

  let pinCount = 0;
  const routePoints = [];
  let nowLi = null;

  if (editMode) timelineEl.appendChild(makeAddButton(currentDayIndex, 0));

  day.events.forEach((ev, evIdx) => {
    const li = document.createElement("li");
    const hasOptions = Array.isArray(ev.options) && ev.options.length > 0;
    li.className = "timeline-item" + (ev.spot || hasOptions ? " has-spot" : "");
    if (evIdx === nowIdx) { li.classList.add("is-now"); nowLi = li; }

    const metaParts = [];
    if (evIdx === nowIdx) metaParts.push(`<span class="badge-now">いまここ</span>`);
    if (evIdx === nextIdx) metaParts.push(`<span class="badge-next">つぎ</span>`);
    if (ev.badge) metaParts.push(`<span class="badge-note">${ev.badge}</span>`);

    let pinNumber = null;
    if (ev.spot) {
      pinCount += 1;
      pinNumber = pinCount;
      const href = ev.spot.mapUrl || `https://www.google.com/maps?q=${ev.spot.lat},${ev.spot.lng}`;
      metaParts.push(
        `<a class="gmap-link" href="${href}" target="_blank" rel="noopener" title="Googleマップで開く">${iconFor("📍")} ${pinNumber}. ${ev.spot.name} <span class="gmap-ext">↗</span></a>`
      );
    }

    if (hasOptions) {
      ev.options.forEach((opt) => {
        pinCount += 1;
        const num = pinCount;
        const href = opt.mapUrl || `https://www.google.com/maps?q=${opt.lat},${opt.lng}`;
        metaParts.push(
          `<a class="gmap-link" href="${href}" target="_blank" rel="noopener" title="Googleマップで開く">${iconFor("📍")} ${num}. ${opt.name} <span class="gmap-ext">↗</span></a>`
        );
      });
    }

    const photoHtml = ev.image
      ? `<figure class="timeline-photo">
           <img alt="${ev.spot ? ev.spot.name : ev.title}" loading="lazy">
           ${ev.caption ? `<figcaption>${ev.caption}</figcaption>` : ""}
         </figure>`
      : "";

    li.innerHTML = `
      <span class="timeline-time">${ev.time}</span>
      <div class="timeline-dot">${iconFor(ev.icon)}</div>
      <div class="timeline-body">
        <div class="timeline-text">
          <div class="timeline-title">${ev.title}</div>
          ${ev.description ? `<div class="timeline-desc">${ev.description}</div>` : ""}
          ${metaParts.length ? `<div class="timeline-meta">${metaParts.join("")}</div>` : ""}
        </div>
        ${photoHtml}
      </div>`;

    if (editMode) {
      li.classList.add("editable");
      li.prepend(makeEditControls(currentDayIndex, evIdx, day.events.length));
    }

    const img = li.querySelector(".timeline-photo img");
    if (img) {
      img.addEventListener("error", () => img.closest(".timeline-photo")?.remove());
      resolveImage(img, ev.image);
    }

    if (ev.spot) {
      const marker = L.marker([ev.spot.lat, ev.spot.lng], {
        icon: makePin(pinNumber),
      }).addTo(markerLayer);
      marker.bindPopup(
        `<div class="popup-time">${ev.time}</div><div class="popup-name">${ev.spot.name}</div>`
      );
      routePoints.push([ev.spot.lat, ev.spot.lng]);

      li.querySelector(".timeline-text").addEventListener("click", (e) => {
        if (e.target.closest(".gmap-link")) return;
        selectItem(li);
        map.flyTo([ev.spot.lat, ev.spot.lng], 14, { duration: 0.8 });
        marker.openPopup();
        if (isMobile()) openMapSheet();
      });

      marker.on("click", () => {
        if (picking) return;
        selectItem(li);
        if (isMobile()) closeMapSheet();
        li.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    if (hasOptions) {
      const optionPoints = [];
      ev.options.forEach((opt, optIdx) => {
        const num = pinCount - ev.options.length + optIdx + 1;
        const marker = L.marker([opt.lat, opt.lng], { icon: makePin(num) }).addTo(markerLayer);
        marker.bindPopup(
          `<div class="popup-time">${ev.time}</div><div class="popup-name">${opt.name}</div>`
        );
        routePoints.push([opt.lat, opt.lng]);
        optionPoints.push([opt.lat, opt.lng]);

        marker.on("click", () => {
          if (picking) return;
          selectItem(li);
          if (isMobile()) closeMapSheet();
          li.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });

      li.querySelector(".timeline-text").addEventListener("click", (e) => {
        if (e.target.closest(".gmap-link")) return;
        selectItem(li);
        map.flyToBounds(optionPoints, { padding: [60, 60], maxZoom: 15, duration: 0.8 });
        if (isMobile()) openMapSheet();
      });
    }

    timelineEl.appendChild(li);

    if (ev.travelAfter && ev.travelAfter.text && evIdx < day.events.length - 1) {
      const travelLi = document.createElement("li");
      travelLi.className = "timeline-travel";
      travelLi.setAttribute("aria-label", "移動");
      travelLi.innerHTML = `<span class="travel-chip">${iconFor(ev.travelAfter.icon)} ${ev.travelAfter.text}</span>`;
      timelineEl.appendChild(travelLi);
    }

    if (editMode) timelineEl.appendChild(makeAddButton(currentDayIndex, evIdx + 1));
  });

  if (routePoints.length > 1) {
    L.polyline(routePoints, {
      color: "#c8401f",
      weight: 3,
      opacity: 0.7,
      dashArray: "6 9",
      lineCap: "round",
    }).addTo(routeLayer);
  }

  if (routePoints.length > 0 && !picking) {
    map.fitBounds(routePoints, { padding: [46, 46], maxZoom: 13 });
  }

  if (nowLi && !editMode && !renderDay._scrolledToNow) {
    renderDay._scrolledToNow = true;
    setTimeout(() => nowLi.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
  }
}

// ============================================================
// 編集モード
// ============================================================

editToggle.addEventListener("click", () => {
  editMode = !editMode;
  editToggle.classList.toggle("on", editMode);
  editToggle.setAttribute("aria-pressed", editMode ? "true" : "false");
  editToggleLabel.textContent = editMode ? "編集を終了" : "編集";
  document.body.classList.toggle("editing", editMode);
  if (!editMode) hideUndoToast();
  renderDay();
});

// ---- 並べ替え ----
async function moveEvent(dayIdx, evIdx, delta) {
  const events = data.days[dayIdx].events;
  const to = evIdx + delta;
  if (to < 0 || to >= events.length) return;
  [events[evIdx], events[to]] = [events[to], events[evIdx]];
  renderDay();
  await saveTrip();
}

// ---- 削除＋元に戻す ----
const undoToast = document.getElementById("undo-toast");
const undoMessage = document.getElementById("undo-message");
const undoBtn = document.getElementById("undo-btn");
let undoState = null;
let undoTimer = null;

function hideUndoToast() {
  undoToast.hidden = true;
  undoState = null;
  clearTimeout(undoTimer);
}

async function deleteEvent(dayIdx, evIdx) {
  const events = data.days[dayIdx].events;
  const [removed] = events.splice(evIdx, 1);
  undoState = { dayIdx, evIdx, removed };
  undoMessage.textContent = `「${removed.title}」を削除しました`;
  undoToast.hidden = false;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndoToast, 6000);
  renderDay();
  await saveTrip();
}

undoBtn.addEventListener("click", async () => {
  if (!undoState) return;
  const { dayIdx, evIdx, removed } = undoState;
  data.days[dayIdx].events.splice(Math.min(evIdx, data.days[dayIdx].events.length), 0, removed);
  hideUndoToast();
  renderDay();
  await saveTrip();
});

// ---- 編集フォーム ----
const editSheet = document.getElementById("edit-sheet");
const editForm = document.getElementById("edit-form");
const fTime = document.getElementById("f-time");
const fIcon = document.getElementById("f-icon");
const fTitle = document.getElementById("f-title");
const fDesc = document.getElementById("f-desc");
const fDay = document.getElementById("f-day");
const fBadge = document.getElementById("f-badge");
const fSpotName = document.getElementById("f-spot-name");
const fCoords = document.getElementById("f-coords");
const fPick = document.getElementById("f-pick");
const fNoSpot = document.getElementById("f-no-spot");
const fMapUrl = document.getElementById("f-mapurl");
const fTravelIcon = document.getElementById("f-travel-icon");
const fTravelText = document.getElementById("f-travel-text");
const fPhotoPreview = document.getElementById("f-photo-preview");
const fPhotoFile = document.getElementById("f-photo-file");
const fPhotoUrl = document.getElementById("f-photo-url");
const fPhotoRemove = document.getElementById("f-photo-remove");
const fPhotoStatus = document.getElementById("f-photo-status");

// アイコン選択肢を構築
Object.entries(ICON_LABELS).forEach(([emoji, label]) => {
  const opt = document.createElement("option");
  opt.value = emoji;
  opt.textContent = `${emoji} ${label}`;
  fIcon.appendChild(opt);
});

// フォームの一時状態
let formState = null; // { dayIdx, evIdx(null=新規), insertAt, coords: {lat,lng}|null, image: string|null, pendingUpload: dataUrl|null }

function openEditForm(dayIdx, evIdx, insertAt = null) {
  const isNew = evIdx === null;
  const ev = isNew
    ? { time: "12:00", icon: "📍", title: "", description: "", spot: null }
    : data.days[dayIdx].events[evIdx];

  formState = {
    dayIdx,
    evIdx,
    insertAt,
    coords: ev.spot ? { lat: ev.spot.lat, lng: ev.spot.lng } : null,
    image: ev.image || null,
    pendingUpload: null,
  };

  document.getElementById("edit-sheet-title").textContent = isNew ? "予定を追加" : "予定を編集";
  fTime.value = ev.time || "12:00";
  fIcon.value = ICON_LABELS[ev.icon] ? ev.icon : "📍";
  if (!ICON_LABELS[ev.icon] && ev.icon) {
    // データに未知のアイコンがある場合は選択肢に追加して保持
    const opt = document.createElement("option");
    opt.value = ev.icon;
    opt.textContent = ev.icon;
    fIcon.appendChild(opt);
    fIcon.value = ev.icon;
  }
  fTitle.value = ev.title || "";
  fDesc.value = ev.description || "";
  fBadge.value = ev.badge || "";
  fSpotName.value = ev.spot ? ev.spot.name : "";
  fMapUrl.value = ev.spot && ev.spot.mapUrl ? ev.spot.mapUrl : "";
  fNoSpot.checked = !ev.spot;
  fTravelIcon.value = ev.travelAfter ? ev.travelAfter.icon || "" : "";
  fTravelText.value = ev.travelAfter ? ev.travelAfter.text || "" : "";
  fPhotoUrl.value = ev.image && !ev.image.startsWith("fs:") ? ev.image : "";
  fPhotoStatus.textContent = "";
  updateCoordsLabel();
  updatePhotoPreview();

  // 日の選択肢
  fDay.innerHTML = "";
  data.days.forEach((d, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = d.label;
    fDay.appendChild(opt);
  });
  fDay.value = dayIdx;

  editSheet.hidden = false;
  requestAnimationFrame(() => editSheet.classList.add("open"));
}

function closeEditForm() {
  editSheet.classList.remove("open");
  setTimeout(() => { editSheet.hidden = true; }, 300);
  if (picking) cancelPick();
  formState = null;
}

document.getElementById("edit-close").addEventListener("click", closeEditForm);
document.getElementById("f-cancel").addEventListener("click", closeEditForm);

function updateCoordsLabel() {
  if (formState && formState.coords) {
    fCoords.textContent = `${formState.coords.lat.toFixed(4)}, ${formState.coords.lng.toFixed(4)}`;
    fCoords.classList.add("set");
  } else {
    fCoords.textContent = "未設定";
    fCoords.classList.remove("set");
  }
}

function updatePhotoPreview() {
  const src = formState ? (formState.pendingUpload || formState.image) : null;
  if (!src) {
    fPhotoPreview.hidden = true;
    fPhotoRemove.hidden = true;
    return;
  }
  fPhotoRemove.hidden = false;
  fPhotoPreview.hidden = false;
  if (src.startsWith("fs:")) {
    fPhotoPreview.removeAttribute("src");
    resolveImage(fPhotoPreview, src);
  } else {
    fPhotoPreview.src = src;
  }
}

// 写真: ファイル選択 → 縮小
fPhotoFile.addEventListener("change", async () => {
  const file = fPhotoFile.files[0];
  if (!file || !formState) return;
  fPhotoStatus.textContent = "画像を縮小しています…";
  try {
    formState.pendingUpload = await compressImage(file);
    fPhotoUrl.value = "";
    fPhotoStatus.textContent = `準備OK（約${Math.round(formState.pendingUpload.length / 1024)}KB）— 保存時にアップロードされます`;
    updatePhotoPreview();
  } catch (err) {
    fPhotoStatus.textContent = "画像を読み込めませんでした";
  }
  fPhotoFile.value = "";
});

fPhotoUrl.addEventListener("input", () => {
  if (!formState) return;
  formState.pendingUpload = null;
  formState.image = fPhotoUrl.value.trim() || null;
  updatePhotoPreview();
});

fPhotoRemove.addEventListener("click", () => {
  if (!formState) return;
  formState.pendingUpload = null;
  formState.image = null;
  fPhotoUrl.value = "";
  fPhotoStatus.textContent = "";
  updatePhotoPreview();
});

// ---- 地図でピン指定 ----
let picking = false;
const pickBanner = document.getElementById("map-pick-banner");

fPick.addEventListener("click", () => {
  if (!formState) return;
  picking = true;
  pickBanner.hidden = false;
  fNoSpot.checked = false;
  editSheet.classList.add("picking"); // シートを一時的に引っ込める
  if (isMobile()) openMapSheet();
  if (formState.coords) map.flyTo([formState.coords.lat, formState.coords.lng], 14);
});

function cancelPick() {
  picking = false;
  pickBanner.hidden = true;
  editSheet.classList.remove("picking");
}

map.on("click", (e) => {
  if (!picking || !formState) return;
  formState.coords = {
    lat: Math.round(e.latlng.lat * 10000) / 10000,
    lng: Math.round(e.latlng.lng * 10000) / 10000,
  };
  cancelPick();
  updateCoordsLabel();
  if (isMobile()) closeMapSheet();
});

// ---- 保存 ----
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!formState) return;
  const saveBtn = document.getElementById("f-save");
  saveBtn.disabled = true;

  try {
    // 画像アップロード（保留分があれば）
    let image = formState.image;
    if (formState.pendingUpload) {
      fPhotoStatus.textContent = "写真をアップロード中…";
      image = await uploadImage(formState.pendingUpload);
    }

    const { dayIdx, evIdx, insertAt } = formState;
    const original = evIdx !== null ? data.days[dayIdx].events[evIdx] : {};

    const ev = { ...original };
    ev.time = fTime.value;
    ev.icon = fIcon.value;
    ev.title = fTitle.value.trim();
    ev.description = fDesc.value.trim();

    if (fBadge.value.trim()) ev.badge = fBadge.value.trim();
    else delete ev.badge;

    if (!fNoSpot.checked && formState.coords && fSpotName.value.trim()) {
      ev.spot = {
        name: fSpotName.value.trim(),
        lat: formState.coords.lat,
        lng: formState.coords.lng,
      };
      if (fMapUrl.value.trim()) ev.spot.mapUrl = fMapUrl.value.trim();
    } else {
      ev.spot = null;
    }

    if (fTravelText.value.trim()) {
      ev.travelAfter = { icon: fTravelIcon.value || "🚗", text: fTravelText.value.trim() };
    } else {
      delete ev.travelAfter;
    }

    if (image) ev.image = image;
    else delete ev.image;

    const targetDay = +fDay.value;

    if (evIdx === null) {
      // 新規: 指定位置（または時刻順）に挿入
      const events = data.days[targetDay].events;
      if (targetDay === dayIdx && insertAt !== null) {
        events.splice(insertAt, 0, ev);
      } else {
        insertByTime(events, ev);
      }
    } else if (targetDay === dayIdx) {
      data.days[dayIdx].events[evIdx] = ev;
    } else {
      // 日またぎ移動: 元の日から外し、移動先へ時刻順で挿入
      data.days[dayIdx].events.splice(evIdx, 1);
      insertByTime(data.days[targetDay].events, ev);
      currentDayIndex = targetDay;
    }

    closeEditForm();
    renderTabs();
    renderDay();
    await saveTrip();
  } catch (err) {
    console.error("保存に失敗:", err);
    fPhotoStatus.textContent = "保存に失敗しました。通信環境を確認してもう一度お試しください。";
  } finally {
    saveBtn.disabled = false;
  }
});

function insertByTime(events, ev) {
  const t = timeToMinutes(ev.time) ?? 0;
  let at = events.length;
  for (let i = 0; i < events.length; i++) {
    const ti = timeToMinutes(events[i].time);
    if (ti !== null && ti > t) { at = i; break; }
  }
  events.splice(at, 0, ev);
}

// ============================================================
// 持ち物チェックリスト（端末ごとのlocalStorage保存）
// ============================================================

const STORAGE_KEY = "hiroshima-packing-v1";

function loadPacking() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { checked: {}, custom: [] };
  } catch {
    return { checked: {}, custom: [] };
  }
}
function savePacking(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const packingState = loadPacking();
const packingListEl = document.getElementById("packing-list");
const packingForm = document.getElementById("packing-form");
const packingInput = document.getElementById("packing-input");

function renderPacking() {
  packingListEl.innerHTML = "";
  const baseItems = data.packingList || [];
  const allItems = [
    ...baseItems.map((name) => ({ name, custom: false })),
    ...packingState.custom.map((name) => ({ name, custom: true })),
  ];

  allItems.forEach(({ name, custom }, i) => {
    const checked = !!packingState.checked[name];
    const li = document.createElement("li");
    li.className = "packing-item" + (checked ? " checked" : "");
    const id = `pack-${i}`;
    li.innerHTML = `
      <input type="checkbox" id="${id}" ${checked ? "checked" : ""}>
      <label for="${id}"></label>
      ${custom ? `<button type="button" class="packing-remove" aria-label="削除">${iconFor("✕")}</button>` : ""}`;
    li.querySelector("label").textContent = name;

    li.querySelector("input").addEventListener("change", (e) => {
      packingState.checked[name] = e.target.checked;
      savePacking(packingState);
      li.classList.toggle("checked", e.target.checked);
    });

    const removeBtn = li.querySelector(".packing-remove");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        packingState.custom = packingState.custom.filter((n) => n !== name);
        delete packingState.checked[name];
        savePacking(packingState);
        renderPacking();
      });
    }

    packingListEl.appendChild(li);
  });
}

packingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = packingInput.value.trim();
  if (!name) return;
  if (!packingState.custom.includes(name) && !(data.packingList || []).includes(name)) {
    packingState.custom.push(name);
    savePacking(packingState);
    renderPacking();
  }
  packingInput.value = "";
});

// ============================================================
// 起動
// ============================================================

let firstLoad = true;

initDataLayer((newData) => {
  data = newData;
  renderHeader();

  if (firstLoad) {
    firstLoad = false;
    // 旅行当日はその日のタブを最初に表示
    if (tripDayIndex !== null && tripDayIndex >= 0 && tripDayIndex < data.days.length) {
      currentDayIndex = tripDayIndex;
    }
    // ?demo を付けるとFirebase未設定でも編集UIを試せる（保存はされない）
    const demoEdit = new URLSearchParams(location.search).has("demo");
    if (canEdit || demoEdit) editToggle.hidden = false;
  }
  if (currentDayIndex >= data.days.length) currentDayIndex = 0;

  renderTabs();
  renderDay();
  renderPacking();
}).catch((err) => {
  console.error("旅程データの読み込みに失敗しました:", err);
  timelineEl.innerHTML =
    '<li style="color:#a02f13">旅程データの読み込みに失敗しました。</li>';
});
