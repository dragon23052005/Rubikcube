"use strict";
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icon = (n) => `<i data-lucide="${n}" aria-hidden="true"></i>`;
const hydrate = () => window.lucide?.createIcons();
const store = {
  get(k, f) {
    try {
      return JSON.parse(localStorage.getItem("sca-" + k)) ?? f;
    } catch {
      return f;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem("sca-" + k, JSON.stringify(v));
    } catch {
      toast(
        "Không thể lưu trên thiết bị. Vui lòng kiểm tra bộ nhớ trình duyệt.",
      );
    }
  },
};
let data = [],
  progress = store.get("progress", {}),
  history = store.get("history", []),
  filters = store.get("filters", {
    puzzle: "",
    method: "",
    category: "",
    status: "",
    sort: "number",
  }),
  page = 0,
  query = "",
  practice = null,
  revealed = false,
  round = 0,
  sessionLearned = 0;
const params = new URLSearchParams(location.search),
  path = location.pathname;
const names = {
  OLL: "Định hướng tầng cuối",
  PLL: "Hoán vị tầng cuối",
  COLL: "Góc & định hướng tầng cuối",
  "ZB F2L": "F2L & định hướng cạnh",
  CO: "Đưa góc về đúng tầng",
  EO: "Đưa cạnh về đúng tầng",
  CP: "Hoán vị góc",
  EP: "Hoán vị cạnh",
  Middle: "Tầng giữa & đổi tầng",
};
const methods = (p) =>
  [
    ...new Set(data.filter((c) => !p || c.puzzle === p).map((c) => c.method)),
  ].sort(
    (a, b) =>
      [
        "OLL",
        "PLL",
        "COLL",
        "ZB F2L",
        "CO",
        "EO",
        "CP",
        "EP",
        "Middle",
      ].indexOf(a) -
      [
        "OLL",
        "PLL",
        "COLL",
        "ZB F2L",
        "CO",
        "EO",
        "CP",
        "EP",
        "Middle",
      ].indexOf(b),
  );
