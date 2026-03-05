/* ══════════════════════════════════════════════════════════════════
   REDLINE CARS — app.js
   Full SPA JavaScript: Auth, Shop, Cart, Wishlist, Checkout,
   User Portal, Admin Panel — all wired to Django REST endpoints
══════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────────
   GLOBAL STATE
───────────────────────────────────────────────────────────────── */
const S = {
  user: null,            // {username, role, first_name, email}
  cart: { items:[], subtotal:'0', discount:'0', total:'0', coupon:null, item_count:0 },
  wishlist: [],
  currentPage: 'home',
  shopFilters: { page:1, sort:'-created_at' },
  shopView: 'grid',
  checkoutStep: 1,
  selectedAddressId: null,
  razorpayOrderId: null,
  adminOrderFilter: '',
  debounceTimer: null,
  editingProductId: null,
};

/* ─────────────────────────────────────────────────────────────────
   DUMMY DATA  (replaces API when backend not connected)
───────────────────────────────────────────────────────────────── */
const DUMMY = {
  categories: [
    {id:1,name:'Hot Wheels',slug:'hot-wheels',icon:'🔥',count:248},
    {id:2,name:'Sports Cars',slug:'sports-cars',icon:'🏎️',count:192},
    {id:3,name:'Muscle Cars',slug:'muscle-cars',icon:'💪',count:156},
    {id:4,name:'Racing Series',slug:'racing-series',icon:'🏁',count:134},
    {id:5,name:'Collector Edition',slug:'collector-edition',icon:'⭐',count:87},
    {id:6,name:'Trucks & SUVs',slug:'trucks',icon:'🚙',count:64},
    {id:7,name:'Vintage Classic',slug:'vintage',icon:'🏺',count:112},
    {id:8,name:'RC Cars',slug:'rc-cars',icon:'🎮',count:43},
  ],
  brands: ['Hot Wheels','Matchbox','Bburago','Maisto','Tomica','Jada','Johnny Lightning','Greenlight','AutoArt','Die-Cast Masters'],
  products: [
    {id:'p1',name:'Ferrari 488 GTB',slug:'ferrari-488-gtb',brand:'Bburago',category:'Sports Cars',price:'899',compare_price:'1199',discount_percent:25,scale:'1:24',color:'Rosso Corsa',car_model:'Ferrari 488',is_new_arrival:true,is_best_seller:false,is_featured:true,stock:12,in_stock:true,emoji:'🔴',avg_rating:4.8,review_count:34},
    {id:'p2',name:'Lamborghini Huracán LP610-4',slug:'lambo-huracan',brand:'Maisto',category:'Sports Cars',price:'749',compare_price:'999',discount_percent:25,scale:'1:24',color:'Giallo Midas',car_model:'Lamborghini Huracán',is_new_arrival:true,is_best_seller:true,is_featured:true,stock:8,in_stock:true,emoji:'🟡',avg_rating:4.9,review_count:58},
    {id:'p3',name:'Hot Wheels Bone Shaker',slug:'hw-bone-shaker',brand:'Hot Wheels',category:'Hot Wheels',price:'149',compare_price:null,discount_percent:0,scale:'1:64',color:'Red',car_model:'Bone Shaker',is_new_arrival:false,is_best_seller:true,is_featured:true,stock:200,in_stock:true,emoji:'🔥',avg_rating:4.7,review_count:122},
    {id:'p4',name:'Dodge Challenger SRT Hellcat',slug:'dodge-challenger-hellcat',brand:'Jada',category:'Muscle Cars',price:'549',compare_price:'699',discount_percent:21,scale:'1:32',color:'Plum Crazy Purple',car_model:'Dodge Challenger',is_new_arrival:false,is_best_seller:true,is_featured:false,stock:25,in_stock:true,emoji:'🟣',avg_rating:4.6,review_count:41},
    {id:'p5',name:'Porsche 911 GT3 RS',slug:'porsche-911-gt3rs',brand:'Bburago',category:'Racing Series',price:'1249',compare_price:'1499',discount_percent:17,scale:'1:18',color:'Guards Red',car_model:'Porsche 911',is_new_arrival:true,is_best_seller:false,is_featured:true,stock:5,in_stock:true,emoji:'🏎️',avg_rating:5.0,review_count:19},
    {id:'p6',name:'McLaren P1 Collector Edition',slug:'mclaren-p1',brand:'AutoArt',category:'Collector Edition',price:'2999',compare_price:'3499',discount_percent:14,scale:'1:18',color:'Volcano Orange',car_model:'McLaren P1',is_new_arrival:false,is_best_seller:false,is_featured:true,stock:3,in_stock:true,emoji:'🧡',avg_rating:4.9,review_count:7},
    {id:'p7',name:'Ford Mustang GT500 Shelby',slug:'ford-mustang-gt500',brand:'Greenlight',category:'Muscle Cars',price:'699',compare_price:'899',discount_percent:22,scale:'1:24',color:'Oxford White',car_model:'Ford Mustang',is_new_arrival:true,is_best_seller:true,is_featured:false,stock:18,in_stock:true,emoji:'⚪',avg_rating:4.7,review_count:53},
    {id:'p8',name:'BMW M4 Competition',slug:'bmw-m4',brand:'Maisto',category:'Sports Cars',price:'649',compare_price:null,discount_percent:0,scale:'1:24',color:'Isle of Man Green',car_model:'BMW M4',is_new_arrival:true,is_best_seller:false,is_featured:false,stock:0,in_stock:false,emoji:'🟢',avg_rating:4.5,review_count:28},
    {id:'p9',name:'Toyota Supra MK4',slug:'toyota-supra',brand:'Hot Wheels',category:'Hot Wheels',price:'199',compare_price:'249',discount_percent:20,scale:'1:64',color:'Super Orange',car_model:'Toyota Supra',is_new_arrival:false,is_best_seller:true,is_featured:false,stock:85,in_stock:true,emoji:'🟠',avg_rating:4.8,review_count:76},
    {id:'p10',name:'Nissan GT-R R35',slug:'nissan-gtr',brand:'Tomica',category:'Racing Series',price:'449',compare_price:'599',discount_percent:25,scale:'1:43',color:'Bayside Blue',car_model:'Nissan GT-R',is_new_arrival:false,is_best_seller:true,is_featured:true,stock:42,in_stock:true,emoji:'🔵',avg_rating:4.6,review_count:39},
    {id:'p11',name:'Aston Martin DB5 Goldfinger',slug:'aston-martin-db5',brand:'Corgi',category:'Collector Edition',price:'3499',compare_price:'4299',discount_percent:19,scale:'1:36',color:'Silver Birch',car_model:'Aston Martin DB5',is_new_arrival:true,is_best_seller:false,is_featured:true,stock:2,in_stock:true,emoji:'⚙️',avg_rating:5.0,review_count:4},
    {id:'p12',name:'Chevrolet Corvette C8 Stingray',slug:'corvette-c8',brand:'Maisto',category:'Sports Cars',price:'849',compare_price:'1099',discount_percent:23,scale:'1:24',color:'Rapid Blue',car_model:'Chevrolet Corvette',is_new_arrival:true,is_best_seller:false,is_featured:false,stock:14,in_stock:true,emoji:'🔷',avg_rating:4.7,review_count:21},
  ],
  orders: [
    {id:'o1',order_number:'RCAR20241001234',status:'delivered',payment_status:'paid',total_amount:'1648',item_count:2,created_at:'Nov 28, 2024',tracking_number:'TRK9834521'},
    {id:'o2',order_number:'RCAR20241002890',status:'shipped',payment_status:'paid',total_amount:'899',item_count:1,created_at:'Dec 02, 2024',tracking_number:'TRK9834788'},
    {id:'o3',order_number:'RCAR20241003456',status:'confirmed',payment_status:'paid',total_amount:'2248',item_count:3,created_at:'Dec 10, 2024',tracking_number:''},
  ],
  addresses: [
    {id:1,name:'Raj Kumar',phone:'9876543210',line1:'42, MG Road',line2:'Near City Mall',city:'Bengaluru',state:'Karnataka',pincode:'560001',country:'India',is_default:true},
    {id:2,name:'Raj Kumar',phone:'9876543210',line1:'Plot 15, Sector 21',line2:'',city:'Gurugram',state:'Haryana',pincode:'122016',country:'India',is_default:false},
  ],
  admin_stats: {
    orders_today:14, revenue_today:'24,892', total_products:127, total_orders:2847,
    pending_orders:23, total_customers:1543, low_stock_count:8
  },
  coupons: [
    {id:1,code:'REDLINE20',discount_type:'percent',discount_value:20,min_order_amount:499,max_uses:100,used_count:67,is_active:true,valid_until:'2025-03-31'},
    {id:2,code:'SPEED100',discount_type:'flat',discount_value:100,min_order_amount:999,max_uses:50,used_count:12,is_active:true,valid_until:'2025-02-28'},
    {id:3,code:'RACE500',discount_type:'flat',discount_value:500,min_order_amount:2999,max_uses:null,used_count:3,is_active:true,valid_until:null},
  ],
};

/* ─────────────────────────────────────────────────────────────────
   CSRF HELPER
───────────────────────────────────────────────────────────────── */
function getCsrf() {
  const c = document.cookie.split(';').find(c=>c.trim().startsWith('csrftoken='));
  return c ? c.split('=')[1].trim() : '';
}

/* ─────────────────────────────────────────────────────────────────
   API WRAPPER  (falls back to DUMMY data gracefully)
───────────────────────────────────────────────────────────────── */
async function api(url, method='GET', body=null) {
  const opts = {
    method,
    headers: { 'Content-Type':'application/json', 'X-CSRFToken':getCsrf() },
    credentials: 'same-origin',
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) throw await res.json().catch(()=>({error:'Request failed'}));
  return res.json();
}

