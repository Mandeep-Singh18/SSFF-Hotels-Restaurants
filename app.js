// Application state
let activeTab = 'sweets';
let searchQuery = '';
let cart = {}; // itemId -> quantity

// Page Load Setup
window.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Check operating hours
  updateBusinessStatus();
  setInterval(updateBusinessStatus, 60000); // Check status every minute

  // Render menu initially
  renderMenu();

  // Set up mobile menu handlers
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const burgerIcon = document.getElementById('menu-icon-burger');
  const closeIcon = document.getElementById('menu-icon-close');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileNav.classList.toggle('hidden');
      burgerIcon.classList.toggle('hidden', !isHidden);
      closeIcon.classList.toggle('hidden', isHidden);
    });
  }

  // Close mobile menu on clicking any navigation link
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
      burgerIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    });
  });
});

// 1. Business Status Indicator Logic
function updateBusinessStatus() {
  // Get current date time in Indian Standard Time (UTC+5:30)
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (3600000 * 5.5));
  
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const currentTimeVal = hours * 100 + minutes; // Format: HHMM

  // Shop opening timings: 6:00 AM (0600) to 10:00 PM (2200)
  const openTime = 600;
  const closeTime = 2200;

  const isOpen = currentTimeVal >= openTime && currentTimeVal < closeTime;

  // Badges templates
  const openBadge = `
    <span class="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm animate-pulse-slow">
      <span class="w-2 h-2 mr-2 bg-emerald-500 rounded-full animate-status-pulse"></span>
      🟢 Open Now (until 10:00 PM)
    </span>
  `;

  const closedBadge = `
    <span class="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-800 border border-rose-200 shadow-sm">
      <span class="w-2.5 h-2.5 mr-2 bg-rose-500 rounded-full"></span>
      🔴 Closed Now (Opens at 6:00 AM)
    </span>
  `;

  const selectedBadge = isOpen ? openBadge : closedBadge;

  const badgeDesk = document.getElementById('shop-status-badge');
  const badgeMob = document.getElementById('shop-status-badge-mobile');

  if (badgeDesk) badgeDesk.innerHTML = selectedBadge;
  if (badgeMob) badgeMob.innerHTML = selectedBadge;
}

// 2. Tab Navigation & Search Logic
function setActiveTab(tab) {
  activeTab = tab;
  
  const tabs = ['sweets', 'snacks', 'bakery'];
  tabs.forEach(t => {
    const tabEl = document.getElementById(`tab-${t}`);
    if (tabEl) {
      if (t === tab) {
        tabEl.className = 'py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-sm md:text-base flex flex-col sm:flex-row items-center justify-center transition-all duration-300 bg-primary text-white shadow-premium';
      } else {
        tabEl.className = 'py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-sm md:text-base flex flex-col sm:flex-row items-center justify-center transition-all duration-300 text-charcoal hover:text-primary';
      }
    }
  });

  renderMenu();
}

function handleSearch() {
  const searchInput = document.getElementById('menu-search');
  const clearBtn = document.getElementById('search-clear-btn');
  
  searchQuery = searchInput.value.toLowerCase().trim();
  
  if (searchQuery.length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }

  renderMenu();
}

function clearSearch() {
  const searchInput = document.getElementById('menu-search');
  searchInput.value = '';
  searchQuery = '';
  document.getElementById('search-clear-btn').classList.add('hidden');
  renderMenu();
}

// Find a menu item by ID across categories
function findMenuItemById(id) {
  return [...menuItems.sweets, ...menuItems.snacks, ...menuItems.bakery].find(item => item.id === id);
}

