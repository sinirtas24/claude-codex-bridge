/* ============================================================
   Textildruck-Waren.de  –  Warenkorb & Session (Auth)
   ============================================================ */
(function (global) {
  "use strict";
  var CART_KEY = "twd_cart_v1";
  var SESSION_KEY = "twd_session_v1";

  /* ---------- Warenkorb ---------- */
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartBadge();
    document.dispatchEvent(new CustomEvent("cart:changed"));
  }
  function addToCart(item) {
    var items = loadCart();
    item.lineId = "l-" + Math.random().toString(36).slice(2, 9);
    items.push(item);
    saveCart(items);
  }
  function removeFromCart(lineId) {
    saveCart(loadCart().filter(function (i) { return i.lineId !== lineId; }));
  }
  function updateQty(lineId, qty) {
    var items = loadCart();
    items.forEach(function (i) { if (i.lineId === lineId) i.qty = Math.max(1, qty); });
    saveCart(items);
  }
  function clearCart() { saveCart([]); }
  function cartCount() {
    return loadCart().reduce(function (s, i) { return s + (i.qty || 1); }, 0);
  }
  function cartTotal() {
    return loadCart().reduce(function (s, i) { return s + (i.unitPrice || 0) * (i.qty || 1); }, 0);
  }
  function updateCartBadge() {
    var b = document.querySelector(".cart-badge");
    if (b) b.textContent = cartCount();
  }

  /* ---------- Session / Auth ----------
     PROTOTYP-HINWEIS: Passwörter werden hier bewusst nur als Klartext im
     localStorage gehalten (kein Backend vorhanden). Für einen Produktivbetrieb
     sind serverseitiges Hashing (z.B. bcrypt) und eine echte Session-/Token-
     Verwaltung zwingend erforderlich – dies ist NICHT produktionstauglich. */
  function currentUser() {
    try {
      var s = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (!s) return null;
      var users = TWD.get().users;
      return users.filter(function (u) { return u.id === s.userId; })[0] || null;
    } catch (e) { return null; }
  }
  function login(email, password) {
    var users = TWD.get().users;
    var u = users.filter(function (x) {
      return x.email.toLowerCase() === String(email).toLowerCase() && x.password === password;
    })[0];
    if (!u) return { ok: false, error: "E-Mail oder Passwort ist falsch." };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: u.id }));
    document.dispatchEvent(new CustomEvent("auth:changed"));
    return { ok: true, user: u };
  }
  function register(data) {
    var store = TWD.get();
    if (store.users.some(function (u) { return u.email.toLowerCase() === data.email.toLowerCase(); })) {
      return { ok: false, error: "Diese E-Mail ist bereits registriert." };
    }
    var user = {
      id: "u-" + Math.random().toString(36).slice(2, 9),
      email: data.email,
      password: data.password,
      name: data.name || data.email.split("@")[0],
      role: "customer",
      customerType: data.customerType || "privat",
      company: data.company || "",
      phone: data.phone || "",
      billing: data.billing || {},
      shipping: data.shipping || {}
    };
    store.users.push(user);
    TWD.save();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    document.dispatchEvent(new CustomEvent("auth:changed"));
    return { ok: true, user: user };
  }
  function logout() {
    localStorage.removeItem(SESSION_KEY);
    document.dispatchEvent(new CustomEvent("auth:changed"));
  }
  function updateUser(patch) {
    var u = currentUser();
    if (!u) return;
    Object.assign(u, patch);
    TWD.save();
    document.dispatchEvent(new CustomEvent("auth:changed"));
  }

  /* ---------- Bestellungen ---------- */
  function createOrder(orderData) {
    var store = TWD.get();
    var num = "TW-" + (10000 + store.orders.length + 1);
    var order = Object.assign({
      id: "o-" + Math.random().toString(36).slice(2, 9),
      number: num,
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: store.orderStatuses[0].id,
      statusHistory: [{ status: store.orderStatuses[0].id, at: orderData.createdAt || new Date().toISOString() }]
    }, orderData);
    store.orders.unshift(order);
    TWD.save();
    return order;
  }
  function userOrders(userId) {
    return TWD.get().orders.filter(function (o) { return o.userId === userId; });
  }
  function setOrderStatus(orderId, statusId) {
    var store = TWD.get();
    var o = store.orders.filter(function (x) { return x.id === orderId; })[0];
    if (!o) return;
    o.status = statusId;
    o.statusHistory = o.statusHistory || [];
    o.statusHistory.push({ status: statusId, at: new Date().toISOString() });
    TWD.save();
  }

  global.Cart = {
    loadCart: loadCart, saveCart: saveCart, addToCart: addToCart, removeFromCart: removeFromCart,
    updateQty: updateQty, clearCart: clearCart, cartCount: cartCount, cartTotal: cartTotal,
    updateCartBadge: updateCartBadge,
    currentUser: currentUser, login: login, register: register, logout: logout, updateUser: updateUser,
    createOrder: createOrder, userOrders: userOrders, setOrderStatus: setOrderStatus
  };
})(window);
