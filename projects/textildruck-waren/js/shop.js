/* ============================================================
   Textildruck-Waren.de  –  Shop-Seiten
   (Auth, Konto, Warenkorb, Checkout, Listen, Produkt, Seiten)
   ============================================================ */
(function (global) {
  "use strict";
  var icon = UI.icon, esc = UI.esc, euro = UI.euro, qs = UI.qs, qsa = UI.qsa;

  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear() +
        " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    } catch (e) { return iso; }
  }

  function statusById(id) {
    return TWD.get().orderStatuses.filter(function (s) { return s.id === id; })[0] ||
      { id: id, label: "Unbekannter Status", color: "#9ca3af" };
  }
  function statusBadge(id) {
    var s = statusById(id);
    return '<span class="status-badge" style="background:' + s.color + '">' + esc(s.label) + "</span>";
  }
  function statusTrack(currentId) {
    var statuses = TWD.get().orderStatuses;
    var curIdx = statuses.findIndex(function (s) { return s.id === currentId; });
    return '<div class="status-track">' + statuses.map(function (s, i) {
      var reached = i <= curIdx;
      return '<div class="snode' + (reached ? " reached" : "") + '">' +
        '<div class="sdot" style="background:' + (reached ? s.color : "#e5e7eb") + '">' + (reached ? icon("check") : "") + "</div>" +
        '<div class="slabel">' + esc(s.label) + "</div></div>";
    }).join("") + "</div>";
  }

  /* ============================================================
     AUTH  (Login / Registrierung)
     ============================================================ */
  function renderAuth(view) {
    view.innerHTML = '<div class="page"><div class="container" style="max-width:520px">' +
      '<div class="breadcrumb"><a href="#/" data-link>Startseite</a> / Mein Konto</div>' +
      '<div class="card" id="auth-card"></div></div></div>';
    showLogin(qs("#auth-card", view));
  }

  function showLogin(card) {
    card.innerHTML =
      '<h1 style="font-size:22px;font-weight:800;margin-bottom:6px">Anmelden</h1>' +
      '<p class="muted mb16" style="font-size:14px">Melde dich mit deinem Konto an.</p>' +
      '<form id="login-form">' +
      '<div class="form-group"><label>E-Mail</label><input class="form-control" type="email" id="li-email" required></div>' +
      '<div class="form-group"><label>Passwort</label><input class="form-control" type="password" id="li-pass" required></div>' +
      '<div id="li-error" class="form-error"></div>' +
      '<button class="btn btn-blue btn-block" type="submit">Anmelden</button>' +
      "</form>" +
      '<div class="divider"></div>' +
      '<p style="text-align:center;font-size:14px">Noch kein Konto? <a href="#" id="to-register" style="color:var(--blue);font-weight:700">Jetzt registrieren</a></p>' +
      '<p class="muted mt16" style="font-size:12px;text-align:center">Demo-Admin: admin@textildruck-waren.de / admin123</p>' +
      '<p class="muted mt8" style="font-size:11px;text-align:center;line-height:1.5">⚠ Prototyp: Anmeldedaten werden unverschlüsselt im Browser gespeichert – nicht für den echten Betrieb geeignet.</p>';
    qs("#login-form", card).addEventListener("submit", function (e) {
      e.preventDefault();
      var r = Cart.login(qs("#li-email", card).value.trim(), qs("#li-pass", card).value);
      if (!r.ok) { qs("#li-error", card).textContent = r.error; return; }
      UI.toast("Willkommen zurück, " + r.user.name + "!", "success");
      location.hash = r.user.role === "admin" ? "#/admin" : "#/konto";
    });
    qs("#to-register", card).addEventListener("click", function (e) { e.preventDefault(); showRegister(card); });
  }

  function showRegister(card) {
    card.innerHTML =
      '<h1 style="font-size:22px;font-weight:800;margin-bottom:6px">Konto erstellen</h1>' +
      '<p class="muted mb16" style="font-size:14px">Wähle deinen Kundentyp und registriere dich.</p>' +
      '<form id="reg-form">' +
      '<div class="form-group"><label>Kundentyp</label><div class="radio-cards">' +
        '<label class="radio-card active" data-ctype="privat"><input type="radio" name="ctype" value="privat" checked hidden>' + icon("user") + "<b>Privat</b><span>Privatkunde</span></label>" +
        '<label class="radio-card" data-ctype="gewerbe"><input type="radio" name="ctype" value="gewerbe" hidden>' + icon("building") + "<b>Gewerbe</b><span>Firmenkunde</span></label>" +
      "</div></div>" +
      '<div class="form-group hidden" id="reg-company-wrap"><label>Firmenname</label><input class="form-control" id="reg-company"></div>' +
      '<div class="form-group"><label>Name</label><input class="form-control" id="reg-name" required></div>' +
      '<div class="form-group"><label>E-Mail</label><input class="form-control" type="email" id="reg-email" required></div>' +
      '<div class="form-row">' +
        '<div class="form-group"><label>Passwort</label><input class="form-control" type="password" id="reg-pass" required minlength="4"></div>' +
        '<div class="form-group"><label>Telefon</label><input class="form-control" id="reg-phone"></div>' +
      "</div>" +
      '<div class="checkbox-row mb16"><input type="checkbox" id="reg-agb" required><label for="reg-agb">Ich akzeptiere die AGB und Datenschutzbestimmungen.</label></div>' +
      '<div id="reg-error" class="form-error"></div>' +
      '<button class="btn btn-blue btn-block" type="submit">Registrieren</button>' +
      "</form>" +
      '<div class="divider"></div>' +
      '<p style="text-align:center;font-size:14px">Bereits registriert? <a href="#" id="to-login" style="color:var(--blue);font-weight:700">Zum Login</a></p>';

    var ctype = "privat";
    qsa(".radio-card", card).forEach(function (rc) {
      rc.addEventListener("click", function () {
        qsa(".radio-card", card).forEach(function (x) { x.classList.remove("active"); });
        rc.classList.add("active");
        rc.querySelector("input").checked = true;
        ctype = rc.getAttribute("data-ctype");
        qs("#reg-company-wrap", card).classList.toggle("hidden", ctype !== "gewerbe");
      });
    });
    qs("#reg-form", card).addEventListener("submit", function (e) {
      e.preventDefault();
      if (!qs("#reg-agb", card).checked) { qs("#reg-error", card).textContent = "Bitte akzeptiere die AGB."; return; }
      var r = Cart.register({
        name: qs("#reg-name", card).value.trim(),
        email: qs("#reg-email", card).value.trim(),
        password: qs("#reg-pass", card).value,
        phone: qs("#reg-phone", card).value.trim(),
        company: qs("#reg-company", card).value.trim(),
        customerType: ctype
      });
      if (!r.ok) { qs("#reg-error", card).textContent = r.error; return; }
      UI.toast("Konto erstellt. Willkommen!", "success");
      location.hash = "#/konto";
    });
    qs("#to-login", card).addEventListener("click", function (e) { e.preventDefault(); showLogin(card); });
  }

  /* ============================================================
     KONTO  (Dashboard + Bestellungen)
     ============================================================ */
  function renderAccount(view) {
    var user = Cart.currentUser();
    if (!user) { location.hash = "#/login"; return; }
    var orders = Cart.userOrders(user.id);

    view.innerHTML = '<div class="page"><div class="container">' +
      '<div class="page-head flex-between"><div><h1>Mein Konto</h1><p>Hallo ' + esc(user.name) + ' (' + esc(user.customerType === "gewerbe" ? "Gewerbe" : "Privat") + ")</p></div>" +
        '<button class="btn btn-ghost" id="logout-btn">' + icon("logout") + "Abmelden</button></div>" +
      (user.role === "admin" ? '<div class="card mb16" style="background:var(--blue-light);border-color:#cfe0fb"><div class="flex-between"><div><b>Administrator-Zugang</b><div class="muted" style="font-size:13px">Verwalte Inhalte, Produkte und Bestellungen.</div></div><a class="btn btn-blue" href="#/admin" data-link>Zum Admin-Panel</a></div></div>' : "") +
      '<div class="grid2" style="grid-template-columns:1fr 2fr">' +
        // Profil
        '<div class="card"><h3 style="font-weight:800;margin-bottom:14px">Profil & Adressen</h3>' +
          '<div id="profile-view"></div></div>' +
        // Bestellungen
        '<div class="card"><h3 style="font-weight:800;margin-bottom:14px">Bestellverlauf</h3>' +
          '<div id="orders-view"></div></div>' +
      "</div></div></div>";

    renderProfile(qs("#profile-view", view), user);
    renderOrders(qs("#orders-view", view), orders);
    qs("#logout-btn", view).addEventListener("click", function () {
      Cart.logout(); UI.toast("Abgemeldet.", "info"); location.hash = "#/";
    });
  }

  function addrText(a) {
    if (!a || !a.street) return '<span class="muted">Noch nicht hinterlegt</span>';
    return esc((a.name || "") + "<br>").replace("&lt;br&gt;", "<br>") +
      [a.company, a.street, (a.zip || "") + " " + (a.city || ""), a.country]
        .filter(Boolean).map(esc).join("<br>");
  }

  function renderProfile(box, user) {
    box.innerHTML =
      '<div style="font-size:14px;line-height:1.9"><b>' + esc(user.name) + "</b><br>" +
        (user.company ? esc(user.company) + "<br>" : "") + esc(user.email) +
        (user.phone ? "<br>" + esc(user.phone) : "") + "</div>" +
      '<div class="divider"></div>' +
      '<div style="font-size:13px"><b>Rechnungsadresse</b><div class="mt8">' + addrText(user.billing) + "</div></div>" +
      '<div class="divider"></div>' +
      '<div style="font-size:13px"><b>Lieferadresse</b><div class="mt8">' + addrText(user.shipping && user.shipping.street ? user.shipping : user.billing) + "</div></div>" +
      '<button class="btn btn-ghost btn-sm mt16" id="edit-profile">' + icon("edit") + "Adressen bearbeiten</button>";
    qs("#edit-profile", box).addEventListener("click", function () { editAddresses(user, box); });
  }

  function addrFields(prefix, a) {
    a = a || {};
    return '<div class="form-group"><label>Name / Ansprechpartner</label><input class="form-control" id="' + prefix + '-name" value="' + esc(a.name || "") + '"></div>' +
      '<div class="form-group"><label>Firma (optional)</label><input class="form-control" id="' + prefix + '-company" value="' + esc(a.company || "") + '"></div>' +
      '<div class="form-group"><label>Straße & Nr.</label><input class="form-control" id="' + prefix + '-street" value="' + esc(a.street || "") + '"></div>' +
      '<div class="form-row"><div class="form-group"><label>PLZ</label><input class="form-control" id="' + prefix + '-zip" value="' + esc(a.zip || "") + '"></div>' +
      '<div class="form-group"><label>Ort</label><input class="form-control" id="' + prefix + '-city" value="' + esc(a.city || "") + '"></div></div>' +
      '<div class="form-group"><label>Land</label><input class="form-control" id="' + prefix + '-country" value="' + esc(a.country || "Deutschland") + '"></div>';
  }
  function collectAddr(prefix, root) {
    return {
      name: qs("#" + prefix + "-name", root).value.trim(),
      company: qs("#" + prefix + "-company", root).value.trim(),
      street: qs("#" + prefix + "-street", root).value.trim(),
      zip: qs("#" + prefix + "-zip", root).value.trim(),
      city: qs("#" + prefix + "-city", root).value.trim(),
      country: qs("#" + prefix + "-country", root).value.trim()
    };
  }

  function editAddresses(user, box) {
    var m = UI.modal({
      title: "Adressen bearbeiten", wide: true,
      body: '<form id="addr-form"><div class="grid2">' +
        '<div><h4 style="font-weight:800;margin-bottom:12px">Rechnungsadresse</h4>' + addrFields("bill", user.billing) + "</div>" +
        '<div><h4 style="font-weight:800;margin-bottom:12px">Lieferadresse</h4>' +
          '<label class="checkbox-row mb16"><input type="checkbox" id="same-ship"' + ((!user.shipping || !user.shipping.street) ? " checked" : "") + '> Identisch mit Rechnungsadresse</label>' +
          '<div id="ship-fields">' + addrFields("ship", user.shipping) + "</div></div>" +
        "</div></form>",
      foot: '<button class="btn btn-ghost" data-close>Abbrechen</button><button class="btn btn-blue" id="save-addr">Speichern</button>'
    });
    function toggleShip() { qs("#ship-fields", m).style.display = qs("#same-ship", m).checked ? "none" : "block"; }
    qs("#same-ship", m).addEventListener("change", toggleShip); toggleShip();
    qs("#save-addr", m).addEventListener("click", function () {
      var bill = collectAddr("bill", m);
      var ship = qs("#same-ship", m).checked ? {} : collectAddr("ship", m);
      Cart.updateUser({ billing: bill, shipping: ship });
      UI.closeModal();
      renderProfile(box, Cart.currentUser());
      UI.toast("Adressen gespeichert.", "success");
    });
  }

  function renderOrders(box, orders) {
    if (!orders.length) {
      box.innerHTML = '<div class="empty-state">' + icon("box") + "<p>Noch keine Bestellungen vorhanden.</p>" +
        '<a class="btn btn-blue btn-sm mt16" href="#/angebote" data-link>Produkte entdecken</a></div>';
      return;
    }
    box.innerHTML = orders.map(function (o) {
      return '<div class="card" style="padding:16px;margin-bottom:12px;cursor:pointer" data-order="' + o.id + '">' +
        '<div class="flex-between"><div><b>' + esc(o.number) + "</b> " + statusBadge(o.status) +
          '<div class="muted" style="font-size:12.5px">' + fmtDate(o.createdAt) + " · " + o.items.length + " Artikel</div></div>" +
          '<div style="text-align:right"><div style="font-weight:800">' + euro(o.total) + "</div>" +
          '<span style="font-size:12px;color:var(--blue)">Details ' + "▾</span></div></div></div>";
    }).join("");
    qsa("[data-order]", box).forEach(function (c) {
      c.addEventListener("click", function () { showOrderDetail(c.getAttribute("data-order")); });
    });
  }

  function showOrderDetail(orderId) {
    var o = TWD.get().orders.filter(function (x) { return x.id === orderId; })[0];
    if (!o) return;
    UI.modal({
      title: "Bestellung " + o.number, wide: true,
      body:
        '<div class="flex-between mb16"><div>' + statusBadge(o.status) + '<div class="muted" style="font-size:13px;margin-top:4px">Bestellt am ' + fmtDate(o.createdAt) + "</div></div>" +
          '<div style="text-align:right"><div class="muted" style="font-size:12px">Gesamtbetrag</div><div style="font-size:20px;font-weight:800">' + euro(o.total) + "</div></div></div>" +
        "<b>Status-Verlauf</b>" + statusTrack(o.status) +
        '<div class="divider"></div><b>Artikel</b><div class="mt8">' +
          o.items.map(function (it) { return cartItemRow(it, true); }).join("") + "</div>" +
        '<div class="divider"></div>' +
        '<div class="grid2"><div><b>Rechnungsadresse</b><div class="mt8" style="font-size:13px;line-height:1.6">' + (o.billing ? formatAddr(o.billing) : "-") + "</div></div>" +
        '<div><b>Lieferadresse</b><div class="mt8" style="font-size:13px;line-height:1.6">' + (o.shipping ? formatAddr(o.shipping) : formatAddr(o.billing)) + "</div></div></div>",
      foot: '<button class="btn btn-blue" data-close>Schließen</button>'
    });
  }
  function formatAddr(a) {
    if (!a) return "-";
    return [a.name, a.company, a.street, (a.zip || "") + " " + (a.city || ""), a.country].filter(function (x) { return x && x.trim(); }).map(esc).join("<br>");
  }

  /* ============================================================
     WARENKORB
     ============================================================ */
  function cartItemRow(it, readonly) {
    var img = it.image || TWD.garmentSVG(it.garment, it.color, {});
    var onerr = it.image ? UI.imgFallbackAttr(it.garment, it.color) : "";
    var meta = [it.gender, "Größe " + it.size, it.printMethod].filter(Boolean).join(" · ");
    var pos = (it.positions || []).join(", ");
    return '<div class="cart-item" data-line="' + (it.lineId || "") + '">' +
      '<div class="ci-img"><img src="' + esc(img) + '" alt=""' + onerr + "></div>" +
      '<div class="ci-info"><b>' + esc(it.name) + "</b>" +
        '<div class="ci-meta">' + esc(meta) + (pos ? "<br>Position: " + esc(pos) : "") +
        (it.logoName ? "<br>Logo: " + esc(it.logoName) : "") + "</div>" +
        (readonly ? '<div class="ci-meta">Menge: ' + it.qty + " × " + euro(it.unitPrice) + "</div>" : "") + "</div>" +
      (readonly ? '<div class="ci-price">' + euro(it.unitPrice * it.qty) + "</div>"
        : '<div style="text-align:right">' +
            '<div class="qty-ctrl" style="margin-bottom:6px"><button type="button" data-qminus>' + icon("minus") + '</button><input type="number" value="' + it.qty + '" min="1" data-qinput style="width:44px"><button type="button" data-qplus>' + icon("plus") + "</button></div>" +
            '<div class="ci-price">' + euro(it.unitPrice * it.qty) + "</div>" +
            '<button class="btn btn-ghost btn-sm mt8" data-remove>' + icon("trash") + "</button></div>") +
      "</div>";
  }

  function renderCart(view) {
    var items = Cart.loadCart();
    if (!items.length) {
      view.innerHTML = '<div class="page"><div class="container">' +
        '<div class="page-head"><h1>Warenkorb</h1></div>' +
        '<div class="card"><div class="empty-state">' + icon("cart") +
          "<p>Dein Warenkorb ist leer.</p>" +
          '<a class="btn btn-blue mt16" href="#/angebote" data-link>Produkte entdecken</a></div></div></div></div>';
      return;
    }
    var subtotal = Cart.cartTotal();
    var shipping = subtotal >= 50 ? 0 : 4.95;
    var total = subtotal + shipping;
    view.innerHTML = '<div class="page"><div class="container">' +
      '<div class="page-head"><h1>Warenkorb</h1><p>' + Cart.cartCount() + " Artikel</p></div>" +
      '<div class="cart-layout"><div class="card" id="cart-items">' + items.map(function (it) { return cartItemRow(it, false); }).join("") + "</div>" +
      '<div class="card"><h3 style="font-weight:800;margin-bottom:14px">Zusammenfassung</h3>' +
        '<div class="summary-row"><span>Zwischensumme</span><span>' + euro(subtotal) + "</span></div>" +
        '<div class="summary-row"><span>Versand</span><span>' + (shipping === 0 ? "Kostenlos" : euro(shipping)) + "</span></div>" +
        (shipping > 0 ? '<div class="muted" style="font-size:12px">Kostenloser Versand ab 50,00 €</div>' : "") +
        '<div class="summary-total"><span>Gesamt</span><span>' + euro(total) + "</span></div>" +
        '<button class="btn btn-blue btn-block mt16" id="to-checkout">Zur Kasse</button>' +
        '<a class="btn btn-ghost btn-block mt8" href="#/angebote" data-link>Weiter einkaufen</a>' +
      "</div></div></div></div>";

    bindCartRows(view);
    qs("#to-checkout", view).addEventListener("click", function () { location.hash = "#/checkout"; });
  }

  function bindCartRows(view) {
    qsa(".cart-item", view).forEach(function (row) {
      var lineId = row.getAttribute("data-line");
      var qInput = qs("[data-qinput]", row);
      var minus = qs("[data-qminus]", row), plus = qs("[data-qplus]", row), rem = qs("[data-remove]", row);
      if (minus) minus.addEventListener("click", function () { Cart.updateQty(lineId, parseInt(qInput.value, 10) - 1); renderCart(view); });
      if (plus) plus.addEventListener("click", function () { Cart.updateQty(lineId, parseInt(qInput.value, 10) + 1); renderCart(view); });
      if (qInput) qInput.addEventListener("change", function () { Cart.updateQty(lineId, parseInt(qInput.value, 10) || 1); renderCart(view); });
      if (rem) rem.addEventListener("click", function () { Cart.removeFromCart(lineId); renderCart(view); UI.toast("Artikel entfernt.", "info"); });
    });
  }

  /* ============================================================
     CHECKOUT
     ============================================================ */
  var checkoutState = { step: 1, billing: {}, shipping: {}, sameShip: true, payment: "vorkasse" };

  function renderCheckout(view) {
    var items = Cart.loadCart();
    if (!items.length) { location.hash = "#/warenkorb"; return; }
    var user = Cart.currentUser();
    if (user) {
      checkoutState.billing = Object.assign({ name: user.name, company: user.company }, user.billing);
      if (user.shipping && user.shipping.street) { checkoutState.shipping = user.shipping; checkoutState.sameShip = false; }
    }
    checkoutState.step = 1;
    drawCheckout(view);
  }

  function drawCheckout(view) {
    var step = checkoutState.step;
    var steps = ["Adresse", "Zahlung", "Übersicht", "Bestätigung"];
    var stepper = '<div class="stepper">' + steps.map(function (t, i) {
      var n = i + 1;
      var cls = n === step ? "active" : n < step ? "done" : "";
      return '<div class="st ' + cls + '"><div class="stnum">' + (n < step ? "✓" : n) + '</div><span class="stlabel">' + esc(t) + "</span></div>" +
        (i < steps.length - 1 ? '<div class="stline"></div>' : "");
    }).join("") + "</div>";

    var body = "";
    if (step === 1) body = checkoutAddress();
    else if (step === 2) body = checkoutPayment();
    else if (step === 3) body = checkoutReview();
    else body = "";

    view.innerHTML = '<div class="page"><div class="container" style="max-width:820px">' +
      '<div class="page-head"><h1>Kasse</h1></div>' + stepper +
      '<div id="checkout-body">' + body + "</div></div></div>";

    if (step === 1) bindCheckoutAddress(view);
    else if (step === 2) bindCheckoutPayment(view);
    else if (step === 3) bindCheckoutReview(view);
    else if (step === 4) bindConfirmation(view);
  }

  function checkoutAddress() {
    var b = checkoutState.billing, s = checkoutState.shipping;
    return '<div class="card"><h3 style="font-weight:800;margin-bottom:14px">Rechnungsadresse</h3>' +
      addrFields("co-bill", b) +
      '<div class="divider"></div>' +
      '<label class="checkbox-row mb16"><input type="checkbox" id="co-same"' + (checkoutState.sameShip ? " checked" : "") + '> Lieferadresse ist identisch mit Rechnungsadresse</label>' +
      '<div id="co-ship-wrap"><h3 style="font-weight:800;margin-bottom:14px">Lieferadresse</h3>' + addrFields("co-ship", s) + "</div>" +
      '<button class="btn btn-blue btn-block mt16" id="co-next-1">Weiter zur Zahlung</button></div>';
  }
  function bindCheckoutAddress(view) {
    function toggle() { qs("#co-ship-wrap", view).style.display = qs("#co-same", view).checked ? "none" : "block"; }
    qs("#co-same", view).addEventListener("change", toggle); toggle();
    qs("#co-next-1", view).addEventListener("click", function () {
      var bill = collectAddr("co-bill", view);
      if (!bill.name || !bill.street || !bill.zip || !bill.city) { UI.toast("Bitte fülle die Pflichtfelder der Rechnungsadresse aus.", "error"); return; }
      var sameShip = qs("#co-same", view).checked;
      var ship = sameShip ? bill : collectAddr("co-ship", view);
      if (!sameShip && (!ship.name || !ship.street || !ship.zip || !ship.city)) {
        UI.toast("Bitte fülle die Pflichtfelder der Lieferadresse aus.", "error"); return;
      }
      checkoutState.billing = bill;
      checkoutState.sameShip = sameShip;
      checkoutState.shipping = ship;
      checkoutState.step = 2; drawCheckout(view);
    });
  }

  function checkoutPayment() {
    var methods = [
      { id: "vorkasse", label: "Vorkasse / Überweisung", desc: "Zahlung per Banküberweisung im Voraus." },
      { id: "paypal", label: "PayPal", desc: "Sicher bezahlen mit PayPal." },
      { id: "kreditkarte", label: "Kreditkarte", desc: "Visa, Mastercard." },
      { id: "klarna", label: "Klarna Rechnung", desc: "Kauf auf Rechnung." }
    ];
    return '<div class="card"><h3 style="font-weight:800;margin-bottom:14px">Zahlungsart wählen</h3>' +
      methods.map(function (m) {
        return '<label class="radio-card" data-pay="' + m.id + '" style="display:flex;text-align:left;gap:12px;align-items:center;margin-bottom:10px' + (m.id === checkoutState.payment ? "" : "") + '">' +
          '<input type="radio" name="pay" value="' + m.id + '"' + (m.id === checkoutState.payment ? " checked" : "") + ' style="margin:0">' +
          '<div><b>' + esc(m.label) + "</b><span>" + esc(m.desc) + "</span></div></label>";
      }).join("") +
      '<div class="flex-between mt16"><button class="btn btn-ghost" id="co-back-2">Zurück</button><button class="btn btn-blue" id="co-next-2">Weiter zur Übersicht</button></div></div>';
  }
  function bindCheckoutPayment(view) {
    qsa("[data-pay]", view).forEach(function (rc) {
      rc.classList.toggle("active", rc.getAttribute("data-pay") === checkoutState.payment);
      rc.addEventListener("click", function () {
        checkoutState.payment = rc.getAttribute("data-pay");
        qsa("[data-pay]", view).forEach(function (x) { x.classList.remove("active"); });
        rc.classList.add("active");
        rc.querySelector("input").checked = true;
      });
    });
    qs("#co-back-2", view).addEventListener("click", function () { checkoutState.step = 1; drawCheckout(view); });
    qs("#co-next-2", view).addEventListener("click", function () { checkoutState.step = 3; drawCheckout(view); });
  }

  function checkoutReview() {
    var items = Cart.loadCart();
    var subtotal = Cart.cartTotal();
    var shipping = subtotal >= 50 ? 0 : 4.95;
    var total = subtotal + shipping;
    var payLabels = { vorkasse: "Vorkasse / Überweisung", paypal: "PayPal", kreditkarte: "Kreditkarte", klarna: "Klarna Rechnung" };
    return '<div class="card"><h3 style="font-weight:800;margin-bottom:14px">Bestellübersicht</h3>' +
      items.map(function (it) { return cartItemRow(it, true); }).join("") +
      '<div class="divider"></div>' +
      '<div class="summary-row"><span>Zwischensumme</span><span>' + euro(subtotal) + "</span></div>" +
      '<div class="summary-row"><span>Versand</span><span>' + (shipping === 0 ? "Kostenlos" : euro(shipping)) + "</span></div>" +
      '<div class="summary-total"><span>Gesamt</span><span>' + euro(total) + "</span></div>" +
      '<div class="divider"></div>' +
      '<div class="grid2"><div><b>Rechnungsadresse</b><div class="mt8" style="font-size:13px;line-height:1.6">' + formatAddr(checkoutState.billing) + "</div></div>" +
      '<div><b>Lieferadresse</b><div class="mt8" style="font-size:13px;line-height:1.6">' + formatAddr(checkoutState.sameShip ? checkoutState.billing : checkoutState.shipping) + "</div></div></div>" +
      '<div class="mt16"><b>Zahlungsart:</b> ' + esc(payLabels[checkoutState.payment]) + "</div>" +
      '<label class="checkbox-row mt16"><input type="checkbox" id="co-agb"> Ich akzeptiere die AGB und Widerrufsbelehrung.</label>' +
      '<div class="flex-between mt16"><button class="btn btn-ghost" id="co-back-3">Zurück</button><button class="btn btn-orange" id="co-place">Zahlungspflichtig bestellen</button></div></div>';
  }
  function bindCheckoutReview(view) {
    qs("#co-back-3", view).addEventListener("click", function () { checkoutState.step = 2; drawCheckout(view); });
    qs("#co-place", view).addEventListener("click", function () {
      if (!qs("#co-agb", view).checked) { UI.toast("Bitte akzeptiere die AGB.", "error"); return; }
      placeOrder(view);
    });
  }

  function placeOrder(view) {
    var user = Cart.currentUser();
    var items = Cart.loadCart();
    var subtotal = Cart.cartTotal();
    var shipping = subtotal >= 50 ? 0 : 4.95;
    var order = Cart.createOrder({
      userId: user ? user.id : "guest",
      customerName: checkoutState.billing.name || (user ? user.name : "Gast"),
      customerEmail: user ? user.email : "",
      items: items.map(function (it) { return Object.assign({}, it); }),
      subtotal: subtotal, shippingCost: shipping, total: subtotal + shipping,
      payment: checkoutState.payment,
      billing: checkoutState.billing,
      shipping: checkoutState.sameShip ? checkoutState.billing : checkoutState.shipping
    });
    Cart.clearCart();
    checkoutState.step = 4;
    view.innerHTML = '<div class="page"><div class="container" style="max-width:640px">' +
      '<div class="card" style="text-align:center;padding:44px 28px">' +
        '<div style="width:74px;height:74px;border-radius:50%;background:#16a34a;color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 20px">' + icon("check") + "</div>" +
        '<h1 style="font-size:26px;font-weight:800">Vielen Dank für deine Bestellung!</h1>' +
        '<p class="muted mt8">Deine Bestellnummer lautet <b style="color:var(--dark)">' + esc(order.number) + "</b>.</p>" +
        '<p class="muted mt8">Status: ' + statusBadge(order.status) + "</p>" +
        (checkoutState.payment === "vorkasse" ? '<div class="card mt16" style="background:var(--gray-50);text-align:left"><b>Zahlungshinweis (Vorkasse)</b><div class="muted mt8" style="font-size:13px">Bitte überweise <b>' + euro(order.total) + '</b> auf:<br>Textildruck-Waren.de<br>IBAN: DE00 0000 0000 0000 0000 00<br>Verwendungszweck: ' + esc(order.number) + '<br><span style="font-size:11px;color:var(--gray-400)">(Demo-Bankverbindung – vor Livegang durch echte IBAN ersetzen)</span></div></div>' : "") +
        '<div class="mt16">' + statusTrack(order.status) + "</div>" +
        '<div class="flex-between mt16" style="justify-content:center;gap:12px">' +
          '<a class="btn btn-blue" href="#/konto" data-link>Zu meinen Bestellungen</a>' +
          '<a class="btn btn-ghost" href="#/" data-link>Zur Startseite</a></div>' +
      "</div></div></div>";
    UI.toast("Bestellung erfolgreich aufgegeben!", "success");
  }
  function bindConfirmation() {}

  /* ============================================================
     PRODUKTLISTEN / KATEGORIE / SUCHE
     ============================================================ */
  function renderList(view, opts) {
    var store = TWD.get();
    var products = store.products.slice();
    var title = opts.title, sub = opts.sub || "";
    if (opts.section) products = products.filter(function (p) { return p.section === opts.section; });
    if (opts.category) products = products.filter(function (p) { return p.category === opts.category; });
    if (opts.query) {
      var q = opts.query.toLowerCase();
      products = store.products.filter(function (p) {
        var cat = store.categories.filter(function (c) { return c.id === p.category; })[0];
        return p.name.toLowerCase().indexOf(q) > -1 || (cat && cat.name.toLowerCase().indexOf(q) > -1);
      });
    }

    var body = products.length
      ? '<div class="plist">' + products.map(Home.productCard).join("") + "</div>"
      : '<div class="card"><div class="empty-state">' + icon("search") + "<p>Keine Produkte gefunden.</p>" +
        '<a class="btn btn-blue mt16" href="#/angebote" data-link>Eigenes Produkte entdecken</a></div></div>';

    view.innerHTML = '<div class="page"><div class="container">' +
      '<div class="breadcrumb"><a href="#/" data-link>Startseite</a> / ' + esc(title) + "</div>" +
      '<div class="page-head"><h1>' + esc(title) + "</h1>" + (sub ? "<p>" + esc(sub) + "</p>" : "") + "</div>" +
      body + "</div></div>";
    qsa(".pcard", view).forEach(function (c) {
      c.addEventListener("click", function () { location.hash = "#/produkt/" + c.getAttribute("data-product"); });
    });
  }

  /* ============================================================
     PRODUKT-DETAIL
     ============================================================ */
  function renderProduct(view, id) {
    var store = TWD.get();
    var p = store.products.filter(function (x) { return x.id === id; })[0];
    if (!p) { renderList(view, { title: "Produkt nicht gefunden" }); return; }
    var cat = store.categories.filter(function (c) { return c.id === p.category; })[0];
    var img = p.image || TWD.garmentSVG(p.garment, p.color, {});
    var onerr = p.image ? UI.imgFallbackAttr(p.garment, p.color) : "";
    var sizes = store.customizer.sizes;
    view.innerHTML = '<div class="page"><div class="container">' +
      '<div class="breadcrumb"><a href="#/" data-link>Startseite</a> / ' + (cat ? '<a href="#/kategorie/' + cat.id + '" data-link>' + esc(cat.name) + "</a> / " : "") + esc(p.name) + "</div>" +
      '<div class="card product-detail-card"><div class="grid2 product-detail-grid">' +
        '<div class="product-detail-image"><img src="' + esc(img) + '" alt="' + esc(p.name) + '"' + onerr + "></div>" +
        '<div><h1 style="font-size:26px;font-weight:800">' + esc(p.name) + "</h1>" +
          (cat ? '<div class="muted mt8">' + esc(cat.name) + "</div>" : "") +
          '<div style="margin:16px 0"><span style="font-size:28px;font-weight:800;color:' + (p.section === "angebote" ? "var(--orange)" : "var(--dark)") + '">ab ' + euro(p.price) + "</span>" +
            (p.oldPrice ? ' <span class="old" style="text-decoration:line-through;color:var(--gray-400);font-size:18px">' + euro(p.oldPrice) + "</span>" : "") + "</div>" +
          '<p class="muted mb16">Hochwertiger DTF Druck möglich. Wähle Größe und gestalte dein individuelles Design.</p>' +
          '<div class="cust-label">Größe</div><div class="size-row mb16" id="pd-sizes">' +
            sizes.map(function (sz, i) { return '<button class="size-btn' + (i === 1 ? " active" : "") + '" data-size="' + sz + '">' + sz + "</button>"; }).join("") + "</div>" +
          '<button class="btn btn-orange btn-block" id="pd-add">' + icon("cart") + "In den Warenkorb</button>" +
        "</div>" +
      "</div></div></div></div>";

    var selSize = sizes[1];
    qsa("#pd-sizes .size-btn", view).forEach(function (b) {
      b.addEventListener("click", function () {
        qsa("#pd-sizes .size-btn", view).forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active"); selSize = b.getAttribute("data-size");
      });
    });
    qs("#pd-add", view).addEventListener("click", function () {
      Cart.addToCart({
        type: "product", productId: p.id, name: p.name, garment: p.garment, color: p.color, image: p.image,
        gender: "Unisex", size: selSize, positions: [], printMethod: "", unitPrice: p.price, qty: 1
      });
      UI.toast(p.name + " zum Warenkorb hinzugefügt!", "success");
    });
  }

  /* ============================================================
     WUNSCHLISTE
     ============================================================ */
  function renderWishlist(view) {
    view.innerHTML = '<div class="page"><div class="container">' +
      '<div class="page-head"><h1>Wunschliste</h1></div>' +
      '<div class="card"><div class="empty-state">' + icon("heart") +
        "<p>Deine Wunschliste ist leer.</p>" +
        '<a class="btn btn-blue mt16" href="#/" data-link>Produkte entdecken</a></div></div></div></div>';
  }

  /* ============================================================
     STATISCHE SEITEN
     ============================================================ */
  function renderStaticPage(view, slug) {
    var store = TWD.get();
    var s = store.settings;
    var c = store.settings.contact;
    var pages = {
      "kontakt": {
        title: "Kontakt",
        html: '<div class="grid2 contact-layout"><div class="contact-info"><p class="mb16">Du hast Fragen zu Produkten, Druck oder deiner Bestellung? Wir sind für dich da!</p>' +
          '<div style="line-height:2;font-size:15px"><b>' + esc(c.company) + "</b><br>" + esc(c.street) + "<br>" + esc(c.city) + "<br>" + esc(c.country) +
          '<div class="contact-row mt16">' + icon("phone") + '<span>' + esc(c.phone) + "</span></div>" +
          '<div class="contact-row">' + icon("chat") + '<span>' + esc(c.email) + "</span></div></div></div>" +
          '<form id="contact-form"><div class="form-group"><label>Name</label><input class="form-control" required></div>' +
          '<div class="form-group"><label>E-Mail</label><input class="form-control" type="email" required></div>' +
          '<div class="form-group"><label>Nachricht</label><textarea class="form-control" rows="4" required></textarea></div>' +
          '<button class="btn btn-blue" type="submit">Nachricht senden</button></form></div>'
      },
      "ueber-uns": {
        title: "Über uns",
        html: '<p class="mb16">Textildruck-Waren.de ist dein Partner für hochwertigen Textildruck in Deutschland. Wir bedrucken T-Shirts, Hoodies, Arbeitskleidung und Werbetextilien für Privat- und Firmenkunden – schnell, zuverlässig und in Top-Qualität.</p>' +
          '<p class="mb16">Mit modernem DTF-Druck setzen wir deine Designs brillant, langlebig und waschfest um. Über 3.000 zufriedene Kunden vertrauen bereits auf uns.</p>' +
          '<div class="grid2 mt16"><div class="card" style="background:var(--gray-50)"><b>Unsere Stärken</b><ul style="margin-top:10px;padding-left:18px;line-height:1.9"><li>Schnelle Produktion</li><li>Deutschlandweiter Versand</li><li>Persönliche Beratung</li><li>Faire Preise für Gewerbe</li></ul></div>' +
          '<div class="card" style="background:var(--gray-50)"><b>Nachhaltigkeit</b><p class="mt8 muted" style="font-size:14px">Wir setzen auf ressourcenschonende Verfahren und bieten nachhaltige Textilien aus Bio-Baumwolle an.</p></div></div>'
      }
    };
    var legal = {
      "impressum": "Impressum",
      "datenschutz": "Datenschutzerklärung",
      "agb": "Allgemeine Geschäftsbedingungen",
      "widerrufsbelehrung": "Widerrufsbelehrung",
      "versand-zahlung": "Versand & Zahlung",
      "haeufige-fragen": "Häufige Fragen (FAQ)",
      "so-funktioniert-s": "So funktioniert's",
      "retouren-umtausch": "Retouren & Umtausch",
      "bestellverfolgung": "Bestellverfolgung"
    };
    var legalKeyMap = {
      "impressum": "impressum", "datenschutz": "datenschutz",
      "agb": "agb", "widerrufsbelehrung": "widerrufsbelehrung"
    };

    var page = pages[slug];
    if (!page && legal[slug]) {
      if (slug === "bestellverfolgung") { renderTracking(view); return; }
      if (slug === "mein-konto") { location.hash = "#/konto"; return; }
      if (legalKeyMap[slug] && s.legalPages && s.legalPages[legalKeyMap[slug]]) {
        page = { title: legal[slug], html: legalDemoNotice() + TWD.renderLegalHtml(s.legalPages[legalKeyMap[slug]]) };
      } else if (slug === "versand-zahlung") {
        page = { title: legal[slug], html:
          '<p class="mb16">Wir versenden deutschlandweit per Paketdienst. Die Produktionszeit für individuell bedruckte Artikel beträgt in der Regel 2–5 Werktage, zzgl. 1–2 Werktagen Versandlaufzeit.</p>' +
          '<p class="mb16">Versandkosten: 4,95 € pauschal, ab einem Bestellwert von 50,00 € versandkostenfrei innerhalb Deutschlands.</p>' +
          '<p>Zahlung ist möglich per Vorkasse/Überweisung, PayPal, Kreditkarte oder Klarna Rechnung.</p>' };
      } else if (slug === "haeufige-fragen") {
        page = { title: legal[slug], html:
          '<p class="mb16"><b>Wie lange dauert die Produktion?</b><br>In der Regel 2–5 Werktage, abhängig von Druckverfahren und Menge.</p>' +
          '<p class="mb16"><b>Welche Dateiformate kann ich hochladen?</b><br>PNG, JPG, PDF und SVG (max. 20 MB).</p>' +
          '<p class="mb16"><b>Kann ich meine Bestellung stornieren?</b><br>Solange sich die Bestellung im Status "Zahlung ausstehend" oder "Zahlung erhalten" befindet, kontaktiere bitte unseren Kundenservice.</p>' +
          '<p><b>Bietet ihr Mengenrabatte für Firmenkunden an?</b><br>Ja, registriere dich als Gewerbekunde und kontaktiere uns für ein individuelles Angebot.</p>' };
      } else if (slug === "so-funktioniert-s") {
        page = { title: legal[slug], html: s.steps.map(function (st, i) {
          return '<p class="mb16"><b>' + (i + 1) + ". " + esc(st.title) + "</b><br>" + esc(st.text) + "</p>";
        }).join("") };
      } else if (slug === "retouren-umtausch") {
        page = { title: legal[slug], html:
          '<p class="mb16">Da unsere Produkte individuell mit deinem Logo oder Design bedruckt werden, handelt es sich um Sonderanfertigungen. Ein Umtausch ist bei diesen Artikeln ausgeschlossen, es sei denn, es liegt ein Druck- oder Materialfehler unsererseits vor.</p>' +
          '<p>Bei Reklamationen wende dich bitte mit deiner Bestellnummer an info@textildruck-waren.de – wir finden eine Lösung.</p>' };
      } else {
        page = { title: legal[slug], html: '<p class="muted">Inhalt folgt in Kürze.</p>' };
      }
    }
    if (slug === "mein-konto") { location.hash = "#/konto"; return; }
    if (!page) page = { title: "Seite", html: '<p class="muted">Inhalt folgt.</p>' };

    view.innerHTML = '<div class="page"><div class="container" style="max-width:860px">' +
      '<div class="breadcrumb"><a href="#/" data-link>Startseite</a> / ' + esc(page.title) + "</div>" +
      '<div class="page-head"><h1>' + esc(page.title) + "</h1></div>" +
      '<div class="card">' + page.html + "</div></div></div>";
    var cf = qs("#contact-form", view);
    if (cf) cf.addEventListener("submit", function (e) { e.preventDefault(); UI.toast("Nachricht gesendet. Wir melden uns!", "success"); cf.reset(); });
  }

  function legalDemoNotice() {
    return '<div class="legal-demo-notice">' + icon("chat") +
      '<div><b>Hinweis: Demo-Inhalt</b><br>Dieser Text ist ein editierbarer Platzhaltertext für Testzwecke und ersetzt keine Rechtsberatung. ' +
      'Bitte vor Veröffentlichung im Admin-Panel unter „Inhalte &amp; Texte" → „Rechtliche Seiten" durch die echten Unternehmensangaben ersetzen.</div></div>';
  }

  function renderTracking(view) {
    view.innerHTML = '<div class="page"><div class="container" style="max-width:640px">' +
      '<div class="page-head"><h1>Bestellverfolgung</h1><p>Gib deine Bestellnummer ein, um den Status zu sehen.</p></div>' +
      '<div class="card"><form id="track-form"><div class="form-group"><label>Bestellnummer</label>' +
        '<input class="form-control" id="track-num" placeholder="z.B. TW-10001" required></div>' +
        '<button class="btn btn-blue" type="submit">Status anzeigen</button></form><div id="track-result" class="mt16"></div></div></div></div>';
    qs("#track-form", view).addEventListener("submit", function (e) {
      e.preventDefault();
      var num = qs("#track-num", view).value.trim();
      var o = TWD.get().orders.filter(function (x) { return x.number.toLowerCase() === num.toLowerCase(); })[0];
      var res = qs("#track-result", view);
      if (!o) { res.innerHTML = '<div class="form-error">Keine Bestellung mit dieser Nummer gefunden.</div>'; return; }
      res.innerHTML = '<div class="divider"></div><b>' + esc(o.number) + "</b> " + statusBadge(o.status) + statusTrack(o.status);
    });
  }

  global.Shop = {
    renderAuth: renderAuth, renderAccount: renderAccount, renderCart: renderCart,
    renderCheckout: renderCheckout, renderList: renderList, renderProduct: renderProduct,
    renderWishlist: renderWishlist, renderStaticPage: renderStaticPage,
    renderTracking: renderTracking, statusBadge: statusBadge, statusTrack: statusTrack, fmtDate: fmtDate
  };
})(window);