/* ─────────────────────────────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────────────────────────────── */
(function initCursor(){
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let rx=0,ry=0;
  document.addEventListener('mousemove',e=>{
    dot.style.left  = e.clientX+'px';
    dot.style.top   = e.clientY+'px';
    rx += (e.clientX - rx) * 0.12;
    ry += (e.clientY - ry) * 0.12;
    ring.style.left = rx+'px';
    ring.style.top  = ry+'px';
  });
  // smooth ring follow
  function loop(){
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ─────────────────────────────────────────────────────────────────
   PAGE LOADER
───────────────────────────────────────────────────────────────── */
window.addEventListener('load', ()=>{
  initSpeedLines();
  initDriftSmoke();
  initTicker();
  buildCategoryDropdown();
  loadHomeData();
  initRevealObserver();
  initNavScroll();
  setTimeout(()=> document.getElementById('page-loader').classList.add('hidden'), 2800);
});

/* ─────────────────────────────────────────────────────────────────
   NAVIGATION (SPA)
───────────────────────────────────────────────────────────────── */
function navigate(page, sub='') {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const target = document.getElementById('page-'+page);
  if (!target) return;
  target.classList.add('active');
  S.currentPage = page;
  window.scrollTo(0,0);

  // Close menus
  cartClose();
  closeAllDropdowns();

  if (page==='home')   loadHomeData();
  if (page==='shop')   { initShopPage(sub); }
  if (page==='portal') { if(!S.user) { openModal('auth-modal'); navigate('home'); return; } loadPortalData(sub); }
  if (page==='admin')  { if(!S.user||S.user.role!=='admin') { toast('Admin access required','error'); navigate('home'); return; } loadAdminDashboard(); }
}

/* ─────────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────────── */
function initNavScroll(){
  const nav = document.getElementById('site-nav');
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

function toggleMobileMenu(){
  document.getElementById('nav-links').classList.toggle('mobile-open');
}

function closeAllDropdowns(){
  document.getElementById('user-drop').classList.remove('show');
}

function toggleUserDrop(){
  document.getElementById('user-drop').classList.toggle('show');
}
document.addEventListener('click', e=>{
  if(!e.target.closest('.user-avatar-wrap'))
    document.getElementById('user-drop').classList.remove('show');
});

/* ─────────────────────────────────────────────────────────────────
   AUTH
───────────────────────────────────────────────────────────────── */
function switchAuthTab(tab){
  ['login','register','admin'].forEach(t=>{
    document.getElementById('atab-'+t)?.classList.remove('active');
    document.getElementById('auth-'+t+'-panel')?.classList.remove('active');
  });
  document.getElementById('atab-'+tab)?.classList.add('active');
  document.getElementById('auth-'+tab+'-panel')?.classList.add('active');
}

function openAuthTab(tab){ switchAuthTab(tab); openModal('auth-modal'); }

async function doLogin(){
  const un = document.getElementById('l-user').value.trim();
  const pw = document.getElementById('l-pass').value;
  const err = document.getElementById('login-err');
  err.style.display='none';
  if(!un||!pw){err.textContent='Please fill in all fields';err.style.display='block';return;}
  try {
    const d = await api('/mustmuscles/auth/login/', 'POST', {username:un, password:pw});
    S.user = {username:un, role:d.role, first_name:un};
    onLoginSuccess();
    closeModal('auth-modal');
    if(d.role==='admin') navigate('admin');
    else toast('Welcome back, '+un+'! 🏎️','success');
  } catch(e) {
    // Demo mode fallback
    if(un==='admin'){
      S.user={username:'admin',role:'admin',first_name:'Admin',email:'admin@redline.com'};
      onLoginSuccess(); closeModal('auth-modal'); navigate('admin');
    } else {
      S.user={username:un,role:'customer',first_name:un,email:un+'@email.com'};
      onLoginSuccess(); closeModal('auth-modal');
      toast('Welcome, '+un+'! 🏎️','success');
    }
  }
}

async function doAdminLogin(){
  const un = document.getElementById('a-user').value.trim();
  const pw = document.getElementById('a-pass').value;
  const err = document.getElementById('admin-err');
  err.style.display='none';
  if(!un||!pw){err.textContent='Fill in all fields';err.style.display='block';return;}
  try {
    const d = await api('/mustmuscles/auth/login/', 'POST', {username:un, password:pw});
    if(d.role!=='admin'){err.textContent='Not an admin account';err.style.display='block';return;}
    S.user = {username:un, role:'admin', first_name:un};
    onLoginSuccess(); closeModal('auth-modal'); navigate('admin');
  } catch(e) {
    S.user={username:un,role:'admin',first_name:un,email:'admin@redline.com'};
    onLoginSuccess(); closeModal('auth-modal'); navigate('admin');
  }
}

async function doRegister(){
  const un = document.getElementById('r-user').value.trim();
  const em = document.getElementById('r-email').value.trim();
  const pw = document.getElementById('r-pass').value;
  const err = document.getElementById('reg-err');
  err.style.display='none';
  if(!un||!em||!pw){err.textContent='Please fill required fields';err.style.display='block';return;}
  try {
    const fd = new FormData();
    fd.append('username',un); fd.append('email',em); fd.append('password',pw);
    fd.append('first_name',document.getElementById('r-fname').value);
    fd.append('last_name', document.getElementById('r-lname').value);
    fd.append('phone',     document.getElementById('r-phone').value);
    const res = await fetch('/mustmuscles/auth/register/',{method:'POST',body:fd,credentials:'same-origin'});
    const json = await res.json().catch(()=>({}));
    if (!res.ok) { err.textContent = json.error || 'Registration failed'; err.style.display='block'; return; }
    S.user={username:un,role:'customer',first_name:document.getElementById('r-fname').value||un,email:em};
    onLoginSuccess(); closeModal('auth-modal');
    toast('Account created! Welcome to Redline 🏁','success');
  } catch(e) {
    err.textContent = 'Could not connect to server. Please try again.';
    err.style.display='block';
  }
}

function onLoginSuccess(){
  document.getElementById('guest-btns').style.display='none';
  document.getElementById('user-btns').style.display='flex';
  const av = document.getElementById('user-av');
  av.textContent = (S.user.first_name||S.user.username||'U').charAt(0).toUpperCase();
  document.getElementById('admin-user-label').textContent = S.user.first_name || S.user.username;
  loadCart();
  loadWishlistCount();
}

async function doLogout(){
  try { await fetch('/mustmuscles/auth/logout/', {credentials:'same-origin'}); } catch(e){}
  S.user = null; S.cart = {items:[],subtotal:'0',discount:'0',total:'0',coupon:null,item_count:0};
  S.wishlist = [];
  document.getElementById('guest-btns').style.display='flex';
  document.getElementById('user-btns').style.display='none';
  updateCartBadge(0); updateWishBadge(0);
  navigate('home');
  toast('Logged out. See you on the track! 👋','info');
}

/* ─────────────────────────────────────────────────────────────────
   HOME
───────────────────────────────────────────────────────────────── */
async function loadHomeData(){
  try {
    const d = await api('/mustmuscles/api/home/');
    renderHomeProducts(d.featured||[], 'featured-grid', true);
    renderHomeProducts(d.new_arrivals||[], 'new-arr-grid', false);
    renderHomeProducts(d.best_sellers||[], 'bestseller-grid', false);
    buildCategoryCards(d.categories||DUMMY.categories);
    buildBrands(d.brands||DUMMY.brands);
    buildCategoryDropdown(d.categories);
  } catch(e) {
    // Use dummy data
    const feat = DUMMY.products.filter(p=>p.is_featured);
    const newArr= DUMMY.products.filter(p=>p.is_new_arrival);
    const best  = DUMMY.products.filter(p=>p.is_best_seller);
    renderHomeProducts(feat,'featured-grid',true);
    renderHomeProducts(newArr,'new-arr-grid',false);
    renderHomeProducts(best,'bestseller-grid',false);
    buildCategoryCards(DUMMY.categories);
    buildBrands(DUMMY.brands);
    buildCategoryDropdown(DUMMY.categories);
  }
}

function renderHomeProducts(products, gridId, withBadge){
  const grid = document.getElementById(gridId);
  if(!grid) return;
  if(!products.length){ grid.innerHTML='<p style="color:var(--gray3);font-family:var(--font-h);letter-spacing:2px;padding:20px">No products yet</p>'; return; }
  grid.innerHTML = products.map(p=>productCardHTML(p)).join('');
}

function productCardHTML(p){
  const badge = p.is_new_arrival ? '<span class="prod-badge badge-new">NEW</span>'
               : p.is_best_seller ? '<span class="prod-badge badge-hot">HOT</span>'
               : (p.compare_price && p.discount_percent) ? `<span class="prod-badge badge-sale">${p.discount_percent}% OFF</span>` : '';
  const img = p.primary_image
    ? `<img src="${p.primary_image}" alt="${p.name}" loading="lazy">`
    : `<div class="prod-img-placeholder">${p.emoji||'🚗'}</div>`;
  const wished = S.wishlist.includes(p.id) ? 'active' : '';
  return `
  <div class="product-card ${!p.in_stock?'out-of-stock':''}" onclick="openProductDetail('${p.id}')">
    <div class="prod-img">
      ${img}
      ${badge}
      <div class="prod-actions" onclick="event.stopPropagation()">
        <button class="prod-act-btn ${wished}" onclick="toggleWishlistItem('${p.id}',this)" title="Wishlist"><i class="fas fa-heart"></i></button>
        <button class="prod-act-btn" onclick="quickAddToCart('${p.id}',this)" title="Add to Cart"><i class="fas fa-cart-plus"></i></button>
      </div>
    </div>
    <div class="prod-info">
      <div class="prod-brand">${p.brand||'Redline'}</div>
      <div class="prod-name">${p.name}</div>
      <div class="prod-meta">${p.scale||'1:64'} · ${p.category||''}</div>
      <div class="prod-price-row">
        <span class="prod-price">₹${p.price}</span>
        ${p.compare_price ? `<span class="prod-compare">₹${p.compare_price}</span>` : ''}
        ${p.discount_percent ? `<span class="prod-discount">-${p.discount_percent}%</span>` : ''}
      </div>
      <button class="prod-add-btn" onclick="event.stopPropagation();quickAddToCart('${p.id}',this)">
        ${p.in_stock ? '<i class="fas fa-cart-plus"></i> ADD TO GARAGE' : 'OUT OF STOCK'}
      </button>
    </div>
  </div>`;
}

function buildCategoryCards(cats){
  const icons = ['🔥','🏎️','💪','🏁','⭐','🚙','🏺','🎮','🚀','🛻'];
  const grid = document.getElementById('home-cat-grid');
  if(!grid) return;
  grid.innerHTML = cats.map((c,i)=>`
    <div class="cat-card" onclick="navigate('shop');filterByCategory('${c.slug||c.name}')">
      <span class="cat-icon">${c.icon||icons[i%icons.length]}</span>
      <div class="cat-name">${c.name}</div>
      <div class="cat-count">${c.count||c.product_count||0} models</div>
    </div>`).join('');
}

function buildBrands(brands){
  const row = document.getElementById('brands-row');
  if(!row) return;
  const names = Array.isArray(brands) && typeof brands[0]==='string'
    ? brands : brands.map(b=>b.name||b);
  row.innerHTML = names.map(n=>`<div class="brand-chip" onclick="navigate('shop')">${n}</div>`).join('');
}

function buildCategoryDropdown(cats){
  const dd = document.getElementById('cat-dropdown');
  if(!dd) return;
  const list = cats || DUMMY.categories;
  dd.innerHTML = list.map(c=>`<a href="#" onclick="navigate('shop');filterByCategory('${c.slug||c.name}')">${c.name}</a>`).join('');
}

function filterByCategory(slug){
  document.getElementById('shop-cat').value = slug;
  applyShopFilter();
}

/* ─────────────────────────────────────────────────────────────────
   TICKER / SPEED LINES / SMOKE
───────────────────────────────────────────────────────────────── */
function initTicker(){
  const items = ['🏎️ FREE SHIPPING ABOVE ₹999','🏁 NEW ARRIVALS EVERY WEEK','⭐ AUTHENTIC DIE-CAST MODELS','🔥 LIMITED EDITIONS AVAILABLE','💳 EMI AVAILABLE ON RAZORPAY','🎁 GIFT WRAPPING ON REQUEST','🏆 50,000+ COLLECTORS TRUST US','🚀 SHIPS ACROSS INDIA IN 2-5 DAYS'];
  const track = document.getElementById('ticker-track');
  const html = items.map(t=>`<span class="ticker-item">${t}<span class="tick-sep">●</span></span>`).join('');
  track.innerHTML = html + html; // duplicate for infinite loop
}

function initSpeedLines(){
  const wrap = document.getElementById('speed-wrap'); if(!wrap) return;
  for(let i=0;i<12;i++){
    const l = document.createElement('div');
    l.className='speed-line';
    l.style.cssText=`top:${Math.random()*100}%;width:${100+Math.random()*200}px;animation-duration:${0.7+Math.random()*0.8}s;animation-delay:${Math.random()*1.2}s`;
    wrap.appendChild(l);
  }
}

function initDriftSmoke(){
  // Smoke handled by CSS animations on #ds1,#ds2,#ds3
}

/* ─────────────────────────────────────────────────────────────────
   REVEAL ANIMATION
───────────────────────────────────────────────────────────────── */
function initRevealObserver(){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in-view'); });
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}

/* ─────────────────────────────────────────────────────────────────
   SEARCH
───────────────────────────────────────────────────────────────── */
function toggleSearch(open){
  document.getElementById('search-overlay').classList.toggle('open', open);
  if(open) { setTimeout(()=>document.getElementById('search-field').focus(), 100); document.getElementById('search-field').value=''; document.getElementById('search-suggestions').innerHTML=''; }
}
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ toggleSearch(false); closeAllModals(); }});

let searchTimer;
function liveSearch(q){
  clearTimeout(searchTimer);
  if(!q.trim()){document.getElementById('search-suggestions').innerHTML='';return;}
  searchTimer = setTimeout(async ()=>{
    const sugg = document.getElementById('search-suggestions');
    try {
      const d = await api('/mustmuscles/api/search/?q='+encodeURIComponent(q));
      renderSearchResults(d.results||[]);
    } catch(e) {
      // Dummy search
      const res = DUMMY.products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.brand.toLowerCase().includes(q.toLowerCase())||p.car_model.toLowerCase().includes(q.toLowerCase())).slice(0,6);
      renderSearchResults(res.map(p=>({...p,image:null})));
    }
  },250);
}

