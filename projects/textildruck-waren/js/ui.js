/* ============================================================
   Textildruck-Waren.de  –  UI Helfer (Icons, Toast, Modal, Utils)
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- SVG Icon-Bibliothek ---------- */
  var ICONS = {
    bolt: '<path fill="currentColor" d="M13 2L3 14h7l-1 8 11-14h-7z"/>',
    print: '<path fill="currentColor" d="M6 9V2h12v7h2a2 2 0 012 2v6h-4v4H6v-4H2v-6a2 2 0 012-2h2zm2 0h8V4H8v5zm0 8h8v-4H8v4zm10-5a1 1 0 100 2 1 1 0 000-2z"/>',
    truck: '<path fill="currentColor" d="M3 4h11v9H3zM14 8h4l3 3v4h-2a2.5 2.5 0 01-5 0h-1zM6.5 16a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm11 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>',
    chat: '<path fill="currentColor" d="M4 3h16a2 2 0 012 2v10a2 2 0 01-2 2H8l-5 4V5a2 2 0 011-2z"/>',
    phone: '<path fill="currentColor" d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11 11 0 003.5.56 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11 11 0 00.56 3.5 1 1 0 01-.24 1z"/>',
    clock: '<path fill="none" stroke="currentColor" stroke-width="2" d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    search: '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z"/>',
    user: '<path fill="none" stroke="currentColor" stroke-width="2" d="M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8z"/>',
    heart: '<path fill="none" stroke="currentColor" stroke-width="2" d="M20.8 5.6a5 5 0 00-7.1 0L12 7.3l-1.7-1.7a5 5 0 10-7.1 7.1L12 21l8.8-8.3a5 5 0 000-7.1z"/>',
    cart: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2 3h2l2.6 12.4A2 2 0 008.5 17h9a2 2 0 002-1.6L21 7H6M9 21a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z"/>',
    menu: '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/>',
    chevDown: '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" d="M6 9l6 6 6-6"/>',
    chevRight: '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" d="M9 6l6 6-6 6"/>',
    chevLeft: '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" d="M15 6l-6 6 6 6"/>',
    arrowRight: '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>',
    checkCircle: '<path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-4-4 1.4-1.4 2.6 2.6 5.4-5.4 1.4 1.4z"/>',
    close: '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/>',
    upload: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    building: '<path fill="none" stroke="currentColor" stroke-width="2" d="M3 21h18M5 21V5a1 1 0 011-1h8a1 1 0 011 1v16M15 21V9h3a1 1 0 011 1v11M8 8h2M8 12h2M8 16h2"/>',
    plus: '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M12 5v14M5 12h14"/>',
    minus: '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M5 12h14"/>',
    trash: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/>',
    edit: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z"/>',
    box: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v9"/>',
    settings: '<path fill="none" stroke="currentColor" stroke-width="2" d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path fill="none" stroke="currentColor" stroke-width="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-2.82 1.17V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
    grid: '<path fill="none" stroke="currentColor" stroke-width="2" d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
    tag: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M20.6 13.4l-8 8a2 2 0 01-2.8 0l-7-7A2 2 0 012 13V4a2 2 0 012-2h9a2 2 0 011.4.6l7 7a2 2 0 010 2.8zM7 7h.01"/>',
    doc: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h8M8 9h2"/>',
    palette: '<path fill="none" stroke="currentColor" stroke-width="2" d="M12 22a10 10 0 110-20 8 8 0 018 8 4 4 0 01-4 4h-2a2 2 0 00-2 2 2 2 0 002 2 2 2 0 010 4zM7.5 10.5h.01M12 7.5h.01M16.5 10.5h.01"/>',
    logout: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
    // Kategorie-Icons
    tshirt: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M8 3l4 3 4-3 4 3-2 4-2-1v11H8V9L6 10 4 6z"/>',
    underwear: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M4 4h16v5a5 5 0 01-5 5c-2 0-3-2-3-4 0 2-1 4-3 4a5 5 0 01-5-5z"/>',
    jacket: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M8 3L4 6l2 4 2-1v11h8V9l2 1 2-4-4-3-4 3zM12 6v15"/>',
    baby: '<path fill="none" stroke="currentColor" stroke-width="2" d="M9 12a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zM9 15s1 1.5 3 1.5S15 15 15 15M12 3a9 9 0 100 18 9 9 0 000-18z"/>',
    sport: '<path fill="none" stroke="currentColor" stroke-width="2" d="M12 3a9 9 0 100 18 9 9 0 000-18zM3.5 9h17M3.5 15h17M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    team: '<path fill="none" stroke="currentColor" stroke-width="2" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0116 11"/>',
    event: '<path fill="none" stroke="currentColor" stroke-width="2" d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/>',
    leaf: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M11 20A7 7 0 014 13c0-6 5-10 16-10 0 8-4 16-9 16-2 0-4-2-4-4M8 18c2-4 5-6 9-8"/>',
    // Druckpositionen (Torso mit Highlight)
    "chest-l": '<g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 4L6 6l1.5 3L9 8.5V20h6V8.5L16.5 9 18 6l-3-2-3 2z"/></g><rect x="8.5" y="9.5" width="3" height="3" rx=".5" fill="currentColor"/>',
    "chest-r": '<g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 4L6 6l1.5 3L9 8.5V20h6V8.5L16.5 9 18 6l-3-2-3 2z"/></g><rect x="12.5" y="9.5" width="3" height="3" rx=".5" fill="currentColor"/>',
    front: '<g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 4L6 6l1.5 3L9 8.5V20h6V8.5L16.5 9 18 6l-3-2-3 2z"/></g><rect x="9.5" y="10" width="5" height="6" rx=".5" fill="currentColor"/>',
    back: '<g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 4L6 6l1.5 3L9 8.5V20h6V8.5L16.5 9 18 6l-3-2-3 2z"/><path d="M9.5 4.5c1 1 4 1 5 0"/></g><rect x="9.5" y="9" width="5" height="7" rx=".5" fill="currentColor" opacity=".55"/>',
    "sleeve-l": '<g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 4L6 6l1.5 3L9 8.5V20h6V8.5L16.5 9 18 6l-3-2-3 2z"/></g><rect x="6.2" y="6.2" width="2.4" height="2.4" rx=".4" fill="currentColor"/>',
    "sleeve-r": '<g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 4L6 6l1.5 3L9 8.5V20h6V8.5L16.5 9 18 6l-3-2-3 2z"/></g><rect x="15.4" y="6.2" width="2.4" height="2.4" rx=".4" fill="currentColor"/>',
    // Social
    facebook: '<path fill="currentColor" d="M13 22v-9h3l.5-4H13V7c0-1 .3-1.5 1.7-1.5H17V2h-3c-3 0-4 1.8-4 4.5V9H7v4h3v9z"/>',
    instagram: '<path fill="none" stroke="currentColor" stroke-width="2" d="M17 2H7a5 5 0 00-5 5v10a5 5 0 005 5h10a5 5 0 005-5V7a5 5 0 00-5-5z"/><path fill="none" stroke="currentColor" stroke-width="2" d="M16 11.4A4 4 0 1112.6 8 4 4 0 0116 11.4zM17.5 6.5h.01"/>',
    youtube: '<path fill="currentColor" d="M23 12s0-3.5-.45-5.2a2.7 2.7 0 00-1.9-1.9C18.9 4.5 12 4.5 12 4.5s-6.9 0-8.65.4a2.7 2.7 0 00-1.9 1.9C1 8.5 1 12 1 12s0 3.5.45 5.2a2.7 2.7 0 001.9 1.9c1.75.4 8.65.4 8.65.4s6.9 0 8.65-.4a2.7 2.7 0 001.9-1.9C23 15.5 23 12 23 12zM10 15.5v-7l6 3.5z"/>',
    tiktok: '<path fill="currentColor" d="M16 3c.3 2.3 1.7 3.9 4 4.2v3c-1.5 0-2.9-.5-4-1.3v6.6a5.5 5.5 0 11-5.5-5.5c.3 0 .6 0 .9.1v3.1a2.5 2.5 0 101.6 2.3V3z"/>',
    globe: '<path fill="none" stroke="currentColor" stroke-width="2" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'
  };

  function icon(name, cls) {
    var body = ICONS[name] || ICONS.box;
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' + body + "</svg>";
  }

  /* ---------- Utils ---------- */
  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function euro(n) {
    return (Math.round(Number(n) * 100) / 100).toFixed(2).replace(".", ",") + " €";
  }
  function parsePrice(str) {
    if (typeof str === "number") return str;
    return parseFloat(String(str).replace(",", ".").replace(/[^\d.]/g, "")) || 0;
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* Liefert escapte data-Attribute für <img>, die bei Ladefehler (z.B. defekte, admin-gepflegte
     Foto-URL) über den delegierten Error-Handler unten auf die generierte Grafik zurückfallen –
     kein Interpolieren roher Werte in ein onerror-Attribut. */
  function imgFallbackAttr(garment, color) {
    return ' data-fb-garment="' + esc(garment || "") + '" data-fb-color="' + esc(color || "") + '"';
  }
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && t.hasAttribute("data-fb-garment")) {
      var garment = t.getAttribute("data-fb-garment"), color = t.getAttribute("data-fb-color");
      t.removeAttribute("data-fb-garment");
      t.removeAttribute("data-fb-color");
      if (global.TWD) TWD.imgFallback(t, garment, color);
    }
  }, true);
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  /* ---------- Toast ---------- */
  function toast(msg, type) {
    var root = qs("#toast-root");
    if (!root) { root = el("div", { id: "toast-root" }); document.body.appendChild(root); }
    var t = el("div", { class: "toast " + (type || "info") });
    var ic = type === "success" ? "checkCircle" : type === "error" ? "close" : "chat";
    t.innerHTML = icon(ic) + "<span>" + esc(msg) + "</span>";
    root.appendChild(t);
    setTimeout(function () {
      t.style.transition = ".3s"; t.style.opacity = "0"; t.style.transform = "translateX(120%)";
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, 3200);
  }

  /* ---------- Modal ---------- */
  var modalOpen = false;
  function modal(opts) {
    closeModal();
    var overlay = el("div", { class: "modal-overlay" });
    var m = el("div", { class: "modal" + (opts.wide ? " wide" : "") });
    m.innerHTML =
      '<div class="modal-head"><h3>' + esc(opts.title || "") + "</h3>" +
      '<button class="modal-close" data-close>' + icon("close") + "</button></div>" +
      '<div class="modal-body">' + (opts.body || "") + "</div>" +
      (opts.foot ? '<div class="modal-foot">' + opts.foot + "</div>" : "");
    overlay.appendChild(m);
    qs("#modal-root").appendChild(overlay);
    modalOpen = true;
    document.body.style.overflow = "hidden";
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest("[data-close]")) closeModal();
    });
    if (typeof opts.onOpen === "function") opts.onOpen(m);
    return m;
  }
  function closeModal() {
    var root = qs("#modal-root");
    if (root) root.innerHTML = "";
    modalOpen = false;
    document.body.style.overflow = "";
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modalOpen) closeModal(); });

  /* ---------- confirm dialog ---------- */
  function confirmDialog(message, onYes, opts) {
    opts = opts || {};
    modal({
      title: opts.title || "Bestätigen",
      body: '<p style="font-size:15px;color:#374151">' + esc(message) + "</p>",
      foot:
        '<button class="btn btn-ghost" data-close>' + (opts.no || "Abbrechen") + "</button>" +
        '<button class="btn ' + (opts.danger ? "btn-orange" : "btn-blue") + '" id="confirm-yes">' + (opts.yes || "OK") + "</button>",
      onOpen: function (m) {
        qs("#confirm-yes", m).addEventListener("click", function () { closeModal(); onYes(); });
      }
    });
  }

  global.UI = {
    icon: icon, esc: esc, euro: euro, parsePrice: parsePrice,
    qs: qs, qsa: qsa, el: el, toast: toast, modal: modal,
    closeModal: closeModal, confirmDialog: confirmDialog, ICONS: ICONS,
    imgFallbackAttr: imgFallbackAttr
  };
})(window);
