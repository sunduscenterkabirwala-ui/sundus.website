/* ============================================================
   SUNDUS CLOTH CENTER — app.js
   Product data, rendering, quick-view modal, filters,
   mobile nav, app popup, contact form -> WhatsApp.
   ============================================================ */

'use strict';

/* Theme: light/dark toggle. Brand default is dark; choice persists. */
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('sundus-theme'); } catch (e) {}
  root.setAttribute('data-theme', (saved === 'light' || saved === 'dark') ? saved : 'dark');
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('sundus-theme', next); } catch (e) {}
    });
  });
})();

var WA_NUMBER = '923008653797';

function waLink(text) {
  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
}

function fmtRs(n) {
  return 'Rs ' + n.toLocaleString('en-PK');
}

/* ---------------- Product catalogue ----------------
   ASAL products sirf products.json se ate hain (owner/wahi file update
   karta hai). Yahan koi sample/jaali product NAHI rakha jata.
   File khaali ho to catalog imaandaar "jald aa rahi hai" halat me rehta
   hai — koi jaali card, koi jaali qeemat nahi. */
var PRODUCTS = [];
var PRODUCTS_LOADED = false;

function catalogEmptyHTML() {
  return '<div class="empty-state">' +
    '<p>Nayi collection jald aa rahi hai</p>' +
    '<span>Filhal stock aur qeematein WhatsApp par poochain — 0300 8653797</span>' +
    '<div style="margin-top:18px"><a class="wa-btn" href="' +
      waLink('Assalam-o-Alaikum! Mujhe Sundus Center ke taaza stock aur qeematon ki maloomat chahiye.') +
      '" target="_blank" rel="noopener">' + WA_ICON + ' WhatsApp par poochain</a></div>' +
    '</div>';
}