function renderSearchResults(results){
  const sugg = document.getElementById('search-suggestions');
  if(!results.length){sugg.innerHTML='<p style="color:var(--gray3);font-family:var(--font-h);letter-spacing:2px;padding:20px 0">No results found</p>';return;}
  sugg.innerHTML = results.map(r=>`
    <div class="search-result-item" onclick="toggleSearch(false);openProductDetail('${r.id||r.slug}')">
      <div class="sr-img">${r.image?`<img src="${r.image}" style="width:100%;height:100%;object-fit:cover">`:(r.emoji||'🚗')}</div>
      <div><div class="sr-name">${r.name}</div><div class="sr-cat">${r.category||''}</div></div>
      <div class="sr-price">₹${r.price}</div>
    </div>`).join('');
}

/* ─────────────────────────────────────────────────────────────────
   SHOP PAGE
───────────────────────────────────────────────────────────────── */
function initShopPage(sub){
  // Populate category select
  const sel = document.getElementById('shop-cat');
  if(sel.options.length<=1){
    DUMMY.categories.forEach(c=>{ const o=document.createElement('option'); o.value=c.slug; o.textContent=c.name; sel.appendChild(o); });
  }
  // Apply sub-filter
  if(sub==='new')        { document.getElementById('fcheck-new').checked=true; }
  if(sub==='bestseller') { document.getElementById('fcheck-hot').checked=true; }
  if(sub==='featured')   { }
  if(sub==='sale')       { document.getElementById('fcheck-sale').checked=true; }
  S.shopFilters.page = 1;
  applyShopFilter();
}

function debounceFilter(){
  clearTimeout(S.debounceTimer);
  S.debounceTimer = setTimeout(applyShopFilter, 380);
}

function applyShopFilter(){
  const q       = document.getElementById('shop-q').value.trim();
  const cat     = document.getElementById('shop-cat').value;
  const scale   = document.getElementById('shop-scale').value;
  const minP    = document.getElementById('shop-min').value;
  const maxP    = document.getElementById('shop-max').value;
  const sort    = document.getElementById('shop-sort').value;
  const isNew   = document.getElementById('fcheck-new').checked;
  const isHot   = document.getElementById('fcheck-hot').checked;
  const isSale  = document.getElementById('fcheck-sale').checked;
  const inStock = document.getElementById('fcheck-instock').checked;
  S.shopFilters = {q,cat,scale,minP,maxP,sort,isNew,isHot,isSale,inStock,page:S.shopFilters.page||1};
  loadShopProducts();
}

async function loadShopProducts(){
  const f = S.shopFilters;
  const grid = document.getElementById('shop-product-grid');
  const loader= document.getElementById('shop-loader');
  const empty = document.getElementById('shop-empty');
  grid.innerHTML=''; loader.style.display='flex'; empty.style.display='none';

  try {
    let url = `/mustmuscles/api/products/?page=${f.page||1}&sort=${f.sort||'-created_at'}`;
    if(f.q)     url+=`&q=${encodeURIComponent(f.q)}`;
    if(f.cat)   url+=`&category=${f.cat}`;
    if(f.scale) url+=`&scale=${f.scale}`;
    if(f.minP)  url+=`&min_price=${f.minP}`;
    if(f.maxP)  url+=`&max_price=${f.maxP}`;
    const d = await api(url);
    loader.style.display='none';
    renderShopProducts(d.products||[], d.total||0, d.num_pages||1, d.current_page||1);
  } catch(e) {
    loader.style.display='none';
    // Filter dummy products
    let prods = [...DUMMY.products];
    if(f.q)     prods=prods.filter(p=>p.name.toLowerCase().includes(f.q.toLowerCase())||p.brand.toLowerCase().includes(f.q.toLowerCase()));
    if(f.cat)   prods=prods.filter(p=>(p.category||'').toLowerCase().includes(f.cat.replace(/-/g,' ')));
    if(f.scale) prods=prods.filter(p=>p.scale===f.scale);
    if(f.minP)  prods=prods.filter(p=>parseFloat(p.price)>=parseFloat(f.minP));
    if(f.maxP)  prods=prods.filter(p=>parseFloat(p.price)<=parseFloat(f.maxP));
    if(f.isNew)   prods=prods.filter(p=>p.is_new_arrival);
    if(f.isHot)   prods=prods.filter(p=>p.is_best_seller);
    if(f.isSale)  prods=prods.filter(p=>p.discount_percent>0);
    if(f.inStock) prods=prods.filter(p=>p.in_stock);
    if(f.sort==='-price') prods.sort((a,b)=>parseFloat(b.price)-parseFloat(a.price));
    else if(f.sort==='price') prods.sort((a,b)=>parseFloat(a.price)-parseFloat(b.price));
    else if(f.sort==='name') prods.sort((a,b)=>a.name.localeCompare(b.name));
    renderShopProducts(prods, prods.length, 1, 1);
  }
}

function renderShopProducts(products, total, numPages, currentPage){
  const grid = document.getElementById('shop-product-grid');
  const empty= document.getElementById('shop-empty');
  const count= document.getElementById('shop-result-count');
  const pag  = document.getElementById('shop-pagination');
  count.textContent = `${total} RIDE${total!==1?'S':''} FOUND`;
  if(!products.length){empty.style.display='block';grid.innerHTML='';pag.innerHTML='';return;}
  empty.style.display='none';
  grid.className = 'products-grid' + (S.shopView==='list'?' list-view':'');
  grid.innerHTML = products.map(p=>productCardHTML(p)).join('');
  // Pagination
  pag.innerHTML='';
  if(numPages>1){
    for(let i=1;i<=numPages;i++){
      pag.innerHTML+=`<button class="page-btn${i===currentPage?' active':''}" onclick="goToShopPage(${i})">${i}</button>`;
    }
  }
}

function goToShopPage(n){ S.shopFilters.page=n; loadShopProducts(); window.scrollTo({top:document.getElementById('page-shop').offsetTop,behavior:'smooth'}); }

function clearShopFilters(){
  document.getElementById('shop-q').value='';
  document.getElementById('shop-cat').value='';
  document.getElementById('shop-scale').value='';
  document.getElementById('shop-min').value='';
  document.getElementById('shop-max').value='';
  document.getElementById('shop-sort').value='-created_at';
  document.getElementById('fcheck-new').checked=false;
  document.getElementById('fcheck-hot').checked=false;
  document.getElementById('fcheck-sale').checked=false;
  document.getElementById('fcheck-instock').checked=false;
  S.shopFilters.page=1;
  applyShopFilter();
}

function setShopView(v){
  S.shopView=v;
  document.getElementById('grid-view-btn').classList.toggle('active',v==='grid');
  document.getElementById('list-view-btn').classList.toggle('active',v==='list');
  const grid = document.getElementById('shop-product-grid');
  if(grid) grid.className='products-grid'+(v==='list'?' list-view':'');
}

/* ─────────────────────────────────────────────────────────────────
   PRODUCT DETAIL MODAL
───────────────────────────────────────────────────────────────── */
async function openProductDetail(idOrSlug){
  let product;
  try {
    product = await api('/mustmuscles/api/products/'+idOrSlug+'/');
  } catch(e) {
    product = DUMMY.products.find(p=>p.id===idOrSlug||p.slug===idOrSlug);
    if(!product) return;
    product = {
      ...product,
      images: [{url:null,alt_text:product.emoji||'🚗'}],
      reviews: [{user:'RacerKing',rating:5,title:'Amazing model!',comment:'Perfect detail, great value for money. The paint is spot on.',is_verified:true,date:'Dec 1, 2024'},{user:'CollectorPro',rating:4,title:'Good quality',comment:'Nice die-cast model. Packaging could be better.',is_verified:false,date:'Nov 28, 2024'}],
      specifications: {'Material':'Die-Cast Zinc Alloy','Doors':'Opening','Scale':product.scale,'Color':product.color||'As shown'},
      related: DUMMY.products.filter(p=>p.id!==idOrSlug).slice(0,4).map(r=>({id:r.id,name:r.name,slug:r.slug,price:r.price,emoji:r.emoji})),
      short_description: `Authentic ${product.scale} scale die-cast model of the ${product.car_model||product.name}.`,
    };
  }
  const wished = S.wishlist.includes(product.id) ? 'wished' : '';
  const stars = '★'.repeat(Math.round(product.avg_rating||0)) + '☆'.repeat(5-Math.round(product.avg_rating||0));
  const mainImg = (product.images&&product.images[0])
    ? (product.images[0].url ? `<img src="${product.images[0].url}" alt="${product.name}">` : `<span style="font-size:100px">${product.emoji||'🚗'}</span>`)
    : `<span style="font-size:100px">${product.emoji||'🚗'}</span>`;

  const thumbs = (product.images||[]).map((img,i)=>`<div class="prod-thumb${i===0?' active':''}" onclick="switchProdImg(this,'${img.url||''}')">${img.url?`<img src="${img.url}" style="width:100%;height:100%;object-fit:cover">`:(product.emoji||'🚗')}</div>`).join('');
  const specs = Object.entries(product.specifications||{}).map(([k,v])=>`<div class="pdi-spec-row"><span class="pdi-spec-key">${k}</span><span>${v}</span></div>`).join('');
  const reviews = (product.reviews||[]).map(r=>`
    <div class="review-item ${r.is_verified?'verified':''}">
      <div class="rv-head"><span class="rv-user">${r.user}</span><span class="rv-date">${r.date}</span></div>
      <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      ${r.title?`<strong style="font-size:13px;color:var(--white);display:block;margin:4px 0">${r.title}</strong>`:''}
      <div class="rv-text">${r.comment}</div>
      ${r.is_verified?'<div class="rv-verified">✓ VERIFIED PURCHASE</div>':''}
    </div>`).join('');

  document.getElementById('product-modal-body').innerHTML = `
    <div class="prod-detail-grid">
      <div class="prod-detail-imgs">
        <div class="prod-main-img" id="pdi-main-img">${mainImg}</div>
        <div class="prod-thumb-row">${thumbs}</div>
      </div>
      <div class="prod-detail-info">
        <div class="pdi-brand">${product.brand||'Redline'}</div>
        <div class="pdi-name">${product.name}</div>
        <div class="pdi-rating"><span class="stars">${stars}</span><span class="rating-ct">${product.avg_rating||0} (${product.review_count||0} reviews)</span></div>
        <div class="pdi-price">
          <span class="pdi-price-main">₹${product.price}</span>
          ${product.compare_price?`<span class="pdi-compare">₹${product.compare_price}</span>`:''}
          ${product.discount_percent?`<span class="pdi-discount-tag">-${product.discount_percent}% OFF</span>`:''}
        </div>
        <p style="font-size:14px;color:var(--gray4);margin-bottom:16px;line-height:1.7">${product.short_description||''}</p>
        <div class="pdi-specs-mini">${specs}</div>
        <div class="pdi-add-section">
          <div class="qty-sel">
            <button onclick="adjPdiQty(-1)">−</button>
            <input class="q-n" id="pdi-qty" value="1" min="1" max="${product.stock||99}" readonly>
            <button onclick="adjPdiQty(1)">+</button>
          </div>
          <button class="pdi-add-btn" ${product.in_stock?'':"disabled style='opacity:.4'"} onclick="addToCartFromDetail('${product.id}')"><i class="fas fa-cart-plus"></i> ${product.in_stock?'ADD TO GARAGE':'OUT OF STOCK'}</button>
          <button class="pdi-wish-btn ${wished}" id="pdi-wish-btn" onclick="toggleWishlistItem('${product.id}',this)"><i class="fas fa-heart"></i></button>
        </div>
        <div style="font-size:12px;color:var(--gray3);display:flex;gap:16px">
          <span>🚀 Ships in 2-5 days</span>
          <span>↩ 7-day returns</span>
          ${product.sku?`<span>SKU: ${product.sku}</span>`:''}
        </div>
        <div class="pdi-reviews">
          <div style="font-family:var(--font-h);font-size:12px;letter-spacing:3px;color:var(--red);margin-bottom:14px">CUSTOMER REVIEWS</div>
          ${reviews||'<p style="color:var(--gray3);font-size:13px">No reviews yet. Be the first!</p>'}
        </div>
      </div>
    </div>`;
  openModal('product-modal');
}

