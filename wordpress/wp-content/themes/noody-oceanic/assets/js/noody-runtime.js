/**
 * NOODY.AI Oceanic Interactive Client Runtime
 * Handles Hero Slider, Island filtering, Multilingual Switcher, WhatsApp Payload Synthesis, and Core API Sync
 */

(function () {
  'use strict';

  // State Management
  const state = {
    activeIsland: localStorage.getItem('noody_selected_island') || 'AGATTI',
    language: localStorage.getItem('noody_selected_lang') || 'en',
    sliderIndex: 0,
    sliderTimer: null,
    sliderAutoplay: true,
  };

  const ISLAND_DATA = {
    AGATTI: {
      name: { en: 'Agatti', ml: 'അഗത്തി', hi: 'अगत्ती' },
      status: 'active',
      tagline: { en: 'Lagoon & Water Adventures · Phase 1 Live', ml: 'ലഗൂൺ സാഹസികതകൾ · ഫേസ് 1 ലൈവ്', hi: 'लैगून और साहसिक गतिविधियां · चरण 1 लाइव' },
    },
    KADMAT: {
      name: { en: 'Kadmat', ml: 'കടമത്ത്', hi: 'कदमत' },
      status: 'configurable',
      tagline: { en: 'Coral Reefs & Diving · Preview', ml: 'പവിഴപ്പുറ്റുകളും ഡൈവിംഗും · പ്രിവ്യൂ', hi: 'मूंगा चट्टानें और डाइविंग · पूर्वावलोकन' },
    },
    KAVARATTI: {
      name: { en: 'Kavaratti', ml: 'കവരത്തി', hi: 'कवरत्ती' },
      status: 'configurable',
      tagline: { en: 'Capital Heritage & Marine Life · Preview', ml: 'തലസ്ഥാന പൈതൃകം · പ്രിവ്യൂ', hi: 'राजधानी विरासत और समुद्री जीवन · पूर्वावलोकन' },
    },
    KALPENI: {
      name: { en: 'Kalpeni', ml: 'കൽപേനി', hi: 'कल्पेनी' },
      status: 'configurable',
      tagline: { en: 'Pristine Lagoons & Islands · Preview', ml: 'മനോഹരമായ ലഗൂണുകൾ · പ്രിവ്യൂ', hi: 'प्राकृतिक लैगून · पूर्वावलोकन' },
    },
  };

  const DICTIONARY = {
    en: {
      brandTagline: 'Next-gen Oceanic Operations, Data & Yield.',
      exploreIslands: 'Explore Islands',
      allServices: 'Water Sports & Services',
      allProducts: 'Local Island Products',
      gallery: 'Gallery',
      aboutUs: 'About NOODY.AI',
      feedback: 'Customer Feedback',
      contact: 'Support & Contact',
      vendorRegister: 'Vendor Registration',
      chooseIsland: 'Choose Your Island',
      chooseIslandDesc: 'Select an island to browse verified water sports, stays, and authentic island products.',
      activeStatus: 'Phase 1 Active',
      previewStatus: 'Configurable Preview',
      enquireWhatsapp: 'Enquire on WhatsApp',
      verifiedReview: 'Verified Customer',
      submitFeedback: 'Share Your Experience',
      terms: 'Terms',
      privacy: 'Privacy',
      cancellation: 'Refunds',
      whatsappGreeting: 'Hello NOODY.AI, please share details, availability and the final price.',
    },
    ml: {
      brandTagline: 'അടുത്ത തലമുറ സമുദ്ര പ്രവർത്തനങ്ങൾ, ഡാറ്റ & യീൽഡ്.',
      exploreIslands: 'ദ്വീപുകൾ കാണാം',
      allServices: 'വാട്ടർ സ്പോർട്സ് & സേവനങ്ങൾ',
      allProducts: 'ദ്വീപ് ഉൽപ്പന്നങ്ങൾ',
      gallery: 'ചിത്രശാല',
      aboutUs: 'NOODY.AI-യെക്കുറിച്ച്',
      feedback: 'ഉപഭോക്തൃ അഭിപ്രായങ്ങൾ',
      contact: 'സഹായം & ബന്ധപ്പെടുക',
      vendorRegister: 'വെണ്ടർ രജിസ്ട്രേഷൻ',
      chooseIsland: 'നിങ്ങളുടെ ദ്വീപ് തിരഞ്ഞെടുക്കൂ',
      chooseIslandDesc: 'ദ്വീപ് തിരഞ്ഞെടുത്ത് അംഗീകൃത വാട്ടർ സ്പോർട്സും പ്രാദേശിക ഉൽപ്പന്നങ്ങളും കാണൂ.',
      activeStatus: 'ഫേസ് 1 ആക്ടീവ്',
      previewStatus: 'കോൺഫിഗർ ചെയ്യാവുന്നത്',
      enquireWhatsapp: 'WhatsApp-ൽ ചോദിക്കൂ',
      verifiedReview: 'സ്ഥിരീകരിച്ച ഉപഭോക്താവ്',
      submitFeedback: 'അഭിപ്രായം രേഖപ്പെടുത്തൂ',
      terms: 'നിബന്ധനകൾ',
      privacy: 'സ്വകാര്യത',
      cancellation: 'റീഫണ്ട്',
      whatsappGreeting: 'ഹലോ NOODY.AI, വിശദാംശങ്ങളും ലഭ്യതയും അന്തിമ വിലയും അറിയിക്കൂ.',
    },
    hi: {
      brandTagline: 'अगली पीढ़ी के समुद्री संचालन, डेटा और यील्ड।',
      exploreIslands: 'द्वीप देखें',
      allServices: 'वाटर स्पोर्ट्स और सेवाएं',
      allProducts: 'स्थानीय द्वीप उत्पाद',
      gallery: 'गैलरी',
      aboutUs: 'NOODY.AI के बारे में',
      feedback: 'ग्राहक समीक्षाएं',
      contact: 'सहायता एवं संपर्क',
      vendorRegister: 'विक्रेता पंजीकरण',
      chooseIsland: 'अपना द्वीप चुनें',
      chooseIslandDesc: 'सत्यापित वाटर स्पोर्ट्स, स्टे और स्थानीय उत्पादों को देखने के लिए द्वीप चुनें।',
      activeStatus: 'चरण 1 सक्रिय',
      previewStatus: 'कॉन्फ़िगर करने योग्य',
      enquireWhatsapp: 'WhatsApp पर पूछें',
      verifiedReview: 'सत्यापित ग्राहक',
      submitFeedback: 'अपना अनुभव साझा करें',
      terms: 'शर्तें',
      privacy: 'गोपनीयता',
      cancellation: 'रिफंड',
      whatsappGreeting: 'नमस्ते NOODY.AI, कृपया जानकारी, उपलब्धता और अंतिम कीमत बताएं।',
    },
  };

  // WhatsApp Enquiry Builder (Strict adherence to NOODY Core format)
  function buildWhatsappUrl(options = {}) {
    const config = window.noodyConfig || { whatsappNumber: '919446944562' };
    const num = config.whatsappNumber;
    const island = options.island || state.activeIsland;
    const islandName = (ISLAND_DATA[island] && ISLAND_DATA[island].name[state.language]) || island;
    const greeting = DICTIONARY[state.language]?.whatsappGreeting || DICTIONARY.en.whatsappGreeting;

    const lines = [
      greeting,
      options.itemName || 'Island services and products',
      'Island: ' + islandName,
      'NOODY_SOURCE:WEBSITE',
      'NOODY_ISLAND:' + island,
    ];

    if (options.itemKind && options.itemId) {
      lines.push('NOODY_ITEM:' + options.itemKind + ':' + options.itemId);
    }

    const currentUrl = options.url || window.location.href;
    lines.push('Page: ' + currentUrl);

    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  // Update Island Filtering
  function setIsland(islandCode) {
    if (!ISLAND_DATA[islandCode]) return;
    state.activeIsland = islandCode;
    localStorage.setItem('noody_selected_island', islandCode);

    // Update Island Badges / Buttons in UI
    document.querySelectorAll('[data-island-select]').forEach(el => {
      const isSelected = el.getAttribute('data-island-select') === islandCode;
      el.classList.toggle('active', isSelected);
      el.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    // Filter service and product listings
    document.querySelectorAll('[data-listing-island]').forEach(card => {
      const cardIsland = card.getAttribute('data-listing-island');
      if (cardIsland === islandCode || cardIsland === 'ALL') {
        card.style.display = '';
        card.classList.add('fade-in');
      } else {
        card.style.display = 'none';
      }
    });

    // Update Island text labels
    document.querySelectorAll('[data-current-island-name]').forEach(el => {
      el.textContent = ISLAND_DATA[islandCode].name[state.language] || islandCode;
    });

    // Rebind WhatsApp CTA links with updated island context
    refreshWhatsappLinks();
  }

  // Multilingual Engine
  function setLanguage(lang) {
    if (!DICTIONARY[lang]) return;
    state.language = lang;
    localStorage.setItem('noody_selected_lang', lang);
    document.documentElement.lang = lang;

    // Update language switcher UI
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === lang);
    });

    // Replace all text keys
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (DICTIONARY[lang][key]) {
        el.textContent = DICTIONARY[lang][key];
      }
    });

    // Update island names in new language
    setIsland(state.activeIsland);
  }

  // Refresh all WhatsApp CTAs with correct encoded text
  function refreshWhatsappLinks() {
    document.querySelectorAll('a[data-whatsapp-enquiry]').forEach(link => {
      const itemName = link.getAttribute('data-item-name') || '';
      const itemKind = link.getAttribute('data-item-kind') || '';
      const itemId = link.getAttribute('data-item-id') || '';
      link.href = buildWhatsappUrl({
        island: state.activeIsland,
        itemName,
        itemKind,
        itemId,
      });
    });
  }

  // Hero Slider
  function initHeroSlider() {
    const slider = document.querySelector('.noody-hero-slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.noody-slide');
    const dots = slider.querySelectorAll('.noody-indicator-dot');
    if (!slides.length) return;

    function goToSlide(index) {
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      state.sliderIndex = index;
    }

    function nextSlide() {
      const next = (state.sliderIndex + 1) % slides.length;
      goToSlide(next);
    }

    function prevSlide() {
      const prev = (state.sliderIndex - 1 + slides.length) % slides.length;
      goToSlide(prev);
    }

    slider.querySelector('[data-slider-next]')?.addEventListener('click', () => {
      nextSlide();
      resetTimer();
    });

    slider.querySelector('[data-slider-prev]')?.addEventListener('click', () => {
      prevSlide();
      resetTimer();
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetTimer();
      });
    });

    function startTimer() {
      state.sliderTimer = setInterval(nextSlide, 7000);
    }

    function resetTimer() {
      clearInterval(state.sliderTimer);
      startTimer();
    }

    slider.addEventListener('mouseenter', () => clearInterval(state.sliderTimer));
    slider.addEventListener('mouseleave', () => startTimer());

    startTimer();
  }

  // Check Central API Health Status
  async function checkApiHealth() {
    const indicator = document.querySelector('#core-api-health-badge');
    if (!indicator) return;

    try {
      const res = await fetch('https://noody-ai-production.up.railway.app/health', {
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          indicator.className = 'api-status-badge api-status-online';
          indicator.innerHTML = '<span class="status-dot"></span> NOODY Core API: Operational';
          return;
        }
      }
      throw new Error();
    } catch {
      indicator.className = 'api-status-badge api-status-standby';
      indicator.innerHTML = '<span class="status-dot"></span> NOODY Core API: Direct Mode Active';
    }
  }

  // Document Ready
  document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    setIsland(state.activeIsland);
    setLanguage(state.language);
    checkApiHealth();

    // Bind island selector clicks
    document.querySelectorAll('[data-island-select]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        setIsland(btn.getAttribute('data-island-select'));
      });
    });

    // Bind language switcher clicks
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        setLanguage(btn.getAttribute('data-lang-btn'));
      });
    });
  });

  // Expose global API
  window.noody = {
    setIsland,
    setLanguage,
    buildWhatsappUrl,
    state,
  };
})();
