"use strict";
/* =========================================================
   UmamiGo app logic.
   Order: data -> screen switching -> each screen's features
   -> feedback helpers -> usability logging. One file, no build step.
========================================================= */

/* ---------- 1. DATA ---------- */
// The five cuisine filters shown as chips.
const CUISINES = [
  { c:"JP", flag:"🇯🇵", label:"JP", name:"Japanese" },
  { c:"KR", flag:"🇰🇷", label:"KR", name:"Korean" },
  { c:"CN", flag:"🇨🇳", label:"CN", name:"Chinese" },
  { c:"TH", flag:"🇹🇭", label:"TH", name:"Thai" },
  { c:"VN", flag:"🇻🇳", label:"VN", name:"Vietnamese" },
];

// Restaurants. Each has a cuisine code, map position [x%, y%], and a small menu.
const RESTAURANTS = {
  sakura:{ c:"JP", name:"Sakura Ramen", flag:"🇯🇵", rate:"4.8", eta:"12 min", emoji:"🍜", loc:"🇯🇵 Osaka, Japan", pin:[30,38],
    desc:"Tonkotsu — born in Fukuoka in 1940, a rich pork-bone broth simmered 18 hours. Deeply savoury and warming.",
    menu:[ {n:"Tonkotsu Ramen",o:"🇯🇵 Fukuoka, Japan",sub:"Rich pork broth",p:12,e:"🍜"},
           {n:"Shoyu Ramen",o:"🇯🇵 Tokyo, Japan",sub:"Soy-based broth",p:11,e:"🍥"},
           {n:"Gyoza (6)",o:"🇯🇵 Japan",sub:"Pan-fried dumplings",p:6,e:"🥟"} ] },
  tokyobowl:{ c:"JP", name:"Tokyo Bowl", flag:"🇯🇵", rate:"4.5", eta:"22 min", emoji:"🍱", loc:"🇯🇵 Tokyo, Japan", pin:[60,30],
    desc:"Donburi rice bowls and fresh sushi sets, made to order in a tiny Shibuya-style kitchen.",
    menu:[ {n:"Chicken Katsu Don",o:"🇯🇵 Tokyo, Japan",sub:"Rice bowl",p:11,e:"🍱"},
           {n:"Salmon Nigiri (8)",o:"🇯🇵 Japan",sub:"Fresh sushi",p:13,e:"🍣"},
           {n:"Miso Soup",o:"🇯🇵 Japan",sub:"Tofu & seaweed",p:4,e:"🥣"} ] },
  kimchi:{ c:"KR", name:"Kimchi House", flag:"🇰🇷", rate:"4.6", eta:"18 min", emoji:"🍲", loc:"🇰🇷 Seoul, Korea", pin:[52,55],
    desc:"Kimchi jjigae — a fermented cabbage stew, tangy and deeply spicy, a staple of Korean home cooking.",
    menu:[ {n:"Kimchi Jjigae",o:"🇰🇷 Seoul, Korea",sub:"Fermented stew",p:13,e:"🍲"},
           {n:"Bibimbap",o:"🇰🇷 Korea",sub:"Mixed rice bowl",p:12,e:"🍚"},
           {n:"Tteokbokki",o:"🇰🇷 Korea",sub:"Spicy rice cakes",p:9,e:"🌶️"} ] },
  seoulbbq:{ c:"KR", name:"Seoul BBQ", flag:"🇰🇷", rate:"4.7", eta:"25 min", emoji:"🥩", loc:"🇰🇷 Busan, Korea", pin:[40,68],
    desc:"Korean barbecue plates with bulgogi and all the classic banchan side dishes.",
    menu:[ {n:"Bulgogi Beef",o:"🇰🇷 Korea",sub:"Marinated grill",p:15,e:"🥩"},
           {n:"Japchae",o:"🇰🇷 Korea",sub:"Glass noodles",p:11,e:"🍜"},
           {n:"Kimchi Pancake",o:"🇰🇷 Korea",sub:"Crispy savoury",p:8,e:"🥞"} ] },
  golden:{ c:"CN", name:"Golden Wok", flag:"🇨🇳", rate:"4.7", eta:"15 min", emoji:"🥡", loc:"🇨🇳 Sichuan, China", pin:[72,44],
    desc:"Mapo tofu — silky tofu in a fiery Sichuan sauce of doubanjiang and numbing peppercorns.",
    menu:[ {n:"Mapo Tofu",o:"🇨🇳 Sichuan, China",sub:"Spicy silky tofu",p:11,e:"🥘"},
           {n:"Dim Sum (8)",o:"🇨🇳 Canton, China",sub:"Steamed assortment",p:14,e:"🥟"},
           {n:"Kung Pao Chicken",o:"🇨🇳 Sichuan, China",sub:"Peanuts & chilli",p:12,e:"🍗"} ] },
  bangkok:{ c:"TH", name:"Bangkok Street", flag:"🇹🇭", rate:"4.9", eta:"20 min", emoji:"🍛", loc:"🇹🇭 Bangkok, Thailand", pin:[34,60],
    desc:"Pad Thai — stir-fried rice noodles with tamarind, peanuts and lime, the icon of Thai street food.",
    menu:[ {n:"Pad Thai",o:"🇹🇭 Bangkok, Thailand",sub:"Tamarind noodles",p:11,e:"🍜"},
           {n:"Green Curry",o:"🇹🇭 Thailand",sub:"Coconut & basil",p:13,e:"🍛"},
           {n:"Tom Yum Soup",o:"🇹🇭 Thailand",sub:"Hot & sour",p:10,e:"🍲"} ] },
  pho:{ c:"VN", name:"Phở Saigon", flag:"🇻🇳", rate:"4.8", eta:"16 min", emoji:"🍲", loc:"🇻🇳 Hanoi, Vietnam", pin:[22,64],
    desc:"Phở bò — a clear beef broth simmered with star anise and cinnamon, served with rice noodles and herbs.",
    menu:[ {n:"Phở Bò",o:"🇻🇳 Hanoi, Vietnam",sub:"Beef noodle soup",p:12,e:"🍲"},
           {n:"Bánh Mì",o:"🇻🇳 Saigon, Vietnam",sub:"Baguette sandwich",p:8,e:"🥖"},
           {n:"Gỏi Cuốn (4)",o:"🇻🇳 Vietnam",sub:"Fresh spring rolls",p:7,e:"🥬"} ] },
};

