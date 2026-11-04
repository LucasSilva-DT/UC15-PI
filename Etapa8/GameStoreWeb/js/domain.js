(function (root) {
  'use strict';
  const MAX_STOCK = 2147483647;
  class ValidationError extends Error { constructor(message, field) { super(message); this.name = 'ValidationError'; this.field = field; } }
  function parsePrice(value) {
    const raw = String(value).trim();
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(raw)) throw new ValidationError('Informe um preço válido, com até duas casas decimais.', 'price');
    const [whole, fraction = ''] = raw.replace(',', '.').split('.');
    const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
    if (cents <= 0n || cents > 9999999999n) throw new ValidationError('O preço deve estar entre R$ 0,01 e R$ 99.999.999,99.', 'price');
    return cents.toString();
  }
  function integer(value, minimum, field) {
    const raw = String(value).trim();
    if (!/^\d+$/.test(raw)) throw new ValidationError('Informe um número inteiro válido.', field);
    const result = Number(raw);
    if (!Number.isSafeInteger(result) || result < minimum || result > MAX_STOCK) throw new ValidationError('Informe um inteiro entre ' + minimum + ' e 2.147.483.647.', field);
    return result;
  }
  function money(cents) {
    const value = BigInt(cents); const negative = value < 0n; const n = negative ? -value : value;
    return (negative ? '-R$ ' : 'R$ ') + (n / 100n).toLocaleString('pt-BR') + ',' + (n % 100n).toString().padStart(2, '0');
  }
  function validateProduct(state, fields, id) {
    const name = String(fields.name || '').trim();
    if (!name || name.length > 100) throw new ValidationError('Informe um nome com 1 a 100 caracteres.', 'name');
    if (state.products.some(p => p.id !== id && p.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) throw new ValidationError('Já existe um produto com esse nome.', 'name');
    return { name, priceCents: parsePrice(fields.price), stock: integer(fields.stock, 0, 'stock') };
  }
  function find(state, id) { const p = state.products.find(item => item.id === id); if (!p) throw new ValidationError('Selecione um produto válido.', 'product'); return p; }
  function saveProduct(state, fields, id, newId) {
    if (id) find(state, id);
    const validated = validateProduct(state, fields, id);
    const product = { id: id || newId, ...validated };
    if (!product.id || (!id && state.products.some(p => p.id === product.id))) throw new ValidationError('Identificador do produto inválido.', 'general');
    return { ...state, products: id ? state.products.map(p => p.id === id ? product : p) : [...state.products, product] };
  }
  function removeProduct(state, id) { find(state, id); return { ...state, products: state.products.filter(p => p.id !== id) }; }
  function sell(state, id, quantity, saleId, date) {
    const p = find(state, id); const qty = integer(quantity, 1, 'quantity');
    if (qty > p.stock) throw new ValidationError('Estoque insuficiente. Disponível: ' + p.stock + ' unidade(s).', 'quantity');
    if (!saleId || state.sales.some(s => s.id === saleId) || !Number.isFinite(Date.parse(date))) throw new ValidationError('Dados da venda inválidos.', 'general');
    const sale = { id: saleId, productId: id, productName: p.name, quantity: qty, unitPriceCents: p.priceCents, totalCents: (BigInt(p.priceCents) * BigInt(qty)).toString(), date };
    return { ...state, products: state.products.map(item => item.id === id ? { ...item, stock: p.stock - qty } : item), sales: [...state.sales, sale] };
  }
  function emptyState() { return { version: 1, products: [], sales: [] }; }
  function seed() {
    const items = [ ['p01', 'Controle sem fio', '34990', 8], ['p02', 'Headset gamer', '22990', 3], ['p03', 'Jogo de aventura', '19990', 0], ['p04', 'Teclado mecânico', '28990', 15], ['p05', 'Mouse gamer', '15990', 2], ['p06', 'Jogo de corrida', '24990', 6] ];
    return { version: 1, products: items.map(([id, name, priceCents, stock]) => ({id, name, priceCents, stock})), sales: [] };
  }
  function validateState(state) {
    if (!state || state.version !== 1 || !Array.isArray(state.products) || !Array.isArray(state.sales)) throw new Error('Formato de dados inválido.');
    const ids = new Set(), names = new Set();
    for (const p of state.products) {
      if (typeof p.id !== 'string' || !p.id || ids.has(p.id) || typeof p.name !== 'string' || p.name.trim() !== p.name || !p.name || p.name.length > 100 || names.has(p.name.toLocaleLowerCase('pt-BR')) || typeof p.priceCents !== 'string' || !/^\d+$/.test(p.priceCents) || BigInt(p.priceCents) <= 0n || BigInt(p.priceCents) > 9999999999n || !Number.isInteger(p.stock) || p.stock < 0 || p.stock > MAX_STOCK) throw new Error('Produto salvo inválido.');
      ids.add(p.id); names.add(p.name.toLocaleLowerCase('pt-BR'));
    }
    const saleIds = new Set();
    for (const s of state.sales) {
      if (typeof s.id !== 'string' || !s.id || saleIds.has(s.id) || typeof s.productId !== 'string' || typeof s.productName !== 'string' || !s.productName || !Number.isInteger(s.quantity) || s.quantity < 1 || s.quantity > MAX_STOCK || !/^\d+$/.test(String(s.unitPriceCents)) || BigInt(s.unitPriceCents) <= 0n || !/^\d+$/.test(String(s.totalCents)) || BigInt(s.unitPriceCents) * BigInt(s.quantity) !== BigInt(s.totalCents) || !Number.isFinite(Date.parse(s.date))) throw new Error('Venda salva inválida.');
      saleIds.add(s.id);
    }
    return state;
  }
  const api = {ValidationError, parsePrice, integer, money, validateProduct, saveProduct, removeProduct, sell, find, seed, emptyState, validateState};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.GameStoreDomain = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
