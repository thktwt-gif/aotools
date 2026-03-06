const STRAPI_URL = window.STRAPI_URL || localStorage.getItem('strapi_url') || 'http://127.0.0.1:1337';

const translations = {
  'zh-CN': {
    navLayout: '页面布局', navProducts: '产品', navArticles: '文章', navContact: '询盘', adminEntry: '后台管理',
    heroBadge: 'Strapi 驱动内容：布局/产品/文章统一由 Headless CMS 管理',
    heroTitle: '工业官网建站系统（Strapi 重构版）',
    heroSub: '前台读取 Strapi 内容，后台可视化管理区块、产品、文章，并支持多语言与 SEO/SEM 扩展。',
    heroCta1: '打开后台', heroCta2: '提交询盘', layoutTitle: '页面区块', productsTitle: '产品中心', articlesTitle: '文章中心',
    leadTitle: '发送询盘', leadSub: '询盘将写入 Strapi Leads，可接自动化通知。',
    namePlaceholder: '姓名 / 公司', emailPlaceholder: '邮箱', messagePlaceholder: '请输入需求（产能、物料、目标市场）',
    consentText: '我同意隐私政策并允许联系。', sendLead: '提交',
    footer: '© 2026 CanPack Pro · Strapi-powered Industrial Site Builder',
    submitOk: '提交成功。', submitFail: '提交失败，请稍后再试。', noData: '暂无内容，请到后台添加。'
  },
  en: {
    navLayout: 'Layout', navProducts: 'Products', navArticles: 'Articles', navContact: 'Inquiry', adminEntry: 'Admin',
    heroBadge: 'Powered by Strapi: Layout, product, and article content in one Headless CMS',
    heroTitle: 'Industrial Website Builder (Strapi Refactor)',
    heroSub: 'Frontend consumes Strapi data while admin manages blocks/products/articles with multilingual and SEO/SEM extensibility.',
    heroCta1: 'Open Admin', heroCta2: 'Send Inquiry', layoutTitle: 'Layout Blocks', productsTitle: 'Products', articlesTitle: 'Articles',
    leadTitle: 'Send Inquiry', leadSub: 'Inquiries are saved to Strapi Leads and can trigger automations.',
    namePlaceholder: 'Name / Company', emailPlaceholder: 'Email', messagePlaceholder: 'Tell us throughput, material, and market',
    consentText: 'I agree to the privacy policy and consent to contact.', sendLead: 'Submit',
    footer: '© 2026 CanPack Pro · Strapi-powered Industrial Site Builder',
    submitOk: 'Submitted successfully.', submitFail: 'Submission failed.', noData: 'No data yet. Add content in admin.'
  }
};

const selectEl = document.getElementById('languageSelect');
const i18nNodes = document.querySelectorAll('[data-i18n]');
const i18nPlaceholders = document.querySelectorAll('[data-i18n-placeholder]');
const layoutRender = document.getElementById('layoutRender');
const productRender = document.getElementById('productRender');
const articleRender = document.getElementById('articleRender');
const form = document.getElementById('leadForm');
const resultEl = document.getElementById('leadResult');

let contentData = { layout: [], products: [], articles: [] };

const t = (k) => (translations[selectEl.value] || translations.en)[k] || translations.en[k] || k;

function applyLanguage(locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  i18nNodes.forEach((n) => n.textContent = t(n.dataset.i18n));
  i18nPlaceholders.forEach((n) => n.placeholder = t(n.dataset.i18nPlaceholder));
  renderDynamic();
}

function pickAttr(row, fields) {
  for (const f of fields) if (row?.[f]) return row[f];
  return '';
}

