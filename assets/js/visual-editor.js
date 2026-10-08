/**
 * NOODY.AI — Inline Visual Editor
 * Click-to-edit inline content, add new services & products, delete cards, remove prices,
 * upload/drag-and-drop background and card photos, and save directly to physical HTML files
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
  const HERO_PRESETS = [
    { title: 'Agatti Atoll Lagoon', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85' },
    { title: 'Coral Reefs & Marine', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=85' },
    { title: 'Turquoise Waters Aerial', url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=2000&q=85' },
    { title: 'Tropical Island Shore', url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=2000&q=85' }
  ];

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
    const heroBtn = document.getElementById('editor-hero-bg-btn');

    if (isEditing) {
      badge.textContent = '✏️ Editing ON';
      badge.className = 'editor-badge mode-editing';
      toggleBtn.innerHTML = '👁️ Preview Mode';
      saveBtn.style.display = 'inline-flex';
      if (addSrvBtn) addSrvBtn.style.display = 'inline-flex';
      if (addPrdBtn) addPrdBtn.style.display = 'inline-flex';
      if (heroBtn) heroBtn.style.display = 'inline-flex';
      setupCardControls();
      setupHeroControls();
      setupImageDropHandlers();
      enableContentEditable();
      showToast('✏️ Edit Mode Active: Drag & drop photos onto cards or hero background to replace!');
    } else {
      badge.textContent = '👁️ Preview Mode';
      badge.className = 'editor-badge';
      toggleBtn.innerHTML = '✏️ Edit Page';
      saveBtn.style.display = 'none';
      if (addSrvBtn) addSrvBtn.style.display = 'none';
      if (addPrdBtn) addPrdBtn.style.display = 'none';
      if (heroBtn) heroBtn.style.display = 'none';
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

  function setupHeroControls() {
    const hero = document.querySelector('.noody-hero-slider');
    if (!hero) return;

    let heroBtn = document.getElementById('editor-hero-bg-btn');
    if (!heroBtn) {
      heroBtn = document.createElement('button');
      heroBtn.type = 'button';
      heroBtn.id = 'editor-hero-bg-btn';
      heroBtn.className = 'editor-hero-bg-btn';
      heroBtn.innerHTML = '🖼️ Change Hero Background (Upload / Drop)';
      heroBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const activeSlideLayer = hero.querySelector('.hero-slide.active .slide-image-layer') || hero.querySelector('.slide-image-layer');
        if (activeSlideLayer) {
          openImagePickerModal(activeSlideLayer, 'Hero Slide Background', HERO_PRESETS);
        }
      });
      hero.appendChild(heroBtn);
    }
  }

  function enableContentEditable() {
    EDITABLE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
      });
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
  // FILE UPLOAD & DIRECT DRAG-AND-DROP SYSTEM FOR ALL IMAGES
  // =========================================================================

  function uploadImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        try {
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, base64: base64 })
          });
          if (res.ok) {
            const data = await res.json();
            resolve(data.url);
          } else {
            // Fallback to data URL
            resolve(base64);
          }
        } catch (err) {
          console.warn('Upload API fallback to data URL:', err);
          resolve(base64);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function applyImageToTarget(target, url) {
    if (!target) return;
    const img = target.tagName === 'IMG' ? target : target.querySelector('img');
    if (img) {
      img.src = url;
    } else {
      target.style.backgroundImage = `url('${url}')`;
    }
  }

  function getTargetCurrentUrl(target) {
    if (!target) return '';
    const img = target.tagName === 'IMG' ? target : target.querySelector('img');
    if (img) return img.src;
    return target.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
  }

  function setupImageDropHandlers() {
    // 1. Target all card media elements, images, and hero sliders
    const dropTargets = document.querySelectorAll('.item-card-media, .slide-image-layer, .hero-slide, .noody-hero-slider, .island-card');

    dropTargets.forEach(target => {
      if (target._hasDropSetup) return;
      target._hasDropSetup = true;

      // Click to open image modal
      target.addEventListener('click', (e) => {
        if (!isEditing) return;
        // Don't trigger if clicked on child button or link
        if (e.target.closest('button, a, input, select')) return;
        e.preventDefault();
        e.stopPropagation();

        let realTarget = target;
        if (target.classList.contains('noody-hero-slider') || target.classList.contains('hero-slide')) {
          realTarget = document.querySelector('.hero-slide.active .slide-image-layer') || target.querySelector('.slide-image-layer') || target;
        }

        const isHero = target.classList.contains('noody-hero-slider') || target.classList.contains('hero-slide') || target.classList.contains('slide-image-layer');
        openImagePickerModal(realTarget, isHero ? 'Hero Slide Background' : 'Card Photo', isHero ? HERO_PRESETS : SERVICE_PRESETS);
      });

      // Drag and drop event listeners
      target.addEventListener('dragenter', (e) => {
        if (!isEditing) return;
        e.preventDefault();
        e.stopPropagation();
        target.classList.add('noody-drop-target-active');
      });

      target.addEventListener('dragover', (e) => {
        if (!isEditing) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        target.classList.add('noody-drop-target-active');
      });

      target.addEventListener('dragleave', (e) => {
        if (!isEditing) return;
        e.preventDefault();
        e.stopPropagation();
        // Only remove if leaving element itself
        if (e.relatedTarget && target.contains(e.relatedTarget)) return;
        target.classList.remove('noody-drop-target-active');
      });

      target.addEventListener('drop', async (e) => {
        if (!isEditing) return;
        e.preventDefault();
        e.stopPropagation();
        target.classList.remove('noody-drop-target-active');

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (!file.type.startsWith('image/')) {
            showToast('⚠️ Please drop a valid image file (JPG, PNG, WEBP).', true);
            return;
          }

          showToast('⏳ Uploading dropped image...');
          try {
            const savedUrl = await uploadImageFile(file);

            let realTarget = target;
            if (target.classList.contains('noody-hero-slider') || target.classList.contains('hero-slide')) {
              realTarget = document.querySelector('.hero-slide.active .slide-image-layer') || target.querySelector('.slide-image-layer') || target;
            }

            applyImageToTarget(realTarget, savedUrl);
            showToast('✅ Image replaced via Drag & Drop! Click "💾 Save Changes" to write to file.');
          } catch (err) {
            console.error('Drop error:', err);
            showToast('❌ Image upload failed.', true);
          }
        }
      });
    });
  }

  // =========================================================================
  // IMAGE PICKER MODAL (UPLOAD FILE + DRAG & DROP + PRESETS + URL)
  // =========================================================================

  function openImagePickerModal(targetElement, label = 'Replace Photo', presets = SERVICE_PRESETS) {
    const modalId = 'noody-image-picker-modal-backdrop';
    let backdrop = document.getElementById(modalId);

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = modalId;
      backdrop.className = 'noody-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const currentUrl = getTargetCurrentUrl(targetElement);

    backdrop.innerHTML = `
      <div class="noody-modal" role="dialog" aria-modal="true" style="max-width: 600px;">
        <div class="noody-modal-header">
          <div>
            <h3>📷 ${label}</h3>
            <div class="noody-modal-subtitle">Upload file from computer, drag & drop, or choose preset</div>
          </div>
          <button type="button" class="noody-modal-close" id="noody-img-picker-close">&times;</button>
        </div>
        <div class="noody-modal-body">
          <!-- 1. Drag & Drop File Upload Area -->
          <div class="image-dropzone-box" id="modal-image-dropzone">
            <span class="image-dropzone-icon">📁</span>
            <div class="image-dropzone-title">Click to Browse File or Drag &amp; Drop Here</div>
            <div class="image-dropzone-sub">Supports JPG, PNG, WEBP, GIF, SVG (Saved directly to assets/uploads/)</div>
            <input type="file" id="modal-file-input" accept="image/*" style="display: none;">
          </div>

          <!-- Current / Selected Image Preview -->
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 6px;">CURRENT PREVIEW:</div>
            <img id="modal-current-preview" class="image-preview-thumbnail" src="${currentUrl || presets[0].url}" alt="Preview">
          </div>

          <!-- 2. One-Click Curated Presets -->
          <div class="form-group">
            <label>✨ Or Select a Curated Island Photograph:</label>
            <div class="photo-preset-chips" id="modal-preset-chips">
              ${presets.map(p => `
                <div class="photo-chip" data-url="${p.url}" title="${p.title}">
                  <img src="${p.url}" alt="${p.title}">
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 3. Direct Image URL Input -->
          <div class="form-group" style="margin-top: 16px;">
            <label for="modal-url-input">🔗 Or Paste Web Image URL:</label>
            <div style="display: flex; gap: 8px;">
              <input type="url" id="modal-url-input" class="form-input" value="${currentUrl}" placeholder="https://images.unsplash.com/...">
              <button type="button" id="modal-apply-url-btn" class="editor-dock-btn" style="background:#08755c; border:none; white-space:nowrap;">Apply URL</button>
            </div>
          </div>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    const fileInput = backdrop.querySelector('#modal-file-input');
    const dropzone = backdrop.querySelector('#modal-image-dropzone');
    const previewImg = backdrop.querySelector('#modal-current-preview');
    const urlInput = backdrop.querySelector('#modal-url-input');

    // Click dropzone to open file picker
    dropzone.addEventListener('click', () => fileInput.click());

    // File selected from computer
    fileInput.addEventListener('change', async () => {
      if (fileInput.files && fileInput.files[0]) {
        await handleModalFileUpload(fileInput.files[0]);
      }
    });

    // Drop file onto modal dropzone
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await handleModalFileUpload(e.dataTransfer.files[0]);
      }
    });

    async function handleModalFileUpload(file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      dropzone.querySelector('.image-dropzone-title').textContent = '⏳ Uploading ' + file.name + '...';
      try {
        const uploadedUrl = await uploadImageFile(file);
        previewImg.src = uploadedUrl;
        applyImageToTarget(targetElement, uploadedUrl);
        backdrop.classList.remove('active');
        showToast('✅ Photo uploaded and updated! Click "💾 Save Changes" to write to file.');
      } catch (err) {
        console.error(err);
        alert('Could not upload image.');
        dropzone.querySelector('.image-dropzone-title').textContent = 'Click to Browse File or Drag & Drop Here';
      }
    }

    // Preset clicks
    backdrop.querySelectorAll('.photo-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const url = chip.getAttribute('data-url');
        previewImg.src = url;
        urlInput.value = url;
        applyImageToTarget(targetElement, url);
        backdrop.classList.remove('active');
        showToast('✅ Preset photo applied! Click "💾 Save Changes" to write to file.');
      });
    });

    // Apply URL button
    backdrop.querySelector('#modal-apply-url-btn').addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (url) {
        applyImageToTarget(targetElement, url);
        backdrop.classList.remove('active');
        showToast('✅ URL applied! Click "💾 Save Changes" to write to file.');
      }
    });

    // Close button & outside click
    backdrop.querySelector('#noody-img-picker-close').addEventListener('click', () => backdrop.classList.remove('active'));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('active');
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
              <label>Image URL * (Upload file or click a preset below)</label>
              <div style="display:flex; gap:8px;">
                <input type="url" id="add-item-image" class="form-input" value="${presets[0].url}" required>
                <button type="button" id="btn-add-item-upload-file" class="editor-dock-btn" style="background:#08755c; border:none; white-space:nowrap;">📁 Upload</button>
                <input type="file" id="file-add-item-upload" accept="image/*" style="display:none;">
              </div>
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

    // Upload file button inside add item modal
    const uploadBtn = backdrop.querySelector('#btn-add-item-upload-file');
    const fileElem = backdrop.querySelector('#file-add-item-upload');
    uploadBtn.addEventListener('click', () => fileElem.click());
    fileElem.addEventListener('change', async () => {
      if (fileElem.files && fileElem.files[0]) {
        uploadBtn.textContent = '⏳ Uploading...';
        try {
          const url = await uploadImageFile(fileElem.files[0]);
          imgInput.value = url;
          uploadBtn.textContent = '✓ Uploaded!';
        } catch (err) {
          uploadBtn.textContent = '📁 Upload';
        }
      }
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

    // Refresh controls, drops & reviews
    setupCardControls();
    setupImageDropHandlers();
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
      const heroBtn = document.getElementById('editor-hero-bg-btn');
      const addModal = document.getElementById('noody-add-item-modal-backdrop');
      const revModal = document.getElementById('noody-review-modal-backdrop');
      const imgModal = document.getElementById('noody-image-picker-modal-backdrop');
      const deleteButtons = Array.from(document.querySelectorAll('.noody-delete-card-btn'));
      const priceToggleButtons = Array.from(document.querySelectorAll('.noody-price-toggle-btn'));

      if (dock) dock.remove();
      if (toast) toast.remove();
      if (heroBtn) heroBtn.remove();
      if (addModal) addModal.remove();
      if (revModal) revModal.remove();
      if (imgModal) imgModal.remove();
      deleteButtons.forEach(b => b.remove());
      priceToggleButtons.forEach(b => b.remove());

      // 2. Clone clean document
      const cleanHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

      // 3. Re-insert dock and restore editing controls
      if (dock) document.body.appendChild(dock);
      document.body.classList.add('noody-editing');
      setupCardControls();
      setupHeroControls();
      setupImageDropHandlers();
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

    setupHeroControls();
    setupImageDropHandlers();
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
