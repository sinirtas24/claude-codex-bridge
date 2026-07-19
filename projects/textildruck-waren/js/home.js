/* ============================================================
   Textildruck-Waren.de  –  Startseite
   ============================================================ */
(function (global) {
  "use strict";
  var icon = UI.icon, esc = UI.esc, euro = UI.euro, qs = UI.qs, qsa = UI.qsa;

  function productCard(p) {
    var img = p.image || TWD.garmentSVG(p.garment, p.color, {});
    var onerr = p.image ? UI.imgFallbackAttr(p.garment, p.color) : "";
    return '<div class="pcard ' + p.section + '" data-product="' + p.id + '">' +
      (p.discount ? '<span class="disc-badge">-' + p.discount + "%</span>" : "") +
      '<div class="pimg"><img src="' + esc(img) + '" alt="' + esc(p.name) + '" loading="lazy"' + onerr + "></div>" +
      '<div class="pname">' + esc(p.name) + "</div>" +
      '<div class="pprice"><span class="now">ab ' + euro(p.price) + "</span>" +
      (p.oldPrice ? '<span class="old">' + euro(p.oldPrice) + "</span>" : "") + "</div></div>";
  }

  function block(store, key, linkHash) {
    var sec = store.settings.sections[key];
    var items = store.products.filter(function (p) { return p.section === key; }).slice(0, 3);
    return '<div class="pblock ' + key + '">' +
      '<div class="pblock-head"><h2>' + esc(sec.title) + "</h2>" +
        '<a class="all" href="' + linkHash + '" data-link>Alle anzeigen ' + icon("chevRight") + "</a></div>" +
      '<div class="pblock-sub">' + esc(sec.subtitle) + "</div>" +
      '<div class="pblock-items">' + items.map(productCard).join("") + "</div></div>";
  }

  function categorySidebar(cats) {
    return '<aside class="hero-sidebar">' + cats.map(function (c) {
      return '<a href="#/kategorie/' + c.id + '" data-link>' + icon(c.icon) + "<span>" + esc(c.name) + "</span>" + icon("chevRight", "chev-r") + "</a>";
    }).join("") + "</aside>";
  }

  function heroSlide(slide, s) {
    var g1svg = TWD.garmentSVG(slide.garment1, slide.color1, { logo: "brand" });
    var g2svg = TWD.garmentSVG(slide.garment2, slide.color2, { logo: "brand" });
    var g1 = slide.image1 || g1svg;
    var g2 = slide.image2 || g2svg;
    var onerr1 = slide.image1 ? UI.imgFallbackAttr(slide.garment1, slide.color1) : "";
    var onerr2 = slide.image2 ? UI.imgFallbackAttr(slide.garment2, slide.color2) : "";
    var checklist = s.hero.checklist.map(function (c) {
      return "<li>" + icon("checkCircle") + "<span>" + esc(c) + "</span></li>";
    }).join("");
    var visual = slide.imageWide
      ? '<div class="hero-scene"><img src="' + esc(slide.imageWide) + '" alt="Bedruckbare Textilien"></div>'
      : '<div class="hero-garment g1"><img src="' + esc(g1) + '" alt=""' + onerr1 + "></div>" +
        '<div class="hero-garment g2"><img src="' + esc(g2) + '" alt=""' + onerr2 + "></div>";
    return '<div class="hero-content">' +
      '<div class="hero-left">' +
        "<h1>" + esc(slide.title) + "</h1>" +
        '<p class="hero-sub">' + esc(slide.subtitle) + "</p>" +
        '<ul class="hero-checklist">' + checklist + "</ul>" +
        '<a class="btn btn-orange" href="#/angebote" data-link>PRODUKTE ENTDECKEN ' + icon("arrowRight") + "</a>" +
      "</div>" +
      '<div class="hero-right">' +
        visual +
        '<div class="dtf-badge"><b>' + esc(s.hero.badgeTitle) + "</b><span>" + s.hero.badgeLines.map(esc).join("<br>") + "</span></div>" +
      "</div></div>";
  }

  function render(view) {
    var store = TWD.get();
    var s = store.settings;
    var cats = store.categories;

    var html =
      // Hero
      '<section class="hero-wrap"><div class="container"><div class="hero-inner">' +
        categorySidebar(cats) +
        '<div class="hero" id="hero">' +
          '<button class="hero-arrow prev" id="hero-prev">' + icon("chevLeft") + "</button>" +
          '<button class="hero-arrow next" id="hero-next">' + icon("chevRight") + "</button>" +
          '<div id="hero-slide">' + heroSlide(s.hero.slides[0], s) + "</div>" +
          '<div class="hero-dots" id="hero-dots"></div>' +
        "</div>" +
      "</div></div></section>" +

      // Features
      '<section class="features"><div class="container">' +
        s.features.map(function (f) {
          return '<div class="feature"><div class="fic">' + icon(f.icon) + "</div>" +
            "<div><b>" + esc(f.title) + "</b><span>" + esc(f.text) + "</span></div></div>";
        }).join("") +
      "</div></section>" +

      // Produkt-Blöcke
      '<section class="blocks"><div class="container"><div class="grid3">' +
        block(store, "angebote", "#/angebote") +
        block(store, "bestseller", "#/bestseller") +
        block(store, "arbeitskleidung", "#/kategorie/arbeitskleidung") +
      "</div></div></section>" +

      // Trust logos
      '<section class="trust"><div class="container">' +
        "<h4>" + esc(s.trustTitle) + "</h4>" +
        '<div class="trust-logos">' + s.trustLogos.map(function (t) {
          return '<span class="tl">' + esc(t) + "</span>";
        }).join("") + "</div>" +
      "</div></section>";

    view.innerHTML = html;
    bindProductCards(view);
    bindHeroSlider(view, s);
  }

  function categoryTile(c) {
    return '<div class="cattile" data-link-cat="' + c.id + '">' +
      '<div class="catfall" style="background:linear-gradient(135deg,' + c.accent + ',' + TWD.shade(c.accent, -25) + ')">' + icon(c.icon) + "</div>" +
      '<img src="' + esc(c.image) + '" alt="' + esc(c.name) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<div class="catlabel"><b>' + esc(c.name) + "</b></div></div>";
  }

  function bindProductCards(view) {
    qsa(".pcard", view).forEach(function (card) {
      card.addEventListener("click", function () {
        location.hash = "#/produkt/" + card.getAttribute("data-product");
      });
    });
    qsa(".cattile", view).forEach(function (t) {
      t.addEventListener("click", function () {
        location.hash = "#/kategorie/" + t.getAttribute("data-link-cat");
      });
    });
  }

  function bindHeroSlider(view, s) {
    var slides = s.hero.slides;
    var idx = 0;
    var dotsWrap = qs("#hero-dots", view);
    dotsWrap.innerHTML = slides.map(function (_, i) {
      return '<span class="dot' + (i === 0 ? " active" : "") + '" data-i="' + i + '"></span>';
    }).join("");
    function show(i) {
      idx = (i + slides.length) % slides.length;
      qs("#hero-slide", view).innerHTML = heroSlide(slides[idx], s);
      qsa(".dot", dotsWrap).forEach(function (d, di) { d.classList.toggle("active", di === idx); });
    }
    qs("#hero-prev", view).addEventListener("click", function () { show(idx - 1); });
    qs("#hero-next", view).addEventListener("click", function () { show(idx + 1); });
    qsa(".dot", dotsWrap).forEach(function (d) {
      d.addEventListener("click", function () { show(parseInt(d.getAttribute("data-i"), 10)); });
    });
    if (view._heroTimer) clearInterval(view._heroTimer);
    view._heroTimer = setInterval(function () {
      if (!document.body.contains(dotsWrap)) {
        clearInterval(view._heroTimer);
        return;
      }
      show(idx + 1);
    }, 6000);
  }

  global.Home = { render: render, productCard: productCard, categoryTile: categoryTile };
})(window);