function normalizeStrapi(list, type) {
  return (list || []).map((entry) => {
    const row = entry.attributes || entry;
    if (type === 'layout') return { title: pickAttr(row, ['title', 'Title']), body: pickAttr(row, ['body', 'Body', 'content']), fitMode: pickAttr(row, ['fitMode']) || 'wrap', maxLines: Number(row.maxLines || 3) };
    if (type === 'product') return { name: pickAttr(row, ['name', 'title']), desc: pickAttr(row, ['description', 'desc']), spec: pickAttr(row, ['spec']) };
    return { title: pickAttr(row, ['title']), excerpt: pickAttr(row, ['excerpt', 'summary']) };
  });
}

async function fetchStrapiData(locale) {
  const q = `?locale=${encodeURIComponent(locale)}&pagination[pageSize]=50&sort[0]=order:asc&sort[1]=createdAt:asc`;
  const read = async (endpoint, type) => {
    const res = await fetch(`${STRAPI_URL}/api/${endpoint}${q}`);
    if (!res.ok) throw new Error(endpoint);
    const json = await res.json();
    return normalizeStrapi(json.data, type);
  };

  const [layout, products, articles] = await Promise.all([
    read('layout-blocks', 'layout'),
    read('products', 'product'),
    read('articles', 'article')
  ]);

  contentData = { layout, products, articles };
}

function renderDynamic() {
  layoutRender.innerHTML = ''; productRender.innerHTML = ''; articleRender.innerHTML = '';

  const empty = `<p class="section-sub">${t('noData')}</p>`;
  if (!contentData.layout.length) layoutRender.innerHTML = empty;
  contentData.layout.forEach((b) => {
    const el = document.createElement('article');
    el.className = `card fit-${b.fitMode || 'wrap'}`;
    el.innerHTML = `<h3 class="clamp-${Math.max(1, Math.min(4, b.maxLines || 2))}">${b.title || ''}</h3><p>${b.body || ''}</p>`;
    layoutRender.appendChild(el);
  });

  if (!contentData.products.length) productRender.innerHTML = empty;
  contentData.products.forEach((p) => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `<h3>${p.name || ''}</h3><p>${p.desc || ''}</p><p class="meta">${p.spec || ''}</p>`;
    productRender.appendChild(el);
  });

  if (!contentData.articles.length) articleRender.innerHTML = empty;
  contentData.articles.forEach((a) => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `<h3>${a.title || ''}</h3><p>${a.excerpt || ''}</p>`;
    articleRender.appendChild(el);
  });
}

async function submitLead(payload) {
  const res = await fetch(`${STRAPI_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload })
  });
  if (!res.ok) throw new Error('lead submit failed');
}

function captureSemParams() {
  const params = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach((k) => {
    if (params.get(k)) sessionStorage.setItem(k, params.get(k));
  });
  if (params.get('keyword') || params.get('q')) sessionStorage.setItem('keyword', params.get('keyword') || params.get('q'));

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'keyword'].forEach((k) => {
    const node = form.querySelector(`input[name="${k}"]`);
    if (node) node.value = sessionStorage.getItem(k) || '';
  });
  form.querySelector('input[name="landing_page"]').value = location.href;
  form.querySelector('input[name="referrer"]').value = document.referrer || '';
}

selectEl.addEventListener('change', async (e) => {
  await fetchStrapiData(e.target.value).catch(() => {});
  applyLanguage(e.target.value);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.consent) return;
  data.locale = selectEl.value;
  try {
    await submitLead(data);
    resultEl.textContent = t('submitOk');
    resultEl.className = 'ok';
    form.reset();
    captureSemParams();
  } catch {
    resultEl.textContent = `${t('submitFail')} (${STRAPI_URL})`;
    resultEl.className = 'err';
  }
});

(async function init() {
  const initialLocale = new URLSearchParams(location.search).get('lang') || 'zh-CN';
  selectEl.value = initialLocale;
  captureSemParams();
  await fetchStrapiData(initialLocale).catch(() => {
    resultEl.textContent = `Strapi unavailable: ${STRAPI_URL}`;
    resultEl.className = 'err';
  });
  applyLanguage(initialLocale);
})();
