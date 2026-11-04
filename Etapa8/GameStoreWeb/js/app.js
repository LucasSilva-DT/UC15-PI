(function () {
  'use strict';
  const D = window.GameStoreDomain, Storage = window.GameStoreStorage;
  const $ = selector => document.querySelector(selector);
  const e = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
  const routes = {painel:'Visão geral', produtos:'Produtos', venda:'Nova venda', historico:'Histórico de vendas'};
  let state, blocked = false, query = '', stockFilter = 'todos', historyQuery = '', deleteId = '', toastTimer;
  try { state = Storage.load(); } catch (error) {
    state = D.emptyState(); blocked = true;
    $('#storage-warning').hidden = false;
    $('#storage-warning').textContent = 'Não foi possível abrir os dados deste navegador. Nenhum dado será sobrescrito. Verifique a permissão de armazenamento; se houver dados corrompidos, preserve-os antes de limpar os dados do site.';
  }
  function id(prefix) { return prefix + '-' + (globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)); }
  function route() { const value = location.hash.slice(1) || document.body.dataset.page; return Object.hasOwn(routes, value) ? value : 'painel'; }
  function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false; toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4200); }
  function commit(next) {
    if (blocked) throw new Error('Armazenamento indisponível. A operação não foi salva.');
    try { Storage.save(next); } catch (error) { throw new Error('Não foi possível salvar no navegador. A operação foi cancelada; verifique o espaço e as permissões.'); }
    state = next;
  }
  function status(p) { return p.stock === 0 ? ['out','Sem estoque'] : p.stock <= 3 ? ['low','Estoque baixo'] : ['good','Disponível']; }
  function badge(p) { const [cls,label] = status(p); return `<span class="badge ${cls}">${label}</span>`; }
  function art(p, index) { return `<span class="product-art art-${index % 4}" aria-hidden="true">${e(p.name.split(/\s+/).slice(0,2).map(w => w[0]).join('').toUpperCase())}</span>`; }
  function productCell(p, index) { return `<div class="product-cell">${art(p,index)}<div><strong>${e(p.name)}</strong><small>SKU · ${e(p.id.slice(-8).toUpperCase())}</small></div></div>`; }
  function head(title, subtitle, actions = '') { return `<div class="page-head"><div><p class="eyebrow">SEU NEGÓCIO EM JOGO</p><h1>${title}</h1><p class="subtitle">${subtitle}</p></div>${actions ? `<div class="head-actions">${actions}</div>` : ''}</div>`; }
  function addButton() { return '<button class="btn primary" type="button" data-add><span aria-hidden="true">＋</span> Novo produto</button>'; }
  function saleLink() { return '<a class="btn secondary" href="#venda"><span aria-hidden="true">＋</span> Registrar venda</a>'; }
  function empty(title,text) { return `<div class="empty"><span aria-hidden="true">▦</span><strong>${title}</strong><p>${text}</p></div>`; }
  function totalSales() { return state.sales.reduce((sum,s) => sum + BigInt(s.totalCents), 0n); }
  function date(value) { return new Date(value).toLocaleString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
  function saleTable(sales) {
    if (!sales.length) return empty('Nenhuma venda por aqui', 'Registre sua primeira venda para acompanhar os resultados.');
    return `<div class="table-scroll"><table><caption class="sr-only">Vendas registradas</caption><thead><tr><th>Produto</th><th>Data e hora</th><th>Quantidade</th><th>Total</th><th>Status</th></tr></thead><tbody>${sales.map(s => `<tr><td><strong>${e(s.productName)}</strong><small class="sale-code">${e(s.id.slice(-8).toUpperCase())}</small></td><td class="date-cell">${e(date(s.date))}</td><td>${s.quantity}</td><td class="numeric">${D.money(s.totalCents)}</td><td><span class="badge good">Concluída</span></td></tr>`).join('')}</tbody></table></div>`;
  }
  function dashboard() {
    const low = state.products.filter(p => p.stock <= 3);
    const units = state.products.reduce((sum,p) => sum + p.stock,0);
    return head('Visão geral', 'Tudo o que acontece na sua loja, em um só lugar.', saleLink() + addButton()) +
      `<section class="welcome"><div><h2>Seu próximo nível começa aqui.</h2><p>Organize o catálogo, acompanhe o estoque e registre suas vendas.<br>Os produtos iniciais são fictícios e podem ser editados para testar o sistema.</p></div><div class="welcome-icon" aria-hidden="true">✧</div></section>
      <section class="stats" aria-label="Resumo da loja">
      ${[['Produtos cadastrados',state.products.length,'Itens no catálogo','▦'],['Vendas registradas',state.sales.length,'Operações concluídas','↗'],['Estoque baixo',low.length,'Produtos com até 3 unidades','◷'],['Total em vendas',D.money(totalSales()),'Soma de todas as vendas','＄']].map(([title,value,note,icon]) => `<article class="stat"><div class="stat-top">${title}<span class="stat-icon" aria-hidden="true">${icon}</span></div><div class="stat-value">${value}</div><span class="stat-note">${note}</span></article>`).join('')}</section>
      <div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><h2>Seu catálogo</h2><p>Uma visão rápida dos produtos da loja</p></div><a class="text-link" href="#produtos">Ver todos →</a></div>
      ${state.products.length ? `<div class="table-scroll"><table><caption class="sr-only">Prévia do catálogo</caption><thead><tr><th>Produto</th><th>Preço</th><th>Estoque</th></tr></thead><tbody>${state.products.slice(0,5).map((p,i) => `<tr><td>${productCell(p,i)}</td><td class="numeric">${D.money(p.priceCents)}</td><td>${badge(p)}</td></tr>`).join('')}</tbody></table></div>` : empty('Catálogo vazio','Cadastre um produto para começar.')}
      <div class="panel-foot"><span>${state.products.length} produtos cadastrados</span><span>${units.toLocaleString('pt-BR')} unidades em estoque</span></div></section>
      <section class="panel"><div class="panel-head"><div><h2>Atenção ao estoque</h2><p>Planeje a reposição dos seus produtos</p></div><span class="badge low">${low.length} itens</span></div>${low.length ? `<div class="low-list">${low.slice(0,5).map((p,i) => `<div class="low-item">${art(p,i)}<div><strong>${e(p.name)}</strong><small>${p.stock} unidade(s) disponível(is)</small></div>${badge(p)}</div>`).join('')}</div>` : empty('Estoque em dia','Nenhum produto com estoque baixo.')}
      <a href="#produtos" class="all-link">Gerenciar produtos →</a></section></div>
      <section class="panel activity"><div class="panel-head"><div><h2>Últimas vendas</h2><p>As operações mais recentes da sua loja</p></div><a class="text-link" href="#historico">Ver histórico →</a></div>${saleTable(state.sales.slice().reverse().slice(0,4))}</section>`;
  }
  function filteredProducts() { return state.products.filter(p => p.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) && (stockFilter === 'todos' || (stockFilter === 'baixo' ? p.stock > 0 && p.stock <= 3 : stockFilter === 'zerado' ? p.stock === 0 : p.stock > 3))); }
  function productRows() {
    const list = filteredProducts();
    const target = $('#product-results');
    target.innerHTML = list.length ? `<div class="table-scroll"><table><caption class="sr-only">Produtos cadastrados</caption><thead><tr><th>Produto</th><th>Preço unitário</th><th>Unidades</th><th>Situação</th><th>Ações</th></tr></thead><tbody>${list.map((p,i) => `<tr><td>${productCell(p,i)}</td><td class="numeric">${D.money(p.priceCents)}</td><td>${p.stock}</td><td>${badge(p)}</td><td><div class="table-actions"><button type="button" data-edit="${e(p.id)}" aria-label="Editar ${e(p.name)}">Editar</button><button class="delete" type="button" data-delete="${e(p.id)}" aria-label="Excluir ${e(p.name)}">Excluir</button></div></td></tr>`).join('')}</tbody></table></div>` : empty(state.products.length ? 'Nenhum produto encontrado' : 'Seu catálogo está vazio',state.products.length ? 'Ajuste a busca ou o filtro para ver outros produtos.' : 'Clique em Novo produto para cadastrar o primeiro item.');
    $('#product-count').textContent = `${list.length} de ${state.products.length} produto(s)`;
  }
  function products() { return head('Produtos', 'Gerencie o catálogo e mantenha seu estoque atualizado.', addButton()) + `<section class="panel"><div class="toolbar"><div class="search-wrap"><span aria-hidden="true">⌕</span><input type="search" id="product-search" value="${e(query)}" placeholder="Buscar produto pelo nome..." aria-label="Buscar produto pelo nome"></div><label class="sr-only" for="stock-filter">Filtrar por estoque</label><select id="stock-filter"><option value="todos">Todos os estoques</option><option value="disponivel">Disponível</option><option value="baixo">Estoque baixo</option><option value="zerado">Sem estoque</option></select><button type="button" class="btn secondary clear-button" id="clear-products">Limpar filtros</button></div><div id="product-results"></div><div class="results-count" id="product-count" aria-live="polite"></div></section><p class="right-note">Estoque baixo: 1 a 3 unidades. Sem estoque: nenhuma unidade disponível.</p>`; }
  function salePage() {
    return head('Nova venda', 'Uma venda registrada, um estoque sempre em dia.') + `<div class="form-layout"><section class="panel"><div class="panel-head"><div><h2>Dados da venda</h2><p>Selecione o produto e informe a quantidade</p></div><span class="badge good">Registro local</span></div><form class="form-body" id="sale-form" novalidate><label for="sale-product">Produto <span>*</span></label><select id="sale-product" aria-describedby="sale-product-error"><option value="">Selecione um produto</option>${state.products.map(p => `<option value="${e(p.id)}" ${p.stock === 0 ? 'disabled' : ''}>${e(p.name)}${p.stock === 0 ? ' · sem estoque' : ''}</option>`).join('')}</select><small class="field-error" id="sale-product-error"></small><div class="form-grid"><div><label for="sale-quantity">Quantidade <span>*</span></label><input type="number" id="sale-quantity" min="1" max="2147483647" step="1" value="1" aria-describedby="sale-quantity-error"><small class="field-error" id="sale-quantity-error"></small></div><div><label for="sale-unit-price">Preço unitário</label><input id="sale-unit-price" readonly value="R$ 0,00" aria-label="Preço unitário calculado"><p class="field-description" id="available-stock">Selecione um produto para ver o estoque.</p></div></div><div class="form-help">O estoque é atualizado ao confirmar a venda. O nome e o preço do produto ficam preservados no histórico, mesmo após uma alteração no cadastro.</div><p class="field-error" id="sale-general-error" role="alert"></p><div class="form-actions"><a href="#painel" class="btn secondary">Voltar ao painel</a><button type="submit" class="btn primary" ${state.products.some(p => p.stock > 0) ? '' : 'disabled'}>Confirmar venda →</button></div>${state.products.some(p => p.stock > 0) ? '' : '<p class="muted">Nenhum produto com saldo. Cadastre ou atualize o estoque no catálogo.</p>'}</form></section><div class="detail-stack"><section class="panel"><div class="summary"><p class="eyebrow">RESUMO</p><h2>Confira antes de confirmar</h2><div class="summary-lines"><div class="summary-row"><span>Produto</span><strong id="summary-product">Nenhum selecionado</strong></div><div class="summary-row"><span>Quantidade</span><strong id="summary-quantity">—</strong></div><div class="summary-row"><span>Valor unitário</span><strong id="summary-price">R$ 0,00</strong></div></div><div class="summary-total"><span>Total da venda</span><strong id="summary-total" aria-live="polite">R$ 0,00</strong></div></div><div class="summary-footer"><span aria-hidden="true">✓</span> Valores calculados com precisão em centavos.</div></section><div class="notice">Este é um protótipo de front-end. Não há cobrança ou processamento de pagamentos; o registro fica somente neste navegador.</div></div></div>`;
  }
  function updateSummary() {
    const p = state.products.find(item => item.id === $('#sale-product').value); let qty = 0;
    try { qty = D.integer($('#sale-quantity').value,1,'quantity'); } catch (error) { qty = 0; }
    $('#sale-unit-price').value = p ? D.money(p.priceCents) : 'R$ 0,00';
    $('#available-stock').textContent = p ? `Disponível: ${p.stock} unidade(s).` : 'Selecione um produto para ver o estoque.';
    $('#summary-product').textContent = p ? p.name : 'Nenhum selecionado';
    $('#summary-quantity').textContent = p && qty ? `${qty} unidade(s)` : '—';
    $('#summary-price').textContent = p ? D.money(p.priceCents) : 'R$ 0,00';
    $('#summary-total').textContent = p ? D.money(BigInt(p.priceCents) * BigInt(qty)) : 'R$ 0,00';
  }
  function historyRows() {
    const list = state.sales.slice().reverse().filter(s => s.productName.toLocaleLowerCase('pt-BR').includes(historyQuery.toLocaleLowerCase('pt-BR')));
    $('#history-results').innerHTML = list.length ? saleTable(list) : empty(state.sales.length ? 'Nenhuma venda encontrada' : 'Nenhuma venda registrada',state.sales.length ? 'Tente buscar outro nome de produto.' : 'Registre uma venda para começar seu histórico.');
    $('#history-count').textContent = `${list.length} venda(s) encontrada(s)`;
    $('#filtered-total').textContent = D.money(list.reduce((sum,s) => sum + BigInt(s.totalCents),0n));
  }
  function history() { return head('Histórico de vendas','Cada venda registrada, com todos os detalhes.', '<a href="#venda" class="btn primary">＋ Nova venda</a>') + `<section class="panel"><div class="toolbar"><div class="search-wrap"><span aria-hidden="true">⌕</span><input type="search" id="history-search" value="${e(historyQuery)}" placeholder="Buscar pelo nome do produto..." aria-label="Buscar vendas pelo produto"></div><div class="history-total">Total dos resultados<strong id="filtered-total"></strong></div><button type="button" class="btn secondary" id="clear-history">Limpar busca</button></div><div id="history-results"></div><div class="results-count" id="history-count" aria-live="polite"></div></section><p class="right-note">O histórico conserva o nome e o preço da época da venda. Os horários seguem o fuso do seu dispositivo.</p>`; }
  function render() {
    const current = route();
    document.title = routes[current] + ' | GameStore'; $('#breadcrumb').textContent = routes[current];
    document.querySelectorAll('[data-route]').forEach(link => { link.classList.toggle('active',link.dataset.route === current); if (link.dataset.route === current) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
    $('#nav-count').textContent = state.products.length;
    $('#view').innerHTML = ({painel:dashboard,produtos:products,venda:salePage,historico:history}[current])();
    if (current === 'produtos') { $('#stock-filter').value = stockFilter; productRows(); }
    if (current === 'historico') historyRows();
    if (current === 'venda') updateSummary();
  }
  function clearProductErrors() {
    ['name','price','stock'].forEach(field => { $('#' + field + '-error').textContent = ''; $('#product-' + field).removeAttribute('aria-invalid'); }); $('#product-general-error').textContent = '';
  }
  function openProduct(productId) {
    $('#product-form').reset(); clearProductErrors();
    const p = productId ? D.find(state, productId) : null;
    $('#product-id').value = productId || ''; $('#product-dialog-title').textContent = p ? 'Editar produto' : 'Novo produto';
    if (p) { $('#product-name').value = p.name; $('#product-price').value = (BigInt(p.priceCents)/100n).toString() + ',' + (BigInt(p.priceCents)%100n).toString().padStart(2,'0'); $('#product-stock').value = p.stock; }
    $('#product-dialog').showModal(); $('#product-name').focus();
  }
  $('#product-form').addEventListener('submit', event => {
    event.preventDefault(); clearProductErrors();
    const fields = {name:$('#product-name').value,price:$('#product-price').value,stock:$('#product-stock').value};
    try {
      const editing = $('#product-id').value;
      commit(D.saveProduct(state, fields, editing, id('p'))); $('#product-dialog').close(); render(); toast(editing ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.');
    } catch (error) {
      const field = ['name','price','stock'].includes(error.field) ? error.field : null;
      $(field ? '#' + field + '-error' : '#product-general-error').textContent = error.message;
      if (field) { $('#product-' + field).setAttribute('aria-invalid','true'); $('#product-' + field).focus(); }
    }
  });
  document.addEventListener('click', event => {
    if (event.target.closest('.skip')) { event.preventDefault(); $('#conteudo').focus(); return; }
    const button = event.target.closest('button'); if (!button) return;
    if (button.hasAttribute('data-add')) openProduct();
    if (button.hasAttribute('data-edit')) openProduct(button.dataset.edit);
    if (button.dataset.close) $('#' + button.dataset.close).close();
    if (button.hasAttribute('data-delete')) {
      deleteId = button.dataset.delete; const p = D.find(state,deleteId);
      $('#confirm-text').textContent = `Deseja excluir “${p.name}” do catálogo?`;
      $('#confirm-error').textContent = ''; $('#confirm-dialog').showModal();
    }
    if (button.id === 'clear-products') { query = ''; stockFilter = 'todos'; render(); $('#product-search').focus(); }
    if (button.id === 'clear-history') { historyQuery = ''; render(); $('#history-search').focus(); }
  });
  $('#confirm-delete').addEventListener('click', () => {
    try { commit(D.removeProduct(state,deleteId)); $('#confirm-dialog').close(); render(); toast('Produto excluído. O histórico foi preservado.'); }
    catch (error) { $('#confirm-error').textContent = error.message; }
  });
  document.addEventListener('input', event => {
    if (event.target.id === 'product-search') { query = event.target.value; productRows(); }
    if (event.target.id === 'history-search') { historyQuery = event.target.value; historyRows(); }
    if (event.target.id === 'sale-quantity') { $('#sale-quantity-error').textContent = ''; $('#sale-quantity').removeAttribute('aria-invalid'); updateSummary(); }
    for (const field of ['name','price','stock']) if (event.target.id === 'product-' + field) { $('#' + field + '-error').textContent = ''; event.target.removeAttribute('aria-invalid'); }
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'stock-filter') { stockFilter = event.target.value; productRows(); }
    if (event.target.id === 'sale-product') { $('#sale-product-error').textContent = ''; $('#sale-product').removeAttribute('aria-invalid'); $('#sale-quantity-error').textContent = ''; $('#sale-quantity').removeAttribute('aria-invalid'); updateSummary(); }
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'sale-form') return;
    event.preventDefault();
    ['product','quantity'].forEach(field => { $('#sale-' + field).removeAttribute('aria-invalid'); $('#sale-' + field + '-error').textContent = ''; }); $('#sale-general-error').textContent = '';
    try { const next = D.sell(state,$('#sale-product').value,$('#sale-quantity').value,id('v'),new Date().toISOString()); commit(next); render(); toast('Venda registrada com sucesso. Estoque atualizado.'); }
    catch (error) { const field = ['product','quantity'].includes(error.field) ? error.field : null; $(field ? '#sale-' + field + '-error' : '#sale-general-error').textContent = error.message; if (field) { $('#sale-' + field).setAttribute('aria-invalid','true'); $('#sale-' + field).focus(); } }
  });
  window.addEventListener('hashchange', () => { render(); $('#conteudo').focus(); window.scrollTo(0,0); });
  window.addEventListener('storage', event => { if (event.key === Storage.key) { try { state = Storage.load(); blocked = false; $('#storage-warning').hidden = true; render(); toast('Dados atualizados por outra aba.'); } catch (error) { blocked = true; $('#storage-warning').hidden = false; $('#storage-warning').textContent = 'Os dados foram alterados para um formato inválido em outra aba. Nenhuma operação será gravada.'; } } });
  render();
})();
