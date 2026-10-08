/**
 * NOODY.AI — Inline Visual Editor
 * Click-to-edit inline content, add new services & products, delete cards, remove prices,
 * and save directly to physical HTML files
 */

(function () {
  'use strict';

  let isEditing = false;
  const EDITABLE_SELECTORS = [
    'h1', 'h2', 'h3', 'h4', 'p',
    '.hero-eyebrow', '.hero-title', '.hero-description',
    '.section-eyebrow', '.section-title', '.section-sub',
    '.island-name', '.island-desc',
    '.item-card-title', '.item-card-desc',
    '.price-label', '.price-value',
    '.review-author', '.review-text',
    '.footer-tagline'
  ];

  // Preset curated ocean images for instant 1-click selection
  const SERVICE_PRESETS = [
    { title: 'Lagoon Kayaking', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
    { title: 'Scuba Reef Dive', url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80' },
    { title: 'Glass Bottom Boat', url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80' },
    { title: 'Beachside Homestay', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
    { title: 'Coral Islet Tour', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' }
  ];

  const PRODUCT_PRESETS = [
    { title: 'Smoked Tuna Mas', url: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=800&q=80' },
    { title: 'Tuna Pickle Jar', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
    { title: 'Carved Coconut Bowls', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80' },
    { title: 'Virgin Coconut Oil', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80' },
    { title: 'Palm Jaggery / Halwa', url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80' }
  ];

  function showToast(message, isError = false) {
    let toast = document.getElementById('editor-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'editor-toast';
      toast.className = 'editor-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.background = isError ? '#ef4444' : '#08755c';
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  function toggleEditMode() {
    isEditing = !isEditing;
    document.body.classList.toggle('noody-editing', isEditing);

    const badge = document.getElementById('editor-mode-badge');
    const toggleBtn = document.getElementById('editor-toggle-btn');
    const saveBtn = document.getElementById('editor-save-btn');
    const addSrvBtn = document.getElementById('editor-add-service-btn');
    const addPrdBtn = document.getElementById('editor-add-product-btn');

    if (isEditing) {
      badge.textContent = '✏️ Editing ON';
      badge.className = 'editor-badge mode-editing';
      toggleBtn.innerHTML = '👁️ Preview Mode';
      saveBtn.style.display = 'inline-flex';
      if (addSrvBtn) addSrvBtn.style.display = 'inline-flex';
      if (addPrdBtn) addPrdBtn.style.display = 'inline-flex';
      setupCardControls();
      enableContentEditable();
      showToast('✏️ Edit Mode Active: Add cards, click text/price to edit, or click ✕ / 🗑️ to delete!');
    } else {
      badge.textContent = '👁️ Preview Mode';
      badge.className = 'editor-badge';
      toggleBtn.innerHTML = '✏️ Edit Page';
      saveBtn.style.display = 'none';
      if (addSrvBtn) addSrvBtn.style.display = 'none';
      if (addPrdBtn) addPrdBtn.style.display = 'none';
      disableContentEditable();
      showToast('👁️ Preview Mode Active');
    }
  }

  function setupCardControls() {
    // 1. Setup Card Delete Buttons
    document.querySelectorAll('.item-card').forEach(card => {
      if (!card.querySelector('.noody-delete-card-btn')) {
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'noody-delete-card-btn';
        delBtn.innerHTML = '🗑️ Delete';
        delBtn.title = 'Remove this item card';
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const title = card.querySelector('.item-card-title')?.textContent || 'this item';
          if (confirm(`Do you want to delete "${title.trim()}"?`)) {
            card.remove();
            showToast('🗑️ Item card deleted! Click "Save Changes" to apply.');
          }
        });
        card.style.position = 'relative';
        card.appendChild(delBtn);
      }
    });

    // 2. Setup Price Remove Buttons
    document.querySelectorAll('.item-price-info').forEach(priceBox => {
      if (!priceBox.querySelector('.noody-price-toggle-btn')) {
        const removePriceBtn = document.createElement('button');
        removePriceBtn.type = 'button';
        removePriceBtn.className = 'noody-price-toggle-btn';
        removePriceBtn.innerHTML = '✕ Remove Price';
        removePriceBtn.title = 'Completely remove or hide this price';
        removePriceBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm('Completely remove this price amount from display?')) {
            priceBox.remove();
            showToast('Amount removed! Click "Save Changes" to apply.');
          }
        });
        priceBox.appendChild(removePriceBtn);
      }
    });
  }

  function enableContentEditable() {
    EDITABLE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
      });
    });

    // Image click handler in edit mode
    document.querySelectorAll('.item-card-media, .slide-image-layer').forEach(media => {
      if (!media._hasEditListener) {
        media._hasEditListener = true;
        media.addEventListener('click', (e) => {
          if (!isEditing) return;
          e.preventDefault();
          e.stopPropagation();
          const img = media.querySelector('img');
          const currentUrl = img ? img.src : media.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
          const newUrl = prompt('Enter new Image URL for this card:', currentUrl);
          if (newUrl && newUrl.trim()) {
            if (img) {
              img.src = newUrl.trim();
            } else {
              media.style.backgroundImage = `url('${newUrl.trim()}')`;
            }
            showToast('📷 Image updated! Click "Save Changes" to apply.');
          }
        });
      }
    });
  }

  function disableContentEditable() {
    EDITABLE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.removeAttribute('contenteditable');
        el.removeAttribute('spellcheck');
      });
    });
  }

  // =========================================================================
  // ADD SERVICE & ADD PRODUCT MODAL IMPLEMENTATION
  // =========================================================================

  function openAddItemModal(kind) {
    const isService = kind === 'SERVICE';
    const modalId = 'noody-add-item-modal-backdrop';
    let backdrop = document.getElementById(modalId);

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = modalId;
      backdrop.className = 'noody-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const titleText = isService ? '➕ Add New Water Sport / Service' : '➕ Add New Lakshadweep Product';
    const presets = isService ? SERVICE_PRESETS : PRODUCT_PRESETS;
    const categories = isService
      ? ['Water Sports', 'Scuba Diving', 'Lagoon Tour', 'Boat Safari', 'Homestay', 'Transport', 'Photography', 'Local Food']
      : ['Seafood', 'Pickles', 'Crafts', 'Wellness', 'Organic Food', 'Traditional Sweet', 'Souvenirs'];

    backdrop.innerHTML = `
      <div class="noody-modal" role="dialog" aria-modal="true" style="max-width: 600px;">
        <div class="noody-modal-header">
          <div>
            <h3>${titleText}</h3>
            <div class="noody-modal-subtitle">Will be added directly to the active catalogue grid</div>
          </div>
          <button type="button" class="noody-modal-close" id="noody-add-item-close">&times;</button>
        </div>
        <div class="noody-modal-body">
          <form id="noody-add-item-form">
            <div class="form-group">
              <label>${isService ? 'Service / Activity Name' : 'Product Name'} *</label>
              <input type="text" id="add-item-name" class="form-input" placeholder="${isService ? 'e.g. Sunset Dolphin Cruise' : 'e.g. Pure Island Wildflower Honey'}" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Island Destination *</label>
                <select id="add-item-island" class="form-select" required>
                  <option value="AGATTI">Agatti Island</option>
                  <option value="KADMAT">Kadmat Island</option>
                  <option value="KAVARATTI">Kavaratti Island</option>
                  <option value="KALPENI">Kalpeni Island</option>
                </select>
              </div>

              <div class="form-group">
                <label>Category *</label>
                <select id="add-item-category" class="form-select" required>
                  ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Image URL * (Paste custom URL or click a preset below)</label>
              <input type="url" id="add-item-image" class="form-input" value="${presets[0].url}" required>
              <div class="photo-preset-chips" id="add-item-preset-chips">
                ${presets.map((p, i) => `
                  <div class="photo-chip ${i === 0 ? 'selected' : ''}" data-url="${p.url}" title="${p.title}">
                    <img src="${p.url}" alt="${p.title}">
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="form-group">
              <label>Description *</label>
              <textarea id="add-item-desc" class="form-textarea" placeholder="${isService ? 'Describe the experience, safety guidance, equipment included...' : 'Describe taste, ingredients, traditional production process...'}" required></textarea>
            </div>

            <div class="form-group">
              <label>Price Guide (optional, leave blank for Enquiry Only)</label>
              <input type="text" id="add-item-price" class="form-input" placeholder="${isService ? 'e.g. ₹1,200 / person' : 'e.g. ₹350 / 250g'}">
            </div>

            <button type="submit" class="btn-submit-review" style="margin-top: 10px;">
              Insert ${isService ? 'Service' : 'Product'} Card into Page
            </button>
          </form>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    // Preset chips click handler
    const chips = backdrop.querySelectorAll('.photo-chip');
    const imgInput = backdrop.querySelector('#add-item-image');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        imgInput.value = chip.getAttribute('data-url');
      });
    });

    // Close handlers
    const closeBtn = backdrop.querySelector('#noody-add-item-close');
    closeBtn.addEventListener('click', () => backdrop.classList.remove('active'));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('active');
    });

    // Form submit handler
    const form = backdrop.querySelector('#noody-add-item-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('add-item-name').value.trim();
      const island = document.getElementById('add-item-island').value;
      const category = document.getElementById('add-item-category').value;
      const imageUrl = document.getElementById('add-item-image').value.trim();
      const desc = document.getElementById('add-item-desc').value.trim();
      const price = document.getElementById('add-item-price').value.trim();

      if (!name || !imageUrl || !desc) return;

      insertNewCardIntoPage({
        kind: kind,
        name: name,
        island: island,
        category: category,
        imageUrl: imageUrl,
        desc: desc,
        price: price
      });

      backdrop.classList.remove('active');
    });
  }

  function insertNewCardIntoPage(item) {
    const isService = item.kind === 'SERVICE';
    const itemId = (isService ? 'srv-' : 'prd-') + 'user-' + Date.now().toString(36);
    const islandName = item.island.charAt(0) + item.island.slice(1).toLowerCase();

    // Determine target grid
    let grid = null;
    if (isService) {
      grid = document.querySelector('#services-section .items-grid') || document.querySelector('.listings-section .items-grid');
    } else {
      grid = document.querySelector('#products-section .items-grid') || document.querySelector('.listings-section .items-grid');
    }

    if (!grid) {
      grid = document.querySelector('.items-grid');
    }

    if (!grid) {
      showToast('❌ Could not locate items grid on this page.', true);
      return;
    }

    // Build WhatsApp URL
    const waText = encodeURIComponent(
      `Hello NOODY.AI, please share details, availability and the final price.\n` +
      `${item.name}\n` +
      `Island: ${islandName}\n` +
      `NOODY_SOURCE:WEBSITE\n` +
      `NOODY_ISLAND:${item.island}\n` +
      `NOODY_ITEM:${item.kind}:${itemId}`
    );
    const waUrl = `https://wa.me/919446944562?text=${waText}`;

    const priceHtml = item.price ? `
      <div class="item-price-info">
        <span class="price-label">Price Guide</span>
        <span class="price-value">${item.price}</span>
      </div>
    ` : `
      <div class="item-price-info">
        <span class="price-label">Price Guide</span>
        <span class="price-value">Enquiry Only</span>
      </div>
    `;

    const card = document.createElement('div');
    card.className = 'item-card';
    card.setAttribute('data-listing-island', item.island);
    card.style.position = 'relative';

    card.innerHTML = `
      <div class="item-card-media">
        <img class="item-card-img" src="${item.imageUrl}" alt="${item.name}" loading="lazy">
        <span class="item-category-tag">${item.category}</span>
      </div>
      <div class="item-card-body">
        <span class="item-card-island">${islandName} Island</span>
        <h3 class="item-card-title">${item.name}</h3>
        <p class="item-card-desc">${item.desc}</p>
        <div class="item-card-meta">
          ${priceHtml}
          <a href="${waUrl}" class="btn-item-enquire" data-whatsapp-action data-item-name="${item.name}" data-item-kind="${item.kind}" data-item-id="${itemId}">
            <span>WhatsApp</span> →
          </a>
        </div>
      </div>
    `;

    // Prepend to grid
    grid.prepend(card);

    // Refresh controls & reviews
    setupCardControls();
    enableContentEditable();
    if (window.NoodyReviews) {
      window.NoodyReviews.renderAllCardRatings();
    }

    // Scroll to new card
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast(`✅ "${item.name}" added! Click "💾 Save Changes" (Ctrl+S) to write to file.`);
  }

  // =========================================================================
  // SAVE DISK PERSISTENCE
  // =========================================================================

  async function savePageToFile() {
    const saveBtn = document.getElementById('editor-save-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '⏳ Saving...';
    saveBtn.disabled = true;

    try {
      // 1. Temporarily disable editing state and remove editor controls
      disableContentEditable();
      document.body.classList.remove('noody-editing');

      const dock = document.getElementById('noody-editor-dock');
      const toast = document.getElementById('editor-toast');
      const addModal = document.getElementById('noody-add-item-modal-backdrop');
      const revModal = document.getElementById('noody-review-modal-backdrop');
      const deleteButtons = Array.from(document.querySelectorAll('.noody-delete-card-btn'));
      const priceToggleButtons = Array.from(document.querySelectorAll('.noody-price-toggle-btn'));

      if (dock) dock.remove();
      if (toast) toast.remove();
      if (addModal) addModal.remove();
      if (revModal) revModal.remove();
      deleteButtons.forEach(b => b.remove());
      priceToggleButtons.forEach(b => b.remove());

      // 2. Clone clean document
      const cleanHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

      // 3. Re-insert dock and restore editing controls
      if (dock) document.body.appendChild(dock);
      document.body.classList.add('noody-editing');
      setupCardControls();
      enableContentEditable();

      // 4. Determine current page filename
      let pageName = window.location.pathname.split('/').pop() || 'index.html';
      if (!pageName.endsWith('.html')) pageName = 'index.html';

      // 5. POST to preview-server /api/save-page
      const res = await fetch('/api/save-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageName, html: cleanHtml })
      });

      if (res.ok) {
        showToast(`✅ Saved directly to F:\\bot\\${pageName}!`);
      } else {
        throw new Error('Save endpoint failed');
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Could not save to disk. Make sure preview-server is running.', true);
    } finally {
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    }
  }

  function initEditorDock() {
    if (document.getElementById('noody-editor-dock')) return;

    const dock = document.createElement('div');
    dock.id = 'noody-editor-dock';
    dock.className = 'noody-editor-dock';
    dock.innerHTML = `
      <span id="editor-mode-badge" class="editor-badge">👁️ Preview Mode</span>
      <button id="editor-toggle-btn" class="editor-dock-btn">✏️ Edit Page</button>
      <button id="editor-add-service-btn" class="editor-dock-btn" style="display:none; background: #0284c7; border-color: #38bdf8;">➕ Add Service</button>
      <button id="editor-add-product-btn" class="editor-dock-btn" style="display:none; background: #d97706; border-color: #fbbf24;">➕ Add Product</button>
      <button id="editor-save-btn" class="editor-dock-btn editor-btn-save" style="display:none;">💾 Save Changes</button>
    `;
    document.body.appendChild(dock);

    document.getElementById('editor-toggle-btn').addEventListener('click', toggleEditMode);
    document.getElementById('editor-save-btn').addEventListener('click', savePageToFile);
    document.getElementById('editor-add-service-btn').addEventListener('click', () => openAddItemModal('SERVICE'));
    document.getElementById('editor-add-product-btn').addEventListener('click', () => openAddItemModal('PRODUCT'));

    // Ctrl + S shortcut to save
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditing) {
          savePageToFile();
        } else {
          toggleEditMode();
        }
      }
    });
  }

  // Load editor stylesheet and init dock when DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/visual-editor.css';
    document.head.appendChild(link);

    initEditorDock();
  });
})();