function loadProducts(done) {
  fetch('products.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : { products: [] }; })
    .then(function (data) {
      var list = (data && Array.isArray(data.products)) ? data.products : [];
      PRODUCTS = list.filter(function (p) {
        return p && p.name && typeof p.retail === 'number';
      }).map(function (p) {
        return {
          id: p.id || ('p-' + p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
          name: p.name,
          urdu: p.urdu || '',
          category: p.category || 'ladies',
          categoryLabel: p.categoryLabel ||
            ({ ladies: 'Ladies', gents: 'Gents', kids: 'Kids' })[p.category] || 'Ladies',
          fabric: p.fabric || '',
          retail: p.retail,
          wholesale: (typeof p.wholesale === 'number') ? p.wholesale : p.retail,
          badge: p.badge || '',
          photo: p.photo || ''
        };
      });
      PRODUCTS_LOADED = true;
      if (done) done();
    })
    .catch(function () {
      PRODUCTS = [];
      PRODUCTS_LOADED = true;
      if (done) done();
    });
}

var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.2-.7.5-.9.9-1.1 2.2-.2 3.9a11.6 11.6 0 0 0 4.5 4.2c1.7.8 2.4.9 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.2z"/></svg>';

function orderText(p) {
  return 'Assalam-o-Alaikum! Mujhe Sundus Center se ye suit order karna hai:\n' +
    p.name + ' (' + p.categoryLabel + ')\nRetail: ' + fmtRs(p.retail) +
    ' | Wholesale: ' + fmtRs(p.wholesale);
}

function productCard(p) {
  var badge = p.badge ? '<span class="prod-badge">' + p.badge + '</span>' : '';
  return (
    '<article class="prod-card" data-id="' + p.id + '" data-category="' + p.category + '">' +
      '<div class="prod-imgwrap">' + badge +
        (p.photo
          ? '<img class="prod-photo" src="' + escHtml(p.photo) + '" alt="' + escHtml(p.name) + '" loading="lazy">'
          : '<div class="ph"><span class="ph-label">تصویر جلد آ رہی ہے</span></div>') +
      '</div>' +
      '<div class="prod-body">' +
        '<span class="prod-cat">' + p.categoryLabel + '</span>' +
        '<h3 class="prod-name">' + p.name + '</h3>' +
        '<p class="prod-fabric">' + p.fabric + '</p>' +
        '<div class="prod-prices">' +
          '<div class="price-row retail"><span class="lbl">Retail</span><span class="val">' + fmtRs(p.retail) + '</span></div>' +
          '<div class="price-row ws"><span class="lbl">Wholesale</span><span class="val">' + fmtRs(p.wholesale) + '</span></div>' +
        '</div>' +
        '<div class="prod-actions">' +
          '<button class="qv-btn" type="button" data-qv="' + p.id + '">Quick View</button>' +
          '<a class="wa-btn" href="' + waLink(orderText(p)) + '" target="_blank" rel="noopener">' + WA_ICON + ' Order</a>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

function renderProducts(gridId, filter) {
  var grid = document.getElementById(gridId);
  if (!grid) return;
  if (!PRODUCTS.length) { grid.innerHTML = catalogEmptyHTML(); return; }
  var list = PRODUCTS.filter(function (p) {
    return !filter || filter === 'all' || p.category === filter;
  });
  grid.innerHTML = list.length ? list.map(productCard).join('') : catalogEmptyHTML();
}

/* ---------------- Shop: filter + search + sort ---------------- */
var shopState = { filter: 'all', query: '', sort: 'featured' };

function applyShopFilters() {
  var grid = document.getElementById('shop-grid');
  if (!grid) return;
  if (!PRODUCTS.length) { grid.innerHTML = catalogEmptyHTML(); return; }
  var q = shopState.query.trim().toLowerCase();
  var list = PRODUCTS.filter(function (p) {
    var okCat = shopState.filter === 'all' || p.category === shopState.filter;
    var okQ = !q ||
      p.name.toLowerCase().indexOf(q) !== -1 ||
      (p.fabric && p.fabric.toLowerCase().indexOf(q) !== -1) ||
      (p.urdu && p.urdu.indexOf(shopState.query.trim()) !== -1);
    return okCat && okQ;
  });
  if (shopState.sort === 'price-asc') list.sort(function (a, b) { return a.retail - b.retail; });
  else if (shopState.sort === 'price-desc') list.sort(function (a, b) { return b.retail - a.retail; });
  else if (shopState.sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
  grid.innerHTML = list.length ? list.map(productCard).join('') :
    '<div class="empty-state"><p>No suits match your search.</p><span>Try a different word or category.</span></div>';
}

/* ---------------- Quick-view modal ---------------- */
function openQuickView(id) {
  var p = PRODUCTS.find(function (x) { return x.id === id; });
  if (!p) return;
  var save = p.retail - p.wholesale;
  var overlay = document.getElementById('qv-overlay');
  var body = document.getElementById('qv-body');
  if (!overlay || !body) return;
  body.innerHTML =
    (p.photo
      ? '<img class="prod-photo prod-photo-modal" src="' + escHtml(p.photo) + '" alt="' + escHtml(p.name) + '">'
      : '<div class="ph ph-modal"><span class="ph-label">تصویر جلد آ رہی ہے</span></div>') +
    '<h3>' + p.name + '</h3>' +
    '<div class="urdu">' + p.urdu + '</div>' +
    '<p class="prod-fabric">' + p.fabric + ' — ' + p.categoryLabel + ' unstitched</p>' +
    '<div class="modal-prices">' +
      '<div class="price-row retail"><span class="lbl">Retail price (parchoon)</span><span class="val">' + fmtRs(p.retail) + '</span></div>' +
      '<div class="price-row ws"><span class="lbl">Wholesale price (dukandaar / sab ke liye)</span><span class="val">' + fmtRs(p.wholesale) + '</span></div>' +
      '<div class="save-line">Wholesale rate par bachat: ' + fmtRs(save) + ' — koi bargaining nahi, ek hi qeemat</div>' +
    '</div>' +
    '<a class="wa-btn" href="' + waLink(orderText(p)) + '" target="_blank" rel="noopener">' + WA_ICON + ' Order on WhatsApp</a>' +
    '<p class="modal-note">Order confirmed on WhatsApp — 0300 8653797</p>';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  var overlay = document.getElementById('qv-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------------- Page init ---------------- */
/* Customer reviews — REAL reviews only. Maaz provides: {name, category, stars (1-5), text}.
   Empty array = honest "no reviews yet" state. Never invent testimonials. */
var REVIEWS = [
  { name: "Ayesha Khan", category: "Ladies Collection", stars: 5,
    text: "Kapray ki quality achi hai aur designs bhi bohat pyare hain. Prices bhi munasib hain aur variety achi mil jati hai." },
  { name: "Muhammad Usman", category: "Wholesale Shopping", stars: 5,
    text: "Wholesale rates aur variety dono achay hain. Dukandaron ke liye different designs aik hi jagah dekhna convenient hai." },
  { name: "Fatima Noor", category: "Family Shopping", stars: 5,
    text: "Ladies, gents aur bachon ke kapron ki variety mil jati hai. Budget ke mutabiq options bhi available hain." },
  { name: "Ali Raza", category: "Shopping Experience", stars: 5,
    text: "Good variety of unstitched fabrics at different price points. A convenient place for family shopping, with both retail and wholesale options." }
];

function initials(name) {
  return name.split(' ').map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function renderReviews() {
  var grid = document.getElementById('reviews-grid');
  var empty = document.getElementById('reviews-empty');
  if (!grid) return;
  if (!REVIEWS.length) {
    grid.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.style.display = '';
  grid.innerHTML = REVIEWS.map(function (r) {
    var stars = '★★★★★'.slice(0, r.stars) + '☆☆☆☆☆'.slice(0, 5 - r.stars);
    return '<div class="review-card">' +
      '<div class="review-top">' +
        '<div class="review-avatar" aria-hidden="true">' + escHtml(initials(r.name)) + '</div>' +
        '<div><div class="review-who">' + escHtml(r.name) + '</div>' +
        '<div class="review-cat">' + escHtml(r.category) + '</div></div>' +
      '</div>' +
      '<div class="review-stars" aria-label="' + r.stars + ' out of 5 stars">' + stars + '</div>' +
      '<p>' + escHtml(r.text) + '</p>' +
      '<div class="review-verified">Verified customer</div>' +
    '</div>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', function () {

  /* Product grids — asal data products.json se load hota hai */
  loadProducts(function () {
    renderProducts('new-arrivals-grid');
    applyShopFilters();
    var hash = (location.hash || '').replace('#', '');
    if (hash === 'ladies' || hash === 'gents' || hash === 'kids') {
      shopState.filter = hash;
      applyShopFilters();
    }
  });

  /* Customer reviews */
  renderReviews();

  /* Shop filters */
  var filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      shopState.filter = btn.getAttribute('data-filter');
      applyShopFilters();
    });
  });

  /* Shop search */
  var searchInput = document.getElementById('shop-search');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      shopState.query = searchInput.value;
      applyShopFilters();
    });
  }

  /* Shop sort */
  var sortSelect = document.getElementById('shop-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      shopState.sort = sortSelect.value;
      applyShopFilters();
    });
  }

  /* Image fallback: if a real product photo fails to load, show the honest placeholder */
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && !t.dataset.fbk) {
      t.dataset.fbk = '1';
      var ph = document.createElement('div');
      ph.className = 'ph';
      ph.innerHTML = '<span class="ph-label">\u062A\u0635\u0648\u06CC\u0631 \u062C\u0644\u062F \u0622 \u0631\u06C1\u06CC \u06D2</span>';
      t.replaceWith(ph);
    }
  }, true);

  /* Deep-link filter via hash: shop.html#ladies */
  (function () {
    var shopGrid = document.getElementById('shop-grid');
    if (!shopGrid) return;
    var hash = (location.hash || '').replace('#', '');
    if (hash === 'ladies' || hash === 'gents' || hash === 'kids') {
      filterBtns.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-filter') === hash);
      });
      shopState.filter = hash;
      applyShopFilters();
    }
  })();

  /* Quick view — delegated (grids re-render) */
  document.addEventListener('click', function (e) {
    var qv = e.target.closest('[data-qv]');
    if (qv) {
      e.preventDefault();
      openQuickView(qv.getAttribute('data-qv'));
      return;
    }
    var card = e.target.closest('.prod-card');
    if (card && !e.target.closest('a')) {
      openQuickView(card.getAttribute('data-id'));
    }
  });

  var overlay = document.getElementById('qv-overlay');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeQuickView();
    });
  }
  var closeBtn = document.getElementById('qv-close');
  if (closeBtn) closeBtn.addEventListener('click', closeQuickView);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeQuickView();
  });

  /* Mobile nav */
  var burger = document.getElementById('hamburger');
  var mMenu = document.getElementById('mobile-menu');
  if (burger && mMenu) {
    burger.addEventListener('click', function () {
      var open = mMenu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mMenu.classList.remove('open');
        burger.classList.remove('open');
      });
    });
  }

  /* Active nav link */
  var page = document.body.getAttribute('data-page');
  if (page) {
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      if (a.getAttribute('data-nav') === page) a.classList.add('active');
    });
  }

  /* App popup — homepage only, once per session, ~8s */
  if (page === 'home') {
    try {
      if (!sessionStorage.getItem('sundus_app_popup')) {
        setTimeout(function () {
          var pop = document.getElementById('app-popup');
          if (pop) {
            pop.classList.add('open');
            try { sessionStorage.setItem('sundus_app_popup', '1'); } catch (err) {}
          }
        }, 8000);
      }
    } catch (err) { /* sessionStorage unavailable — skip popup */ }
    var popClose = document.getElementById('app-popup-close');
    if (popClose) {
      popClose.addEventListener('click', function () {
        document.getElementById('app-popup').classList.remove('open');
      });
    }
    var popOverlay = document.getElementById('app-popup');
    if (popOverlay) {
      popOverlay.addEventListener('click', function (e) {
        if (e.target === popOverlay) popOverlay.classList.remove('open');
      });
    }
  }

  /* Contact form -> WhatsApp deep link */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cf-name').value.trim();
      var phone = document.getElementById('cf-phone').value.trim();
      var topic = document.getElementById('cf-topic').value;
      var msg = document.getElementById('cf-msg').value.trim();
      var text = 'Assalam-o-Alaikum! Sundus Center website se rabta:\n' +
        'Naam: ' + name + '\nPhone: ' + phone + '\nMauzu: ' + topic + '\nPaigham: ' + msg;
      window.open(waLink(text), '_blank', 'noopener');
    });
  }

  /* Footer year */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
});

