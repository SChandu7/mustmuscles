/* ═══════════════════════════════════════════════════════════════════
   MUSTMUSCLES — mobile.js
   Mobile-specific enhancements: hamburger, shop sidebar toggle,
   touch events, body-scroll lock
═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── HAMBURGER MENU ──────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    // Override the existing toggleMobileMenu
    window.toggleMobileMenu = function () {
      const isOpen = navLinks.classList.toggle('mobile-open');
      hamburger.classList.toggle('open', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
    };

    // Close menu when a nav link is tapped
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        navLinks.classList.remove('mobile-open');
        hamburger.classList.remove('open');
        document.body.classList.remove('no-scroll');
      }
    });

    // Close on outside tap
    document.addEventListener('click', function (e) {
      if (
        navLinks.classList.contains('mobile-open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        navLinks.classList.remove('mobile-open');
        hamburger.classList.remove('open');
        document.body.classList.remove('no-scroll');
      }
    });
  }

  /* ─── SHOP SIDEBAR TOGGLE ─────────────────────────────────────── */
  function injectShopSidebarToggle () {
    const sidebar = document.querySelector('.shop-sidebar');
    if (!sidebar || document.querySelector('.shop-sidebar-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'shop-sidebar-toggle';
    btn.style.cssText = `
      display: none;
      width: 100%; padding: 14px 22px;
      background: var(--surface); border: none;
      border-bottom: 1px solid var(--line); border-top: 2px solid var(--red);
      font-family: var(--f-sans); font-size: 11px; font-weight: 600;
      letter-spacing: 2px; text-transform: uppercase;
      color: var(--ink); align-items: center; justify-content: space-between;
    `;
    btn.innerHTML = `
      <span><i class="fas fa-sliders-h" style="color:var(--red);margin-right:8px"></i>FILTERS</span>
      <i class="fas fa-chevron-down toggle-arrow" style="font-size:11px;color:var(--ink-4);transition:transform .3s"></i>
    `;

    sidebar.parentNode.insertBefore(btn, sidebar);

    btn.addEventListener('click', function () {
      const open = sidebar.classList.toggle('sidebar-open');
      const arrow = btn.querySelector('.toggle-arrow');
      if (arrow) arrow.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
      btn.querySelector('span').innerHTML = open
        ? `<i class="fas fa-times" style="color:var(--red);margin-right:8px"></i>CLOSE FILTERS`
        : `<i class="fas fa-sliders-h" style="color:var(--red);margin-right:8px"></i>FILTERS`;
    });

    /* Show/hide toggle based on viewport */
    function checkViewport () {
      if (window.innerWidth <= 900) {
        btn.style.display = 'flex';
      } else {
        btn.style.display = 'none';
        sidebar.classList.remove('sidebar-open');
        // Reset max-height for desktop
        sidebar.style.maxHeight = '';
      }
    }
    checkViewport();
    window.addEventListener('resize', checkViewport);

    /* Close sidebar when a filter is applied on mobile */
    sidebar.addEventListener('change', function () {
      if (window.innerWidth <= 900) {
        // Don't auto-close — user may want to apply multiple filters
      }
    });
  }

  /* ─── BODY SCROLL LOCK ────────────────────────────────────────── */
  // Patch cartOpen / cartClose to lock body scroll on mobile
  const _origCartOpen  = window.cartOpen;
  const _origCartClose = window.cartClose;

  window.cartOpen = function () {
    if (_origCartOpen) _origCartOpen.apply(this, arguments);
    if (window.innerWidth <= 900) document.body.classList.add('no-scroll');
  };
  window.cartClose = function () {
    if (_origCartClose) _origCartClose.apply(this, arguments);
    document.body.classList.remove('no-scroll');
  };

  /* ─── MODAL BODY SCROLL LOCK ──────────────────────────────────── */
  const _origOpenModal  = window.openModal;
  const _origCloseModal = window.closeModal;
  const _origCloseAllModals = window.closeAllModals;

  window.openModal = function (id) {
    if (_origOpenModal) _origOpenModal.apply(this, arguments);
    document.body.classList.add('no-scroll');
  };
  window.closeModal = function (id) {
    if (_origCloseModal) _origCloseModal.apply(this, arguments);
    // Only remove if no other modal is open
    setTimeout(function () {
      if (!document.querySelector('.modal-backdrop.open') &&
          !document.getElementById('cart-drawer')?.classList.contains('open')) {
        document.body.classList.remove('no-scroll');
      }
    }, 50);
  };
  window.closeAllModals = function () {
    if (_origCloseAllModals) _origCloseAllModals.apply(this, arguments);
    document.body.classList.remove('no-scroll');
  };

  /* ─── SWIPE TO CLOSE CART DRAWER ─────────────────────────────── */
  (function initSwipeClose () {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer) return;
    let startX = 0, currentX = 0, isDragging = false;

    drawer.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    drawer.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      if (diff > 0) {
        drawer.style.transform = `translateX(${diff}px)`;
        drawer.style.transition = 'none';
      }
    }, { passive: true });

    drawer.addEventListener('touchend', function () {
      isDragging = false;
      const diff = currentX - startX;
      drawer.style.transition = '';
      if (diff > 80) {
        drawer.style.transform = '';
        window.cartClose();
      } else {
        drawer.style.transform = '';
      }
      startX = 0; currentX = 0;
    }, { passive: true });
  })();

  /* ─── SEARCH OVERLAY CLOSE ON BACK ───────────────────────────── */
  window.addEventListener('popstate', function () {
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay && searchOverlay.classList.contains('open')) {
      window.toggleSearch(false);
    }
  });

  /* ─── INIT ON DOMContentLoaded ────────────────────────────────── */
  function init () {
    injectShopSidebarToggle();

    // Re-inject after navigate() calls
    const _origNavigate = window.navigate;
    window.navigate = function (page, sub) {
      if (_origNavigate) _origNavigate.apply(this, arguments);
      // Close hamburger
      if (navLinks) navLinks.classList.remove('mobile-open');
      if (hamburger) hamburger.classList.remove('open');
      document.body.classList.remove('no-scroll');
      // Re-inject sidebar toggle if needed
      if (page === 'shop') {
        setTimeout(injectShopSidebarToggle, 80);
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ─── VIEWPORT HEIGHT FIX (iOS Safari 100vh bug) ─────────────── */
  function setVH () {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', function () {
    setTimeout(setVH, 200);
  });

})();