// Current selections shared across screens.
let activeCuisine = null;     // which chip is selected (null = all)
let openRestaurant = "sakura";
let chosenDish = null;
let quantity = 1;
let spiceLevel = 0;           // 0..3
const SPICE_NAMES = ["Mild","Medium","Hot","Extra Hot"];


/* ---------- 2. SCREEN SWITCHING ---------- */
let currentScreen = "welcome";
function go(id){
  const from = document.getElementById(currentScreen);
  const to   = document.getElementById(id);
  if (from && from !== to){
    from.classList.remove("active");
    from.classList.add("leaving");
    setTimeout(() => from.classList.remove("leaving"), 340);
  }
  to.classList.add("active");
  // reset any scroll position on the new screen
  const sc = to.querySelector(".scroll") || to.querySelector(".confirm-body");
  if (sc) sc.scrollTop = 0;
  currentScreen = id;
  logEvent("screen", { screen:id });
}
function back(id){ go(id); }
// Return to the home map (used by the Order Confirmed back button).
function goHome(){
  go("home");
  setSheet("peek");
  buzz("soft");
  // reset the confirm screen so the next order starts fresh
  document.getElementById("starsRow").style.display = "none";
  document.getElementById("homeAfterRate").style.display = "none";
  document.querySelectorAll("#starsRow .s").forEach(s => s.classList.remove("lit"));
}


/* ---------- 3. HOME: build chips, pins, and the list ---------- */
function buildChips(){
  const wrap = document.getElementById("chips");
  wrap.innerHTML = "";
  CUISINES.forEach(cu => {
    const el = document.createElement("div");
    el.className = "chip";
    el.innerHTML = cu.flag + " " + cu.label + '<span class="dot"></span>';
    el.onclick = () => selectCuisine(el, cu);
    wrap.appendChild(el);
  });
  enableChipCarousel();
}

// Make the cuisine strip a carousel: it slides left/right with the finger
// (or mouse drag on desktop). A real drag suppresses the chip's click so you
// don't accidentally select a cuisine while swiping.
function enableChipCarousel(){
  const strip = document.getElementById("chips");
  let down = false, startX = 0, startScroll = 0, dragged = false;

  strip.addEventListener("pointerdown", e => {
    down = true; dragged = false;
    startX = e.clientX;
    startScroll = strip.scrollLeft;
    strip.classList.add("dragging");
  });
  strip.addEventListener("pointermove", e => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) dragged = true;     // it's a swipe, not a tap
    strip.scrollLeft = startScroll - dx;       // follow the finger
  });
  function end(){
    if (!down) return;
    down = false;
    strip.classList.remove("dragging");
  }
  strip.addEventListener("pointerup", end);
  strip.addEventListener("pointercancel", end);
  strip.addEventListener("pointerleave", end);
  // if the user dragged, cancel the click so no chip gets selected mid-swipe
  strip.addEventListener("click", e => { if (dragged){ e.stopPropagation(); e.preventDefault(); } }, true);
}

