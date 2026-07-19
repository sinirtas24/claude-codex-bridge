/* ============================================================
   Textildruck-Waren.de  –  Daten- & Speicher-Schicht
   Alle Standard-Inhalte + localStorage Verwaltung
   ============================================================ */
(function (global) {
  "use strict";

  var STORAGE_KEY = "twd_store_v1";
  var DATA_VERSION = 6;

  /* ---------- SVG Produkt-Grafiken (selbstständig, keine externen Bilder) ---------- */
  function garmentSVG(type, color, opts) {
    opts = opts || {};
    color = color || "#1f2937";
    var stroke = shade(color, -25);
    var logo = opts.logo ? logoBlock(opts.logo) : "";
    var W = 400, H = 400;
    var body = "";
    switch (type) {
      case "tshirt":
        body =
          '<path d="M120 90 L90 120 L60 100 L40 150 L80 185 L110 160 L110 340 L290 340 L290 160 L320 185 L360 150 L340 100 L310 120 L280 90 L250 105 Q200 140 150 105 Z" fill="' +
          color + '" stroke="' + stroke + '" stroke-width="3"/>' +
          '<path d="M150 105 Q200 140 250 105" fill="none" stroke="' + stroke + '" stroke-width="3"/>';
        break;
      case "hoodie":
        body =
          '<path d="M120 100 L85 130 L55 108 L32 165 L78 200 L112 172 L112 350 L288 350 L288 172 L322 200 L368 165 L345 108 L315 130 L280 100 L255 118 Q200 155 145 118 Z" fill="' +
          color + '" stroke="' + stroke + '" stroke-width="3"/>' +
          '<path d="M145 118 Q200 95 255 118 Q235 175 200 175 Q165 175 145 118 Z" fill="' + shade(color, -12) + '" stroke="' + stroke + '" stroke-width="2"/>' +
          '<rect x="185" y="250" width="30" height="90" rx="6" fill="' + shade(color, -10) + '"/>' +
          '<line x1="188" y1="150" x2="188" y2="200" stroke="#d1d5db" stroke-width="3"/>' +
          '<line x1="212" y1="150" x2="212" y2="200" stroke="#d1d5db" stroke-width="3"/>';
        break;
      case "polo":
        body =
          '<path d="M120 95 L90 122 L60 102 L42 150 L82 182 L110 158 L110 340 L290 340 L290 158 L318 182 L358 150 L340 102 L310 122 L280 95 Z" fill="' +
          color + '" stroke="' + stroke + '" stroke-width="3"/>' +
          '<path d="M170 95 L200 150 L230 95 L215 92 Q200 100 185 92 Z" fill="#fff" stroke="' + stroke + '" stroke-width="2"/>' +
          '<line x1="200" y1="120" x2="200" y2="175" stroke="' + stroke + '" stroke-width="2"/>' +
          '<circle cx="200" cy="140" r="3" fill="' + stroke + '"/><circle cx="200" cy="160" r="3" fill="' + stroke + '"/>';
        break;
      case "tote":
        body =
          '<path d="M130 130 Q130 80 170 80 Q170 130 170 130" fill="none" stroke="' + stroke + '" stroke-width="6"/>' +
          '<path d="M230 130 Q230 80 270 80 Q270 130 270 130" fill="none" stroke="' + stroke + '" stroke-width="6"/>' +
          '<rect x="110" y="128" width="180" height="220" rx="4" fill="' + color + '" stroke="' + stroke + '" stroke-width="3"/>';
        break;
      case "jacket":
        body =
          '<path d="M118 96 L86 126 L56 104 L36 156 L78 190 L112 164 L112 345 L200 345 L200 120 Z" fill="' + color + '" stroke="' + stroke + '" stroke-width="3"/>' +
          '<path d="M282 96 L314 126 L344 104 L364 156 L322 190 L288 164 L288 345 L200 345 L200 120 Z" fill="' + shade(color, -12) + '" stroke="' + stroke + '" stroke-width="3"/>' +
          '<line x1="200" y1="120" x2="200" y2="345" stroke="#e5e7eb" stroke-width="4"/>' +
          '<rect x="140" y="240" width="45" height="55" rx="4" fill="' + shade(color, -18) + '"/>' +
          '<rect x="215" y="240" width="45" height="55" rx="4" fill="' + shade(color, -18) + '"/>';
        break;
      case "pants":
        body =
          '<path d="M140 70 L260 70 L272 210 L250 360 L210 360 L200 220 L190 360 L150 360 L128 210 Z" fill="' + color + '" stroke="' + stroke + '" stroke-width="3"/>' +
          '<rect x="140" y="70" width="120" height="22" fill="' + shade(color, -15) + '"/>' +
          '<rect x="150" y="150" width="34" height="46" rx="4" fill="' + shade(color, -18) + '"/>';
        break;
      case "vest":
        body =
          '<path d="M120 100 L90 128 L62 108 L44 156 L84 186 L110 162 L110 345 L290 345 L290 162 L316 186 L356 156 L338 108 L310 128 L280 100 L255 116 Q200 150 145 116 Z" fill="' +
          color + '" stroke="' + shade(color, -30) + '" stroke-width="3"/>' +
          '<rect x="110" y="200" width="180" height="26" fill="#d1d5db"/>' +
          '<rect x="110" y="270" width="180" height="26" fill="#d1d5db"/>';
        break;
      case "cap":
        body =
          '<path d="M100 220 Q100 120 200 120 Q300 120 300 220 Z" fill="' + color + '" stroke="' + stroke + '" stroke-width="3"/>' +
          '<path d="M100 220 Q200 250 300 220 L340 250 Q200 285 60 250 Z" fill="' + shade(color, -12) + '" stroke="' + stroke + '" stroke-width="3"/>' +
          '<circle cx="200" cy="128" r="8" fill="' + shade(color, -20) + '"/>';
        break;
      case "onesie":
        body =
          '<path d="M130 100 L100 126 L72 106 L52 152 L90 184 L120 160 L120 250 L100 340 L155 350 L175 280 L200 300 L225 280 L245 350 L300 340 L280 250 L280 160 L310 184 L348 152 L328 106 L300 126 L270 100 L248 114 Q200 145 152 114 Z" fill="' +
          color + '" stroke="' + stroke + '" stroke-width="3"/>';
        break;
      default:
        body = '<rect x="100" y="100" width="200" height="200" rx="12" fill="' + color + '"/>';
    }
    var svg =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">' +
      "<defs>" +
        '<clipPath id="gc">' + body + "</clipPath>" +
        '<linearGradient id="gs" x1="0" y1="0" x2="0.9" y2="1">' +
          '<stop offset="0" stop-color="#fff" stop-opacity="0.4"/>' +
          '<stop offset="0.3" stop-color="#fff" stop-opacity="0.05"/>' +
          '<stop offset="0.7" stop-color="#000" stop-opacity="0.03"/>' +
          '<stop offset="1" stop-color="#000" stop-opacity="0.28"/>' +
        "</linearGradient>" +
        '<filter id="gsh" x="-30%" y="-30%" width="160%" height="160%">' +
          '<feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#0f172a" flood-opacity="0.22"/>' +
        "</filter>" +
      "</defs>" +
      '<g filter="url(#gsh)">' + body + "</g>" +
      '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#gs)" clip-path="url(#gc)"/>' +
      logo + "</svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function logoBlock(kind) {
    if (kind === "brand") {
      return '<g transform="translate(200,225)"><rect x="-70" y="-26" width="140" height="52" rx="6" fill="rgba(0,0,0,0.0)"/>' +
        '<text x="0" y="-4" font-family="Arial" font-size="22" font-weight="800" fill="#ffffff" text-anchor="middle">Textildruck</text>' +
        '<text x="0" y="20" font-family="Arial" font-size="20" font-weight="800" fill="#f97316" text-anchor="middle">-Waren.de</text></g>';
    }
    return "";
  }

  /* Fallback: wenn ein echtes Produktfoto (URL) nicht lädt, auf generierte Grafik zurückfallen */
  function imgFallback(imgEl, garment, color) {
    imgEl.onerror = null;
    imgEl.src = garmentSVG(garment, color || "#111827", {});
  }

  /* Rechtstexte (Markdown-ähnlich: Leerzeile = Absatz, "## " = Überschrift) in HTML umwandeln */
  function renderLegalHtml(text) {
    if (!text) return "";
    return String(text).split(/\n\s*\n/).map(function (block) {
      block = block.trim();
      if (!block) return "";
      if (block.indexOf("## ") === 0) {
        return "<h3>" + escHtml(block.slice(3)) + "</h3>";
      }
      return "<p>" + escHtml(block).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Farbe abdunkeln / aufhellen */
  function shade(hex, percent) {
    try {
      hex = hex.replace("#", "");
      if (hex.length === 3) hex = hex.replace(/(.)/g, "$1$1");
      var num = parseInt(hex, 16);
      var r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
      var t = percent < 0 ? 0 : 255, p = Math.abs(percent) / 100;
      r = Math.round((t - r) * p) + r;
      g = Math.round((t - g) * p) + g;
      b = Math.round((t - b) * p) + b;
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    } catch (e) { return hex; }
  }

  /* ---------- Standard-Datensatz ---------- */
  function defaults() {
    return {
      settings: {
        topbarFeatures: [
          { icon: "bolt", text: "Schnelle Produktion" },
          { icon: "print", text: "DTF Druck in Top Qualität" },
          { icon: "truck", text: "Versand deutschlandweit" },
          { icon: "chat", text: "Persönliche Beratung" }
        ],
        hotline: "030 12345678",
        hours: "Mo - Fr: 09:00 - 18:00",
        logoLine1: "Textildruck",
        logoLine2: "-Waren.de",
        searchPlaceholder: "Suche nach Produkten, Kategorien...",
        hero: {
          title: "Textildruck einfach online bestellen!",
          subtitle: "Hochwertiger DTF Druck für Privat und Gewerbe",
          checklist: [
            "Eigene Designs hochladen",
            "Vorschau in Echtzeit",
            "Schnelle Produktion",
            "Deutschlandweiter Versand"
          ],
          ctaText: "JETZT GESTALTEN",
          badgeTitle: "DTF DRUCK",
          badgeLines: ["Brillante Farben", "Langlebig & Waschfest"],
          slides: [
            { garment1: "tshirt", color1: "#111827", garment2: "hoodie", color2: "#f9fafb",
              imageWide: "assets/chatgpt/tshirt-basic-photo.svg",
              image1: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=70",
              image2: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&q=70",
              title: "Textildruck einfach online bestellen!",
              subtitle: "Hochwertiger DTF Druck für Privat und Gewerbe" },
            { garment1: "polo", color1: "#1e3a5f", garment2: "tshirt", color2: "#dc2626",
              imageWide: "assets/chatgpt/hoodie-premium-photo.svg",
              image1: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=700&q=70",
              image2: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=700&q=70",
              title: "Deine Teamkleidung individuell bedruckt",
              subtitle: "Vereins- & Firmentextilien in Top Qualität" },
            { garment1: "jacket", color1: "#334155", garment2: "vest", color2: "#facc15",
              imageWide: "assets/chatgpt/arbeitsjacke-photo.svg",
              image1: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=70",
              image2: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=700&q=70",
              title: "Robuste Arbeitskleidung mit Logo",
              subtitle: "Professionell, langlebig und sicher" }
          ]
        },
        features: [
          { icon: "bolt", title: "Schnelle Produktion", text: "Deine Bestellung ist schnell bei dir." },
          { icon: "print", title: "DTF Druck", text: "Hochwertiger Druck in Top Qualität." },
          { icon: "building", title: "Firmenkunden willkommen", text: "Attraktive Konditionen für Gewerbe." },
          { icon: "user", title: "Persönliche Beratung", text: "Wir sind für dich da!" },
          { icon: "truck", title: "Lieferung deutschlandweit", text: "Zuverlässig und schnell an deine Adresse." }
        ],
        sections: {
          angebote: { title: "ANGEBOTE", subtitle: "Jetzt sparen und profitieren!" },
          bestseller: { title: "BESTSELLER", subtitle: "Unsere beliebtesten Produkte" },
          arbeitskleidung: { title: "ARBEITSKLEIDUNG", subtitle: "Robust, praktisch, professionell" }
        },
        steps: [
          { title: "Produkt auswählen", text: "Wähle dein Wunschprodukt, Farbe, Größe und Menge." },
          { title: "Design hochladen", text: "Lade dein Logo oder Design bequem hoch." },
          { title: "Vorschau prüfen", text: "Sieh dir dein Design in Echtzeit auf dem Produkt an." },
          { title: "Bestellung abschicken", text: "In den Warenkorb legen und sicher bestellen." }
        ],
        customizerTitle: "Gestalte dein Produkt mit Vorschau",
        customizerSubtitle: "Lade dein Logo hoch und sieh sofort, wie es auf deinem Produkt aussieht.",
        trustTitle: "ÜBER 3.000 ZUFRIEDENE KUNDEN VERTRAUEN UNS",
        trustLogos: ["BOSCH", "DHL", "Mercedes", "ZURICH", "REWE", "adidas", "DB", "SIEMENS", "Allianz"],
        contact: {
          company: "Textildruck-Waren.de",
          street: "Musterstraße 123",
          city: "12345 Berlin",
          country: "Deutschland",
          phone: "030 12345678",
          email: "info@textildruck-waren.de"
        },
        footerCols: {
          informationen: ["Über uns", "So funktioniert's", "Versand & Zahlung", "Häufige Fragen", "Kontakt"],
          kundenservice: ["Mein Konto", "Bestellverfolgung", "Retouren & Umtausch", "AGB", "Widerrufsbelehrung"],
          rechtliches: ["Impressum", "Datenschutz", "AGB", "Widerrufsbelehrung"]
        },
        paymentInfo: "ÜBERWEISUNG VORKASSE",
        copyright: "© 2024 Textildruck-Waren.de | Alle Rechte vorbehalten.",
        legalPages: {
          impressum:
            "## Angaben gemäß § 5 TMG\nMusterfirma Textildruck GmbH\nMusterstraße 1\n12345 Musterstadt\nDeutschland\n\n" +
            "## Vertreten durch\nGeschäftsführung: Max Mustermann\n\n" +
            "## Kontakt\nTelefon: 030 00000000\nE-Mail: info@musterfirma-demo.de\n\n" +
            "## Registereintrag\nEintragung im Handelsregister.\nRegistergericht: Amtsgericht Musterstadt\nRegisternummer: HRB 000000\n\n" +
            "## Umsatzsteuer-ID\nUmsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE000000000\n\n" +
            "## Streitschlichtung\nDie Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.\n\n" +
            "## Haftung für Inhalte\nAls Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.",
          datenschutz:
            "## Verantwortlicher\nVerantwortlich für die Datenverarbeitung auf dieser Website ist die Musterfirma Textildruck GmbH, Musterstraße 1, 12345 Musterstadt, E-Mail: info@musterfirma-demo.de.\n\n" +
            "## Erhebung und Speicherung personenbezogener Daten\nBeim Besuch unserer Website erheben wir automatisch technische Daten (IP-Adresse, Datum und Uhrzeit, Browsertyp). Bei einer Registrierung oder Bestellung erheben wir zusätzlich Name, Adresse, E-Mail-Adresse und Zahlungsdaten, soweit dies zur Vertragsabwicklung erforderlich ist.\n\n" +
            "## Zweck der Verarbeitung\nDie Daten werden zur Abwicklung von Bestellungen, zur Kundenbetreuung sowie – bei entsprechender Einwilligung – zu Marketingzwecken verarbeitet.\n\n" +
            "## Cookies\nUnsere Website verwendet technisch notwendige Cookies, um grundlegende Funktionen wie den Warenkorb und die Anmeldung zu ermöglichen. Diese Daten werden ausschließlich lokal in Ihrem Browser gespeichert.\n\n" +
            "## Ihre Rechte\nSie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten sowie ein Widerspruchsrecht gegen die Verarbeitung und ein Recht auf Datenübertragbarkeit.\n\n" +
            "## Beschwerderecht\nSie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.",
          agb:
            "## § 1 Geltungsbereich\nDiese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen der Musterfirma Textildruck GmbH und ihren Kunden über den Online-Shop textildruck-waren.de.\n\n" +
            "## § 2 Vertragsschluss\nDie Darstellung der Produkte im Shop stellt kein rechtlich bindendes Angebot dar, sondern einen unverbindlichen Online-Katalog. Durch Anklicken des Bestellbuttons geben Sie eine verbindliche Bestellung auf. Der Vertrag kommt mit unserer Bestätigung per E-Mail zustande.\n\n" +
            "## § 3 Preise und Versandkosten\nEs gelten die zum Zeitpunkt der Bestellung im Shop angegebenen Preise inklusive der gesetzlichen Mehrwertsteuer. Versandkosten werden vor Abschluss der Bestellung gesondert ausgewiesen.\n\n" +
            "## § 4 Lieferung\nDie Lieferung erfolgt innerhalb Deutschlands. Die Lieferzeit richtet sich nach der Produktionszeit individuell bedruckter Artikel und beträgt in der Regel 3–7 Werktage nach Zahlungseingang.\n\n" +
            "## § 5 Zahlung\nDie Zahlung kann per Vorkasse/Überweisung, PayPal, Kreditkarte oder Klarna Rechnung erfolgen.\n\n" +
            "## § 6 Individuell angefertigte Ware\nBei Produkten, die nach Kundenspezifikation (eigenes Logo, individuelle Druckposition, individuelle Farb-/Größenkombination) gefertigt werden, handelt es sich um Sonderanfertigungen im Sinne des § 312g Abs. 2 Nr. 1 BGB.\n\n" +
            "## § 7 Eigentumsvorbehalt\nDie gelieferte Ware bleibt bis zur vollständigen Bezahlung Eigentum der Musterfirma Textildruck GmbH.\n\n" +
            "## § 8 Gewährleistung\nEs gelten die gesetzlichen Gewährleistungsrechte.",
          widerrufsbelehrung:
            "## Widerrufsrecht\nSie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter die Waren in Besitz genommen haben.\n\n" +
            "## Ausübung des Widerrufsrechts\nUm Ihr Widerrufsrecht auszuüben, müssen Sie uns (Musterfirma Textildruck GmbH, Musterstraße 1, 12345 Musterstadt, E-Mail: info@musterfirma-demo.de) mittels einer eindeutigen Erklärung (z. B. per Post oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.\n\n" +
            "## Folgen des Widerrufs\nWenn Sie diesen Vertrag widerrufen, erstatten wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurück, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist.\n\n" +
            "## Ausschluss / vorzeitiges Erlöschen des Widerrufsrechts\nDas Widerrufsrecht besteht nicht bzw. erlischt vorzeitig bei Verträgen zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind (§ 312g Abs. 2 Nr. 1 BGB). Dies betrifft insbesondere alle Textilien, die mit einem individuell hochgeladenen Logo oder Design bedruckt wurden."
        }
      },

      categories: [
        { id: "oberbekleidung", name: "Oberbekleidung", icon: "tshirt",
          image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=70", accent: "#2563eb" },
        { id: "unterbekleidung", name: "Unterbekleidung", icon: "underwear",
          image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=70", accent: "#0891b2" },
        { id: "arbeitskleidung", name: "Arbeitskleidung", icon: "jacket",
          image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=70", accent: "#334155" },
        { id: "werbetextilien", name: "Werbetextilien", icon: "tag",
          image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=70", accent: "#f97316" },
        { id: "baby-kinder", name: "Baby & Kinder", icon: "baby",
          image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=600&q=70", accent: "#ec4899" },
        { id: "sportbekleidung", name: "Sportbekleidung", icon: "sport",
          image: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=600&q=70", accent: "#16a34a" },
        { id: "vereinskleidung", name: "Vereins- & Teamkleidung", icon: "team",
          image: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=600&q=70", accent: "#7c3aed" },
        { id: "event-messe", name: "Event & Messe", icon: "event",
          image: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=600&q=70", accent: "#d97706" },
        { id: "nachhaltige-textilien", name: "Nachhaltige Textilien", icon: "leaf",
          image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=70", accent: "#059669" }
      ],

      products: [
        // Angebote
        { id: "p-tshirt-basic", name: "T-Shirt Basic", section: "angebote", category: "oberbekleidung",
          price: 7.99, oldPrice: 9.99, discount: 20, garment: "tshirt", color: "#111827",
          image: "assets/chatgpt/tshirt-basic-photo.svg" },
        { id: "p-hoodie-classic", name: "Hoodie Classic", section: "angebote", category: "oberbekleidung",
          price: 19.99, oldPrice: 23.99, discount: 15, garment: "hoodie", color: "#f3f4f6",
          image: "assets/chatgpt/hoodie-classic-photo.svg" },
        { id: "p-baumwolltasche", name: "Baumwolltasche", section: "angebote", category: "werbetextilien",
          price: 3.59, oldPrice: 3.99, discount: 10, garment: "tote", color: "#e7d3ab",
          image: "assets/chatgpt/baumwolltasche-photo.svg" },
        // Bestseller
        { id: "p-tshirt-premium", name: "T-Shirt Premium", section: "bestseller", category: "oberbekleidung",
          price: 8.99, oldPrice: null, discount: 0, garment: "tshirt", color: "#1e3a5f",
          image: "assets/chatgpt/tshirt-premium-photo.svg" },
        { id: "p-polo-shirt", name: "Polo Shirt", section: "bestseller", category: "oberbekleidung",
          price: 12.99, oldPrice: null, discount: 0, garment: "polo", color: "#e5e7eb",
          image: "assets/chatgpt/polo-shirt-photo.svg" },
        { id: "p-hoodie-premium", name: "Hoodie Premium", section: "bestseller", category: "oberbekleidung",
          price: 24.99, oldPrice: null, discount: 0, garment: "hoodie", color: "#111827",
          image: "assets/chatgpt/hoodie-premium.svg" },
        // Arbeitskleidung
        { id: "p-arbeitsjacke", name: "Arbeitsjacke", section: "arbeitskleidung", category: "arbeitskleidung",
          price: 39.99, oldPrice: null, discount: 0, garment: "jacket", color: "#3f3f46",
          image: "assets/chatgpt/arbeitsjacke.svg" },
        { id: "p-arbeitshose", name: "Arbeitshose", section: "arbeitskleidung", category: "arbeitskleidung",
          price: 29.99, oldPrice: null, discount: 0, garment: "pants", color: "#1e293b",
          image: "assets/chatgpt/arbeitshose-photo.svg" },
        { id: "p-warnweste", name: "Warnweste", section: "arbeitskleidung", category: "arbeitskleidung",
          price: 4.99, oldPrice: null, discount: 0, garment: "vest", color: "#facc15",
          image: "assets/chatgpt/warnweste-photo.svg" },
        // Werbetextilien (weitere)
        { id: "p-werbekappe", name: "Werbekappe", section: "sortiment", category: "werbetextilien",
          price: 5.99, oldPrice: null, discount: 0, garment: "cap", color: "#1e3a5f",
          image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=70" },
        { id: "p-promo-fleeceweste", name: "Promotion-Fleeceweste", section: "sortiment", category: "werbetextilien",
          price: 16.99, oldPrice: null, discount: 0, garment: "vest", color: "#334155",
          image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&q=70" },
        // Unterbekleidung
        { id: "p-feinripp-unterhemd", name: "Feinripp-Unterhemd", section: "sortiment", category: "unterbekleidung",
          price: 6.49, oldPrice: null, discount: 0, garment: "tshirt", color: "#f8fafc",
          image: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=70" },
        { id: "p-boxershorts", name: "Boxershorts 3er-Pack", section: "sortiment", category: "unterbekleidung",
          price: 14.99, oldPrice: null, discount: 0, garment: "pants", color: "#1e293b",
          image: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600&q=70" },
        { id: "p-thermo-unterhemd", name: "Thermo-Unterhemd Langarm", section: "sortiment", category: "unterbekleidung",
          price: 11.99, oldPrice: null, discount: 0, garment: "tshirt", color: "#9ca3af",
          image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=70" },
        // Baby & Kinder
        { id: "p-baby-body", name: "Baby Body Kurzarm", section: "sortiment", category: "baby-kinder",
          price: 9.49, oldPrice: null, discount: 0, garment: "onesie", color: "#fde68a",
          image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=70" },
        { id: "p-kinder-tshirt", name: "Kinder T-Shirt", section: "sortiment", category: "baby-kinder",
          price: 7.49, oldPrice: null, discount: 0, garment: "tshirt", color: "#ec4899",
          image: "https://images.unsplash.com/photo-1519457851262-5aa4f7f8dcc7?w=600&q=70" },
        { id: "p-baby-strampler", name: "Baby Strampler", section: "sortiment", category: "baby-kinder",
          price: 10.49, oldPrice: null, discount: 0, garment: "onesie", color: "#bae6fd",
          image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=70" },
        // Sportbekleidung
        { id: "p-funktionsshirt", name: "Funktionsshirt", section: "sortiment", category: "sportbekleidung",
          price: 13.99, oldPrice: null, discount: 0, garment: "tshirt", color: "#16a34a",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=70" },
        { id: "p-sport-shorts", name: "Sport-Shorts", section: "sortiment", category: "sportbekleidung",
          price: 12.49, oldPrice: null, discount: 0, garment: "pants", color: "#111827",
          image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=70" },
        { id: "p-trainingsjacke", name: "Trainingsjacke", section: "sortiment", category: "sportbekleidung",
          price: 27.99, oldPrice: null, discount: 0, garment: "jacket", color: "#dc2626",
          image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=70" },
        // Vereins- & Teamkleidung
        { id: "p-vereins-trikot", name: "Vereins-Trikot", section: "sortiment", category: "vereinskleidung",
          price: 18.99, oldPrice: null, discount: 0, garment: "polo", color: "#7c3aed",
          image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=70" },
        { id: "p-fan-hoodie", name: "Fan-Hoodie", section: "sortiment", category: "vereinskleidung",
          price: 26.99, oldPrice: null, discount: 0, garment: "hoodie", color: "#4c1d95",
          image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=70" },
        { id: "p-team-polo", name: "Team-Poloshirt", section: "sortiment", category: "vereinskleidung",
          price: 15.99, oldPrice: null, discount: 0, garment: "polo", color: "#1e3a5f",
          image: "https://images.unsplash.com/photo-1503341960582-b45751874cf0?w=600&q=70" },
        // Event & Messe
        { id: "p-messe-polo", name: "Messe-Poloshirt", section: "sortiment", category: "event-messe",
          price: 16.49, oldPrice: null, discount: 0, garment: "polo", color: "#d97706",
          image: "https://images.unsplash.com/photo-1591382696701-8ce0f74a1734?w=600&q=70" },
        { id: "p-event-tshirt", name: "Event-T-Shirt", section: "sortiment", category: "event-messe",
          price: 9.99, oldPrice: null, discount: 0, garment: "tshirt", color: "#0f172a",
          image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70" },
        { id: "p-promo-softshell", name: "Promotion-Softshelljacke", section: "sortiment", category: "event-messe",
          price: 34.99, oldPrice: null, discount: 0, garment: "jacket", color: "#334155",
          image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&q=70" },
        // Nachhaltige Textilien
        { id: "p-bio-tshirt", name: "Bio-Baumwoll-T-Shirt", section: "sortiment", category: "nachhaltige-textilien",
          price: 12.99, oldPrice: null, discount: 0, garment: "tshirt", color: "#166534",
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=70" },
        { id: "p-recycling-hoodie", name: "Recycling-Hoodie", section: "sortiment", category: "nachhaltige-textilien",
          price: 29.99, oldPrice: null, discount: 0, garment: "hoodie", color: "#78350f",
          image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=600&q=70" },
        { id: "p-fairtrade-tasche", name: "Fairtrade-Tragetasche", section: "sortiment", category: "nachhaltige-textilien",
          price: 4.49, oldPrice: null, discount: 0, garment: "tote", color: "#d6d3c4",
          image: "https://images.unsplash.com/photo-1597484662317-13c1c3944315?w=600&q=70" }
      ],

      customizer: {
        products: [
          { id: "t-shirt-premium", name: "T-Shirt Premium", garment: "tshirt", basePrice: 8.99, previewImage: "assets/chatgpt/customizer-black-tshirt.svg" },
          { id: "t-shirt-basic", name: "T-Shirt Basic", garment: "tshirt", basePrice: 7.99, previewImage: "assets/chatgpt/customizer-black-tshirt.svg" },
          { id: "polo-shirt", name: "Polo Shirt", garment: "polo", basePrice: 12.99 },
          { id: "hoodie-premium", name: "Hoodie Premium", garment: "hoodie", basePrice: 24.99 },
          { id: "arbeitsjacke", name: "Arbeitsjacke", garment: "jacket", basePrice: 39.99 }
        ],
        genders: ["Herren", "Damen", "Unisex"],
        colors: [
          { name: "Schwarz", value: "#111827" },
          { name: "Weiß", value: "#ffffff" },
          { name: "Navy", value: "#1e3a5f" },
          { name: "Rot", value: "#b91c1c" },
          { name: "Grün", value: "#3f6212" },
          { name: "Grau", value: "#9ca3af" }
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        positions: [
          { id: "brust-links", label: "Brust links", icon: "chest-l", price: 3.0 },
          { id: "brust-rechts", label: "Brust rechts", icon: "chest-r", price: 3.0 },
          { id: "vorne-gross", label: "Vorne groß", icon: "front", price: 5.0 },
          { id: "rueckseite", label: "Rückseite", icon: "back", price: 5.0 },
          { id: "aermel-links", label: "Ärmel links", icon: "sleeve-l", price: 2.5 },
          { id: "aermel-rechts", label: "Ärmel rechts", icon: "sleeve-r", price: 2.5 }
        ],
        printMethods: [
          { id: "dtf", name: "DTF Druck", price: 0 },
          { id: "siebdruck", name: "Siebdruck", price: 1.5 },
          { id: "flex", name: "Flexdruck", price: 1.0 },
          { id: "stick", name: "Stickerei", price: 4.0 }
        ],
        uploadFormats: "PNG, JPG, PDF, SVG, AI, EPS (max. 20MB)",
        acceptedUpload: [".png", ".jpg", ".jpeg", ".pdf", ".svg", ".ai", ".eps"]
      },

      orderStatuses: [
        { id: "zahlung-ausstehend", label: "Zahlung ausstehend", color: "#f59e0b" },
        { id: "zahlung-erhalten", label: "Zahlung erhalten", color: "#3b82f6" },
        { id: "datenpruefung", label: "Datenprüfung", color: "#8b5cf6" },
        { id: "vorbereitung", label: "Vorbereitung", color: "#06b6d4" },
        { id: "im-druck", label: "Im Druck", color: "#ec4899" },
        { id: "versand", label: "Versand", color: "#16a34a" }
      ],

      users: [
        { id: "u-admin", email: "admin@textildruck-waren.de", password: "admin123",
          name: "Administrator", role: "admin", customerType: "gewerbe" }
      ],
      orders: [],
      dataVersion: DATA_VERSION
    };
  }

  /* Migration: bringt in älterem localStorage gespeicherte Datensätze auf den aktuellen Stand
     (z.B. neu hinzugefügte Standard-Kategorien/Produkte, nachgerüstete Hero-Fotos), ohne
     eigene Änderungen des Nutzers (Bestellungen, Konten, individuell angepasste Inhalte) zu verwerfen. */
  function migrateStore(store) {
    if ((store.dataVersion || 0) >= DATA_VERSION) return;
    var def = defaults();

    var catIds = {};
    store.categories.forEach(function (c) { catIds[c.id] = true; });
    def.categories.forEach(function (c) { if (!catIds[c.id]) store.categories.push(c); });

    var prodIds = {};
    store.products.forEach(function (p) { prodIds[p.id] = true; });
    def.products.forEach(function (p) { if (!prodIds[p.id]) store.products.push(p); });

    if (store.settings && store.settings.hero && Array.isArray(store.settings.hero.slides)) {
      store.settings.hero.slides.forEach(function (slide, i) {
        var defSlide = def.settings.hero.slides[i];
        if (defSlide && !slide.image1 && !slide.image2 && slide.title === defSlide.title) {
          slide.image1 = defSlide.image1;
          slide.image2 = defSlide.image2;
        }
      });
      store.settings.hero.slides.forEach(function (slide, i) {
        if (def.settings.hero.slides[i] && def.settings.hero.slides[i].imageWide) {
          slide.imageWide = def.settings.hero.slides[i].imageWide;
        }
      });
    }

    // Yeni yerel görselleri, kullanıcının sepet ve hesap verilerine dokunmadan uygula.
    ["p-tshirt-basic", "p-hoodie-classic", "p-baumwolltasche", "p-tshirt-premium",
      "p-polo-shirt", "p-hoodie-premium", "p-arbeitsjacke", "p-arbeitshose", "p-warnweste"].forEach(function (id) {
      var current = store.products.filter(function (p) { return p.id === id; })[0];
      var fresh = def.products.filter(function (p) { return p.id === id; })[0];
      if (current && fresh) current.image = fresh.image;
    });
    if (store.customizer && Array.isArray(store.customizer.products)) {
      store.customizer.products.forEach(function (p) {
        var fresh = def.customizer.products.filter(function (x) { return x.id === p.id; })[0];
        if (fresh && fresh.previewImage) p.previewImage = fresh.previewImage;
      });
    }

    // Aus alten Versionen stammende Platzhaltertexte ("[Bitte ... eintragen]", "Muster-Rechtstext")
    // in den Rechtstexten durch die aktuellen Demo-Texte ersetzen, individuell angepasste Texte bleiben erhalten.
    if (store.settings && store.settings.legalPages) {
      var placeholderRe = /\[Bitte[^\]]*eintragen\]|Muster-Rechtstext/i;
      Object.keys(def.settings.legalPages).forEach(function (k) {
        var text = store.settings.legalPages[k];
        if (typeof text === "string" && placeholderRe.test(text)) {
          store.settings.legalPages[k] = def.settings.legalPages[k];
        }
      });
    }

    store.dataVersion = DATA_VERSION;
  }

  /* ---------- Store (localStorage) ---------- */
  var store = null;

  function load() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        store = JSON.parse(raw);
        // Merge fehlende Top-Level-Schlüssel (Vorwärtskompatibilität)
        var def = defaults();
        Object.keys(def).forEach(function (k) {
          if (!(k in store)) store[k] = def[k];
        });
        // Merge fehlende Unterschlüssel in settings (z.B. nach Updates neu hinzugefügte Felder)
        Object.keys(def.settings).forEach(function (k) {
          if (!(k in store.settings)) store.settings[k] = def.settings[k];
        });
        if (!store.settings.legalPages) store.settings.legalPages = def.settings.legalPages;
        else Object.keys(def.settings.legalPages).forEach(function (k) {
          if (!(k in store.settings.legalPages)) store.settings.legalPages[k] = def.settings.legalPages[k];
        });
        migrateStore(store);
        save();
      } else {
        store = defaults();
        save();
      }
    } catch (e) {
      console.warn("Store-Ladefehler, setze zurück:", e);
      store = defaults();
      save();
    }
    return store;
  }

  function save() {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn("Store konnte nicht gespeichert werden:", e);
    }
  }

  function reset() {
    store = defaults();
    save();
    return store;
  }

  function get() {
    if (!store) load();
    return store;
  }

  function uid(prefix) {
    return (prefix || "id") + "-" + Math.random().toString(36).slice(2, 9) + "-" + (get().orders.length + 1);
  }

  global.TWD = {
    STORAGE_KEY: STORAGE_KEY,
    defaults: defaults,
    load: load,
    save: save,
    reset: reset,
    get: get,
    uid: uid,
    garmentSVG: garmentSVG,
    shade: shade,
    imgFallback: imgFallback,
    renderLegalHtml: renderLegalHtml
  };
})(window);
