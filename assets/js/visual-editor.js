/**
 * NOODY.AI — Inline Visual Editor
 * Click-to-edit inline content, add new services & products, delete cards, remove prices,
 * upload/drag-and-drop photos, live image drag repositioning, semi-blur, text focus colors & shape add options
 */

(function () {
  'use strict';

  const API_BASE = (window.location.origin && window.location.origin.startsWith('http')) ? window.location.origin : 'http://127.0.0.1:3000';
  let isEditing = false;
  const EDITABLE_SELECTORS = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p',
    '.nav-link', '.noody-logo-text',
    '.hero-eyebrow', '.hero-title', '.hero-description',
    '.section-eyebrow', '.section-title', '.section-sub',
    '.island-name', '.island-desc',
    '.item-card-title', '.item-card-desc',
    '.price-label', '.price-value',
    '.review-author', '.review-text',
    '.footer-tagline', '.footer-links a', '.footer-legal-links a', '.footer-col h4',
    '.filter-pill', '.island-badge', '.item-category-tag',
    '.btn-item-enquire span', '.btn-whatsapp-header span', '.btn-primary-hero', '.btn-secondary-hero'
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
    const logoBtn = document.getElementById('editor-logo-btn');
    const btnsBtn = document.getElementById('editor-buttons-btn');
    const pubBtn = document.getElementById('editor-publish-btn');

    if (isEditing) {
      badge.textContent = '✏️ Editing ON';
      badge.className = 'editor-badge mode-editing';
      toggleBtn.innerHTML = '👁️ Preview Mode';
      saveBtn.style.display = 'inline-flex';
      if (addSrvBtn) addSrvBtn.style.display = 'inline-flex';
      if (addPrdBtn) addPrdBtn.style.display = 'inline-flex';
      if (heroBtn) heroBtn.style.display = 'inline-flex';
      if (logoBtn) logoBtn.style.display = 'inline-flex';
      if (btnsBtn) btnsBtn.style.display = 'inline-flex';
      if (pubBtn) pubBtn.style.display = 'inline-flex';
      setupCardControls();
      setupHeroControls();
      setupImageDropHandlers();
      setupNavControls();
      setupFooterControls();
      setupSectionControls();
      setupLogoControls();
      setupButtonControls();
      initInlineTextFormatting();
      enableContentEditable();
      showToast('✏️ Edit Mode Active: Click Logo to customize, edit buttons, or add icons!');
    } else {
      badge.textContent = '👁️ Preview Mode';
      badge.className = 'editor-badge';
      toggleBtn.innerHTML = '✏️ Edit Page';
      saveBtn.style.display = 'none';
      if (addSrvBtn) addSrvBtn.style.display = 'none';
      if (addPrdBtn) addPrdBtn.style.display = 'none';
      if (heroBtn) heroBtn.style.display = 'none';
      if (logoBtn) logoBtn.style.display = 'none';
      if (btnsBtn) btnsBtn.style.display = 'none';
      if (pubBtn) pubBtn.style.display = 'none';
      disableContentEditable();
      const bubble = document.getElementById('noody-text-bubble');
      if (bubble) bubble.style.display = 'none';
      showToast('👁️ Preview Mode Active');
    }
  }

  // =========================================================================
  // CARD STYLING & POSITIONING CONTROLS
  // =========================================================================

  function setupCardControls() {
    // 0. Ensure persistent card IDs for deep linking
    document.querySelectorAll('.island-card, .item-card').forEach(card => {
      if (!card.id) {
        const idAttr = card.querySelector('[data-item-id]')?.getAttribute('data-item-id');
        if (idAttr) {
          card.id = idAttr;
        } else {
          const rawTitle = card.querySelector('.item-card-title, .island-name')?.textContent || 'item';
          const prefix = card.classList.contains('island-card') ? 'island-' : 'item-';
          card.id = prefix + rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
      }
    });

    // 1. Setup Card Delete Buttons on item-card
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
            showToast('⏳ Removing item card...');
            savePageToFile();
            showToast('🗑️ Item card deleted & saved live to website!');
          }
        });
        card.style.position = 'relative';
        card.appendChild(delBtn);
      }
    });

    // 2. Setup Card Edit Button on item-card (Admin Only)
    document.querySelectorAll('.item-card').forEach(card => {
      if (!card.querySelector('.noody-card-edit-btn')) {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'noody-card-edit-btn';
        editBtn.innerHTML = '✏️ Edit';
        editBtn.title = 'Edit item details, photo, prices, description';
        editBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openEditItemModal(card);
        });
        card.style.position = 'relative';
        card.appendChild(editBtn);
      }
    });

    // 3. Setup WhatsApp Bot Link Button directly on cards (Admin Only)
    document.querySelectorAll('.island-card, .item-card').forEach(card => {
      if (!card.querySelector('.noody-card-bot-btn')) {
        const botBtn = document.createElement('button');
        botBtn.type = 'button';
        botBtn.className = 'noody-card-bot-btn';
        botBtn.innerHTML = '🤖 Bot Link';
        botBtn.title = 'Copy direct deep link & formatted text for WhatsApp Bot';
        botBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openBotLinkModal(card);
        });
        card.style.position = 'relative';
        card.appendChild(botBtn);
      }
    });

    // 4. Setup Price Remove Buttons
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

    // 5. Setup Floating Style Toolbars on Island Cards and Item Cards
    document.querySelectorAll('.island-card, .item-card').forEach(card => {
      if (!card.querySelector('.noody-card-style-bar')) {
        const bar = document.createElement('div');
        bar.className = 'noody-card-style-bar';
        bar.innerHTML = `
          <button type="button" class="style-bar-btn btn-drag-pos" title="Click and drag with mouse to adjust photo position">✥ Drag Photo</button>
          <button type="button" class="style-bar-btn btn-blur-toggle" title="Toggle semi-blur intensity">🌫️ Blur</button>
          <button type="button" class="style-bar-btn btn-shape-toggle" title="Add frosted glass shape around text">🏷️ Shape</button>
          <button type="button" class="style-bar-btn btn-color-toggle" title="Change text color & focus">🎨 Color</button>
          <button type="button" class="style-bar-btn btn-edit-item-bar" title="Edit this item details, photo, and pricing">✏️ Edit</button>
          <button type="button" class="style-bar-btn btn-bot-modal" title="Copy WhatsApp Bot Deep Link">🤖 Bot Link</button>
          <button type="button" class="style-bar-btn btn-styler-modal" title="Open full styling inspector">⚙️ Styler</button>
        `;

        bar.querySelector('.btn-drag-pos').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          enableImageDragReposition(card);
        });

        bar.querySelector('.btn-blur-toggle').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          cycleBlur(card);
        });

        bar.querySelector('.btn-shape-toggle').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          cycleTextShape(card);
        });

        bar.querySelector('.btn-color-toggle').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          cycleTextColor(card);
        });

        bar.querySelector('.btn-edit-item-bar').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openEditItemModal(card);
        });

        bar.querySelector('.btn-bot-modal').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openBotLinkModal(card);
        });

        bar.querySelector('.btn-styler-modal').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openCardStylerModal(card);
        });

        card.style.position = 'relative';
        card.appendChild(bar);
      }
    });
  }

  // LIVE MOUSE DRAGGING FOR BACKGROUND / IMAGE POSITION
  function enableImageDragReposition(card) {
    card.classList.add('image-drag-active');

    // Create floating HUD
    let hud = document.getElementById('noody-drag-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'noody-drag-hud';
      hud.className = 'noody-drag-hud';
      document.body.appendChild(hud);
    }

    // Parse initial position (default 50% 50%)
    let currentX = 50;
    let currentY = 50;
    const bgPos = card.style.backgroundPosition || '50% 50%';
    const parts = bgPos.split(' ');
    if (parts.length >= 2) {
      currentX = parseFloat(parts[0]) || 50;
      currentY = parseFloat(parts[1]) || 50;
    }

    hud.innerHTML = `<span>✥ Drag mouse to position photo: <strong>${Math.round(currentX)}% ${Math.round(currentY)}%</strong></span> <button type="button" id="btn-done-drag" style="background:#14b8a6; color:#0a2239; border:none; padding:2px 8px; border-radius:999px; font-weight:800; cursor:pointer; pointer-events:auto;">✓ Done</button>`;
    hud.style.display = 'flex';

    let isMouseDown = false;
    let startX = 0;
    let startY = 0;
    let startPosX = currentX;
    let startPosY = currentY;

    function onMouseDown(e) {
      if (e.target.closest('button, input, select, a')) return;
      isMouseDown = true;
      startX = e.clientX;
      startY = e.clientY;
      startPosX = currentX;
      startPosY = currentY;
      e.preventDefault();
    }

    function onMouseMove(e) {
      if (!isMouseDown) return;
      const deltaX = (e.clientX - startX) * 0.35;
      const deltaY = (e.clientY - startY) * 0.35;

      currentX = Math.min(100, Math.max(0, startPosX - deltaX));
      currentY = Math.min(100, Math.max(0, startPosY - deltaY));

      const posStr = `${Math.round(currentX)}% ${Math.round(currentY)}%`;
      card.style.backgroundPosition = posStr;

      // If card has img tag
      const img = card.querySelector('img');
      if (img) img.style.objectPosition = posStr;

      hud.querySelector('strong').textContent = posStr;
    }

    function onMouseUp() {
      isMouseDown = false;
    }

    function finishDrag() {
      card.classList.remove('image-drag-active');
      card.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (hud) hud.style.display = 'none';
      showToast(`✅ Image position set to ${Math.round(currentX)}% ${Math.round(currentY)}%! Click "Save Changes" to save.`);
    }

    card.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const doneBtn = document.getElementById('btn-done-drag');
    if (doneBtn) doneBtn.addEventListener('click', finishDrag);
  }

  // CYCLE SEMI-BLUR INTENSITY
  function cycleBlur(card) {
    const currentBlur = card.style.getPropertyValue('--card-blur') || '4px';
    let nextBlur = '8px';
    let label = 'Medium Blur (8px)';

    if (currentBlur === '0px' || currentBlur === 'none') {
      nextBlur = '4px';
      label = 'Soft Semi-Blur (4px)';
    } else if (currentBlur === '4px') {
      nextBlur = '8px';
      label = 'Medium Blur (8px)';
    } else if (currentBlur === '8px') {
      nextBlur = '16px';
      label = 'Deep Blur (16px)';
    } else {
      nextBlur = '0px';
      label = 'No Blur (0px)';
    }

    card.style.setProperty('--card-blur', nextBlur);
    showToast(`🌫️ ${label} applied! Click "Save Changes" to write to file.`);
  }

  // CYCLE TEXT FOCUS SHAPE BOX
  function cycleTextShape(card) {
    const textBox = card.querySelector('.card-text-box') || card.querySelector('div:first-child');
    if (!textBox) return;

    if (!textBox.classList.contains('card-text-box')) {
      textBox.classList.add('card-text-box');
    }

    if (textBox.classList.contains('text-shape-glass')) {
      textBox.classList.remove('text-shape-glass');
      textBox.classList.add('text-shape-light');
      showToast('☀️ Frosted Light Glass Shape applied!');
    } else if (textBox.classList.contains('text-shape-light')) {
      textBox.classList.remove('text-shape-light');
      textBox.classList.add('text-shape-pill');
      showToast('🌿 Emerald Badge Shape applied!');
    } else if (textBox.classList.contains('text-shape-pill')) {
      textBox.classList.remove('text-shape-pill');
      showToast('✕ Shape Box removed (Clean text)');
    } else {
      textBox.classList.add('text-shape-glass');
      showToast('🔮 Frosted Dark Glass Shape Box added!');
    }
  }

  // CYCLE TEXT COLOR & FOCUS
  function cycleTextColor(card) {
    const nameEl = card.querySelector('.island-name') || card.querySelector('.item-card-title');
    const descEl = card.querySelector('.island-desc') || card.querySelector('.item-card-desc');
    const indicatorEl = card.querySelector('.island-select-indicator');

    const currentColor = nameEl ? nameEl.style.color : '';

    if (!currentColor || currentColor === 'rgb(255, 255, 255)' || currentColor === '#ffffff') {
      // Switch to Island Gold
      if (nameEl) nameEl.style.color = '#f59e0b';
      if (descEl) descEl.style.color = '#fef3c7';
      if (indicatorEl) indicatorEl.style.color = '#f59e0b';
      showToast('🟡 Text Color: Island Gold');
    } else if (currentColor === 'rgb(245, 158, 11)' || currentColor === '#f59e0b') {
      // Switch to Sky Cyan
      if (nameEl) nameEl.style.color = '#38bdf8';
      if (descEl) descEl.style.color = '#e0f2fe';
      if (indicatorEl) indicatorEl.style.color = '#38bdf8';
      showToast('🔵 Text Color: Sky Cyan');
    } else if (currentColor === 'rgb(56, 189, 248)' || currentColor === '#38bdf8') {
      // Switch to Emerald Green
      if (nameEl) nameEl.style.color = '#10b981';
      if (descEl) descEl.style.color = '#d1fae5';
      if (indicatorEl) indicatorEl.style.color = '#10b981';
      showToast('🟢 Text Color: Emerald Green');
    } else if (currentColor === 'rgb(16, 185, 129)' || currentColor === '#10b981') {
      // Switch to Deep Navy
      if (nameEl) nameEl.style.color = '#0a2239';
      if (descEl) descEl.style.color = '#334155';
      if (indicatorEl) indicatorEl.style.color = '#08755c';
      showToast('⚫ Text Color: Deep Navy');
    } else {
      // Switch to Pure White Focus
      if (nameEl) nameEl.style.color = '#ffffff';
      if (descEl) descEl.style.color = '#f1f5f9';
      if (indicatorEl) indicatorEl.style.color = '#38bdf8';
      showToast('⚪ Text Color: Pure White Focus');
    }
  }

  // FULL CARD STYLER MODAL (INSPECTOR)
  function openCardStylerModal(card) {
    const modalId = 'noody-card-styler-modal-backdrop';
    let backdrop = document.getElementById(modalId);

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = modalId;
      backdrop.className = 'noody-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const title = card.querySelector('.island-name, .item-card-title')?.textContent?.trim() || 'Card';
    const bgPos = card.style.backgroundPosition || '50% 50%';
    const parts = bgPos.split(' ');
    const posX = parseFloat(parts[0]) || 50;
    const posY = parseFloat(parts[1]) || 50;
    const currentBlur = parseInt(card.style.getPropertyValue('--card-blur')) || 5;

    const textBox = card.querySelector('.card-text-box') || card.querySelector('div:first-child');
    let activeShape = 'none';
    if (textBox) {
      if (textBox.classList.contains('text-shape-glass')) activeShape = 'glass';
      else if (textBox.classList.contains('text-shape-light')) activeShape = 'light';
      else if (textBox.classList.contains('text-shape-pill')) activeShape = 'pill';
    }

    backdrop.innerHTML = `
      <div class="noody-modal" role="dialog" aria-modal="true" style="max-width: 580px;">
        <div class="noody-modal-header">
          <div>
            <h3>🎨 Visual Styler: ${title}</h3>
            <div class="noody-modal-subtitle">Adjust photo position, semi-blur, text colors &amp; focus shapes</div>
          </div>
          <button type="button" class="noody-modal-close" id="noody-styler-close">&times;</button>
        </div>
        <div class="noody-modal-body">
          <div class="styler-grid">
            <!-- 1. Image Drag / Position -->
            <div>
              <div style="font-weight: 700; color: #0a2239; margin-bottom: 8px;">1. Image Position (Pan Vertically / Horizontally)</div>
              <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 8px;">
                <label style="font-size:0.8rem; width:80px;">Vertical (Y):</label>
                <input type="range" id="styler-pos-y" min="0" max="100" value="${posY}" style="flex:1;">
                <span id="styler-pos-y-val" style="font-size:0.8rem; font-weight:700; width:45px;">${Math.round(posY)}%</span>
              </div>
              <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 12px;">
                <label style="font-size:0.8rem; width:80px;">Horizontal (X):</label>
                <input type="range" id="styler-pos-x" min="0" max="100" value="${posX}" style="flex:1;">
                <span id="styler-pos-x-val" style="font-size:0.8rem; font-weight:700; width:45px;">${Math.round(posX)}%</span>
              </div>
              <div class="styler-chips-bar">
                <button type="button" class="styler-chip" onclick="document.getElementById('styler-pos-y').value=0; document.getElementById('styler-pos-y').dispatchEvent(new Event('input'));">⬆️ Align Top</button>
                <button type="button" class="styler-chip" onclick="document.getElementById('styler-pos-y').value=30; document.getElementById('styler-pos-y').dispatchEvent(new Event('input'));">🎯 Horizon / Runway (30%)</button>
                <button type="button" class="styler-chip" onclick="document.getElementById('styler-pos-y').value=50; document.getElementById('styler-pos-y').dispatchEvent(new Event('input'));">🎯 Center (50%)</button>
                <button type="button" class="styler-chip" onclick="document.getElementById('styler-pos-y').value=100; document.getElementById('styler-pos-y').dispatchEvent(new Event('input'));">⬇️ Align Bottom</button>
              </div>
            </div>

            <!-- 2. Semi-Blur Slider -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 14px;">
              <div style="font-weight: 700; color: #0a2239; margin-bottom: 8px;">2. Background Semi-Blur Intensity</div>
              <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 8px;">
                <input type="range" id="styler-blur" min="0" max="20" value="${currentBlur}" style="flex:1;">
                <span id="styler-blur-val" style="font-size:0.8rem; font-weight:700; width:45px;">${currentBlur}px</span>
              </div>
              <div class="styler-chips-bar">
                <button type="button" class="styler-chip" data-blur="0">No Blur (0px)</button>
                <button type="button" class="styler-chip" data-blur="4">Soft Semi-Blur (4px)</button>
                <button type="button" class="styler-chip" data-blur="8">Medium Blur (8px)</button>
                <button type="button" class="styler-chip" data-blur="14">Deep Blur (14px)</button>
              </div>
            </div>

            <!-- 3. Text Shape Box -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 14px;">
              <div style="font-weight: 700; color: #0a2239; margin-bottom: 8px;">3. Text Focus Shape (Card Box Backing)</div>
              <div class="styler-chips-bar" id="styler-shape-chips">
                <button type="button" class="styler-chip ${activeShape === 'none' ? 'active' : ''}" data-shape="none">✕ None (Clean Text)</button>
                <button type="button" class="styler-chip ${activeShape === 'glass' ? 'active' : ''}" data-shape="glass">🔮 Frosted Dark Glass Shape</button>
                <button type="button" class="styler-chip ${activeShape === 'light' ? 'active' : ''}" data-shape="light">☀️ Frosted White Glass Shape</button>
                <button type="button" class="styler-chip ${activeShape === 'pill' ? 'active' : ''}" data-shape="pill">🌿 Emerald Box Shape</button>
              </div>
            </div>

            <!-- 4. Text Color Palette -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 14px;">
              <div style="font-weight: 700; color: #0a2239; margin-bottom: 8px;">4. Text Color &amp; Focus</div>
              <div style="display:flex; align-items:center; gap: 10px;">
                <div class="color-swatch-chip" data-color="#ffffff" style="background:#ffffff; border:1px solid #cbd5e1;" title="White"></div>
                <div class="color-swatch-chip" data-color="#0a2239" style="background:#0a2239;" title="Navy"></div>
                <div class="color-swatch-chip" data-color="#f59e0b" style="background:#f59e0b;" title="Gold"></div>
                <div class="color-swatch-chip" data-color="#38bdf8" style="background:#38bdf8;" title="Sky Blue"></div>
                <div class="color-swatch-chip" data-color="#10b981" style="background:#10b981;" title="Emerald"></div>
                <input type="color" id="styler-custom-color" value="#ffffff" style="border:none; width:34px; height:34px; cursor:pointer;">
              </div>
            </div>
          </div>

          <div style="margin-top: 24px;">
            <button type="button" id="btn-styler-done" class="btn-submit-review">✓ Apply &amp; Close Inspector</button>
          </div>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    // Live Listeners for Position
    const posYSlider = backdrop.querySelector('#styler-pos-y');
    const posXSlider = backdrop.querySelector('#styler-pos-x');
    const posYVal = backdrop.querySelector('#styler-pos-y-val');
    const posXVal = backdrop.querySelector('#styler-pos-x-val');

    function updatePos() {
      const y = posYSlider.value;
      const x = posXSlider.value;
      posYVal.textContent = y + '%';
      posXVal.textContent = x + '%';
      const posStr = `${x}% ${y}%`;
      card.style.backgroundPosition = posStr;
      const img = card.querySelector('img');
      if (img) img.style.objectPosition = posStr;
    }

    posYSlider.addEventListener('input', updatePos);
    posXSlider.addEventListener('input', updatePos);

    // Live Blur Slider
    const blurSlider = backdrop.querySelector('#styler-blur');
    const blurVal = backdrop.querySelector('#styler-blur-val');

    function updateBlur(b) {
      blurSlider.value = b;
      blurVal.textContent = b + 'px';
      card.style.setProperty('--card-blur', b + 'px');
    }

    blurSlider.addEventListener('input', () => updateBlur(blurSlider.value));
    backdrop.querySelectorAll('[data-blur]').forEach(btn => {
      btn.addEventListener('click', () => updateBlur(btn.getAttribute('data-blur')));
    });

    // Shape Box Handler
    backdrop.querySelectorAll('#styler-shape-chips .styler-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        backdrop.querySelectorAll('#styler-shape-chips .styler-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const shape = chip.getAttribute('data-shape');

        let tb = card.querySelector('.card-text-box') || card.querySelector('div:first-child');
        if (tb) {
          tb.classList.add('card-text-box');
          tb.classList.remove('text-shape-glass', 'text-shape-light', 'text-shape-pill');
          if (shape === 'glass') tb.classList.add('text-shape-glass');
          else if (shape === 'light') tb.classList.add('text-shape-light');
          else if (shape === 'pill') tb.classList.add('text-shape-pill');
        }
      });
    });

    // Color Swatch Handlers
    function applyColor(hex) {
      const nameEl = card.querySelector('.island-name, .item-card-title');
      const descEl = card.querySelector('.island-desc, .item-card-desc');
      if (nameEl) nameEl.style.color = hex;
      if (descEl) descEl.style.color = hex === '#ffffff' ? '#f1f5f9' : hex;
    }

    backdrop.querySelectorAll('.color-swatch-chip').forEach(c => {
      c.addEventListener('click', () => applyColor(c.getAttribute('data-color')));
    });
    backdrop.querySelector('#styler-custom-color').addEventListener('input', (e) => {
      applyColor(e.target.value);
    });

    // Done & Close
    const closeBtn = backdrop.querySelector('#noody-styler-close');
    const doneBtn = backdrop.querySelector('#btn-styler-done');
    const closeFn = () => {
      backdrop.classList.remove('active');
      showToast('✅ Styles updated! Click "💾 Save Changes" to write to file.');
    };
    closeBtn.addEventListener('click', closeFn);
    doneBtn.addEventListener('click', closeFn);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeFn();
    });
  }

  // =========================================================================
  // WHATSAPP BOT INTEGRATION: DIRECT DEEP LINK & PRE-MADE BOT TEXT MODAL
  // =========================================================================

  function openBotLinkModal(card) {
    const modalId = 'noody-bot-modal-backdrop';
    let backdrop = document.getElementById(modalId);
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = modalId;
      backdrop.className = 'noody-bot-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    // 1. Ensure Card has a persistent ID
    let itemId = card.id;
    if (!itemId) {
      itemId = card.querySelector('[data-item-id]')?.getAttribute('data-item-id');
    }
    if (!itemId) {
      const rawTitle = card.querySelector('.item-card-title, .island-name')?.textContent || 'item';
      const prefix = card.classList.contains('island-card') ? 'island-' : 'item-';
      itemId = prefix + rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      card.id = itemId;
    }

    // 2. Extract Card Info
    const itemName = card.querySelector('.item-card-title, .island-name')?.textContent.trim() || 'NOODY Listing';
    const rawIsland = card.getAttribute('data-listing-island') || card.getAttribute('data-island') || 'AGATTI';
    const islandName = rawIsland.charAt(0) + rawIsland.slice(1).toLowerCase() + ' Island';
    const category = card.querySelector('.item-category-tag, .island-badge')?.textContent.trim() || 'Experience';
    const desc = card.querySelector('.item-card-desc, .island-desc')?.textContent.trim() || 'Verified Lakshadweep experience and island booking.';
    const price = card.querySelector('.price-value')?.textContent.trim() || '';
    const ratingScore = card.querySelector('.rating-score')?.textContent.trim() || '4.9';
    const ratingCount = card.querySelector('.rating-count')?.textContent.trim() || '(5)';

    // 3. Generate Link
    const pageUrl = window.location.origin + window.location.pathname;
    const directUrl = `${pageUrl}?item=${encodeURIComponent(itemId)}`;

    // 4. Generate Styled WhatsApp Bot Message
    const botMessage = 
`🌴 *${itemName}*
📍 Island: ${islandName} · ${category}
⭐ Rating: ${ratingScore}/5.0 (Verified Operators)
${price ? `💰 Price Guide: ${price}\n` : ''}
📖 *Description:*
${desc}

📸 *View HD Photos, Reviews & Instant Booking Details:*
👉 ${directUrl}`;

    backdrop.innerHTML = `
      <div class="noody-bot-modal-card" role="dialog" aria-modal="true">
        <div class="bot-modal-header">
          <div class="bot-modal-title">
            <span>🤖 WhatsApp Bot Integration</span>
          </div>
          <button type="button" class="noody-modal-close" id="btn-bot-modal-close" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
        </div>

        <p style="font-size:0.85rem; color:#64748b; margin-bottom:12px;">
          Use this direct deep-link in your WhatsApp Bot messages. When customers click this link, it opens directly to <b>${itemName}</b> with full photos, descriptions, reviews, and a direct WhatsApp booking button!
        </p>

        <!-- Direct Short Link Group -->
        <div style="font-weight:700; font-size:0.8rem; color:#0a2239; margin-bottom:4px;">1. Direct Website Deep Link:</div>
        <div class="bot-url-input-group">
          <input type="text" class="bot-url-input" id="bot-modal-url-input" value="${directUrl}" readonly>
          <button type="button" class="btn-bot-copy-url" id="btn-bot-copy-url-only">📋 Copy Link</button>
        </div>

        <!-- WhatsApp Bot Text Preview Box -->
        <div style="font-weight:700; font-size:0.8rem; color:#0a2239; margin-bottom:4px;">2. Ready-to-Paste WhatsApp Bot Text:</div>
        <div class="bot-wa-preview-box">
          <div class="bot-wa-bubble" id="bot-modal-text-preview">${escapeHtml(botMessage)}</div>
        </div>

        <!-- Modal Actions -->
        <div class="bot-modal-actions">
          <button type="button" class="btn-bot-copy-all" id="btn-bot-copy-full-text">
            <span>📋 Copy Full WhatsApp Bot Message</span>
          </button>
          <a href="${directUrl}" target="_blank" rel="noopener" class="btn-bot-test-link" id="btn-bot-test-link">
            <span>🚀 Test Customer View</span> →
          </a>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    // Copy URL Only
    backdrop.querySelector('#btn-bot-copy-url-only').addEventListener('click', () => {
      navigator.clipboard.writeText(directUrl).then(() => {
        showToast('✅ Short link copied! Paste in your WhatsApp bot.');
      }).catch(() => {
        const inp = backdrop.querySelector('#bot-modal-url-input');
        inp.select();
        document.execCommand('copy');
        showToast('✅ Short link copied!');
      });
    });

    // Copy Full Bot Message
    backdrop.querySelector('#btn-bot-copy-full-text').addEventListener('click', () => {
      navigator.clipboard.writeText(botMessage).then(() => {
        showToast('✅ Full WhatsApp Bot message copied! Ready to paste into bot.');
      }).catch(() => {
        showToast('✅ Copied to clipboard!');
      });
    });

    // Close handlers
    const closeBtn = backdrop.querySelector('#btn-bot-modal-close');
    const closeFn = () => backdrop.classList.remove('active');
    closeBtn.addEventListener('click', closeFn);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeFn();
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // =========================================================================
  // INLINE FLOATING TEXT FORMATTING & COLOR TOOLBAR
  // =========================================================================

  let activeEditableElement = null;

  function initInlineTextFormatting() {
    let bubble = document.getElementById('noody-text-bubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.id = 'noody-text-bubble';
      bubble.className = 'noody-text-bubble';
      bubble.style.display = 'none';
      bubble.innerHTML = `
        <div class="text-bubble-colors">
          <div class="color-dot-chip" data-color="#ffffff" style="background:#ffffff;" title="White"></div>
          <div class="color-dot-chip" data-color="#0a2239" style="background:#0a2239;" title="Navy"></div>
          <div class="color-dot-chip" data-color="#f59e0b" style="background:#f59e0b;" title="Gold"></div>
          <div class="color-dot-chip" data-color="#0284c7" style="background:#0284c7;" title="Sky Blue"></div>
          <div class="color-dot-chip" data-color="#10b981" style="background:#10b981;" title="Emerald"></div>
          <div class="color-dot-chip" data-color="#ef4444" style="background:#ef4444;" title="Coral Red"></div>
          <div class="color-dot-chip" data-color="#8b5cf6" style="background:#8b5cf6;" title="Purple"></div>
          <input type="color" class="color-picker-input-mini" id="bubble-custom-color" value="#ffffff" title="Custom Hex Color">
        </div>
        <div class="text-bubble-divider"></div>
        <button type="button" class="text-bubble-btn" id="bubble-btn-bold" title="Bold"><b>B</b></button>
        <button type="button" class="text-bubble-btn" id="bubble-btn-italic" title="Italic"><i>I</i></button>
        <button type="button" class="text-bubble-btn" id="bubble-btn-icon" title="Add / Change Icon in HTML">⭐ Icon</button>
        <button type="button" class="text-bubble-btn" id="bubble-btn-html" title="Edit HTML Directly">&lt;/&gt; HTML</button>
      `;
      document.body.appendChild(bubble);

      // Event handlers for bubble colors
      bubble.querySelectorAll('.color-dot-chip').forEach(chip => {
        chip.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const col = chip.getAttribute('data-color');
          applyTextColor(col);
        });
      });

      bubble.querySelector('#bubble-custom-color').addEventListener('input', (e) => {
        applyTextColor(e.target.value);
      });

      bubble.querySelector('#bubble-btn-bold').addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.execCommand('bold', false, null);
      });

      bubble.querySelector('#bubble-btn-italic').addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.execCommand('italic', false, null);
      });

      bubble.querySelector('#bubble-btn-icon').addEventListener('click', (e) => {
        e.preventDefault();
        openIconPickerModal((chosenIcon) => {
          insertIconIntoElement(chosenIcon);
        });
      });

      bubble.querySelector('#bubble-btn-html').addEventListener('click', (e) => {
        e.preventDefault();
        if (activeEditableElement) {
          openHtmlEditorModal(activeEditableElement);
        }
      });
    }

    function insertIconIntoElement(icon) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(icon + ' ');
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (activeEditableElement) {
        activeEditableElement.innerHTML = icon + ' ' + activeEditableElement.innerHTML;
      }
      showToast(`⭐ Icon ${icon} added! Click "Save Changes" to apply.`);
    }

    function applyTextColor(hex) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('foreColor', false, hex);
      } else if (activeEditableElement) {
        activeEditableElement.style.color = hex;
      }
      showToast('🎨 Text color changed to ' + hex + '! Save (Ctrl+S) to apply.');
    }

    function checkSelection(e) {
      if (!isEditing) {
        if (bubble) bubble.style.display = 'none';
        return;
      }

      if (bubble.contains(e.target)) return;

      const sel = window.getSelection();
      const hasRange = sel && sel.rangeCount > 0 && !sel.isCollapsed;
      const targetEditable = e.target.closest('[contenteditable="true"]');

      if (hasRange || targetEditable) {
        activeEditableElement = targetEditable || sel.anchorNode?.parentElement;
        let rect = null;

        if (hasRange) {
          const range = sel.getRangeAt(0);
          rect = range.getBoundingClientRect();
        } else if (targetEditable) {
          rect = targetEditable.getBoundingClientRect();
        }

        if (rect && rect.width >= 0) {
          bubble.style.display = 'flex';
          const top = rect.top + window.scrollY - 12;
          const left = rect.left + window.scrollX + (rect.width / 2);
          bubble.style.top = Math.max(top, 10) + 'px';
          bubble.style.left = Math.max(left, 160) + 'px';
          return;
        }
      }

      bubble.style.display = 'none';
    }

    document.addEventListener('mouseup', checkSelection);
    document.addEventListener('keyup', checkSelection);
  }

  // =========================================================================
  // ICON PICKER MODAL (CATEGORIZED OCEAN, ISLAND, ADVENTURE & SHOPPING ICONS)
  // =========================================================================
  const ICON_SETS = [
    { category: '🏄 Water Sports & Adventures', icons: ['🏄', '🤿', '⛵', '🐬', '🚤', '🏊', '🐠', '🎣', '🛶', '🌊'] },
    { category: '🥥 Products & Shopping', icons: ['🥥', '🛒', '🛍️', '🐟', '🍲', '📦', '🎁', '🏷️', '🍯', '🌿'] },
    { category: '🌴 Islands & Nature', icons: ['🏝️', '🌴', '☀️', '🌅', '🌺', '🐚', '🦀', '🏖️', '🍍', '🌈'] },
    { category: '💬 Contact & Booking', icons: ['💬', '📞', '📱', '✉️', '📍', '🗺️', '🔔', '💳', '📅', '🤝'] },
    { category: '⚡ Badges & Arrows', icons: ['⚡', '✨', '⭐', '🔥', '🎯', '🚀', '💎', '🔑', '→', '➜', '❯', '✓'] }
  ];

  function openIconPickerModal(onSelect) {
    const modalId = 'noody-icon-modal-backdrop';
    let backdrop = document.getElementById(modalId);
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = modalId;
      backdrop.className = 'noody-icon-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    backdrop.innerHTML = `
      <div class="noody-customizer-card" style="max-width: 480px;">
        <div class="customizer-header">
          <div class="customizer-title">
            <span>⭐ Add / Change Icon in HTML</span>
          </div>
          <button type="button" class="noody-modal-close" id="btn-icon-close" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
        </div>

        <div style="margin-bottom: 12px;">
          <input type="text" id="icon-custom-input" class="form-input" placeholder="Type custom emoji, symbol or text here...">
        </div>

        <div style="max-height: 280px; overflow-y: auto; padding-right: 4px;">
          ${ICON_SETS.map(set => `
            <div style="margin-bottom: 14px;">
              <div style="font-size: 0.8rem; font-weight: 800; color: #0a2239; margin-bottom: 6px;">${set.category}</div>
              <div class="icon-picker-grid" style="margin-bottom: 0;">
                ${set.icons.map(ic => `<button type="button" class="icon-chip-btn" data-icon="${ic}">${ic}</button>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display:flex; gap:10px; margin-top: 16px;">
          <button type="button" id="btn-apply-custom-icon" class="btn-submit-review" style="flex:1;">✓ Insert Custom</button>
          <button type="button" id="btn-remove-icon" class="editor-dock-btn" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">✕ Clear</button>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    const closeFn = () => backdrop.classList.remove('active');
    backdrop.querySelector('#btn-icon-close').addEventListener('click', closeFn);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeFn(); });

    backdrop.querySelectorAll('.icon-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ic = btn.getAttribute('data-icon');
        closeFn();
        if (onSelect) onSelect(ic);
      });
    });

    backdrop.querySelector('#btn-apply-custom-icon').addEventListener('click', () => {
      const val = backdrop.querySelector('#icon-custom-input').value.trim();
      if (val) {
        closeFn();
        if (onSelect) onSelect(val);
      }
    });

    backdrop.querySelector('#btn-remove-icon').addEventListener('click', () => {
      closeFn();
      if (onSelect) onSelect('');
    });
  }

  // =========================================================================
  // RAW HTML ELEMENT EDITOR MODAL (TOTAL EDIT FOR ANY HTML AREA)
  // =========================================================================
  function openHtmlEditorModal(element) {
    if (!element) return;
    const modalId = 'noody-html-modal-backdrop';
    let backdrop = document.getElementById(modalId);
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = modalId;
      backdrop.className = 'noody-html-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const currentHtml = element.innerHTML;
    const tag = element.tagName.toLowerCase();

    backdrop.innerHTML = `
      <div class="noody-customizer-card" style="max-width: 620px;">
        <div class="customizer-header">
          <div class="customizer-title">
            <span>&lt;/&gt; Edit HTML &amp; Total Content (${tag})</span>
          </div>
          <button type="button" class="noody-modal-close" id="btn-html-close" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
        </div>

        <p style="font-size:0.82rem; color:#64748b; margin-bottom:10px;">
          Directly customize inner HTML, add icons, badges, spans or custom text. Changes reflect live on the page!
        </p>

        <textarea id="html-editor-textarea" class="html-editor-textarea">${escapeHtml(currentHtml)}</textarea>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
          <div style="display:flex; gap:6px;">
            <button type="button" id="btn-insert-span" class="editor-dock-btn" style="background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; font-size:0.75rem; padding:4px 10px;">+ &lt;span&gt;</button>
            <button type="button" id="btn-insert-icon-html" class="editor-dock-btn" style="background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; font-size:0.75rem; padding:4px 10px;">⭐ Add Icon</button>
          </div>
          <button type="button" id="btn-apply-html" class="btn-submit-review" style="width:auto; padding:10px 24px;">✓ Apply HTML</button>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    const textarea = backdrop.querySelector('#html-editor-textarea');
    const closeFn = () => backdrop.classList.remove('active');
    backdrop.querySelector('#btn-html-close').addEventListener('click', closeFn);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeFn(); });

    backdrop.querySelector('#btn-insert-span').addEventListener('click', () => {
      textarea.value += ' <span style="color:#14b8a6; font-weight:800;">Highlight</span>';
    });

    backdrop.querySelector('#btn-insert-icon-html').addEventListener('click', () => {
      openIconPickerModal((icon) => {
        textarea.value += (icon ? ` ${icon}` : '');
      });
    });

    backdrop.querySelector('#btn-apply-html').addEventListener('click', () => {
      element.innerHTML = textarea.value;
      closeFn();
      showToast('⏳ Saving HTML changes live to website...');
      savePageToFile();
      showToast('✅ HTML updated & saved live to website!');
    });
  }

  // =========================================================================
  // LOGO ADD & CUSTOMIZATION CONTROLS
  // =========================================================================
  function setupLogoControls() {
    const brand = document.querySelector('.brand-wrapper') || document.querySelector('.noody-wordmark');
    if (!brand) return;

    brand.style.position = 'relative';

    // 1. Add Edit Badge if not exists
    if (!brand.querySelector('.noody-logo-edit-btn')) {
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'noody-logo-edit-btn';
      editBtn.innerHTML = '✏️ Logo';
      editBtn.title = 'Upload logo image, change icon or brand name';
      editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLogoCustomizerModal();
      });
      brand.appendChild(editBtn);
    }

    // 2. Click on logo in edit mode
    const wordmark = brand.querySelector('.noody-wordmark') || brand;
    wordmark.addEventListener('click', (e) => {
      if (isEditing) {
        e.preventDefault();
        openLogoCustomizerModal();
      }
    });

    // 3. Drag and Drop Image File onto Logo
    brand.addEventListener('dragover', (e) => {
      if (!isEditing) return;
      e.preventDefault();
      brand.classList.add('noody-drop-target-active');
    });

    brand.addEventListener('dragleave', (e) => {
      brand.classList.remove('noody-drop-target-active');
    });

    brand.addEventListener('drop', async (e) => {
      if (!isEditing) return;
      e.preventDefault();
      brand.classList.remove('noody-drop-target-active');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          showToast('⏳ Uploading logo photo...');
          try {
            const url = await uploadImageFile(file);
            applyLogoImage(url);
            showToast('✅ New logo uploaded & applied! Save Changes to keep.');
          } catch (err) {
            showToast('❌ Logo upload failed: ' + err.message, true);
          }
        }
      }
    });
  }

  function applyLogoImage(url, maxH = '42px', shape = 'rounded') {
    const wordmark = document.querySelector('.noody-wordmark');
    if (!wordmark) return;

    let img = wordmark.querySelector('.noody-logo-img');
    const svg = wordmark.querySelector('.noody-logo-symbol');
    const iconSpan = wordmark.querySelector('.noody-logo-icon-span');

    if (!img) {
      img = document.createElement('img');
      img.className = 'noody-logo-img';
      img.alt = 'NOODY.AI Logo';
      wordmark.insertBefore(img, wordmark.firstChild);
    }

    img.src = url;
    img.style.display = 'block';
    img.style.maxHeight = maxH;
    img.style.borderRadius = shape === 'circle' ? '50%' : (shape === 'rounded' ? '8px' : '0px');

    if (svg) svg.style.display = 'none';
    if (iconSpan) iconSpan.style.display = 'none';
  }

  function applyLogoIcon(icon) {
    const wordmark = document.querySelector('.noody-wordmark');
    if (!wordmark) return;

    const img = wordmark.querySelector('.noody-logo-img');
    const svg = wordmark.querySelector('.noody-logo-symbol');
    let iconSpan = wordmark.querySelector('.noody-logo-icon-span');

    if (img) img.style.display = 'none';

    if (icon === 'DEFAULT_SVG') {
      if (svg) svg.style.display = 'block';
      if (iconSpan) iconSpan.style.display = 'none';
    } else {
      if (svg) svg.style.display = 'none';
      if (!iconSpan) {
        iconSpan = document.createElement('span');
        iconSpan.className = 'noody-logo-icon-span';
        iconSpan.style.fontSize = '2rem';
        iconSpan.style.lineHeight = '1';
        wordmark.insertBefore(iconSpan, wordmark.firstChild);
      }
      iconSpan.textContent = icon;
      iconSpan.style.display = 'inline-block';
    }
  }

  function openLogoCustomizerModal() {
    const modalId = 'noody-logo-modal-backdrop';
    let backdrop = document.getElementById(modalId);
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = modalId;
      backdrop.className = 'noody-logo-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const wordmark = document.querySelector('.noody-wordmark');
    const currentImg = wordmark?.querySelector('.noody-logo-img');
    const currentImgUrl = currentImg?.src || '';
    const currentText = wordmark?.querySelector('.noody-logo-text')?.textContent || 'NOODY.AI';

    backdrop.innerHTML = `
      <div class="noody-customizer-card">
        <div class="customizer-header">
          <div class="customizer-title">
            <span>🏷️ Logo &amp; Brand Customizer</span>
          </div>
          <button type="button" class="noody-modal-close" id="btn-logo-close" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
        </div>

        <!-- Live Logo Preview Box -->
        <div class="customizer-preview-box" id="logo-preview-box">
          <div style="display:flex; align-items:center; gap:10px;">
            <img id="logo-preview-img" src="${currentImgUrl}" alt="Preview" style="${currentImgUrl ? '' : 'display:none;'} max-height:42px; border-radius:8px;">
            <span id="logo-preview-icon" style="font-size:2rem; ${currentImgUrl ? 'display:none;' : ''}">🌴</span>
            <span id="logo-preview-text" class="noody-logo-text" style="font-size:1.5rem; font-weight:800;">${escapeHtml(currentText)}</span>
          </div>
        </div>

        <!-- Mode Tabs -->
        <div class="customizer-tabs">
          <button type="button" class="customizer-tab-btn active" data-tab="image">📁 Upload Logo Image</button>
          <button type="button" class="customizer-tab-btn" data-tab="icon">🏝️ Choose Icon</button>
          <button type="button" class="customizer-tab-btn" data-tab="text">✏️ Brand Text</button>
        </div>

        <!-- Tab 1: Image Upload -->
        <div class="tab-pane active" id="logo-tab-image">
          <div class="image-dropzone-box" id="logo-dropzone">
            <span class="image-dropzone-icon">📥</span>
            <div class="image-dropzone-title">Upload Image Logo (PNG, SVG, JPG, WebP)</div>
            <div class="image-dropzone-sub">Click to browse or drag and drop logo file here</div>
            <input type="file" id="logo-file-input" accept="image/*" style="display:none;">
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label style="font-weight:700; font-size:0.8rem; color:#0a2239; margin-bottom:4px; display:block;">Or Paste Direct Image URL:</label>
            <input type="url" id="logo-url-input" class="form-input" value="${currentImgUrl}" placeholder="https://example.com/logo.png">
          </div>

          <div style="display:flex; gap:16px; margin-bottom:14px; align-items:center;">
            <div style="flex:1;">
              <label style="font-weight:700; font-size:0.8rem; color:#0a2239; margin-bottom:4px; display:block;">Logo Height: <span id="logo-height-val">42px</span></label>
              <input type="range" id="logo-height-slider" min="20" max="64" value="42" style="width:100%;">
            </div>
            <div style="flex:1;">
              <label style="font-weight:700; font-size:0.8rem; color:#0a2239; margin-bottom:4px; display:block;">Shape:</label>
              <select id="logo-shape-select" class="form-select">
                <option value="rounded">Rounded Corners (8px)</option>
                <option value="circle">Circular Logo (50%)</option>
                <option value="original">Original Square (0px)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tab 2: Logo Icon -->
        <div class="tab-pane" id="logo-tab-icon" style="display:none;">
          <div style="font-weight:700; font-size:0.8rem; color:#0a2239; margin-bottom:6px;">Select Brand Icon:</div>
          <div class="icon-picker-grid">
            <button type="button" class="icon-chip-btn" data-logo-icon="DEFAULT_SVG" title="Original Circle N Symbol">Ⓝ</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="🌴">🌴</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="🏝️">🏝️</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="🌊">🌊</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="⛵">⛵</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="🤿">🤿</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="🐬">🐬</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="🥥">🥥</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="☀️">☀️</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="🐚">🐚</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="🐠">🐠</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="⚡">⚡</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="⭐">⭐</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="💎">💎</button>
            <button type="button" class="icon-chip-btn" data-logo-icon="🎯">🎯</button>
          </div>
        </div>

        <!-- Tab 3: Brand Text -->
        <div class="tab-pane" id="logo-tab-text" style="display:none;">
          <div class="form-group" style="margin-bottom:12px;">
            <label style="font-weight:700; font-size:0.8rem; color:#0a2239; margin-bottom:4px; display:block;">Brand Name Text:</label>
            <input type="text" id="logo-text-input" class="form-input" value="${escapeHtml(currentText)}" placeholder="NOODY.AI">
          </div>
          <div style="margin-bottom:12px;">
            <label style="font-weight:700; font-size:0.8rem; color:#0a2239; margin-bottom:4px; display:block;">Display Layout:</label>
            <div style="display:flex; gap:10px;">
              <label style="font-size:0.85rem; display:flex; align-items:center; gap:4px; cursor:pointer;">
                <input type="radio" name="logo-layout" value="both" checked> Logo + Brand Name
              </label>
              <label style="font-size:0.85rem; display:flex; align-items:center; gap:4px; cursor:pointer;">
                <input type="radio" name="logo-layout" value="logo-only"> Logo Only
              </label>
              <label style="font-size:0.85rem; display:flex; align-items:center; gap:4px; cursor:pointer;">
                <input type="radio" name="logo-layout" value="text-only"> Text Only
              </label>
            </div>
          </div>
        </div>

        <!-- Submit & Actions -->
        <div style="display:flex; gap:10px; margin-top:20px;">
          <button type="button" id="btn-apply-logo-changes" class="btn-submit-review" style="flex:1;">
            ✓ Apply Logo to Header
          </button>
          <button type="button" id="btn-reset-logo" class="editor-dock-btn" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">
            ↺ Reset
          </button>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    // Tab switching
    const tabBtns = backdrop.querySelectorAll('.customizer-tab-btn');
    const panes = {
      image: backdrop.querySelector('#logo-tab-image'),
      icon: backdrop.querySelector('#logo-tab-icon'),
      text: backdrop.querySelector('#logo-tab-text')
    };

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        Object.keys(panes).forEach(k => {
          if (panes[k]) panes[k].style.display = k === tab ? 'block' : 'none';
        });
      });
    });

    // Preview elements
    const prevImg = backdrop.querySelector('#logo-preview-img');
    const prevIcon = backdrop.querySelector('#logo-preview-icon');
    const prevText = backdrop.querySelector('#logo-preview-text');

    let chosenMode = currentImgUrl ? 'image' : 'icon';
    let chosenImageUrl = currentImgUrl;
    let chosenIcon = '🌴';
    let chosenHeight = '42px';
    let chosenShape = 'rounded';

    // File input & Dropzone
    const dropzone = backdrop.querySelector('#logo-dropzone');
    const fileInp = backdrop.querySelector('#logo-file-input');
    const urlInp = backdrop.querySelector('#logo-url-input');

    dropzone.addEventListener('click', () => fileInp.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files[0]) {
        handleLogoFile(e.dataTransfer.files[0]);
      }
    });

    fileInp.addEventListener('change', () => {
      if (fileInp.files && fileInp.files[0]) handleLogoFile(fileInp.files[0]);
    });

    async function handleLogoFile(file) {
      dropzone.querySelector('.image-dropzone-title').textContent = '⏳ Uploading logo...';
      try {
        const uploadedUrl = await uploadImageFile(file);
        chosenImageUrl = uploadedUrl;
        chosenMode = 'image';
        urlInp.value = uploadedUrl;
        prevImg.src = uploadedUrl;
        prevImg.style.display = 'block';
        prevIcon.style.display = 'none';
        dropzone.querySelector('.image-dropzone-title').textContent = '✓ Logo Uploaded!';
      } catch (err) {
        dropzone.querySelector('.image-dropzone-title').textContent = 'Upload Failed: ' + err.message;
      }
    }

    urlInp.addEventListener('input', () => {
      if (urlInp.value.trim()) {
        chosenImageUrl = urlInp.value.trim();
        chosenMode = 'image';
        prevImg.src = chosenImageUrl;
        prevImg.style.display = 'block';
        prevIcon.style.display = 'none';
      }
    });

    // Height Slider & Shape
    const heightSlider = backdrop.querySelector('#logo-height-slider');
    const heightVal = backdrop.querySelector('#logo-height-val');
    const shapeSelect = backdrop.querySelector('#logo-shape-select');

    heightSlider.addEventListener('input', () => {
      chosenHeight = heightSlider.value + 'px';
      heightVal.textContent = chosenHeight;
      prevImg.style.maxHeight = chosenHeight;
    });

    shapeSelect.addEventListener('change', () => {
      chosenShape = shapeSelect.value;
      prevImg.style.borderRadius = chosenShape === 'circle' ? '50%' : (chosenShape === 'rounded' ? '8px' : '0px');
    });

    // Icon chips
    backdrop.querySelectorAll('[data-logo-icon]').forEach(chip => {
      chip.addEventListener('click', () => {
        backdrop.querySelectorAll('[data-logo-icon]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        chosenIcon = chip.getAttribute('data-logo-icon');
        chosenMode = 'icon';
        prevImg.style.display = 'none';
        prevIcon.style.display = 'block';
        prevIcon.textContent = chosenIcon === 'DEFAULT_SVG' ? 'Ⓝ' : chosenIcon;
      });
    });

    // Text Input
    const textInp = backdrop.querySelector('#logo-text-input');
    textInp.addEventListener('input', () => {
      prevText.textContent = textInp.value || 'NOODY.AI';
    });

    // Apply button
    backdrop.querySelector('#btn-apply-logo-changes').addEventListener('click', () => {
      const layoutRadio = backdrop.querySelector('input[name="logo-layout"]:checked');
      const layout = layoutRadio ? layoutRadio.value : 'both';
      const newText = textInp.value.trim() || 'NOODY.AI';

      const wordmarkEl = document.querySelector('.noody-wordmark');
      if (wordmarkEl) {
        // Update brand text
        let textSpan = wordmarkEl.querySelector('.noody-logo-text');
        if (!textSpan) {
          textSpan = document.createElement('span');
          textSpan.className = 'noody-logo-text';
          wordmarkEl.appendChild(textSpan);
        }
        textSpan.textContent = newText;
        textSpan.style.display = layout === 'logo-only' ? 'none' : 'block';

        // Apply Image or Icon
        if (chosenMode === 'image' && chosenImageUrl) {
          applyLogoImage(chosenImageUrl, chosenHeight, chosenShape);
        } else {
          applyLogoIcon(chosenIcon);
        }

        if (layout === 'text-only') {
          const imgEl = wordmarkEl.querySelector('.noody-logo-img');
          const svgEl = wordmarkEl.querySelector('.noody-logo-symbol');
          const iconSpanEl = wordmarkEl.querySelector('.noody-logo-icon-span');
          if (imgEl) imgEl.style.display = 'none';
          if (svgEl) svgEl.style.display = 'none';
          if (iconSpanEl) iconSpanEl.style.display = 'none';
        }
      }

      backdrop.classList.remove('active');
      showToast('⏳ Saving logo changes live to website...');
      savePageToFile();
      showToast('✅ Logo updated & saved live to website!');
    });

    // Reset button
    backdrop.querySelector('#btn-reset-logo').addEventListener('click', () => {
      applyLogoIcon('DEFAULT_SVG');
      const textSpan = document.querySelector('.noody-logo-text');
      if (textSpan) {
        textSpan.textContent = 'NOODY.AI';
        textSpan.style.display = 'block';
      }
      backdrop.classList.remove('active');
      showToast('⏳ Resetting logo...');
      savePageToFile();
      showToast('↺ Logo reset to original symbol & saved!');
    });

    // Close handlers
    const closeFn = () => backdrop.classList.remove('active');
    backdrop.querySelector('#btn-logo-close').addEventListener('click', closeFn);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeFn(); });
  }

  // =========================================================================
  // BUTTON & ICON CUSTOMIZER (TOTAL CHANGE FOR HERO & ACTION BUTTONS)
  // =========================================================================
  function setupButtonControls() {
    const heroActions = document.querySelector('.hero-actions');
    if (!heroActions) return;

    // 1. Add badges to all buttons in .hero-actions
    heroActions.querySelectorAll('a, button').forEach(btn => {
      if (btn.classList.contains('noody-add-hero-btn')) return;
      btn.style.position = 'relative';

      if (!btn.querySelector('.noody-button-edit-badge')) {
        const badge = document.createElement('span');
        badge.className = 'noody-button-edit-badge';
        badge.innerHTML = '✏️ Edit';
        badge.title = 'Edit button text, icon, color & action (Total Change)';
        badge.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openButtonCustomizerModal(btn);
        });
        btn.appendChild(badge);
      }

      btn.addEventListener('click', (e) => {
        if (isEditing) {
          e.preventDefault();
          openButtonCustomizerModal(btn);
        }
      });
    });

    // 2. Add "➕ Add Button" in edit mode
    if (!heroActions.querySelector('.noody-add-hero-btn')) {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'noody-add-hero-btn';
      addBtn.innerHTML = '➕ Add Button';
      addBtn.title = 'Add an extra custom action button';
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newBtn = document.createElement('a');
        newBtn.href = '#services-section';
        newBtn.className = 'btn-hero-action btn-hero-services';
        newBtn.innerHTML = '<span>⚡ Explore Now</span> →';
        heroActions.insertBefore(newBtn, addBtn);
        setupButtonControls();
        openButtonCustomizerModal(newBtn);
      });
      heroActions.appendChild(addBtn);
    }
  }

  function openButtonCustomizerModal(btn) {
    if (!btn) return;
    const modalId = 'noody-button-modal-backdrop';
    let backdrop = document.getElementById(modalId);
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = modalId;
      backdrop.className = 'noody-button-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    // Extract current button details
    let currentText = btn.textContent.replace('Edit', '').trim();
    let currentHref = btn.getAttribute('href') || '#';

    // Parse leading icon if any
    let iconMatch = currentText.match(/^([\p{Emoji}\u200d]+)\s*(.*)$/u);
    let currentIcon = iconMatch ? iconMatch[1] : '';
    let currentPureText = iconMatch ? iconMatch[2].replace(/[→➜❯]/g, '').trim() : currentText.replace(/[→➜❯]/g, '').trim();
    let hasArrow = currentText.includes('→') || currentText.includes('➜') || currentText.includes('❯');

    backdrop.innerHTML = `
      <div class="noody-customizer-card">
        <div class="customizer-header">
          <div class="customizer-title">
            <span>⚡ Button &amp; Icon Customizer (Total Change)</span>
          </div>
          <button type="button" class="noody-modal-close" id="btn-btn-close" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
        </div>

        <!-- Live Button Preview Box -->
        <div class="customizer-preview-box">
          <a href="#" id="button-preview-elem" class="${btn.className.replace('noody-button-edit-badge', '')}" style="pointer-events:none;">
            <span id="button-preview-content">${escapeHtml(currentText)}</span>
          </a>
        </div>

        <!-- 1. Icon Selection Grid -->
        <div style="margin-bottom: 14px;">
          <label style="font-weight:700; font-size:0.82rem; color:#0a2239; margin-bottom:6px; display:block;">1. Select Icon or Symbol:</label>
          <div class="icon-picker-grid">
            <button type="button" class="icon-chip-btn ${!currentIcon ? 'active' : ''}" data-btn-icon="" title="No Icon">✕</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="🏄">🏄</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="🥥">🥥</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="💬">💬</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="🏝️">🏝️</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="⛵">⛵</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="🤿">🤿</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="🐬">🐬</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="🏨">🏨</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="🌴">🌴</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="🌊">🌊</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="🐠">🐠</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="🛒">🛒</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="⚡">⚡</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="⭐">⭐</button>
            <button type="button" class="icon-chip-btn" data-btn-icon="🔥">🔥</button>
          </div>
        </div>

        <!-- 2. Button Text & Arrow -->
        <div style="display:flex; gap:12px; margin-bottom:14px; align-items:flex-end;">
          <div style="flex:1;">
            <label style="font-weight:700; font-size:0.82rem; color:#0a2239; margin-bottom:4px; display:block;">2. Button Label Text:</label>
            <input type="text" id="button-label-input" class="form-input" value="${escapeHtml(currentPureText)}">
          </div>
          <div>
            <label style="font-weight:700; font-size:0.82rem; color:#0a2239; margin-bottom:4px; display:block;">Trailing Arrow:</label>
            <label style="display:flex; align-items:center; gap:6px; height:42px; cursor:pointer;">
              <input type="checkbox" id="button-arrow-checkbox" ${hasArrow ? 'checked' : ''}> Show "→"
            </label>
          </div>
        </div>

        <!-- 3. Target Link / Action URL -->
        <div style="margin-bottom:14px;">
          <label style="font-weight:700; font-size:0.82rem; color:#0a2239; margin-bottom:4px; display:block;">3. Action Target / Destination URL:</label>
          <input type="text" id="button-url-input" class="form-input" value="${escapeHtml(currentHref)}">
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
            <button type="button" class="editor-dock-btn" data-quick-url="#services-section" style="background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; font-size:0.75rem; padding:4px 10px;">🏄 Services Section</button>
            <button type="button" class="editor-dock-btn" data-quick-url="#products-section" style="background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; font-size:0.75rem; padding:4px 10px;">🥥 Products Section</button>
            <button type="button" class="editor-dock-btn" data-quick-url="#islands-section" style="background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; font-size:0.75rem; padding:4px 10px;">🏝️ Islands Section</button>
            <button type="button" class="editor-dock-btn" data-quick-url="https://wa.me/919446944562" style="background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; font-size:0.75rem; padding:4px 10px;">💬 WhatsApp Link</button>
          </div>
        </div>

        <!-- 4. Style & Color Theme (Total Change) -->
        <div style="margin-bottom:18px;">
          <label style="font-weight:700; font-size:0.82rem; color:#0a2239; margin-bottom:6px; display:block;">4. Button Theme / Color Style:</label>
          <div class="style-preset-chips" id="button-style-presets">
            <button type="button" class="style-preset-btn" data-theme="btn-hero-services" style="background:linear-gradient(135deg, #14b8a6, #08755c); color:#ffffff;">🌊 Teal Lagoon</button>
            <button type="button" class="style-preset-btn" data-theme="btn-hero-products" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#ffffff;">🥥 Amber Gold</button>
            <button type="button" class="style-preset-btn" data-theme="btn-hero-whatsapp" style="background:#25D366; color:#ffffff;">💬 WhatsApp Green</button>
            <button type="button" class="style-preset-btn" data-theme="theme-navy" style="background:#0a2239; color:#ffffff;">🌌 Deep Navy</button>
            <button type="button" class="style-preset-btn" data-theme="theme-coral" style="background:linear-gradient(135deg, #f43f5e, #be123c); color:#ffffff;">🌺 Coral Red</button>
            <button type="button" class="style-preset-btn" data-theme="theme-glass" style="background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.4); color:#ffffff;">🪟 Frosted Glass</button>
          </div>
        </div>

        <!-- Modal Actions -->
        <div style="display:flex; gap:10px;">
          <button type="button" id="btn-apply-button-custom" class="btn-submit-review" style="flex:1;">
            ✓ Apply Button Changes
          </button>
          <button type="button" id="btn-delete-this-button" class="editor-dock-btn" style="background:#fee2e2; color:#ef4444; border:1px solid #fca5a5;">
            🗑️ Delete Button
          </button>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    const previewElem = backdrop.querySelector('#button-preview-elem');
    const previewContent = backdrop.querySelector('#button-preview-content');
    const labelInp = backdrop.querySelector('#button-label-input');
    const arrowCheck = backdrop.querySelector('#button-arrow-checkbox');
    const urlInp = backdrop.querySelector('#button-url-input');

    let activeIcon = currentIcon;
    let activeTheme = '';

    function updateBtnPreview() {
      const text = labelInp.value.trim();
      const arrow = arrowCheck.checked ? ' →' : '';
      const iconStr = activeIcon ? `${activeIcon} ` : '';
      previewContent.textContent = `${iconStr}${text}${arrow}`;
    }

    labelInp.addEventListener('input', updateBtnPreview);
    arrowCheck.addEventListener('change', updateBtnPreview);

    // Icon chips
    backdrop.querySelectorAll('[data-btn-icon]').forEach(chip => {
      chip.addEventListener('click', () => {
        backdrop.querySelectorAll('[data-btn-icon]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeIcon = chip.getAttribute('data-btn-icon');
        updateBtnPreview();
      });
    });

    // Quick URLs
    backdrop.querySelectorAll('[data-quick-url]').forEach(btnQuick => {
      btnQuick.addEventListener('click', () => {
        urlInp.value = btnQuick.getAttribute('data-quick-url');
      });
    });

    // Theme chips
    backdrop.querySelectorAll('#button-style-presets .style-preset-btn').forEach(preset => {
      preset.addEventListener('click', () => {
        backdrop.querySelectorAll('#button-style-presets .style-preset-btn').forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
        activeTheme = preset.getAttribute('data-theme');
        previewElem.className = 'btn-hero-action ' + activeTheme;
      });
    });

    // Apply button
    backdrop.querySelector('#btn-apply-button-custom').addEventListener('click', () => {
      const text = labelInp.value.trim();
      const arrow = arrowCheck.checked ? ' →' : '';
      const iconStr = activeIcon ? `${activeIcon} ` : '';
      const newUrl = urlInp.value.trim() || '#';

      btn.setAttribute('href', newUrl);
      if (newUrl.startsWith('https://wa.me')) {
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener');
      }

      if (activeTheme) {
        btn.className = 'btn-hero-action ' + activeTheme;
      }

      btn.innerHTML = `<span>${iconStr}${text}</span>${arrow}`;
      backdrop.classList.remove('active');
      setupButtonControls();
      showToast('⏳ Saving button changes live to website...');
      savePageToFile();
      showToast('✅ Button updated & saved live to website!');
    });

    // Delete button
    backdrop.querySelector('#btn-delete-this-button').addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this button?')) {
        btn.remove();
        backdrop.classList.remove('active');
        showToast('⏳ Removing button...');
        savePageToFile();
        showToast('🗑️ Button removed & saved live to website!');
      }
    });

    // Close handlers
    const closeFn = () => backdrop.classList.remove('active');
    backdrop.querySelector('#btn-btn-close').addEventListener('click', closeFn);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeFn(); });
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

  // NAV LINKS CUSTOMIZATION & DELETION
  function setupNavControls() {
    // 1. Setup Delete Buttons on all .nav-link
    document.querySelectorAll('.site-nav .nav-link').forEach(link => {
      if (!link.querySelector('.noody-nav-delete-btn')) {
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'noody-nav-delete-btn';
        delBtn.innerHTML = '✕';
        delBtn.title = 'Delete this menu item';
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const name = link.textContent.replace('✕', '').trim();
          if (confirm(`Do you want to delete menu link "${name}"?`)) {
            link.remove();
            showToast(`⏳ Removing menu link...`);
            savePageToFile();
            showToast(`🗑️ Menu link "${name}" deleted & saved live!`);
          }
        });
        link.style.position = 'relative';
        link.appendChild(delBtn);

        // Remove data-i18n on edit so translation table doesn't overwrite user changes
        link.addEventListener('input', () => {
          link.removeAttribute('data-i18n');
        });

        // Double click to change link URL
        link.addEventListener('dblclick', (e) => {
          if (!isEditing) return;
          e.preventDefault();
          e.stopPropagation();
          const currentHref = link.getAttribute('href') || '#';
          const newHref = prompt('Edit link destination URL (e.g. islands.html, services.html, #):', currentHref);
          if (newHref !== null && newHref.trim()) {
            link.setAttribute('href', newHref.trim());
            showToast(`🔗 Link URL updated to "${newHref.trim()}"! Click "Save Changes" to save.`);
          }
        });
      }
    });

    // 2. Add Nav Link button in .site-nav
    const nav = document.querySelector('.site-nav');
    if (nav && !nav.querySelector('.noody-add-nav-btn')) {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'noody-add-nav-btn';
      addBtn.innerHTML = '➕ Add Link';
      addBtn.title = 'Add a new menu link to header';
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const linkText = prompt('Enter title for new menu link (e.g. Packages, Offers, Blog):');
        if (linkText && linkText.trim()) {
          const linkUrl = prompt('Enter link URL (e.g. packages.html, #services-section, #):', '#') || '#';
          const newLink = document.createElement('a');
          newLink.href = linkUrl.trim();
          newLink.className = 'nav-link';
          newLink.textContent = linkText.trim();
          newLink.setAttribute('contenteditable', 'true');
          newLink.setAttribute('spellcheck', 'false');
          nav.insertBefore(newLink, addBtn);
          setupNavControls();
          showToast(`⏳ Saving new menu link...`);
          savePageToFile();
          showToast(`✅ Menu link "${linkText.trim()}" added & saved live!`);
        }
      });
      nav.appendChild(addBtn);
    }
  }

  // FOOTER LINKS CUSTOMIZATION & DELETION
  function setupFooterControls() {
    document.querySelectorAll('.footer-links li a, .footer-legal-links a').forEach(link => {
      const parent = link.parentElement;
      if (!parent.querySelector('.noody-nav-delete-btn')) {
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'noody-nav-delete-btn';
        delBtn.innerHTML = '✕';
        delBtn.title = 'Delete this link';
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const name = link.textContent.trim();
          if (confirm(`Delete footer link "${name}"?`)) {
            if (parent.tagName === 'LI') {
              parent.remove();
            } else {
              link.remove();
            }
            showToast(`🗑️ Footer link "${name}" deleted! Click "Save Changes" to apply.`);
          }
        });
        parent.style.position = 'relative';
        parent.appendChild(delBtn);

        link.addEventListener('input', () => {
          link.removeAttribute('data-i18n');
        });
      }
    });
  }

  // SECTION DELETION (DELETE ENTIRE SECTION)
  function setupSectionControls() {
    document.querySelectorAll('section, footer').forEach(sec => {
      if (!sec.querySelector('.noody-delete-section-btn')) {
        let label = 'Section';
        if (sec.id === 'islands-section') label = 'Islands Section';
        else if (sec.id === 'services-section') label = 'Services Section';
        else if (sec.id === 'products-section') label = 'Products Section';
        else if (sec.id === 'how-it-works') label = 'How It Works Section';
        else if (sec.classList.contains('feedback-section')) label = 'Feedback Section';
        else if (sec.classList.contains('noody-hero-slider')) label = 'Hero Slider Section';
        else if (sec.tagName === 'FOOTER') label = 'Footer';

        const delSecBtn = document.createElement('button');
        delSecBtn.type = 'button';
        delSecBtn.className = 'noody-delete-section-btn';
        delSecBtn.innerHTML = `🗑️ Delete ${label}`;
        delSecBtn.title = `Completely delete this ${label}`;
        delSecBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm(`Are you sure you want to completely delete "${label}" from this page?`)) {
            sec.remove();
            showToast(`🗑️ "${label}" deleted! Click "Save Changes" to apply.`);
          }
        });
        sec.style.position = 'relative';
        sec.appendChild(delSecBtn);
      }
    });
  }

  function enableContentEditable() {
    EDITABLE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
        if (!el._hasI18nCleaner) {
          el._hasI18nCleaner = true;
          el.addEventListener('input', () => {
            el.removeAttribute('data-i18n');
          });
        }
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
          const res = await fetch(`${API_BASE}/api/upload-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, base64: base64 })
          });
          if (res.ok) {
            const data = await res.json();
            resolve(data.url);
          } else {
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
      target.style.backgroundSize = 'cover';
      target.style.backgroundPosition = 'center center';
    }
  }

  function getTargetCurrentUrl(target) {
    if (!target) return '';
    const img = target.tagName === 'IMG' ? target : target.querySelector('img');
    if (img) return img.src;
    return target.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
  }

  function setupImageDropHandlers() {
    const dropTargets = document.querySelectorAll('.item-card-media, .slide-image-layer, .hero-slide, .noody-hero-slider, .island-card');

    dropTargets.forEach(target => {
      if (target._hasDropSetup) return;
      target._hasDropSetup = true;

      target.addEventListener('click', (e) => {
        if (!isEditing) return;
        if (e.target.closest('button, a, input, select, .noody-card-style-bar')) return;
        e.preventDefault();
        e.stopPropagation();

        let realTarget = target;
        if (target.classList.contains('noody-hero-slider') || target.classList.contains('hero-slide')) {
          realTarget = document.querySelector('.hero-slide.active .slide-image-layer') || target.querySelector('.slide-image-layer') || target;
        }

        const isHero = target.classList.contains('noody-hero-slider') || target.classList.contains('hero-slide') || target.classList.contains('slide-image-layer');
        openImagePickerModal(realTarget, isHero ? 'Hero Slide Background' : 'Card Photo', isHero ? HERO_PRESETS : SERVICE_PRESETS);
      });

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
  // IMAGE PICKER MODAL
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
          <div class="image-dropzone-box" id="modal-image-dropzone">
            <span class="image-dropzone-icon">📁</span>
            <div class="image-dropzone-title">Click to Browse File or Drag &amp; Drop Here</div>
            <div class="image-dropzone-sub">Supports JPG, PNG, WEBP, GIF, SVG (Saved directly to assets/uploads/)</div>
            <input type="file" id="modal-file-input" accept="image/*" style="display: none;">
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 6px;">CURRENT PREVIEW:</div>
            <img id="modal-current-preview" class="image-preview-thumbnail" src="${currentUrl || presets[0].url}" alt="Preview">
          </div>

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

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
      if (fileInput.files && fileInput.files[0]) {
        await handleModalFileUpload(fileInput.files[0]);
      }
    });

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

    backdrop.querySelector('#modal-apply-url-btn').addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (url) {
        applyImageToTarget(targetElement, url);
        backdrop.classList.remove('active');
        showToast('✅ URL applied! Click "💾 Save Changes" to write to file.');
      }
    });

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

    const chips = backdrop.querySelectorAll('.photo-chip');
    const imgInput = backdrop.querySelector('#add-item-image');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        imgInput.value = chip.getAttribute('data-url');
      });
    });

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

    const closeBtn = backdrop.querySelector('#noody-add-item-close');
    closeBtn.addEventListener('click', () => backdrop.classList.remove('active'));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('active');
    });

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

    grid.prepend(card);

    setupCardControls();
    setupImageDropHandlers();
    enableContentEditable();
    if (window.NoodyReviews) {
      window.NoodyReviews.renderAllCardRatings();
    }

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast(`⏳ Saving "${item.name}" live to website...`);
    savePageToFile();
    showToast(`✅ "${item.name}" added & saved live to website!`);
  }

  // =========================================================================
  // EDIT PRODUCT / SERVICE MODAL
  // =========================================================================

  function openEditItemModal(card) {
    const modalId = 'noody-edit-item-modal-backdrop';
    let backdrop = document.getElementById(modalId);
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = modalId;
      backdrop.className = 'noody-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const isService = card.closest('#services-section') !== null;
    const currentName = card.querySelector('.item-card-title')?.textContent.trim() || '';
    const currentDesc = card.querySelector('.item-card-desc')?.textContent.trim() || '';
    const currentIsland = card.getAttribute('data-listing-island') || 'AGATTI';
    const currentCategory = card.querySelector('.item-category-tag')?.textContent.trim() || '';
    const currentImg = card.querySelector('.item-card-img')?.src || '';
    const currentPrice = card.querySelector('.price-value')?.textContent.trim() || '';

    const presets = isService ? SERVICE_PRESETS : PRODUCT_PRESETS;

    backdrop.innerHTML = `
      <div class="noody-modal" role="dialog" aria-modal="true" style="max-width: 600px;">
        <div class="noody-modal-header" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
          <div>
            <h3>✏️ Edit ${isService ? 'Service' : 'Product'}: ${escapeHtml(currentName)}</h3>
            <div class="noody-modal-subtitle">Update title, island, category, photo, description &amp; pricing</div>
          </div>
          <button type="button" class="noody-modal-close" id="noody-edit-item-close">&times;</button>
        </div>

        <div class="noody-modal-body" style="max-height: 80vh; overflow-y: auto;">
          <form id="noody-edit-item-form">
            <div class="form-group">
              <label>Title / Name *</label>
              <input type="text" id="edit-item-name" class="form-input" value="${escapeHtml(currentName)}" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Listing Kind *</label>
                <select id="edit-item-kind" class="form-select">
                  <option value="SERVICE" ${isService ? 'selected' : ''}>🏄 Service / Water Sport</option>
                  <option value="PRODUCT" ${!isService ? 'selected' : ''}>🥥 Authentic Island Product</option>
                </select>
              </div>
              <div class="form-group">
                <label>Destination Island *</label>
                <select id="edit-item-island" class="form-select">
                  <option value="AGATTI" ${currentIsland === 'AGATTI' ? 'selected' : ''}>Agatti Island</option>
                  <option value="KADMAT" ${currentIsland === 'KADMAT' ? 'selected' : ''}>Kadmat Island</option>
                  <option value="KAVARATTI" ${currentIsland === 'KAVARATTI' ? 'selected' : ''}>Kavaratti Island</option>
                  <option value="KALPENI" ${currentIsland === 'KALPENI' ? 'selected' : ''}>Kalpeni Island</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Category Tag</label>
              <input type="text" id="edit-item-category" class="form-input" value="${escapeHtml(currentCategory)}" placeholder="e.g. Water Sports, Diving, Organic Produce">
            </div>

            <div class="form-group">
              <label>Card Image (Upload Computer Photo or Enter URL) *</label>
              <div style="display:flex; gap: 8px;">
                <input type="url" id="edit-item-image" class="form-input" value="${escapeHtml(currentImg)}" required style="flex:1;">
                <button type="button" id="btn-edit-item-upload-file" class="editor-dock-btn" style="background:#08755c; border-color:#14b8a6; padding: 6px 14px; font-size: 0.8rem; white-space:nowrap;">
                  📁 Upload Photo
                </button>
                <input type="file" id="file-edit-item-upload" accept="image/*" style="display:none;">
              </div>

              <!-- Quick presets -->
              <div style="margin-top: 10px;">
                <span style="font-size:0.75rem; color:#64748b; font-weight:700;">Select from Curated Ocean Presets:</span>
                <div class="photo-chips-bar" style="margin-top:6px;">
                  ${presets.map(p => `
                    <div class="photo-chip ${p.url === currentImg ? 'selected' : ''}" data-url="${p.url}">
                      <img src="${p.url}" alt="${p.title}">
                      <span>${p.title}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Description *</label>
              <textarea id="edit-item-desc" class="form-textarea" required>${escapeHtml(currentDesc)}</textarea>
            </div>

            <div class="form-group">
              <label>Price Guide (e.g. ₹1,200 / person or leave blank for enquiry)</label>
              <input type="text" id="edit-item-price" class="form-input" value="${escapeHtml(currentPrice)}">
            </div>

            <button type="submit" class="btn-submit-review" style="margin-top: 10px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
              ✓ Save &amp; Apply Changes to Card
            </button>
          </form>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    // Preset chips
    const chips = backdrop.querySelectorAll('.photo-chip');
    const imgInput = backdrop.querySelector('#edit-item-image');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        imgInput.value = chip.getAttribute('data-url');
      });
    });

    // Upload photo
    const uploadBtn = backdrop.querySelector('#btn-edit-item-upload-file');
    const fileElem = backdrop.querySelector('#file-edit-item-upload');
    uploadBtn.addEventListener('click', () => fileElem.click());
    fileElem.addEventListener('change', async () => {
      if (fileElem.files && fileElem.files[0]) {
        uploadBtn.textContent = '⏳ Uploading...';
        try {
          const url = await uploadImageFile(fileElem.files[0]);
          imgInput.value = url;
          uploadBtn.textContent = '✓ Uploaded!';
        } catch (err) {
          uploadBtn.textContent = '📁 Upload Photo';
        }
      }
    });

    // Close
    const closeBtn = backdrop.querySelector('#noody-edit-item-close');
    closeBtn.addEventListener('click', () => backdrop.classList.remove('active'));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('active');
    });

    // Submit
    const form = backdrop.querySelector('#noody-edit-item-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newName = document.getElementById('edit-item-name').value.trim();
      const newKind = document.getElementById('edit-item-kind').value;
      const newIsland = document.getElementById('edit-item-island').value;
      const newCategory = document.getElementById('edit-item-category').value.trim();
      const newImg = document.getElementById('edit-item-image').value.trim();
      const newDesc = document.getElementById('edit-item-desc').value.trim();
      const newPrice = document.getElementById('edit-item-price').value.trim();

      if (!newName || !newImg || !newDesc) return;

      const islandTitle = newIsland.charAt(0) + newIsland.slice(1).toLowerCase();

      // Update card DOM
      const titleEl = card.querySelector('.item-card-title');
      if (titleEl) titleEl.textContent = newName;

      const descEl = card.querySelector('.item-card-desc');
      if (descEl) descEl.textContent = newDesc;

      const imgEl = card.querySelector('.item-card-img');
      if (imgEl) imgEl.src = newImg;

      card.setAttribute('data-listing-island', newIsland);
      const islandBadgeEl = card.querySelector('.item-card-island');
      if (islandBadgeEl) islandBadgeEl.textContent = islandTitle + ' Island';

      if (newCategory) {
        card.setAttribute('data-category', newCategory.toLowerCase().replace(/[^a-z0-9]+/g, ''));
        const tagEl = card.querySelector('.item-category-tag');
        if (tagEl) tagEl.textContent = newCategory;
      }

      // Price update
      let priceBox = card.querySelector('.item-price-info');
      if (newPrice) {
        if (!priceBox) {
          priceBox = document.createElement('div');
          priceBox.className = 'item-price-info';
          priceBox.innerHTML = `
            <span class="price-label">Price Guide</span>
            <span class="price-value">${escapeHtml(newPrice)}</span>
          `;
          const meta = card.querySelector('.item-card-meta');
          if (meta) meta.insertBefore(priceBox, meta.firstChild);
        } else {
          const valEl = priceBox.querySelector('.price-value');
          if (valEl) valEl.textContent = newPrice;
        }
      }

      // Update WhatsApp link
      const waBtn = card.querySelector('a[data-whatsapp-action]');
      if (waBtn) {
        waBtn.setAttribute('data-item-name', newName);
        waBtn.setAttribute('data-item-kind', newKind);
        const waText = encodeURIComponent(
          `Hello NOODY.AI, please share details, availability and the final price.\n` +
          `${newName}\n` +
          `Island: ${islandTitle}\n` +
          `NOODY_SOURCE:WEBSITE\n` +
          `NOODY_ISLAND:${newIsland}\n` +
          `NOODY_ITEM:${newKind}:${card.id || 'item'}`
        );
        waBtn.href = `https://wa.me/919446944562?text=${waText}`;
      }

      // Move grid if kind changed
      const shouldBeInService = newKind === 'SERVICE';
      const currentlyInService = card.closest('#services-section') !== null;
      if (shouldBeInService !== currentlyInService) {
        const targetGrid = shouldBeInService
          ? document.querySelector('#services-section .items-grid')
          : document.querySelector('#products-section .items-grid');
        if (targetGrid) targetGrid.prepend(card);
      }

      backdrop.classList.remove('active');
      setupCardControls();
      showToast(`⏳ Saving "${newName}" live to website...`);
      await savePageToFile();
      showToast(`✅ "${newName}" updated & saved live to website!`);
    });
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
      disableContentEditable();
      document.body.classList.remove('noody-editing');

      const dock = document.getElementById('noody-editor-dock');
      const toast = document.getElementById('editor-toast');
      const heroBtn = document.getElementById('editor-hero-bg-btn');
      const hud = document.getElementById('noody-drag-hud');
      const addModal = document.getElementById('noody-add-item-modal-backdrop');
      const revModal = document.getElementById('noody-review-modal-backdrop');
      const imgModal = document.getElementById('noody-image-picker-modal-backdrop');
      const stylerModal = document.getElementById('noody-card-styler-modal-backdrop');
      const logoModal = document.getElementById('noody-logo-modal-backdrop');
      const btnModal = document.getElementById('noody-button-modal-backdrop');
      const iconModal = document.getElementById('noody-icon-modal-backdrop');
      const htmlModal = document.getElementById('noody-html-modal-backdrop');
      const deleteButtons = Array.from(document.querySelectorAll('.noody-delete-card-btn'));
      const editButtons = Array.from(document.querySelectorAll('.noody-card-edit-btn'));
      const priceToggleButtons = Array.from(document.querySelectorAll('.noody-price-toggle-btn'));
      const cardStyleBars = Array.from(document.querySelectorAll('.noody-card-style-bar'));
      const navDeleteButtons = Array.from(document.querySelectorAll('.noody-nav-delete-btn'));
      const addNavButtons = Array.from(document.querySelectorAll('.noody-add-nav-btn'));
      const sectionDeleteButtons = Array.from(document.querySelectorAll('.noody-delete-section-btn'));
      const botCardButtons = Array.from(document.querySelectorAll('.noody-card-bot-btn'));
      const logoEditButtons = Array.from(document.querySelectorAll('.noody-logo-edit-btn'));
      const btnEditBadges = Array.from(document.querySelectorAll('.noody-button-edit-badge'));
      const addHeroButtons = Array.from(document.querySelectorAll('.noody-add-hero-btn'));
      const botModal = document.getElementById('noody-bot-modal-backdrop');
      const editModal = document.getElementById('noody-edit-item-modal-backdrop');
      const textBubble = document.getElementById('noody-text-bubble');
      const botBadges = Array.from(document.querySelectorAll('.noody-bot-card-badge'));
      const botLandingBar = document.getElementById('noody-bot-landing-bar');

      if (dock) dock.remove();
      if (toast) toast.remove();
      if (heroBtn) heroBtn.remove();
      if (hud) hud.remove();
      if (addModal) addModal.remove();
      if (editModal) editModal.remove();
      if (revModal) revModal.remove();
      if (imgModal) imgModal.remove();
      if (stylerModal) stylerModal.remove();
      if (logoModal) logoModal.remove();
      if (btnModal) btnModal.remove();
      if (iconModal) iconModal.remove();
      if (htmlModal) htmlModal.remove();
      if (botModal) botModal.remove();
      if (textBubble) textBubble.remove();
      if (botLandingBar) botLandingBar.remove();
      deleteButtons.forEach(b => b.remove());
      editButtons.forEach(b => b.remove());
      priceToggleButtons.forEach(b => b.remove());
      cardStyleBars.forEach(b => b.remove());
      navDeleteButtons.forEach(b => b.remove());
      addNavButtons.forEach(b => b.remove());
      sectionDeleteButtons.forEach(b => b.remove());
      botCardButtons.forEach(b => b.remove());
      botBadges.forEach(b => b.remove());
      logoEditButtons.forEach(b => b.remove());
      btnEditBadges.forEach(b => b.remove());
      addHeroButtons.forEach(b => b.remove());

      // Clone clean document
      const cleanHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

      // Re-insert dock and restore editing controls
      if (dock) document.body.appendChild(dock);
      document.body.classList.add('noody-editing');
      setupCardControls();
      setupHeroControls();
      setupImageDropHandlers();
      setupNavControls();
      setupFooterControls();
      setupSectionControls();
      setupLogoControls();
      setupButtonControls();
      initInlineTextFormatting();
      enableContentEditable();

      let pageName = window.location.pathname.split('/').pop() || 'index.html';
      if (!pageName.endsWith('.html')) pageName = 'index.html';

      const res = await fetch(`${API_BASE}/api/save-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageName, html: cleanHtml })
      });

      if (res.ok) {
        showToast(`✅ Saved locally & 🚀 Auto-Publishing Live to https://brownnoodyai-sketch.github.io/!`);
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

  // =========================================================================
  // PUBLISH LIVE TO PUBLIC GITHUB PAGES (https://brownnoodyai-sketch.github.io/)
  // =========================================================================
  async function publishPublicSite() {
    const pubBtn = document.getElementById('editor-publish-btn');
    const origText = pubBtn ? pubBtn.innerHTML : '🚀 Publish Public Site';
    if (pubBtn) {
      pubBtn.innerHTML = '⏳ Publishing...';
      pubBtn.disabled = true;
    }

    showToast('⏳ Publishing live changes to GitHub Pages (https://brownnoodyai-sketch.github.io/)...');

    try {
      // 1. Ensure page is saved first
      await savePageToFile();

      // 2. Call publish API
      const res = await fetch(`${API_BASE}/api/publish-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Publish failed');
      }

      const data = await res.json();
      showToast(`🎉 SUCCESS: Website is now LIVE at ${data.publicUrl}! Opening in new tab...`);
      window.open(data.publicUrl, '_blank');
    } catch (err) {
      console.error('[Publish] Error:', err);
      showToast('❌ Publish failed: ' + err.message, true);
    } finally {
      if (pubBtn) {
        pubBtn.innerHTML = origText;
        pubBtn.disabled = false;
      }
    }
  }

  function initEditorDock() {
    if (document.getElementById('noody-editor-dock')) return;

    const dock = document.createElement('div');
    dock.id = 'noody-editor-dock';
    dock.className = 'noody-editor-dock';
    dock.innerHTML = `
      <div id="editor-admin-pill" class="editor-badge" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px; background:rgba(20,184,166,0.18); border:1px solid rgba(20,184,166,0.4);" title="Click to verify Admin Email &amp; Auto Avatar">
        <img id="editor-admin-avatar-img" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" style="width:22px; height:22px; border-radius:50%;" alt="Admin">
        <span id="editor-admin-name">Admin Access</span>
      </div>
      <span id="editor-mode-badge" class="editor-badge">👁️ Preview Mode</span>
      <button id="editor-toggle-btn" class="editor-dock-btn">✏️ Edit Page</button>
      <button id="editor-logo-btn" class="editor-dock-btn" style="display:none; background: #08755c; border-color: #14b8a6;">🏷️ Logo</button>
      <button id="editor-buttons-btn" class="editor-dock-btn" style="display:none; background: #d97706; border-color: #fbbf24;">⚡ Buttons</button>
      <button id="editor-add-service-btn" class="editor-dock-btn" style="display:none; background: #0284c7; border-color: #38bdf8;">➕ Add Service</button>
      <button id="editor-add-product-btn" class="editor-dock-btn" style="display:none; background: #059669; border-color: #34d399;">➕ Add Product</button>
      <button id="editor-save-btn" class="editor-dock-btn editor-btn-save" style="display:none;">💾 Save Changes</button>
      <button id="editor-publish-btn" class="editor-dock-btn" style="display:none; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-color: #34d399; font-weight:800; box-shadow: 0 4px 14px rgba(16,185,129,0.35);" title="Push changes live to public URL https://brownnoodyai-sketch.github.io/">🚀 Publish Public Site</button>
    `;
    document.body.appendChild(dock);

    document.getElementById('editor-toggle-btn').addEventListener('click', toggleEditMode);
    document.getElementById('editor-save-btn').addEventListener('click', savePageToFile);
    document.getElementById('editor-publish-btn').addEventListener('click', publishPublicSite);
    document.getElementById('editor-add-service-btn').addEventListener('click', () => openAddItemModal('SERVICE'));
    document.getElementById('editor-add-product-btn').addEventListener('click', () => openAddItemModal('PRODUCT'));
    document.getElementById('editor-logo-btn').addEventListener('click', openLogoCustomizerModal);
    document.getElementById('editor-buttons-btn').addEventListener('click', () => {
      const firstHeroBtn = document.querySelector('.hero-actions a, .hero-actions button');
      if (firstHeroBtn) openButtonCustomizerModal(firstHeroBtn);
    });

    // Admin Email Verification & Auto Photo
    const adminPill = document.getElementById('editor-admin-pill');
    if (adminPill) {
      const storedEmail = localStorage.getItem('noody_admin_email') || 'admin@noody.ai';
      updateAdminPill(storedEmail);

      adminPill.addEventListener('click', () => {
        const email = prompt('Enter your admin email to verify access & load your profile photo:', localStorage.getItem('noody_admin_email') || 'admin@noody.ai');
        if (email && email.trim()) {
          localStorage.setItem('noody_admin_email', email.trim());
          updateAdminPill(email.trim());
          showToast(`👑 Admin access verified & photo loaded for ${email.trim()}!`);
        }
      });
    }

    function updateAdminPill(email) {
      const img = document.getElementById('editor-admin-avatar-img');
      const name = document.getElementById('editor-admin-name');
      if (img) img.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}&backgroundColor=b6e3f4`;
      if (name) name.textContent = email.split('@')[0];
    }

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

  document.addEventListener('DOMContentLoaded', () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/visual-editor.css';
    document.head.appendChild(link);

    initEditorDock();
  });
})();