function adjPdiQty(d){
  const inp = document.getElementById('pdi-qty');
  if(!inp) return;
  let v = parseInt(inp.value)+d;
  if(v<1) v=1; if(v>99) v=99;
  inp.value=v;
}

function switchProdImg(thumb, url){
  document.querySelectorAll('.prod-thumb').forEach(t=>t.classList.remove('active'));
  thumb.classList.add('active');
  const main = document.getElementById('pdi-main-img');
  if(main && url) main.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover">`;
}

/* ─────────────────────────────────────────────────────────────────
   CART
───────────────────────────────────────────────────────────────── */
async function loadCart(){
  if(!S.user) return;
  try {
    const d = await api('/mustmuscles/api/cart/');
    S.cart = d;
  } catch(e) {
    // Keep local state
  }
  renderCart();
}

function cartOpen(){
  if(!S.user){openModal('auth-modal');return;}
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-backdrop').classList.add('show');
  document.body.style.overflow='hidden';
  loadCart();
}

function cartClose(){
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-backdrop').classList.remove('show');
  document.body.style.overflow='';
}

function renderCart(){
  const body = document.getElementById('cart-body');
  const pill = document.getElementById('cart-pill');
  const badge= document.getElementById('cart-nav-badge');
  const sub  = document.getElementById('cart-sub-display');
  const disc = document.getElementById('cart-disc-display');
  const total= document.getElementById('cart-total-display');
  const discLine = document.getElementById('discount-line');
  const amount   = document.getElementById('checkout-amount');

  const cnt = S.cart.item_count || (S.cart.items||[]).length || 0;
  pill.textContent = cnt; badge.textContent = cnt;
  sub.textContent   = '₹'+(S.cart.subtotal||0);
  total.textContent = '₹'+(S.cart.total||S.cart.subtotal||0);
  amount.textContent= '₹'+(S.cart.total||S.cart.subtotal||0);
  updateCartBadge(cnt);

  if(S.cart.discount && parseFloat(S.cart.discount)>0){
    disc.textContent = '-₹'+S.cart.discount;
    discLine.style.display='flex';
  } else { discLine.style.display='none'; }

  const items = S.cart.items||[];
  if(!items.length){ body.innerHTML=`<div class="cart-empty-msg"><i class="fas fa-car"></i><br>Your garage is empty!<br><small style="font-size:12px;margin-top:8px;display:block">Add some rides to get started</small></div>`; return; }
  body.innerHTML = items.map(item=>`
    <div class="cart-item-row" id="ci-${item.id}">
      <div class="cart-item-img">${item.image?`<img src="${item.image}" style="width:100%;height:100%;object-fit:cover">`:(item.emoji||'🚗')}</div>
      <div style="flex:1;min-width:0">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price}</div>
        <div class="qty-ctrl">
          <button onclick="updateCartQty(${item.id},${item.quantity-1})">−</button>
          <input class="qty-n" value="${item.quantity}" readonly>
          <button onclick="updateCartQty(${item.id},${item.quantity+1})">+</button>
        </div>
      </div>
      <button class="cart-item-del" onclick="removeCartItem(${item.id})" title="Remove"><i class="fas fa-trash"></i></button>
    </div>`).join('');
}

async function quickAddToCart(productId, btn){
  if(!S.user){openModal('auth-modal');return;}
  const p = DUMMY.products.find(p=>p.id===productId);
  if(p && !p.in_stock){toast('This model is out of stock','error');return;}
  try {
    const d = await api('/mustmuscles/api/cart/add/','POST',{product_id:productId,quantity:1});
    updateCartBadge(d.item_count||0);
  } catch(e) {
    // Add to local dummy cart
    const existing = S.cart.items.find(i=>i.product_id===productId);
    if(existing) existing.quantity++;
    else {
      const p = DUMMY.products.find(x=>x.id===productId)||{id:productId,name:'Product',price:'0',emoji:'🚗'};
      S.cart.items.push({id:Date.now(),product_id:productId,name:p.name,price:p.price,quantity:1,stock:p.stock||10,emoji:p.emoji});
    }
    S.cart.item_count = S.cart.items.length;
    recalcLocalCart();
    updateCartBadge(S.cart.item_count);
  }
  if(btn){ btn.innerHTML='<i class="fas fa-check"></i>'; setTimeout(()=>{ btn.innerHTML='<i class="fas fa-cart-plus"></i>'; },1500); }
  toast('Added to garage! 🚗','success');
}

async function addToCartFromDetail(productId){
  const qty = parseInt(document.getElementById('pdi-qty')?.value||1);
  if(!S.user){openModal('auth-modal');return;}
  try {
    const d = await api('/mustmuscles/api/cart/add/','POST',{product_id:productId,quantity:qty});
    updateCartBadge(d.item_count||0);
  } catch(e) {
    const p = DUMMY.products.find(x=>x.id===productId)||{id:productId,name:'Product',price:'0',emoji:'🚗'};
    const existing = S.cart.items.find(i=>i.product_id===productId);
    if(existing) existing.quantity+=qty; else S.cart.items.push({id:Date.now(),product_id:productId,name:p.name,price:p.price,quantity:qty,stock:p.stock||10,emoji:p.emoji});
    S.cart.item_count=S.cart.items.length; recalcLocalCart(); updateCartBadge(S.cart.item_count);
  }
  toast(`Added ${qty} to garage! 🚗`,'success');
  closeModal('product-modal');
  setTimeout(cartOpen, 300);
}

async function updateCartQty(itemId, qty){
  try {
    const d = await api(`/mustmuscles/api/cart/update/${itemId}/`,'POST',{quantity:qty});
    await loadCart();
  } catch(e) {
    const item = S.cart.items.find(i=>i.id===itemId);
    if(item){ if(qty<=0) S.cart.items=S.cart.items.filter(i=>i.id!==itemId); else item.quantity=qty; }
    recalcLocalCart(); renderCart();
  }
}

async function removeCartItem(itemId){
  try {
    await api(`/mustmuscles/api/cart/remove/${itemId}/`,'POST');
    await loadCart();
  } catch(e) {
    S.cart.items=S.cart.items.filter(i=>i.id!==itemId);
    S.cart.item_count=S.cart.items.length; recalcLocalCart(); renderCart();
  }
  toast('Removed from garage','info');
}

async function applyCoupon(){
  const code = document.getElementById('coupon-inp').value.trim().toUpperCase();
  if(!code){toast('Enter a coupon code','error');return;}
  if(!S.user){openModal('auth-modal');return;}
  try {
    const d = await api('/mustmuscles/api/cart/coupon/','POST',{code});
    S.cart.discount = d.discount; S.cart.total = d.total;
    S.cart.coupon = code; renderCart();
    toast(d.message||'Coupon applied! 🏷️','success');
  } catch(e) {
    const c = DUMMY.coupons.find(x=>x.code===code);
    if(!c||!c.is_active){toast('Invalid or expired coupon','error');return;}
    const sub = parseFloat(S.cart.subtotal||0);
    if(sub < parseFloat(c.min_order_amount)){toast(`Minimum order ₹${c.min_order_amount} required`,'error');return;}
    const disc = c.discount_type==='percent' ? (sub*c.discount_value/100) : Math.min(c.discount_value,sub);
    S.cart.discount = disc.toFixed(2); S.cart.total = (sub-disc).toFixed(2); S.cart.coupon=code;
    renderCart(); toast(`Coupon applied! You save ₹${disc.toFixed(0)} 🏷️`,'success');
  }
}

function recalcLocalCart(){
  const sub = S.cart.items.reduce((a,i)=>a+parseFloat(i.price)*i.quantity,0);
  S.cart.subtotal=sub.toFixed(2);
  const disc = parseFloat(S.cart.discount||0);
  S.cart.total=(sub-disc).toFixed(2);
}

function updateCartBadge(n){ document.getElementById('cart-nav-badge').textContent=n; }

/* ─────────────────────────────────────────────────────────────────
   WISHLIST
───────────────────────────────────────────────────────────────── */
async function loadWishlistCount(){
  if(!S.user) return;
  try {
    const d = await api('/mustmuscles/api/wishlist/');
    S.wishlist = (d.wishlist||[]).map(w=>w.product_id);
    updateWishBadge(S.wishlist.length);
  } catch(e){ updateWishBadge(0); }
}

async function toggleWishlistItem(productId, btn){
  if(!S.user){openModal('auth-modal');return;}
  try {
    const d = await api('/mustmuscles/api/wishlist/toggle/','POST',{product_id:productId});
    if(d.status==='added'){S.wishlist.push(productId);btn.classList.add('active');toast('Added to wishlist ❤️','success');}
    else {S.wishlist=S.wishlist.filter(id=>id!==productId);btn.classList.remove('active');toast('Removed from wishlist','info');}
  } catch(e) {
    if(S.wishlist.includes(productId)){S.wishlist=S.wishlist.filter(id=>id!==productId);btn.classList.remove('active');toast('Removed from wishlist','info');}
    else {S.wishlist.push(productId);btn.classList.add('active');toast('Added to wishlist ❤️','success');}
  }
  updateWishBadge(S.wishlist.length);
}

function updateWishBadge(n){
  const b=document.getElementById('wish-badge');
  if(n>0){b.textContent=n;b.style.display='flex';}else{b.style.display='none';}
}

function openWishlistPage(){ navigate('portal','wishlist'); }

/* ─────────────────────────────────────────────────────────────────
   NEWSLETTER
───────────────────────────────────────────────────────────────── */
async function subscribeNL(e){
  e.preventDefault();
  const email = document.getElementById('nl-email').value.trim();
  if(!email){toast('Enter your email','error');return;}
  try {
    const d = await api('/mustmuscles/api/newsletter/','POST',{email});
    toast(d.message||'Subscribed! Welcome to the race! 🏎️','success');
  } catch(er) {
    toast('Subscribed! Welcome to the race! 🏎️','success');
  }
  document.getElementById('nl-email').value='';
}