const count = (m) => data.filter((c) => c.method === m).length;
const state = (id) => progress[id] || {};
function toast(s) {
  $("#toast").textContent = s;
  $("#toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("show"), 2600);
}
function update(id, patch) {
  progress[id] = { ...state(id), ...patch, updatedAt: Date.now() };
  store.set("progress", progress);
}
async function copy(id, alternative) {
  let c = data.find((c) => c.id === id);
  if (!c?.algorithm) {
    toast("Ô công thức tại nguồn đang trống");
    return;
  }
  let text =
    alternative === undefined ? c.algorithm : c.alternatives[alternative];
  try {
    await navigator.clipboard.writeText(text);
    toast("Đã sao chép công thức");
  } catch {
    toast("Không thể sao chép tự động. Hãy chọn và sao chép công thức.");
  }
}
function track(id) {
  history = [id, ...history.filter((x) => x !== id)].slice(0, 12);
  store.set("history", history);
}
function crumb(items) {
  return `<div class="breadcrumb"><a href="/">Tổng quan</a>${items.map(([t, url]) => icon("chevron-right") + (url ? `<a href="${url}">${esc(t)}</a>` : `<span>${esc(t)}</span>`)).join("")}</div>`;
}
function title(t, d) {
  return `<div class="page-title"><h1>${t}</h1><p>${d}</p></div>`;
}
function cubeArt(square = false) {
  if (square)
    return `<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M12 34 49 13 88 34 50 57Z" fill="#f7cd62" stroke="#343d55" stroke-width="3"/><path d="M12 34v38l38 21V57Z" fill="#9088e7" stroke="#343d55" stroke-width="3"/><path d="m50 57 38-23v38L50 93Z" fill="#b3acd9" stroke="#343d55" stroke-width="3"/><path d="m31 24 38 22M69 24 31 46m-19 5 38 22 38-22M31 46v38m38-38v38" stroke="#343d55" stroke-width="2"/></svg>`;
  let top = "",
    left = "",
    right = "";
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      let x = 24 + (c - r) * 17,
        y = 38 + (c + r) * 9;
      top += `<path d="M${x + 26} ${y - 30}l15 8-15 8-15-8Z" fill="${["#c9c3fc", "#e1ddff", "#b8adf5"][(r + c) % 3]}" stroke="#655d9a" stroke-width="1.5"/>`;
      let lx = 2 + c * 17,
        ly = 43 + c * 9 + r * 19;
      left += `<path d="M${lx} ${ly}l15 8v17l-15-8Z" fill="${["#7e75d7", "#958ce7", "#a199ed"][(r + c) % 3]}" stroke="#655d9a" stroke-width="1.5"/>`;
      let rx = 54 + c * 17,
        ry = 69 - c * 9 + r * 19;
      right += `<path d="M${rx} ${ry}l15-8v17l-15 8Z" fill="${["#ece9ff", "#cfc9f1", "#dcd7f9"][(r + c) % 3]}" stroke="#655d9a" stroke-width="1.5"/>`;
    }
  return `<svg viewBox="-4 -3 120 140" aria-hidden="true">${top}${left}${right}</svg>`;
}
function visual(c, cls = "") {
  let imgs = c.images.filter(Boolean);
  return `<div class="case-visual ${imgs.length > 1 ? "multi" : ""} ${cls}">${imgs.length ? imgs.map((url, i) => `<img src="${esc(url)}" loading="lazy" decoding="async" width="120" height="120" alt="${esc(c.name)} — ${c.puzzle === "sq1" ? (i ? "mặt dưới nhìn từ dưới" : "mặt trên") : i ? "hoán vị góc" : "nhận diện"}">`).join("") : "<p>Nguồn chưa cung cấp hình nhận diện</p>"}${
    c.recognition
      ? `<div class="recognition-grid" aria-label="Màu hoán vị góc">${c.recognition
          .split(" ")
          .filter(Boolean)
          .map((v) => `<span>${esc(v)}</span>`)
          .join("")}</div>`
      : ""
  }</div>`;
}
function stats() {
  let available = data.filter((c) => c.algorithm),
    learned = available.filter((c) => state(c.id).learned).length,
    review = available.filter((c) => state(c.id).review).length,
    pct = Math.round((1000 * learned) / (available.length || 1)) / 10;
  return `<div class="stats">${[
    [
      "library",
      "Tổng case",
      data.length,
      `${available.length} case có công thức · ${new Set(data.map(c=>c.puzzle)).size} loại Rubik`,
    ],
    [
      "circle-check",
      "Case đã thuộc",
      learned,
      '<span class="positive">Từng case, một bước tiến</span>',
    ],
    ["repeat-2", "Cần luyện thêm", review, "Ôn lại để ghi nhớ lâu hơn"],
    [
      "chart-no-axes-combined",
      "Tiến độ học tập",
      pct + "%",
      `<div class="progress-track" role="progressbar" aria-label="Tiến độ học tập" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>`,
    ],
  ]
    .map(
      ([i, t, n, d]) =>
        `<div class="stat"><div class="stat-top"><span>${t}</span>${icon(i)}</div><strong>${n}</strong><div class="stat-bottom">${d}</div></div>`,
    )
    .join("")}</div>`;
}
function puzzleCard(p) {
  let ms = methods(p),
    total = data.filter((c) => c.puzzle === p).length;
  return `<article class="puzzle-card"><div class="puzzle-card-top"><a href="/methods?puzzle=${p}" class="puzzle-icon" aria-label="Khám phá ${p === "sq1" ? "Square-1" : "Rubik 3×3"}">${cubeArt(p === "sq1")}</a><div class="puzzle-title"><h3><a href="/methods?puzzle=${p}">${p === "sq1" ? "Square-1" : "Rubik 3×3"}</a></h3><p>${p === "sq1" ? "Hình dạng mới. Thử thách mới." : "Từ những bước đầu đến sub-20."}</p></div><span class="badge ${p === "sq1" ? "green" : ""}">${p === "sq1" ? "Thử thách" : "Phổ biến"}</span></div><div class="method-chips">${ms.map((m) => `<a class="method-chip" href="/algorithms?method=${encodeURIComponent(m)}">${m === "Middle" ? "Middle layer" : m}<b>${count(m)}</b></a>`).join("")}${p === "sq1" ? '<a class="method-chip" href="/guide#square1">Cube Shape <b>Hướng dẫn</b></a>' : ""}</div><div class="puzzle-card-footer"><span>${ms.length} bộ công thức · ${total} case</span><a href="/methods?puzzle=${p}">Khám phá ${icon("arrow-right")}</a></div></article>`;
}
function card(c) {
  let s = state(c.id);
  return `<article class="algorithm-card"><div style="position:relative"><a href="/algorithms/${c.id}" aria-label="Xem chi tiết ${esc(c.name)}">${visual(c)}</a><span class="badge" style="position:absolute;top:10px;left:10px">${c.method} #${String(c.number).padStart(2, "0")}</span><button class="icon-btn favorite-btn ${s.favorite ? "saved" : ""}" style="position:absolute;right:6px;top:6px" data-action="favorite" data-id="${c.id}" aria-label="${s.favorite ? "Bỏ lưu" : "Lưu"} ${esc(c.name)}" aria-pressed="${!!s.favorite}">${icon(s.favorite ? "bookmark-check" : "bookmark")}</button></div><div class="card-body"><div class="card-name"><h3><a href="/algorithms/${c.id}">${esc(c.name)}</a></h3>${s.learned ? '<span class="badge green">✓ Đã thuộc</span>' : ""}</div><div class="card-category">${esc(c.category)}</div><div class="alg-line">${esc(c.algorithm) || "Ô công thức trống tại nguồn"}</div>${c.algorithm.length > 45 ? `<details><summary>Xem đầy đủ</summary><div class="full-alg">${esc(c.algorithm) || "Ô công thức trống tại nguồn"}</div></details>` : ""}${c.alternatives.length ? `<a class="variant-link" href="/algorithms/${c.id}">${c.alternatives.length} biến thể · Xem chi tiết</a>` : ""}</div><div class="card-actions"><button data-action="copy" data-id="${c.id}" ${!c.algorithm ? "disabled" : ""}>${icon("copy")} Sao chép</button><button class="${s.learned ? "learned" : ""}" data-action="learned" data-id="${c.id}" ${!c.algorithm ? "disabled" : ""} aria-pressed="${!!s.learned}">${icon(s.learned ? "circle-check" : "circle")} ${s.learned ? "Đã thuộc" : "Đánh dấu"}</button></div></article>`;
}
function home() {
  let recent = history
      .map((id) => data.find((c) => c.id === id))
      .filter(Boolean),
    suggest = recent.length
      ? recent.slice(0, 3)
      : ["oll-54", "pll-1", "coll-1"]
          .map((id) => data.find((c) => c.id === id))
          .filter(Boolean);
  $("#main").innerHTML =
    `<div class="intro"><div><h1>Sẵn sàng cho bước tiến mới? <span style="font-size:22px">✦</span></h1><p>Một công thức mới hôm nay. Một lần giải tốt hơn ngày mai.</p></div><span class="date-chip">${icon("calendar-days")}${new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" }).format(new Date())}</span></div><section class="hero"><div class="hero-content"><span class="eyebrow">${icon("sparkles")} KHÔNG GIAN DÀNH CHO SPEEDCUBER</span><h1>Làm chủ mọi<br>công thức Rubik</h1><p>Khám phá, ghi nhớ và luyện tập thuật toán theo cách của bạn. Tất cả trong một không gian.</p><div class="actions"><a class="btn primary" href="/algorithms">Khám phá thuật toán ${icon("arrow-right")}</a><a class="btn light" href="/practice">${icon("play")} Bắt đầu luyện tập</a></div></div><div class="hero-art"><div class="orbit"></div><div class="cube-art">${cubeArt()}</div><span class="art-label">${icon("sparkles")} Your next personal best starts here</span></div></section>${stats()}<section><div class="section-heading"><div><h2>Chọn Rubik của bạn</h2><p>Mỗi loại Rubik, một hành trình chinh phục.</p></div><a class="text-link" href="/puzzles">Tất cả danh mục ${icon("arrow-right")}</a></div><div class="puzzle-grid">${puzzleCard("3x3")}${puzzleCard("sq1")}</div></section><div class="lower-grid"><section><div class="section-heading"><h2>${recent.length ? "Tiếp tục hành trình" : "Bắt đầu khám phá"}</h2><a class="text-link" href="/algorithms">Xem thư viện ${icon("arrow-right")}</a></div><div class="recent-list">${suggest.map((c) => `<a class="recent-row" href="/algorithms/${c.id}"><div class="mini-image"><img src="${esc(c.images[0])}" alt="" width="37" height="37" loading="lazy"></div><div><strong>${esc(c.name)}</strong><p>${esc(names[c.method])} · ${c.puzzle === "sq1" ? "Square-1" : "3×3"}</p></div><span class="badge ${state(c.id).learned ? "green" : ""}">${state(c.id).learned ? "✓ Đã thuộc" : "Khám phá"}</span><span class="icon-btn">${icon("chevron-right")}</span></a>`).join("")}</div></section><section><div class="section-heading"><h2>Luyện một chút, nhớ lâu hơn</h2></div><div class="practice-banner"><span class="icon-tile">${icon("zap")}</span><h3>Biến công thức thành phản xạ</h3><p>Nhìn hình, nhớ công thức và kiểm tra đáp án. Bạn đã sẵn sàng chưa?</p><a class="btn primary" href="/practice">${icon("play")} Vào phòng luyện tập ${icon("arrow-right")}</a><small>Không áp lực thời gian. Tiến bộ theo nhịp của bạn.</small></div></section></div>`;
  hydrate();
}
function options(vals, selected, all) {
  return (
    `<option value="">${all}</option>` +
    vals
      .map(
        (v) =>
          `<option value="${esc(v)}" ${v === selected ? "selected" : ""}>${esc(v === "3x3" ? "Rubik 3×3" : v === "sq1" ? "Square-1" : v)}</option>`,
      )
      .join("")
  );
}
function library() {
  if (params.has("method")) {
    filters.method = params.get("method");
    filters.puzzle =
      data.find((c) => c.method === filters.method)?.puzzle || "";
    filters.category = "";
  }
  if (params.has("puzzle")) {
    filters.puzzle = params.get("puzzle");
    filters.method = "";
    filters.category = "";
  }
  query = params.get("q") || "";
  if (params.has("q")) {
    filters = {
      puzzle: "",
      method: "",
      category: "",
      status: "",
      sort: "number",
    };
  }
  $("#main").innerHTML =
    crumb([[path === "/favorites" ? "Đã lưu" : "Thư viện thuật toán"]]) +
    title(
      path === "/favorites" ? "Bộ sưu tập của bạn" : "Thư viện thuật toán",
      "Tìm đúng case. Hiểu cách xoay. Ghi nhớ theo cách của bạn.",
    ) +
    `<div class="library-layout"><aside class="filter-panel" id="filters" aria-label="Bộ lọc"><button class="icon-btn filter-close" data-action="close-filter" aria-label="Đóng bộ lọc">${icon("x")}</button><h3>${icon("sliders-horizontal")} Bộ lọc</h3><label class="field"><span>Loại Rubik</span><select id="f-puzzle">${options(["3x3", "sq1"], filters.puzzle, "Tất cả Rubik")}</select></label><label class="field"><span>Phương pháp</span><select id="f-method">${options(methods(filters.puzzle), filters.method, "Tất cả phương pháp")}</select></label><label class="field"><span>Nhóm case</span><select id="f-category"></select></label><label class="field"><span>Trạng thái học</span><select id="f-status"><option value="">Tất cả case</option value="new">Chưa học</option><option value="learned">Đã thuộc</option><option value="review">Cần luyện thêm</option><option value="favorite">Đã lưu</option></select></label><button class="btn" data-action="reset">${icon("rotate-ccw")} Xóa bộ lọc</button><p class="filter-note">Bộ lọc được ghi nhớ trên thiết bị của bạn.</p></aside><section><div class="toolbar"><button class="btn filter-toggle" data-action="filter" aria-label="Mở bộ lọc" aria-expanded="false">${icon("sliders-horizontal")}<span>Bộ lọc</span></button><label class="search-box">${icon("search")}<input id="case-search" aria-label="Tìm theo tên, số hoặc công thức" placeholder="Tên, số case, công thức…" value="${esc(query)}"></label><select id="f-sort" aria-label="Sắp xếp"><option value="number">Theo số case</option><option value="length">Công thức ngắn</option></select></div><div class="result-meta" id="result-meta"></div><div class="algorithm-grid" id="case-grid"></div><div id="pagination"></div></section></div><p class="source-note">Công thức & hình: <a href="https://cubezone.be/" target="_blank" rel="noopener">Lars Vandenbergh · CubeZone</a>. Số thứ tự theo nguồn, không mặc định là hệ đánh số WCA. <a href="/guide#source">Xem tình trạng kiểm chứng</a>.</p>`;
  $("#f-status").value = filters.status;
  $("#f-sort").value = filters.sort;
  categories();
  for (let key of ["puzzle", "method", "category", "status", "sort"])
    $("#f-" + key).onchange = (e) => {
      filters[key] = e.target.value;
      if (key === "puzzle") {
        filters.method = "";
        $("#f-method").innerHTML = options(
          methods(filters.puzzle),
          "",
          "Tất cả phương pháp",
        );
      }
      if (key === "puzzle" || key === "method") {
        filters.category = "";
        categories();
      }
      page = 0;
      store.set("filters", filters);
      renderCards();
    };
  $("#case-search").oninput = (e) => {
    query = e.target.value;
    page = 0;
    renderCards();
  };
  renderCards();
}
function categories() {
  let cats = [
    ...new Set(
      data
        .filter(
          (c) =>
            (!filters.puzzle || c.puzzle === filters.puzzle) &&
            (!filters.method || c.method === filters.method),
        )
        .map((c) => c.category),
    ),
  ];
  $("#f-category").innerHTML = options(cats, filters.category, "Tất cả nhóm");
}
function filtered() {
  let q = query.toLowerCase().trim();
  return data
    .filter(
      (c) =>
        (path != "/favorites" || state(c.id).favorite) &&
        (!filters.puzzle || c.puzzle === filters.puzzle) &&
        (!filters.method || c.method === filters.method) &&
        (!filters.category || c.category === filters.category) &&
        (!filters.status ||
          (filters.status === "new"
            ? !state(c.id).learned
            : state(c.id)[filters.status])) &&
        (
          c.name +
          " " +
          c.number +
          " " +
          c.method +
          " " +
          c.algorithm +
          " " +
          c.alternatives.join(" ")
        )
          .toLowerCase()
          .includes(q),
    )
    .sort(
      filters.sort === "length"
        ? (a, b) => a.algorithm.length - b.algorithm.length
        : (a, b) => a.method.localeCompare(b.method) || a.number - b.number,
    );
}
function renderCards() {
  let focused = document.activeElement?.closest("[data-action]"),
    focusId = focused?.dataset.id,
    focusAction = focused?.dataset.action;
  let list = filtered(),
    pages = Math.ceil(list.length / 12);
  page = Math.max(0, Math.min(page, pages - 1));
  $("#result-meta").innerHTML =
    `<span><strong>${list.length}</strong> case ${filters.method ? "· " + esc(filters.method) : ""}</span><span>${list.length ? `${page * 12 + 1}–${Math.min(page * 12 + 12, list.length)}` : "0"} / ${list.length}</span>`;
  $("#case-grid").innerHTML = list.length
    ? list
        .slice(page * 12, page * 12 + 12)
        .map(card)
        .join("")
    : `<div class="empty">${icon(path === "/favorites" ? "bookmark" : "search")}<h3>${path === "/favorites" ? "Chưa có case đã lưu phù hợp" : "Không tìm thấy case phù hợp"}</h3><p>Thử từ khóa khác hoặc xóa bộ lọc để tiếp tục khám phá.</p><button class="btn primary" data-action="reset">Xóa bộ lọc</button></div>`;
  $("#pagination").innerHTML =
    pages > 1
      ? `<div class="pagination"><button class="btn" data-action="prev-page" ${page === 0 ? "disabled" : ""}>${icon("chevron-left")} Trước</button><span>Trang ${page + 1} / ${pages}</span><button class="btn" data-action="next-page" ${page >= pages - 1 ? "disabled" : ""}>Sau ${icon("chevron-right")}</button></div>`
      : "";
  hydrate();
  if (focusId)
    $(`[data-id="${focusId}"][data-action="${focusAction}"]`)?.focus();
}
function detail() {
  let id = path.split("/").pop(),
    c = data.find((c) => c.id === id);
  if (!c) {
    $("#main").innerHTML =
      title(
        "Không tìm thấy case",
        "Case này không có trong dữ liệu hiện tại.",
      ) + '<a class="btn primary" href="/algorithms">Về thư viện</a>';
    return;
  }
  track(id);
  let siblings = data.filter((x) => x.method === c.method),
    index = siblings.indexOf(c);
  $("#main").innerHTML =
    crumb([
      ["Thư viện", "/algorithms"],
      [c.method, "/algorithms?method=" + encodeURIComponent(c.method)],
      [c.name],
    ]) +
    `<div class="detail-grid"><section class="detail-visual">${visual(c)}<div class="visual-caption">${c.puzzle === "sq1" ? "Trái: mặt trên · Phải: mặt dưới nhìn từ dưới" : "Hình nhận diện theo hướng quan sát của nguồn"}<br>Số thứ tự theo CubeZone</div></section><section class="detail-content"><span class="badge">${c.puzzle === "sq1" ? "Square-1" : "Rubik 3×3"}</span><span class="badge">${c.method} #${c.number}</span><h1>${esc(c.name)}</h1><p>${esc(names[c.method])} · ${esc(c.category)}</p><div class="algorithm-block"><label>CÔNG THỨC CHÍNH</label><code>${esc(c.algorithm) || "Ô công thức trống tại nguồn"}</code><button class="btn primary" data-action="copy" data-id="${id}" ${!c.algorithm ? "disabled" : ""}>${icon("copy")} Sao chép công thức</button></div>${c.alternatives.map((alg, i) => `<div class="algorithm-block"><label>BIẾN THỂ ${i + 1}</label><code>${esc(alg)}</code><button class="btn" data-action="copy-alt" data-index="${i}" data-id="${id}">${icon("copy")} Sao chép</button></div>`).join("")}<div class="actions"><button class="btn ${state(id).learned ? "green" : ""}" data-action="detail-learned" data-id="${id}" ${!c.algorithm ? "disabled" : ""} aria-pressed="${!!state(id).learned}">${icon("circle-check")} ${state(id).learned ? "Đã thuộc" : "Đánh dấu đã thuộc"}</button><button class="btn" data-action="detail-favorite" data-id="${id}" aria-pressed="${!!state(id).favorite}">${icon("bookmark")} ${state(id).favorite ? "Đã lưu" : "Lưu case"}</button><a class="btn" href="/practice?method=${encodeURIComponent(c.method)}">${icon("zap")} Luyện tập</a></div><div class="guide-box"><h3>Cách đọc & hướng cầm</h3>${c.puzzle === "sq1" ? "<p>Giữ hướng mặt trên và mặt dưới như hình. (a,b) là số bước 30° của tầng trên và dưới; số âm xoay ngược chiều kim đồng hồ khi nhìn trực diện từng tầng. Dấu / xoay lát cắt 180°.</p>" : "<p>Đặt Rubik theo đúng hướng trong hình nguồn trước khi thực hiện. U là mặt trên, F là mặt trước, R là mặt phải. Dấu ' là ngược chiều kim đồng hồ khi nhìn thẳng vào mặt xoay; 2 là xoay 180°.</p>"}<div class="notation-row">${(c.puzzle ===
    "sq1"
      ? [
          ["(a,b)", "Xoay tầng trên và dưới theo đơn vị 30°"],
          ["/", "Xoay lát cắt 180°"],
        ]
      : [
          ["R", "Mặt phải"],
          ["U", "Mặt trên"],
          ["F", "Mặt trước"],
          ["'", "Ngược chiều kim đồng hồ"],
          ["2", "Xoay 180°"],
          ["r", "Hai lớp bên phải"],
          ["x y z", "Xoay toàn khối"],
        ]
    )
      .map(
        ([v, t]) => `<abbr class="notation" title="${esc(t)}">${esc(v)}</abbr>`,
      )
      .join(
        "",
      )}</div><p><a href="/guide">Xem giải thích ký hiệu đầy đủ</a></p></div><p class="source-note">${esc(c.description)}<br><a href="${c.sourceUrl}" target="_blank" rel="noopener">Mở trang nguồn CubeZone ${icon("external-link")}</a></p></section></div><div class="detail-nav">${index > 0 ? `<a class="btn" href="/algorithms/${siblings[index - 1].id}">${icon("arrow-left")} Case trước</a>` : "<span></span>"}${index < siblings.length - 1 ? `<a class="btn" href="/algorithms/${siblings[index + 1].id}">Case tiếp theo ${icon("arrow-right")}</a>` : ""}</div>`;
  hydrate();
}
function methodPage() {
  let p = params.get("puzzle") || "3x3";
  $("#main").innerHTML =
    crumb([
      ["Danh mục Rubik", "/puzzles"],
      [p === "sq1" ? "Square-1" : "Rubik 3×3"],
    ]) +
    title(
      p === "sq1" ? "Chinh phục Square-1" : "Khám phá Rubik 3×3",
      "Chọn phương pháp phù hợp với hành trình của bạn.",
    ) +
    `<div class="method-grid">${methods(p)
      .map((m) => {
        let n = data.filter(c=>c.method===m && c.algorithm).length,
          l = data.filter((c) => c.method === m && c.algorithm && state(c.id).learned).length;
        return `<article class="method-card"><span class="method-monogram">${m === "Middle" ? "Middle layer" : m}</span><h3>${esc(names[m])}</h3><p>${count(m)} mục nhận diện · ${data.filter((c) => c.method === m).reduce((s, c) => s + c.alternatives.length, 0)} biến thể bổ sung</p><div class="progress-track"><span style="width:${(100 * l) / n}%"></span></div><small>${l} / ${n} case có công thức đã thuộc</small><div class="actions"><a class="btn primary" href="/algorithms?method=${encodeURIComponent(m)}">Khám phá ${icon("arrow-right")}</a><a class="btn" href="/practice?method=${encodeURIComponent(m)}" aria-label="Luyện tập ${m}">${icon("play")}</a></div></article>`;
      })
      .join(
        "",
      )}</div>${p === "sq1" ? '<div class="guide-box"><h3>Cube Shape & Parity</h3><p>Cube Shape có 29 hình dạng một tầng, 90 tổ hợp hai tầng; nguồn trình bày như hướng dẫn, không phải 90 công thức độc lập. Parity nằm trong các nhóm hoán vị cạnh, không được đếm thành bộ case trùng lặp.</p><a href="/guide#square1">Đọc hướng dẫn Square-1</a></div>' : ""}`;
  hydrate();
}
function progressPage() {
  $("#main").innerHTML =
    crumb([["Tiến độ học tập"]]) +
    title(
      "Nhìn lại từng bước tiến",
      "Tiến bộ được tạo nên từ những lần luyện tập nhỏ mỗi ngày.",
    ) +
    stats() +
    `<div class="section-heading"><h2>Tiến độ theo phương pháp</h2><a class="text-link" href="/practice">Tiếp tục luyện tập ${icon("arrow-right")}</a></div><div class="progress-methods">${methods()
      .map((m) => {
        let l = data.filter(
            (c) => c.method === m && c.algorithm && state(c.id).learned,
          ).length,
          n = data.filter(c=>c.method===m && c.algorithm).length;
        return `<a class="progress-method" href="/algorithms?method=${encodeURIComponent(m)}"><strong>${m}</strong><div class="progress-track" role="progressbar" aria-label="Tiến độ ${m}" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${l}"><span style="width:${(100 * l) / n}%"></span></div><small>${l} / ${n} case</small></a>`;
      })
      .join(
        "",
      )}</div><div class="guide-box"><h3>Tiến độ thuộc về bạn</h3><p>Dữ liệu học được lưu trong trình duyệt này. Xuất bản sao để giữ lại hoặc chuyển sang thiết bị khác.</p><div class="actions"><button class="btn" data-action="export">${icon("download")} Xuất tiến độ</button><button class="btn" data-action="import">${icon("upload")} Nhập tiến độ</button><input type="file" id="import-progress" accept="application/json" hidden></div></div>`;
  $("#import-progress").onchange = importProgress;
  hydrate();
}
function practicePage() {
  let initial = params.get("method") || "OLL",
    p = data.find((c) => c.method === initial)?.puzzle || "3x3";
  $("#main").innerHTML =
    crumb([["Phòng luyện tập"]]) +
    title(
      "Một case. Một bước tiến.",
      "Nhìn hình, nhớ công thức rồi kiểm tra đáp án. Luyện theo nhịp của bạn.",
    ) +
    `<div class="practice-wrap"><div class="practice-config"><label>Loại Rubik<select id="p-puzzle">${options(["3x3", "sq1"], p, "Tất cả Rubik")}</select></label><label>Phương pháp<select id="p-method">${options(methods(p), initial, "Tất cả phương pháp")}</select></label><label>Phạm vi<select id="p-scope"><option value="all">Tất cả case</option><option value="new">Chưa thuộc</option><option value="review">Cần luyện thêm</option><option value="favorite">Đã lưu</option></select></label></div><div id="practice-stage"></div><div class="keyboard-help"><kbd>Space</kbd> Hiện đáp án <span> · </span><kbd>1</kbd> Đã thuộc <span> · </span><kbd>2</kbd> Cần luyện <span> · </span><kbd>→</kbd> Bỏ qua</div></div>`;
  $("#p-puzzle").onchange = () => {
    $("#p-method").innerHTML = options(
      methods($("#p-puzzle").value),
      "",
      "Tất cả phương pháp",
    );
    nextCase();
  };
  $("#p-method").onchange = nextCase;
  $("#p-scope").onchange = nextCase;
  nextCase();
}
function nextCase() {
  let p = $("#p-puzzle").value,
    m = $("#p-method").value,
    s = $("#p-scope").value;
  let pool = data.filter(
    (c) =>
      c.algorithm &&
      (!p || c.puzzle === p) &&
      (!m || c.method === m) &&
      (s === "all" || (s === "new" ? !state(c.id).learned : state(c.id)[s])),
  );
  let candidates = pool.filter((c) => c.id !== practice?.id);
  if (!candidates.length) candidates = pool;
  revealed = false;
  practice = candidates[Math.floor(Math.random() * candidates.length)];
  round++;
  practiceStage();
}
function practiceStage() {
  let c = practice;
  if (!c) {
    $("#practice-stage").innerHTML =
      `<div class="empty">${icon("circle-check")}<h3>Không có case trong phạm vi này</h3><p>Hãy chọn phạm vi “Tất cả case” để tiếp tục.</p><button class="btn primary" data-action="practice-all">Luyện tất cả case</button></div>`;
    hydrate();
    return;
  }
  $("#practice-stage").innerHTML =
    `<article class="practice-card"><div class="practice-card-head"><span class="badge">${c.method} · ${c.puzzle === "sq1" ? "Square-1" : "3×3"}</span><span>Lượt ${round} · ${sessionLearned} lần nhớ đúng</span></div>${visual(c)}<div class="practice-answer">${revealed ? `<h2>${esc(c.name)}</h2><code>${esc(c.algorithm) || "Ô công thức trống tại nguồn"}</code><div class="actions"><button class="btn" data-action="rate-review">${icon("repeat-2")} Cần luyện thêm</button><button class="btn green" data-action="rate-learned">${icon("check")} Đã thuộc</button><button class="btn" data-action="copy" data-id="${c.id}" aria-label="Sao chép đáp án">${icon("copy")}</button></div>` : `<h2>Bạn nhớ công thức này chứ?</h2><p style="font-size:11px;margin:0 0 20px">Quan sát hình và thử nhớ các bước xoay.</p><button class="btn primary" data-action="reveal">${icon("eye")} Hiện đáp án</button>`}<div style="margin-top:16px"><button class="btn" data-action="skip">Bỏ qua ${icon("arrow-right")}</button></div></div></article>`;
  hydrate();
}
function guide() {
  $("#main").innerHTML =
    crumb([["Ký hiệu & hướng dẫn"]]) +
    title(
      "Hiểu ký hiệu. Xoay tự tin.",
      "Giữ đúng hướng quan sát và luyện từng nhóm động tác trước khi tăng tốc.",
    ) +
    `<div class="guide-columns"><section class="guide-box"><h3>Ký hiệu Rubik 3×3</h3><table class="guide-table"><tr><th>Ký hiệu</th><th>Ý nghĩa</th></tr>${[
      ["R / L", "Mặt phải / trái"],
      ["U / D", "Mặt trên / dưới"],
      ["F / B", "Mặt trước / sau"],
      ["R'", "90° ngược chiều kim đồng hồ khi nhìn thẳng mặt phải"],
      ["R2", "180° ở mặt phải"],
      ["r, l, u, d, f, b", "Xoay đồng thời hai lớp tương ứng"],
      ["M, E, S", "Lớp giữa; cùng chiều L, D, F tương ứng"],
      ["x, y, z", "Xoay toàn khối theo R, U, F"],
      ["(R U)", "Nhóm động tác thực hiện liền mạch"],
    ]
      .map(
        ([a, b]) =>
          `<tr><td><code>${esc(a)}</code></td><td>${esc(b)}</td></tr>`,
      )
      .join(
        "",
      )}</table></section><section class="guide-box" id="square1"><h3>Square-1 có ký hiệu riêng</h3><p><strong>(a,b)</strong>: xoay tầng trên a bước và tầng dưới b bước, mỗi bước 30°. Chiều dương là chiều kim đồng hồ khi nhìn trực diện tầng đó. <strong>/</strong>: xoay lát cắt 180°.</p><p>Hai hình nguồn lần lượt là mặt trên nhìn từ trên và mặt dưới nhìn từ dưới. Giữ đúng hướng trước khi bắt đầu; chỉ cắt khi các mảnh cho phép.</p><p><strong>Cube Shape:</strong> nguồn liệt kê 29 hình dạng một tầng và 90 tổ hợp hai tầng, cùng hướng dẫn ghép cạnh. Không có bảng 90 công thức đi kèm trong HTML hiện tại.</p><p><strong>CO:</strong> nguồn mô tả là bước trực giác, minh họa 5 ví dụ. Chúng được lưu như ví dụ nguồn, không coi là một bộ CO đầy đủ theo chuẩn khác.</p><p><strong>Parity:</strong> các nhóm EP bao gồm trường hợp hoán vị lẻ; nguồn không có trang parity riêng.</p><a href="https://cubezone.be/square1notation.html" target="_blank" rel="noopener">Ký hiệu Square-1 tại nguồn ${icon("external-link")}</a><p><a href="https://cubezone.be/square1step1.html" target="_blank" rel="noopener">Hướng dẫn Cube Shape tại nguồn</a></p></section></div><section class="guide-box"><h3>Phòng nghiên cứu Cross</h3><p>Thử sức với 102 bài Cross một màu, 3.672 bài hai màu đối diện và 40 bài color neutral từ nghiên cứu của CubeZone. Các bài có scramble và lời giải, được tách khỏi case nhận diện.</p><a class="btn primary" href="/cross">Mở bài tập Cross</a></section><section class="guide-box" id="source"><h3>Dữ liệu & tình trạng kiểm chứng</h3><p>Công thức, hình nhận diện và thứ tự case được nhập từ các trang HTML công khai của Lars Vandenbergh tại <a href="https://cubezone.be/" target="_blank" rel="noopener">CubeZone</a>. Bản quyền nội dung và hình ảnh thuộc tác giả gốc; không có tuyên bố cấp phép lại. Cần được tác giả cho phép trước khi phân phối công khai bộ ảnh.</p><p>“Đã đối chiếu nguồn” nghĩa là importer ghép hình và công thức trong cùng ô hoặc bảng nguồn, có kiểm tra số lượng và tệp ảnh. Có 1 ô ZB F2L trống tại nguồn (ConF2L_1, vị trí 6), được giữ hình và loại khỏi luyện tập. Chưa kiểm chứng trạng thái bằng bộ giải độc lập; vì vậy ứng dụng không cung cấp mô phỏng xoay.</p><p>Số case ở đây là thứ tự tại CubeZone, không tự động tương đương số OLL/PLL của WCA hoặc một thư viện khác.</p><table class="guide-table"><thead><tr><th>Phương pháp</th><th>Đã nhập</th><th>Tình trạng</th></tr></thead><tbody>${methods()
      .map(
        (m) =>
          `<tr><td>${m}</td><td>${count(m)}</td><td>Đối chiếu HTML nguồn</td></tr>`,
      )
      .join("")}</tbody></table></section>`;
  loadShapes();
  hydrate();
  if (location.hash) setTimeout(() => $(location.hash)?.scrollIntoView(), 30);
}
async function importProgress(e) {
  let file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 1000000) throw Error();
    let parsed = JSON.parse(await file.text()),
      incoming = parsed.progress;
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming))
      throw Error();
    let valid = {};
    for (let [id, s] of Object.entries(incoming)) {
      if (!data.some((c) => c.id === id) || !s || typeof s !== "object")
        continue;
      valid[id] = {
        learned: s.learned === true,
        review: s.review === true,
        favorite: s.favorite === true,
        updatedAt: Date.now(),
      };
    }
    progress = { ...progress, ...valid };
    store.set("progress", progress);
    progressPage();
    toast("Đã nhập tiến độ");
  } catch {
    toast("Tệp tiến độ không hợp lệ");
  }
}
document.addEventListener("click", (e) => {
  let b = e.target.closest("[data-action]");
  if (!b) return;
  let a = b.dataset.action,
    id = b.dataset.id;
  if (a === "copy") copy(id);
  if (a === "copy-alt") copy(id, +b.dataset.index);
  if (a === "favorite" || a === "detail-favorite") {
    update(id, { favorite: !state(id).favorite });
    toast(state(id).favorite ? "Đã lưu case" : "Đã bỏ lưu case");
    a.startsWith("detail") ? detail() : renderCards();
  }
  if (a === "learned" || a === "detail-learned") {
    update(id, { learned: !state(id).learned, review: false });
    a.startsWith("detail") ? detail() : renderCards();
  }
  if (a === "filter") {
    $("#filters").classList.add("open");
    b.setAttribute("aria-expanded", "true");
    $(".filter-close").focus();
  }
  if (a === "close-filter") {
    $("#filters").classList.remove("open");
    $(".filter-toggle").setAttribute("aria-expanded", "false");
    $(".filter-toggle").focus();
  }
  if (a === "reset") {
    filters = {
      puzzle: "",
      method: "",
      category: "",
      status: "",
      sort: "number",
    };
    store.set("filters", filters);
    query = "";
    page = 0;
    window.history.replaceState({}, "", path);
    params.delete("method");
    params.delete("puzzle");
    params.delete("q");
    library();
  }
  if (a === "next-page" || a === "prev-page") {
    page += a === "next-page" ? 1 : -1;
    renderCards();
    $("#case-search").focus();
    $("#case-search").scrollIntoView({ block: "center" });
  }
  if (a === "reveal") {
    revealed = true;
    track(practice.id);
    practiceStage();
  }
  if (a === "skip") nextCase();
  if (a === "practice-all") {
    $("#p-scope").value = "all";
    nextCase();
  }
  if (a === "rate-review" || a === "rate-learned") {
    if (!revealed || !practice) return;
    let learned = a === "rate-learned";
    update(practice.id, { learned, review: !learned });
    if (learned) sessionLearned++;
    toast(
      learned ? "Đã ghi nhận: đã thuộc" : "Đã thêm vào danh sách cần luyện",
    );
    nextCase();
  }
  if (a === "import") $("#import-progress").click();
  if (a === "export") {
    let blob = new Blob([JSON.stringify({ version: 1, progress }, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      link = document.createElement("a");
    link.href = url;
    link.download = "speedcube-progress.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if ($("#sidebar").classList.contains("open")) $("#menu-btn").focus();
    if ($("#filters")?.classList.contains("open")) $(".filter-toggle")?.focus();
    $("#sidebar").classList.remove("open");
    $("#menu-btn").setAttribute("aria-expanded", "false");
    $("#filters")?.classList.remove("open");
  }
  if (
    /INPUT|SELECT|TEXTAREA|BUTTON|SUMMARY/.test(
      document.activeElement.tagName,
    ) ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey
  )
    return;
  if (e.key === "/") {
    e.preventDefault();
    $("#global-search input").focus();
  }
  if (path === "/practice" && practice) {
    let a =
      e.code === "Space"
        ? "reveal"
        : e.key === "1" && revealed
          ? "rate-learned"
          : e.key === "2" && revealed
            ? "rate-review"
            : e.key === "ArrowRight"
              ? "skip"
              : "";
    if (a) {
      e.preventDefault();
      $(`[data-action="${a}"]`)?.click();
    }
  }
});
$("#menu-btn").onclick = () => {
  let on = $("#sidebar").classList.toggle("open");
  $("#menu-btn").setAttribute("aria-expanded", String(on));
  if (on) $("#sidebar a").focus();
};
$("#theme-btn").onclick = () => {
  let theme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("sca-theme", theme);
  } catch {}
  $("#theme-btn").innerHTML = icon(theme === "dark" ? "sun" : "moon");
  hydrate();
};
$("#global-search").onsubmit = (e) => {
  e.preventDefault();
  location.href =
    "/algorithms?q=" + encodeURIComponent($("#global-search input").value);
};
async function init() {
  try {
    let response = await fetch("/api/catalog");
    if (!response.ok) throw Error();
    data = await response.json();
    $("#nav-total").textContent = data.length;
    $("#theme-btn").innerHTML = icon(
      document.documentElement.dataset.theme === "dark" ? "sun" : "moon",
    );
    let current =
      path === "/practice"
        ? "practice"
        : path === "/progress"
          ? "progress"
          : path === "/favorites"
            ? "favorites"
            : path === "/algorithms" || path.startsWith("/algorithms/")
              ? "algorithms"
              : path === "/" ? "home" : path.slice(1);
    $(`[data-nav="${current}"]`)?.classList.add("active");
    $("#top-crumb strong").textContent = {
      home: "Tổng quan",
      algorithms: "Thư viện thuật toán",
      practice: "Luyện tập",
      progress: "Tiến độ học tập",
      favorites: "Đã lưu",
      guide: "Ký hiệu & hướng dẫn",
      methods: "Chọn phương pháp",
      puzzles: "Danh mục Rubik",
      cross: "Bài tập Cross",
    }[current];
    if (path === "/") home();
    else if (path === "/algorithms" || path === "/favorites") library();
    else if (path.startsWith("/algorithms/")) detail();
    else if (path === "/methods") methodPage();
    else if (path === "/puzzles") {
      $("#main").innerHTML =
        crumb([["Danh mục Rubik"]]) +
        title(
          "Hành trình bắt đầu từ đây",
          "Chọn loại Rubik bạn muốn khám phá hôm nay.",
        ) +
        `<div class="puzzle-grid">${puzzleCard("3x3")}${puzzleCard("sq1")}</div>`;
    } else if (path === "/progress") progressPage();
    else if (path === "/practice") practicePage();
    else if (path === "/guide") guide();
    else if (path === "/cross") crossPage();
    hydrate();
  } catch (error) {
    $("#main").innerHTML =
      `<div class="empty">${icon("wifi-off")}<h3>Chưa thể tải thư viện</h3><p>Kiểm tra kết nối và thử tải lại trang.</p><button class="btn primary" id="retry">Thử lại</button></div>`;
    $("#retry").onclick = () => location.reload();
    hydrate();
    console.error(error);
  }
}
init();

async function loadShapes() {
  try {
    let r = await fetch("/shapes.json");
    if (!r.ok) throw Error();
    let shapes = await r.json();
    let section = document.createElement("section");
    section.className = "guide-box";
    section.id = "cube-shape";
    section.innerHTML =
      '<h3>29 hình dạng Cube Shape</h3><p>Một tầng luôn thỏa 2C + E = 12, với C là số góc và E là số cạnh. Khi ghép hai tầng, toàn khối phải có đúng 8 góc và 8 cạnh.</p><div class="shape-grid"></div><button class="btn shape-more">Xem đủ 29 hình dạng</button>';
    $("#source").before(section);
    let expanded = false;
    function draw() {
      section.querySelector(".shape-grid").innerHTML = shapes
        .slice(0, expanded ? 29 : 6)
        .map(
          (x) =>
            `<figure class="shape"><img src="${esc(x.image)}" alt="Hình dạng ${esc(x.name)}" loading="lazy" width="74" height="74"><figcaption>${esc(x.name)}</figcaption></figure>`,
        )
        .join("");
      section.querySelector("button").textContent = expanded
        ? "Thu gọn"
        : "Xem đủ 29 hình dạng";
    }
    section.querySelector("button").onclick = () => {
      expanded = !expanded;
      draw();
    };
    draw();
  } catch {
    toast("Chưa tải được hình Cube Shape. Vui lòng thử lại.");
  }
}
// Search suggestions use text already loaded from the database catalog.
const globalInput = $("#global-search input");
let suggestions = document.createElement("div");
suggestions.className = "search-suggestions";
suggestions.id = "global-results";
suggestions.hidden = true;
$("#global-search").append(suggestions);
globalInput.setAttribute("aria-controls", "global-results");
globalInput.setAttribute("aria-expanded", "false");
globalInput.addEventListener("input", () => {
  let q = globalInput.value.trim().toLowerCase();
  if (!q) {
    suggestions.hidden = true;
    globalInput.setAttribute("aria-expanded", "false");
    return;
  }
  let matches = data
    .filter((c) =>
      (c.name + " " + c.method + " " + c.number + " " + c.algorithm)
        .toLowerCase()
        .includes(q),
    )
    .slice(0, 5);
  suggestions.innerHTML = matches.length
    ? matches
        .map(
          (c) =>
            `<a href="/algorithms/${c.id}"><strong>${esc(c.name)}</strong><span>${c.method} · ${esc(names[c.method])}</span></a>`,
        )
        .join("")
    : "<p>Không tìm thấy case. Thử tên phương pháp hoặc chuỗi công thức.</p>";
  suggestions.hidden = false;
  globalInput.setAttribute("aria-expanded", "true");
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("#global-search")) {
    suggestions.hidden = true;
    globalInput.setAttribute("aria-expanded", "false");
  }
  let side = $("#sidebar");
  if (
    side.classList.contains("open") &&
    !side.contains(e.target) &&
    !e.target.closest("#menu-btn")
  ) {
    side.classList.remove("open");
    $("#menu-btn").setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    suggestions.hidden = true;
    globalInput.setAttribute("aria-expanded", "false");
  }
  if (e.key !== "Tab") return;
  let panel = $("#filters.open") || $("#sidebar.open");
  if (!panel) return;
  let focusable = $$("a[href],button,input,select", panel).filter(
      (x) => !x.disabled && x.getClientRects().length,
    ),
    first = focusable[0],
    last = focusable.at(-1);
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

async function crossPage() {
  $("#main").innerHTML =
    crumb([["Bài tập Cross"]]) +
    title(
      "Tìm đường ngắn hơn cho Cross",
      "Bộ bài tập từ nghiên cứu CubeZone. Tạo trạng thái bằng scramble, rồi thử tìm lời giải tối ưu.",
    ) +
    '<div class="practice-wrap"><div class="practice-config"><label>Bộ bài tập<select id="cross-set"><option value="0">Cross một màu · 102 bài</option><option value="1">Hai màu đối diện · 3.672 bài</option><option value="2">Color neutral · 40 bài</option></select></label><label>Bài số<input id="cross-index" type="number" min="1" value="1" style="display:block;width:100%;min-height:44px;padding:8px;margin-top:5px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--text)"></label></div><div id="cross-stage" class="algorithm-block"><p>Đang tải bộ bài tập…</p></div><p class="source-note">Đây là các bài scramble–solution, được kiểm kê riêng; không cộng vào tổng case nhận diện.</p></div>';
  hydrate();
  try {
    let r = await fetch("/research.json");
    if (!r.ok) throw Error();
    let sets = await r.json();
    let index = 0,
      shown = false;
    function draw() {
      let set = sets[+$("#cross-set").value],
        item = set.items[index];
      $("#cross-index").max = set.items.length;
      $("#cross-index").value = index + 1;
      $("#cross-stage").innerHTML =
        '<span class="eyebrow">BÀI ' +
        (index + 1) +
        " / " +
        set.items.length +
        "</span><h3>Thiết lập từ trạng thái đã giải</h3><code>" +
        esc(item.scramble) +
        '</code><p style="font-size:12px;margin-bottom:18px">Giữ U ở trên và F ở trước trong suốt scramble. Ký hiệu “Cross on D” là giải dấu cộng ở mặt dưới.</p>' +
        (shown
          ? item.solutions
              .map(
                (sol) =>
                  '<div class="algorithm-block"><code style="font-size:14px">' +
                  esc(sol) +
                  "</code></div>",
              )
              .join("")
          : '<button class="btn primary" id="cross-reveal">' +
            icon("eye") +
            " Hiện lời giải nguồn</button>") +
        '<div class="actions" style="margin-top:20px"><button class="btn" id="cross-prev" ' +
        (index === 0 ? "disabled" : "") +
        ">" +
        icon("arrow-left") +
        ' Trước</button><button class="btn" id="cross-random">' +
        icon("shuffle") +
        ' Ngẫu nhiên</button><button class="btn" id="cross-next" ' +
        (index === set.items.length - 1 ? "disabled" : "") +
        ">Sau " +
        icon("arrow-right") +
        '</button></div><p class="source-note"><a href="' +
        set.sourceUrl +
        '" target="_blank" rel="noopener">Xem tệp nghiên cứu gốc ' +
        icon("external-link") +
        "</a></p>";
      $("#cross-reveal")?.addEventListener("click", () => {
        shown = true;
        draw();
      });
      $("#cross-next").onclick = () => {
        index++;
        shown = false;
        draw();
      };
      $("#cross-prev").onclick = () => {
        index--;
        shown = false;
        draw();
      };
      $("#cross-random").onclick = () => {
        index = Math.floor(Math.random() * set.items.length);
        shown = false;
        draw();
      };
      hydrate();
    }
    $("#cross-set").onchange = () => {
      index = 0;
      shown = false;
      draw();
    };
    $("#cross-index").onchange = (e) => {
      let n = Number(e.target.value),
        max = sets[+$("#cross-set").value].items.length;
      index = Number.isFinite(n)
        ? Math.max(0, Math.min(max - 1, Math.floor(n) - 1))
        : 0;
      shown = false;
      draw();
    };
    draw();
  } catch {
    $("#cross-stage").innerHTML =
      "<p>Chưa thể tải bộ bài tập. Vui lòng tải lại trang.</p>";
  }
}
