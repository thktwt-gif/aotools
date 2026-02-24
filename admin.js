const state = {
  url: localStorage.getItem('strapi_url') || 'http://127.0.0.1:1337',
  jwt: localStorage.getItem('strapi_jwt') || '',
  blocks: [],
  products: [],
  articles: []
};

const $ = (s) => document.querySelector(s);
const statusEl = $('#adminStatus');

function setStatus(msg, err = false) {
  statusEl.textContent = msg;
  statusEl.className = `section-sub ${err ? 'err' : 'ok'}`;
}

async function strapi(path, options = {}, auth = true) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (auth && state.jwt) headers.Authorization = `Bearer ${state.jwt}`;
  const res = await fetch(`${state.url}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

async function login() {
  const identifier = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value.trim();
  const url = $('#strapiUrl').value.trim();
  localStorage.setItem('strapi_url', url);
  state.url = url;
  const data = await strapi('/api/auth/local', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  }, false);
  state.jwt = data.jwt;
  localStorage.setItem('strapi_jwt', data.jwt);
  $('#loginBox').style.display = 'none';
  $('#cmsBox').style.display = 'block';
  await refreshAll();
}

function toModel(entry) {
  return { id: entry.id, ...(entry.attributes || entry) };
}

async function refreshAll() {
  const query = '?pagination[pageSize]=100&sort[0]=order:asc&sort[1]=createdAt:asc';
  const [b, p, a] = await Promise.all([
    strapi(`/api/layout-blocks${query}`),
    strapi(`/api/products${query}`),
    strapi(`/api/articles${query}`)
  ]);
  state.blocks = b.data.map(toModel);
  state.products = p.data.map(toModel);
  state.articles = a.data.map(toModel);
  render();
  setStatus('Synced from Strapi.');
}

function renderList(container, data, type) {
  container.innerHTML = '';
  data.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'admin-item';
    const title = type === 'blocks' ? item.title : (item.name || item.title);
    row.innerHTML = `<strong>${title || '(untitled)'}</strong><p>${item.description || item.body || item.excerpt || ''}</p>
      <button class="btn btn-outline" data-del="${type}" data-id="${item.id}">Delete</button>`;
    container.appendChild(row);
  });
}

function render() {
  renderList($('#blockList'), state.blocks, 'blocks');
  renderList($('#productList'), state.products, 'products');
  renderList($('#articleList'), state.articles, 'articles');
}

async function create(type) {
  if (type === 'block') {
    await strapi('/api/layout-blocks', { method: 'POST', body: JSON.stringify({ data: {
      title: $('#blockTitle').value, body: $('#blockBody').value, fitMode: $('#blockFit').value, maxLines: Number($('#blockLines').value || 2), order: Date.now()
    } }) });
  }
  if (type === 'product') {
    await strapi('/api/products', { method: 'POST', body: JSON.stringify({ data: {
      name: $('#productName').value, description: $('#productDesc').value, spec: $('#productSpec').value, order: Date.now()
    } }) });
  }
  if (type === 'article') {
    await strapi('/api/articles', { method: 'POST', body: JSON.stringify({ data: {
      title: $('#articleTitle').value, excerpt: $('#articleExcerpt').value, order: Date.now()
    } }) });
  }
  await refreshAll();
}

async function remove(type, id) {
  const map = { blocks: 'layout-blocks', products: 'products', articles: 'articles' };
  await strapi(`/api/${map[type]}/${id}`, { method: 'DELETE' });
  await refreshAll();
}

document.addEventListener('click', async (e) => {
  const del = e.target.dataset.del;
  if (del) {
    await remove(del, e.target.dataset.id).catch((err) => setStatus(err.message, true));
    return;
  }
  if (e.target.id === 'loginBtn') login().catch((err) => setStatus(err.message, true));
  if (e.target.id === 'reloadBtn') refreshAll().catch((err) => setStatus(err.message, true));
  if (e.target.id === 'addBlockBtn') create('block').catch((err) => setStatus(err.message, true));
  if (e.target.id === 'addProductBtn') create('product').catch((err) => setStatus(err.message, true));
  if (e.target.id === 'addArticleBtn') create('article').catch((err) => setStatus(err.message, true));
  if (e.target.id === 'logoutBtn') {
    localStorage.removeItem('strapi_jwt');
    state.jwt = '';
    $('#loginBox').style.display = 'block';
    $('#cmsBox').style.display = 'none';
  }
});

(function boot() {
  $('#strapiUrl').value = state.url;
  if (state.jwt) {
    $('#loginBox').style.display = 'none';
    $('#cmsBox').style.display = 'block';
    refreshAll().catch((err) => setStatus(err.message, true));
  }
})();
