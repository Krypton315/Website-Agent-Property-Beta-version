/**
 * ============================================================
 * VILLA BALI REALTY — script.js
 * Vanilla JavaScript — no dependencies
 * ============================================================
 *
 * Sections:
 * 1. Navbar — scroll behaviour & mobile toggle
 * 2. Hero — background image parallax/load effect
 * 3. Properties — fetch & render from properties.json
 * 4. Scroll Reveal — IntersectionObserver for .reveal elements
 * 5. Contact Form — basic validation & submission feedback
 * 6. Utility helpers
 * ============================================================
 */

'use strict';

/* ============================================================
   1. NAVBAR — Scroll state & mobile menu
   ============================================================ */

const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

/**
 * Add/remove the `.scrolled` class when user scrolls past
 * the hero section threshold (~80px).
 */
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

/** Open mobile navigation overlay */
navToggle.addEventListener('click', () => {
  mobileNav.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden'; // prevent background scroll
});

/** Close mobile navigation overlay */
function closeMobileNav() {
  mobileNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

mobileClose.addEventListener('click', closeMobileNav);

/** Close overlay if user presses Escape key */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
    closeMobileNav();
  }
});


/* ============================================================
   2. HERO — background image load animation
   ============================================================ */

const heroBg = document.getElementById('heroBg');

/**
 * Preload the hero image before revealing it so we get a
 * smooth ken-burns zoom effect instead of a flash-of-empty.
 */
const heroImg = new Image();
heroImg.src = 'images/hero-background.jpg';
heroImg.onload = () => {
  heroBg.classList.add('loaded');
};


/* ============================================================
   3. FEATURED PROPERTIES — Fetch from properties.json
   ============================================================ */

const propertiesGrid = document.getElementById('propertiesGrid');

/**
 * Build a single property card HTML string from a property object.
 * @param {Object} property - A single property from properties.json
 * @returns {string} HTML string for the card
 */
function buildPropertyCard(property) {
  const detailUrl = 'property.html?id=' + property.id;
  return `
    <a href="${detailUrl}" class="property-card reveal" role="listitem" aria-label="${property.title}">

      <!-- Card Image with tag -->
      <div class="card-image-wrap">
        <img
          src="${property.image}"
          alt="${property.title} — ${property.location}"
          loading="lazy"
        />
        <span class="card-tag">${property.tag}</span>
      </div>

      <!-- Card Body -->
      <div class="card-body">
        <span class="card-location">${property.location}</span>
        <h3 class="card-title">${property.title}</h3>
        <p class="card-desc">${property.description}</p>

        <!-- Property specs row -->
        <div class="card-specs" aria-label="Property specifications">
          <span class="card-spec">
            <span class="spec-icon">🛏</span>
            <span>${property.beds} Beds</span>
          </span>
          <span class="card-spec">
            <span class="spec-icon">🚿</span>
            <span>${property.baths} Baths</span>
          </span>
          <span class="card-spec">
            <span class="spec-icon">📐</span>
            <span>${property.sqm} m²</span>
          </span>
        </div>

        <!-- Price & CTA -->
        <div class="card-footer">
          <span class="card-price">${property.price}</span>
          <span class="card-btn">View Details →</span>
        </div>
      </div>

    </a>
  `;
}

/**
 * Fetch properties from the local JSON file and render them.
 * Falls back to hard-coded data if fetch fails (e.g. opening
 * index.html directly without a local server).
 */
