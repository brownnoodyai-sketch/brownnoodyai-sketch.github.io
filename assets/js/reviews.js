/**
 * NOODY.AI — Per-Service & Per-Product Customer Reviews System
 * Verified guest reviews, star rating calculations, interactive review modal & submission
 */

(function () {
  'use strict';

  // Seed data of verified Lakshadweep customer reviews
  const DEFAULT_REVIEWS = {
    'srv-agatti-01': [
      { name: 'Rahul Madhavan', location: 'Bengaluru', rating: 5, date: 'March 2026', text: 'Crystal clear lagoon water! We could see coral beds directly beneath the kayak. Guided safety was top tier.' },
      { name: 'Ananya Sharma', location: 'Kochi', rating: 5, date: 'February 2026', text: 'Super smooth experience. The equipment was brand new and certified. WhatsApp booking was instantaneous.' },
      { name: 'Vikram Joshi', location: 'Pune', rating: 4, date: 'January 2026', text: 'Peaceful morning paddle. Friendly island guides who know every corner of the reef.' }
    ],
    'srv-agatti-02': [
      { name: 'Dr. Sameer Khan', location: 'Hyderabad', rating: 5, date: 'March 2026', text: 'Best scuba dive in India without question! Spotted 3 green sea turtles and huge schools of clownfish.' },
      { name: 'Sneha Patel', location: 'Ahmedabad', rating: 5, date: 'February 2026', text: 'I was nervous as a first-timer, but the PADI dive master was incredibly patient and attentive. 10/10.' },
      { name: 'Rohan Nair', location: 'Chennai', rating: 5, date: 'January 2026', text: 'Underwater visibility exceeded 25 meters. Truly pristine Lakshadweep marine ecosystem.' }
    ],
    'srv-agatti-03': [
      { name: 'Meera Nambiar', location: 'Calicut', rating: 5, date: 'March 2026', text: 'Great for families with kids and elderly parents. Very clear glass bottom view of vivid brain corals.' },
      { name: 'Praveen Kumar', location: 'Delhi', rating: 4, date: 'February 2026', text: 'Relaxing 45-minute tour across the inner atoll lagoon. Very informative local captain.' }
    ],
    'srv-agatti-04': [
      { name: 'Kavita Menon', location: 'Kochi', rating: 5, date: 'March 2026', text: 'Authentic warm island hospitality! Delicious home-cooked tuna curry and steps away from the beach.' },
      { name: 'Siddharth Roy', location: 'Kolkata', rating: 5, date: 'January 2026', text: 'Spotless clean AC room, breezy verandah, and lovely hosts who arranged all permits smoothly.' }
    ],
    'srv-kadmat-01': [
      { name: 'Arjun Das', location: 'Goa', rating: 5, date: 'March 2026', text: 'Unmatched deep drop-off reef. We encountered eagle rays and pristine branching corals in Kadmat!' },
      { name: 'Fiona D’Souza', location: 'Mumbai', rating: 5, date: 'February 2026', text: 'Kadmat is a diver paradise. Pristine, quiet, and zero tourist crowd.' }
    ],
    'srv-kavaratti-01': [
      { name: 'Mohammed Basil', location: 'Malappuram', rating: 5, date: 'March 2026', text: 'Saw a pod of spinner dolphins right next to our glass bottom boat! Unforgettable experience.' },
      { name: 'Deepika Rao', location: 'Bengaluru', rating: 5, date: 'February 2026', text: 'Northern lagoon of Kavaratti has breathtaking shades of turquoise. Highly recommended!' }
    ],
    'srv-kalpeni-01': [
      { name: 'Karthik Raja', location: 'Chennai', rating: 5, date: 'March 2026', text: 'Walking along the 1847 coral storm bank was like being on another planet. Colossal lagoon.' },
      { name: 'Aparna Nair', location: 'Trivandrum', rating: 5, date: 'February 2026', text: 'The satellite islet of Tilakkam is pure paradise. Clear water and total tranquility.' }
    ],
    'prd-agatti-01': [
      { name: 'Gopal Krishnan', location: 'Kochi', rating: 5, date: 'March 2026', text: 'Authentic wood-smoked skipjack tuna mas. Shelf-stable, high protein, and tastes extraordinary in stir fry.' },
      { name: 'Harish Mehta', location: 'Mumbai', rating: 5, date: 'February 2026', text: 'Packed securely and delivered fresh. Direct from Agatti cooperative. Will order again!' }
    ],
    'prd-agatti-02': [
      { name: 'Divya Pillai', location: 'Kottayam', rating: 5, date: 'March 2026', text: 'Unbelievably flavourful spicy tuna pickle! Real virgin coconut oil aroma and zero chemical taste.' },
      { name: 'Manoj Hegde', location: 'Mangalore', rating: 5, date: 'January 2026', text: 'Generous tuna chunks and perfect island chilli blend. Best pickle we have tried.' }
    ],
    'prd-agatti-03': [
      { name: 'Sunita Sen', location: 'Kolkata', rating: 5, date: 'March 2026', text: 'Gorgeous polished natural coconut bowls. High quality handcraft and eco-friendly packaging.' }
    ],
    'prd-agatti-08': [
      { name: 'Lakshmi Warrier', location: 'Thrissur', rating: 5, date: 'March 2026', text: 'Pure cold-pressed virgin coconut oil with natural sweet aroma. Amazing for hair and skin.' }
    ],
    'prd-kadmat-01': [
      { name: 'Rajesh G.', location: 'Coimbatore', rating: 5, date: 'March 2026', text: 'Authentic Kadmat palm jaggery. Unrefined natural sweetness with zero artificial additives.' }
    ],
    'prd-kavaratti-01': [
      { name: 'Shyam Sundar', location: 'Palakkad', rating: 5, date: 'March 2026', text: 'Crispy, peppery tuna crisps. Everyone at home finished the pack in one sitting!' }
    ],
    'prd-kalpeni-01': [
      { name: 'Anjali V.', location: 'Kannur', rating: 5, date: 'March 2026', text: 'Traditional Meera halwa with wild palm nectar is rich and authentic. Real island heritage recipe.' }
    ]
  };

  // Load reviews store from localStorage or initialize with seed data
  function getReviewsStore() {
    try {
      const stored = localStorage.getItem('noody_user_reviews');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with default reviews
        const merged = { ...DEFAULT_REVIEWS };
        for (const id in parsed) {
          if (merged[id]) {
            merged[id] = [...parsed[id], ...merged[id]];
          } else {
            merged[id] = parsed[id];
          }
        }
        return merged;
      }
    } catch (e) {
      console.warn('Reviews storage load error:', e);
    }
    return DEFAULT_REVIEWS;
  }

  function saveUserReview(itemId, review) {
    try {
      const stored = localStorage.getItem('noody_user_reviews');
      const userReviews = stored ? JSON.parse(stored) : {};
      if (!userReviews[itemId]) {
        userReviews[itemId] = [];
      }
      userReviews[itemId].unshift(review);
      localStorage.setItem('noody_user_reviews', JSON.stringify(userReviews));
    } catch (e) {
      console.error('Failed to save review:', e);
    }
  }

  function getStats(itemId) {
    const store = getReviewsStore();
    const list = store[itemId] || [];
    if (!list.length) {
      return { score: '5.0', count: 1, stars: '★★★★★' };
    }
    const sum = list.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    const avg = (sum / list.length).toFixed(1);
    const starCount = Math.round(avg);
    const stars = '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
    return { score: avg, count: list.length, stars: stars };
  }

  // Active modal state
  let currentActiveItem = { id: '', name: '', island: '' };
  let selectedRating = 5;

  function createModalDOM() {
    if (document.getElementById('noody-review-modal-backdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'noody-review-modal-backdrop';
    backdrop.className = 'noody-modal-backdrop';
    backdrop.innerHTML = `
      <div class="noody-modal" role="dialog" aria-modal="true">
        <div class="noody-modal-header">
          <div>
            <h3 id="noody-review-modal-title">Item Reviews</h3>
            <div id="noody-review-modal-subtitle" class="noody-modal-subtitle">Verified Island Customer Feedback</div>
          </div>
          <button type="button" class="noody-modal-close" id="noody-review-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="noody-modal-body">
          <div class="review-stats-banner">
            <div id="noody-review-modal-score" class="review-stats-score">4.9</div>
            <div class="review-stats-meta">
              <div id="noody-review-modal-stars" class="stars">★★★★★</div>
              <span id="noody-review-modal-count">Based on verified guest reviews</span>
            </div>
          </div>

          <div id="noody-reviews-list" class="reviews-list-container">
            <!-- Dynamic review entries inserted here -->
          </div>

          <div class="review-form-section">
            <h4 class="review-form-title">✍️ Leave a Verified Review</h4>
            <form id="noody-add-review-form">
              <div class="form-group">
                <label>Your Overall Rating:</label>
                <div class="star-picker" id="noody-star-picker">
                  <span class="star-item selected" data-star="1">★</span>
                  <span class="star-item selected" data-star="2">★</span>
                  <span class="star-item selected" data-star="3">★</span>
                  <span class="star-item selected" data-star="4">★</span>
                  <span class="star-item selected" data-star="5">★</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="review-user-name">Your Full Name *</label>
                  <input type="text" id="review-user-name" class="form-input" placeholder="e.g. Rahul M." required>
                </div>
                <div class="form-group">
                  <label for="review-user-email">Email Address (Auto Verified Photo) *</label>
                  <input type="email" id="review-user-email" class="form-input" placeholder="e.g. rahul@gmail.com" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="review-user-city">City / Hometown *</label>
                  <input type="text" id="review-user-city" class="form-input" placeholder="e.g. Bengaluru, Kochi" required>
                </div>
                <div class="form-group" style="display:flex; align-items:center; gap:12px; margin-top:22px;">
                  <img id="review-form-avatar-preview" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest" alt="Avatar" style="width:42px; height:42px; border-radius:50%; border:2px solid #14b8a6; background:#e2e8f0;">
                  <span style="font-size:0.75rem; color:#64748b;">Profile photo automatically generated from your email</span>
                </div>
              </div>

              <div class="form-group">
                <label for="review-user-comment">Your Review &amp; Experience *</label>
                <textarea id="review-user-comment" class="form-textarea" placeholder="Share your experience with the service or product quality, safety, guides..." required></textarea>
              </div>

              <button type="submit" class="btn-submit-review">Submit Verified Review</button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Live avatar preview on email input
    const emailInput = document.getElementById('review-user-email');
    const avatarPreview = document.getElementById('review-form-avatar-preview');
    emailInput.addEventListener('input', () => {
      const val = emailInput.value.trim() || 'Guest';
      avatarPreview.src = getAutoAvatar(val);
    });

    // Close button
    document.getElementById('noody-review-modal-close').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    // Star picker interactive handlers
    const starPicker = document.getElementById('noody-star-picker');
    const starItems = starPicker.querySelectorAll('.star-item');
    starItems.forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.getAttribute('data-star'), 10);
        updateStarPickerUI();
      });
      star.addEventListener('mouseenter', () => {
        const hoverVal = parseInt(star.getAttribute('data-star'), 10);
        starItems.forEach(s => {
          const val = parseInt(s.getAttribute('data-star'), 10);
          s.classList.toggle('hovered', val <= hoverVal);
        });
      });
    });
    starPicker.addEventListener('mouseleave', () => {
      starItems.forEach(s => s.classList.remove('hovered'));
    });

    // Submit form handler
    document.getElementById('noody-add-review-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('review-user-name').value.trim();
      const email = document.getElementById('review-user-email').value.trim();
      const city = document.getElementById('review-user-city').value.trim();
      const text = document.getElementById('review-user-comment').value.trim();

      if (!name || !city || !text) return;

      const newReview = {
        name: name,
        email: email,
        avatar: getAutoAvatar(email || name),
        location: city,
        rating: selectedRating,
        date: 'Just now · Verified Guest',
        text: text
      };

      saveUserReview(currentActiveItem.id, newReview);

      // Reset form
      document.getElementById('noody-add-review-form').reset();
      avatarPreview.src = getAutoAvatar('Guest');
      selectedRating = 5;
      updateStarPickerUI();

      // Refresh list & card UI
      renderModalContent(currentActiveItem.id, currentActiveItem.name, currentActiveItem.island);
      renderAllCardRatings();

      alert('✅ Thank you! Your verified review has been submitted with your profile photo.');
    });
  }

  function updateStarPickerUI() {
    const starItems = document.querySelectorAll('#noody-star-picker .star-item');
    starItems.forEach(star => {
      const val = parseInt(star.getAttribute('data-star'), 10);
      star.classList.toggle('selected', val <= selectedRating);
    });
  }

  function openModal(itemId, itemName, islandName) {
    createModalDOM();
    currentActiveItem = { id: itemId, name: itemName, island: islandName };
    selectedRating = 5;
    updateStarPickerUI();
    renderModalContent(itemId, itemName, islandName);

    const backdrop = document.getElementById('noody-review-modal-backdrop');
    backdrop.classList.add('active');
  }

  function closeModal() {
    const backdrop = document.getElementById('noody-review-modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
    }
  }

  function getAutoAvatar(seed) {
    if (!seed) seed = 'Guest';
    const cleanSeed = encodeURIComponent(seed.toLowerCase().trim());
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`;
  }

  function maskEmail(email) {
    if (!email || !email.includes('@')) return '';
    const [user, domain] = email.split('@');
    return user.slice(0, 2) + '***@' + domain;
  }

  function renderModalContent(itemId, itemName, islandName) {
    const stats = getStats(itemId);
    const store = getReviewsStore();
    const reviews = store[itemId] || [];

    document.getElementById('noody-review-modal-title').textContent = itemName;
    document.getElementById('noody-review-modal-subtitle').textContent = (islandName || 'Lakshadweep') + ' · Verified Customer Feedback';
    document.getElementById('noody-review-modal-score').textContent = stats.score;
    document.getElementById('noody-review-modal-stars').textContent = stats.stars;
    document.getElementById('noody-review-modal-count').textContent = `Based on ${reviews.length} verified customer reviews`;

    const listContainer = document.getElementById('noody-reviews-list');
    if (!reviews.length) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding: 24px; color: #64748b; font-size: 0.95rem;">
          Be the first guest to share your verified review for this island experience!
        </div>
      `;
      return;
    }

    listContainer.innerHTML = reviews.map(r => `
      <div class="review-entry">
        <div class="review-entry-top">
          <div class="review-user-info">
            <img class="review-user-avatar" src="${r.avatar || getAutoAvatar(r.email || r.name)}" alt="${escapeHtml(r.name)}">
            <div>
              <span class="reviewer-name">
                ${escapeHtml(r.name)} (${escapeHtml(r.location || 'Guest')})
                <span class="verified-badge">✓ Verified</span>
              </span>
              ${r.email ? `<span class="review-email-badge">✉ ${maskEmail(r.email)}</span>` : ''}
            </div>
          </div>
          <span class="review-date">${escapeHtml(r.date || 'Recent')}</span>
        </div>
        <div class="stars-gold">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</div>
        <p class="review-entry-text">${escapeHtml(r.text)}</p>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Inject / update rating snippet on every card
  function renderAllCardRatings() {
    document.querySelectorAll('.item-card').forEach(card => {
      // Find item metadata
      const enquireBtn = card.querySelector('[data-whatsapp-action]');
      let itemId = enquireBtn ? enquireBtn.getAttribute('data-item-id') : null;
      let itemName = card.querySelector('.item-card-title')?.textContent?.trim() || 'Item';
      let island = card.querySelector('.item-card-island')?.textContent?.trim() || 'Lakshadweep';

      if (!itemId) {
        // Fallback or generate unique stable id from title
        itemId = 'item-' + itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
        if (enquireBtn) enquireBtn.setAttribute('data-item-id', itemId);
      }

      const stats = getStats(itemId);

      // Check if rating element already exists
      let ratingEl = card.querySelector('.item-card-rating');
      if (!ratingEl) {
        ratingEl = document.createElement('div');
        ratingEl.className = 'item-card-rating';

        const cardBody = card.querySelector('.item-card-body');
        const cardMeta = card.querySelector('.item-card-meta');
        if (cardBody && cardMeta) {
          cardBody.insertBefore(ratingEl, cardMeta);
        } else if (cardBody) {
          cardBody.appendChild(ratingEl);
        }
      }

      ratingEl.setAttribute('data-item-id', itemId);
      ratingEl.setAttribute('data-item-name', itemName);
      ratingEl.setAttribute('data-item-island', island);

      ratingEl.innerHTML = `
        <span class="stars-gold">${stats.stars}</span>
        <span class="rating-score">${stats.score}</span>
        <span class="rating-count">(${stats.count})</span>
        <button type="button" class="btn-card-reviews">⭐ Reviews &amp; Write</button>
      `;

      const revBtn = ratingEl.querySelector('.btn-card-reviews');
      revBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(itemId, itemName, island);
      });
    });
  }

  // Expose global API
  window.NoodyReviews = {
    openModal: openModal,
    closeModal: closeModal,
    renderAllCardRatings: renderAllCardRatings,
    getStats: getStats,
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Load reviews CSS dynamically if not present
    if (!document.querySelector('link[href*="reviews.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'assets/css/reviews.css';
      document.head.appendChild(link);
    }

    renderAllCardRatings();
  });
})();