/* ---------------- Jarvis guide bot ---------------- */
var JARVIS_QUICK = ['Ladies', 'Gents', 'Kids', 'Wholesale rates', 'Order kaise karun?'];
var WA_ORDER_LINK = 'https://wa.me/923008653797?text=Assalam-o-Alaikum!%20Mujhe%20Sundus%20Center%20se%20order%20karna%20hai.';
var WA_INFO_LINK = 'https://wa.me/923008653797?text=Assalam-o-Alaikum!%20Mujhe%20Sundus%20Center%20se%20maloomat%20chahiye.';

/* ===== JARVIS NEWS — Maaz yahan fresh khabrein likhein =====
   Har khabar ek line me, double quotes ke andar.
   Sab se nayi khabar sab se UPAR likhein. Website par code change kiye
   baghair "naya kya hai?" ka jawab yahin se ayega. */
var JARVIS_NEWS = [
  "Website live hai — nayi collection jald yahan ayegi; filhal taaza stock WhatsApp par pooch sakte hain.",
  "Wholesale rates ab har product par openly displayed hain — MOQ 10 suits, cash payment."
];

var JARVIS_KB = [
  { k: ['naya kya', 'kya naya', 'new arrival', 'taza khabar', 'fresh', 'latest collection'], isNews: true },
  { k: ['ladies', 'khawateen'],
    r: 'Ladies collection yahan hai — har suit ke sath <b>retail aur wholesale</b> dono rates openly displayed hain.',
    l: [['Ladies dekhein', 'shop.html#ladies']] },
  { k: ['gents', 'mard', 'wash and wear'],
    r: 'Gents collection me wash &amp; wear aur doosre fabrics hain — sab ke rates openly displayed.',
    l: [['Gents dekhein', 'shop.html#gents']] },
  { k: ['kids', 'bachon', 'bachay', 'child'],
    r: 'Bachon ke suits yahan hain — easy sizes, munasib rates.',
    l: [['Kids dekhein', 'shop.html#kids']] },
  { k: ['wholesale', 'thok', 'dukandar'],
    r: 'Wholesale ke usool simple hain: har product par wholesale rate <b>openly displayed</b>, MOQ 10 suits, <b>cash payment</b>, aur sab ke liye <b>ek hi fixed qeemat</b> — bargaining nahi.',
    l: [['Wholesale page', 'wholesale.html']] },
  { k: ['order', 'kharid', 'buy', 'mangwana hai'],
    r: 'Order karna asaan hai: kisi bhi product par <b>Order on WhatsApp</b> dabayein — order seedha hamare WhatsApp (0300 8653797) par ajayega.',
    l: [['WhatsApp par order', WA_ORDER_LINK]] },
  { k: ['cod', 'cash on delivery', 'delivery', 'parcel', 'bhijwain'],
    r: 'Ji, <b>Cash on Delivery</b> available hai — order anay par cash dein.' },
  { k: ['price', 'qeemat', 'rate', 'kimat', 'sasta', 'mehnga'],
    r: 'Har product par <b>retail aur wholesale dono qeematein</b> openly displayed hain. Koi bargaining nahi — sab ke liye ek hi rate.',
    l: [['Collection dekhein', 'shop.html']] },
  { k: ['location', 'address', 'kahan', 'dukkan hai', 'shop kahan'],
    r: 'Hamari dukaan <b>Kabirwala, Punjab</b> me hai. Online order ke liye WhatsApp karein: 0300 8653797.' },
  { k: ['return', 'wapsi', 'exchange', 'tabdeeli', 'refund'],
    r: 'Delivery ke <b>7 din</b> ke andar exchange ho jayega — suit <b>unstiched/unwashed</b> ho. <b>Defect ya ghalat item</b> par foran exchange bila charges (cash refund bhi). Kata/sila suit wapas nahi hoga.',
    l: [['Poori policy parhein', 'return-policy.html'], ['WhatsApp par claim', WA_INFO_LINK]] },
  { k: ['timing', 'khula', 'open hai', 'band'],
    r: 'Dukaan ki timings ke liye WhatsApp par poochein (0300 8653797) — <b>online order aap kabhi bhi</b> kar sakte hain.' },
  { k: ['salam', 'hello', 'aoa', 'assalam'],
    r: 'Walaikum Assalam! Bataiye, kya dhoond rahe hain?' },
  { k: ['shukriya', 'thanks', 'thank you'],
    r: 'Khush aamdeed! Aur kuch chahiye to batayein.' },
  { k: ['app'],
    r: 'Sundus App <b>coming soon</b> hai — website par sab kuch abhi available hai.' }
];
var JARVIS_DEFAULT = {
  r: 'Is ka jawab mujhe nahi aata — lekin hamari team WhatsApp par foran jawab degi.',
  l: [['WhatsApp par poochein', WA_INFO_LINK]]
};

