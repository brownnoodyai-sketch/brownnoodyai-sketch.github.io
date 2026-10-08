/**
 * NOODY.AI — Inline Visual Editor
 * Click-to-edit inline content and save directly to physical HTML files
 */

(function () {
  'use strict';

  let isEditing = false;
  const EDITABLE_SELECTORS = [
    'h1', 'h2', 'h3', 'h4', 'p',
    '.hero-eyebrow', '.hero-title', '.hero-description',
    '.section-eyebrow', '.section-title', '.section-sub',
    '.island-name', '.island-desc',
    '.item-card-title', '.item-card-desc', '.price-value',
    '.review-author', '.review-text',
    '.footer-tagline'
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
    }, 3500);
  }

  function toggleEditMode() {
    isEditing = !isEditing;
    document.body.classList.toggle('noody-editing', isEditing);

    const badge = document.getElementById('editor-mode-badge');
    const toggleBtn = document.getElementById('editor-toggle-btn');
    const saveBtn = document.getElementById('editor-save-btn');

    if (isEditing) {
      badge.textContent = '✏️ Editing ON';
      badge.className = 'editor-badge mode-editing';
      toggleBtn.innerHTML = '👁️ Preview Mode';
      saveBtn.style.display = 'inline-flex';
      enableContentEditable();
      showToast('✏️ Edit Mode Active: Click any text or image to change it!');
    } else {
      badge.textContent = '👁️ Preview Mode';
      badge.className = 'editor-badge';
      toggleBtn.innerHTML = '✏️ Edit Page';
      saveBtn.style.display = 'none';
      disableContentEditable();
      showToast('👁️ Preview Mode Active');
    }
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
            showToast('📷 Image updated! Click "Save to File" to apply.');
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

  async function savePageToFile() {
    const saveBtn = document.getElementById('editor-save-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '⏳ Saving...';
    saveBtn.disabled = true;

    try {
      // 1. Temporarily disable editing state and remove editor dock before cloning
      disableContentEditable();
      document.body.classList.remove('noody-editing');

      const dock = document.getElementById('noody-editor-dock');
      const toast = document.getElementById('editor-toast');
      if (dock) dock.remove();
      if (toast) toast.remove();

      // 2. Clone clean document
      const cleanHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

      // 3. Re-insert dock and restore editing mode for user
      document.body.appendChild(dock);
      document.body.classList.add('noody-editing');
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
      <button id="editor-save-btn" class="editor-dock-btn editor-btn-save" style="display:none;">💾 Save Changes</button>
    `;
    document.body.appendChild(dock);

    document.getElementById('editor-toggle-btn').addEventListener('click', toggleEditMode);
    document.getElementById('editor-save-btn').addEventListener('click', savePageToFile);

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
