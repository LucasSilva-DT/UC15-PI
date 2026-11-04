(function () {
  'use strict';
  const KEY = 'gamestore.etapa8.v1';
  window.GameStoreStorage = {
    key: KEY,
    load() { const raw = localStorage.getItem(KEY); return raw === null ? GameStoreDomain.seed() : GameStoreDomain.validateState(JSON.parse(raw)); },
    save(state) { GameStoreDomain.validateState(state); localStorage.setItem(KEY, JSON.stringify(state)); }
  };
})();