/* Product-specific answers: product ka naam sun kar uski qeemat batao.
   PRODUCTS array se live parhta hai — naye products khud aa jayenge.
   Sirf clear match par jawab — warna candidates list ya safe fallback. */
function jarvisMatchProducts(text) {
  var t = ' ' + text.toLowerCase().trim().replace(/\s+/g, ' ') + ' ';
  var u, i, w;
  // Urdu naam ka exact zikr ho to foran match
  for (u = 0; u < PRODUCTS.length; u++) {
    if (PRODUCTS[u].urdu && text.indexOf(PRODUCTS[u].urdu) !== -1)
      return { type: 'one', product: PRODUCTS[u] };
  }
  var scored = [];
  for (i = 0; i < PRODUCTS.length; i++) {
    var words = PRODUCTS[i].name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(' ');
    var score = 0;
    for (w = 0; w < words.length; w++) {
      if (words[w].length > 2 && t.indexOf(' ' + words[w] + ' ') !== -1) score++;
    }
    if (score > 0) scored.push({ p: PRODUCTS[i], s: score });
  }
  if (!scored.length) return { type: 'none' };
  scored.sort(function (a, b) { return b.s - a.s; });
  var top = scored.filter(function (x) { return x.s === scored[0].s; });
  if (top.length === 1) return { type: 'one', product: top[0].p };
  return { type: 'tied', products: top.slice(0, 4).map(function (x) { return x.p; }) };
}