function buildPins(){
  const wrap = document.getElementById("mapPins");
  wrap.innerHTML = "";
  Object.entries(RESTAURANTS).forEach(([id, r]) => {
    const p = document.createElement("div");
    p.className = "pin";
    p.dataset.c = r.c;
    p.style.left = r.pin[0] + "%";
    p.style.top  = r.pin[1] + "%";
    p.onclick = () => openRestaurantProfile(id);
    p.innerHTML = '<svg viewBox="0 0 36 44"><path fill="#FF6B5C" d="M18 0C8 0 1 7 1 17c0 12 17 27 17 27s17-15 17-27C35 7 28 0 18 0z"/><circle cx="18" cy="17" r="7" fill="#fff"/></svg>';
    wrap.appendChild(p);
  });
}

// Fill the bottom sheet with restaurants matching the active cuisine.
function renderList(){
  const list = Object.entries(RESTAURANTS).filter(([id,r]) => !activeCuisine || r.c === activeCuisine);
  const cards = document.getElementById("sheetCards");
  const cu = CUISINES.find(x => x.c === activeCuisine);
  document.getElementById("sheetTitle").textContent = cu ? (cu.name + " restaurants") : "Nearby restaurants";
  document.getElementById("sheetCount").textContent = list.length + " found";

  cards.style.opacity = 0;
  setTimeout(() => {
    if (list.length === 0){
      cards.innerHTML = '<div class="sheet-empty">No restaurants nearby right now.</div>';
    } else {
      cards.innerHTML = list.map(([id,r]) =>
        '<div class="rcard" onclick="openRestaurantProfile(\'' + id + '\')">' +
          '<div class="thumb">' + r.emoji + '</div>' +
          '<div class="info"><div class="name">' + r.name + ' <span>' + r.flag + '</span></div>' +
          '<div class="meta"><span class="star">★ ' + r.rate + '</span><span>🕒 ' + r.eta + '</span></div></div>' +
          '<div class="chev">›</div>' +
        '</div>'
      ).join("");
    }
    cards.style.opacity = 1;
  }, 140);
}

// Tap a cuisine chip: filter the list, dim non-matching pins, expand the sheet.
function selectCuisine(el, cu){
  const wasActive = el.classList.contains("active");
  document.querySelectorAll("#chips .chip").forEach(x => x.classList.remove("active"));

  if (wasActive){
    activeCuisine = null;
    toast("Showing all cuisines");
  } else {
    activeCuisine = cu.c;
    el.classList.add("active");
    toast("Showing " + cu.name + " restaurants");
    setSheet("expanded");   // swipe-up feel: opening a cuisine reveals more
  }

  document.querySelectorAll("#mapPins .pin").forEach(p => {
    p.classList.toggle("dim", activeCuisine && p.dataset.c !== activeCuisine);
  });

  buzz("soft");
  logEvent("filter", { cuisine:activeCuisine });
  renderList();
}


/* ---------- 3a. HOME: draggable map + recenter on home ---------- */
// The map background (.map-pan) is translated by the finger drag.
// offX/offY track the current pan offset so centerOnHome() can animate to it.
let mapOffX = 0, mapOffY = 0;
const MAP_LIMIT = 90; // how far the map can slide, in px
function mapClamp(v){ return Math.max(-MAP_LIMIT, Math.min(MAP_LIMIT, v)); }
function applyMapTransform(x, y){
  document.getElementById("mapPan").style.transform = "translate(" + x + "px," + y + "px)";
}

(function enableMapDrag(){
  const map = document.getElementById("map");
  const pan = document.getElementById("mapPan");
  let dragging = false, startX = 0, startY = 0;

  map.addEventListener("pointerdown", e => {
    // ignore drags that start on a pin or the home icon (those are taps)
    if (e.target.closest(".pin")) return;
    dragging = true; startX = e.clientX; startY = e.clientY;
    pan.style.transition = "none";
    map.setPointerCapture(e.pointerId);
  });
  map.addEventListener("pointermove", e => {
    if (!dragging) return;
    applyMapTransform(mapClamp(mapOffX + (e.clientX - startX)), mapClamp(mapOffY + (e.clientY - startY)));
  });
  function endDrag(e){
    if (!dragging) return;
    dragging = false;
    mapOffX = mapClamp(mapOffX + (e.clientX - startX));
    mapOffY = mapClamp(mapOffY + (e.clientY - startY));
    pan.style.transition = "transform .25s ease-out";
  }
  map.addEventListener("pointerup", endDrag);
  map.addEventListener("pointercancel", endDrag);
})();

// Tap the home icon: smoothly pan the map so the home pin sits in the centre.
function centerOnHome(){
  const pan = document.getElementById("mapPan");
  // home pin is at 50%,60% of the pan layer; nudge the map so it reads centred
  pan.style.transition = "transform .6s cubic-bezier(.45,.05,.3,1)"; // ease-in-out
  mapOffX = 0; mapOffY = mapClamp(40);
  applyMapTransform(mapOffX, mapOffY);
  buzz("soft");
  toast("Centred on your location");
  logEvent("center_home");
}


