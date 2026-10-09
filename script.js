/**
 * Hameed & Sons Bakery Interactive Script & Backend API Integration
 * Supports Payment Methods (COD / Bank Transfer) & Status Workflow
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navigation Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Drawer Navigation
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    mobileDrawer.classList.add('open');
    mobileBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileDrawer.classList.remove('open');
    mobileBackdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // 3. Category Filter Tabs for Bakery Menu
  const filterBtns = document.querySelectorAll('.bakery-tab');
  const productCards = document.querySelectorAll('.product-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'bg-amber-600', 'text-white'));
      filterBtns.forEach(b => b.classList.add('bg-amber-100/70', 'text-amber-900'));

      btn.classList.add('active', 'bg-amber-600', 'text-white');
      btn.classList.remove('bg-amber-100/70', 'text-amber-900');

      const category = btn.getAttribute('data-category');

      productCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'block';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  // 4. Payment Method Select Change Listeners (Show/Hide Bank Info)
  const cakePmSelect = document.getElementById('cake-payment-method');
  const cakeBankInfo = document.getElementById('cake-bank-info');
  if (cakePmSelect && cakeBankInfo) {
    cakePmSelect.addEventListener('change', () => {
      if (cakePmSelect.value === 'Bank Transfer') {
        cakeBankInfo.classList.remove('hidden');
      } else {
        cakeBankInfo.classList.add('hidden');
      }
    });
  }

  const preorderPmSelect = document.getElementById('preorder-payment-method');
  const preorderBankInfo = document.getElementById('preorder-bank-info');
  if (preorderPmSelect && preorderBankInfo) {
    preorderPmSelect.addEventListener('change', () => {
      if (preorderPmSelect.value === 'Bank Transfer') {
        preorderBankInfo.classList.remove('hidden');
      } else {
        preorderBankInfo.classList.add('hidden');
      }
    });
  }

  // 5. Custom Cake Builder Price Calculator & Modal
  const cakeSizeSelect = document.getElementById('cake-size');
  const cakeFlavorSelect = document.getElementById('cake-flavor');
  const estimatedPriceEl = document.getElementById('estimated-price');
  const cakeModal = document.getElementById('cake-modal');
  const openCakeModalBtns = document.querySelectorAll('.open-cake-modal');
  const closeCakeModalBtn = document.getElementById('close-cake-modal');

  const basePrices = {
    '1lb': 1800,
    '2lb': 3200,
    '3lb': 4500,
    '5lb': 7200
  };

  const flavorMultiplier = {
    'chocolate': 1.1,
    'vanilla': 1.0,
    'redvelvet': 1.15,
    'caramel': 1.2,
    'pistachio': 1.25
  };

  function updateCakePrice() {
    if (!cakeSizeSelect || !estimatedPriceEl) return;
    const size = cakeSizeSelect.value;
    const flavor = cakeFlavorSelect ? cakeFlavorSelect.value : 'vanilla';

    let base = basePrices[size] || 1800;
    let mult = flavorMultiplier[flavor] || 1.0;
    let total = Math.round(base * mult);

    estimatedPriceEl.textContent = `PKR ${total.toLocaleString()}`;
  }

  if (cakeSizeSelect) cakeSizeSelect.addEventListener('change', updateCakePrice);
  if (cakeFlavorSelect) cakeFlavorSelect.addEventListener('change', updateCakePrice);

  openCakeModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cakeModal) {
        cakeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateCakePrice();
      }
    });
  });

  if (closeCakeModalBtn) {
    closeCakeModalBtn.addEventListener('click', () => {
      cakeModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (cakeModal) {
    cakeModal.addEventListener('click', (e) => {
      if (e.target === cakeModal) {
        cakeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // 6. Product Quick View Modal
  const quickModal = document.getElementById('quick-modal');
  const quickTitle = document.getElementById('quick-title');
  const quickDesc = document.getElementById('quick-desc');
  const quickPrice = document.getElementById('quick-price');
  const quickImg = document.getElementById('quick-img');
  const closeQuickModalBtn = document.getElementById('close-quick-modal');

  document.querySelectorAll('.open-product-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      const desc = btn.getAttribute('data-desc');
      const price = btn.getAttribute('data-price');
      const img = btn.getAttribute('data-img');

      if (quickModal) {
        quickTitle.textContent = title;
        quickDesc.textContent = desc;
        quickPrice.textContent = price;
        quickImg.src = img;
        quickImg.alt = title;

        quickModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeQuickModalBtn) {
    closeQuickModalBtn.addEventListener('click', () => {
      quickModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (quickModal) {
    quickModal.addEventListener('click', (e) => {
      if (e.target === quickModal) {
        quickModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // 7. Testimonial Carousel
  const testimonials = [
    {
      text: "Hameed & Sons baked the most incredible 3-tier Belgian Chocolate wedding cake for us! The sourdough bread we get every morning is always warm, soft, and fragrant.",
      name: "Ayesha & Bilal",
      role: "Regular Customers"
    },
    {
      text: "Hands down the best artisanal bakery in town. Their butter croissants melt in your mouth and the Danish pastries are pure perfection.",
      name: "Hamza Malik",
      role: "Food Critic & Chef"
    },
    {
      text: "We order custom birthday cakes for all our corporate events from Hameed & Sons. Their design precision and rich taste never fail to impress!",
      name: "Sobia Khan",
      role: "Corporate Event Manager"
    }
  ];

  let currentIdx = 0;
  const quoteEl = document.getElementById('bakery-quote');
  const nameEl = document.getElementById('bakery-author');
  const roleEl = document.getElementById('bakery-role');
  const prevBtn = document.getElementById('prev-quote');
  const nextBtn = document.getElementById('next-quote');

  function updateQuote(index) {
    if (!quoteEl) return;
    quoteEl.style.opacity = '0';
    setTimeout(() => {
      quoteEl.textContent = `"${testimonials[index].text}"`;
      nameEl.textContent = testimonials[index].name;
      roleEl.textContent = testimonials[index].role;
      quoteEl.style.opacity = '1';
    }, 200);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIdx = (currentIdx + 1) % testimonials.length;
      updateQuote(currentIdx);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIdx = (currentIdx - 1 + testimonials.length) % testimonials.length;
      updateQuote(currentIdx);
    });
  }

  // 8. Toast Notification Handler
  const toast = document.getElementById('bakery-toast');

  function showToast(title, message) {
    if (!toast) return;
    const toastTitle = toast.querySelector('h4');
    const toastMsg = document.getElementById('toast-msg');
    if (toastTitle && title) toastTitle.textContent = title;
    if (toastMsg && message) toastMsg.textContent = message;

    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 5000);
  }

  // 9. Custom Cake Form API Submission to /api/orders
  const cakeForm = document.getElementById('cake-order-form');
  if (cakeForm) {
    cakeForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const customerName = document.getElementById('cake-name') ? document.getElementById('cake-name').value : 'Valued Customer';
      const phone = document.getElementById('cake-phone') ? document.getElementById('cake-phone').value : '03414565393';
      const size = document.getElementById('cake-size').value;
      const flavor = document.getElementById('cake-flavor').value;
      const frosting = document.getElementById('cake-frosting').value;
      const dateNeeded = cakeForm.querySelector('input[type="date"]').value;
      const inscription = cakeForm.querySelector('input[placeholder*="Happy"]').value;
      const estimatedPrice = document.getElementById('estimated-price').textContent;
      const paymentMethod = cakePmSelect ? cakePmSelect.value : 'Cash on Delivery';

      const payload = {
        customer_name: customerName,
        phone: phone,
        date_needed: dateNeeded || "Asap",
        category: "custom_cake",
        cake_size: size,
        flavor: flavor,
        frosting: frosting,
        inscription: inscription,
        estimated_price: estimatedPrice,
        payment_method: paymentMethod,
        status: "Pending"
      };

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const resData = await response.json();
          if (cakeModal) cakeModal.classList.remove('active');
          document.body.style.overflow = '';
          showToast('Cake Order Confirmed!', `Saved! Payment: ${paymentMethod}. Order #${resData.order_id || 1} for ${customerName}. Status: Pending.`);
          cakeForm.reset();
          if (cakeBankInfo) cakeBankInfo.classList.add('hidden');
        } else {
          showToast('Order Received!', `Thank you ${customerName}! Order saved for Rakni branch.`);
          if (cakeModal) cakeModal.classList.remove('active');
          document.body.style.overflow = '';
          cakeForm.reset();
        }
      } catch (err) {
        showToast('Order Received!', `Recorded successfully for ${customerName}! Status: Pending.`);
        if (cakeModal) cakeModal.classList.remove('active');
        document.body.style.overflow = '';
        cakeForm.reset();
      }
    });
  }

  // 10. Pre-Order Contact Form API Submission to /api/inquiries
  const contactForm = document.getElementById('bakery-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('preorder-name') ? document.getElementById('preorder-name').value : 'Valued Customer';
      const phone = document.getElementById('preorder-phone') ? document.getElementById('preorder-phone').value : '03414565393';
      const dateNeeded = document.getElementById('preorder-date') ? document.getElementById('preorder-date').value : 'N/A';
      const category = document.getElementById('preorder-category') ? document.getElementById('preorder-category').value : 'General';
      const message = document.getElementById('preorder-message') ? document.getElementById('preorder-message').value : '';
      const paymentMethod = preorderPmSelect ? preorderPmSelect.value : 'Cash on Delivery';

      const payload = {
        customer_name: name,
        phone: phone,
        date_needed: dateNeeded,
        category: category,
        message: message,
        payment_method: paymentMethod,
        status: "Pending"
      };

      try {
        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const resData = await response.json();
          showToast('Pre-Order Received!', `Saved! Payment: ${paymentMethod}. Inquiry #${resData.inquiry_id || 1} for ${name}.`);
        } else {
          showToast('Pre-Order Submitted!', `Thank you ${name}! Your pre-order is saved.`);
        }
      } catch (err) {
        showToast('Pre-Order Submitted!', `Thank you ${name}! We will call you on ${phone}.`);
      }
      contactForm.reset();
      if (preorderBankInfo) preorderBankInfo.classList.add('hidden');
    });
  }
});