/* ─────────────────────────────────────────────────────────────────
   CHECKOUT
───────────────────────────────────────────────────────────────── */
async function openCheckout(){
  if(!S.user){cartClose();openModal('auth-modal');return;}
  if(!S.cart.items||!S.cart.items.length){toast('Your cart is empty','error');return;}
  cartClose();
  setCheckoutStep(1);
  await loadAddressesForCheckout();
  populateCheckoutReview();
  document.getElementById('pay-amount').textContent='₹'+(S.cart.total||S.cart.subtotal||0);
  openModal('checkout-modal');
}

function checkoutNext(step){ setCheckoutStep(step); if(step===3) document.getElementById('pay-amount').textContent='₹'+(S.cart.total||S.cart.subtotal||0); }

function setCheckoutStep(n){
  S.checkoutStep=n;
  for(let i=1;i<=3;i++){
    const panel=document.getElementById('checkout-s'+i); const step=document.getElementById('cs'+i);
    panel.classList.toggle('active',i===n);
    step.classList.toggle('active',i===n); step.classList.toggle('done',i<n);
  }
}

async function loadAddressesForCheckout(){
  const wrap = document.getElementById('saved-addresses-checkout');
  try {
    const d = await api('/mustmuscles/api/user/addresses/');
    renderCheckoutAddresses(d.addresses||[]);
  } catch(e) {
    renderCheckoutAddresses(DUMMY.addresses);
  }
}

function renderCheckoutAddresses(addrs){
  const wrap=document.getElementById('saved-addresses-checkout');
  if(!addrs.length){wrap.innerHTML='';return;}
  wrap.innerHTML=addrs.map(a=>`
    <div class="saved-addr-card${a.is_default?' selected':''}" id="addr-card-${a.id}" onclick="selectCheckoutAddr(${a.id})">
      <div class="saved-addr-name">${a.name} · ${a.phone}</div>
      <div class="saved-addr-detail">${a.line1}${a.line2?', '+a.line2:''}, ${a.city}, ${a.state} - ${a.pincode}</div>
    </div>`).join('');
  const def = addrs.find(a=>a.is_default)||addrs[0];
  if(def) selectCheckoutAddr(def.id);
}

function selectCheckoutAddr(id){
  S.selectedAddressId=id;
  document.querySelectorAll('.saved-addr-card').forEach(c=>c.classList.remove('selected'));
  const card=document.getElementById('addr-card-'+id);
  if(card) card.classList.add('selected');
}

function toggleNewAddrForm(){
  const f=document.getElementById('new-addr-form-wrap');
  f.style.display=f.style.display==='none'?'block':'none';
}

async function saveCheckoutAddr(){
  const data={
    name:document.getElementById('ca-name').value.trim(),
    phone:document.getElementById('ca-phone').value.trim(),
    line1:document.getElementById('ca-line1').value.trim(),
    line2:document.getElementById('ca-line2').value.trim(),
    city:document.getElementById('ca-city').value.trim(),
    state:document.getElementById('ca-state').value.trim(),
    pincode:document.getElementById('ca-pin').value.trim(),
    country:document.getElementById('ca-country').value.trim()||'India',
  };
  if(!data.name||!data.phone||!data.line1||!data.city){toast('Fill in required fields','error');return;}
  try {
    const d=await api('/mustmuscles/api/user/addresses/add/','POST',data);
    S.selectedAddressId=d.id; toast('Address saved','success');
  } catch(e) {
    const fakeId=Date.now(); S.selectedAddressId=fakeId;
    DUMMY.addresses.push({...data,id:fakeId,is_default:false});
    toast('Address saved','success');
  }
  document.getElementById('new-addr-form-wrap').style.display='none';
  loadAddressesForCheckout();
}

function populateCheckoutReview(){
  const list=document.getElementById('checkout-review-list');
  const items=S.cart.items||[];
  list.innerHTML=items.map(i=>`
    <div class="checkout-review-item">
      <div class="cr-img">${i.image?`<img src="${i.image}" style="width:100%;height:100%;object-fit:cover">`:(i.emoji||'🚗')}</div>
      <div><div class="cr-name">${i.name}</div><div class="cr-qty">Qty: ${i.quantity}</div></div>
      <div class="cr-price">₹${(parseFloat(i.price)*i.quantity).toFixed(0)}</div>
    </div>`).join('');
  document.getElementById('co-sub').textContent='₹'+(S.cart.subtotal||0);
  document.getElementById('co-total').textContent='₹'+(S.cart.total||S.cart.subtotal||0);
  const dr=document.getElementById('co-disc-row');
  if(S.cart.discount && parseFloat(S.cart.discount)>0){
    document.getElementById('co-disc').textContent='-₹'+S.cart.discount; dr.style.display='flex';
  } else { dr.style.display='none'; }
}

async function initiateRazorpay(){
  if(!S.selectedAddressId){toast('Please select a delivery address','error');setCheckoutStep(1);return;}
  try {
    const d = await api('/mustmuscles/api/checkout/create-order/','POST',{address_id:S.selectedAddressId});
    S.razorpayOrderId = d.razorpay_order_id;
    launchRazorpay(d);
  } catch(e) {
    // Demo mode — simulate successful payment
    simulatePaymentSuccess();
  }
}

function launchRazorpay(opts){
  const rzp = new Razorpay({
    key: opts.key||'rzp_test_demo',
    amount: opts.amount,
    currency: opts.currency||'INR',
    name: 'RedlineCars',
    description: 'Toy Cars Order',
    order_id: opts.razorpay_order_id,
    prefill: opts.prefill||{},
    theme: { color:'#E8000D' },
    handler: async function(resp){
      await confirmRazorpayPayment(resp);
    },
    modal: { ondismiss: ()=>toast('Payment cancelled','info') }
  });
  rzp.open();
}

async function confirmRazorpayPayment(resp){
  try {
    const d = await api('/mustmuscles/api/checkout/confirm/','POST',{
      razorpay_order_id: resp.razorpay_order_id,
      razorpay_payment_id: resp.razorpay_payment_id,
      razorpay_signature: resp.razorpay_signature,
      address_id: S.selectedAddressId,
    });
    onOrderSuccess(d.order_number);
  } catch(e) { simulatePaymentSuccess(); }
}

function simulatePaymentSuccess(){
  const orderNum='RCAR'+Date.now().toString().slice(-8);
  S.cart={items:[],subtotal:'0',discount:'0',total:'0',coupon:null,item_count:0};
  renderCart(); updateCartBadge(0);
  closeModal('checkout-modal');
  onOrderSuccess(orderNum);
}

function onOrderSuccess(orderNumber){
  closeModal('checkout-modal');
  toast(`Order ${orderNumber} placed! 🏁 We'll notify you on updates.`,'success');
  navigate('portal','orders');
}

/* ─────────────────────────────────────────────────────────────────
   USER PORTAL
───────────────────────────────────────────────────────────────── */
function switchPortalTab(tab){
  document.querySelectorAll('.ptab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  document.querySelectorAll('.ptab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('ptab-'+tab)?.classList.add('active');
  if(tab==='orders')    loadUserOrders();
  if(tab==='wishlist')  loadUserWishlist();
  if(tab==='addresses') loadUserAddresses();
  if(tab==='profile')   loadUserProfile();
}

async function loadPortalData(sub){
  const welcome=document.getElementById('portal-welcome-msg');
  if(welcome && S.user) welcome.textContent='Welcome back, '+(S.user.first_name||S.user.username)+'! 🏎️';
  const tab=sub||'orders';
  switchPortalTab(tab);
}

async function loadUserOrders(){
  const tbody=document.getElementById('orders-tbody');
  const empty=document.getElementById('orders-empty');
  tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--gray3);padding:30px;font-family:var(--font-h);letter-spacing:2px">Loading...</td></tr>';
  try {
    const d=await api('/mustmuscles/api/user/orders/');
    renderOrdersTable(d.orders||[]);
  } catch(e) { renderOrdersTable(DUMMY.orders); }
}

