/* 広島・宮島 旅のしおり — アプリロジック
   旅程データは data/itinerary.json を編集してください
   （icon は絵文字のままでOK。下の FLAT_ICONS でフラットSVGに変換されます） */

// ---- フラットSVGアイコン（絵文字 → SVG 変換マップ） ----
const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

const FLAT_ICONS = {
  // 飛行機（到着・出発）
  "🛬": `<svg ${SVG_ATTRS}><path d="M2 22h20"/><path d="M3.77 10.77 2 9l2-4.5 1.1.55c.55.28.9.84.9 1.45s.35 1.17.9 1.45L8 8.5l3-6 1.05.53a2 2 0 0 1 1.09 1.52l.72 5.4a2 2 0 0 0 1.09 1.52l4.4 2.2c.42.22.78.55 1.01.96l.6 1.03c.49.88-.06 1.98-1.06 2.1a5 5 0 0 1-2.07-.2L4.92 14.7a2.4 2.4 0 0 1-1.15-3.93Z"/></svg>`,
  "🛫": `<svg ${SVG_ATTRS}><path d="M2 22h20"/><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.4 2.4 0 0 1 3.2 1.06l.24.5a2.4 2.4 0 0 1-.91 3.06l-12.8 7.5a2 2 0 0 1-1.67.19Z"/></svg>`,
  // 車
  "🚗": `<svg ${SVG_ATTRS}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
  // 食事（箸・和食）
  "🥢": `<svg ${SVG_ATTRS}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  // 鳩（平和）
  "🕊️": `<svg ${SVG_ATTRS}><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/></svg>`,
  // 城
  "🏯": `<svg ${SVG_ATTRS}><path d="M12 3 5.5 7h13L12 3Z"/><path d="M7 7v3"/><path d="M17 7v3"/><path d="M4.5 10h15l-2 3h-11l-2-3Z"/><path d="M7 13v4"/><path d="M17 13v4"/><path d="M5 17h14v4H5z"/></svg>`,
  // ホテル（ベッド）
  "🏨": `<svg ${SVG_ATTRS}><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
  // ディナー（皿）
  "🍽️": `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>`,
  // 錨（呉）
  "⚓": `<svg ${SVG_ATTRS}><circle cx="12" cy="5" r="3"/><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`,
  // 珈琲
  "☕": `<svg ${SVG_ATTRS}><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2"/><path d="M10 2v2"/><path d="M14 2v2"/></svg>`,
  // 駐車場
  "🅿️": `<svg ${SVG_ATTRS}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
  // 船（フェリー）
  "🚢": `<svg ${SVG_ATTRS}><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/></svg>`,
  // ワイン
  "🍷": `<svg ${SVG_ATTRS}><path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>`,
  // 月（夜）
  "🌙": `<svg ${SVG_ATTRS}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  // 鳥居
  "⛩️": `<svg ${SVG_ATTRS}><path d="M4 5c2.7.7 5.3 1 8 1s5.3-.3 8-1"/><path d="M4.5 5.2 5 9"/><path d="M19.5 5.2 19 9"/><path d="M5 9h14"/><path d="M6 9l.7 12"/><path d="M18 9l-.7 12"/><path d="M12 6v3"/><path d="M5.6 13.5h12.8"/></svg>`,
  // 朝食（目玉焼き）
  "🍳": `<svg ${SVG_ATTRS}><circle cx="10" cy="12" r="7"/><circle cx="10" cy="12" r="2.5"/><path d="M17 12h5"/></svg>`,
  // ロープウェー
  "🚡": `<svg ${SVG_ATTRS}><path d="M2 7c6.7-2 13.3-2 20-3"/><path d="M12 5.8V10"/><rect x="7" y="10" width="10" height="8" rx="1.5"/><path d="M12 10v8"/></svg>`,
  // ケーキ
  "🍰": `<svg ${SVG_ATTRS}><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>`,
  // 給油
  "⛽": `<svg ${SVG_ATTRS}><path d="M3 22h12"/><path d="M4 9h10"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>`,
  // スーツケース
  "🧳": `<svg ${SVG_ATTRS}><rect x="5" y="7" width="14" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M9 11v5"/><path d="M15 11v5"/></svg>`,
  // 買い物
  "🛍️": `<svg ${SVG_ATTRS}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  // 地図ピン
  "📍": `<svg ${SVG_ATTRS}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
};

