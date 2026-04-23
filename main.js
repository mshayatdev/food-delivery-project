document.addEventListener("DOMContentLoaded", function () {

  // ===============================
  // 🔹 STATE MANAGEMENT (CART)
  // ===============================
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const cartCountEl        = document.getElementById("cartCount");
  const cartPriceEl        = document.getElementById("cartPrice");
  const cartTotalPriceEl   = document.getElementById("cartTotalPrice");
  const cartItemsList      = document.getElementById("cartItemsList");
  const checkoutSummaryItems = document.getElementById("checkoutSummaryItems");
  const checkoutSummaryTotal = document.getElementById("checkoutSummaryTotal");

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function renderCart() {
    let totalItems = 0;
    let totalPrice = 0;

    if (cartItemsList) cartItemsList.innerHTML = '';
    if (checkoutSummaryItems) checkoutSummaryItems.innerHTML = '';

    if (cart.length === 0) {
      if (cartItemsList) cartItemsList.innerHTML = '<p class="text-center mt-4 text-muted">Your cart is empty.</p>';
      if (checkoutSummaryItems) checkoutSummaryItems.innerHTML = '<p class="text-muted mb-0">No items in order.</p>';
    } else {
      cart.forEach((item, index) => {
        totalItems += item.quantity;
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;

        // Render in Offcanvas
        if (cartItemsList) {
          const cartItemDiv = document.createElement('div');
          cartItemDiv.className = 'cart-item d-flex align-items-center gap-3 mb-3 p-2 rounded';
          cartItemDiv.style.border = '1px solid #eee';
          
          const itemImg = item.img || 'images/default-food.png';
          
          cartItemDiv.innerHTML = `
            <img src="${itemImg}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
            <div class="flex-grow-1">
              <h6 class="mb-0 fw-bold" style="font-size: 14px;">${item.name}</h6>
              <div class="d-flex align-items-center gap-2 mt-1">
                <button class="qty-btn btn-minus" data-index="${index}" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #ddd; background: #fff; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
                <span class="fw-bold" style="font-size: 14px;">${item.quantity}</span>
                <button class="qty-btn btn-plus" data-index="${index}" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #ddd; background: #fff; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
              </div>
              <p class="mb-0 text-primary fw-bold" style="font-size: 13px;">GBP ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button class="cart-item-remove text-danger border-0 bg-transparent" data-index="${index}" style="font-size: 20px; font-weight: bold;">&times;</button>
          `;
          cartItemsList.appendChild(cartItemDiv);
        }

        // Render in Checkout Summary
        if (checkoutSummaryItems) {
          const summaryItemDiv = document.createElement('div');
          summaryItemDiv.className = 'order-summary-item d-flex justify-content-between mb-2';
          summaryItemDiv.innerHTML = `
            <span style="font-size: 14px;">${item.name} x${item.quantity}</span>
            <span style="font-size: 14px; font-weight: bold;">GBP ${itemTotal.toFixed(2)}</span>
          `;
          checkoutSummaryItems.appendChild(summaryItemDiv);
        }
      });
    }

    if (cartCountEl) cartCountEl.innerText = totalItems;
    if (cartPriceEl) cartPriceEl.innerText = totalPrice.toFixed(2);
    if (cartTotalPriceEl) cartTotalPriceEl.innerText = totalPrice.toFixed(2);
    if (checkoutSummaryTotal) checkoutSummaryTotal.innerText = totalPrice.toFixed(2);

    // Attach event listeners
    document.querySelectorAll('.btn-plus').forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'));
        cart[idx].quantity += 1;
        saveCart();
        renderCart();
      });
    });

    document.querySelectorAll('.btn-minus').forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'));
        if (cart[idx].quantity > 1) {
          cart[idx].quantity -= 1;
        } else {
          cart.splice(idx, 1);
        }
        saveCart();
        renderCart();
      });
    });

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-index'));
        cart.splice(idx, 1);
        saveCart();
        renderCart();
      });
    });
  }

  // Initial render on page load
  renderCart();

  // ===============================
  // 🔹 ADD TO CART
  // ===============================
  document.querySelectorAll('.add-btn, .add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();

      let name = this.getAttribute('data-name');
      let priceAttr = this.getAttribute('data-price');
      let imgAttr = this.getAttribute('data-img');
      let price = 0;
      let img = '';

      if (!name) {
        const card = this.closest('.menu-card') || this.closest('.food-card') || this.closest('.offer-banner');
        if (card) {
          name = card.getAttribute('data-name') ||
                 card.querySelector('.menu-card-title')?.innerText ||
                 card.querySelector('.offer-label')?.innerText ||
                 card.querySelector('.text-white.fw-bold.fs-6')?.innerText ||
                 'Special Offer Item';

          const priceEl = card.querySelector('.menu-card-price');
          if (priceEl) {
            const match = priceEl.innerText.match(/[\d.]+/);
            if (match) price = parseFloat(match[0]);
          } else {
            price = 12.99;
          }

          // Priority 1: Specific food image classes
          const foodImg = card.querySelector('.food-img, .menu-card-img, .offer-banner img, .card-img-top');
          
          if (foodImg) {
            img = foodImg.getAttribute('src');
          } else {
            // Priority 2: Any image that is NOT the globe icon (Rectangle 47)
            const otherImg = card.querySelector('img:not([src*="Rectangle 47"])');
            if (otherImg) img = otherImg.getAttribute('src');
          }
          
          // Fallback if still no image
          if (!img) {
            const anyImg = card.querySelector('img');
            if (anyImg) img = anyImg.getAttribute('src');
          }
        }
      } else {
        price = parseFloat(priceAttr);
        img = imgAttr || '';
      }

      // If img is still empty (e.g. data-img was missing), try to find it in the card
      if (!img) {
        const card = this.closest('.menu-card') || this.closest('.food-card') || this.closest('.offer-banner');
        if (card) {
          const foodImg = card.querySelector('.food-img, .menu-card-img, .offer-banner img, .card-img-top');
          if (foodImg) {
            img = foodImg.getAttribute('src');
          } else {
            const otherImg = card.querySelector('img:not([src*="Rectangle 47"])');
            if (otherImg) img = otherImg.getAttribute('src');
          }
        }
      }

      if (!name) return;

      const existingItem = cart.find(item => item.name === name);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ name, price, quantity: 1, img });
      }

      saveCart();
      renderCart();

      // Visual feedback on button
      const originalText = this.textContent;
      this.textContent = '✓';
      this.style.background = '#1a1f3a';
      setTimeout(() => {
        this.textContent = originalText;
        this.style.background = '';
      }, 800);
    });
  });

  // ===============================
  // 🔹 LOCATION MODAL
  // ===============================
  const locationBtn = document.getElementById('locationBtn');
  if (locationBtn) {
    locationBtn.addEventListener('click', () => {
      const modalEl = document.getElementById('locationModal');
      if (modalEl) new bootstrap.Modal(modalEl).show();
    });
  }

  const saveAddressBtn = document.getElementById('saveAddressBtn');
  if (saveAddressBtn) {
    saveAddressBtn.addEventListener('click', () => {
      const input       = document.getElementById("newAddress");
      const addressText = document.getElementById("addressText");
      const modalEl     = document.getElementById('locationModal');
      if (input && addressText && input.value.trim() !== "") {
        addressText.innerText = input.value;
      }
      if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
    });
  }

  // ===============================
  // 🔹 HERO SEARCH
  // ===============================
  const searchBtn     = document.getElementById('searchBtn');
  const postcodeInput = document.getElementById('postcodeInput');

  function doSearch() {
    if (!postcodeInput || !postcodeInput.value.trim()) {
      alert('Please enter a postcode to search.');
      return;
    }
    alert('Searching for delivery to: ' + postcodeInput.value.toUpperCase());
  }

  if (searchBtn) searchBtn.addEventListener('click', doSearch);
  if (postcodeInput) {
    postcodeInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearch();
    });
  }

  // ===============================
  // 🔹 DEAL FILTER TABS
  // ===============================
  const tabs  = document.querySelectorAll('.filter-tab');
  const items = document.querySelectorAll('.deal-item');

  if (tabs.length && items.length) {
    const categoryMap = {
      'Vegan': 'vegan',
      'Sushi': 'sushi',
      'Pizza & Fast food': 'fastfood',
      'others': 'others'
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const cat = categoryMap[this.textContent.trim()] || '';
        items.forEach(item => {
          item.style.display = (!cat || item.dataset.category === cat) ? 'block' : 'none';
        });
      });
    });
  }

  // ===============================
  // 🔹 CHECKOUT FORM
  // ===============================
  const payCardRadio = document.getElementById('payCard');
  const payCodRadio  = document.getElementById('payCod');
  const ccInfoBox    = document.getElementById('ccInfoBox');

  if (payCardRadio && payCodRadio && ccInfoBox) {
    payCardRadio.addEventListener('change', () => {
      if (payCardRadio.checked) ccInfoBox.classList.remove('d-none');
    });
    payCodRadio.addEventListener('change', () => {
      if (payCodRadio.checked) ccInfoBox.classList.add('d-none');
    });
  }

  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (cart.length === 0) {
        alert("Your cart is empty. Add items before placing an order.");
        return;
      }

      if (payCardRadio && payCardRadio.checked) {
        const ccNumber = document.getElementById('ccNumber')?.value;
        if (!ccNumber) {
          alert("Please enter credit card information.");
          return;
        }
      }

      alert("Order Placed Successfully! 🎉");

      cart = [];
      saveCart();
      renderCart();

      const modalEl = document.getElementById('checkoutModal');
      if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

      checkoutForm.reset();
      if (ccInfoBox) ccInfoBox.classList.add('d-none');
    });
  }

  // ===============================
  // 🔹 REVIEW SLIDER
  // ===============================
  const rvCarousel = document.getElementById('rvCarousel');
  const rvPrev     = document.getElementById('rvPrev');
  const rvNext     = document.getElementById('rvNext');

  if (rvCarousel && rvPrev && rvNext) {
    let currentIndex = 0;
    const totalCards = rvCarousel.querySelectorAll('.rv-card').length;

    function getCardWidth() {
      const card = rvCarousel.querySelector('.rv-card');
      if (!card) return 320;
      const gap = parseFloat(window.getComputedStyle(rvCarousel).gap) || 20;
      return card.offsetWidth + gap;
    }

    function getVisibleCount() {
      const viewport = rvCarousel.parentElement;
      if (!viewport) return 1;
      const card = rvCarousel.querySelector('.rv-card');
      if (!card) return 1;
      const gap = parseFloat(window.getComputedStyle(rvCarousel).gap) || 20;
      return Math.max(1, Math.floor(viewport.offsetWidth / (card.offsetWidth + gap)));
    }

    function updateSlider() {
      const maxIndex = Math.max(0, totalCards - getVisibleCount());
      currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
      rvCarousel.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
    }

    rvNext.addEventListener('click', () => { currentIndex++; updateSlider(); });
    rvPrev.addEventListener('click', () => { currentIndex--; updateSlider(); });
    window.addEventListener('resize', () => { currentIndex = 0; updateSlider(); });
  }

  // ===============================
  // 🔹 NAVBAR ACTIVE STATE & SCROLL-SPY
  // ===============================
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const sections = {
    'browse-menu': document.getElementById('browse-menu'),
    'deals-section': document.getElementById('deals-section')
  };

  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      const href = this.getAttribute('href');
      if (href.startsWith('#') && href.length > 1) {
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 150;
    for (const [id, section] of Object.entries(sections)) {
      if (section && scrollPos >= section.offsetTop) current = id;
    }
    if (current) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) link.classList.add('active');
      });
    } else if (window.scrollY < 200 && (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/'))) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.textContent.trim() === 'Home') link.classList.add('active');
      });
    }
  });
});