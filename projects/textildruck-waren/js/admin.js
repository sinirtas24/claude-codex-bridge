/* ============================================================
   Textildruck-Waren.de  –  Admin-Panel
   ============================================================ */
(function (global) {
  "use strict";
  var icon = UI.icon, esc = UI.esc, euro = UI.euro, qs = UI.qs, qsa = UI.qsa, parsePrice = UI.parsePrice;

  var GARMENTS = ["tshirt", "hoodie", "polo", "tote", "jacket", "pants", "vest", "cap", "onesie"];
  var FEATURE_ICONS = ["bolt", "print", "truck", "chat", "building", "user", "phone", "clock",
    "checkCircle", "box", "tag", "doc", "palette", "heart", "globe", "settings"];
  var currentTab = "dashboard";

  function guard() {
    var u = Cart.currentUser();
    if (!u || u.role !== "admin") return false;
    return true;
  }

  function render(view) {
    if (!guard()) {
      view.innerHTML = '<div class="page"><div class="container" style="max-width:480px">' +
        '<div class="card" style="text-align:center;padding:40px"><h1 style="font-weight:800;font-size:22px">Admin-Bereich</h1>' +
        '<p class="muted mt8">Bitte melde dich als Administrator an.</p>' +
        '<p class="muted mt8" style="font-size:12px">admin@textildruck-waren.de / admin123</p>' +
        '<a class="btn btn-blue mt16" href="#/login" data-link>Zum Login</a>' +
        '<p class="muted mt16" style="font-size:11.5px;line-height:1.5">⚠ Prototyp-Hinweis: Zugangsdaten und Passwörter werden in diesem Demo-Stand unverschlüsselt im Browser-localStorage gespeichert. Für einen echten Produktivbetrieb sind eine serverseitige Authentifizierung und gehashte Passwörter erforderlich.</p>' +
        "</div></div></div>";
      return;
    }
    var tabs = [
      { id: "dashboard", label: "Dashboard", icon: "grid" },
      { id: "orders", label: "Bestellungen", icon: "box" },
      { id: "products", label: "Produkte", icon: "tag" },
      { id: "categories", label: "Kategorien", icon: "grid" },
      { id: "content", label: "Inhalte & Texte", icon: "doc" },
      { id: "pricing", label: "Preise & Rabatte", icon: "tag" },
      { id: "customers", label: "Kunden", icon: "user" },
      { id: "settings", label: "Einstellungen", icon: "settings" }
    ];
    view.innerHTML = '<div class="page"><div class="container">' +
      '<div class="page-head flex-between"><div><h1>Admin-Panel</h1><p>Verwalte deinen Shop</p></div>' +
        '<a class="btn btn-ghost" href="#/" data-link>Shop ansehen</a></div>' +
      '<div class="proto-banner">' + icon("chat") +
        '<div><b>Nur Prototyp</b> – Der Demo-Admin-Zugang (admin@textildruck-waren.de) und alle Passwörter werden unverschlüsselt im Browser-localStorage gespeichert, es gibt kein echtes Backend. ' +
        'Für einen echten Produktivbetrieb sind eine serverseitige Authentifizierung, gehashte Passwörter und eine gesicherte Datenbank zwingend erforderlich, bevor dieser Shop live geschaltet wird.</div></div>' +
      '<div class="admin-layout"><nav class="admin-nav" id="admin-nav">' +
        tabs.map(function (t) {
          return '<button data-tab="' + t.id + '" class="' + (t.id === currentTab ? "active" : "") + '">' + icon(t.icon) + esc(t.label) + "</button>";
        }).join("") + "</nav>" +
      '<div id="admin-content"></div></div></div></div>';

    qsa("#admin-nav button", view).forEach(function (b) {
      b.addEventListener("click", function () {
        currentTab = b.getAttribute("data-tab");
        qsa("#admin-nav button", view).forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        renderTab(qs("#admin-content", view));
      });
    });
    renderTab(qs("#admin-content", view));
  }

  function renderTab(box) {
    var fn = { dashboard: tabDashboard, orders: tabOrders, products: tabProducts,
      categories: tabCategories, content: tabContent, pricing: tabPricing,
      customers: tabCustomers, settings: tabSettings }[currentTab];
    (fn || tabDashboard)(box);
  }

  /* ---------- Dashboard ---------- */
  function tabDashboard(box) {
    var store = TWD.get();
    var revenue = store.orders.reduce(function (s, o) { return s + (o.total || 0); }, 0);
    var lastStatusId = store.orderStatuses.length ? store.orderStatuses[store.orderStatuses.length - 1].id : null;
    var pending = store.orders.filter(function (o) { return o.status !== lastStatusId; }).length;
    box.innerHTML =
      '<div class="admin-stats">' +
        stat(store.orders.length, "Bestellungen") +
        stat(euro(revenue), "Umsatz") +
        stat(store.products.length, "Produkte") +
        stat(store.users.length, "Kunden") +
      "</div>" +
      '<div class="card"><div class="admin-section-title">Neueste Bestellungen</div>' +
        (store.orders.length ? ordersTable(store.orders.slice(0, 5)) : '<p class="muted">Noch keine Bestellungen.</p>') + "</div>" +
      '<div class="card"><div class="admin-section-title">Offene Bestellungen: ' + pending + "</div>" +
        '<p class="muted">Bestellungen, die noch nicht versendet wurden.</p></div>';
    bindOrdersTable(box);
  }
  function stat(val, lbl) {
    return '<div class="stat-card"><div class="sc-val">' + val + '</div><div class="sc-lbl">' + esc(lbl) + "</div></div>";
  }

  /* ---------- Bestellungen ---------- */
  function tabOrders(box) {
    var store = TWD.get();
    box.innerHTML = '<div class="card"><div class="admin-section-title">Bestellungen verwalten</div>' +
      (store.orders.length ? ordersTable(store.orders) : '<p class="muted">Noch keine Bestellungen vorhanden.</p>') + "</div>";
    bindOrdersTable(box);
  }
  function ordersTable(orders) {
    var statuses = TWD.get().orderStatuses;
    return '<div style="overflow-x:auto"><table class="table"><thead><tr>' +
      "<th>Nr.</th><th>Datum</th><th>Kunde</th><th>Betrag</th><th>Status</th><th></th></tr></thead><tbody>" +
      orders.map(function (o) {
        return "<tr><td><b>" + esc(o.number) + "</b></td><td>" + Shop.fmtDate(o.createdAt) + "</td>" +
          "<td>" + esc(o.customerName || "-") + "</td><td>" + euro(o.total) + "</td>" +
          '<td><select data-status="' + o.id + '">' + statuses.map(function (s) {
            return '<option value="' + s.id + '"' + (s.id === o.status ? " selected" : "") + ">" + esc(s.label) + "</option>";
          }).join("") + "</select></td>" +
          '<td><button class="btn btn-ghost btn-sm" data-view-order="' + o.id + '">Ansehen</button></td></tr>';
      }).join("") + "</tbody></table></div>";
  }
  function bindOrdersTable(box) {
    qsa("[data-status]", box).forEach(function (sel) {
      sel.addEventListener("change", function () {
        Cart.setOrderStatus(sel.getAttribute("data-status"), sel.value);
        UI.toast("Status aktualisiert.", "success");
      });
    });
    qsa("[data-view-order]", box).forEach(function (b) {
      b.addEventListener("click", function () { viewOrder(b.getAttribute("data-view-order")); });
    });
  }
  function viewOrder(id) {
    var o = TWD.get().orders.filter(function (x) { return x.id === id; })[0];
    if (!o) return;
    UI.modal({
      title: "Bestellung " + o.number, wide: true,
      body: Shop.statusTrack(o.status) + '<div class="divider"></div>' +
        '<div class="grid2"><div><b>Kunde</b><div class="mt8" style="font-size:13px">' + esc(o.customerName) + "<br>" + esc(o.customerEmail || "") + "</div></div>" +
        '<div><b>Zahlung</b><div class="mt8" style="font-size:13px">' + esc(o.payment || "-") + "</div></div></div>" +
        '<div class="divider"></div><b>Artikel (' + o.items.length + ")</b>" +
        '<table class="table mt8"><tbody>' + o.items.map(function (it) {
          return "<tr><td>" + esc(it.name) + " (" + esc(it.size) + ")</td><td>" + it.qty + "×</td><td>" + euro(it.unitPrice * it.qty) + "</td></tr>";
        }).join("") + "</tbody></table>" +
        '<div class="text-right mt8" style="font-weight:800">Gesamt: ' + euro(o.total) + "</div>",
      foot: '<button class="btn btn-blue" data-close>Schließen</button>'
    });
  }

  /* ---------- Produkte ---------- */
  function tabProducts(box) {
    var store = TWD.get();
    box.innerHTML = '<div class="card"><div class="admin-section-title">Produkte' +
      '<button class="btn btn-blue btn-sm" id="add-product">' + icon("plus") + "Neues Produkt</button></div>" +
      '<div style="overflow-x:auto"><table class="table"><thead><tr><th>Vorschau</th><th>Name</th><th>Bereich</th><th>Kategorie</th><th>Preis</th><th>Alt-Preis</th><th>Rabatt%</th><th></th></tr></thead><tbody id="prod-rows">' +
      store.products.map(productRow).join("") + "</tbody></table></div></div>";
    bindProductRows(box);
    qs("#add-product", box).addEventListener("click", function () { editProduct(null, box); });
  }
  function productRow(p) {
    var img = p.image || TWD.garmentSVG(p.garment, p.color, {});
    var onerr = p.image ? UI.imgFallbackAttr(p.garment, p.color) : "";
    return '<tr data-pid="' + p.id + '"><td><img src="' + esc(img) + '" style="width:40px;height:40px;object-fit:contain"' + onerr + "></td>" +
      "<td><b>" + esc(p.name) + "</b></td><td>" + esc(p.section) + "</td><td>" + esc(p.category) + "</td>" +
      "<td>" + euro(p.price) + "</td><td>" + (p.oldPrice ? euro(p.oldPrice) : "-") + "</td><td>" + (p.discount || 0) + "</td>" +
      '<td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" data-edit-prod="' + p.id + '">' + icon("edit") + '</button> <button class="btn btn-ghost btn-sm" data-del-prod="' + p.id + '">' + icon("trash") + "</button></td></tr>";
  }
  function bindProductRows(box) {
    qsa("[data-edit-prod]", box).forEach(function (b) {
      b.addEventListener("click", function () { editProduct(b.getAttribute("data-edit-prod"), box); });
    });
    qsa("[data-del-prod]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-del-prod");
        UI.confirmDialog("Produkt wirklich löschen?", function () {
          var store = TWD.get();
          store.products = store.products.filter(function (p) { return p.id !== id; });
          TWD.save(); tabProducts(box); UI.toast("Produkt gelöscht.", "info");
        }, { danger: true, yes: "Löschen" });
      });
    });
  }
  function editProduct(id, box) {
    var store = TWD.get();
    var p = id ? store.products.filter(function (x) { return x.id === id; })[0] : {
      id: "", name: "", section: "sortiment", category: store.categories[0].id,
      price: 9.99, oldPrice: null, discount: 0, garment: "tshirt", color: "#111827", image: ""
    };
    var sections = [["angebote", "Angebote"], ["bestseller", "Bestseller"], ["arbeitskleidung", "Arbeitskleidung"], ["sortiment", "Sortiment (nur Kategorie/Suche)"]];
    var m = UI.modal({
      title: id ? "Produkt bearbeiten" : "Neues Produkt", wide: true,
      body: '<div class="grid2"><div>' +
        field("Name", "p-name", p.name) +
        '<div class="form-group"><label>Bereich</label><select class="form-control" id="p-section">' +
          sections.map(function (s) { return '<option value="' + s[0] + '"' + (p.section === s[0] ? " selected" : "") + ">" + s[1] + "</option>"; }).join("") + "</select></div>" +
        '<div class="form-group"><label>Kategorie</label><select class="form-control" id="p-category">' +
          store.categories.map(function (c) { return '<option value="' + c.id + '"' + (p.category === c.id ? " selected" : "") + ">" + esc(c.name) + "</option>"; }).join("") + "</select></div>" +
        field("Bild-URL (echtes Foto, optional)", "p-image", p.image || "") +
        '<div class="form-group"><label>Grafik (Fallback, falls Bild-URL leer/nicht ladbar)</label><select class="form-control" id="p-garment">' +
          GARMENTS.map(function (g) { return '<option value="' + g + '"' + (p.garment === g ? " selected" : "") + ">" + g + "</option>"; }).join("") + "</select></div>" +
        '<div class="form-group"><label>Farbe</label><input class="form-control" type="color" id="p-color" value="' + (p.color || "#111827") + '" style="height:44px"></div>' +
        "</div><div>" +
        field("Preis (€)", "p-price", p.price) +
        field("Alt-Preis (€, optional)", "p-oldprice", p.oldPrice || "") +
        field("Rabatt (%)", "p-discount", p.discount || 0) +
        '<div class="mt16"><label>Vorschau</label><div id="p-preview" style="width:120px;height:120px;background:var(--gray-50);border-radius:8px;padding:8px;margin-top:8px"></div></div>' +
        "</div></div>",
      foot: '<button class="btn btn-ghost" data-close>Abbrechen</button><button class="btn btn-blue" id="save-prod">Speichern</button>'
    });
    function updatePrev() {
      var imgUrl = qs("#p-image", m).value.trim();
      var garment = qs("#p-garment", m).value, color = qs("#p-color", m).value;
      var src = imgUrl || TWD.garmentSVG(garment, color, {});
      var onerr = imgUrl ? UI.imgFallbackAttr(garment, color) : "";
      qs("#p-preview", m).innerHTML = '<img src="' + esc(src) + '" style="width:100%;height:100%;object-fit:contain"' + onerr + ">";
    }
    qs("#p-garment", m).addEventListener("change", updatePrev);
    qs("#p-color", m).addEventListener("input", updatePrev);
    qs("#p-image", m).addEventListener("input", updatePrev);
    updatePrev();
    qs("#save-prod", m).addEventListener("click", function () {
      var name = qs("#p-name", m).value.trim();
      if (!name) { UI.toast("Bitte Name eingeben.", "error"); return; }
      var data = {
        name: name, section: qs("#p-section", m).value, category: qs("#p-category", m).value,
        garment: qs("#p-garment", m).value, color: qs("#p-color", m).value,
        image: qs("#p-image", m).value.trim() || null,
        price: parsePrice(qs("#p-price", m).value),
        oldPrice: qs("#p-oldprice", m).value ? parsePrice(qs("#p-oldprice", m).value) : null,
        discount: parseInt(qs("#p-discount", m).value, 10) || 0
      };
      if (id) { Object.assign(p, data); }
      else { data.id = "p-" + Math.random().toString(36).slice(2, 8); store.products.push(data); }
      TWD.save(); UI.closeModal(); tabProducts(box); UI.toast("Produkt gespeichert.", "success");
    });
  }

  /* ---------- Kategorien ---------- */
  function tabCategories(box) {
    var store = TWD.get();
    box.innerHTML = '<div class="card"><div class="admin-section-title">Kategorien</div>' +
      '<div style="overflow-x:auto"><table class="table"><thead><tr><th>Icon</th><th>Name</th><th>Bild-URL</th><th></th></tr></thead><tbody>' +
      store.categories.map(function (c) {
        return "<tr><td>" + icon(c.icon) + '</td><td><input class="form-control" value="' + esc(c.name) + '" data-cat-name="' + c.id + '"></td>' +
          '<td><input class="form-control" value="' + esc(c.image) + '" data-cat-image="' + c.id + '"></td>' +
          '<td><button class="btn btn-ghost btn-sm" data-save-cat="' + c.id + '">Speichern</button></td></tr>';
      }).join("") + "</tbody></table></div>" +
      '<p class="muted mt16" style="font-size:13px">Tipp: Nutze URLs zu realen Produkt-/Branchenfotos. Ist keine URL erreichbar, wird automatisch ein farbiges Icon angezeigt.</p></div>';
    qsa("[data-save-cat]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-save-cat");
        var c = store.categories.filter(function (x) { return x.id === id; })[0];
        c.name = qs('[data-cat-name="' + id + '"]', box).value;
        c.image = qs('[data-cat-image="' + id + '"]', box).value;
        TWD.save(); UI.toast("Kategorie gespeichert.", "success");
      });
    });
  }

  /* ---------- Inhalte & Texte ---------- */
  function tabContent(box) {
    var s = TWD.get().settings;
    box.innerHTML =
      '<div class="card"><div class="admin-section-title">Logo & Kopfzeile</div>' +
        '<div class="grid2">' + field("Logo Zeile 1", "s-logo1", s.logoLine1) + field("Logo Zeile 2 (Akzentfarbe)", "s-logo2", s.logoLine2) + "</div>" +
        '<div class="grid2">' + field("Hotline", "s-hotline", s.hotline) + field("Öffnungszeiten", "s-hours", s.hours) + "</div>" +
        field("Suchfeld-Platzhalter", "s-search", s.searchPlaceholder) +
      "</div>" +
      '<div class="card"><div class="admin-section-title">Hero-Bereich (allgemein)</div>' +
        field("Button-Text (CTA)", "h-cta", s.hero.ctaText) +
        '<div class="grid2">' + field("Badge-Titel", "h-badge", s.hero.badgeTitle) +
        '<div class="form-group"><label>Checkliste (je Zeile ein Punkt)</label><textarea class="form-control" id="h-checklist" rows="4">' + esc(s.hero.checklist.join("\n")) + "</textarea></div></div>" +
      "</div>" +
      '<div class="card"><div class="admin-section-title">Hero-Slider – alle Folien' +
        '<button class="btn btn-blue btn-sm" id="add-slide">' + icon("plus") + "Folie hinzufügen</button></div>" +
        '<div id="slides-rows">' + s.hero.slides.map(slideRow).join("") + "</div></div>" +
      '<div class="card"><div class="admin-section-title">Abschnitts-Titel (Produktblöcke)</div>' +
        '<div class="grid2">' + field("Angebote Titel", "sec-ang-t", s.sections.angebote.title) + field("Angebote Untertitel", "sec-ang-s", s.sections.angebote.subtitle) + "</div>" +
        '<div class="grid2">' + field("Bestseller Titel", "sec-best-t", s.sections.bestseller.title) + field("Bestseller Untertitel", "sec-best-s", s.sections.bestseller.subtitle) + "</div>" +
        '<div class="grid2">' + field("Arbeitskleidung Titel", "sec-arb-t", s.sections.arbeitskleidung.title) + field("Arbeitskleidung Untertitel", "sec-arb-s", s.sections.arbeitskleidung.subtitle) + "</div>" +
      "</div>" +
      '<div class="card"><div class="admin-section-title">Topbar-Hinweise (Kopfzeile)' +
        '<button class="btn btn-blue btn-sm" id="add-topbar-feat">' + icon("plus") + "Hinzufügen</button></div>" +
        '<div id="topbar-feat-rows">' + s.topbarFeatures.map(topbarFeatRow).join("") + "</div></div>" +
      '<div class="card"><div class="admin-section-title">Servicemerkmale (Feature-Leiste)' +
        '<button class="btn btn-blue btn-sm" id="add-feat">' + icon("plus") + "Hinzufügen</button></div>" +
        '<div id="feat-rows">' + s.features.map(featureRow).join("") + "</div></div>" +
      '<div class="card"><div class="admin-section-title">"SO EINFACH GEHT\'S" – Schritte' +
        '<button class="btn btn-blue btn-sm" id="add-step">' + icon("plus") + "Hinzufügen</button></div>" +
        '<div id="step-rows">' + s.steps.map(stepRow).join("") + "</div></div>" +
      '<div class="card"><div class="admin-section-title">Vertrauens-Logos (Trust-Leiste)</div>' +
        field("Trust-Zeile Überschrift", "s-trust", s.trustTitle) +
        '<div class="form-group"><label>Logo-Namen (je Zeile ein Eintrag)</label><textarea class="form-control" id="s-trustlogos" rows="5">' + esc(s.trustLogos.join("\n")) + "</textarea></div>" +
      "</div>" +
      '<div class="card"><div class="admin-section-title">Footer-Spalten</div>' +
        '<div class="grid3">' +
          '<div class="form-group"><label>Informationen (je Zeile ein Link)</label><textarea class="form-control" id="f-info" rows="6">' + esc(s.footerCols.informationen.join("\n")) + "</textarea></div>" +
          '<div class="form-group"><label>Kundenservice (je Zeile ein Link)</label><textarea class="form-control" id="f-service" rows="6">' + esc(s.footerCols.kundenservice.join("\n")) + "</textarea></div>" +
          '<div class="form-group"><label>Rechtliches (je Zeile ein Link)</label><textarea class="form-control" id="f-legal" rows="6">' + esc(s.footerCols.rechtliches.join("\n")) + "</textarea></div>" +
        "</div>" +
        field("Zahlungshinweis", "s-paymentinfo", s.paymentInfo) +
      "</div>" +
      '<div class="card"><div class="admin-section-title">Rechtliche Seiten (Impressum / Datenschutz / AGB / Widerruf)</div>' +
        '<p class="muted mb16" style="font-size:12.5px">Zeilen, die mit "## " beginnen, werden als Überschrift dargestellt. Leerzeile = neuer Absatz. Diese Seiten enthalten Demo-Angaben (Firmenname, Anschrift, Handelsregister, USt-IdNr.) – Besuchern wird ein entsprechender Hinweis angezeigt. <b>Bitte vor Veröffentlichung durch die echten Unternehmensangaben ersetzen.</b></p>' +
        '<div class="form-group"><label>Impressum</label><textarea class="form-control" id="lp-impressum" rows="8">' + esc(s.legalPages.impressum) + "</textarea></div>" +
        '<div class="form-group"><label>Datenschutzerklärung</label><textarea class="form-control" id="lp-datenschutz" rows="8">' + esc(s.legalPages.datenschutz) + "</textarea></div>" +
        '<div class="form-group"><label>AGB</label><textarea class="form-control" id="lp-agb" rows="8">' + esc(s.legalPages.agb) + "</textarea></div>" +
        '<div class="form-group"><label>Widerrufsbelehrung</label><textarea class="form-control" id="lp-widerrufsbelehrung" rows="8">' + esc(s.legalPages.widerrufsbelehrung) + "</textarea></div>" +
      "</div>" +
      '<div class="card"><div class="admin-section-title">Weitere Texte</div>' +
        field("Copyright", "s-copyright", s.copyright) +
      "</div>" +
      '<button class="btn btn-blue" id="save-content">' + icon("check") + "Alle Inhalte speichern</button>";

    qs("#add-slide", box).addEventListener("click", function () {
      s.hero.slides.push({ garment1: "tshirt", color1: "#111827", garment2: "hoodie", color2: "#f9fafb",
        image1: "", image2: "", title: "Neuer Titel", subtitle: "Neuer Untertitel" });
      tabContent(box);
    });
    bindSlideRows(box, s);
    bindTopbarFeatRows(box, s);
    bindFeatureRows(box, s);
    bindStepRows(box, s);

    qs("#save-content", box).addEventListener("click", function () {
      var st = TWD.get().settings;
      st.logoLine1 = qs("#s-logo1", box).value; st.logoLine2 = qs("#s-logo2", box).value;
      st.hotline = qs("#s-hotline", box).value; st.hours = qs("#s-hours", box).value;
      st.searchPlaceholder = qs("#s-search", box).value;
      st.hero.ctaText = qs("#h-cta", box).value; st.hero.badgeTitle = qs("#h-badge", box).value;
      st.hero.checklist = qs("#h-checklist", box).value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      qsa(".slide-row", box).forEach(function (row) {
        var i = parseInt(row.getAttribute("data-i"), 10);
        var sl = st.hero.slides[i];
        if (!sl) return;
        sl.title = qs('[data-slide-title="' + i + '"]', box).value;
        sl.subtitle = qs('[data-slide-sub="' + i + '"]', box).value;
        sl.garment1 = qs('[data-slide-g1="' + i + '"]', box).value;
        sl.color1 = qs('[data-slide-c1="' + i + '"]', box).value;
        sl.image1 = qs('[data-slide-img1="' + i + '"]', box).value.trim();
        sl.garment2 = qs('[data-slide-g2="' + i + '"]', box).value;
        sl.color2 = qs('[data-slide-c2="' + i + '"]', box).value;
        sl.image2 = qs('[data-slide-img2="' + i + '"]', box).value.trim();
      });
      if (st.hero.slides[0]) { st.hero.title = st.hero.slides[0].title; st.hero.subtitle = st.hero.slides[0].subtitle; }
      st.sections.angebote.title = qs("#sec-ang-t", box).value; st.sections.angebote.subtitle = qs("#sec-ang-s", box).value;
      st.sections.bestseller.title = qs("#sec-best-t", box).value; st.sections.bestseller.subtitle = qs("#sec-best-s", box).value;
      st.sections.arbeitskleidung.title = qs("#sec-arb-t", box).value; st.sections.arbeitskleidung.subtitle = qs("#sec-arb-s", box).value;
      st.topbarFeatures.forEach(function (f, i) {
        f.icon = qs('[data-tbf-icon="' + i + '"]', box).value;
        f.text = qs('[data-tbf-text="' + i + '"]', box).value;
      });
      st.features.forEach(function (f, i) {
        f.icon = qs('[data-feat-icon="' + i + '"]', box).value;
        f.title = qs('[data-feat-title="' + i + '"]', box).value;
        f.text = qs('[data-feat-text="' + i + '"]', box).value;
      });
      st.steps.forEach(function (step, i) {
        step.title = qs('[data-step-title="' + i + '"]', box).value;
        step.text = qs('[data-step-text="' + i + '"]', box).value;
      });
      st.trustTitle = qs("#s-trust", box).value;
      st.trustLogos = qs("#s-trustlogos", box).value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      st.footerCols.informationen = qs("#f-info", box).value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      st.footerCols.kundenservice = qs("#f-service", box).value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      st.footerCols.rechtliches = qs("#f-legal", box).value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      st.paymentInfo = qs("#s-paymentinfo", box).value;
      st.legalPages.impressum = qs("#lp-impressum", box).value;
      st.legalPages.datenschutz = qs("#lp-datenschutz", box).value;
      st.legalPages.agb = qs("#lp-agb", box).value;
      st.legalPages.widerrufsbelehrung = qs("#lp-widerrufsbelehrung", box).value;
      st.copyright = qs("#s-copyright", box).value;
      TWD.save();
      Layout.mountChrome();
      UI.toast("Inhalte gespeichert. Startseite aktualisiert.", "success");
    });
  }

  function slideRow(sl, i) {
    return '<div class="slide-row" data-i="' + i + '" style="border:1px solid var(--gray-200);border-radius:8px;padding:12px;margin-bottom:12px">' +
      '<div class="flex-between"><b>Folie ' + (i + 1) + "</b>" +
        (i > 0 ? '<button class="btn btn-ghost btn-sm" data-del-slide="' + i + '">' + icon("trash") + "</button>" : "") + "</div>" +
      '<div class="grid2 mt8">' +
        '<div class="form-group"><label>Titel</label><input class="form-control" data-slide-title="' + i + '" value="' + esc(sl.title) + '"></div>' +
        '<div class="form-group"><label>Untertitel</label><input class="form-control" data-slide-sub="' + i + '" value="' + esc(sl.subtitle) + '"></div>' +
      "</div>" +
      '<div class="grid2">' +
        '<div><div class="form-group"><label>Produkt 1 – Grafik (Fallback)</label><select class="form-control" data-slide-g1="' + i + '">' +
          GARMENTS.map(function (g) { return '<option value="' + g + '"' + (sl.garment1 === g ? " selected" : "") + ">" + g + "</option>"; }).join("") + "</select></div>" +
          '<div class="form-group"><label>Produkt 1 – Farbe (Fallback-Grafik)</label><input class="form-control" type="color" data-slide-c1="' + i + '" value="' + sl.color1 + '" style="height:40px"></div>' +
          '<div class="form-group"><label>Produkt 1 – Foto-URL (optional)</label><input class="form-control" data-slide-img1="' + i + '" value="' + esc(sl.image1 || "") + '" placeholder="https://... (leer = automatische Grafik)"></div></div>' +
        '<div><div class="form-group"><label>Produkt 2 – Grafik (Fallback)</label><select class="form-control" data-slide-g2="' + i + '">' +
          GARMENTS.map(function (g) { return '<option value="' + g + '"' + (sl.garment2 === g ? " selected" : "") + ">" + g + "</option>"; }).join("") + "</select></div>" +
          '<div class="form-group"><label>Produkt 2 – Farbe (Fallback-Grafik)</label><input class="form-control" type="color" data-slide-c2="' + i + '" value="' + sl.color2 + '" style="height:40px"></div>' +
          '<div class="form-group"><label>Produkt 2 – Foto-URL (optional)</label><input class="form-control" data-slide-img2="' + i + '" value="' + esc(sl.image2 || "") + '" placeholder="https://... (leer = automatische Grafik)"></div></div>' +
      "</div></div>";
  }
  function bindSlideRows(box, s) {
    qsa("[data-del-slide]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.getAttribute("data-del-slide"), 10);
        s.hero.slides.splice(i, 1);
        tabContent(box);
      });
    });
  }
  function rowMoveDelButtons(prefix, i, n) {
    return '<div style="white-space:nowrap">' +
      '<button class="btn btn-ghost btn-sm" data-' + prefix + '-up="' + i + '"' + (i === 0 ? " disabled" : "") + ' title="Nach oben">' + icon("chevLeft") + "</button>" +
      '<button class="btn btn-ghost btn-sm" data-' + prefix + '-down="' + i + '"' + (i === n - 1 ? " disabled" : "") + ' title="Nach unten">' + icon("chevRight") + "</button>" +
      '<button class="btn btn-ghost btn-sm" data-' + prefix + '-del="' + i + '"' + (n <= 1 ? " disabled" : "") + ">" + icon("trash") + "</button>" +
      "</div>";
  }
  function iconSelect(prefix, i, current) {
    return '<select class="form-control" data-' + prefix + '-icon="' + i + '">' +
      FEATURE_ICONS.map(function (ic) { return '<option value="' + ic + '"' + (current === ic ? " selected" : "") + ">" + ic + "</option>"; }).join("") +
      "</select>";
  }
  function topbarFeatRow(f, i, arr) {
    return '<div class="admin-dyn-row admin-dyn-row-icon-text" style="margin-bottom:8px">' +
      '<div class="form-group"><label>Icon</label>' + iconSelect("tbf", i, f.icon) + "</div>" +
      '<div class="form-group"><label>Text ' + (i + 1) + '</label><input class="form-control" data-tbf-text="' + i + '" value="' + esc(f.text) + '"></div>' +
      rowMoveDelButtons("tbf", i, arr.length) +
      "</div>";
  }
  function featureRow(f, i, arr) {
    return '<div class="admin-dyn-row admin-dyn-row-icon-title-text" style="margin-bottom:8px">' +
      '<div class="form-group"><label>Icon</label>' + iconSelect("feat", i, f.icon) + "</div>" +
      '<div class="form-group"><label>Titel ' + (i + 1) + "</label><input class=\"form-control\" data-feat-title=\"" + i + '" value="' + esc(f.title) + '"></div>' +
      '<div class="form-group"><label>Text ' + (i + 1) + "</label><input class=\"form-control\" data-feat-text=\"" + i + '" value="' + esc(f.text) + '"></div>' +
      rowMoveDelButtons("feat", i, arr.length) +
      "</div>";
  }
  function stepRow(st, i, arr) {
    return '<div class="admin-dyn-row admin-dyn-row-title-text" style="margin-bottom:8px">' +
      '<div class="form-group"><label>Schritt ' + (i + 1) + " – Titel</label><input class=\"form-control\" data-step-title=\"" + i + '" value="' + esc(st.title) + '"></div>' +
      '<div class="form-group"><label>Schritt ' + (i + 1) + " – Text</label><input class=\"form-control\" data-step-text=\"" + i + '" value="' + esc(st.text) + '"></div>' +
      rowMoveDelButtons("step", i, arr.length) +
      "</div>";
  }
  function moveArr(arr, i, dir) {
    var j = i + dir;
    if (j < 0 || j >= arr.length) return;
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  /* Schreibt die aktuell im Formular sichtbaren (ggf. noch nicht gespeicherten) Werte
     zurück in die Arrays, bevor diese durch Verschieben/Löschen/Hinzufügen neu
     gerendert werden – sonst gehen ungespeicherte Eingaben beim Re-Render verloren. */
  function syncDynamicRowsFromForm(box, s) {
    s.topbarFeatures.forEach(function (f, i) {
      var iconEl = qs('[data-tbf-icon="' + i + '"]', box);
      var textEl = qs('[data-tbf-text="' + i + '"]', box);
      if (iconEl) f.icon = iconEl.value;
      if (textEl) f.text = textEl.value;
    });
    s.features.forEach(function (f, i) {
      var iconEl = qs('[data-feat-icon="' + i + '"]', box);
      var titleEl = qs('[data-feat-title="' + i + '"]', box);
      var textEl = qs('[data-feat-text="' + i + '"]', box);
      if (iconEl) f.icon = iconEl.value;
      if (titleEl) f.title = titleEl.value;
      if (textEl) f.text = textEl.value;
    });
    s.steps.forEach(function (step, i) {
      var titleEl = qs('[data-step-title="' + i + '"]', box);
      var textEl = qs('[data-step-text="' + i + '"]', box);
      if (titleEl) step.title = titleEl.value;
      if (textEl) step.text = textEl.value;
    });
  }
  function bindTopbarFeatRows(box, s) {
    qsa("[data-tbf-up]", box).forEach(function (b) { b.addEventListener("click", function () { syncDynamicRowsFromForm(box, s); moveArr(s.topbarFeatures, parseInt(b.getAttribute("data-tbf-up"), 10), -1); TWD.save(); tabContent(box); }); });
    qsa("[data-tbf-down]", box).forEach(function (b) { b.addEventListener("click", function () { syncDynamicRowsFromForm(box, s); moveArr(s.topbarFeatures, parseInt(b.getAttribute("data-tbf-down"), 10), 1); TWD.save(); tabContent(box); }); });
    qsa("[data-tbf-del]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        if (s.topbarFeatures.length <= 1) return;
        syncDynamicRowsFromForm(box, s);
        s.topbarFeatures.splice(parseInt(b.getAttribute("data-tbf-del"), 10), 1);
        TWD.save(); tabContent(box);
      });
    });
    qs("#add-topbar-feat", box).addEventListener("click", function () {
      syncDynamicRowsFromForm(box, s);
      s.topbarFeatures.push({ icon: "bolt", text: "Neuer Hinweis" });
      TWD.save(); tabContent(box);
    });
  }
  function bindFeatureRows(box, s) {
    qsa("[data-feat-up]", box).forEach(function (b) { b.addEventListener("click", function () { syncDynamicRowsFromForm(box, s); moveArr(s.features, parseInt(b.getAttribute("data-feat-up"), 10), -1); TWD.save(); tabContent(box); }); });
    qsa("[data-feat-down]", box).forEach(function (b) { b.addEventListener("click", function () { syncDynamicRowsFromForm(box, s); moveArr(s.features, parseInt(b.getAttribute("data-feat-down"), 10), 1); TWD.save(); tabContent(box); }); });
    qsa("[data-feat-del]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        if (s.features.length <= 1) return;
        syncDynamicRowsFromForm(box, s);
        s.features.splice(parseInt(b.getAttribute("data-feat-del"), 10), 1);
        TWD.save(); tabContent(box);
      });
    });
    qs("#add-feat", box).addEventListener("click", function () {
      syncDynamicRowsFromForm(box, s);
      s.features.push({ icon: "bolt", title: "Neues Merkmal", text: "Beschreibung" });
      TWD.save(); tabContent(box);
    });
  }
  function bindStepRows(box, s) {
    qsa("[data-step-up]", box).forEach(function (b) { b.addEventListener("click", function () { syncDynamicRowsFromForm(box, s); moveArr(s.steps, parseInt(b.getAttribute("data-step-up"), 10), -1); TWD.save(); tabContent(box); }); });
    qsa("[data-step-down]", box).forEach(function (b) { b.addEventListener("click", function () { syncDynamicRowsFromForm(box, s); moveArr(s.steps, parseInt(b.getAttribute("data-step-down"), 10), 1); TWD.save(); tabContent(box); }); });
    qsa("[data-step-del]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        if (s.steps.length <= 1) return;
        syncDynamicRowsFromForm(box, s);
        s.steps.splice(parseInt(b.getAttribute("data-step-del"), 10), 1);
        TWD.save(); tabContent(box);
      });
    });
    qs("#add-step", box).addEventListener("click", function () {
      syncDynamicRowsFromForm(box, s);
      s.steps.push({ title: "Neuer Schritt", text: "Beschreibung" });
      TWD.save(); tabContent(box);
    });
  }

  /* ---------- Preise & Rabatte ---------- */
  function tabPricing(box) {
    var store = TWD.get();
    var cfg = store.customizer;
    box.innerHTML =
      '<div class="card"><div class="admin-section-title">Produktpreise & Rabatte</div>' +
        '<div style="overflow-x:auto"><table class="table"><thead><tr><th>Produkt</th><th>Preis (€)</th><th>Alt-Preis (€)</th><th>Rabatt %</th></tr></thead><tbody>' +
        store.products.map(function (p) {
          return "<tr><td><b>" + esc(p.name) + '</b></td><td><input class="form-control" style="width:90px" value="' + String(p.price).replace(".", ",") + '" data-price="' + p.id + '"></td>' +
            '<td><input class="form-control" style="width:90px" value="' + (p.oldPrice ? String(p.oldPrice).replace(".", ",") : "") + '" data-oldprice="' + p.id + '"></td>' +
            '<td><input class="form-control" style="width:70px" value="' + (p.discount || 0) + '" data-discount="' + p.id + '"></td></tr>';
        }).join("") + "</tbody></table></div>" +
        '<button class="btn btn-blue mt16" id="save-prices">Produktpreise speichern</button></div>' +
      '<div class="card"><div class="admin-section-title">Konfigurator: Basispreise</div>' +
        '<table class="table"><thead><tr><th>Produkt</th><th>Basispreis (€)</th></tr></thead><tbody>' +
        cfg.products.map(function (p) {
          return "<tr><td>" + esc(p.name) + '</td><td><input class="form-control" style="width:90px" value="' + String(p.basePrice).replace(".", ",") + '" data-base="' + p.id + '"></td></tr>';
        }).join("") + "</tbody></table>" +
        '<div class="admin-section-title mt16">Druckverfahren-Aufpreise</div>' +
        '<table class="table"><thead><tr><th>Verfahren</th><th>Aufpreis (€)</th></tr></thead><tbody>' +
        cfg.printMethods.map(function (mth) {
          return "<tr><td>" + esc(mth.name) + '</td><td><input class="form-control" style="width:90px" value="' + String(mth.price).replace(".", ",") + '" data-method="' + mth.id + '"></td></tr>';
        }).join("") + "</tbody></table>" +
        '<div class="admin-section-title mt16">Druckpositionen-Aufpreise</div>' +
        '<table class="table"><thead><tr><th>Position</th><th>Aufpreis (€)</th></tr></thead><tbody>' +
        cfg.positions.map(function (pos) {
          return "<tr><td>" + esc(pos.label) + '</td><td><input class="form-control" style="width:90px" value="' + String(pos.price).replace(".", ",") + '" data-position="' + pos.id + '"></td></tr>';
        }).join("") + "</tbody></table>" +
        '<button class="btn btn-blue mt16" id="save-cfg-prices">Konfigurator-Preise speichern</button></div>';

    qs("#save-prices", box).addEventListener("click", function () {
      store.products.forEach(function (p) {
        p.price = parsePrice(qs('[data-price="' + p.id + '"]', box).value);
        var op = qs('[data-oldprice="' + p.id + '"]', box).value.trim();
        p.oldPrice = op ? parsePrice(op) : null;
        p.discount = parseInt(qs('[data-discount="' + p.id + '"]', box).value, 10) || 0;
      });
      TWD.save(); UI.toast("Produktpreise gespeichert.", "success");
    });
    qs("#save-cfg-prices", box).addEventListener("click", function () {
      cfg.products.forEach(function (p) { p.basePrice = parsePrice(qs('[data-base="' + p.id + '"]', box).value); });
      cfg.printMethods.forEach(function (mth) { mth.price = parsePrice(qs('[data-method="' + mth.id + '"]', box).value); });
      cfg.positions.forEach(function (pos) { pos.price = parsePrice(qs('[data-position="' + pos.id + '"]', box).value); });
      TWD.save(); UI.toast("Konfigurator-Preise gespeichert.", "success");
    });
  }

  /* ---------- Kunden ---------- */
  function tabCustomers(box) {
    var store = TWD.get();
    box.innerHTML = '<div class="card"><div class="admin-section-title">Kunden</div>' +
      '<div style="overflow-x:auto"><table class="table"><thead><tr><th>Name</th><th>E-Mail</th><th>Typ</th><th>Rolle</th><th>Bestellungen</th></tr></thead><tbody>' +
      store.users.map(function (u) {
        var cnt = store.orders.filter(function (o) { return o.userId === u.id; }).length;
        return "<tr><td><b>" + esc(u.name) + "</b></td><td>" + esc(u.email) + "</td><td>" + esc(u.customerType || "-") + "</td>" +
          "<td>" + (u.role === "admin" ? '<span class="status-badge" style="background:var(--blue)">Admin</span>' : "Kunde") + "</td><td>" + cnt + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
  }

  /* ---------- Einstellungen ---------- */
  function tabSettings(box) {
    var s = TWD.get().settings;
    var c = s.contact;
    box.innerHTML =
      '<div class="card"><div class="admin-section-title">Kontaktdaten (Footer)</div>' +
        '<div class="grid2">' + field("Firma", "ct-company", c.company) + field("Telefon", "ct-phone", c.phone) + "</div>" +
        '<div class="grid2">' + field("Straße", "ct-street", c.street) + field("PLZ / Ort", "ct-city", c.city) + "</div>" +
        '<div class="grid2">' + field("Land", "ct-country", c.country) + field("E-Mail", "ct-email", c.email) + "</div>" +
        '<button class="btn btn-blue" id="save-contact">Kontaktdaten speichern</button></div>' +
      '<div class="card"><div class="admin-section-title">Bestellstatus verwalten</div>' +
        '<p class="muted mb16">Reihenfolge, Bezeichnung und Farbe der Bestellstatus frei anpassen, neue Status hinzufügen oder nicht benötigte entfernen.</p>' +
        '<table class="table"><thead><tr><th>Vorschau</th><th>Bezeichnung</th><th>Farbe</th><th></th></tr></thead><tbody>' + TWD.get().orderStatuses.map(function (st, i, arr) {
          return "<tr><td><span class=\"status-badge\" style=\"background:" + st.color + "\">" + esc(st.label) + "</span></td>" +
            '<td><input class="form-control" value="' + esc(st.label) + '" data-status-label="' + st.id + '"></td>' +
            '<td><input class="form-control" type="color" value="' + esc(st.color) + '" data-status-color="' + st.id + '" style="height:40px;width:70px"></td>' +
            '<td style="white-space:nowrap">' +
              '<button class="btn btn-ghost btn-sm" data-status-up="' + st.id + '"' + (i === 0 ? " disabled" : "") + " title=\"Nach oben\">" + icon("chevLeft") + "</button>" +
              '<button class="btn btn-ghost btn-sm" data-status-down="' + st.id + '"' + (i === arr.length - 1 ? " disabled" : "") + " title=\"Nach unten\">" + icon("chevRight") + "</button>" +
              '<button class="btn btn-ghost btn-sm" data-status-del="' + st.id + '"' + (arr.length <= 1 ? " disabled" : "") + ">" + icon("trash") + "</button>" +
            "</td></tr>";
        }).join("") + "</tbody></table>" +
        '<div class="flex-between mt16"><button class="btn btn-ghost" id="add-status">' + icon("tag") + "Status hinzufügen</button>" +
        '<button class="btn btn-blue" id="save-statuses">Änderungen speichern</button></div></div>' +
      '<div class="card"><div class="admin-section-title">Daten zurücksetzen</div>' +
        '<p class="muted mb16">Setzt alle Inhalte, Produkte und Einstellungen auf den Auslieferungszustand zurück. Bestellungen und Konten bleiben nur erhalten, wenn du sie sicherst.</p>' +
        '<button class="btn btn-orange" id="reset-data">' + icon("trash") + "Alle Daten zurücksetzen</button></div>";

    qs("#save-contact", box).addEventListener("click", function () {
      var ct = TWD.get().settings.contact;
      ct.company = qs("#ct-company", box).value; ct.phone = qs("#ct-phone", box).value;
      ct.street = qs("#ct-street", box).value; ct.city = qs("#ct-city", box).value;
      ct.country = qs("#ct-country", box).value; ct.email = qs("#ct-email", box).value;
      TWD.save(); Layout.mountChrome(); UI.toast("Kontaktdaten gespeichert.", "success");
    });
    qs("#save-statuses", box).addEventListener("click", function () {
      TWD.get().orderStatuses.forEach(function (st) {
        var inp = qs('[data-status-label="' + st.id + '"]', box);
        var col = qs('[data-status-color="' + st.id + '"]', box);
        if (inp) st.label = inp.value;
        if (col) st.color = col.value;
      });
      TWD.save(); UI.toast("Bestellstatus gespeichert.", "success");
      tabSettings(box);
    });
    qs("#add-status", box).addEventListener("click", function () {
      TWD.get().orderStatuses.push({ id: TWD.uid("status"), label: "Neuer Status", color: "#64748b" });
      TWD.save(); UI.toast("Status hinzugefügt.", "success");
      tabSettings(box);
    });
    qsa("[data-status-del]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var store = TWD.get();
        var list = store.orderStatuses;
        if (list.length <= 1) return;
        var id = b.getAttribute("data-status-del");
        var st = list.filter(function (s) { return s.id === id; })[0];
        var usedOrders = store.orders.filter(function (o) { return o.status === id; });
        var others = list.filter(function (s) { return s.id !== id; });
        if (usedOrders.length) {
          var options = others.map(function (s) { return '<option value="' + s.id + '">' + esc(s.label) + "</option>"; }).join("");
          UI.modal({
            title: "Status wird verwendet",
            body: '<p style="font-size:15px;color:#374151">Der Status „' + esc(st.label) + '" wird aktuell von ' +
              usedOrders.length + (usedOrders.length === 1 ? " Bestellung" : " Bestellungen") + ' verwendet (' +
              usedOrders.map(function (o) { return esc(o.number); }).join(", ") +
              '). Wähle einen neuen Status, in den diese Bestellungen verschoben werden, bevor „' + esc(st.label) + '" entfernt werden kann.</p>' +
              '<div class="form-group mt16"><label>Neuer Status für betroffene Bestellungen</label>' +
              '<select class="form-control" id="reassign-status">' + options + "</select></div>",
            foot: '<button class="btn btn-ghost" data-close>Abbrechen</button>' +
              '<button class="btn btn-orange" id="reassign-confirm">Verschieben &amp; löschen</button>',
            onOpen: function (m) {
              qs("#reassign-confirm", m).addEventListener("click", function () {
                var newId = qs("#reassign-status", m).value;
                store.orders.forEach(function (o) {
                  if (o.status === id) {
                    o.status = newId;
                    if (o.statusHistory) o.statusHistory.push({ status: newId, at: new Date().toISOString() });
                  }
                });
                store.orderStatuses = store.orderStatuses.filter(function (s) { return s.id !== id; });
                TWD.save(); UI.closeModal(); UI.toast("Bestellungen verschoben, Status entfernt.", "info");
                tabSettings(box);
              });
            }
          });
          return;
        }
        UI.confirmDialog("Diesen Bestellstatus wirklich entfernen?", function () {
          store.orderStatuses = list.filter(function (s) { return s.id !== id; });
          TWD.save(); UI.toast("Status entfernt.", "info");
          tabSettings(box);
        }, { danger: true, yes: "Entfernen" });
      });
    });
    qsa("[data-status-up]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        moveStatus(b.getAttribute("data-status-up"), -1); tabSettings(box);
      });
    });
    qsa("[data-status-down]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        moveStatus(b.getAttribute("data-status-down"), 1); tabSettings(box);
      });
    });
    qs("#reset-data", box).addEventListener("click", function () {
      UI.confirmDialog("Wirklich alle Daten zurücksetzen? Das kann nicht rückgängig gemacht werden.", function () {
        TWD.reset(); Cart.clearCart(); Cart.logout();
        UI.toast("Daten zurückgesetzt.", "info"); location.hash = "#/";
      }, { danger: true, yes: "Zurücksetzen" });
    });
  }

  function moveStatus(id, dir) {
    var list = TWD.get().orderStatuses;
    var i = list.findIndex(function (st) { return st.id === id; });
    var j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    TWD.save();
  }

  /* ---------- Helpers ---------- */
  function field(label, id, val) {
    return '<div class="form-group"><label>' + esc(label) + '</label><input class="form-control" id="' + id + '" value="' + esc(val) + '"></div>';
  }

  global.Admin = { render: render };
})(window);