/* ---------- 3b. HOME: swipe-up bottom sheet ---------- */
// The sheet slides between two positions using translateY:
//   0        = expanded (top sits just below the chips, set via --sheet-top)
//   peekPx() = peeking  (pushed down so only the first cards show)
// We measure where the chips end so the expanded sheet never hides behind them.
const SHEET_PEEK = 0.55;        // how much of the sheet to push down when peeking
let sheetState = "peek";

// Place the sheet's top just below the search bar + chips.
function positionSheet(){
  const top = document.querySelector(".home-top");
  const sheet = document.getElementById("sheet");
  if (!top || !sheet) return;
  const host = document.getElementById("host").getBoundingClientRect();
  const bottom = top.getBoundingClientRect().bottom - host.top + 8; // 8px gap
  sheet.style.setProperty("--sheet-top", bottom + "px");
}

function peekPx(){
  return document.getElementById("sheet").offsetHeight * SHEET_PEEK;
}
function setSheet(state){
  const sheet = document.getElementById("sheet");
  sheetState = state;
  sheet.style.transition = "transform .35s cubic-bezier(.25,.9,.3,1)";
  sheet.style.transform  = "translateY(" + (state === "peek" ? peekPx() : 0) + "px)";
}
function toggleSheet(){ setSheet(sheetState === "peek" ? "expanded" : "peek"); }

// Drag handling lives only on the header, so the list below can scroll freely.
(function enableSheetDrag(){
  const sheet  = document.getElementById("sheet");
  const header = document.getElementById("sheetHeader");
  let dragging = false, startY = 0, baseY = 0, moved = 0;

  header.addEventListener("pointerdown", e => {
    dragging = true;
    startY = e.clientY;
    baseY  = (sheetState === "peek") ? peekPx() : 0;
    moved  = 0;
    sheet.style.transition = "none";
    header.setPointerCapture(e.pointerId);   // keep receiving events even if the finger drifts
  });

  header.addEventListener("pointermove", e => {
    if (!dragging) return;
    moved = e.clientY - startY;               // positive = down, negative = up
    const y = Math.max(0, Math.min(peekPx(), baseY + moved));
    sheet.style.transform = "translateY(" + y + "px)";
  });

  function release(){
    if (!dragging) return;
    dragging = false;
    if (Math.abs(moved) < 6)  toggleSheet();        // barely moved = treat as a tap
    else if (moved > 0)       setSheet("peek");      // dragged down  -> peek
    else                      setSheet("expanded");  // dragged up    -> expand
    logEvent("sheet", { state: sheetState });
  }
  header.addEventListener("pointerup", release);
  header.addEventListener("pointercancel", release);
})();


/* ---------- 4. VOICE SEARCH ---------- */
function openVoice(){
  beginTask("T2");
  document.getElementById("heard").textContent = "";
  const g = document.getElementById("ghost");
  g.style.display = "block";
  g.textContent = 'Tap the mic and say “spicy ramen near me”';
  go("voice");
}
function closeVoice(){ stopWaves(); go("home"); }

let recognition = null;
function doVoice(){
  buzz("soft");
  startWaves();
  document.getElementById("micBig").classList.add("listening");
  logEvent("voice_start");

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR){
    try{
      recognition = new SR();
      recognition.lang = "en-US";
      recognition.onresult = ev => onHeard(ev.results[0][0].transcript);
      recognition.onerror  = () => onHeard("spicy ramen near me");
      recognition.onend    = () => { stopWaves(); document.getElementById("micBig").classList.remove("listening"); };
      recognition.start();
      document.getElementById("ghost").textContent = "Listening… speak now";
      return;
    } catch(e){ /* fall through to the simulated result below */ }
  }
  // If the browser has no speech API (or blocks the mic), simulate a result.
  document.getElementById("ghost").textContent = "Listening…";
  setTimeout(() => onHeard("spicy ramen near me"), 1700);
}
function onHeard(text){
  stopWaves();
  document.getElementById("micBig").classList.remove("listening");
  document.getElementById("ghost").style.display = "none";
  document.getElementById("heard").textContent = "“" + text + "”";
  buzz("double");
  endTask("T2");
  logEvent("voice_result", { text:text });
  setTimeout(() => { toast("Found spicy matches near you"); openRestaurantProfile("sakura"); }, 1000);
}
function startWaves(){ document.getElementById("waves").classList.add("on"); }
function stopWaves(){
  document.getElementById("waves").classList.remove("on");
  if (recognition){ try{ recognition.stop(); }catch(e){} }
}


