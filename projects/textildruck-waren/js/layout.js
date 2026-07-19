/* ============================================================
   Textildruck-Waren.de  –  Layout (Topbar / Header / Nav / Footer)
   ============================================================ */
(function (global) {
  "use strict";
  var icon = UI.icon, esc = UI.esc, qs = UI.qs, qsa = UI.qsa;

  function logoSVG() {
    return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M20 8L8 16l4 10 6-4v30h28V22l6 4 4-10L44 8l-6 5c-3.5 2.5-8.5 2.5-12 0z" fill="#fff" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M26 12c1.5 3 10.5 3 12 0" fill="none" stroke="#0f172a" stroke-width="2.5"/>' +
      '</svg>';
  }

  function renderTopbar() {
    var s = TWD.get().settings;
    var left = s.topbarFeatures.map(function (f) {
      return '<div class="topbar-item">' + icon(f.icon) + "<span>" + esc(f.text) + "</span></div>";
    }).join("");
    return '<div class="topbar"><div class="container">' +
      '<div class="topbar-left">' + left + "</div>" +
      '<div class="topbar-right">' +
        '<div class="topbar-item">' + icon("phone") + "<span>Hotline: <b>" + esc(s.hotline) + "</b></span></div>" +
        '<div class="topbar-item">' + icon("clock") + "<span>" + esc(s.hours) + "</span></div>" +
      "</div></div></div>";
  }

  function renderHeader() {
    var s = TWD.get().settings;
    var user = Cart.currentUser();
    var kontoLabel = user
      ? '<span class="ha-label">Hallo<b>' + esc(user.name.split(" ")[0]) + "</b></span>"
      : '<span class="ha-label">Konto<b>Anmelden</b></span>';
    return '<header class="header"><div class="container">' +
      '<a class="logo" href="#/" data-link>' + logoSVG() +
        '<span class="logo-text"><span class="l1">' + esc(s.logoLine1) + '</span><span class="l2">' + esc(s.logoLine2) + "</span></span></a>" +
      '<form class="search" id="search-form">' +
        '<input type="text" id="search-input" placeholder="' + esc(s.searchPlaceholder) + '" aria-label="Suche">' +
        '<button type="submit" aria-label="Suchen">' + icon("search") + "</button>" +
      "</form>" +
      '<div class="header-actions">' +
        '<a class="header-action" href="#/' + (user ? "konto" : "login") + '" data-link aria-label="Konto">' + icon("user") + kontoLabel + "</a>" +
        '<a class="header-action" href="#/wunschliste" data-link aria-label="Wunschliste">' + icon("heart") + '<span class="ha-label"><b>Wunschliste</b></span></a>' +
        '<a class="header-action" href="#/warenkorb" data-link aria-label="Warenkorb">' + icon("cart") +
          '<span class="cart-badge">' + Cart.cartCount() + "</span>" +
          '<span class="ha-label"><b>Warenkorb</b></span></a>' +
      "</div></div></header>";
  }

  function renderNav() {
    var cats = TWD.get().categories;
    var links = [
      { t: "Startseite", h: "#/" },
      { t: "Angebote", h: "#/angebote" },
      { t: "Bestseller", h: "#/bestseller" },
      { t: "Arbeitskleidung", h: "#/kategorie/arbeitskleidung" },
      { t: "Werbetextilien", h: "#/kategorie/werbetextilien" },
      { t: "Vereinskleidung", h: "#/kategorie/vereinskleidung" },
      { t: "Über uns", h: "#/seite/ueber-uns" },
      { t: "Kontakt", h: "#/seite/kontakt" }
    ];
    var hash = location.hash || "#/";
    var linksHTML = links.map(function (l) {
      var active = (hash === l.h || (l.h === "#/" && (hash === "#/" || hash === ""))) ? " active" : "";
      return '<a href="' + l.h + '" data-link class="' + active + '">' + esc(l.t) + "</a>";
    }).join("");
    var catPanel = cats.map(function (c) {
      return '<a href="#/kategorie/' + c.id + '" data-link>' + icon(c.icon) + "<span>" + esc(c.name) + "</span>" + icon("chevRight", "chev-r") + "</a>";
    }).join("");
    return '<nav class="mainnav" id="mainnav"><div class="container">' +
      '<button class="cat-toggle" id="cat-toggle">' + icon("menu") + "<span>Kategorien</span>" + icon("chevDown", "chev") + "</button>" +
      '<button class="mobile-menu-btn" id="mobile-menu-btn">' + icon("menu") + "<span>Menü</span></button>" +
      '<div class="nav-links">' + linksHTML + "</div>" +
      '<div class="cat-panel">' + catPanel + "</div>" +
      "</div></nav>";
  }

  function renderFooter() {
    var s = TWD.get().settings;
    var c = s.contact;
    function col(title, items, prefix) {
      return '<div><h5>' + esc(title) + "</h5><ul>" +
        items.map(function (i) { return '<li><a href="#/seite/' + slug(i) + '" data-link>' + esc(i) + "</a></li>"; }).join("") +
        "</ul></div>";
    }
    var socials = [
      { i: "facebook", c: "#1877f2" }, { i: "instagram", c: "#e1306c" },
      { i: "youtube", c: "#ff0000" }, { i: "tiktok", c: "#000" }, { i: "globe", c: "#334155" }
    ].map(function (x) { return '<a href="#/" data-link style="background:' + x.c + '" aria-label="' + x.i + '">' + icon(x.i) + "</a>"; }).join("");
    var pays = [
      { t: "PayPal", bg: "#003087", c: "#fff" }, { t: "VISA", bg: "#1a1f71", c: "#fff" },
      { t: "Mastercard", bg: "#fff", c: "#eb001b" }, { t: "Klarna", bg: "#ffb3c7", c: "#000" }
    ].map(function (p) { return '<span class="pm" style="background:' + p.bg + ';color:' + p.c + '">' + esc(p.t) + "</span>"; }).join("");

    return '<footer class="footer"><div class="container"><div class="footer-grid">' +
      '<div><h5>Kontakt</h5><div class="flogo"><span class="logo-text"><span class="l1" style="color:#fff">' + esc(s.logoLine1) + '</span><span class="l2">' + esc(s.logoLine2) + "</span></span></div>" +
        '<div class="fcontact"><div>' + esc(c.company) + "</div><div>" + esc(c.street) + "</div><div>" + esc(c.city) + "</div><div>" + esc(c.country) + "</div>" +
        '<div class="fcontact-row">' + icon("phone") + "<span>" + esc(c.phone) + "</span></div>" +
        '<div class="fcontact-row">' + icon("chat") + "<span>" + esc(c.email) + "</span></div></div>" +
        '<div class="social-row">' + socials + "</div></div>" +
      col("Informationen", s.footerCols.informationen) +
      col("Kundenservice", s.footerCols.kundenservice) +
      col("Rechtliches", s.footerCols.rechtliches) +
      '<div><h5>Zahlungsmethoden</h5><div class="pay-methods">' + pays + "</div>" +
        '<div style="font-size:12.5px;font-weight:700;color:#cbd5e1;letter-spacing:1px">' + esc(s.paymentInfo) + "</div></div>" +
      "</div></div>" +
      '<div class="footer-bottom"><div class="container">' + esc(s.copyright) + "</div></div></footer>";
  }

  function slug(str) {
    return String(str).toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function mountChrome() {
    qs("#topbar-root").innerHTML = renderTopbar();
    qs("#header-root").innerHTML = renderHeader();
    qs("#nav-root").innerHTML = renderNav();
    qs("#footer-root").innerHTML = renderFooter();
    bindHeader();
    bindNav();
  }

  // Bindet Kopfzeilen-Elemente (Suche). Wird nur bei komplettem Header-Neuaufbau aufgerufen.
  function bindHeader() {
    var sf = qs("#search-form");
    if (sf) sf.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = qs("#search-input").value.trim();
      location.hash = "#/suche?q=" + encodeURIComponent(q);
      var nav = qs("#mainnav"); if (nav) nav.classList.remove("mobile-open");
    });
  }

  var docListenersBound = false;
  // Bindet Navigations-Elemente. Kann bei jedem Routenwechsel neu aufgerufen werden.
  function bindNav() {
    var nav = qs("#mainnav");
    var catToggle = qs("#cat-toggle");
    if (catToggle) {
      catToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        nav.classList.toggle("cat-open");
      });
    }
    var mob = qs("#mobile-menu-btn");
    if (mob) mob.addEventListener("click", function () { nav.classList.toggle("mobile-open"); });

    // Dokument-Listener nur einmal binden
    if (!docListenersBound) {
      docListenersBound = true;
      document.addEventListener("click", function (e) {
        var n = qs("#mainnav");
        if (n && !e.target.closest("#mainnav")) n.classList.remove("cat-open");
      });
    }
  }

  document.addEventListener("cart:changed", Cart.updateCartBadge);
  document.addEventListener("auth:changed", function () {
    qs("#header-root").innerHTML = renderHeader();
    bindHeader();
  });

  global.Layout = { mountChrome: mountChrome, mountChromeBind: bindNav, renderNav: renderNav, slug: slug, logoSVG: logoSVG };
})(window);
