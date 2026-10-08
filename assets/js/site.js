/**
 * NOODY.AI Public Site Runtime
 * Island-first filtering, multilingual switching, Meta WhatsApp synthesis, and Core API status
 */

(function () {
  'use strict';

  const DEFAULT_ISLAND = 'AGATTI';
  const WHATSAPP_NUMBER = '919446944562';
  const CORE_API_ORIGIN = 'https://noody-ai-production.up.railway.app';

  const state = {
    island: localStorage.getItem('noody_island') || DEFAULT_ISLAND,
    lang: localStorage.getItem('noody_lang') || 'en',
    currentSlide: 0,
    slideInterval: null,
  };

  const ISLANDS = {
    AGATTI: {
      name: { en: 'Agatti', ml: 'അഗത്തി', hi: 'अगत्ती' },
      status: 'active',
      tagline: {
        en: 'Lagoon adventures, water sports, and local homestays · Phase 1 Live',
        ml: 'ലഗൂൺ സാഹസികതകൾ, വാട്ടർ സ്പോർട്സ്, പ്രാദേശിക ഹോംസ്റ്റേകൾ · ഫേസ് 1 ലൈവ്',
        hi: 'लैगून रोमांच, वाटर स्पोर्ट्स और स्थानीय होमस्टे · चरण 1 लाइव'
      }
    },
    KADMAT: {
      name: { en: 'Kadmat', ml: 'കടമത്ത്', hi: 'कदमत' },
      status: 'preview',
      tagline: {
        en: 'Long sandy beaches, scuba diving, and coral reefs · Operational Preview',
        ml: 'നീണ്ട മണൽത്തീരങ്ങൾ, സ്കൂബ ഡൈവിംഗ്, പവിഴപ്പുറ്റുകൾ · പ്രിവ്യൂ',
        hi: 'लंबे रेतीले समुद्र तट, स्कूबा डाइविंग और मूंगा चट्टानें · पूर्वावलोकन'
      }
    },
    KAVARATTI: {
      name: { en: 'Kavaratti', ml: 'കവരത്തി', hi: 'कवरत्ती' },
      status: 'preview',
      tagline: {
        en: 'Capital island marine heritage and lagoon safaris · Operational Preview',
        ml: 'തലസ്ഥാന ദ്വീപ് സമുദ്ര പൈതൃകവും ലഗൂൺ സഫാരികളും · പ്രിവ്യൂ',
        hi: 'राजधानी द्वीप की समुद्री विरासत और लैगून सफारी · पूर्वावलोकन'
      }
    },
    KALPENI: {
      name: { en: 'Kalpeni', ml: 'കൽപേനി', hi: 'कल्पेनी' },
      status: 'preview',
      tagline: {
        en: 'Huge storm beach, turquoise lagoon, and kayaking · Operational Preview',
        ml: 'വിശാലമായ ലഗൂണും കയാക്കിംഗും · പ്രിവ്യൂ',
        hi: 'विशाल लैगून और कयाकिंग · पूर्वावलोकन'
      }
    }
  };

  const I18N = {
    en: {
      navHome: 'Home',
      navIslands: 'Islands',
      navServices: 'Services',
      navProducts: 'Products',
      navGallery: 'Gallery',
      navAbout: 'About',
      navFeedback: 'Feedback',
      navContact: 'Contact',
      heroEyebrow: 'LAKSHADWEEP · INDIA',
      heroTitle: 'A little island. A world of possibilities.',
      heroDesc: 'Select an island, discover verified water sports, authentic local produce, and continue your enquiry directly on WhatsApp with official NOODY operations.',
      btnExplore: 'Explore Agatti Now',
      btnHow: 'How It Works',
      step1Title: 'Choose Your Island',
      step1Desc: 'Start by selecting your island destination. Agatti is Phase 1 Live.',
      step2Title: 'Browse Services & Products',
      step2Desc: 'Find certified water sports, homestays, and authentic tuna & coconut crafts.',
      step3Title: 'Enquire on WhatsApp',
      step3Desc: 'Receive transparent pricing, check real-time availability, and speak to local operators.',
      allIslands: 'Explore Islands',
      verifiedServices: 'Verified Water Sports & Experiences',
      localProduce: 'Authentic Lakshadweep Products',
      enquireNow: 'Enquire on WhatsApp',
      viewAll: 'View All',
      filterAll: 'All Categories',
      filterSports: 'Water Sports',
      filterStays: 'Stays & Homestays',
      filterTransport: 'Boat & Transport',
      filterTuna: 'Tuna & Seafood',
      filterCraft: 'Coconut & Crafts',
      enquiryGreeting: 'Hello NOODY.AI, please share details, availability and the final price.',
      footerTagline: 'Next-gen Oceanic Operations, Data & Yield.',
    },
    ml: {
      navHome: 'ഹോം',
      navIslands: 'ദ്വീപുകൾ',
      navServices: 'സേവനങ്ങൾ',
      navProducts: 'ഉൽപ്പന്നങ്ങൾ',
      navGallery: 'ചിത്രശാല',
      navAbout: 'ഞങ്ങളെക്കുറിച്ച്',
      navFeedback: 'അഭിപ്രായങ്ങൾ',
      navContact: 'ബന്ധപ്പെടുക',
      heroEyebrow: 'ലക്ഷദ്വീപ് · ഇന്ത്യ',
      heroTitle: 'ചെറിയൊരു ദ്വീപ്. സാധ്യതകളുടെ വലിയൊരു ലോകം.',
      heroDesc: 'ദ്വീപ് തിരഞ്ഞെടുക്കൂ, വാട്ടർ സ്പോർട്സും പ്രാദേശിക ഉൽപ്പന്നങ്ങളും കാണൂ, ശേഷം WhatsApp വഴി നേരിട്ട് ചോദിക്കൂ.',
      btnExplore: 'അഗത്തി ഇപ്പോൾ കാണാം',
      btnHow: 'എങ്ങനെ പ്രവർത്തിക്കുന്നു',
      step1Title: 'ദ്വീപ് തിരഞ്ഞെടുക്കൂ',
      step1Desc: 'ആദ്യം നിങ്ങളുടെ ദ്വീപ് തിരഞ്ഞെടുക്കൂ. അഗത്തി ഫേസ് 1 ലൈവാണ്.',
      step2Title: 'സേവനങ്ങളും ഉൽപ്പന്നങ്ങളും',
      step2Desc: 'അംഗീകൃത സ്കൂബ, കയാക്കിംഗ്, ഹോംസ്റ്റേകൾ, ട്യൂണ ഉൽപ്പന്നങ്ങൾ എന്നിവ കണ്ടെത്തൂ.',
      step3Title: 'WhatsApp-ൽ ചോദിക്കൂ',
      step3Desc: 'ലഭ്യതയും അന്തിമ വിലയും WhatsApp-ൽ ഉടനടി സ്ഥിരീകരിക്കാം.',
      allIslands: 'ദ്വീപുകൾ കാണാം',
      verifiedServices: 'വാട്ടർ സ്പോർട്സ് & സേവനങ്ങൾ',
      localProduce: 'പ്രാദേശിക ദ്വീപ് ഉൽപ്പന്നങ്ങൾ',
      enquireNow: 'WhatsApp-ൽ ചോദിക്കൂ',
      viewAll: 'എല്ലാം കാണാം',
      filterAll: 'എല്ലാ വിഭാഗങ്ങളും',
      filterSports: 'വാട്ടർ സ്പോർട്സ്',
      filterStays: 'താമസം & ഹോംസ്റ്റേ',
      filterTransport: 'യാത്ര & ബോട്ട്',
      filterTuna: 'ട്യൂണ & ഭക്ഷണങ്ങൾ',
      filterCraft: 'കരകൗശല വസ്തുക്കൾ',
      enquiryGreeting: 'ഹലോ NOODY.AI, വിശദാംശങ്ങളും ലഭ്യതയും അന്തിമ വിലയും അറിയിക്കൂ.',
      footerTagline: 'അടുത്ത തലമുറ സമുദ്ര പ്രവർത്തനങ്ങൾ, ഡാറ്റ & യീൽഡ്.',
    },
    hi: {
      navHome: 'होम',
      navIslands: 'द्वीप',
      navServices: 'सेवाएं',
      navProducts: 'उत्पाद',
      navGallery: 'गैलरी',
      navAbout: 'हमारे बारे में',
      navFeedback: 'समीक्षाएं',
      navContact: 'संपर्क',
      heroEyebrow: 'लक्षद्वीप · भारत',
      heroTitle: 'एक छोटा द्वीप। संभावनाओं की एक बड़ी दुनिया।',
      heroDesc: 'द्वीप चुनें, सत्यापित वाटर स्पोर्ट्स और स्थानीय उत्पाद देखें, और सीधे WhatsApp पर पूछें।',
      btnExplore: 'अगत्ती अभी देखें',
      btnHow: 'यह कैसे काम करता है',
      step1Title: 'अपना द्वीप चुनें',
      step1Desc: 'पहले अपना गंतव्य द्वीप चुनें। अगत्ती चरण 1 लाइव है।',
      step2Title: 'सेवाएं और उत्पाद देखें',
      step2Desc: 'प्रमाणित स्कूबा, कयाकिंग, होमस्टे और स्थानीय उत्पाद खोजें।',
      step3Title: 'WhatsApp पर पूछें',
      step3Desc: 'पारदर्शी मूल्य और वास्तविक उपलब्धता तुरंत WhatsApp पर प्राप्त करें।',
      allIslands: 'द्वीप देखें',
      verifiedServices: 'सत्यापित वाटर स्पोर्ट्स और अनुभव',
      localProduce: 'प्रामाणिक लक्षद्वीप उत्पाद',
      enquireNow: 'WhatsApp पर पूछें',
      viewAll: 'सभी देखें',
      filterAll: 'सभी श्रेणियां',
      filterSports: 'वाटर स्पोर्ट्स',
      filterStays: 'ठहरना और होमस्टे',
      filterTransport: 'बोट और परिवहन',
      filterTuna: 'टूना और सीफूड',
      filterCraft: 'नारियल शिल्प',
      enquiryGreeting: 'नमस्ते NOODY.AI, कृपया जानकारी, उपलब्धता और अंतिम कीमत बताएं।',
      footerTagline: 'अगली पीढ़ी के समुद्री संचालन, डेटा और यील्ड।',
    }
  };

  // WhatsApp Enquiry Link Generator
  function makeWhatsappLink(opts = {}) {
    const island = opts.island || state.island;
    const islandName = (ISLANDS[island] && ISLANDS[island].name[state.lang]) || island;
    const greeting = (I18N[state.lang] && I18N[state.lang].enquiryGreeting) || I18N.en.enquiryGreeting;

    const lines = [
      greeting,
      opts.itemName ? opts.itemName : 'Island services and products',
      'Island: ' + islandName,
      'NOODY_SOURCE:WEBSITE',
      'NOODY_ISLAND:' + island,
    ];

    if (opts.itemKind && opts.itemId) {
      lines.push('NOODY_ITEM:' + opts.itemKind + ':' + opts.itemId);
    }

    const currentUrl = opts.url || window.location.href;
    lines.push('Page: ' + currentUrl);

    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  // Island Selection Handler
  function selectIsland(islandCode) {
    if (!ISLANDS[islandCode]) return;
    state.island = islandCode;
    localStorage.setItem('noody_island', islandCode);

    // Update Island Card Active States
    document.querySelectorAll('.island-card').forEach(card => {
      const code = card.getAttribute('data-island');
      const isSel = code === islandCode;
      card.classList.toggle('active', isSel);
    });

    // Filter Items by Island
    document.querySelectorAll('[data-listing-island]').forEach(item => {
      const itemIsland = item.getAttribute('data-listing-island');
      if (itemIsland === islandCode || itemIsland === 'ALL') {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });

    // Update dynamic island headers
    document.querySelectorAll('[data-island-title]').forEach(el => {
      el.textContent = ISLANDS[islandCode].name[state.lang] || islandCode;
    });

    // Rebind WhatsApp CTA links
    updateAllWhatsappButtons();
  }

  // Multilingual Selector Handler
  function setLanguage(langCode) {
    if (!I18N[langCode]) return;
    state.lang = langCode;
    localStorage.setItem('noody_lang', langCode);
    document.documentElement.lang = langCode;

    // Update active pill button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === langCode);
    });

    // Translate all tagged nodes
    document.querySelectorAll('[data-i18n]').forEach(node => {
      const key = node.getAttribute('data-i18n');
      if (I18N[langCode][key]) {
        node.textContent = I18N[langCode][key];
      }
    });

    // Re-render current island names in selected language
    selectIsland(state.island);
  }

  function updateAllWhatsappButtons() {
    document.querySelectorAll('a[data-whatsapp-action]').forEach(btn => {
      const itemName = btn.getAttribute('data-item-name') || '';
      const itemKind = btn.getAttribute('data-item-kind') || '';
      const itemId = btn.getAttribute('data-item-id') || '';
      btn.href = makeWhatsappLink({
        island: state.island,
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

    const slides = slider.querySelectorAll('.hero-slide');
    const dots = slider.querySelectorAll('.slider-dot');
    if (!slides.length) return;

    function showSlide(idx) {
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      state.currentSlide = idx;
    }

    function nextSlide() {
      const next = (state.currentSlide + 1) % slides.length;
      showSlide(next);
    }

    function prevSlide() {
      const prev = (state.currentSlide - 1 + slides.length) % slides.length;
      showSlide(prev);
    }

    slider.querySelector('.slider-next-btn')?.addEventListener('click', () => {
      nextSlide();
      resetInterval();
    });

    slider.querySelector('.slider-prev-btn')?.addEventListener('click', () => {
      prevSlide();
      resetInterval();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        resetInterval();
      });
    });

    function startInterval() {
      state.slideInterval = setInterval(nextSlide, 7000);
    }

    function resetInterval() {
      clearInterval(state.slideInterval);
      startInterval();
    }

    slider.addEventListener('mouseenter', () => clearInterval(state.slideInterval));
    slider.addEventListener('mouseleave', () => startInterval());

    startInterval();
  }

  // Check Core API Health Status
  async function checkBackendHealth() {
    const badge = document.getElementById('core-api-health-badge');
    if (!badge) return;

    try {
      const resp = await fetch(CORE_API_ORIGIN + '/health', {
        signal: AbortSignal.timeout(5000),
      });
      if (resp.ok) {
        const body = await resp.json();
        if (body.status === 'ok') {
          badge.className = 'api-status-badge api-status-online';
          badge.innerHTML = '<span class="status-dot"></span> NOODY Core API: Operational';
          return;
        }
      }
      throw new Error();
    } catch {
      badge.className = 'api-status-badge api-status-standby';
      badge.innerHTML = '<span class="status-dot"></span> NOODY Core API: Standby';
    }
  }

  // DOM Init
  document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    setLanguage(state.lang);
    selectIsland(state.island);
    checkBackendHealth();

    // Bind island card click
    document.querySelectorAll('.island-card').forEach(card => {
      card.addEventListener('click', () => {
        const code = card.getAttribute('data-island');
        selectIsland(code);
      });
    });

    // Bind language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
      });
    });

    // Category filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-filter');
        document.querySelectorAll('.item-card').forEach(card => {
          const itemCat = card.getAttribute('data-category');
          const itemIsland = card.getAttribute('data-listing-island');
          const islandMatches = itemIsland === state.island || itemIsland === 'ALL';
          if (islandMatches && (cat === 'all' || itemCat === cat)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  });

  window.Noody = {
    selectIsland,
    setLanguage,
    makeWhatsappLink,
    state,
  };
})();