/* ---------- 5. RESTAURANT PROFILE ---------- */
function openRestaurantProfile(id){
  openRestaurant = id;
  const r = RESTAURANTS[id];
  if (activeTask === "T1") endTask("T1");   // Task 1 done once a restaurant opens

  document.getElementById("rName").textContent  = r.name;
  document.getElementById("rName2").textContent = r.name;
  document.getElementById("rFlag").textContent  = r.flag;
  document.getElementById("rRate").textContent  = r.rate;
  document.getElementById("rRate2").textContent = r.rate;
  document.getElementById("rEmoji").textContent = r.emoji;
  document.getElementById("rLoc").textContent   = r.loc;
  document.getElementById("rDesc").textContent  = r.desc;

  const menu = document.getElementById("menuList");
  menu.innerHTML = "";
  r.menu.forEach((d, i) => {
    const row = document.createElement("div");
    row.className = "dishrow";
    row.onclick = () => openDish(i);
    row.innerHTML = '<div class="demoji">' + d.e + '</div>' +
      '<div class="dinfo"><div class="dn">' + d.n + '</div><div class="do">' + d.sub + '</div></div>' +
      '<div class="price">' + d.p + '€</div>';
    menu.appendChild(row);
  });

  buzz("soft");
  go("restaurant");
}


/* ---------- 6. DISH CUSTOMISE ---------- */
function openDish(i){
  beginTask("T3");
  const r = RESTAURANTS[openRestaurant];
  chosenDish = r.menu[i];
  quantity = 1;
  spiceLevel = 0;

  document.getElementById("dName").textContent   = chosenDish.n;
  document.getElementById("dName2").textContent  = chosenDish.n;
  document.getElementById("dRate").textContent   = r.rate;
  document.getElementById("dEmoji").textContent  = chosenDish.e;
  document.getElementById("dOrigin").textContent = chosenDish.o + " — " + chosenDish.sub;

  setSpice(0);
  changeQty(0);
  go("dish");
}

function setSpice(level){
  spiceLevel = Math.max(0, Math.min(3, level));
  document.getElementById("spiceThumb").style.left = (spiceLevel / 3) * 100 + "%";
  document.getElementById("spiceVal").textContent = SPICE_NAMES[spiceLevel] + (spiceLevel === 3 ? " 🔥🔥🔥" : "");
  buzz("tick");
  logEvent("spice", { level:spiceLevel });
}

// Let the spice slider be dragged with the finger.
(function enableSpiceDrag(){
  const track = document.getElementById("spiceTrack");
  let dragging = false;
  // Work out how far along the track the finger is (0 = far left, 1 = far right)
  // and turn that into a spice level from 0 to 3.
  function fromX(clientX){
    const rect = track.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setSpice(Math.round(pct * 3));
  }
  track.addEventListener("pointerdown", e => { dragging = true; fromX(e.clientX); track.setPointerCapture(e.pointerId); });
  track.addEventListener("pointermove", e => { if (dragging) fromX(e.clientX); });
  track.addEventListener("pointerup",   () => dragging = false);
  track.addEventListener("pointercancel", () => dragging = false);
})();

function changeQty(delta){
  quantity = Math.max(1, quantity + delta);
  document.getElementById("qtyNum").textContent = quantity;
  if (delta !== 0){ buzz("tick"); logEvent("qty", { qty:quantity }); }
  const total = chosenDish ? chosenDish.p * quantity : 12;
  document.getElementById("addLabel").textContent = "Add to Cart · " + total + "€";
}

function addToCart(){
  buzz("strong");        // haptic on confirm
  playChime();           // audio feedback
  if (session) session.tasks.T3.maxSpice = (spiceLevel === 3);
  endTask("T3");
  logEvent("add_to_cart", { dish:chosenDish.n, qty:quantity, spice:spiceLevel });

  const total = chosenDish.p * quantity;
  document.getElementById("cookLine").textContent = RESTAURANTS[openRestaurant].name + " is cooking";
  document.getElementById("cItem").textContent   = chosenDish.n + " ×" + quantity;
  document.getElementById("cItemP").textContent  = total + "€";
  document.getElementById("cTotal").textContent  = (total + 1.99).toFixed(2) + "€";
  go("confirm");
}


/* ---------- 7. ORDER CONFIRMED ---------- */
function toggleRate(){
  const row = document.getElementById("starsRow");
  row.style.display = row.style.display === "none" ? "flex" : "none";
  logEvent("rate_open");
}
function rate(v){
  document.querySelectorAll("#starsRow .s").forEach(s => s.classList.toggle("lit", +s.dataset.v <= v));
  buzz("soft");
  if (session) session.ratings.push(v);
  if (activeTask === "T5") endTask("T5");
  logEvent("rating", { stars:v });
  toast("Thanks for rating " + v + "★");
  // once they've rated, offer a clear way back to the home map
  document.getElementById("homeAfterRate").style.display = "flex";
}
function goTracking(){ beginTask("T4"); go("tracking"); runDelivery(); }


