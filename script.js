const translations = {
  "zh-CN": {
    navLayout: "页面布局",
    navProducts: "产品",
    navArticles: "文章",
    navContact: "询盘",
    adminEntry: "后台管理",
    heroBadge: "非侵权说明：本项目为原创实现，不会一比一复制第三方网站内容或素材",
    heroTitle: "工业官网建站系统：前台拖拽布局 + 后台产品文章管理",
    heroSub: "你可以在后台拖拽页面区块并管理产品与文章，前台自动渲染最新内容。",
    heroCta1: "打开拖拽后台",
    heroCta2: "提交询盘",
    layoutTitle: "拖拽布局渲染区",
    productsTitle: "产品中心",
    articlesTitle: "文章中心",
    leadTitle: "发送询盘",
    leadSub: "提交后会进入后台线索并可推送邮箱/企业微信机器人。",
    namePlaceholder: "姓名 / 公司",
    emailPlaceholder: "邮箱",
    messagePlaceholder: "请输入需求（产能、物料、目标市场）",
    consentText: "我同意隐私政策并允许联系。",
    sendLead: "提交",
    footer: "© 2026 CanPack Pro · Drag-and-Drop Industrial Site Builder",
    submitOk: "提交成功。",
    submitFail: "提交失败，请稍后再试。",
    noData: "暂无内容，请到后台添加。",
  },
  en: {
    navLayout: "Layout",
    navProducts: "Products",
    navArticles: "Articles",
    navContact: "Inquiry",
    adminEntry: "Admin",
    heroBadge: "Original implementation only (no 1:1 copying of third-party website assets/content)",
    heroTitle: "Industrial Website Builder: Drag-and-Drop Frontend + Admin CMS",
    heroSub: "Manage page blocks, products, and articles in admin. Frontend updates automatically from backend data.",
    heroCta1: "Open Admin",
    heroCta2: "Send Inquiry",
    layoutTitle: "Rendered Layout Blocks",
    productsTitle: "Products",
    articlesTitle: "Articles",
    leadTitle: "Send Inquiry",
    leadSub: "Leads can be stored and pushed to Email/WeCom webhook.",
    namePlaceholder: "Name / Company",
    emailPlaceholder: "Email",
    messagePlaceholder: "Tell us throughput, material, and market",
    consentText: "I agree to the privacy policy and consent to contact.",
    sendLead: "Submit",
    footer: "© 2026 CanPack Pro · Drag-and-Drop Industrial Site Builder",
    submitOk: "Submitted successfully.",
    submitFail: "Submission failed.",
    noData: "No data yet. Add content in admin.",
  },
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

function t(key) {
  const dict = translations[selectEl.value] || translations['zh-CN'];
  return dict[key] || translations.en[key] || key;
}

function applyLanguage(locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  const dict = translations[locale] || translations['zh-CN'];

  i18nNodes.forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = dict[key] || translations.en[key] || '';
  });

  i18nPlaceholders.forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    node.placeholder = dict[key] || translations.en[key] || '';
  });

  updateSeoMeta(locale);
  renderDynamic();
}

function updateSeoMeta(locale) {
  const isZh = locale === 'zh-CN';
  const title = isZh
    ? 'CanPack Pro | 工业包装设备建站系统'
    : 'CanPack Pro | Industrial Packaging Website Builder';
  const description = isZh
    ? '支持多语言、SEO与SEM投放追踪的工业营销站，含拖拽布局和后台CMS。'
    : 'Industrial marketing website with multilingual content, SEO metadata, and SEM attribution tracking.';

  document.title = title;

  const setMeta = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', value);
  };

  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', description);
}

function captureSemParams() {
  const params = new URLSearchParams(window.location.search);
  const semFields = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'fbclid',
  ];

  semFields.forEach((key) => {
    const fromUrl = params.get(key);
    if (fromUrl) {
      sessionStorage.setItem(key, fromUrl);
    }
  });

  const keywordFromQuery = params.get('keyword') || params.get('q') || '';
  if (keywordFromQuery) sessionStorage.setItem('keyword', keywordFromQuery);

  if (form) {
    semFields.concat(['keyword']).forEach((key) => {
      const input = form.querySelector(`input[name="${key}"]`);
      if (input) input.value = sessionStorage.getItem(key) || '';
    });

    const landingInput = form.querySelector('input[name="landing_page"]');
    if (landingInput) landingInput.value = window.location.href;

    const refInput = form.querySelector('input[name="referrer"]');
    if (refInput) refInput.value = document.referrer || '';
  }
}

function renderDynamic() {
  layoutRender.innerHTML = '';
  productRender.innerHTML = '';
  articleRender.innerHTML = '';

  if (!contentData.layout.length) {
    layoutRender.innerHTML = `<p class="section-sub">${t('noData')}</p>`;
  } else {
    contentData.layout.forEach((b) => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${b.title || ''}</h3><p>${b.body || ''}</p><small>${b.type || ''}</small>`;
      layoutRender.appendChild(el);
    });
  }

  if (!contentData.products.length) {
    productRender.innerHTML = `<p class="section-sub">${t('noData')}</p>`;
  } else {
    contentData.products.forEach((p) => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${p.name || ''}</h3><p>${p.summary || ''}</p><small>${p.category || ''}</small>`;
      productRender.appendChild(el);
    });
  }

  if (!contentData.articles.length) {
    articleRender.innerHTML = `<p class="section-sub">${t('noData')}</p>`;
  } else {
    contentData.articles.forEach((a) => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${a.title || ''}</h3><p>${a.excerpt || ''}</p><small>${a.status || ''}</small>`;
      articleRender.appendChild(el);
    });
  }
}

async function loadContent() {
  try {
    const res = await fetch('api/content.php');
    const json = await res.json();
    contentData = json.data || contentData;
  } catch (_e) {
    contentData = { layout: [], products: [], articles: [] };
  }
  renderDynamic();
}

selectEl.addEventListener('change', (e) => applyLanguage(e.target.value));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  resultEl.className = '';
  if (!form.reportValidity()) return;

  captureSemParams();
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch('api/lead.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error('submit failed');
    resultEl.textContent = t('submitOk');
    resultEl.classList.add('ok');
    form.reset();
    captureSemParams();
  } catch (_e) {
    resultEl.textContent = t('submitFail');
    resultEl.classList.add('error');
  }
});

captureSemParams();
loadContent();
applyLanguage('zh-CN');
