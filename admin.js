const state = { layout: [], products: [], articles: [] };

const layoutList = document.getElementById('layoutList');
const productList = document.getElementById('productList');
const articleList = document.getElementById('articleList');
const statusEl = document.getElementById('adminStatus');

function uid() { return Date.now() + Math.floor(Math.random() * 10000); }

async function loadContent() {
  const res = await fetch('api/content.php');
  const json = await res.json();
  Object.assign(state, json.data || {});
  renderAll();
}

function blockTitle(type) {
  if (type === 'hero') return 'Hero 区块';
  if (type === 'features') return 'Features 区块';
  return 'CTA 区块';
}

function renderLayout() {
  layoutList.innerHTML = '';
  state.layout.forEach((block, index) => {
    const item = document.createElement('article');
    item.className = 'admin-item';
    item.draggable = true;
    item.dataset.index = String(index);
    item.innerHTML = `
      <div class="admin-item-head">
        <strong>${blockTitle(block.type)}</strong>
        <div>
          <button type="button" data-act="up">↑</button>
          <button type="button" data-act="down">↓</button>
          <button type="button" data-act="del">删除</button>
        </div>
      </div>
      <input data-field="title" value="${(block.title || '').replace(/"/g, '&quot;')}" placeholder="区块标题" />
      <textarea data-field="body" rows="3" placeholder="区块文案">${block.body || ''}</textarea>
    `;

    item.querySelectorAll('[data-field]').forEach((el) => {
      el.addEventListener('input', (e) => {
        const field = e.target.dataset.field;
        state.layout[index][field] = e.target.value;
      });
    });

    item.querySelectorAll('button[data-act]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        if (act === 'del') state.layout.splice(index, 1);
        if (act === 'up' && index > 0) [state.layout[index - 1], state.layout[index]] = [state.layout[index], state.layout[index - 1]];
        if (act === 'down' && index < state.layout.length - 1) [state.layout[index + 1], state.layout[index]] = [state.layout[index], state.layout[index + 1]];
        renderLayout();
      });
    });

    item.addEventListener('dragstart', () => item.classList.add('dragging'));
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
    layoutList.appendChild(item);
  });
}

layoutList.addEventListener('dragover', (e) => {
  e.preventDefault();
  const dragging = layoutList.querySelector('.dragging');
  if (!dragging) return;
  const nodes = [...layoutList.querySelectorAll('.admin-item:not(.dragging)')];
  const next = nodes.find((n) => e.clientY <= n.getBoundingClientRect().top + n.offsetHeight / 2);
  if (next) layoutList.insertBefore(dragging, next); else layoutList.appendChild(dragging);
});

layoutList.addEventListener('drop', () => {
  const order = [...layoutList.querySelectorAll('.admin-item')].map((el) => Number(el.dataset.index));
  state.layout = order.map((i) => state.layout[i]);
  renderLayout();
});

function renderProducts() {
  productList.innerHTML = state.products.map((p, i) => `
    <article class="admin-item">
      <div class="admin-item-head"><strong>${p.name}</strong><button data-del-product="${i}">删除</button></div>
      <p>${p.category}</p>
      <p>${p.summary}</p>
    </article>`).join('');

  productList.querySelectorAll('[data-del-product]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.products.splice(Number(btn.dataset.delProduct), 1);
      renderProducts();
    });
  });
}

function renderArticles() {
  articleList.innerHTML = state.articles.map((a, i) => `
    <article class="admin-item">
      <div class="admin-item-head"><strong>${a.title}</strong><button data-del-article="${i}">删除</button></div>
      <p>${a.status}</p>
      <p>${a.excerpt}</p>
    </article>`).join('');

  articleList.querySelectorAll('[data-del-article]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.articles.splice(Number(btn.dataset.delArticle), 1);
      renderArticles();
    });
  });
}

function renderAll() { renderLayout(); renderProducts(); renderArticles(); }

document.querySelectorAll('[data-add-block]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.addBlock;
    state.layout.push({ id: uid(), type, title: `${type.toUpperCase()} Title`, body: 'Edit content...' });
    renderLayout();
  });
});

document.getElementById('productForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  state.products.unshift({ id: uid(), ...data });
  e.target.reset();
  renderProducts();
});

document.getElementById('articleForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  state.articles.unshift({ id: uid(), ...data });
  e.target.reset();
  renderArticles();
});

document.getElementById('saveAllBtn').addEventListener('click', async () => {
  statusEl.textContent = '保存中...';
  const res = await fetch('api/content.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  const json = await res.json();
  statusEl.textContent = json.ok ? '保存成功，前台已可读取最新内容。' : '保存失败';
});

loadContent();
