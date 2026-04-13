document.addEventListener("DOMContentLoaded", function () {

  // ===============================
  // 🔹 MODAL (Location)
  // ===============================
  window.openModal = function () {
    const modalEl = document.getElementById('locationModal');
    if (modalEl) {
      let modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  };

  window.saveAddress = function () {
    const input = document.getElementById("newAddress");
    const addressText = document.getElementById("addressText");
    const modalEl = document.getElementById('locationModal');

    if (input && addressText && input.value.trim() !== "") {
      addressText.innerText = input.value;
    }

    if (modalEl) {
      bootstrap.Modal.getInstance(modalEl)?.hide();
    }
  };


  // ===============================
  // 🔹 CART UPDATE
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', function () {

      console.log("clicked");

      const card = btn.closest('.menu-card'); // ✅ FIX

      if (!card) {
        console.log("card not found ❌");
        return;
      }

      const nameEl = card.querySelector('.menu-card-title');
      const priceEl = card.querySelector('.menu-card-price');

      if (!nameEl || !priceEl) {
        console.log("data not found ❌");
        return;
      }

      const name = nameEl.innerText;
      const price = parseFloat(priceEl.innerText.replace('£', ''));

      cart.push({
        name,
        price,
        qty: 1   // ✅ ADD THIS
      });

      localStorage.setItem("cart", JSON.stringify(cart));

      updateCart();

      console.log("added:", name);
    });
  });


  function updateCart() {
    const count = document.getElementById("cartCount");
    const total = document.getElementById("cartPrice");

    let totalItems = cart.length;
    let totalPrice = 0;

    cart.forEach(item => {
      totalPrice += item.price;
    });

    if (count) count.innerText = totalItems;
    if (total) total.innerText = totalPrice.toFixed(2);
  }


  // ===============================
  // 🔹 HERO SEARCH
  // ===============================
  window.handleSearch = function () {
    const input = document.getElementById('postcodeInput');
    if (!input || !input.value.trim()) {
      alert('Please enter a postcode to search.');
      return;
    }
    alert('Searching for delivery to: ' + input.value.toUpperCase());
  };

  const postcodeInput = document.getElementById('postcodeInput');
  if (postcodeInput) {
    postcodeInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleSearch();
    });
  }


  // ===============================
  // 🔹 CARD HOVER EFFECT
  // ===============================
  document.querySelectorAll('.notify-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-3px) scale(1.02)';
      card.style.transition = 'transform 0.2s ease';
      card.style.boxShadow = '0 8px 28px rgba(0,0,0,0.22)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    });
  });


  // ===============================
  // 🔹 DEAL FILTER TABS
  // ===============================
  const tabs = document.querySelectorAll('.filter-tab');
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

        const label = this.textContent.trim();
        const cat = categoryMap[label] || '';

        items.forEach(item => {
          item.style.display = (!cat || item.dataset.category === cat) ? 'block' : 'none';
        });
      });
    });
  }


  // ===============================
  // 🔹 NAVBAR SCROLL + ACTIVE
  // ===============================
  const navPills = document.querySelectorAll('.nav-pill');
  const sections = document.querySelectorAll('section[id]');

  if (navPills.length) {

    navPills.forEach(pill => {
      pill.addEventListener('click', e => {
        e.preventDefault();

        navPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const target = document.querySelector(pill.getAttribute('href'));
        if (target) {
          const offset = 56;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    window.addEventListener('scroll', () => {
      let current = '';

      sections.forEach(sec => {
        if (window.pageYOffset >= sec.offsetTop - 70) {
          current = sec.id;
        }
      });

      navPills.forEach(p => {
        p.classList.remove('active');
        if (p.getAttribute('href') === '#' + current) {
          p.classList.add('active');
        }
      });
    });
  }


  // ===============================
  // 🔹 ADD TO CART BUTTON
  // ===============================
  let cartCount = 0;

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();

      cartCount++;
      btn.textContent = '✓';
      btn.style.background = '#1a1f3a';

      setTimeout(() => {
        btn.textContent = '+';
        btn.style.background = '#f5a623';
      }, 800);
    });
  });


  // ===============================
  // 🔹 MENU SEARCH FILTER
  // ===============================
  window.filterMenuItems = function (query) {
    document.querySelectorAll('.menu-card').forEach(card => {
      const name = card.getAttribute('data-name') || '';
      const col = card.closest('[class*="col"]');

      if (col) {
        col.style.display = name.includes(query) ? '' : 'none';
      }
    });

    sections.forEach(sec => {
      const visible = [...sec.querySelectorAll('[class*="col"]')]
        .some(c => c.style.display !== 'none');

      const heading = sec.querySelector('.section-heading');

      if (heading) {
        heading.style.display = (visible || sec.id === 'offers') ? '' : 'none';
      }
    });
  };


  // ===============================
  // 🔹 REVIEW CAROUSEL (FIXED ✅)
  // ===============================

  const rvCarousel = document.getElementById('rvCarousel');

  if (rvCarousel) {   // 🔥 IMPORTANT CHECK

    const rvCards = rvCarousel.querySelectorAll('.rv-card');
    let current = 0;

    function updateSlider(index) {
      const perView = window.innerWidth < 768 ? 1 : 3;
      const maxIndex = rvCards.length - perView;

      current = Math.max(0, Math.min(index, maxIndex));

      const cardWidth = rvCards[0].offsetWidth + 20;
      rvCarousel.style.transform = `translateX(-${current * cardWidth}px)`;
    }

    const nextBtn = document.getElementById('rvNext');
    const prevBtn = document.getElementById('rvPrev');

    if (nextBtn && prevBtn) {
      nextBtn.onclick = () => updateSlider(current + 1);
      prevBtn.onclick = () => updateSlider(current - 1);
    }

    window.addEventListener('resize', () => updateSlider(current));
  }
});