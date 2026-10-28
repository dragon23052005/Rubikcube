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
  "5×5 L2E": "Hai cạnh cuối — 4 thường & 8 parity",
  "5×5 L2C": "Hai tâm cuối — khối tâm 2×3 ở F",
  "4×4 Basic": "Cơ bản — ghép cạnh & parity",
  "4×4 OLL": "OLL parity nâng cao",
  "4×4 PLL": "PLL parity nâng cao",
  "4×4 L2E": "Ghép hai cạnh cuối — CubeSkills",
  OLL: "Định hướng tầng cuối",
  PLL: "Hoán vị tầng cuối",
  COLL: "Góc & định hướng tầng cuối",
  "ZB F2L": "F2L & định hướng cạnh",
  CS: "Cube Shape — đưa về hình lập phương",
  "2×2 OLL": "Định hướng mặt trên — Ortega",
  "2×2 PBL": "Hoán vị cả hai tầng — Ortega",
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
        "2×2 OLL",
        "2×2 PBL",
        "4×4 Basic", "4×4 L2E", "4×4 OLL", "4×4 PLL",
        "5×5 L2C", "5×5 L2E",
        "CS",
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
        "2×2 OLL",
        "2×2 PBL",
        "4×4 Basic", "4×4 L2E", "4×4 OLL", "4×4 PLL",
        "5×5 L2C", "5×5 L2E",
        "CS",
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
async function update(id, patch) {
  if(!currentUser){progress[id]={...state(id),...patch,updatedAt:Date.now()};store.set("progress",progress);return;}
  personalBusy=true;
  const operation=personalWrite.catch(()=>{}).then(async()=>{
    const value=patch;
    const saved=await apiCall('/api/progress/'+encodeURIComponent(id),jsonOptions('PUT',value));
    progress[id]={learned:saved.learned,favorite:saved.favorite,review:saved.review,updatedAt:saved.updatedAt};if(path!=="/practice")roadmapData=null;
  });
  personalWrite=operation;
  try{await operation;}finally{personalBusy=false;}
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
  store.set(currentUser?"history-"+currentUser.id:"history", history);
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
  let imgs = c.reference?.relation === "SAME_SEQUENCE" ? [c.reference.imagePath] : c.images.filter(Boolean);
  return `<div class="case-visual ${imgs.length > 1 ? "multi" : ""} ${c.method === "CS" ? "cube-shape-visual" : ""} ${cls}">${imgs.length ? imgs.map((url, i) => `<img src="${esc(url)}" loading="lazy" decoding="async" width="120" height="120" style="transform:${esc(c.imageTransforms?.[i]||"none")}" alt="${esc(c.name)} — ${c.method === "2×2 PBL" ? "hình "+(i+1)+" theo J Perm" : c.puzzle === "sq1" ? (i ? "mặt dưới nhìn từ dưới" : "mặt trên") : i ? "hoán vị góc" : "nhận diện"}">`).join("") : "<p>Nguồn chưa cung cấp hình nhận diện</p>"}${
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
let puzzleTypes=[];
function puzzleName(id){return puzzleTypes.find(p=>p.id===id)?.name||id;}
function puzzleCodes(){return puzzleTypes.map(p=>p.id).sort((a,b)=>['3x3','2x2','4x4','5x5','sq1'].indexOf(a)-['3x3','2x2','4x4','5x5','sq1'].indexOf(b));}
function cube2Art(){
 const faces=[[[50,8],[102,34],[50,60],[-2,34]], [[-2,36],[50,62],[50,118],[-2,92]], [[52,62],[104,36],[104,92],[52,118]]];
 let cells='';faces.forEach((f,k)=>{const point=(u,v)=>[(1-u)*(1-v)*f[0][0]+u*(1-v)*f[1][0]+u*v*f[2][0]+(1-u)*v*f[3][0],(1-u)*(1-v)*f[0][1]+u*(1-v)*f[1][1]+u*v*f[2][1]+(1-u)*v*f[3][1]];for(let r=0;r<2;r++)for(let c=0;c<2;c++)cells+=`<polygon points="${[[c/2,r/2],[(c+1)/2,r/2],[(c+1)/2,(r+1)/2],[c/2,(r+1)/2]].map(([u,v])=>point(u,v).join(',')).join(' ')}" fill="${['#d1caff','#9185de','#e6e0ff'][k]}" stroke="#655d9a" stroke-width="2.3"/>`;});
 return `<svg viewBox="-8 0 120 126" aria-hidden="true">${cells}</svg>`;
}
function puzzleCard(p){
 const ms=methods(p),total=data.filter(c=>c.puzzle===p).length;
 const subtitle=p==='sq1'?'Hình dạng mới. Thử thách mới.':p==='5x5'?'Reduction · Free Slice · L2E & L2C.':p==='4x4'?'Reduction · Yau · Parity nâng cao.':p==='2x2'?'Ortega · Từ từng mặt đến cả khối.':'Từ những bước đầu đến sub-20.';
 return `<article class="puzzle-card"><div class="puzzle-card-top"><a href="/methods?puzzle=${p}" class="puzzle-icon" aria-label="Khám phá ${esc(puzzleName(p))}">${p==='5x5'?cube5Art():p==='4x4'?cube4Art():p==='2x2'?cube2Art():cubeArt(p==='sq1')}</a><div class="puzzle-title"><h3><a href="/methods?puzzle=${p}">${esc(puzzleName(p))}</a></h3><p>${subtitle}</p></div><span class="badge ${p==='sq1'?'green':''}">${p==='5x5'?'Big cubes':p==='4x4'?'Yau':p==='2x2'?'Ortega':p==='sq1'?'Thử thách':'Phổ biến'}</span></div><div class="method-chips">${ms.map(m=>`<a class="method-chip" href="/algorithms?method=${encodeURIComponent(m)}">${esc(m.replace('2×2 ',''))}<b>${count(m)}</b></a>`).join('')}${p==='5x5'?'<a class="method-chip" href="/5x5">Lộ trình cơ bản → nâng cao</a>':''}${p==='4x4'?'<a class="method-chip" href="/4x4">Lộ trình cơ bản → nâng cao</a>':''}${p==='sq1'?'<a class="method-chip" href="/guide#square1">29 hình cơ bản <b>Hướng dẫn</b></a>':''}</div><div class="puzzle-card-footer"><span>${ms.length} bộ công thức · ${total} case</span><a href="/methods?puzzle=${p}">Khám phá ${icon('arrow-right')}</a></div></article>`;
}

function card(c) {
  let s = state(c.id);
  return `<article class="algorithm-card"><div style="position:relative"><a href="/algorithms/${c.id}" aria-label="Xem chi tiết ${esc(c.name)}">${visual(c)}</a><span class="badge" style="position:absolute;top:10px;left:10px">${c.method} #${String(c.number).padStart(2, "0")}</span><button class="icon-btn favorite-btn ${s.favorite ? "saved" : ""}" style="position:absolute;right:6px;top:6px" data-action="favorite" data-id="${c.id}" aria-label="${s.favorite ? "Bỏ lưu" : "Lưu"} ${esc(c.name)}" aria-pressed="${!!s.favorite}">${icon(s.favorite ? "bookmark-check" : "bookmark")}</button></div><div class="card-body"><div class="card-name"><h3><a href="/algorithms/${c.id}">${esc(c.name)}</a></h3>${s.learned ? '<span class="badge green">✓ Đã thuộc</span>' : ""}</div><div class="card-category">${esc(c.category)}</div><div class="alg-line">${esc(c.algorithm) || "Ô công thức trống tại nguồn"}</div>${c.algorithm.length > 45 ? `<details><summary>Xem đầy đủ</summary><div class="full-alg">${esc(c.algorithm) || "Ô công thức trống tại nguồn"}</div></details>` : ""}${c.alternatives.length ? `<a class="variant-link" href="/algorithms/${c.id}">${c.alternatives.length} biến thể · Xem chi tiết</a>` : ""}${referenceCard(c)}</div><div class="card-actions"><button data-action="copy" data-id="${c.id}" ${!c.algorithm ? "disabled" : ""}>${icon("copy")} Sao chép</button><button class="${s.learned ? "learned" : ""}" data-action="learned" data-id="${c.id}" ${!c.algorithm ? "disabled" : ""} aria-pressed="${!!s.learned}">${icon(s.learned ? "circle-check" : "circle")} ${s.learned ? "Đã thuộc" : "Đánh dấu"}</button></div></article>`;
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
    `<div class="intro"><div><h1>Sẵn sàng cho bước tiến mới? <span style="font-size:22px">✦</span></h1><p>Một công thức mới hôm nay. Một lần giải tốt hơn ngày mai.</p></div><span class="date-chip">${icon("calendar-days")}${new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" }).format(new Date())}</span></div><section class="hero"><div class="hero-content"><span class="eyebrow">${icon("sparkles")} KHÔNG GIAN DÀNH CHO SPEEDCUBER</span><h1>Làm chủ mọi<br>công thức Rubik</h1><p>Khám phá, ghi nhớ và luyện tập thuật toán theo cách của bạn. Tất cả trong một không gian.</p><div class="actions"><a class="btn primary" href="/algorithms">Khám phá thuật toán ${icon("arrow-right")}</a><a class="btn light" href="/practice">${icon("play")} Bắt đầu luyện tập</a></div></div><div class="hero-art"><div class="orbit"></div><div class="cube-art">${cubeArt()}</div><span class="art-label">${icon("sparkles")} Your next personal best starts here</span></div></section>${stats()}<section><div class="section-heading"><div><h2>Chọn Rubik của bạn</h2><p>Mỗi loại Rubik, một hành trình chinh phục.</p></div><a class="text-link" href="/puzzles">Tất cả danh mục ${icon("arrow-right")}</a></div><div class="puzzle-grid">${puzzleCodes().map(puzzleCard).join("")}</div></section><div class="lower-grid"><section><div class="section-heading"><h2>${recent.length ? "Tiếp tục hành trình" : "Bắt đầu khám phá"}</h2><a class="text-link" href="/algorithms">Xem thư viện ${icon("arrow-right")}</a></div><div class="recent-list">${suggest.map((c) => `<a class="recent-row" href="/algorithms/${c.id}"><div class="mini-image"><img src="${esc(c.images[0])}" alt="" width="37" height="37" loading="lazy"></div><div><strong>${esc(c.name)}</strong><p>${esc(names[c.method])} · ${esc(puzzleName(c.puzzle))}</p></div><span class="badge ${state(c.id).learned ? "green" : ""}">${state(c.id).learned ? "✓ Đã thuộc" : "Khám phá"}</span><span class="icon-btn">${icon("chevron-right")}</span></a>`).join("")}</div></section><section><div class="section-heading"><h2>Luyện một chút, nhớ lâu hơn</h2></div><div class="practice-banner"><span class="icon-tile">${icon("zap")}</span><h3>Biến công thức thành phản xạ</h3><p>Nhìn hình, nhớ công thức và kiểm tra đáp án. Bạn đã sẵn sàng chưa?</p><a class="btn primary" href="/practice">${icon("play")} Vào phòng luyện tập ${icon("arrow-right")}</a><small>Không áp lực thời gian. Tiến bộ theo nhịp của bạn.</small></div></section></div>`;
  hydrate();
}
function options(vals, selected, all) {
  return (
    `<option value="">${all}</option>` +
    vals
      .map(
        (v) =>
          `<option value="${esc(v)}" ${v === selected ? "selected" : ""}>${esc(puzzleCodes().includes(v) ? puzzleName(v) : v)}</option>`,
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
    `<div class="library-layout"><aside class="filter-panel" id="filters" aria-label="Bộ lọc"><button class="icon-btn filter-close" data-action="close-filter" aria-label="Đóng bộ lọc">${icon("x")}</button><h3>${icon("sliders-horizontal")} Bộ lọc</h3><label class="field"><span>Loại Rubik</span><select id="f-puzzle">${options(puzzleCodes(), filters.puzzle, "Tất cả Rubik")}</select></label><label class="field"><span>Phương pháp</span><select id="f-method">${options(methods(filters.puzzle), filters.method, "Tất cả phương pháp")}</select></label><label class="field"><span>Nhóm case</span><select id="f-category"></select></label><label class="field"><span>Trạng thái học</span><select id="f-status"><option value="">Tất cả case</option value="new">Chưa học</option><option value="learned">Đã thuộc</option><option value="review">Cần luyện thêm</option><option value="favorite">Đã lưu</option></select></label><button class="btn" data-action="reset">${icon("rotate-ccw")} Xóa bộ lọc</button><p class="filter-note">Bộ lọc được ghi nhớ trên thiết bị của bạn.</p></aside><section><div class="toolbar"><button class="btn filter-toggle" data-action="filter" aria-label="Mở bộ lọc" aria-expanded="false">${icon("sliders-horizontal")}<span>Bộ lọc</span></button><label class="search-box">${icon("search")}<input id="case-search" aria-label="Tìm theo tên, số hoặc công thức" placeholder="Tên, số case, công thức…" value="${esc(query)}"></label><select id="f-sort" aria-label="Sắp xếp"><option value="number">Theo số case</option><option value="length">Công thức ngắn</option></select></div><div class="result-meta" id="result-meta"></div><div class="algorithm-grid" id="case-grid"></div><div id="pagination"></div></section></div><p class="source-note">Dữ liệu CubeZone, J Perm, CubeSkills & case từ ảnh tham chiếu. Bộ gốc: <a href="https://cubezone.be/" target="_blank" rel="noopener">Lars Vandenbergh · CubeZone</a>. Số thứ tự theo nguồn, không mặc định là hệ đánh số WCA. <a href="/guide#source">Xem tình trạng kiểm chứng</a>.</p>`;
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
          c.name + " " + c.puzzle +
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
    `<div class="detail-grid"><section class="detail-visual">${visual(c)}<div class="visual-caption">${c.puzzle === "sq1" ? (c.method === "CS" ? "Trên: tầng trên · Dưới: tầng dưới nhìn từ dưới" : "Trái: mặt trên · Phải: mặt dưới nhìn từ dưới") : (["4x4","5x5"].includes(c.puzzle) ? "Hình nhận diện theo nguồn của case; giữ đúng hướng cầm" : c.puzzle === "2x2" ? "Hình J Perm · giữ nguyên thứ tự và hướng nhìn của nguồn" : c.reference?.relation === "SAME_SEQUENCE" ? "Hình J Perm · cùng chuỗi công thức" : "Hình CubeZone · hướng cầm cho Cách 1")}<br>${c.puzzle === "5x5" ? "CubeSkills · VisualCube · 5×5" : c.puzzle === "4x4" ? "J Perm / CubeSkills · 4×4" : c.puzzle === "2x2" ? "Ortega 2×2" : c.method === "CS" ? "SVG mới · tham chiếu từ ảnh bạn cung cấp" : "Số thứ tự theo CubeZone"}</div>${motionPanel(c)}</section><section class="detail-content"><span class="badge">${esc(puzzleName(c.puzzle))}</span><span class="badge">${c.method} #${c.number}</span><h1>${esc(c.name)}</h1><p>${esc(names[c.method])} · ${esc(c.category)}</p><div class="algorithm-block"><label>${c.reference ? "CÁCH 1 · CUBEZONE" : "CÔNG THỨC CHÍNH"}</label><code>${esc(c.algorithm) || "Ô công thức trống tại nguồn"}</code><button class="btn primary" data-action="copy" data-id="${id}" ${!c.algorithm ? "disabled" : ""}>${icon("copy")} Sao chép công thức</button><button class="btn" data-motion-index="0" ${!c.algorithm ? 'disabled' : ''}>${icon("play")} Xem xoay 3D</button></div>${jpermCredit(c)}${c.alternatives.map((alg, i) => alternativeBlock(c,alg,i)).join("")}<div class="actions"><button class="btn ${state(id).learned ? "green" : ""}" data-action="detail-learned" data-id="${id}" ${!c.algorithm ? "disabled" : ""} aria-pressed="${!!state(id).learned}">${icon("circle-check")} ${state(id).learned ? "Đã thuộc" : "Đánh dấu đã thuộc"}</button><button class="btn" data-action="detail-favorite" data-id="${id}" aria-pressed="${!!state(id).favorite}">${icon("bookmark")} ${state(id).favorite ? "Đã lưu" : "Lưu case"}</button><a class="btn" href="/practice?method=${encodeURIComponent(c.method)}">${icon("zap")} Luyện tập</a></div><div class="guide-box"><h3>Cách đọc & hướng cầm</h3>${c.puzzle === "sq1" ? "<p>Giữ hướng mặt trên và mặt dưới như hình. (a,b) là số bước 30° của tầng trên và dưới; số âm xoay ngược chiều kim đồng hồ khi nhìn trực diện từng tầng. Dấu / xoay lát cắt 180°.</p>" : "<p>Đặt Rubik theo đúng hướng trong hình nguồn trước khi thực hiện. U là mặt trên, F là mặt trước, R là mặt phải. Dấu ' là ngược chiều kim đồng hồ khi nhìn thẳng vào mặt xoay; 2 là xoay 180°.</p>"}${c.puzzle === "5x5" ? `<p><strong>Rw/Lw/Uw/Dw:</strong> hai lớp ngoài liền nhau. <strong>3Rw/3Lw/3Dw:</strong> ba lớp tương ứng. <strong>M:</strong> chỉ lớp chính giữa theo chiều L; M' theo chiều R. <strong>[z' y']:</strong> xoay toàn khối z' rồi y' trước chuỗi chính.</p><a href="/5x5#notation">Ký hiệu & lộ trình 5×5</a>` : ""}${c.puzzle === "4x4" ? `<p><strong>Rw / Uw:</strong> xoay hai lớp ngoài cùng tương ứng. <strong>3Rw:</strong> xoay ba lớp bên phải. <strong>2R:</strong> chỉ lớp thứ hai từ bên phải; 2R2 là lớp đó xoay 180°. <strong>M:</strong> cả hai lớp giữa theo chiều L, M' theo chiều R. <strong>x/y/z:</strong> xoay toàn khối. Công thức đã mở rộng [*], có thể sao chép trực tiếp.</p><a href="/4x4#notation">Ký hiệu & lộ trình 4×4</a>` : ""}<div class="notation-row">${(c.puzzle ===
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
          [c.puzzle === "5x5" ? "Rw" : "r", "Hai lớp bên phải"],
          ["x y z", "Xoay toàn khối"],
        ]
    )
      .filter(([v])=>c.puzzle !== "2x2" || v !== "r")
      .map(
        ([v, t]) => `<abbr class="notation" title="${esc(t)}">${esc(v)}</abbr>`,
      )
      .join(
        "",
      )}</div><p><a href="/guide">Xem giải thích ký hiệu đầy đủ</a></p></div><p class="source-note">${esc(c.description)}<br><a href="${c.sourceUrl}" target="_blank" rel="noopener">${c.puzzle === "5x5" ? "Mở PDF nguồn CubeSkills 5×5" : c.puzzle === "4x4" ? "Mở tài liệu nguồn 4×4" : c.puzzle === "2x2" ? "Mở trang nguồn J Perm" : c.method === "CS" ? "Xem ảnh tham chiếu" : "Mở trang nguồn CubeZone"} ${icon("external-link")}</a></p></section></div><div class="detail-nav">${index > 0 ? `<a class="btn" href="/algorithms/${siblings[index - 1].id}">${icon("arrow-left")} Case trước</a>` : "<span></span>"}${index < siblings.length - 1 ? `<a class="btn" href="/algorithms/${siblings[index + 1].id}">Case tiếp theo ${icon("arrow-right")}</a>` : ""}</div>`;
  hydrate();
  mountMotion(c);
  if(location.hash === "#jperm") document.getElementById("jperm")?.scrollIntoView({block:"start"});
}
function methodPage() {
  let p = params.get("puzzle") || "3x3";
  $("#main").innerHTML =
    crumb([
      ["Danh mục Rubik", "/puzzles"],
      [puzzleName(p)],
    ]) +
    title(
      "Khám phá " + puzzleName(p),
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
      )}</div>${p === "sq1" ? '<div class="guide-box"><h3>Cube Shape & Parity</h3><p><a class="btn primary" href="/algorithms?method=CS">5 case Cube Shape mới</a> <a class="btn" href="/practice?method=CS">Luyện Cube Shape</a></p><p>Cube Shape có 29 hình dạng một tầng, 90 tổ hợp hai tầng; nguồn trình bày như hướng dẫn, không phải 90 công thức độc lập. Parity nằm trong các nhóm hoán vị cạnh, không được đếm thành bộ case trùng lặp.</p><a href="/guide#square1">Đọc hướng dẫn Square-1</a></div>' : ""}`;
  if(p === "4x4") $(".page-title", $("#main")).insertAdjacentHTML("afterend", `<div class="guide-box"><h3>Học 4×4 từ cơ bản đến nâng cao</h3><p>Ghép tâm, ghép cạnh, Yau và 3–2–3 trước khi học các mẹo parity.</p><a class="btn primary" href="/4x4">Mở lộ trình học ${icon("arrow-right")}</a></div>`);
  if(p === "5x5") $(".page-title", $("#main")).insertAdjacentHTML("afterend", `<div class="guide-box"><h3>Học 5×5 từ cơ bản đến nâng cao</h3><p>Ghép tâm, ghép cạnh, Free Slice và các trường hợp hai cạnh cuối.</p><a class="btn primary" href="/5x5">Mở lộ trình học ${icon("arrow-right")}</a></div>`);
  hydrate();
}
function progressPage() {
  $("#main").innerHTML =
    crumb([["Tiến độ học tập"]]) +
    title(
      "Nhìn lại từng bước tiến",
      "Tiến bộ được tạo nên từ những lần luyện tập nhỏ mỗi ngày.",
    ) +
    guestProgressBanner()+stats() +
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
      )}</div><div class="guide-box"><h3>Tiến độ thuộc về bạn</h3><p>${currentUser?"Tiến độ được lưu theo tài khoản. Bạn có thể xuất bản sao hoặc nhập và hợp nhất dữ liệu đã học.":"Dữ liệu khách lưu trên trình duyệt này. Đăng nhập để lưu theo tài khoản và tiếp tục ở thiết bị khác."}</p><div class="actions"><button class="btn" data-action="export">${icon("download")} Xuất tiến độ</button><button class="btn" data-action="import">${icon("upload")} Nhập tiến độ</button><input type="file" id="import-progress" accept="application/json" hidden></div></div>`;
  $("#import-progress").onchange = importProgress;
  hydrate();
}
function practicePage() {
  const stage=params.has("stage")?roadmapData?.stages.find(s=>s.id===params.get("stage")&&!s.manual):null;
  if(params.has("stage")&&!stage){$("#main").innerHTML=`<div class="empty"><h2>Chặng luyện không có trong lộ trình hiện tại</h2><a class="btn primary" href="/roadmap">Về lộ trình của tôi</a></div>`;return;}
  let initial = stage?.method || params.get("method") || "OLL",
    p = data.find((c) => c.method === initial)?.puzzle || "3x3";
  $("#main").innerHTML =
    crumb([["Phòng luyện tập"]]) +
    title(
      "Một case. Một bước tiến.",
      "Nhìn hình, nhớ công thức rồi kiểm tra đáp án. Luyện theo nhịp của bạn.",
    ) +
    `<div class="practice-wrap"><div class="practice-config"><label>Loại Rubik<select id="p-puzzle">${options(puzzleCodes(), p, "Tất cả Rubik")}</select></label><label>Phương pháp<select id="p-method">${options(methods(p), initial, "Tất cả phương pháp")}</select></label><label>Phạm vi<select id="p-scope"><option value="all">Tất cả case</option><option value="new">Chưa thuộc</option><option value="review">Cần luyện thêm</option><option value="favorite">Đã lưu</option></select></label></div><div id="practice-stage"></div><div class="keyboard-help"><kbd>Space</kbd> Hiện đáp án <span> · </span><kbd>1</kbd> Đã thuộc <span> · </span><kbd>2</kbd> Cần luyện <span> · </span><kbd>→</kbd> Bỏ qua</div></div>`;
  if(stage){$("#p-puzzle").disabled=true;$("#p-method").disabled=true;$(".practice-wrap").insertAdjacentHTML("afterbegin",`<section class="account-banner"><div><strong>${esc(stage.title)}</strong><p>Đang luyện đúng ${stage.caseIds.length} case của chặng.</p></div><a class="btn" href="/practice?method=${encodeURIComponent(stage.method)}">Mở rộng phạm vi</a></section>`);}
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
  $(".practice-wrap").insertAdjacentHTML("afterbegin", `<section class="account-banner"><div><strong>Muốn học theo nhóm nhỏ và có lịch ôn?</strong><p>${currentUser?"Các lượt luyện ở đây cũng được lưu vào thống kê của bạn.":"Đăng nhập để lưu lịch ôn và kết quả theo tài khoản."}</p></div><a class="btn" href="/study">Buổi học 3–5 case</a></section>`);
  nextCase();
}
function nextCase() {
  let p = $("#p-puzzle").value,
    m = $("#p-method").value,
    s = $("#p-scope").value;
  let pool = data.filter(
    (c) =>
      c.algorithm &&
      (!params.has("stage") || roadmapData?.stages.find(stage=>stage.id===params.get("stage"))?.caseIds.includes(c.id)) &&
      (!p || c.puzzle === p) &&
      (!m || c.method === m) &&
      (s === "all" || (s === "new" ? !state(c.id).learned : state(c.id)[s])),
  );
  let candidates = pool.filter((c) => c.id !== practice?.id);
  if (!candidates.length) candidates = pool;
  revealed = false;
  practice = candidates[Math.floor(Math.random() * candidates.length)];
  round++;
  practiceAttemptId=crypto.randomUUID();practicePendingGrade=null;practiceRecognitionMs=0;startRecallClock();
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
    `<article class="practice-card"><div class="practice-card-head"><span class="badge">${c.method} · ${esc(puzzleName(c.puzzle))}</span><span>Lượt ${round} · ${sessionLearned} lần nhớ đúng</span></div>${visual(c)}<div class="practice-answer">${revealed ? `<h2>${esc(c.name)}</h2><code>${esc(c.algorithm) || "Ô công thức trống tại nguồn"}</code>${c.reference?.relation === "ALTERNATIVE_SEQUENCE" ? `<p><a class="text-link" href="/algorithms/${c.id}#jperm">Xem Cách 2 · J Perm và hướng cầm</a></p>` : ""}<div class="actions"><button class="btn" data-action="rate-review">${icon("repeat-2")} Chưa nhớ</button><button class="btn" data-action="rate-hard">Nhớ một phần</button><button class="btn green" data-action="rate-learned">${icon("check")} Đã thuộc</button><button class="btn" data-action="copy" data-id="${c.id}" aria-label="Sao chép đáp án">${icon("copy")}</button></div>` : `<h2>Bạn nhớ công thức này chứ?</h2><p style="font-size:11px;margin:0 0 20px">Quan sát hình và thử nhớ các bước xoay.</p><button class="btn primary" data-action="reveal">${icon("eye")} Hiện đáp án</button>`}<div style="margin-top:16px"><button class="btn" data-action="skip">Bỏ qua ${icon("arrow-right")}</button></div></div></article>`;
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
      )}</table></section><section class="guide-box" id="square1"><h3>Square-1 có ký hiệu riêng</h3><p><a class="btn primary" href="/algorithms?method=CS">Khám phá 5 case Cube Shape mới</a></p><p><strong>(a,b)</strong>: xoay tầng trên a bước và tầng dưới b bước, mỗi bước 30°. Chiều dương là chiều kim đồng hồ khi nhìn trực diện tầng đó. <strong>/</strong>: xoay lát cắt 180°.</p><p>Hai hình nguồn lần lượt là mặt trên nhìn từ trên và mặt dưới nhìn từ dưới. Giữ đúng hướng trước khi bắt đầu; chỉ cắt khi các mảnh cho phép.</p><p><strong>Cube Shape:</strong> nguồn liệt kê 29 hình dạng một tầng và 90 tổ hợp hai tầng, cùng hướng dẫn ghép cạnh. Không có bảng 90 công thức đi kèm trong HTML hiện tại.</p><p><strong>CO:</strong> nguồn mô tả là bước trực giác, minh họa 5 ví dụ. Chúng được lưu như ví dụ nguồn, không coi là một bộ CO đầy đủ theo chuẩn khác.</p><p><strong>Parity:</strong> các nhóm EP bao gồm trường hợp hoán vị lẻ; nguồn không có trang parity riêng.</p><a href="https://cubezone.be/square1notation.html" target="_blank" rel="noopener">Ký hiệu Square-1 tại nguồn ${icon("external-link")}</a><p><a href="https://cubezone.be/square1step1.html" target="_blank" rel="noopener">Hướng dẫn Cube Shape tại nguồn</a></p></section></div><section class="guide-box"><h3>Phòng nghiên cứu Cross</h3><p>Thử sức với 102 bài Cross một màu, 3.672 bài hai màu đối diện và 40 bài color neutral từ nghiên cứu của CubeZone. Các bài có scramble và lời giải, được tách khỏi case nhận diện.</p><a class="btn primary" href="/cross">Mở bài tập Cross</a></section><section class="guide-box"><h3>Rubik 2×2 — Ortega</h3><p>Hoàn thành một mặt, dùng OLL để hoàn thành mặt đối diện, rồi dùng PBL để hoán vị cả hai tầng. Nguồn J Perm có 7 OLL và 5 PBL; PBL giữ nguyên hai hình và góc nhìn từ nguồn. 2×2 không có lớp giữa M/E/S.</p><a class="btn primary" href="/methods?puzzle=2x2">Khám phá Rubik 2×2</a></section><section class="guide-box" id="source"><h3>Dữ liệu & tình trạng kiểm chứng</h3><p>Thư viện gốc được nhập từ các trang HTML công khai của Lars Vandenbergh tại <a href="https://cubezone.be/" target="_blank" rel="noopener">CubeZone</a>. Bản quyền nội dung và hình ảnh thuộc tác giả gốc; không có tuyên bố cấp phép lại. Cần được tác giả cho phép trước khi phân phối công khai bộ ảnh.</p><p>“Đã đối chiếu nguồn” nghĩa là importer ghép hình và công thức trong cùng ô hoặc bảng nguồn, có kiểm tra số lượng và tệp ảnh. Có 1 ô ZB F2L trống tại nguồn (ConF2L_1, vị trí 6), được giữ hình và loại khỏi luyện tập. Chưa kiểm chứng trạng thái bằng bộ giải độc lập; vì vậy ứng dụng không cung cấp mô phỏng xoay.</p><p>Năm case CS là bộ bổ sung từ ảnh bạn cung cấp, có SVG mới và kiểm tra hình dạng riêng. Với các bộ gốc, số case là thứ tự tại CubeZone, không tự động tương đương số OLL/PLL của WCA hoặc một thư viện khác.</p><table class="guide-table"><thead><tr><th>Phương pháp</th><th>Đã nhập</th><th>Tình trạng</th></tr></thead><tbody>${methods()
      .map(
        (m) =>
          `<tr><td>${m}</td><td>${count(m)}</td><td>${m === "CS" ? "Ảnh tham chiếu · kiểm tra hình dạng" : "Đối chiếu HTML nguồn"}</td></tr>`,
      )
      .join("")}</tbody></table></section>`;
  $("#source").insertAdjacentHTML("beforebegin", `<section class="guide-box"><h3>Rubik 4×4 — cơ bản đến nâng cao</h3><p>57 mục từ J Perm và CubeSkills: Basic, L2E, OLL parity, PLL parity. Đọc hướng cầm, ký hiệu lớp trong và quy trình Yau trước khi luyện.</p><a class="btn primary" href="/4x4">Mở lộ trình học 4×4</a></section>`);
  $("#source").insertAdjacentHTML("beforebegin", `<section class="guide-box"><h3>Rubik 5×5 — Reduction & Free Slice</h3><p>12 L2E và 19 L2C từ CubeSkills; lộ trình học, edge parity và ký hiệu từ J Perm.</p><a class="btn primary" href="/5x5">Mở lộ trình học 5×5</a></section>`);
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
        review: s.review === true && s.learned !== true,
        favorite: s.favorite === true,
        updatedAt: Date.now(),
      };
    }
    if(currentUser) await importPersonal(valid);
    else {progress = { ...progress, ...valid };store.set("progress", progress);}
    progressPage();
    toast("Đã nhập tiến độ");
  } catch (error) {
    toast(error.message || "Tệp tiến độ không hợp lệ");
  }
}
document.addEventListener("click", async (e) => {
  let b = e.target.closest("[data-action]");
  if (!b || b.disabled || personalBusy) return;
  b.disabled=true;
  try {
  let a = b.dataset.action,
    id = b.dataset.id;
  if (a === "copy") copy(id);
  if (a === "copy-alt") copy(id, +b.dataset.index);
  if (a === "favorite" || a === "detail-favorite") {
    await update(id, { favorite: !state(id).favorite });
    toast(state(id).favorite ? "Đã lưu case" : "Đã bỏ lưu case");
    a.startsWith("detail") ? detail() : renderCards();
  }
  if (a === "learned" || a === "detail-learned") {
    await update(id, { learned: !state(id).learned, review: false });
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
    if(!revealed)practiceRecognitionMs=stopRecallClock();
    revealed = true;
    track(practice.id);
    practiceStage();
  }
  if (a === "skip") nextCase();
  if (a === "practice-all") {
    $("#p-scope").value = "all";
    nextCase();
  }
  if (a === "rate-review" || a === "rate-learned" || a === "rate-hard") {
    if (!revealed || !practice) return;
    let learned = a === "rate-learned";
    if(currentUser)await savePracticeRecall(a === "rate-learned"?"GOOD":a === "rate-hard"?"HARD":"AGAIN");
    else await update(practice.id, { learned, review: !learned });
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
  } catch(error) {toast(error.message || "Chưa lưu được tiến độ. Vui lòng thử lại.");}
  finally {if(b.isConnected)b.disabled=false;}
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
    let [response,puzzleResponse] = await Promise.all([fetch("/api/catalog"),fetch("/api/puzzles")]);
    if (!response.ok || !puzzleResponse.ok) throw Error();
    [data,puzzleTypes] = await Promise.all([response.json(),puzzleResponse.json()]);
    await loadIdentity();
    if(params.has("stage")){if(!currentUser){location.replace("/login?next="+encodeURIComponent(location.pathname+location.search));return;}roadmapData=await apiCall("/api/roadmap");}
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
      practice: "Luyện tập",timer:"Bấm giờ & Scramble",
      progress: "Tiến độ học tập",
      favorites: "Đã lưu",
      guide: "Ký hiệu & hướng dẫn",
      methods: "Chọn phương pháp",
      puzzles: "Danh mục Rubik",
      cross: "Bài tập Cross",
      "4x4": "Học Rubik 4×4",
      "5x5": "Học Rubik 5×5",
      login:"Đăng nhập",register:"Đăng ký",account:"Tài khoản",roadmap:"Lộ trình của tôi",admin:"Quản lý người học",study:"Ôn tập thông minh","study-stats":"Thống kê luyện tập",
    }[current];
    if (path === "/") {home();personalHome();}
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
        `<div class="puzzle-grid">${puzzleCodes().map(puzzleCard).join("")}</div>`;
    } else if (path === "/progress") progressPage();
    else if (path === "/practice") practicePage();
    else if (path === "/timer") await timerPage();
    else if (path === "/guide") guide();
    else if (path === "/cross") crossPage();
    else if (path === "/4x4") fourGuide();
    else if (path === "/5x5") fiveGuide();
    else if (path === "/login") authPage();
    else if (path === "/register") authPage(true);
    else if (path === "/account") accountPage();
    else if (path === "/roadmap") await roadmapPage();
    else if (path === "/admin") await adminPage();
    else if (path === "/study") await studyPage();
    else if (path === "/study-stats") await studyStatsPage();
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
      (c.name + " " + c.puzzle + " " + c.method + " " + c.number + " " + c.algorithm + " " + c.alternatives.join(" "))
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

function jpermImage(c, className = '') {
  const r=c.reference;
  return r?`<img class="${className}" src="${esc(r.imagePath)}" alt="${esc(r.caseName)} Perm — hình J Perm theo hướng cầm của công thức J Perm" loading="lazy" width="150" height="150">`:'';
}
function jpermCredit(c) {
  const r=c.reference;if(!r||r.relation!=='SAME_SEQUENCE')return '';
  return `<div class="reference-credit" id="jperm">${icon('image')} Hình minh họa từ <a href="${esc(r.sourceUrl)}" target="_blank" rel="noopener">J Perm · ${esc(r.caseName)}</a>. Công thức trùng sau khi chuẩn hóa ngoặc và lượt xoay liên tiếp.</div>`;
}
function referenceCard(c) {
  const r=c.reference;if(!r)return '';
  if(r.relation==='SAME_SEQUENCE')return `<a class="reference-card same" href="/algorithms/${c.id}#jperm">${icon('image')} Hình minh họa J Perm ${icon('arrow-up-right')}</a>`;
  return `<a class="reference-card" href="/algorithms/${c.id}#jperm">${jpermImage(c)}<span><strong>Cách 2 · J Perm</strong><small>${esc(r.caseName)} Perm · xem hướng cầm</small></span>${icon('chevron-right')}</a>`;
}
function alternativeBlock(c,alg,index) {
  const r=c.reference,jperm=r&&r.relation==='ALTERNATIVE_SEQUENCE'&&r.algorithm===alg;
  return `<section class="algorithm-block ${jperm?'jperm-alternative':''}" ${jperm?'id="jperm"':''}><label>${jperm?'CÁCH 2 · J PERM':'BIẾN THỂ '+(index+1)}</label>${jperm?`<div class="reference-recognition">${jpermImage(c)}<p>Đặt Rubik theo đúng hình J Perm trước khi thực hiện cách này. Hướng cầm có thể khác Cách 1.<br><a href="${esc(r.sourceUrl)}" target="_blank" rel="noopener">J Perm · ${esc(r.caseName)} ${icon('external-link')}</a></p></div>`:''}<code>${esc(alg)}</code><button class="btn ${jperm?'primary':''}" data-action="copy-alt" data-index="${index}" data-id="${c.id}">${icon('copy')} ${jperm?'Sao chép Cách 2':'Sao chép'}</button><button class="btn" data-motion-index="${index+1}">${icon('play')} Xem xoay 3D</button></section>`;
}

function cube4Art() {
  let tiles='';
  for(let y=0;y<4;y++)for(let x=0;x<4;x++)tiles+=`<rect x="${14+x*18}" y="${14+y*18}" width="15" height="15" rx="2" fill="${['#6366f1','#818cf8','#a5b4fc','#c7d2fe'][(x+y)%4]}"/>`;
  return `<svg viewBox="0 0 100 100" width="80" height="80" aria-hidden="true"><rect x="8" y="8" width="84" height="84" rx="12" fill="#312e81"/>${tiles}</svg>`;
}
function fourGuide() {
  const lessons = [
    ['01','Làm quen & ghép tâm','4×4 không có tâm cố định. Ghép hai thanh 1×2 thành tâm 2×2; dùng các góc để kiểm tra thứ tự màu. Với Reduction, hoàn thành cả sáu tâm trước khi ghép cạnh.','KWOZHbDdOeo'],
    ['02','Ghép từng cặp cạnh','Tìm hai wing cùng cặp màu. Đưa về vùng làm việc, slice để ghép, thay bằng cặp chưa giải rồi hoàn tác slice để phục hồi tâm. Nếu cùng tầng, dùng thao tác lật ở FR.','1M9DE1WyzO4'],
    ['03','Giải như 3×3 & xử lý parity','Sau khi đủ 12 cặp cạnh, chỉ xoay lớp ngoài để giải như 3×3. Học OLL parity và PLL parity trước. Parity có thể xuất hiện riêng hoặc cùng nhau; xử lý OLL parity trước khi hoàn tất OLL.','KWOZHbDdOeo'],
    ['04','Chuyển sang Yau','Thứ tự: hai tâm đối diện → ba cạnh cross → bốn tâm còn lại → cạnh cross cuối → tám cạnh còn lại → F2L, OLL, PLL. Giữ cross ở D trong giai đoạn ghép tám cạnh.','KWOZHbDdOeo'],
    ['05','Ghép cạnh 3–2–3 & L2E','Đưa ba cặp vào vùng slice rồi hoàn tác để ghép đồng thời. Tiếp tục ghép theo chu kỳ, học nhận diện hai cạnh cuối. Bộ L2E CubeSkills bên dưới có 5 ví dụ, trong đó case đầu có hai cách thay thế.','XfNVsSl30LQ'],
    ['06','Ba cạnh cross đầu','Luyện tìm wing, ghép đúng thứ tự màu và chèn cạnh mà vẫn giữ hai tâm. Ưu tiên nhìn trước cặp tiếp theo thay vì xoay nhanh rồi dừng tìm.','l6ZI7fp4bMo'],
    ['07','Half Centers','Tùy tình huống, tận dụng các nửa tâm có sẵn để giảm thao tác và dễ nhìn trước. Đây là lựa chọn bổ sung cho Yau, không bắt buộc dùng mọi lần giải.','JSf8RsgZwvg'],
    ['08','OLL parity nâng cao','Nhận diện trước OLL sau parity hoặc chọn cách bỏ qua OLL khi thật sự ngắn hơn. Bộ 27 case là các mẹo khi có ba cạnh định hướng; vẫn cần OLL thường cho các trạng thái khác.','NlVCP2ld9mQ'],
    ['09','PLL parity nâng cao','Học dần 22 case parity. Dùng cùng 21 PLL thường, không thay thế chúng. Lựa chọn hướng thực hiện parity có thể tạo PLL tiếp theo thuận tay hơn.','N7VQs8gEh54'],
    ['10','Tối ưu toàn bài','Theo dõi thời gian từng giai đoạn, giảm đổi hướng cầm, tận dụng thông tin vị trí wing và luyện nhìn trước. Tăng tốc dần sau khi giảm được các khoảng dừng.','sNVCshCH81k'],
  ];
  $('#main').innerHTML = crumb([['Danh mục Rubik','/puzzles'],['Rubik 4×4','/methods?puzzle=4x4'],['Lộ trình học']]) + title('Rubik 4×4: từ lần giải đầu đến Yau','Học theo từng giai đoạn, xem hình đúng hướng và luyện những case bạn cần.') +
    `<section class="guide-box"><span class="badge">J Perm + CubeSkills</span><h2>Bắt đầu ở đâu?</h2><p>Đã biết giải 3×3: học ghép tâm, ghép cạnh và hai parity cơ bản. Khi giải ổn định, chuyển sang Yau, 3–2–3, L2E và mẹo parity.</p><div class="actions"><a class="btn primary" href="/algorithms?method=${encodeURIComponent('4×4 Basic')}">3 công thức cơ bản</a><a class="btn" href="/practice?method=${encodeURIComponent('4×4 Basic')}">${icon('play')} Luyện ngay</a></div></section>
    <div class="method-grid">${lessons.map(([n,h,t,v])=>`<article class="method-card"><span class="badge">BƯỚC ${n}</span><h3>${h}</h3><p>${t}</p><a class="btn" href="https://www.youtube.com/watch?v=${v}" target="_blank" rel="noopener">${icon('play')} Xem bài J Perm ${icon('external-link')}</a></article>`).join('')}</div>
    <section class="guide-box" id="notation"><h2>Ký hiệu 4×4 — đọc trước khi xoay</h2><table class="guide-table"><thead><tr><th>Ký hiệu</th><th>Thao tác</th></tr></thead><tbody><tr><td>R, U, F, L, D, B</td><td>Một lớp ngoài cùng tương ứng; chiều kim đồng hồ khi nhìn trực diện mặt đó.</td></tr><tr><td>Rw, Uw, Lw…</td><td>Hai lớp liền nhau ở mặt tương ứng. 3Rw: ba lớp bên phải xoay cùng nhau.</td></tr><tr><td>2R</td><td>Chỉ lớp thứ hai tính từ bên phải. 2R2 là lớp này xoay 180°, khác với Rw2.</td></tr><tr><td>M / M′</td><td>Trong các công thức J Perm ở đây: cả hai lớp giữa, theo chiều L / R.</td></tr><tr><td>′ / 2</td><td>Ngược chiều kim đồng hồ / nửa vòng. Rw2′ cũng là nửa vòng.</td></tr><tr><td>x / y / z</td><td>Xoay toàn khối theo chiều R / U / F.</td></tr><tr><td>[*]</td><td>Nguồn dùng như viết tắt parity. Thư viện đã thay bằng toàn bộ chuỗi để Copy hoạt động trực tiếp.</td></tr></tbody></table><p>Chỉ thực hiện parity sau khi đã ghép các cạnh và tâm. PLL parity cơ bản có thể vẫn để lại PLL thường; cần quan sát lại trước bước tiếp theo.</p></section>
    <section class="guide-box"><h2>Thư viện luyện tập</h2><div class="actions">${['4×4 Basic','4×4 L2E','4×4 OLL','4×4 PLL'].map(m=>`<a class="btn" href="/algorithms?method=${encodeURIComponent(m)}">${esc(m)} · ${count(m)} case</a>`).join('')}<a class="btn" href="/algorithms?method=OLL">57 OLL thường</a><a class="btn" href="/algorithms?method=PLL">21 PLL thường</a></div></section>
    <section class="guide-box"><h2>Sửa tâm sai vị trí</h2><p>Nếu thứ tự màu các tâm không khớp với góc, cần kiểm tra và sửa tâm trước khi tiếp tục. Hai thao tác nguồn: đổi tâm U/F bằng <code>Rw′ F2 Rw2 U2 Rw′</code>; đổi tâm U/D bằng <code>Rw2 U2 D2 Rw2</code>. Các bước này có thể phá phần đã giải; quay lại ghép cạnh khi cần.</p><a href="https://jperm.net/4x4" target="_blank" rel="noopener">Xem hình và hướng dẫn gốc J Perm</a></section>
    <section class="guide-box"><h2>Nguồn & phạm vi</h2><p>57 mục 4×4: 3 cơ bản, 5 L2E CubeSkills, đủ 27 OLL parity và 22 PLL parity của J Perm. Cơ bản là thao tác dùng trong quy trình, không phải tất cả đều là lời giải hoàn chỉnh cho một scramble. Nguồn L2E ghi rõ đây là một tập con các khả năng L2E; phần tâm, cross và ghép cạnh còn cần học trực giác.</p><p><a href="https://jperm.net/4x4" target="_blank" rel="noopener">J Perm · cơ bản</a> · <a href="https://jperm.net/4x4/faster" target="_blank" rel="noopener">J Perm · nâng cao</a> · <a href="https://www.cubeskills.com/uploads/pdf/tutorials/useful-last-2-edges-algorithms-4x4.pdf" target="_blank" rel="noopener">CubeSkills · tài liệu L2E</a></p><p>Ảnh và công thức đã được đối chiếu theo nguồn, chưa kiểm chứng toàn bộ bằng solver 4×4 độc lập. Ảnh L2E được ghi công VisualCube của Conrad Rider trong tài liệu CubeSkills.</p></section>`;
  hydrate();
}

function cube5Art() {
  let cells='';
  for(let y=0;y<5;y++)for(let x=0;x<5;x++)cells+=`<rect x="${13+x*15}" y="${13+y*15}" width="12" height="12" rx="1.5" fill="${x===2&&y===2?'#fbbf24':['#818cf8','#a5b4fc','#c7d2fe'][(x+y)%3]}"/>`;
  return `<svg viewBox="0 0 100 100" width="80" height="80" aria-hidden="true"><rect x="7" y="7" width="86" height="86" rx="12" fill="#312e81"/>${cells}</svg>`;
}
function fiveGuide() {
  const flip="R U R' F R' F' R";
  const parity="Rw U2 x Rw U2 Rw U2 3Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'";
  const lessons=[
    ['01','Tâm đầu tiên','5×5 có viên tâm chính giữa cố định. Dùng nó làm mốc màu, ghép ba thanh 1×3 thành tâm 3×3. Có thể chọn màu nào thuận mắt để bắt đầu.','d1I-jJlVwB4'],
    ['02','Tâm đối diện & bốn tâm còn lại','Giữ tâm đầu ở D; tạo tâm đối diện mà vẫn khôi phục tâm đầu sau mỗi thao tác. Sau đó giữ hai tâm đối diện ở L/R để ghép các tâm còn lại.','d1I-jJlVwB4'],
    ['03','Hai tâm cuối — L2C','Tạo khối tâm 2×3 ở mặt trước rồi nhận diện phần còn lại theo hình. Bộ 19 công thức CubeSkills áp dụng cho điều kiện này; không dùng khi khối 2×3 chưa hoàn thành.','d1I-jJlVwB4'],
    ['04','Ghép ba mảnh thành một cạnh','Mỗi cạnh gồm một mảnh giữa và hai wing. Đưa các mảnh cùng màu vào vùng slice, ghép lại rồi cất cạnh hoàn chỉnh lên U/D. Dùng thao tác lật ở FR nếu cần.','d1I-jJlVwB4'],
    ['05','Hai cạnh cuối — L2E','Học 4 trường hợp không parity và 8 trường hợp parity. Quan sát vị trí từng wing và mảnh giữa; giữ đúng hướng hình trước khi áp dụng. Các biến thể có [z′ y′] đổi góc nhìn trước chuỗi chính.','d1I-jJlVwB4'],
    ['06','Giải như 3×3','Khi sáu tâm và đủ 12 cạnh đã hoàn thành, chỉ xoay lớp ngoài để giải F2L, OLL và PLL như 3×3. Nếu còn một cạnh chưa ghép, xử lý edge parity trước.','d1I-jJlVwB4'],
    ['07','Free Slice & lựa chọn Reduction / Yau5','Free Slice ghép tám cạnh đầu trong khi cho phép các lớp tâm lệch tạm thời; sau đó khôi phục tâm và giải bốn cạnh cuối. Xem ví dụ để biết lúc nào cất cạnh và lúc nào trả slice.','HtS1rHfhDEg'],
    ['08','Tối ưu tâm, cạnh & nhìn trước','Tận dụng thanh có sẵn, giảm đổi hướng cầm, quan sát wing tiếp theo khi đang chèn cạnh hiện tại. Luyện từng giai đoạn trước khi tăng tốc toàn bài.','A9X4OHrqupw'],
    ['09','Kỹ thuật chung cho big cubes','Điều chỉnh tốc độ xoay để giữ nhịp nhìn trước, luyện slice chính xác và dùng OLL/PLL ngoài cùng quen tay. Các mẹo big cubes có thể áp dụng cho 5×5 trở lên.','qfdmRCRGLDA'],
  ];
  $('#main').innerHTML=crumb([['Danh mục Rubik','/puzzles'],['Rubik 5×5','/methods?puzzle=5x5'],['Lộ trình học']])+title('Rubik 5×5: ghép tâm, ghép cạnh, chinh phục từng bước','Reduction, Free Slice, L2C và L2E — từ lần giải đầu đến luyện tốc độ.')+
    `<section class="guide-box"><span class="badge">J Perm + CubeSkills</span><h2>Bắt đầu với Reduction</h2><p>Biết giải 3×3 là đủ để bắt đầu: ghép sáu tâm → ghép 12 cạnh → giải như 3×3. Thư viện có đầy đủ 12 L2E trong tài liệu CubeSkills và 19 L2C cần công thức khi đã có khối tâm 2×3 phía trước.</p><div class="actions"><a class="btn primary" href="/algorithms?method=${encodeURIComponent('5×5 L2E')}">12 case hai cạnh cuối</a><a class="btn" href="/algorithms?method=${encodeURIComponent('5×5 L2C')}">19 case hai tâm cuối</a><a class="btn" href="/practice?method=${encodeURIComponent('5×5 L2E')}">${icon('play')} Luyện ngay</a></div></section>
    <div class="method-grid">${lessons.map(([n,h,t,v])=>`<article class="method-card"><span class="badge">BƯỚC ${n}</span><h3>${h}</h3><p>${t}</p><a class="btn" href="https://www.youtube.com/watch?v=${v}" target="_blank" rel="noopener">${icon('play')} Xem bài J Perm ${icon('external-link')}</a></article>`).join('')}</div>
    <section class="guide-box" id="basic"><h2>Hai thao tác cơ bản từ J Perm</h2><h3>Lật cạnh ở trước/phải (FR)</h3><p>Dùng khi ghép cạnh: slice → lật → hoàn tác slice để khôi phục tâm. Thao tác lật riêng không phải lời giải hoàn chỉnh cho mọi trường hợp ghép cạnh.</p><div class="algorithm-block"><code>${esc(flip)}</code><button class="btn" data-guide-alg="${esc(flip)}" id="five-copy-flip">${icon('copy')} Sao chép thao tác lật</button></div><h3>Edge parity — cạnh cuối chưa ghép</h3><p>Đặt cạnh chưa ghép ở trước/trên (UF). Chú ý <strong>3Rw′</strong>: xoay ba lớp bên phải; công thức này khác OLL parity cơ bản 4×4. Kiểm tra lại đủ 12 cạnh trước khi chuyển sang 3×3.</p><div class="algorithm-block"><code>${esc(parity)}</code><button class="btn primary" data-guide-alg="${esc(parity)}" id="five-copy-parity">${icon('copy')} Sao chép edge parity</button></div><p><a href="https://jperm.net/5x5" target="_blank" rel="noopener">Nguồn J Perm: bước 4, video 6:26 cho parity</a></p><p><strong>5×5 không có PLL parity như 4×4</strong> sau khi tâm và tất cả cạnh đã ghép đúng. Không áp dụng PLL parity 4×4 để xử lý cạnh 5×5 chưa hoàn thành.</p></section>
    <section class="guide-box" id="notation"><h2>Ký hiệu & hướng cầm</h2><table class="guide-table"><thead><tr><th>Ký hiệu</th><th>Cách thực hiện</th></tr></thead><tbody><tr><td>R, U, F, L, D, B</td><td>Một lớp ngoài cùng. Chiều kim đồng hồ khi nhìn thẳng vào mặt được xoay.</td></tr><tr><td>Rw, Lw, Uw, Dw</td><td>Hai lớp ngoài liền nhau ở mặt tương ứng.</td></tr><tr><td>3Rw, 3Lw, 3Dw</td><td>Ba lớp liền nhau tính từ mặt tương ứng, cùng xoay một lượt.</td></tr><tr><td>M / M′</td><td>Chỉ lớp chính giữa giữa L và R, theo chiều L / R. Khác cách dùng M trong bộ 4×4.</td></tr><tr><td>′ / 2 / 2′</td><td>Ngược chiều kim đồng hồ / nửa vòng / nửa vòng (cùng kết quả với 2).</td></tr><tr><td>x / y / z</td><td>Xoay toàn khối theo chiều R / U / F.</td></tr><tr><td>[z′ y′]</td><td>Thực hiện z′ rồi y′ trước phần còn lại. Đây là hướng cầm cho biến thể nguồn, không phải thao tác tùy chọn.</td></tr></tbody></table><p>Hình L2E giữ nguyên góc nhìn PDF; phần tối là sticker không cần nhận diện. Với L2C, giữ khối tâm 2×3 đã giải ở F. Thứ tự case của website theo từng hàng trong tài liệu, bỏ hình mẫu và hình Solved.</p></section>
    <section class="guide-box"><h2>Tiếp tục luyện tập</h2><div class="actions"><a class="btn primary" href="/practice?method=${encodeURIComponent('5×5 L2C')}">Luyện hai tâm cuối</a><a class="btn" href="/practice?method=${encodeURIComponent('5×5 L2E')}">Luyện hai cạnh cuối</a><a class="btn" href="/algorithms?method=OLL">57 OLL thường</a><a class="btn" href="/algorithms?method=PLL">21 PLL thường</a></div></section>
    <section class="guide-box"><h2>Nguồn & phạm vi</h2><p><a href="https://jperm.net/5x5" target="_blank" rel="noopener">J Perm · cơ bản</a> · <a href="https://jperm.net/5x5/faster" target="_blank" rel="noopener">J Perm · nâng cao</a> · <a href="https://www.cubeskills.com/uploads/pdf/tutorials/last-2-edges-algorithms-5x5.pdf" target="_blank" rel="noopener">CubeSkills · 12 L2E</a> · <a href="https://www.cubeskills.com/uploads/pdf/tutorials/last-2-centers-algorithms-5x5.pdf" target="_blank" rel="noopener">CubeSkills · L2C</a></p><p>31 mục nhận diện với 3 biến thể L2E. Hai thao tác cơ bản ở trang này không được đếm thêm thành case có hình. Ghép tâm và cạnh còn cần luyện trực giác theo video. Ảnh VisualCube của Conrad Rider được ghi công trong PDF CubeSkills. Hình và công thức được đối chiếu theo cùng cột; chưa kiểm chứng toàn bộ bằng solver 5×5 độc lập.</p></section>`;
  $$('[data-guide-alg]',$('#main')).forEach(button=>button.onclick=async()=>{
    try {await navigator.clipboard.writeText(button.dataset.guideAlg);toast('Đã sao chép công thức');}
    catch {toast('Không thể sao chép tự động. Vui lòng chọn chuỗi công thức và sao chép.');}
  });
  hydrate();
}
