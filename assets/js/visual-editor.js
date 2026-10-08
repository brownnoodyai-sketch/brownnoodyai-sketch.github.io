/**
 * NOODY.AI — Inline Visual Editor
 * Click-to-edit inline content, add new services & products, delete cards, remove prices,
 * upload/drag-and-drop photos, live image drag repositioning, semi-blur, text focus colors & shape add options
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
      showToast('✏️ Edit Mode Active: Drag photo position, toggle blur, shape box, or text colors on cards!');
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

  // =========================================================================
  // CARD STYLING & POSITIONING CONTROLS
  // =========================================================================

  function setupCardControls() {
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

    // 3. Setup Floating Style Toolbars on Island Cards and Item Cards
    document.querySelectorAll('.island-card, .item-card').forEach(card => {
      if (!card.querySelector('.noody-card-style-bar')) {
        const bar = document.createElement('div');
        bar.className = 'noody-card-style-bar';
        bar.innerHTML = `
          <button type="button" class="style-bar-btn btn-drag-pos" title="Click and drag with mouse to adjust photo position">✥ Drag Photo</button>
          <button type="button" class="style-bar-btn btn-blur-toggle" title="Toggle semi-blur intensity">🌫️ Blur</button>
          <button type="button" class="style-bar-btn btn-shape-toggle" title="Add frosted glass shape around text">🏷️ Shape</button>
          <button type="button" class="style-bar-btn btn-color-toggle" title="Change text color & focus">🎨 Color</button>
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
      const deleteButtons = Array.from(document.querySelectorAll('.noody-delete-card-btn'));
      const priceToggleButtons = Array.from(document.querySelectorAll('.noody-price-toggle-btn'));
      const cardStyleBars = Array.from(document.querySelectorAll('.noody-card-style-bar'));

      if (dock) dock.remove();
      if (toast) toast.remove();
      if (heroBtn) heroBtn.remove();
      if (hud) hud.remove();
      if (addModal) addModal.remove();
      if (revModal) revModal.remove();
      if (imgModal) imgModal.remove();
      if (stylerModal) stylerModal.remove();
      deleteButtons.forEach(b => b.remove());
      priceToggleButtons.forEach(b => b.remove());
      cardStyleBars.forEach(b => b.remove());

      // Clone clean document
      const cleanHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

      // Re-insert dock and restore editing controls
      if (dock) document.body.appendChild(dock);
      document.body.classList.add('noody-editing');
      setupCardControls();
      setupHeroControls();
      setupImageDropHandlers();
      enableContentEditable();

      let pageName = window.location.pathname.split('/').pop() || 'index.html';
      if (!pageName.endsWith('.html')) pageName = 'index.html';

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