async function loadProperties() {
  try {
    // Use a cache-busting param to avoid stale 404s during development
    const response = await fetch('./properties.json?v=' + Date.now());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} — could not load properties.json`);
    }

    const properties = await response.json();
    console.log(`✅ Loaded ${properties.length} properties from properties.json`);
    renderProperties(properties);

  } catch (err) {
    console.warn('⚠️ Could not load properties.json — using inline fallback data.\nReason:', err.message);
    renderProperties(FALLBACK_PROPERTIES);
  }
}

/**
 * Inject property cards into the DOM.
 * @param {Array} properties - Array of property objects
 */
function renderProperties(properties) {
  // Clear skeleton placeholders
  propertiesGrid.innerHTML = '';

  properties.forEach((property, index) => {
    const cardHTML = buildPropertyCard(property);
    propertiesGrid.insertAdjacentHTML('beforeend', cardHTML);
  });

  // Re-run observer on newly added cards
  observeRevealElements();
}

/**
 * Toggle favourite heart icon on a property card.
 * @param {HTMLElement} btn - The button element clicked
 * @param {number} id - Property ID
 */

/* Fallback inline data — used if fetch() isn't available (file:// protocol) */
const FALLBACK_PROPERTIES = [
  {
    id: 1,
    title: "Clifftop Villa Uluwatu",
    location: "Uluwatu, Bukit Peninsula",
    price: "$1,250,000",
    type: "Villa",
    beds: 4,
    baths: 4,
    sqm: 580,
    description: "Perched above the Indian Ocean with panoramic sunset views, this architectural masterpiece blends Balinese craftsmanship with contemporary luxury.",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
    tag: "Featured"
  },
  {
    id: 2,
    title: "Tropical Rice Field Retreat",
    location: "Ubud, Central Bali",
    price: "$680,000",
    type: "Villa",
    beds: 3,
    baths: 3,
    sqm: 420,
    description: "Nestled among emerald terraced rice fields, this serene villa offers the quintessential Ubud lifestyle with private pool and meditation pavilion.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    tag: "New Listing"
  },
  {
    id: 3,
    title: "Seminyak Beachfront Estate",
    location: "Seminyak, West Bali",
    price: "$2,100,000",
    type: "Estate",
    beds: 6,
    baths: 6,
    sqm: 950,
    description: "An extraordinary beachfront compound steps from Seminyak's finest dining and boutiques. Dual villas with private beach access and full staff quarters.",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
    tag: "Luxury"
  },
  {
    id: 4,
    title: "Canggu Modernist Hideaway",
    location: "Canggu, Badung",
    price: "$495,000",
    type: "Villa",
    beds: 2,
    baths: 2,
    sqm: 280,
    description: "A designer's dream in Bali's most vibrant creative hub. Polished concrete, teak accents, and a 12-meter lap pool in a lush tropical garden.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    tag: "Hot Property"
  },
  {
    id: 5,
    title: "Jimbaran Ocean View Villa",
    location: "Jimbaran, South Bali",
    price: "$875,000",
    type: "Villa",
    beds: 4,
    baths: 3,
    sqm: 510,
    description: "Cascading terraces lead down to a stunning infinity pool overlooking Jimbaran Bay. Watch traditional fishing boats at dawn from your private sun terrace.",
    image: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&q=80",
    tag: "Sea View"
  },
  {
    id: 6,
    title: "Sanur Heritage Compound",
    location: "Sanur, East Denpasar",
    price: "$1,050,000",
    type: "Compound",
    beds: 5,
    baths: 5,
    sqm: 700,
    description: "A rare traditional Balinese compound reimagined for modern living. Three pavilions around a central courtyard, 200m from Sanur's white sand beach.",
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&q=80",
    tag: "Rare Find"
  }
];


/* ============================================================
   4. SCROLL REVEAL — IntersectionObserver
   ============================================================ */

let revealObserver;

/**
 * Create an IntersectionObserver that adds the `.revealed` class
 * to any element with class `.reveal` when it enters the viewport.
 * Staggers delay via existing CSS delay classes.
 */
function observeRevealElements() {
  const revealEls = document.querySelectorAll('.reveal:not(.revealed)');

  if (!revealEls.length) return;

  // Re-use the same observer instance if already created
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target); // only animate once
        }
      });
    }, {
      threshold: 0.12,      // trigger when 12% of the element is visible
      rootMargin: '0px 0px -40px 0px'
    });
  }

  revealEls.forEach(el => revealObserver.observe(el));
}

// Initial observation pass on page load
observeRevealElements();


/* ============================================================
   5. CONTACT FORM — Validation & submission feedback
   ============================================================ */

const contactForm  = document.getElementById('contactForm');
const formSuccess  = document.getElementById('formSuccess');

/**
 * Basic client-side form validation.
 * Returns true if valid, false with error highlights if not.
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
function validateForm(form) {
  let isValid = true;

  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    // Remove previous error state
    field.style.borderColor = '';

    if (!field.value.trim()) {
      field.style.borderColor = '#c0392b';
      isValid = false;
    }
  });

  // Basic email format check
  const emailField = form.querySelector('#email');
  if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
    emailField.style.borderColor = '#c0392b';
    isValid = false;
  }

  return isValid;
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent actual form submission (no backend in this demo)

  if (!validateForm(contactForm)) {
    // Shake the submit button to indicate error
    const btn = contactForm.querySelector('.form-submit');
    btn.style.transform = 'translateX(-6px)';
    setTimeout(() => btn.style.transform = '', 120);
    setTimeout(() => { btn.style.transform = 'translateX(6px)'; }, 120);
    setTimeout(() => btn.style.transform = '', 240);
    return;
  }

  // Simulate a brief loading state
  const submitBtn = contactForm.querySelector('.form-submit');
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  setTimeout(() => {
    // Success state
    contactForm.reset();
    submitBtn.textContent = 'Send Message →';
    submitBtn.disabled = false;

    formSuccess.style.display = 'block';

    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      formSuccess.style.display = 'none';
    }, 5000);

    // Smooth scroll to success message
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  }, 900); // Simulated network delay
});

/* Clear red borders when user starts typing in an error field */
contactForm.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('input', () => {
    if (field.style.borderColor === 'rgb(192, 57, 43)') {
      field.style.borderColor = '';
    }
  });
});


/* ============================================================
   6. SMOOTH SCROLL — for anchor links (belt & suspenders)
   ============================================================ */

/**
 * Handle all internal anchor clicks for smooth scrolling,
 * accounting for the fixed navbar height offset.
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return; // skip empty hash links

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();

    const navHeight = navbar.offsetHeight;
    const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });
  });
});


/* ============================================================
   INIT — Run on DOM ready
   ============================================================ */

// Script is placed at bottom of <body>, so DOM is already ready.
// We also listen for DOMContentLoaded as a safety net.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadProperties();
    observeRevealElements();
  });
} else {
  // DOM already parsed — run immediately
  loadProperties();
  observeRevealElements();
}