// 絵文字をフラットSVGへ（未登録の絵文字はそのまま表示）
function iconFor(emoji) {
  const key = (emoji || "").trim();
  return FLAT_ICONS[key] || FLAT_ICONS[key.replace(/️/g, "")] || key;
}

(async function () {
  const res = await fetch("data/itinerary.json");
  const data = await res.json();

  // ---- ヘッダー ----
  document.getElementById("site-title").textContent = data.title;
  document.getElementById("site-subtitle").textContent = data.subtitle;
  document.getElementById("site-note").textContent = data.note;
  document.title = `${data.title} ${data.subtitle}`;

  // ---- 基本情報カード ----
  const infoCards = document.getElementById("info-cards");
  data.basicInfo.forEach((info) => {
    const card = document.createElement("div");
    card.className = "info-card";
    card.innerHTML = `
      <div class="info-card-icon">${iconFor(info.icon)}</div>
      <div class="info-card-label">${info.label}</div>
      <div class="info-card-text">${info.text}</div>`;
    infoCards.appendChild(card);
  });

  // ---- 地図の初期化 ----
  const map = L.map("map", { scrollWheelZoom: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  let markerLayer = L.layerGroup().addTo(map);
  let currentMarkers = [];

  function makePin(number) {
    return L.divIcon({
      className: "pin-marker",
      html: `<div class="pin-inner"><span>${number}</span></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 28],
      popupAnchor: [0, -26],
    });
  }

  // ---- 日タブ ----
  const tabsEl = document.getElementById("day-tabs");
  data.days.forEach((day, i) => {
    const btn = document.createElement("button");
    btn.className = "day-tab";
    btn.textContent = day.label;
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => renderDay(i));
    tabsEl.appendChild(btn);
  });

  // ---- 日の描画 ----
  const themeEl = document.getElementById("day-theme");
  const timelineEl = document.getElementById("timeline");

  function renderDay(index) {
    const day = data.days[index];

    // タブの状態
    [...tabsEl.children].forEach((b, i) => {
      b.classList.toggle("active", i === index);
      b.setAttribute("aria-pressed", i === index ? "true" : "false");
    });

    themeEl.textContent = day.theme;

    // タイムライン
    timelineEl.innerHTML = "";
    markerLayer.clearLayers();
    currentMarkers = [];

    let pinCount = 0;
    const bounds = [];

    day.events.forEach((ev) => {
      const li = document.createElement("li");
      li.className = "timeline-item" + (ev.spot ? " has-spot" : "");

      let pinBadge = "";
      let pinNumber = null;
      if (ev.spot) {
        pinCount += 1;
        pinNumber = pinCount;
        pinBadge = `<span class="timeline-pin">${iconFor("📍")} ${pinNumber}. ${ev.spot.name}</span>`;
      }

      li.innerHTML = `
        <div class="timeline-dot">${iconFor(ev.icon)}</div>
        <div class="timeline-card">
          <span class="timeline-time">${ev.time}</span>
          <div class="timeline-title">${ev.title}</div>
          ${ev.description ? `<div class="timeline-desc">${ev.description}</div>` : ""}
          ${pinBadge}
        </div>`;

      if (ev.spot) {
        const marker = L.marker([ev.spot.lat, ev.spot.lng], {
          icon: makePin(pinNumber),
        }).addTo(markerLayer);
        marker.bindPopup(
          `<div class="popup-time">${ev.time}</div><div class="popup-name">${ev.spot.name}</div>`
        );
        bounds.push([ev.spot.lat, ev.spot.lng]);
        currentMarkers.push(marker);

        li.querySelector(".timeline-card").addEventListener("click", () => {
          document
            .querySelectorAll(".timeline-item.selected")
            .forEach((el) => el.classList.remove("selected"));
          li.classList.add("selected");
          map.flyTo([ev.spot.lat, ev.spot.lng], 14, { duration: 0.8 });
          marker.openPopup();
          // モバイルでは地図が上にあるのでスクロール
          if (window.matchMedia("(max-width: 880px)").matches) {
            document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      }

      timelineEl.appendChild(li);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [46, 46], maxZoom: 13 });
    }
  }

  renderDay(0);
})().catch((err) => {
  console.error("旅程データの読み込みに失敗しました:", err);
  document.getElementById("timeline").innerHTML =
    '<li style="color:#a02f13">旅程データ（data/itinerary.json）の読み込みに失敗しました。</li>';
});