function renderOrdersTable(orders){
  const tbody=document.getElementById('orders-tbody');
  const empty=document.getElementById('orders-empty');
  if(!orders.length){tbody.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tbody.innerHTML=orders.map(o=>`
    <tr>
      <td><strong style="font-family:var(--font-h);color:var(--white)">${o.order_number}</strong></td>
      <td>${o.created_at}</td>
      <td>${o.item_count}</td>
      <td><strong style="font-family:var(--font-d);font-size:18px;color:var(--red)">₹${o.total_amount}</strong></td>
      <td><span class="st-badge st-${o.payment_status}">${o.payment_status}</span></td>
      <td><span class="st-badge st-${o.status}">${o.status}</span></td>
      <td><button class="tbl-btn" onclick="viewOrderDetail('${o.id}')" title="View"><i class="fas fa-eye"></i></button></td>
    </tr>`).join('');
}

async function viewOrderDetail(orderId){
  let order;
  try {
    order = await api('/mustmuscles/api/user/orders/'+orderId+'/');
  } catch(e) {
    const base=DUMMY.orders.find(o=>o.id===orderId)||DUMMY.orders[0];
    order={...base,items:[{name:'Ferrari 488 GTB',sku:'SKU001',image:null,price:'899',quantity:1,total:'899',emoji:'🔴'}],
      history:[{status:'confirmed',note:'Payment received via Razorpay',date:'Dec 10, 2024 10:30'},{status:'processing',note:'Order being prepared',date:'Dec 10, 2024 14:00'}],
      shipping_address:{name:'Raj Kumar',phone:'9876543210',line1:'42, MG Road',city:'Bengaluru',state:'Karnataka',pincode:'560001'},
      subtotal:base.total_amount,discount:'0',shipping:'0',total:base.total_amount,razorpay_payment_id:'pay_demo123',tracking_number:base.tracking_number};
  }
  const statuses=['pending','confirmed','processing','shipped','delivered'];
  const cur=statuses.indexOf(order.status);
  const track=statuses.map((st,i)=>{
    const done=i<=cur,active=i===cur;
    return `<div class="ot-step ${done?'done':''} ${active?'active':''}">
      <div class="ot-dot">${done?'<i class="fas fa-check"></i>':i+1}</div>
      <div class="ot-label">${st}</div>
    </div>`;}).join('');
  const items=(order.items||[]).map(i=>`
    <div class="checkout-review-item">
      <div class="cr-img">${i.product_image?`<img src="${i.product_image}" style="width:100%;height:100%;object-fit:cover">`:(i.emoji||'🚗')}</div>
      <div><div class="cr-name">${i.name||i.product_name}</div><div class="cr-qty">Qty: ${i.quantity} · SKU: ${i.sku||i.product_sku||'—'}</div></div>
      <div class="cr-price">₹${i.total}</div>
    </div>`).join('');
  const addr=order.shipping_address||{};
  document.getElementById('order-detail-body').innerHTML=`
    <h2 class="modal-title">ORDER #${order.order_number||''}</h2>
    <div style="display:flex;gap:12px;margin:12px 0 24px;flex-wrap:wrap">
      <span class="st-badge st-${order.status}">${order.status}</span>
      <span class="st-badge st-${order.payment_status}">${order.payment_status}</span>
      ${order.tracking_number?`<span style="font-family:var(--font-h);font-size:12px;color:var(--gold);letter-spacing:2px">📦 ${order.tracking_number}</span>`:''}
    </div>
    <div class="order-track">${track}</div>
    <div class="form-section-title">ORDER ITEMS</div>
    ${items}
    <div class="checkout-totals-box" style="margin-top:16px">
      <div class="total-line"><span>Subtotal</span><span>₹${order.subtotal}</span></div>
      ${parseFloat(order.discount||0)>0?`<div class="total-line" style="color:var(--gold)"><span>Discount</span><span>-₹${order.discount}</span></div>`:''}
      <div class="total-line grand"><span>TOTAL</span><span>₹${order.total||order.total_amount}</span></div>
    </div>
    <div class="form-section-title" style="margin-top:20px">DELIVERY ADDRESS</div>
    <div style="font-size:14px;color:var(--gray4);line-height:1.8;background:var(--carbon);padding:16px">
      ${addr.name||''} · ${addr.phone||''}<br>${addr.line1||''}${addr.line2?', '+addr.line2:''}<br>${addr.city||''}, ${addr.state||''} - ${addr.pincode||''}
    </div>
    ${order.razorpay_payment_id?`<div style="font-size:12px;color:var(--gray3);margin-top:12px">Razorpay Payment ID: ${order.razorpay_payment_id}</div>`:''}`;
  openModal('order-detail-modal');
}

async function loadUserWishlist(){
  const grid=document.getElementById('wishlist-product-grid');
  const empty=document.getElementById('wishlist-empty');
  try {
    const d=await api('/mustmuscles/api/wishlist/');
    const items=d.wishlist||[];
    if(!items.length){empty.style.display='block';grid.innerHTML='';return;}
    empty.style.display='none';
    grid.innerHTML=items.map(w=>productCardHTML({...w,id:w.product_id,in_stock:w.in_stock})).join('');
  } catch(e) {
    const wished=DUMMY.products.filter(p=>S.wishlist.includes(p.id));
    if(!wished.length){empty.style.display='block';grid.innerHTML='';return;}
    empty.style.display='none';
    grid.innerHTML=wished.map(p=>productCardHTML(p)).join('');
  }
}

async function loadUserAddresses(){
  const grid=document.getElementById('addresses-grid');
  const empty=document.getElementById('addr-empty');
  try {
    const d=await api('/mustmuscles/api/user/addresses/');
    renderAddressCards(d.addresses||[]);
  } catch(e) { renderAddressCards(DUMMY.addresses); }
}

function renderAddressCards(addrs){
  const grid=document.getElementById('addresses-grid');
  const empty=document.getElementById('addr-empty');
  if(!addrs.length){empty.style.display='block';grid.innerHTML='';return;}
  empty.style.display='none';
  grid.innerHTML=addrs.map(a=>`
    <div class="address-card ${a.is_default?'default':''}">
      ${a.is_default?'<div class="addr-default-tag">DEFAULT</div>':''}
      <div class="addr-card-name">${a.name}</div>
      <div class="addr-card-detail">${a.phone}<br>${a.line1}${a.line2?', '+a.line2:''}<br>${a.city}, ${a.state} - ${a.pincode}</div>
      <button class="addr-del-btn" onclick="deleteAddress(${a.id})" title="Delete"><i class="fas fa-trash"></i></button>
    </div>`).join('');
}

async function submitAddress(){
  const data={
    name:document.getElementById('am-name').value.trim(),
    phone:document.getElementById('am-phone').value.trim(),
    line1:document.getElementById('am-l1').value.trim(),
    line2:document.getElementById('am-l2').value.trim(),
    city:document.getElementById('am-city').value.trim(),
    state:document.getElementById('am-state').value.trim(),
    pincode:document.getElementById('am-pin').value.trim(),
    country:document.getElementById('am-country').value.trim()||'India',
    is_default:document.getElementById('am-default').checked,
  };
  if(!data.name||!data.phone||!data.line1){toast('Fill in required fields','error');return;}
  try { await api('/mustmuscles/api/user/addresses/add/','POST',data); } catch(e) { DUMMY.addresses.push({...data,id:Date.now(),is_default:data.is_default}); }
  closeModal('addr-modal'); loadUserAddresses(); toast('Address saved!','success');
}

async function deleteAddress(id){
  try { await api(`/mustmuscles/api/user/addresses/${id}/delete/`,'GET'); } catch(e) { DUMMY.addresses=DUMMY.addresses.filter(a=>a.id!==id); }
  loadUserAddresses(); toast('Address deleted','info');
}

async function loadUserProfile(){
  try {
    const d=await api('/mustmuscles/api/user/profile/');
    document.getElementById('p-fname').value=d.first_name||'';
    document.getElementById('p-lname').value=d.last_name||'';
    document.getElementById('p-email').value=d.email||'';
    document.getElementById('p-phone').value=d.phone||'';
  } catch(e) {
    if(S.user){
      document.getElementById('p-fname').value=S.user.first_name||'';
      document.getElementById('p-email').value=S.user.email||'';
    }
  }
}

async function saveProfile(){
  const data={
    first_name:document.getElementById('p-fname').value.trim(),
    last_name:document.getElementById('p-lname').value.trim(),
    phone:document.getElementById('p-phone').value.trim(),
  };
  try { await api('/mustmuscles/api/user/profile/','PUT',data); } catch(e) { if(S.user){S.user.first_name=data.first_name;} }
  toast('Profile updated!','success');
}

/* ─────────────────────────────────────────────────────────────────
   ADMIN PANEL
───────────────────────────────────────────────────────────────── */
function adminSection(sec){
  document.querySelectorAll('.admin-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.a-nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('asec-'+sec)?.classList.add('active');
  document.querySelector(`.a-nav-btn[data-sec="${sec}"]`)?.classList.add('active');
  document.getElementById('admin-page-label').textContent=sec.charAt(0).toUpperCase()+sec.slice(1);
  if(sec==='dashboard') loadAdminDashboard();
  if(sec==='products')  loadAdminProds();
  if(sec==='categories')loadAdminCats();
  if(sec==='sections')  loadAdminSections();
  if(sec==='orders')    loadAdminOrders();
  if(sec==='customers') loadAdminCustomers();
  if(sec==='coupons')   loadAdminCoupons();
  if(sec==='lowstock')  loadAdminLowStock();
  if(sec==='analytics') loadAdminAnalytics();
  if(sec==='banners')   loadAdminBanners();
}

function toggleAdminSidebar(){ document.getElementById('admin-aside').classList.toggle('open'); }
function exitAdmin(){ navigate('home'); }

async function loadAdminDashboard(){
  try {
    const d=await api('/mustmuscles/api/admin/dashboard/');
    renderStatCards(d.stats);
    renderRecentOrders(d.recent_orders||[]);
    updateLowStockBadge(d.stats.low_stock_count||0);
  } catch(e) {
    renderStatCards(DUMMY.admin_stats);
    renderRecentOrders(DUMMY.orders);
    updateLowStockBadge(DUMMY.admin_stats.low_stock_count);
  }
}

function renderStatCards(stats){
  const cards=[
    {icon:'fas fa-receipt',   val:stats.orders_today,     lbl:'Orders Today'},
    {icon:'fas fa-rupee-sign',val:'₹'+(stats.revenue_today||0),lbl:'Revenue Today'},
    {icon:'fas fa-car',       val:stats.total_products,   lbl:'Total Products'},
    {icon:'fas fa-clock',     val:stats.pending_orders,   lbl:'Pending Orders'},
    {icon:'fas fa-users',     val:stats.total_customers,  lbl:'Total Customers'},
    {icon:'fas fa-exclamation-triangle',val:stats.low_stock_count,lbl:'Low Stock'},
  ];
  document.getElementById('stat-cards').innerHTML=cards.map(c=>`
    <div class="stat-card">
      <div class="stat-icon"><i class="${c.icon}"></i></div>
      <div class="stat-val">${c.val}</div>
      <div class="stat-lbl">${c.lbl}</div>
    </div>`).join('');
}

function renderRecentOrders(orders){
  const tbody=document.getElementById('recent-orders-tbody');
  if(!tbody) return;
  tbody.innerHTML=orders.map(o=>`
    <tr>
      <td><strong style="font-family:var(--font-h);color:var(--white)">${o.order_number}</strong></td>
      <td>${o.customer||o.shipping_name||'—'}</td>
      <td><strong style="font-family:var(--font-d);font-size:18px;color:var(--red)">₹${o.total||o.total_amount}</strong></td>
      <td><span class="st-badge st-${o.payment_status}">${o.payment_status}</span></td>
      <td><span class="st-badge st-${o.status}">${o.status}</span></td>
      <td>${o.date||o.created_at}</td>
      <td><button class="tbl-btn" onclick="viewAdminOrder('${o.id}')" title="View"><i class="fas fa-eye"></i></button></td>
    </tr>`).join('');
}

function updateLowStockBadge(n){
  const b=document.getElementById('lowstock-badge');
  const d=document.getElementById('notif-dot');
  b.textContent=n;
  if(n>0){d.style.display='block';}else{d.style.display='none';}
}

/* ─── ADMIN PRODUCTS ─────────────────── */
async function loadAdminProds(){
  const q=document.getElementById('admin-prod-q')?.value||'';
  const tbody=document.getElementById('admin-prod-tbody');
  tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--gray3);padding:24px;font-family:var(--font-h);letter-spacing:2px">Loading...</td></tr>';
  try {
    const d=await api('/mustmuscles/api/admin/products/?q='+encodeURIComponent(q));
    renderAdminProdsTable(d.products||[]);
  } catch(e) {
    let prods=DUMMY.products;
    if(q) prods=prods.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.brand.toLowerCase().includes(q.toLowerCase()));
    renderAdminProdsTable(prods);
  }
}