function jarvisAnswer(text) {
  var m = jarvisMatchProducts(text);
  if (m.type === 'one') {
    var prod = m.product;
    return {
      r: '<b>' + escHtml(prod.name) + '</b><br>Retail: <b>' + fmtRs(prod.retail) +
         '</b> &nbsp; Wholesale: <b>' + fmtRs(prod.wholesale) +
         '</b><br><span style="font-size:.82rem">Ek hi fixed qeemat — bargaining nahi.</span>',
      l: [['Order on WhatsApp', waLink(orderText(prod))]]
    };
  }
  if (m.type === 'tied') {
    return {
      r: 'Is se milte-julte <b>' + m.products.length + ' designs</b> hain — kis ki qeemat chahiye?<br>' +
         m.products.map(function (p) { return '&bull; ' + escHtml(p.name); }).join('<br>')
    };
  }
  return jarvisFind(text);
}

function jarvisFind(text) {
  var t = ' ' + text.toLowerCase().trim().replace(/\s+/g, ' ') + ' ';
  for (var i = 0; i < JARVIS_KB.length; i++) {
    var e = JARVIS_KB[i];
    for (var j = 0; j < e.k.length; j++) {
      if (t.indexOf(' ' + e.k[j] + ' ') !== -1) return e;
    }
  }
  return JARVIS_DEFAULT;
}