/* ---------- 8. LIVE TRACKING -> ARRIVAL ---------- */
let deliveryStarted = false;

function runDelivery(){
  if (deliveryStarted) return;
  deliveryStarted = true;

  const stages = document.querySelectorAll("#tracking .pstage");
  const fill   = document.getElementById("pfill");
  const route  = document.getElementById("trackRoute");
  const rider  = document.getElementById("riderG");
  const eta    = document.getElementById("etaVal");
  const routeLength = route.getTotalLength();   // total length of the dashed line
  let step = 2;   // "Confirmed" and "Cooking" are already done; start at "On the way"

  stages[0].classList.add("done");
  stages[1].classList.add("done");

  // Move the rider to a point along the route. percent goes from 0 (start) to 1 (home).
  // getPointAtLength gives us the (x, y) on the line, and CSS animates the move smoothly.
  rider.style.transition = "transform 2s ease-in-out";
  function moveRider(percent){
    const point = route.getPointAtLength(routeLength * percent);
    rider.setAttribute("transform", "translate(" + point.x + "," + point.y + ")");
  }

  // Walk through the remaining stages, one every 2.4 seconds.
  function advance(){
    if (step < stages.length){
      stages.forEach((s, i) => {
        s.classList.toggle("done", i < step);
        s.classList.toggle("active", i === step);
      });
      fill.style.width = (step / (stages.length - 1)) * 100 + "%";
      moveRider(step === 2 ? 0.5 : 1);            // halfway, then all the way home
      eta.textContent = Math.max(1, (stages.length - 1 - step) * 4) + " min";
      buzz("tick");
      logEvent("track_stage", { stage: step });
      step++;
      setTimeout(advance, 2400);
    } else {
      stages.forEach(s => { s.classList.add("done"); s.classList.remove("active"); });
      fill.style.width = "100%";
      moveRider(1);
      eta.textContent = "Arrived";
      endTask("T4");
      setTimeout(() => { beginTask("T5"); arrive(); }, 1200);
    }
  }
  advance();
}
function arrive(){ buzz("arrival"); playArrivalSound(); go("arrival"); }
function finishFlow(){
  toast("Tap “Rate this order” to finish");
  go("confirm");
  document.getElementById("starsRow").style.display = "flex";
}


/* ---------- 9. FEEDBACK HELPERS ---------- */
// buzz() = the multi-modal "haptic" cue. Real vibration on Android; on iOS
// (which blocks navigator.vibrate) we also flash the screen, shake the frame,
// and play a short tick so the cue is still felt/seen/heard.
const VIBE = { soft:15, tick:[8], double:[20,40,20], strong:[30,50,30], arrival:[80,60,80,60,120] };

function buzz(kind){
  const pattern = VIBE[kind] || 15;
  if (navigator.vibrate){ try{ navigator.vibrate(pattern); }catch(e){} }

  const flash = document.getElementById("buzz");
  flash.classList.remove("go"); void flash.offsetWidth; flash.classList.add("go");

  if (kind === "strong" || kind === "arrival" || kind === "double"){
    const ph = document.getElementById("phone");
    ph.classList.remove("shake"); void ph.offsetWidth; ph.classList.add("shake");
    setTimeout(() => ph.classList.remove("shake"), 420);
  }
  playTick(kind);
  logEvent("haptic", { kind:kind, vibrateAPI: !!navigator.vibrate });
}

// Small Web Audio helper for the audio feedback.
let audio = null;
function audioCtx(){
  if (!audio){ try{ audio = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} }
  if (audio && audio.state === "suspended") audio.resume();
  return audio;
}
function tone(freq, dur, type, vol, delay){
  const c = audioCtx(); if (!c) return;
  const osc = c.createOscillator(), gain = c.createGain();
  osc.type = type || "sine"; osc.frequency.value = freq;
  osc.connect(gain); gain.connect(c.destination);
  const t = c.currentTime + (delay || 0);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol || .15, t + .02);
  gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
  osc.start(t); osc.stop(t + dur);
}
function playTick(kind){
  if (kind === "soft" || kind === "tick") tone(220, .04, "square", .06, 0);
  else if (kind === "double"){ tone(300, .05, "square", .08, 0); tone(300, .05, "square", .08, .08); }
}
function playChime(){ tone(660, .12, "sine", .18, 0); tone(880, .18, "sine", .16, .1); }
function playArrivalSound(){ tone(523, .15, "triangle", .2, 0); tone(659, .15, "triangle", .2, .15); tone(784, .3, "triangle", .2, .3); }

