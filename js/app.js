/* 広島・宮島 旅のしおり — アプリロジック
   旅程データは data/itinerary.json を編集してください */

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
      <div class="info-card-icon">${info.icon}</div>
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
        pinBadge = `<span class="timeline-pin">📍 ${pinNumber}. ${ev.spot.name}</span>`;
      }

      li.innerHTML = `
        <div class="timeline-dot">${ev.icon}</div>
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