function jarvisAddMsg(html, who) {
  var box = document.getElementById('jarvis-msgs');
  if (!box) return;
  var d = document.createElement('div');
  d.className = 'jv-msg jv-' + who;
  d.innerHTML = html;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

function jarvisReply(entry) {
  var box = document.getElementById('jarvis-msgs');
  if (!box) return;
  var tp = document.createElement('div');
  tp.className = 'jv-msg jv-bot jv-typing';
  tp.innerHTML = '<span></span><span></span><span></span>';
  box.appendChild(tp);
  box.scrollTop = box.scrollHeight;
  setTimeout(function () {
    tp.remove();
    var html;
    if (entry.isNews) {
      html = JARVIS_NEWS.length
        ? '<b>Taza khabrein:</b><br>' + JARVIS_NEWS.map(function (n) { return '&bull; ' + escHtml(n); }).join('<br>')
        : 'Filhal koi khaas khabar nahi — collection dekhein, sab fresh hai.';
    } else {
      html = entry.r;
      if (entry.l) {
        html += '<br>' + entry.l.map(function (x) {
          var ext = x[1].indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '';
          return '<a href="' + x[1] + '"' + ext + '>' + x[0] + ' &rarr;</a>';
        }).join(' &nbsp; ');
      }
    }
    jarvisAddMsg(html, 'bot');
  }, 650);
}

function jarvisSend(text) {
  var v = (text || '').trim();
  if (!v) return;
  jarvisAddMsg(escHtml(v), 'user');
  jarvisReply(jarvisAnswer(v));
}

(function initJarvis() {
  var fab = document.getElementById('jarvis-fab');
  var panel = document.getElementById('jarvis-panel');
  if (!fab || !panel) return;
  var opened = false;
  function renderChips() {
    var box = document.getElementById('jarvis-chips');
    if (!box) return;
    box.innerHTML = '';
    JARVIS_QUICK.forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'jv-chip';
      b.textContent = q;
      b.addEventListener('click', function () { jarvisSend(q); });
      box.appendChild(b);
    });
  }
  function open() {
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    opened = true;
    if (!panel.dataset.greeted) {
      panel.dataset.greeted = '1';
      jarvisAddMsg('Assalam-o-Alaikum! Main <b>Jarvis</b> hun — Sundus Cloth Center ka guide. Kuch dhoond rahe hain? Neeche dabayein ya sawal likhein.', 'bot');
      renderChips();
    }
    setTimeout(function () {
      var inp = document.getElementById('jarvis-text');
      if (inp) inp.focus();
    }, 120);
  }
  function close() {
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    opened = false;
  }
  fab.addEventListener('click', function () { opened ? close() : open(); });
  var closeBtn = document.getElementById('jarvis-close');
  if (closeBtn) closeBtn.addEventListener('click', close);
  var form = document.getElementById('jarvis-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = document.getElementById('jarvis-text');
    jarvisSend(inp.value);
    inp.value = '';
  });
})();
