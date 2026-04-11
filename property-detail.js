/**
 * ============================================================
 * VILLA BALI REALTY — property-detail.js
 * Handles: URL param reading, property fetch, detail render,
 *          image gallery thumbnail switching.
 * ============================================================
 */

'use strict';

/* ── DOM references ── */
const detailLoading  = document.getElementById('detailLoading');
const detailError    = document.getElementById('detailError');
const detailContent  = document.getElementById('detailContent');
const backBarTitle   = document.getElementById('backBarTitle');

/* ── Gallery elements ── */
const galleryMainImg = document.getElementById('galleryMainImg');
const galleryThumbs  = document.getElementById('galleryThumbs');

/* ── Detail text elements ── */
const detailTag      = document.getElementById('detailTag');
const detailTitle    = document.getElementById('detailTitle');
const detailLocation = document.getElementById('detailLocation');
const detailDesc     = document.getElementById('detailDescription');
const specBeds       = document.getElementById('specBeds');
const specBaths      = document.getElementById('specBaths');
const specSqm        = document.getElementById('specSqm');
const specLand       = document.getElementById('specLand');

/* ── Sidebar elements ── */
const sidebarPrice    = document.getElementById('sidebarPrice');
const sidebarType     = document.getElementById('sidebarType');
const sidebarLocation = document.getElementById('sidebarLocation');
const sidebarTypeRow  = document.getElementById('sidebarTypeRow');
const sidebarBeds     = document.getElementById('sidebarBeds');
const sidebarBaths    = document.getElementById('sidebarBaths');
const sidebarSqm      = document.getElementById('sidebarSqm');
const sidebarLand     = document.getElementById('sidebarLand');
const sidebarLandRow  = document.getElementById('sidebarLandRow');
const sidebarWa       = document.getElementById('sidebarWa');


/* ============================================================
   GALLERY — thumbnail click switches main image
   ============================================================ */

/**
 * Build the gallery from a property's images array.
 * Falls back to the single `property.image` if images[] is absent.
 * @param {Object} property
 */
function buildGallery(property) {
  // Resolve the image list: use images[] if present, else wrap the
  // single cover image in an array so the rest of the code is uniform.
  const images = (property.images && property.images.length > 0)
    ? property.images
    : [{ url: property.image, alt: property.title }];

  // Set the main image to the first entry
  galleryMainImg.src = images[0].url;
  galleryMainImg.alt = images[0].alt || property.title;

  // Build thumbnails only when there is more than one image
  galleryThumbs.innerHTML = '';

  if (images.length <= 1) return; // single image — no thumbs needed

  images.forEach((imgObj, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'gallery-thumb' + (index === 0 ? ' active' : '');
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');
    thumb.setAttribute('aria-label', 'View image ' + (index + 1));

    const img = document.createElement('img');
    img.src = imgObj.url;
    img.alt = imgObj.alt || property.title + ' image ' + (index + 1);
    img.loading = 'lazy';

    thumb.appendChild(img);
    galleryThumbs.appendChild(thumb);

    // Click: switch main image with a brief fade
    thumb.addEventListener('click', () => switchMainImage(thumb, imgObj, images));

    // Keyboard: allow Enter / Space to activate thumbnail
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchMainImage(thumb, imgObj, images);
      }
    });
  });
}

/**
 * Swap the main gallery image when a thumbnail is clicked.
 * @param {HTMLElement} clickedThumb - The thumbnail div that was clicked
 * @param {Object}      imgObj       - { url, alt }
 * @param {Array}       images       - Full images array (to update active states)
 */
function switchMainImage(clickedThumb, imgObj, images) {
  // Fade out → swap src → fade in
  galleryMainImg.classList.add('fading');

  setTimeout(() => {
    galleryMainImg.src = imgObj.url;
    galleryMainImg.alt = imgObj.alt || '';
    galleryMainImg.classList.remove('fading');
  }, 180); // matches CSS transition duration

  // Update active thumbnail highlight
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  clickedThumb.classList.add('active');
}


/* ============================================================
   RENDER — populate all detail page fields
   ============================================================ */

/**
 * Fill every detail field with data from the property object.
 * @param {Object} property
 */
function renderPropertyDetail(property) {
  // Update <title>
  document.title = property.title + ' — Villa Bali Realty';

  // Back bar
  backBarTitle.textContent = property.title;

  // Gallery
  buildGallery(property);

  // Tag, title, location, description
  detailTag.textContent      = property.tag;
  detailTitle.textContent    = property.title;
  detailLocation.textContent = property.location;
  detailDesc.textContent     = property.description;

  // Specs (land_sqm is optional — fall back to '—')
  specBeds.textContent  = property.beds;
  specBaths.textContent = property.baths;
  specSqm.textContent   = property.sqm + ' m²';
  specLand.textContent  = property.land_sqm ? property.land_sqm + ' m²' : '—';

  // Sidebar
  sidebarPrice.textContent    = property.price;
  sidebarType.textContent     = property.type;
  sidebarLocation.textContent = property.location;
  sidebarTypeRow.textContent  = property.type;
  sidebarBeds.textContent     = property.beds + ' bedrooms';
  sidebarBaths.textContent    = property.baths + ' bathrooms';
  sidebarSqm.textContent      = property.sqm + ' m²';

  if (property.land_sqm) {
    sidebarLand.textContent = property.land_sqm + ' m²';
  } else {
    sidebarLandRow.style.display = 'none';
  }

  // WhatsApp CTA
  const waMessage = encodeURIComponent(
    `Halo, saya tertarik dengan properti *${property.title}* di ${property.location} (${property.price}). Boleh saya mendapatkan detail lebih lanjut?`
  );
  sidebarWa.href = `https://wa.me/6281234567890?text=${waMessage}`;

  // Show content, hide loading spinner
  detailLoading.style.display = 'none';
  detailContent.style.display = 'grid';
}


/* ============================================================
   INIT — read URL param, fetch JSON, find property
   ============================================================ */

/**
 * Read `?id=` from the URL.
 * @returns {number|null}
 */
function getPropertyIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  return isNaN(id) ? null : id;
}

/**
 * Show the error state.
 */
function showError() {
  detailLoading.style.display = 'none';
  detailError.style.display   = 'block';
}

/**
 * Main entry point.
 */
async function initDetailPage() {
  const id = getPropertyIdFromURL();

  if (!id) {
    showError();
    return;
  }

  try {
    const response = await fetch('./properties.json?v=' + Date.now());

    if (!response.ok) {
      throw new Error('Could not load properties.json');
    }

    const properties = await response.json();
    const property   = properties.find(p => p.id === id);

    if (!property) {
      showError();
      return;
    }

    renderPropertyDetail(property);

  } catch (err) {
    console.error('Property detail error:', err);
    showError();
  }
}

initDetailPage();