// Render Digital Menu Items dynamically
function renderMenu() {
  const grid = document.getElementById('menu-grid');
  const emptyState = document.getElementById('menu-empty-state');
  grid.innerHTML = '';
  
  // Filter current category items by search query
  const currentCategoryItems = menuItems[activeTab];
  const filteredItems = currentCategoryItems.filter(item => {
    return item.name.toLowerCase().includes(searchQuery) || item.desc.toLowerCase().includes(searchQuery);
  });

  if (filteredItems.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  } else {
    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');
  }

  filteredItems.forEach(item => {
    const itemQuantityInCart = cart[item.id] || 0;
    
    // Build webp path from jpg path for better performance
    const webpSrc = item.image.replace(/\.jpg$/i, '.webp');
    let mediaContent = `
      <picture>
        <source srcset="${webpSrc}" type="image/webp">
        <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" class="w-full h-full object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-300">
      </picture>`;

    // Create card node
    const card = document.createElement('div');
    card.className = 'bg-cream rounded-3xl p-5 border border-primary/5 shadow-premium hover:shadow-gold-glow transition-all duration-300 flex flex-col justify-between hover:border-gold/30 group shimmer-hover';
    
    // Generate Cart Controls based on quantity
    let cartControls = '';
    if (itemQuantityInCart > 0) {
      cartControls = `
        <div class="flex items-center space-x-2.5 bg-secondary/10 px-3 py-1.5 rounded-2xl border border-secondary/20">
          <button onclick="updateCartQty('${item.id}', -1)" class="w-8 h-8 rounded-xl bg-secondary hover:bg-secondary-light flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95" aria-label="Decrease quantity">
            <i data-lucide="minus" class="w-4 h-4"></i>
          </button>
          <span class="font-bold text-base text-charcoal w-6 text-center">${itemQuantityInCart}</span>
          <button onclick="updateCartQty('${item.id}', 1)" class="w-8 h-8 rounded-xl bg-secondary hover:bg-secondary-light flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95" aria-label="Increase quantity">
            <i data-lucide="plus" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    } else {
      cartControls = `
        <button onclick="updateCartQty('${item.id}', 1)" class="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-primary-light hover:from-secondary hover:to-secondary text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
          <i data-lucide="plus" class="w-4 h-4 mr-1.5"></i>
          Add to Order
        </button>
      `;
    }

    // Unit label mapping
    const unitLabel = item.unit === 'kg' ? 'kg' : item.unit === 'piece' ? 'pc' : item.unit;

    card.innerHTML = `
      <!-- Card Image / SVG Asset Container -->
      <div class="aspect-square w-full bg-cream-dark/40 rounded-2xl p-3 mb-4 border border-primary/5 flex items-center justify-center relative overflow-hidden group-hover:bg-cream-dark/65 transition-colors duration-300">
        ${mediaContent}
        <!-- Absolute badges -->
        ${item.badge ? `
          <span class="absolute top-3 left-3 px-2.5 py-1 text-[9px] uppercase tracking-widest font-extrabold bg-primary text-white rounded-lg shadow-sm border border-gold/10">
            ${item.badge}
          </span>
        ` : ''}
      </div>

      <!-- Card Texts -->
      <div class="flex-grow space-y-2">
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-extrabold text-charcoal font-playfair group-hover:text-primary transition-colors">${item.name}</h3>
          <span class="text-lg font-bold text-secondary text-right">₹${item.price}<span class="text-xs text-charcoal-light font-normal">/${unitLabel}</span></span>
        </div>
        <p class="text-xs text-charcoal-light leading-relaxed min-h-[40px]">${item.desc}</p>
      </div>

      <!-- Card Footer (Quantity adjustments / Add) -->
      <div class="pt-4 mt-4 border-t border-primary/5 flex items-center justify-between">
        <span class="text-xs text-charcoal-light font-medium uppercase tracking-wide">Select Qty</span>
        <div class="flex-shrink-0">
          ${cartControls}
        </div>
      </div>
    `;
    
    grid.appendChild(card);
  });

  // Rerender icons loaded dynamically inside the cards
  lucide.createIcons();
}

// 3. Cart & Ordering Actions
function updateCartQty(id, change) {
  const currentQty = cart[id] || 0;
  const newQty = currentQty + change;
  
  if (newQty <= 0) {
    delete cart[id];
  } else {
    cart[id] = newQty;
  }

  // Synchronize changes back to UI
  renderMenu();
  updateStickyCartBar();
  renderCartDrawerList();
}

function clearCart() {
  cart = {};
  renderMenu();
  updateStickyCartBar();
  renderCartDrawerList();
  toggleCartDrawer(false);
}

// Helper to sum quantities and prices
function calculateCartTotal() {
  let total = 0;
  let count = 0;

  for (const [id, qty] of Object.entries(cart)) {
    const item = findMenuItemById(id);
    if (item) {
      total += item.price * qty;
      count += qty;
    }
  }

  return { total, count };
}

function updateStickyCartBar() {
  const bar = document.getElementById('sticky-cart-bar');
  const badge = document.getElementById('cart-badge-count');
  const totalSpan = document.getElementById('cart-total-price');

  const { total, count } = calculateCartTotal();

  if (count > 0) {
    bar.classList.remove('translate-y-full'); // slide-in
    badge.innerText = count;
    totalSpan.innerText = `₹${total}.00`;
  } else {
    bar.classList.add('translate-y-full'); // slide-out
  }
}

function toggleCartDrawer(isOpen) {
  const overlay = document.getElementById('cart-drawer-overlay');
  const container = document.getElementById('cart-drawer-container');

  if (isOpen) {
    overlay.classList.remove('pointer-events-none', 'opacity-0');
    container.classList.remove('translate-y-full');
    renderCartDrawerList();
  } else {
    overlay.classList.add('pointer-events-none', 'opacity-0');
    container.classList.add('translate-y-full');
  }
}

function renderCartDrawerList() {
  const listContainer = document.getElementById('cart-drawer-list');
  const totalSpan = document.getElementById('cart-drawer-total');
  
  listContainer.innerHTML = '';
  
  const { total, count } = calculateCartTotal();
  totalSpan.innerText = `₹${total}.00`;

  if (count === 0) {
    listContainer.innerHTML = `
      <div class="text-center py-12 text-charcoal-light flex flex-col items-center justify-center space-y-3">
        <i data-lucide="shopping-bag" class="w-12 h-12 text-primary/20"></i>
        <p class="font-semibold text-sm">Your order is empty.</p>
        <p class="text-xs">Browse menu items and tap '+' to add them here.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  for (const [id, qty] of Object.entries(cart)) {
    const item = findMenuItemById(id);
    if (item) {
      const itemRow = document.createElement('div');
      itemRow.className = 'flex items-center justify-between p-3.5 bg-white border border-primary/5 rounded-2xl shadow-sm';
      
      const unitText = item.unit === 'kg' ? 'kg' : item.unit === 'piece' ? 'pc' : item.unit;
      const labelMultiplier = item.unit === 'kg' ? ' (1kg)' : '';

      let listIcon = `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-lg">`;

      itemRow.innerHTML = `
        <div class="flex items-center space-x-3.5">
          <div class="w-10 h-10 bg-cream-dark/50 rounded-xl flex items-center justify-center p-1 border border-primary/5 flex-shrink-0 overflow-hidden">
            ${listIcon}
          </div>
          <div>
            <span class="block font-bold text-sm text-charcoal">${item.name}</span>
            <span class="block text-xs text-charcoal-light">₹${item.price}/${unitText}</span>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Item Subtotal -->
          <span class="font-bold text-sm text-primary">₹${item.price * qty}</span>
          
          <!-- Quantity adjustment buttons inside cart -->
          <div class="flex items-center space-x-1.5 bg-cream border border-primary/10 rounded-xl p-1">
            <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 rounded-lg bg-primary hover:bg-primary-light flex items-center justify-center text-white transition-all" aria-label="Decrease quantity">
              <i data-lucide="minus" class="w-3.5 h-3.5"></i>
            </button>
            <span class="text-xs font-bold text-charcoal w-5 text-center">${qty}</span>
            <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 rounded-lg bg-primary hover:bg-primary-light flex items-center justify-center text-white transition-all" aria-label="Increase quantity">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
      
      listContainer.appendChild(itemRow);
    }
  }

  lucide.createIcons();
}

// WhatsApp Message compilation & Redirection
function sendWhatsAppOrder() {
  const { total, count } = calculateCartTotal();
  if (count === 0) return;

  let orderText = "Namaste Saini Sweets! I would like to place an order for pickup:\n";
  
  for (const [id, qty] of Object.entries(cart)) {
    const item = findMenuItemById(id);
    if (item) {
      const unitStr = item.unit === 'kg' ? ' (1kg)' : '';
      orderText += `- ${qty}x ${item.name}${unitStr}\n`;
    }
  }
  
  orderText += `Total Estimated: ₹${total}\n`;

  // Get user instructions if any
  const notes = document.getElementById('order-notes').value.trim();
  if (notes.length > 0) {
    orderText += `\n*Special Instructions:* ${notes}\n`;
  }

  orderText += "\nThank you!";

  const encodedText = encodeURIComponent(orderText);
  const whatsappUrl = `https://wa.me/918930015338?text=${encodedText}`;
  
  window.open(whatsappUrl, '_blank');
}
