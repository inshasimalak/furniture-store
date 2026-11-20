/* =========================================================
   سِنديان — منطق المتجر (JavaScript خام بدون مكتبات)
   المحتويات:
   1) بيانات المنتجات والفئات
   2) أدوات مساعدة (تنسيق السعر، الصور البديلة، التخزين)
   3) عرض المنتجات والتصفية
   4) السلة الجانبية
   5) المعاينة السريعة
   6) إدارة النوافذ: فتح، إغلاق، حبس التركيز
   7) ربط الأحداث وبدء التشغيل
   ========================================================= */
'use strict';

/* ---------- 1) بيانات المنتجات ---------- */

// أسماء الفئات المعروضة. المفتاح يُستعمل في حقل category لكل منتج
const CATEGORIES = {
  living: 'غرف المعيشة',
  bedroom: 'غرف النوم',
  office: 'المكاتب',
  lighting: 'الإضاءة',
};

// يبني رابط صورة من Unsplash بالمقاس المطلوب (الصور مجانية الاستخدام)
// جودة 85 مع صيغة حديثة تلقائياً (WebP/AVIF) حسب دعم المتصفح
const photo = (id, width = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&q=85&auto=format&fit=crop`;

// srcset: يختار المتصفح المقاس المناسب لعرض الشاشة وكثافة البكسلات (شاشات Retina)
const photoSrcset = (id, widths) => widths.map((w) => `${photo(id, w)} ${w}w`).join(', ');

// العرض الفعلي للصورة في كل مقاس شاشة (يطابق أعمدة الشبكة في style.css)
const CARD_SIZES = '(min-width: 1240px) 280px, (min-width: 1000px) 31vw, (min-width: 560px) 48vw, 100vw';
const MODAL_SIZES = '(min-width: 768px) 460px, 100vw';

// مصفوفة المنتجات: أضف منتجاً جديداً بإضافة كائن بالشكل نفسه
const PRODUCTS = [
  {
    id: 1,
    name: 'أريكة «ربيع» المخملية',
    category: 'living',
    price: 1299,
    rating: 4.8,
    description: 'أريكة ثلاثية بقماش مخملي أخضر ناعم ووسائد محشوة بالريش، تضيف لمسة حيوية لغرفة المعيشة.',
    details: { dimensions: '210 × 90 × 85 سم', material: 'مخمل وخشب الزان', color: 'أخضر زيتي' },
    image: '1555041469-a586c61ea9bc',
    alt: 'أريكة ثلاثية بقماش مخملي أخضر وأرجل خشبية رفيعة',
  },
  {
    id: 2,
    name: 'أريكة «جلنار» الجلدية',
    category: 'living',
    price: 1899,
    rating: 4.6,
    description: 'أريكة بمقعدين من الجلد الطبيعي البني، بتصميم كلاسيكي يزداد جمالاً مع مرور الوقت.',
    details: { dimensions: '175 × 88 × 80 سم', material: 'جلد طبيعي وإطار خشبي', color: 'بني كونياك' },
    image: '1549187774-b4e9b0445b41',
    alt: 'أريكة بمقعدين من الجلد بلون الكونياك وأرجل معدنية سوداء',
  },
  {
    id: 3,
    name: 'كرسي «شمس» بذراعين',
    category: 'living',
    price: 549,
    rating: 4.7,
    description: 'كرسي مريح بإطار من خشب الجوز ومقعد أصفر دافئ، مثالي لركن القراءة.',
    details: { dimensions: '72 × 78 × 82 سم', material: 'خشب الجوز وقماش كتان', color: 'أصفر خردلي' },
    image: '1586023492125-27b2c045efd7',
    alt: 'كرسي بذراعين بإطار خشبي بني ومقعد أصفر',
  },
  {
    id: 4,
    name: 'سرير «سَكينة» المنجّد',
    category: 'bedroom',
    price: 1199,
    rating: 4.9,
    description: 'سرير مزدوج بلوح رأس منجّد بلون البيج، يمنح غرفة النوم إحساساً بالهدوء والدفء.',
    details: { dimensions: '180 × 200 سم', material: 'قماش مخملي وخشب صلب', color: 'بيج رملي' },
    image: '1560185128-e173042f79dd',
    alt: 'سرير مزدوج منجّد بلون البيج مع مرتبة بيضاء',
  },
  {
    id: 5,
    name: 'كومودينو «نُعاس»',
    category: 'bedroom',
    price: 249,
    rating: 4.5,
    description: 'طاولة جانبية بدرجين من الخشب الطبيعي، تتسع لمصباح وكتاب وكل ما تحتاجه قبل النوم.',
    details: { dimensions: '45 × 40 × 55 سم', material: 'خشب البلوط', color: 'بني طبيعي' },
    image: '1593194632872-3d19dab6e278',
    alt: 'كومودينو خشبي بني بدرجين',
  },
  {
    id: 6,
    name: 'خزانة أدراج «إرث»',
    category: 'bedroom',
    price: 899,
    rating: 4.4,
    description: 'خزانة منخفضة بستة أدراج واسعة بطراز منتصف القرن، تجمع بين التخزين والأناقة.',
    details: { dimensions: '150 × 45 × 78 سم', material: 'خشب الساج', color: 'بني عسلي' },
    image: '1579283111509-855c7eea1c49',
    alt: 'خزانة أدراج خشبية منخفضة بلون بني دافئ',
  },
  {
    id: 7,
    name: 'مكتب «تركيز» الخشبي',
    category: 'office',
    price: 649,
    rating: 4.7,
    description: 'مكتب بسيط بسطح واسع من الخشب الطبيعي، يمنحك مساحة عمل هادئة ومرتبة.',
    details: { dimensions: '140 × 70 × 75 سم', material: 'خشب البلوط ومعدن', color: 'خشبي فاتح' },
    image: '1784012980517-005c26585344',
    alt: 'مكتب خشبي بسيط بجانب نافذة مع نبتة خضراء',
  },
  {
    id: 8,
    name: 'كرسي مكتب «مرونة»',
    category: 'office',
    price: 329,
    rating: 4.3,
    description: 'كرسي مكتب منجّد بمسند ظهر مريح وقاعدة دوّارة، مناسب لساعات العمل الطويلة.',
    details: { dimensions: '60 × 60 × 95 سم', material: 'قماش منسوج وقاعدة معدنية', color: 'رمادي وأبيض' },
    image: '1598300042247-d088f8ab3a91',
    alt: 'كرسي مكتب منجّد باللونين الرمادي والأبيض',
  },
  {
    id: 9,
    name: 'مكتبة «حكايا» الحائطية',
    category: 'office',
    price: 399,
    rating: 4.6,
    description: 'رفوف كتب خشبية متينة بخمسة مستويات، تحوّل ركن العمل إلى مكتبة شخصية.',
    details: { dimensions: '120 × 35 × 200 سم', material: 'خشب الصنوبر المعالج', color: 'بني دافئ' },
    image: '1594620302200-9a762244a156',
    alt: 'رفوف كتب خشبية بنية مليئة بالكتب بجانب نافذة',
  },
  {
    id: 10,
    name: 'مصباح أرضي «منارة»',
    category: 'lighting',
    price: 179,
    rating: 4.5,
    description: 'مصباح أرضي بذراع معدني وغطاء برتقالي، يوزّع ضوءاً دافئاً في زاوية الجلوس.',
    details: { dimensions: 'ارتفاع 160 سم', material: 'معدن مطلي', color: 'برتقالي وأسود' },
    image: '1621177555630-b861919c864f',
    alt: 'مصباح أرضي بغطاء برتقالي وقاعدة سوداء',
  },
  {
    id: 11,
    name: 'ثريا «قمر» المعلّقة',
    category: 'lighting',
    price: 129,
    rating: 4.2,
    description: 'مصباح معلّق أبيض بتصميم بسيط، يناسب طاولات الطعام والمطابخ المفتوحة.',
    details: { dimensions: 'قطر 35 سم', material: 'ألمنيوم مطلي', color: 'أبيض مطفي' },
    image: '1513506003901-1e6a229e2d15',
    alt: 'مصباح معلّق أبيض يتدلى من السقف',
  },
  {
    id: 12,
    name: 'مصباح طاولة «دفء»',
    category: 'lighting',
    price: 89,
    rating: 4.8,
    description: 'مصباح طاولة بقاعدة خشبية وغطاء قماشي أبيض، يضفي إضاءة ناعمة على الكومودينو أو المكتب.',
    details: { dimensions: '30 × 30 × 48 سم', material: 'خشب وقماش كتان', color: 'بني وأبيض' },
    image: '1517991104123-1d56a6e81ed9',
    alt: 'مصباح طاولة بقاعدة بنية وغطاء أبيض مضاء',
  },
];

/* ---------- 2) أدوات مساعدة ---------- */

const STORAGE_KEY = 'sindian-cart-v1';

// تنسيق الأسعار بالدولار الأمريكي بالصيغة الرسمية: $1,299.00
// الأسعار تقديرية بحسب متوسط أسعار التجزئة في السوق الأمريكي لقطع مماثلة
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});
const formatPrice = (value) => priceFormatter.format(value);
const formatNumber = (value) => new Intl.NumberFormat('ar-SA').format(value);

// صياغة عدد المنتجات بالعربية الصحيحة (منتج، منتجان، منتجات، منتجاً)
function productsLabel(n) {
  if (n === 0) return 'لا منتجات';
  if (n === 1) return 'منتج واحد';
  if (n === 2) return 'منتجان';
  if (n <= 10) return `${formatNumber(n)} منتجات`;
  return `${formatNumber(n)} منتجاً`;
}

// اختصار للبحث عن عنصر
const $ = (selector, root = document) => root.querySelector(selector);

// إيجاد منتج من رقمه
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

// صورة بديلة مضمّنة (SVG) تظهر إذا تعذّر تحميل الصورة الحقيقية، مثلاً بدون إنترنت
const FALLBACK_ICONS = {
  living: '<rect x="70" y="120" width="260" height="70" rx="18"/><rect x="50" y="100" width="50" height="90" rx="16"/><rect x="300" y="100" width="50" height="90" rx="16"/><rect x="90" y="80" width="220" height="50" rx="14" opacity=".7"/>',
  bedroom: '<rect x="60" y="90" width="40" height="110" rx="8"/><rect x="60" y="140" width="280" height="50" rx="10"/><rect x="110" y="120" width="70" height="26" rx="10" opacity=".7"/>',
  office: '<rect x="60" y="100" width="280" height="18" rx="6"/><rect x="80" y="118" width="14" height="80"/><rect x="306" y="118" width="14" height="80"/><rect x="180" y="60" width="90" height="40" rx="6" opacity=".7"/>',
  lighting: '<path d="M160 70h80l30 70H130z"/><rect x="194" y="140" width="12" height="50"/><rect x="160" y="188" width="80" height="12" rx="6"/>',
};

function fallbackImage(category) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#f1e8dc"/>
    <g fill="#c9a98a">${FALLBACK_ICONS[category] || FALLBACK_ICONS.living}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// يربط صورة بالصورة البديلة مرة واحدة فقط لتجنّب حلقة أخطاء
function attachFallback(img, category) {
  img.addEventListener('error', () => {
    if (img.dataset.fellBack) return;
    img.dataset.fellBack = 'true';
    img.removeAttribute('srcset');
    img.src = fallbackImage(category);
  }, { once: true });
  // إذا فشلت الصورة قبل ربط المستمع (مثل صورة القسم الافتتاحي)
  if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
    img.dispatchEvent(new Event('error'));
  }
}

// قراءة وكتابة localStorage داخل try/catch (قد يكون معطّلاً في التصفح الخاص)
function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // نحتفظ فقط بالعناصر الصالحة والموجودة في قائمة المنتجات
    return parsed
      .filter((item) => item && findProduct(item.id) && Number.isInteger(item.qty) && item.qty > 0)
      .map((item) => ({ id: item.id, qty: Math.min(item.qty, 99) }));
  } catch (error) {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  } catch (error) {
    // التخزين غير متاح: تستمر السلة بالعمل خلال الجلسة الحالية فقط
  }
}

// يرسم نجوم التقييم مع وصف نصي لقارئات الشاشة
function ratingMarkup(rating) {
  const label = `التقييم ${formatNumber(rating)} من ٥`;
  return `<span class="rating">
      <span class="stars" style="--rating:${rating}" role="img" aria-label="${label}">
        <span class="stars__fill" aria-hidden="true"></span>
      </span>
      <span aria-hidden="true">${formatNumber(rating)}</span>
    </span>`;
}

/* ---------- حالة التطبيق ---------- */
const state = {
  filter: 'all',     // الفئة المختارة حالياً
  cart: loadCart(),  // [{ id, qty }]
};

/* ---------- 3) عرض المنتجات والتصفية ---------- */

const grid = $('#productGrid');
const filtersEl = $('#filters');
const resultsCount = $('#resultsCount');

// إنشاء أزرار التصفية: "الكل" ثم زر لكل فئة
function renderFilters() {
  const entries = [['all', 'الكل'], ...Object.entries(CATEGORIES)];
  filtersEl.innerHTML = entries.map(([key, label]) => {
    const count = key === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === key).length;
    return `<button type="button" class="filter-btn" data-filter="${key}"
              aria-pressed="${key === state.filter}">
              ${label}<span class="filter-btn__count" aria-hidden="true">(${formatNumber(count)})</span>
            </button>`;
  }).join('');
}

// بطاقة منتج واحدة
function productCard(product) {
  const category = CATEGORIES[product.category];
  return `<li>
    <article class="card" aria-labelledby="p${product.id}-title">
      <button type="button" class="card__media" data-quick-view="${product.id}"
              aria-label="معاينة سريعة: ${product.name}">
        <img src="${photo(product.image)}" srcset="${photoSrcset(product.image, [400, 600, 800, 1200])}"
             sizes="${CARD_SIZES}" alt="${product.alt}" width="800" height="600"
             loading="lazy" decoding="async" data-category="${product.category}">
        <span class="card__peek" aria-hidden="true">معاينة سريعة</span>
      </button>
      <div class="card__body">
        <p class="card__category">${category}</p>
        <h3 class="card__title" id="p${product.id}-title">
          <button type="button" data-quick-view="${product.id}">${product.name}</button>
        </h3>
        ${ratingMarkup(product.rating)}
        <div class="card__foot">
          <p class="price">${formatPrice(product.price)}</p>
          <button type="button" class="btn btn--primary" data-add="${product.id}"
                  aria-label="أضف ${product.name} إلى السلة">أضف إلى السلة</button>
        </div>
      </div>
    </article>
  </li>`;
}

// عرض المنتجات حسب الفئة المختارة
function renderProducts() {
  const list = state.filter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === state.filter);

  grid.innerHTML = list.map(productCard).join('');
  grid.querySelectorAll('img').forEach((img) => attachFallback(img, img.dataset.category));

  const label = state.filter === 'all' ? 'كل الفئات' : CATEGORIES[state.filter];
  resultsCount.textContent = `${productsLabel(list.length)} في ${label}`;
}

// تغيير الفئة: تحديث aria-pressed ثم إعادة رسم الشبكة بدون إعادة تحميل
function setFilter(key) {
  if (key === state.filter) return;
  state.filter = key;
  filtersEl.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.filter === key));
  });
  renderProducts();
}

/* ---------- 4) السلة الجانبية ---------- */

const cartDrawer = $('#cartDrawer');
const cartItemsEl = $('#cartItems');
const cartEmptyEl = $('#cartEmpty');
const cartTotalEl = $('#cartTotal');
const cartCountEl = $('#cartCount');
const cartToggle = $('#cartToggle');
const checkoutBtn = $('#checkoutBtn');

const cartQuantity = () => state.cart.reduce((sum, item) => sum + item.qty, 0);
const cartTotal = () => state.cart.reduce((sum, item) => sum + findProduct(item.id).price * item.qty, 0);

function addToCart(id) {
  const existing = state.cart.find((item) => item.id === id);
  if (existing) existing.qty = Math.min(existing.qty + 1, 99);
  else state.cart.push({ id, qty: 1 });
  commitCart();
  showToast(`تمت إضافة ${findProduct(id).name} إلى السلة`);
}

// تغيير الكمية بمقدار (+1 أو -1). الوصول إلى صفر يحذف المنتج
function changeQty(id, delta) {
  const item = state.cart.find((entry) => entry.id === id);
  if (!item) return;
  item.qty = Math.min(item.qty + delta, 99);
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  commitCart();
  // إبقاء التركيز على زر الكمية نفسه بعد إعادة الرسم
  const selector = `[data-qty="${delta > 0 ? 'inc' : 'dec'}"][data-id="${id}"]`;
  $(selector, cartItemsEl)?.focus();
}

function removeFromCart(id) {
  const index = state.cart.findIndex((entry) => entry.id === id);
  if (index === -1) return;
  const name = findProduct(id).name;
  state.cart.splice(index, 1);
  commitCart();
  showToast(`تم حذف ${name} من السلة`);
  // نقل التركيز إلى عنصر منطقي حتى لا يضيع بعد حذف الزر
  const buttons = cartItemsEl.querySelectorAll('.remove-btn');
  (buttons[Math.min(index, buttons.length - 1)] || $('[data-close="cart"]', cartDrawer)).focus();
}

// حفظ السلة ثم تحديث الواجهة
function commitCart() {
  saveCart();
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = state.cart.map(({ id, qty }) => {
    const product = findProduct(id);
    return `<li class="cart-item">
      <img src="${photo(product.image, 160)}" srcset="${photo(product.image, 160)} 1x, ${photo(product.image, 240)} 1.5x, ${photo(product.image, 320)} 2x" alt="${product.alt}" width="76" height="76" data-category="${product.category}">
      <div>
        <p class="cart-item__name">${product.name}</p>
        <p class="cart-item__unit">${formatPrice(product.price)} للقطعة</p>
        <div class="cart-item__row">
          <div class="qty" role="group" aria-label="كمية ${product.name}">
            <button type="button" data-qty="inc" data-id="${id}" aria-label="زيادة كمية ${product.name}">+</button>
            <output aria-live="polite">${formatNumber(qty)}</output>
            <button type="button" data-qty="dec" data-id="${id}" aria-label="تقليل كمية ${product.name}">−</button>
          </div>
          <span class="cart-item__subtotal">${formatPrice(product.price * qty)}</span>
        </div>
        <button type="button" class="remove-btn" data-remove="${id}" aria-label="حذف ${product.name} من السلة">حذف</button>
      </div>
    </li>`;
  }).join('');
  cartItemsEl.querySelectorAll('img').forEach((img) => attachFallback(img, img.dataset.category));

  const count = cartQuantity();
  cartEmptyEl.hidden = count > 0;
  cartTotalEl.textContent = formatPrice(cartTotal());
  checkoutBtn.disabled = count === 0;

  // تحديث العدّاد على أيقونة السلة مع حركة صغيرة
  if (cartCountEl.textContent !== String(count)) {
    cartCountEl.textContent = String(count);
    cartCountEl.classList.remove('is-bumped');
    void cartCountEl.offsetWidth; // إعادة تشغيل الحركة
    cartCountEl.classList.add('is-bumped');
  }
  cartToggle.setAttribute('aria-label', `فتح السلة، فيها ${productsLabel(count)}`);
}

/* ---------- 5) المعاينة السريعة ---------- */

const quickView = $('#quickView');
let quickViewProductId = null;

function openQuickView(id, trigger) {
  const product = findProduct(id);
  if (!product) return;
  quickViewProductId = id;

  const img = $('#qvImage');
  delete img.dataset.fellBack;
  attachFallback(img, product.category);
  img.sizes = MODAL_SIZES;
  img.srcset = photoSrcset(product.image, [600, 900, 1200, 1600]);
  img.src = photo(product.image, 1200);
  img.alt = product.alt;

  $('#qvCategory').textContent = CATEGORIES[product.category];
  $('#qvTitle').textContent = product.name;
  $('#qvRating').innerHTML = ratingMarkup(product.rating);
  $('#qvPrice').textContent = formatPrice(product.price);
  $('#qvDesc').textContent = product.description;
  $('#qvDetails').innerHTML = `
    <dt>الأبعاد</dt><dd>${product.details.dimensions}</dd>
    <dt>الخامة</dt><dd>${product.details.material}</dd>
    <dt>اللون</dt><dd>${product.details.color}</dd>`;
  $('#qvAdd').setAttribute('aria-label', `أضف ${product.name} إلى السلة`);

  openPanel(quickView, trigger);
}

/* ---------- 6) إدارة النوافذ: فتح وإغلاق وحبس التركيز ---------- */

const backdrop = $('#backdrop');
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// النافذة المفتوحة حالياً والعنصر الذي فتحها (لإعادة التركيز إليه)
let activePanel = null;
let returnFocusTo = null;

function openPanel(panel, trigger) {
  // عند الانتقال من نافذة لأخرى نحتفظ بأول عنصر فتحها لنعيد التركيز إليه لاحقاً
  const switching = activePanel && activePanel !== panel;
  if (switching) closePanel({ restoreFocus: false });
  else if (!activePanel) returnFocusTo = trigger || document.activeElement;
  activePanel = panel;

  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add('is-visible'));
  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  if (panel === cartDrawer) cartToggle.setAttribute('aria-expanded', 'true');

  // نقل التركيز إلى أول عنصر قابل للتركيز داخل النافذة
  const first = panel.querySelector(FOCUSABLE);
  (first || panel).focus({ preventScroll: true });
}

function closePanel({ restoreFocus = true } = {}) {
  if (!activePanel) return;
  const panel = activePanel;
  activePanel = null;

  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  if (panel === cartDrawer) cartToggle.setAttribute('aria-expanded', 'false');

  if (restoreFocus) {
    backdrop.classList.remove('is-visible');
    backdrop.hidden = true;
    document.body.classList.remove('is-locked');
    // إذا اختفى العنصر الأصلي (مثلاً بعد تغيير الفئة) نعيد التركيز لزر السلة
    const target = returnFocusTo && document.contains(returnFocusTo) ? returnFocusTo : cartToggle;
    target.focus({ preventScroll: true });
    returnFocusTo = null;
  }
}

// حبس التركيز: Tab وShift+Tab يدوران داخل النافذة المفتوحة فقط
function trapFocus(event) {
  const focusables = [...activePanel.querySelectorAll(FOCUSABLE)]
    .filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (focusables.length === 0) {
    event.preventDefault();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && (document.activeElement === first || document.activeElement === activePanel)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (!activePanel.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}

/* ---------- الإشعار المنبثق ---------- */
const toast = $('#toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

/* ---------- 7) ربط الأحداث ---------- */

// التصفية
filtersEl.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-filter]');
  if (btn) setFilter(btn.dataset.filter);
});

// أزرار البطاقات: المعاينة السريعة والإضافة إلى السلة (تفويض الأحداث)
grid.addEventListener('click', (event) => {
  const addBtn = event.target.closest('[data-add]');
  if (addBtn) {
    addToCart(Number(addBtn.dataset.add));
    openPanel(cartDrawer, addBtn);
    return;
  }
  const viewBtn = event.target.closest('[data-quick-view]');
  if (viewBtn) openQuickView(Number(viewBtn.dataset.quickView), viewBtn);
});

// زر الإضافة داخل المعاينة: يضيف ثم ينتقل إلى السلة
$('#qvAdd').addEventListener('click', () => {
  if (quickViewProductId == null) return;
  addToCart(quickViewProductId);
  openPanel(cartDrawer);
});

// أزرار الكمية والحذف داخل السلة
cartItemsEl.addEventListener('click', (event) => {
  const qtyBtn = event.target.closest('[data-qty]');
  if (qtyBtn) {
    changeQty(Number(qtyBtn.dataset.id), qtyBtn.dataset.qty === 'inc' ? 1 : -1);
    return;
  }
  const removeBtn = event.target.closest('[data-remove]');
  if (removeBtn) removeFromCart(Number(removeBtn.dataset.remove));
});

cartToggle.addEventListener('click', () => openPanel(cartDrawer, cartToggle));

// أزرار الإغلاق
document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closePanel());
});

// الإغلاق بالضغط خارج النافذة (على الخلفية المعتمة أو الفراغ حول المعاينة)
backdrop.addEventListener('click', () => closePanel());
quickView.addEventListener('click', (event) => {
  if (event.target === quickView) closePanel();
});

// لوحة المفاتيح: Esc يغلق، وTab يبقى داخل النافذة
document.addEventListener('keydown', (event) => {
  if (!activePanel) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closePanel();
  } else if (event.key === 'Tab') {
    trapFocus(event);
  }
});

checkoutBtn.addEventListener('click', () => {
  showToast('هذا متجر تجريبي — شكراً لتجربتك!');
});

// صورة القسم الافتتاحي: صورة بديلة عند تعذّر التحميل
document.querySelectorAll('img[data-fallback]').forEach((img) => attachFallback(img, img.dataset.fallback));

/* ---------- بدء التشغيل ---------- */
renderFilters();
renderProducts();
renderCart();
