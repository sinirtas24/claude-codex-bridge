/* ============================================================
   Textildruck-Waren.de  –  Router & Init
   ============================================================ */
(function (global) {
  "use strict";
  var qs = UI.qs;

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, ""); // ohne "#/"
    var queryStr = "";
    var qi = h.indexOf("?");
    var query = {};
    if (qi > -1) { queryStr = h.slice(qi + 1); h = h.slice(0, qi); }
    if (queryStr) queryStr.split("&").forEach(function (pair) {
      var kv = pair.split("=");
      query[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
    });
    var parts = h.split("/").filter(Boolean);
    return { parts: parts, query: query };
  }

  function route() {
    var view = qs("#view");
    if (!view) return;
    var r = parseHash();
    var parts = r.parts, query = r.query;
    var seg = parts[0] || "";

    // Nav aktiven Link aktualisieren
    qs("#nav-root").innerHTML = Layout.renderNav();
    Layout.mountChromeBind();

    window.scrollTo(0, 0);

    try {
      switch (seg) {
        case "":
          Home.render(view); break;
        case "angebote":
          Shop.renderList(view, { section: "angebote", title: "Angebote", sub: "Jetzt sparen und profitieren!" }); break;
        case "bestseller":
          Shop.renderList(view, { section: "bestseller", title: "Bestseller", sub: "Unsere beliebtesten Produkte" }); break;
        case "kategorie":
          renderCategory(view, parts[1]); break;
        case "produkt":
          Shop.renderProduct(view, parts[1]); break;
        case "suche":
          Shop.renderList(view, { query: query.q || "", title: 'Suche: "' + (query.q || "") + '"' }); break;
        case "login":
          Shop.renderAuth(view); break;
        case "konto":
          Shop.renderAccount(view); break;
        case "warenkorb":
          Shop.renderCart(view); break;
        case "checkout":
          Shop.renderCheckout(view); break;
        case "wunschliste":
          Shop.renderWishlist(view); break;
        case "admin":
          Admin.render(view); break;
        case "seite":
          Shop.renderStaticPage(view, parts[1] || ""); break;
        default:
          Home.render(view);
      }
    } catch (e) {
      console.error("Routing-Fehler:", e);
      view.innerHTML = '<div class="page"><div class="container"><div class="card"><h1 style="font-weight:800">Ups, ein Fehler ist aufgetreten.</h1>' +
        '<p class="muted mt8">Bitte lade die Seite neu. Details in der Konsole.</p>' +
        '<a class="btn btn-blue mt16" href="#/" data-link>Zur Startseite</a></div></div></div>';
    }
  }

  function renderCategory(view, id) {
    var cat = TWD.get().categories.filter(function (c) { return c.id === id; })[0];
    if (!cat) { Shop.renderList(view, { title: "Kategorie nicht gefunden" }); return; }
    Shop.renderList(view, { category: id, title: cat.name, sub: "Entdecke unsere Auswahl an " + cat.name });
  }

  // Klicks auf data-link (interne Navigation, verhindert Standard-Sprünge nicht nötig bei Hash)
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-link]");
    if (a && a.getAttribute("href") === "#") e.preventDefault();
  });

  window.addEventListener("hashchange", route);

  document.addEventListener("DOMContentLoaded", function () {
    TWD.load();
    Layout.mountChrome();
    route();
  });

  global.App = { route: route };
})(window);
