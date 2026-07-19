/* ============================================================
   Textildruck-Waren.de  –  Produkt-Konfigurator (Live-Vorschau)
   ============================================================ */
(function (global) {
  "use strict";
  var icon = UI.icon, esc = UI.esc, euro = UI.euro, qs = UI.qs, qsa = UI.qsa;

  function defaultState(cfg, presetProductId) {
    var prod = cfg.products.filter(function (p) { return p.id === presetProductId; })[0] || cfg.products[0];
    return {
      productId: prod.id,
      gender: cfg.genders[cfg.genders.indexOf("Unisex") > -1 ? cfg.genders.indexOf("Unisex") : 0],
      color: cfg.colors[0].value,
      size: cfg.sizes[1] || cfg.sizes[0],
      positions: ["brust-links"],
      printMethod: cfg.printMethods[0].id,
      qty: 1,
      logoDataUrl: null,
      logoName: null,
      logoPos: { x: 32, y: 34, w: 36, h: 22 }
    };
  }

  function render(container, opts) {
    opts = opts || {};
    var cfg = TWD.get().customizer;
    var s = TWD.get().settings;
    var state = defaultState(cfg, opts.presetProductId);

    var prodOptions = cfg.products.map(function (p) {
      return '<option value="' + p.id + '"' + (p.id === state.productId ? " selected" : "") + ">" + esc(p.name) + "</option>";
    }).join("");
    var methodOptions = cfg.printMethods.map(function (m) {
      return '<option value="' + m.id + '">' + esc(m.name) + (m.price ? " (+" + euro(m.price) + ")" : "") + "</option>";
    }).join("");
    var colorSwatches = cfg.colors.map(function (c, i) {
      return '<button type="button" class="color-sw' + (i === 0 ? " active" : "") + '" data-color="' + c.value +
        '" title="' + esc(c.name) + '" style="background:' + c.value + (c.value.toLowerCase() === "#ffffff" ? ";border-color:#d1d5db" : "") + '"></button>';
    }).join("");
    var genderBtns = cfg.genders.map(function (g, i) {
      return '<button type="button" class="gender-btn' + (g === state.gender ? " active" : "") + '" data-gender="' + esc(g) + '">' + esc(g) + "</button>";
    }).join("");
    var sizeBtns = cfg.sizes.map(function (sz) {
      return '<button type="button" class="size-btn' + (sz === state.size ? " active" : "") + '" data-size="' + esc(sz) + '">' + esc(sz) + "</button>";
    }).join("");
    var posBtns = cfg.positions.map(function (p) {
      return '<button type="button" class="pos-btn' + (state.positions.indexOf(p.id) > -1 ? " active" : "") + '" data-pos="' + p.id + '">' +
        icon(p.icon) + "<span>" + esc(p.label) + "</span></button>";
    }).join("");

    container.innerHTML =
      '<div class="customizer">' +
      '<h3>' + esc(s.customizerTitle) + "</h3>" +
      '<p class="cust-sub">' + esc(s.customizerSubtitle) + "</p>" +
      '<div class="cust-grid">' +

        // Spalte 1: Optionen
        '<div class="cust-col-left">' +
          '<div class="cust-field"><div class="cust-label">Produkt</div>' +
            '<select id="c-product">' + prodOptions + "</select></div>" +
          '<div class="cust-field"><div class="cust-label">Geschlecht</div>' +
            '<div class="gender-row">' + genderBtns + "</div></div>" +
          '<div class="cust-field"><div class="cust-label">Farbe</div>' +
            '<div class="color-row">' + colorSwatches + "</div></div>" +
          '<div class="cust-field"><div class="cust-label">Größe</div>' +
            '<div class="size-row">' + sizeBtns + "</div></div>" +
          '<div class="cust-field"><div class="cust-label">Druck Position</div>' +
            '<div class="pos-grid">' + posBtns + "</div></div>" +
        "</div>" +

        // Spalte 2: Vorschau
        '<div class="cust-preview">' +
          '<div class="preview-stage" id="c-stage">' +
            '<div class="preview-garment" id="c-garment"></div>' +
            '<div class="preview-toolbar hidden" id="c-toolbar">' +
              '<button type="button" id="c-center" title="Zentrieren">' + icon("grid") + "</button>" +
              '<button type="button" id="c-remove-logo" title="Logo entfernen">' + icon("trash") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="preview-hint">Logo hochladen, dann ziehen &amp; skalieren</div>' +
        "</div>" +

        // Spalte 3: Druck / Upload / Preis
        '<div class="cust-col-right">' +
          '<div class="cust-field"><div class="cust-label">Druckverfahren</div>' +
            '<select id="c-method">' + methodOptions + "</select></div>" +
          '<div class="cust-field"><div class="cust-label">Datei hochladen</div>' +
            '<div class="upload-box" id="c-upload">' + icon("upload") +
              '<div class="up-main">Datei hier hochladen<br>oder klicken</div>' +
              '<div class="up-formats">' + esc(cfg.uploadFormats) + "</div>" +
              '<div class="upload-file hidden" id="c-filename"></div>' +
            "</div>" +
            '<input type="file" id="c-file" accept="' + cfg.acceptedUpload.join(",") + '" style="display:none">' +
          "</div>" +
          '<div class="cust-field"><div class="cust-label">Menge</div>' +
            '<div class="qty-ctrl"><button type="button" id="c-minus">' + icon("minus") + "</button>" +
            '<input type="number" id="c-qty" value="1" min="1"><button type="button" id="c-plus">' + icon("plus") + "</button></div></div>" +
          '<div class="price-box" id="c-pricebox"></div>' +
          '<button class="btn btn-blue btn-block" id="c-add">' + icon("cart") + "In den Warenkorb</button>" +
          '<button class="btn btn-ghost btn-block" id="c-save" style="margin-top:8px">Vorschau speichern</button>' +
        "</div>" +
      "</div></div>";

    bind(container, cfg, state);
    updateGarment(container, cfg, state);
    updatePrice(container, cfg, state);
  }

  function getProduct(cfg, id) {
    return cfg.products.filter(function (p) { return p.id === id; })[0] || cfg.products[0];
  }

  function updateGarment(container, cfg, state) {
    var prod = getProduct(cfg, state.productId);
    var g = qs("#c-garment", container);
    var isBlack = String(state.color).toLowerCase() === "#111827";
    var image = isBlack && prod.previewImage ? prod.previewImage : TWD.garmentSVG(prod.garment, state.color, {});
    g.innerHTML = '<img src="' + esc(image) + '" alt="' + esc(prod.name) + '">';
    if (state.logoDataUrl) addLogoOverlay(container, state);
  }

  function addLogoOverlay(container, state) {
    var g = qs("#c-garment", container);
    var existing = qs(".logo-overlay", g);
    if (existing) existing.remove();
    var ov = UI.el("div", { class: "logo-overlay" });
    ov.style.left = state.logoPos.x + "%";
    ov.style.top = state.logoPos.y + "%";
    ov.style.width = state.logoPos.w + "%";
    ov.style.height = state.logoPos.h + "%";
    ov.innerHTML = '<img src="' + state.logoDataUrl + '" alt="Logo"><div class="resize-handle"></div>';
    g.appendChild(ov);
    qs("#c-toolbar", container).classList.remove("hidden");
    makeDraggable(ov, qs("#c-stage", container), state);
  }

  function makeDraggable(ov, stage, state) {
    var handle = ov.querySelector(".resize-handle");
    var dragging = false, resizing = false, sx, sy, orig;

    function pt(e) {
      var t = e.touches ? e.touches[0] : e;
      return { x: t.clientX, y: t.clientY };
    }
    function startDrag(e) {
      if (e.target === handle) return;
      e.preventDefault();
      dragging = true;
      var p = pt(e); sx = p.x; sy = p.y;
      orig = { x: state.logoPos.x, y: state.logoPos.y };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", end);
      document.addEventListener("touchmove", move, { passive: false });
      document.addEventListener("touchend", end);
    }
    function startResize(e) {
      e.preventDefault(); e.stopPropagation();
      resizing = true;
      var p = pt(e); sx = p.x; sy = p.y;
      orig = { w: state.logoPos.w, h: state.logoPos.h };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", end);
      document.addEventListener("touchmove", move, { passive: false });
      document.addEventListener("touchend", end);
    }
    function move(e) {
      var rect = stage.getBoundingClientRect();
      var p = pt(e);
      if (dragging) {
        e.preventDefault();
        var dx = ((p.x - sx) / rect.width) * 100;
        var dy = ((p.y - sy) / rect.height) * 100;
        state.logoPos.x = Math.max(0, Math.min(100 - state.logoPos.w, orig.x + dx));
        state.logoPos.y = Math.max(0, Math.min(100 - state.logoPos.h, orig.y + dy));
        ov.style.left = state.logoPos.x + "%";
        ov.style.top = state.logoPos.y + "%";
      } else if (resizing) {
        e.preventDefault();
        var dw = ((p.x - sx) / rect.width) * 100;
        state.logoPos.w = Math.max(10, Math.min(80, orig.w + dw));
        state.logoPos.h = Math.max(8, Math.min(80, orig.h + dw * 0.7));
        ov.style.width = state.logoPos.w + "%";
        ov.style.height = state.logoPos.h + "%";
      }
    }
    function end() {
      dragging = false; resizing = false;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", end);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
    }
    ov.addEventListener("mousedown", startDrag);
    ov.addEventListener("touchstart", startDrag, { passive: false });
    handle.addEventListener("mousedown", startResize);
    handle.addEventListener("touchstart", startResize, { passive: false });
  }

  function computeUnit(cfg, state) {
    var prod = getProduct(cfg, state.productId);
    var unit = prod.basePrice;
    var method = cfg.printMethods.filter(function (m) { return m.id === state.printMethod; })[0];
    if (method) unit += method.price;
    state.positions.forEach(function (pid) {
      var p = cfg.positions.filter(function (x) { return x.id === pid; })[0];
      if (p) unit += p.price;
    });
    return unit;
  }

  function updatePrice(container, cfg, state) {
    var prod = getProduct(cfg, state.productId);
    var method = cfg.printMethods.filter(function (m) { return m.id === state.printMethod; })[0];
    var unit = computeUnit(cfg, state);
    var posPrice = state.positions.reduce(function (sum, pid) {
      var p = cfg.positions.filter(function (x) { return x.id === pid; })[0];
      return sum + (p ? p.price : 0);
    }, 0);
    var total = unit * state.qty;
    qs("#c-pricebox", container).innerHTML =
      '<div class="prow"><span>Grundpreis (' + esc(prod.name) + ")</span><span>" + euro(prod.basePrice) + "</span></div>" +
      (method && method.price ? '<div class="prow"><span>Druckverfahren</span><span>+' + euro(method.price) + "</span></div>" : "") +
      (posPrice ? '<div class="prow"><span>Druckpositionen (' + state.positions.length + ")</span><span>+" + euro(posPrice) + "</span></div>" : "") +
      '<div class="prow"><span>Menge</span><span>× ' + state.qty + "</span></div>" +
      '<div class="ptotal"><span>Gesamt</span><span class="amt">' + euro(total) + "</span></div>";
  }

  function bind(container, cfg, state) {
    qs("#c-product", container).addEventListener("change", function () {
      state.productId = this.value;
      updateGarment(container, cfg, state);
      updatePrice(container, cfg, state);
    });
    qs("#c-method", container).addEventListener("change", function () {
      state.printMethod = this.value;
      updatePrice(container, cfg, state);
    });
    qsa(".color-sw", container).forEach(function (b) {
      b.addEventListener("click", function () {
        qsa(".color-sw", container).forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        state.color = b.getAttribute("data-color");
        updateGarment(container, cfg, state);
      });
    });
    qsa(".gender-btn", container).forEach(function (b) {
      b.addEventListener("click", function () {
        qsa(".gender-btn", container).forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        state.gender = b.getAttribute("data-gender");
      });
    });
    qsa(".size-btn", container).forEach(function (b) {
      b.addEventListener("click", function () {
        qsa(".size-btn", container).forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        state.size = b.getAttribute("data-size");
      });
    });
    qsa(".pos-btn", container).forEach(function (b) {
      b.addEventListener("click", function () {
        var pid = b.getAttribute("data-pos");
        var idx = state.positions.indexOf(pid);
        if (idx > -1) {
          if (state.positions.length > 1) { state.positions.splice(idx, 1); b.classList.remove("active"); }
          else UI.toast("Mindestens eine Druckposition erforderlich.", "info");
        } else { state.positions.push(pid); b.classList.add("active"); }
        updatePrice(container, cfg, state);
      });
    });

    // Menge
    function setQty(v) {
      state.qty = Math.max(1, v | 0);
      qs("#c-qty", container).value = state.qty;
      updatePrice(container, cfg, state);
    }
    qs("#c-minus", container).addEventListener("click", function () { setQty(state.qty - 1); });
    qs("#c-plus", container).addEventListener("click", function () { setQty(state.qty + 1); });
    qs("#c-qty", container).addEventListener("input", function () { setQty(parseInt(this.value, 10) || 1); });

    // Upload
    var fileInput = qs("#c-file", container);
    var uploadBox = qs("#c-upload", container);
    uploadBox.addEventListener("click", function () { fileInput.click(); });
    uploadBox.addEventListener("dragover", function (e) { e.preventDefault(); uploadBox.classList.add("drag"); });
    uploadBox.addEventListener("dragleave", function () { uploadBox.classList.remove("drag"); });
    uploadBox.addEventListener("drop", function (e) {
      e.preventDefault(); uploadBox.classList.remove("drag");
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", function () {
      if (this.files.length) handleFile(this.files[0]);
    });

    function handleFile(file) {
      var ext = "." + file.name.split(".").pop().toLowerCase();
      if (cfg.acceptedUpload.indexOf(ext) === -1) {
        UI.toast("Format nicht erlaubt. Bitte " + cfg.uploadFormats, "error");
        return;
      }
      if (file.size > 20 * 1024 * 1024) { UI.toast("Datei zu groß (max. 20MB).", "error"); return; }
      state.logoName = file.name;
      qs("#c-filename", container).textContent = "✓ " + file.name;
      qs("#c-filename", container).classList.remove("hidden");

      var isImage = /\.(png|jpg|jpeg|svg)$/i.test(file.name);
      if (isImage) {
        var reader = new FileReader();
        reader.onload = function (e) {
          state.logoDataUrl = e.target.result;
          addLogoOverlay(container, state);
        };
        reader.readAsDataURL(file);
      } else {
        // PDF etc: Platzhalter-Vorschau
        state.logoDataUrl = placeholderLogo(file.name);
        addLogoOverlay(container, state);
        UI.toast("Vorschau als Platzhalter (PDF wird in Produktion verwendet).", "info");
      }
    }

    qs("#c-center", container).addEventListener("click", function () {
      state.logoPos.x = (100 - state.logoPos.w) / 2;
      addLogoOverlay(container, state);
    });
    qs("#c-remove-logo", container).addEventListener("click", function () {
      state.logoDataUrl = null; state.logoName = null;
      var ov = qs(".logo-overlay", container); if (ov) ov.remove();
      qs("#c-toolbar", container).classList.add("hidden");
      qs("#c-filename", container).classList.add("hidden");
      fileInput.value = "";
    });

    // Warenkorb
    qs("#c-add", container).addEventListener("click", function () {
      var prod = getProduct(cfg, state.productId);
      var method = cfg.printMethods.filter(function (m) { return m.id === state.printMethod; })[0];
      var posLabels = state.positions.map(function (pid) {
        return cfg.positions.filter(function (x) { return x.id === pid; })[0].label;
      });
      Cart.addToCart({
        type: "custom",
        productId: prod.id,
        name: prod.name,
        garment: prod.garment,
        color: state.color,
        gender: state.gender,
        size: state.size,
        positions: posLabels,
        printMethod: method ? method.name : "",
        logoName: state.logoName,
        logoDataUrl: state.logoDataUrl,
        logoPos: Object.assign({}, state.logoPos),
        unitPrice: computeUnit(cfg, state),
        qty: state.qty
      });
      UI.toast("Zum Warenkorb hinzugefügt!", "success");
    });

    qs("#c-save", container).addEventListener("click", function () {
      UI.toast("Vorschau gespeichert. Du findest sie beim Bestellen wieder.", "success");
      try { localStorage.setItem("twd_last_preview", JSON.stringify(state)); } catch (e) {}
    });
  }

  function placeholderLogo(name) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120">' +
      '<rect width="200" height="120" rx="8" fill="#ffffff" stroke="#2563eb" stroke-dasharray="6 4"/>' +
      '<text x="100" y="55" font-family="Arial" font-size="16" font-weight="700" fill="#2563eb" text-anchor="middle">DEIN LOGO</text>' +
      '<text x="100" y="78" font-family="Arial" font-size="10" fill="#64748b" text-anchor="middle">' + esc(name) + "</text></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  global.Customizer = { render: render };
})(window);