function renderAdminProdsTable(prods){
  const tbody=document.getElementById('admin-prod-tbody');
  tbody.innerHTML=prods.map(p=>`
    <tr>
      <td><strong style="color:var(--white)">${p.name}</strong></td>
      <td style="color:var(--gray3);font-size:12px">${p.sku||'—'}</td>
      <td>${p.category||'—'}</td>
      <td><strong style="font-family:var(--font-d);font-size:18px;color:var(--red)">₹${p.price}</strong></td>
      <td><span style="color:${parseInt(p.stock)<=5?'var(--gold)':'var(--green)'}">
        <strong>${p.stock||0}</strong> ${parseInt(p.stock)<=5?'⚠️':''}</span></td>
      <td><span class="st-badge ${p.is_active!==false?'st-confirmed':'st-cancelled'}">${p.is_active!==false?'Active':'Inactive'}</span></td>
      <td>
        <div class="tbl-action-btns">
          <button class="tbl-btn" onclick="editProduct('${p.id||p.slug}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="tbl-btn" style="color:var(--red)" onclick="deleteProduct('${p.id||p.slug}')" title="Deactivate"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function openProductForm(){ S.editingProductId=null; document.getElementById('prod-form-title').textContent='ADD PRODUCT'; clearProductForm(); populateProdFormCats(); openModal('prod-form-modal'); }
function clearProductForm(){ ['pf-name','pf-sku','pf-carmodel','pf-color','pf-shortdesc','pf-desc','pf-price','pf-compare','pf-stock','pf-weight'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';}); ['pf-featured','pf-new','pf-bestseller'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=false;}); document.getElementById('pf-active').checked=true; }
async function populateProdFormCats(){
  const sel=document.getElementById('pf-cat');
  try { const d=await api('/mustmuscles/api/admin/categories/'); sel.innerHTML='<option value="">Select...</option>'+(d.categories||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join(''); }
  catch(e){ sel.innerHTML='<option value="">Select...</option>'+DUMMY.categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join(''); }
}
async function editProduct(id){
  S.editingProductId=id;
  document.getElementById('prod-form-title').textContent='EDIT PRODUCT';
  const p=DUMMY.products.find(x=>x.id===id||x.slug===id);
  if(p){
    document.getElementById('pf-name').value=p.name||'';
    document.getElementById('pf-price').value=p.price||'';
    document.getElementById('pf-compare').value=p.compare_price||'';
    document.getElementById('pf-stock').value=p.stock||'';
    document.getElementById('pf-carmodel').value=p.car_model||'';
    document.getElementById('pf-color').value=p.color||'';
    document.getElementById('pf-featured').checked=!!p.is_featured;
    document.getElementById('pf-new').checked=!!p.is_new_arrival;
    document.getElementById('pf-bestseller').checked=!!p.is_best_seller;
  }
  populateProdFormCats();
  openModal('prod-form-modal');
}
async function submitProductForm(){
  const data={
    name:document.getElementById('pf-name').value.trim(),
    sku:document.getElementById('pf-sku').value.trim(),
    scale:document.getElementById('pf-scale').value,
    car_model:document.getElementById('pf-carmodel').value.trim(),
    color:document.getElementById('pf-color').value.trim(),
    short_description:document.getElementById('pf-shortdesc').value.trim(),
    description:document.getElementById('pf-desc').value.trim(),
    price:document.getElementById('pf-price').value,
    compare_price:document.getElementById('pf-compare').value||null,
    stock:document.getElementById('pf-stock').value,
    weight_grams:document.getElementById('pf-weight').value||null,
    category_id:document.getElementById('pf-cat').value||null,
    is_featured:document.getElementById('pf-featured').checked,
    is_new_arrival:document.getElementById('pf-new').checked,
    is_best_seller:document.getElementById('pf-bestseller').checked,
    is_active:document.getElementById('pf-active').checked,
  };
  if(!data.name||!data.price||!data.stock){toast('Name, price & stock are required','error');return;}
  try {
    if(S.editingProductId){ await api(`/mustmuscles/api/admin/products/${S.editingProductId}/`,'PUT',data); toast('Product updated!','success'); }
    else { await api('/mustmuscles/api/admin/products/create/','POST',data); toast('Product created!','success'); }
  } catch(e) {
    toast(S.editingProductId?'Product updated! (demo)':'Product created! (demo)','success');
    if(!S.editingProductId){ DUMMY.products.unshift({...data,id:'p'+(Date.now()),slug:data.name.toLowerCase().replace(/\s+/g,'-'),brand:'Redline',category:'General',in_stock:parseInt(data.stock)>0,emoji:'🚗',discount_percent:data.compare_price?Math.round((1-data.price/data.compare_price)*100):0}); }
  }
  closeModal('prod-form-modal'); loadAdminProds();
}
async function deleteProduct(id){
  if(!confirm('Deactivate this product?')) return;
  try { await api(`/mustmuscles/api/admin/products/${id}/`,'DELETE'); }
  catch(e){ DUMMY.products=DUMMY.products.filter(p=>p.id!==id&&p.slug!==id); }
  loadAdminProds(); toast('Product deactivated','info');
}

/* ─── ADMIN CATEGORIES ───────────────── */
async function loadAdminCats(){
  const tbody=document.getElementById('admin-cat-tbody');
  try { const d=await api('/mustmuscles/api/admin/categories/'); renderAdminCatsTable(d.categories||[]); }
  catch(e){ renderAdminCatsTable(DUMMY.categories); }
}
function renderAdminCatsTable(cats){
  const tbody=document.getElementById('admin-cat-tbody');
  tbody.innerHTML=cats.map(c=>`<tr><td><strong style="color:var(--white)">${c.name}</strong></td><td style="color:var(--gray3);font-size:12px">${c.slug||'—'}</td><td>${c.count||c.product_count||0}</td><td><span class="st-badge ${c.is_active!==false?'st-confirmed':'st-cancelled'}">${c.is_active!==false?'Active':'Inactive'}</span></td><td><button class="tbl-btn" title="Delete" onclick="deleteCat(${c.id})"><i class="fas fa-trash"></i></button></td></tr>`).join('');
}
async function submitCategoryForm(){
  const name=document.getElementById('cf-name').value.trim();
  if(!name){toast('Category name required','error');return;}
  try { await api('/mustmuscles/api/admin/categories/','POST',{name,description:document.getElementById('cf-desc').value,is_active:document.getElementById('cf-active').checked}); }
  catch(e){ DUMMY.categories.push({id:Date.now(),name,slug:name.toLowerCase().replace(/\s+/g,'-'),is_active:true,count:0,icon:'🚗'}); }
  closeModal('cat-form-modal'); loadAdminCats(); toast('Category created!','success');
}
async function deleteCat(id){
  if(!confirm('Delete category?')) return;
  try { await api(`/mustmuscles/api/admin/categories/${id}/`,'DELETE'); } catch(e){ DUMMY.categories=DUMMY.categories.filter(c=>c.id!==id); }
  loadAdminCats(); toast('Category deleted','info');
}

/* ─── ADMIN SECTIONS ─────────────────── */
async function loadAdminSections(){
  const tbody=document.getElementById('admin-sec-tbody');
  try { const d=await api('/mustmuscles/api/admin/sections/'); renderAdminSecTable(d.sections||[]); }
  catch(e){ renderAdminSecTable([{id:1,name:'Featured Collection',slug:'featured',product_count:8,display_order:1,is_active:true},{id:2,name:'New Season Drop',slug:'new-season',product_count:5,display_order:2,is_active:true}]); }
}
function renderAdminSecTable(secs){
  document.getElementById('admin-sec-tbody').innerHTML=secs.map(s=>`<tr><td><strong style="color:var(--white)">${s.name}</strong></td><td style="color:var(--gray3);font-size:12px">${s.slug||'—'}</td><td>${s.product_count||0}</td><td>${s.display_order||0}</td><td><span class="st-badge ${s.is_active?'st-confirmed':'st-cancelled'}">${s.is_active?'Active':'Inactive'}</span></td><td><button class="tbl-btn" onclick="deleteSec(${s.id})"><i class="fas fa-trash"></i></button></td></tr>`).join('');
}
async function submitSectionForm(){
  const name=document.getElementById('sf-name').value.trim();
  if(!name){toast('Section name required','error');return;}
  try { await api('/mustmuscles/api/admin/sections/','POST',{name,description:document.getElementById('sf-desc').value,display_order:document.getElementById('sf-order').value||0}); }
  catch(e){}
  closeModal('sec-form-modal'); loadAdminSections(); toast('Section created!','success');
}
function deleteSec(id){ loadAdminSections(); toast('Section deleted','info'); }

/* ─── ADMIN ORDERS ───────────────────── */
async function loadAdminOrders(){
  const tbody=document.getElementById('admin-orders-tbody');
  tbody.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--gray3);padding:24px">Loading...</td></tr>';
  let url='/mustmuscles/api/admin/orders/';
  if(S.adminOrderFilter) url+='?status='+S.adminOrderFilter;
  try { const d=await api(url); renderAdminOrdersTable(d.orders||[]); }
  catch(e){ let orders=DUMMY.orders; if(S.adminOrderFilter) orders=orders.filter(o=>o.status===S.adminOrderFilter); renderAdminOrdersTable(orders); }
}
function renderAdminOrdersTable(orders){
  document.getElementById('admin-orders-tbody').innerHTML=orders.map(o=>`
    <tr>
      <td><strong style="font-family:var(--font-h);color:var(--white)">${o.order_number}</strong></td>
      <td>${o.customer||o.shipping_name||'—'}</td>
      <td><strong style="font-family:var(--font-d);font-size:18px;color:var(--red)">₹${o.total||o.total_amount}</strong></td>
      <td>${o.item_count||'—'}</td>
      <td><span class="st-badge st-${o.payment_status}">${o.payment_status}</span></td>
      <td><span class="st-badge st-${o.status}">${o.status}</span></td>
      <td>${o.date||o.created_at}</td>
      <td><button class="tbl-btn" onclick="viewAdminOrder('${o.id}')"><i class="fas fa-eye"></i></button></td>
    </tr>`).join('');
}
function filterAdminOrders(btn, status){
  S.adminOrderFilter=status;
  document.querySelectorAll('.sfpill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  loadAdminOrders();
}
async function viewAdminOrder(orderId){
  let order;
  try { order=await api('/mustmuscles/api/admin/orders/'+orderId+'/'); }
  catch(e){ order={...DUMMY.orders.find(o=>o.id===orderId)||DUMMY.orders[0],customer:'Raj Kumar',phone:'9876543210',address:'42, MG Road, Bengaluru - 560001',items:[{name:'Ferrari 488 GTB',qty:1,price:'899',total:'899',image:null}],history:[{status:'confirmed',note:'Payment received',date:'Dec 10, 2024 10:30'}]}; }
  const statusOpts=['pending','confirmed','processing','shipped','delivered','cancelled'].map(s=>`<option value="${s}" ${s===order.status?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('');
  document.getElementById('admin-order-body').innerHTML=`
    <h2 class="modal-title">ORDER #${order.order_number}</h2>
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin:16px 0">
      <div style="font-size:14px;color:var(--gray4)"><strong style="color:var(--white2)">Customer:</strong> ${order.customer}</div>
      <div style="font-size:14px;color:var(--gray4)"><strong style="color:var(--white2)">Phone:</strong> ${order.phone||'—'}</div>
      <div style="font-size:14px;color:var(--gray4)"><strong style="color:var(--white2)">Address:</strong> ${order.address||'—'}</div>
    </div>
    <div style="display:flex;gap:12px;margin-bottom:20px">
      <span class="st-badge st-${order.payment_status}">${order.payment_status}</span>
      <span class="st-badge st-${order.status}">${order.status}</span>
    </div>
    ${(order.items||[]).map(i=>`<div class="checkout-review-item"><div class="cr-img">${i.image?`<img src="${i.image}" style="width:100%;height:100%;object-fit:cover">`:'🚗'}</div><div><div class="cr-name">${i.name}</div><div class="cr-qty">Qty: ${i.qty||i.quantity}</div></div><div class="cr-price">₹${i.total}</div></div>`).join('')}
    <div class="checkout-totals-box" style="margin-top:12px">
      <div class="total-line grand"><span>TOTAL</span><span>₹${order.total||order.total_amount}</span></div>
    </div>
    <div class="form-section-title" style="margin-top:24px">UPDATE STATUS</div>
    <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">
      <div class="form-group" style="flex:1;min-width:160px;margin:0"><label class="flabel">New Status</label><select class="finput" id="admin-order-status-sel">${statusOpts}</select></div>
      <div class="form-group" style="flex:2;min-width:200px;margin:0"><label class="flabel">Tracking Number</label><input class="finput" id="admin-tracking-inp" value="${order.tracking_number||''}" placeholder="Enter tracking number"></div>
      <div class="form-group" style="flex:2;min-width:200px;margin:0"><label class="flabel">Note</label><input class="finput" id="admin-order-note" placeholder="Status update note"></div>
      <button class="btn-red-race" onclick="updateAdminOrder('${order.id||orderId}')"><i class="fas fa-save"></i> Update</button>
    </div>`;
  openModal('admin-order-modal');
}
async function updateAdminOrder(id){
  const status=document.getElementById('admin-order-status-sel').value;
  const tracking=document.getElementById('admin-tracking-inp').value;
  const note=document.getElementById('admin-order-note').value;
  try { await api(`/mustmuscles/api/admin/orders/${id}/`,'PUT',{status,tracking_number:tracking,note}); }
  catch(e){ const o=DUMMY.orders.find(x=>x.id===id); if(o){o.status=status;o.tracking_number=tracking;} }
  closeModal('admin-order-modal'); loadAdminOrders(); toast('Order updated!','success');
}

/* ─── ADMIN CUSTOMERS ────────────────── */
async function loadAdminCustomers(){
  const tbody=document.getElementById('admin-cust-tbody');
  try { const d=await api('/mustmuscles/api/admin/customers/'); renderAdminCustTable(d.customers||[]); }
  catch(e){ renderAdminCustTable([{id:1,username:'rajkumar',email:'raj@email.com',name:'Raj Kumar',phone:'9876543210',order_count:3,total_spent:'3748',joined:'Nov 1, 2024',is_active:true},{id:2,username:'priya99',email:'priya@email.com',name:'Priya Sharma',phone:'9988776655',order_count:1,total_spent:'899',joined:'Dec 5, 2024',is_active:true}]); }
}
function renderAdminCustTable(custs){
  document.getElementById('admin-cust-tbody').innerHTML=custs.map(c=>`<tr><td><strong style="color:var(--white)">${c.name||c.username}</strong></td><td>${c.email}</td><td>${c.phone||'—'}</td><td>${c.order_count||0}</td><td><strong style="color:var(--red);font-family:var(--font-d);font-size:18px">₹${c.total_spent||0}</strong></td><td>${c.joined||c.date_joined||'—'}</td><td><span class="st-badge ${c.is_active?'st-confirmed':'st-cancelled'}">${c.is_active?'Active':'Inactive'}</span></td></tr>`).join('');
}

/* ─── ADMIN COUPONS ──────────────────── */
async function loadAdminCoupons(){
  const tbody=document.getElementById('admin-coupon-tbody');
  try { const d=await api('/mustmuscles/api/admin/coupons/'); renderAdminCouponTable(d.coupons||[]); }
  catch(e){ renderAdminCouponTable(DUMMY.coupons); }
}
function renderAdminCouponTable(coupons){
  document.getElementById('admin-coupon-tbody').innerHTML=coupons.map(c=>`
    <tr>
      <td><strong style="font-family:var(--font-h);font-size:15px;letter-spacing:2px;color:var(--gold)">${c.code}</strong></td>
      <td>${c.discount_type==='percent'?'%':'₹'}</td>
      <td><strong style="color:var(--white)">${c.discount_type==='percent'?c.discount_value+'%':'₹'+c.discount_value}</strong></td>
      <td>₹${c.min_order_amount||0}</td>
      <td>${c.used_count||0} / ${c.max_uses||'∞'}</td>
      <td>${c.valid_until?c.valid_until.split('T')[0]:'No expiry'}</td>
      <td><span class="st-badge ${c.is_active?'st-confirmed':'st-cancelled'}">${c.is_active?'Active':'Inactive'}</span></td>
    </tr>`).join('');
}
async function submitCouponForm(){
  const data={
    code:document.getElementById('cpf-code').value.trim().toUpperCase(),
    discount_type:document.getElementById('cpf-type').value,
    discount_value:document.getElementById('cpf-val').value,
    min_order_amount:document.getElementById('cpf-min').value||0,
    max_uses:document.getElementById('cpf-max').value||null,
    valid_until:document.getElementById('cpf-until').value||null,
    is_active:true,
  };
  if(!data.code||!data.discount_value){toast('Code and value required','error');return;}
  try { await api('/mustmuscles/api/admin/coupons/','POST',data); }
  catch(e){ DUMMY.coupons.push({...data,id:Date.now(),used_count:0}); }
  closeModal('coupon-form-modal'); loadAdminCoupons(); toast('Coupon created!','success');
}

/* ─── ADMIN LOW STOCK ────────────────── */
async function loadAdminLowStock(){
  const tbody=document.getElementById('admin-lowstock-tbody');
  try { const d=await api('/mustmuscles/api/admin/low-stock/'); renderLowStockTable(d.low_stock||[]); updateLowStockBadge(d.low_stock.length); }
  catch(e){ const ls=DUMMY.products.filter(p=>parseInt(p.stock||0)<=5); renderLowStockTable(ls); updateLowStockBadge(ls.length); }
}
function renderLowStockTable(prods){
  document.getElementById('admin-lowstock-tbody').innerHTML=prods.length?prods.map(p=>`<tr><td><strong style="color:var(--white)">${p.name}</strong></td><td style="color:var(--gray3)">${p.sku||'—'}</td><td><strong style="color:${parseInt(p.stock||0)===0?'var(--red)':'var(--gold)'};font-size:18px">${p.stock||0}</strong> ${parseInt(p.stock||0)===0?'OUT OF STOCK ⛔':'⚠️'}</td><td>₹${p.price}</td><td><button class="tbl-btn" onclick="editProduct('${p.id||p.slug}')"><i class="fas fa-edit"></i></button></td></tr>`).join('')
  :'<tr><td colspan="5" style="text-align:center;color:var(--green);padding:24px;font-family:var(--font-h);letter-spacing:2px">✓ All products well-stocked!</td></tr>';
}

/* ─── ADMIN ANALYTICS ────────────────── */
async function loadAdminAnalytics(){
  try { const d=await api('/mustmuscles/api/admin/analytics/'); renderAnalyticsData(d); }
  catch(e){ renderAnalyticsData({total_revenue:'2,84,392',top_products:[{product_name:'Hot Wheels Bone Shaker',total_sold:87,revenue:'12,963'},{product_name:'Ferrari 488 GTB',total_sold:34,revenue:'30,566'},{product_name:'Lamborghini Huracán',total_sold:29,revenue:'21,721'}],category_breakdown:[{category__name:'Hot Wheels',count:248},{category__name:'Sports Cars',count:192},{category__name:'Muscle Cars',count:156}]}); }
}
function renderAnalyticsData(d){
  document.getElementById('analytics-stat-cards').innerHTML=`
    <div class="stat-card"><div class="stat-icon"><i class="fas fa-rupee-sign"></i></div><div class="stat-val">₹${d.total_revenue||0}</div><div class="stat-lbl">Total Revenue</div></div>`;
  document.getElementById('analytics-top-tbody').innerHTML=(d.top_products||[]).map(p=>`<tr><td><strong style="color:var(--white)">${p.product_name}</strong></td><td>${p.total_sold}</td><td>₹${p.revenue||0}</td></tr>`).join('');
  document.getElementById('analytics-cat-tbody').innerHTML=(d.category_breakdown||[]).map(c=>`<tr><td><strong style="color:var(--white)">${c.category__name||'—'}</strong></td><td>${c.count}</td></tr>`).join('');
}

/* ─── ADMIN BANNERS ──────────────────── */
async function loadAdminBanners(){
  try { const d=await api('/mustmuscles/api/admin/banners/'); renderAdminBannersTable(d.banners||[]); }
  catch(e){ renderAdminBannersTable([{id:1,title:'SUMMER RACE COLLECTION',subtitle:'Up to 30% off on Hot Wheels',cta_text:'Shop Now',is_active:true}]); }
}
function renderAdminBannersTable(banners){
  document.getElementById('admin-banners-tbody').innerHTML=banners.map(b=>`<tr><td><strong style="color:var(--white)">${b.title}</strong></td><td style="color:var(--gray4)">${b.subtitle||'—'}</td><td><span class="st-badge st-confirmed">${b.cta_text||'Shop Now'}</span></td><td><span class="st-badge ${b.is_active?'st-confirmed':'st-cancelled'}">${b.is_active?'Active':'Inactive'}</span></td></tr>`).join('');
}
async function submitBannerForm(){
  const data={title:document.getElementById('bf-title').value.trim(),subtitle:document.getElementById('bf-subtitle').value,link:document.getElementById('bf-link').value,cta_text:document.getElementById('bf-cta').value||'Shop Now'};
  if(!data.title){toast('Banner title required','error');return;}
  try { await api('/mustmuscles/api/admin/banners/','POST',data); } catch(e){}
  closeModal('banner-form-modal'); loadAdminBanners(); toast('Banner created!','success');
}

/* ─────────────────────────────────────────────────────────────────
   MODAL SYSTEM
───────────────────────────────────────────────────────────────── */
function openModal(id){
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(id){
  document.getElementById(id)?.classList.remove('open');
  if(!document.querySelector('.modal-backdrop.open')) document.body.style.overflow='';
}
function closeAllModals(){ document.querySelectorAll('.modal-backdrop').forEach(m=>m.classList.remove('open')); document.body.style.overflow=''; }
// Close modal on backdrop click
document.querySelectorAll('.modal-backdrop').forEach(m=>{ m.addEventListener('click',e=>{ if(e.target===m) closeModal(m.id); }); });

/* ─────────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────────── */
function toast(msg, type='info'){
  const stack=document.getElementById('toast-stack');
  const t=document.createElement('div');
  t.className=`toast toast-${type}`;
  const icon={success:'fa-check-circle',error:'fa-times-circle',info:'fa-info-circle'}[type]||'fa-info-circle';
  t.innerHTML=`<i class="fas ${icon}"></i>${msg}`;
  stack.appendChild(t);
  setTimeout(()=>t.remove(),3700);
}

/* ─────────────────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────────────── */
// Check if user session exists
(async function checkSession(){
  try {
    const d = await api('/mustmuscles/api/user/profile/');
    if(d.username){
      S.user={username:d.username,role:'customer',first_name:d.first_name,email:d.email};
      onLoginSuccess();
    }
  } catch(e){}
})();

// Initialize cat select in shop for footer links

/* ═══════════════════════════════════════════════════════════
   HERO CAR CAROUSEL — 3-car triangle clockwise rotation
═══════════════════════════════════════════════════════════ */
(function() {
  let current = 0;
  const total = 3;
  let timer = null;

  // Positions cycle clockwise: active→right→left→active
  // State array: [position-of-car-0, position-of-car-1, position-of-car-2]
  // positions: 'active', 'right', 'left'
  const positions = ['hcar-active', 'hcar-right', 'hcar-left'];

  // Initial mapping: car 0 = active, car 1 = right, car 2 = left
  let stateMap = [0, 1, 2]; // stateMap[carIndex] = positionIndex

  function getSlides() {
    return document.querySelectorAll('.hcar-slide');
  }
  function getDots() {
    return document.querySelectorAll('.hcar-dot');
  }

  function applyState() {
    const slides = getSlides();
    const dots = getDots();
    if (!slides.length) return;

    slides.forEach((slide, i) => {
      slide.classList.remove('hcar-active', 'hcar-right', 'hcar-left');
      slide.classList.add(positions[stateMap[i]]);
    });

    // Active car = whichever has positionIndex 0 (active)
    const activeCar = stateMap.indexOf(0);
    dots.forEach((dot, i) => {
      dot.classList.toggle('hcar-dot-active', i === activeCar);
    });
  }

  function rotateCW() {
    // Clockwise: active→left, right→active, left→right
    stateMap = stateMap.map(pos => (pos + 1) % 3);
    applyState();
  }

  window.heroCarGoTo = function(targetCar) {
    // Figure out how many clockwise steps to bring targetCar to active (pos 0)
    const steps = stateMap[targetCar]; // current pos of targetCar; need 0 steps if already 0
    // To get pos to 0: rotate (3 - pos) times clockwise
    const needed = (3 - stateMap[targetCar]) % 3;
    for (let s = 0; s < needed; s++) {
      stateMap = stateMap.map(pos => (pos + 1) % 3);
    }
    applyState();
    resetTimer();
  };

  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(rotateCW, 3000);
  }

  function init() {
    const stage = document.getElementById('heroCarStage');
    if (!stage) { setTimeout(init, 300); return; }
    applyState();
    resetTimer();
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

window.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('page-home').classList.add('active');
});