// Small toast message.
let toastTimer = null;
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// Live clock in the status bars.
function tickClock(){
  const s = new Date().toTimeString().slice(0, 5);
  document.querySelectorAll(".clk").forEach(e => e.textContent = s);
}
setInterval(tickClock, 1000); tickClock();


/* ---------- 10. USABILITY LOGGING ---------- */
// Stores each test session (taps, timings, task completion) in localStorage,
// then computes descriptive statistics for the report.
const LOG_KEY = "umamigo_logs_v3";
let session = null;
let activeTask = null;
const TASK_LABELS = {
  T1:"Find a Japanese restaurant", T2:"Search spicy food by voice",
  T3:"Order a dish at max spice",  T4:"Track the delivery rider", T5:"Post-delivery action"
};

function loadAll(){ try{ return JSON.parse(localStorage.getItem(LOG_KEY)) || []; }catch(e){ return []; } }
function saveAll(a){ try{ localStorage.setItem(LOG_KEY, JSON.stringify(a)); }catch(e){} }

function startSession(){
  const pid = (document.getElementById("pidInput").value || "").trim() || ("P" + (loadAll().length + 1));
  session = { pid:pid, started:Date.now(), events:[], tasks:{}, ratings:[] };
  ["T1","T2","T3","T4","T5"].forEach(t => session.tasks[t] = { started:null, ended:null, taps:0, done:false });
  logEvent("session_start", { pid:pid });
  beginTask("T1");
  go("home");
  // wait one frame so the home screen is laid out, then place + show the sheet
  requestAnimationFrame(() => { positionSheet(); setSheet("peek"); });
  toast("Session started: " + pid);
}
function persist(){
  if (!session) return;
  const all = loadAll();
  const i = all.findIndex(s => s.pid === session.pid && s.started === session.started);
  if (i >= 0) all[i] = session; else all.push(session);
  saveAll(all);
}
function logEvent(type, data){
  if (!session) return;
  session.events.push(Object.assign({ t:Date.now() - session.started, type:type }, data || {}));
  if (type === "tap" && activeTask && session.tasks[activeTask]) session.tasks[activeTask].taps++;
  persist();
}
function beginTask(t){
  if (!session) return;
  activeTask = t;
  if (session.tasks[t].started == null) session.tasks[t].started = Date.now() - session.started;
  logEvent("task_start", { task:t });
}
function endTask(t){
  if (!session || !session.tasks[t] || session.tasks[t].done) return;
  session.tasks[t].ended = Date.now() - session.started;
  session.tasks[t].done = true;
  logEvent("task_complete", { task:t });
}

// Count every tap on an interactive element.
document.addEventListener("click", e => {
  if (!session) return;
  const el = e.target.closest("button,.chip,.rcard,.pin,.dishrow,.s,.spice-track,.mic-fab,.mic-big,.searchbar input");
  if (el) logEvent("tap", { target:(el.id || el.className || "el").toString().slice(0, 40) });
}, true);


/* ---------- 11. STATS PANEL + EXPORT ---------- */
function openLogs(){ document.getElementById("logPanel").classList.add("show"); renderStats(); }
function closeLogs(){ document.getElementById("logPanel").classList.remove("show"); }
function wipeLogs(){ if (confirm("Delete ALL logged sessions?")){ saveAll([]); renderStats(); } }

function mean(a){ return a.length ? a.reduce((x,y) => x + y, 0) / a.length : 0; }
function sd(a){ if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m)))); }
function median(a){ if (!a.length) return 0; const s = [...a].sort((x,y) => x - y), m = Math.floor(s.length/2); return s.length % 2 ? s[m] : (s[m-1] + s[m]) / 2; }

function renderStats(){
  const all = loadAll();
  const area = document.getElementById("statsArea");
  if (!all.length){ area.innerHTML = "<p style='color:#aaa'>No sessions logged yet. Run the app with a participant ID.</p>"; return; }

  const TASKS = ["T1","T2","T3","T4","T5"];
  const agg = {};
  TASKS.forEach(t => agg[t] = { times:[], taps:[], done:0 });
  all.forEach(s => TASKS.forEach(t => {
    const tk = s.tasks && s.tasks[t]; if (!tk) return;
    if (tk.done && tk.started != null && tk.ended != null){ agg[t].times.push((tk.ended - tk.started) / 1000); agg[t].done++; }
    if (typeof tk.taps === "number") agg[t].taps.push(tk.taps);
  }));

  const n = all.length;
  const ratings = all.flatMap(s => s.ratings || []);
  const events  = all.reduce((a,s) => a + (s.events ? s.events.length : 0), 0);

  let html = '<div class="statgrid">' +
    '<div class="statcard"><div class="k">Participants</div><div class="v">' + n + '</div></div>' +
    '<div class="statcard"><div class="k">Events logged</div><div class="v">' + events + '</div></div>' +
    '<div class="statcard"><div class="k">Mean rating</div><div class="v">' + (ratings.length ? mean(ratings).toFixed(1) + "★" : "—") + '</div></div>' +
    '<div class="statcard"><div class="k">Overall completion</div><div class="v">' + Math.round(mean(TASKS.map(t => agg[t].done / n)) * 100) + '%</div></div>' +
  '</div><table><tr><th>Task</th><th>Done</th><th>Mean t (s)</th><th>SD</th><th>Median</th><th>Taps</th></tr>';
  TASKS.forEach(t => {
    const a = agg[t];
    html += "<tr><td>" + t + " " + TASK_LABELS[t] + "</td><td>" + a.done + "/" + n + "</td>" +
      "<td>" + (a.times.length ? mean(a.times).toFixed(1) : "—") + "</td>" +
      "<td>" + (a.times.length > 1 ? sd(a.times).toFixed(1) : "—") + "</td>" +
      "<td>" + (a.times.length ? median(a.times).toFixed(1) : "—") + "</td>" +
      "<td>" + (a.taps.length ? mean(a.taps).toFixed(1) : "—") + "</td></tr>";
  });
  html += "</table>";

  html += '<h2 style="font-size:16px;margin:22px 0 6px">Sessions</h2><table><tr><th>PID</th><th>Done</th><th>Events</th><th>Rating</th><th>Date</th></tr>';
  all.forEach(s => {
    const done = TASKS.filter(t => s.tasks && s.tasks[t] && s.tasks[t].done).length;
    html += "<tr><td>" + s.pid + "</td><td>" + done + "/5</td><td>" + (s.events ? s.events.length : 0) + "</td>" +
      "<td>" + (s.ratings && s.ratings.length ? s.ratings[s.ratings.length-1] + "★" : "—") + "</td>" +
      "<td>" + new Date(s.started).toLocaleString() + "</td></tr>";
  });
  html += "</table>";
  area.innerHTML = html;
}

function summaryText(){
  const all = loadAll(), TASKS = ["T1","T2","T3","T4","T5"];
  let out = "UmamiGo usability test — " + all.length + " participants\n\nTask\tCompletion\tMean time (s)\tSD\tMedian\tMean taps\n";
  TASKS.forEach(t => {
    const times = [], taps = []; let done = 0;
    all.forEach(s => { const tk = s.tasks && s.tasks[t]; if (tk && tk.done && tk.started != null){ times.push((tk.ended - tk.started)/1000); done++; } if (tk) taps.push(tk.taps); });
    out += t + " " + TASK_LABELS[t] + "\t" + done + "/" + all.length + "\t" +
      (times.length ? mean(times).toFixed(1) : "-") + "\t" + (times.length > 1 ? sd(times).toFixed(1) : "-") + "\t" +
      (times.length ? median(times).toFixed(1) : "-") + "\t" + (taps.length ? mean(taps).toFixed(1) : "-") + "\n";
  });
  const r = all.flatMap(s => s.ratings || []);
  out += "\nMean rating: " + (r.length ? mean(r).toFixed(2) : "-") + " (n=" + r.length + ")\n";
  return out;
}
function copyStats(){ navigator.clipboard.writeText(summaryText()).then(() => toast("Summary copied")); }
function downloadJSON(){ download(new Blob([JSON.stringify(loadAll(), null, 2)], { type:"application/json" }), "umamigo_logs.json"); }
function downloadCSV(){
  const all = loadAll();
  const rows = [["pid","event_ms","type","detail"]];
  all.forEach(s => (s.events || []).forEach(e => {
    const extra = Object.assign({}, e); delete extra.t; delete extra.type;
    rows.push([s.pid, e.t, e.type, JSON.stringify(extra).replace(/"/g, "'")]);
  }));
  download(new Blob([rows.map(r => r.map(c => '"' + c + '"').join(",")).join("\n")], { type:"text/csv" }), "umamigo_events.csv");
}
function download(blob, name){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
  toast("Downloaded " + name);
}


/* ---------- 12. START UP ---------- */
buildChips();
buildPins();
renderList();
positionSheet();
// keep the sheet's top aligned below the chips if the window resizes / rotates
window.addEventListener("resize", () => { positionSheet(); setSheet(sheetState); });
// Unlock audio on the first tap (browsers require a user gesture for sound).
document.addEventListener("pointerdown", function unlock(){ audioCtx(); document.removeEventListener("pointerdown", unlock); }, { once:true });
// Register a tiny service worker so it installs as a PWA.
if ("serviceWorker" in navigator){
  const sw = "self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());self.addEventListener('fetch',e=>{});";
  try{ navigator.serviceWorker.register(URL.createObjectURL(new Blob([sw], { type:"text/javascript" }))).catch(() => {}); }catch(e){}
}
