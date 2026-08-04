/* ==========================================================================
   WEDDING DIGITAL INVITATION - MAGAZINE COVER EDITION (INTERACTION LOGIC)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. URL GUEST NAME PARSER
  // --------------------------------------------------------------------------
  function initGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to') || urlParams.get('p') || urlParams.get('n') || 'Tamu Undangan';
    const guestDisplayEl = document.getElementById('guest-name-display');
    const inputNameEl = document.getElementById('input-name');
    
    if (guestDisplayEl) {
      guestDisplayEl.textContent = guestName;
    }
    if (inputNameEl && guestName !== 'Tamu Undangan') {
      inputNameEl.value = guestName;
    }
  }

  // --------------------------------------------------------------------------
  // 2. COVER 1 TO COVER 2 TRANSITION (GESTURE & CLICK)
  // --------------------------------------------------------------------------
  const cover1 = document.getElementById('cover-1');
  const cover2 = document.getElementById('cover-2');
  const swipeTrigger = document.getElementById('swipe-trigger');

  let startY = 0;
  let isCover1Active = true;

  function openCover2() {
    if (!isCover1Active) return;
    isCover1Active = false;
    if (cover2) cover2.classList.add('visible');
    cover1.classList.add('slide-up-out');
    initCover2Slideshow();
  }

  if (swipeTrigger) {
    swipeTrigger.addEventListener('click', openCover2);
  }

  // Touch & Swipe listeners
  if (cover1) {
    cover1.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    cover1.addEventListener('touchend', (e) => {
      const endY = e.changedTouches[0].clientY;
      if (startY - endY > 50) { // Swiped up
        openCover2();
      }
    }, { passive: true });

    // Mouse drag gesture for desktop
    let isMouseDown = false;
    let mouseStartY = 0;

    cover1.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      mouseStartY = e.clientY;
    });

    cover1.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      if (mouseStartY - e.clientY > 40) { // Dragged up
        openCover2();
      }
    });

    // Mouse wheel scroll listener
    cover1.addEventListener('wheel', (e) => {
      if (e.deltaY > 10) {
        openCover2();
      }
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 3. COVER 2 BACKGROUND SLIDESHOW (g5, g6, g12)
  // --------------------------------------------------------------------------
  let cover2Timer = null;
  function initCover2Slideshow() {
    const slides = document.querySelectorAll('#cover2-slideshow .slide-item');
    if (!slides.length) return;

    let currentIndex = 0;
    cover2Timer = setInterval(() => {
      slides[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('active');
    }, 3500);
  }

  // --------------------------------------------------------------------------
  // 4. MAIN INVITATION OPEN & GLOBAL SLIDESHOW (ALL 16 PHOTOS)
  // --------------------------------------------------------------------------
  const btnOpenInvitation = document.getElementById('btn-open-invitation');
  const mainContent = document.getElementById('main-content');
  const bgAudio = document.getElementById('bg-audio');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');

  const allImages = [
    'g14.png', 'g5.jpg', 'g6.jpg', 'g12.jpg',
    'bride.jpg', 'groom.jpg', 'g1.jpg', 'g2.jpg',
    'g3.jpg', 'g4.jpg', 'g7.jpg', 'g8.jpg',
    'g9.jpg', 'g10.jpg', 'g11.jpg', 'g13.jpg'
  ];

  function buildGlobalSlideshow() {
    const container = document.getElementById('global-slideshow');
    if (!container) return;

    container.innerHTML = '';
    allImages.forEach((imgSrc, idx) => {
      const div = document.createElement('div');
      div.className = `global-slide-item ${idx === 0 ? 'active' : ''}`;
      div.style.backgroundImage = `url('${imgSrc}')`;
      container.appendChild(div);
    });

    let currentIdx = 0;
    const slides = container.querySelectorAll('.global-slide-item');
    setInterval(() => {
      slides[currentIdx].classList.remove('active');
      currentIdx = (currentIdx + 1) % slides.length;
      slides[currentIdx].classList.add('active');
    }, 4500);
  }

  function playAudio() {
    if (bgAudio) {
      bgAudio.play().then(() => {
        audioToggleBtn.classList.remove('paused');
        audioToggleBtn.classList.add('playing');
      }).catch(err => {
        console.log('Audio autoplay blocked by browser:', err);
      });
    }
  }

  if (btnOpenInvitation) {
    btnOpenInvitation.addEventListener('click', () => {
      // Transition out cover 2
      if (cover2Timer) clearInterval(cover2Timer);
      cover2.classList.add('slide-up-out');

      // Show main content
      mainContent.classList.add('active');
      window.scrollTo(0, 0);

      // Start audio, slideshow, and scroll observers for all sections
      playAudio();
      buildGlobalSlideshow();
      initGlobalScrollReveals();
    });
  }

  // Audio button toggle
  if (audioToggleBtn && bgAudio) {
    audioToggleBtn.addEventListener('click', () => {
      if (bgAudio.paused) {
        bgAudio.play();
        audioToggleBtn.classList.remove('paused');
        audioToggleBtn.classList.add('playing');
      } else {
        bgAudio.pause();
        audioToggleBtn.classList.remove('playing');
        audioToggleBtn.classList.add('paused');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. LIVE COUNTDOWN TIMER WITH DIGIT MOTION ANIMATION
  // --------------------------------------------------------------------------
  function initCountdown() {
    const targetDate = new Date('2026-08-08T08:00:00+07:00').getTime();

    function setDigit(id, val) {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.textContent !== val) {
        el.textContent = val;
        el.classList.remove('tick-animate');
        void el.offsetWidth; // Trigger reflow
        el.classList.add('tick-animate');
      }
    }

    function updateTimer() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        ['cd-days', 'cd1-days', 'cd-hours', 'cd1-hours', 'cd-minutes', 'cd1-minutes', 'cd-seconds', 'cd1-seconds'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = '00';
        });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      const daysStr = d < 10 ? '0' + d : '' + d;
      const hoursStr = h < 10 ? '0' + h : '' + h;
      const minStr = m < 10 ? '0' + m : '' + m;
      const secStr = s < 10 ? '0' + s : '' + s;

      setDigit('cd1-days', daysStr);
      setDigit('cd-days', daysStr);
      setDigit('cd1-hours', hoursStr);
      setDigit('cd-hours', hoursStr);
      setDigit('cd1-minutes', minStr);
      setDigit('cd-minutes', minStr);
      setDigit('cd1-seconds', secStr);
      setDigit('cd-seconds', secStr);
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // --------------------------------------------------------------------------
  // 6. LIGHTBOX MODAL FOR GALLERY
  // --------------------------------------------------------------------------
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src') || item.querySelector('img').src;
      lightboxImg.src = src;
      lightboxModal.classList.add('active');
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. RSVP FORM & LOCAL STORAGE GUESTBOOK
  // --------------------------------------------------------------------------
  const rsvpForm = document.getElementById('rsvp-form');
  const guestbookList = document.getElementById('guestbook-list');

  const defaultWishes = [
    { name: 'Keluarga Besar H. Rahmat', message: 'Selamat untuk Abdi dan Linda! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin.', time: 'Baru saja' },
    { name: 'Rian & Maya', message: 'Selamat menempuh hidup baru sahabatku. Langgeng sampai kakek nenek ya!', time: '1 jam yang lalu' },
    { name: 'Budi Santoso', message: 'Selamat atas pernikahannya! Doa terbaik selalu untuk Abdi dan Linda.', time: '3 jam yang lalu' }
  ];

  function loadWishes() {
    const saved = localStorage.getItem('wedding_wishes_abdi_linda');
    let wishes = defaultWishes;
    if (saved) {
      try {
        wishes = JSON.parse(saved);
      } catch (e) {
        wishes = defaultWishes;
      }
    } else {
      localStorage.setItem('wedding_wishes_abdi_linda', JSON.stringify(defaultWishes));
    }
    renderWishes(wishes);
  }

  function renderWishes(wishes) {
    if (!guestbookList) return;
    guestbookList.innerHTML = '';
    wishes.forEach(w => {
      const div = document.createElement('div');
      div.className = 'guestbook-item';
      div.innerHTML = `
        <div class="gb-name">
          <span>${escapeHtml(w.name)}</span>
        </div>
        <p class="gb-msg">${escapeHtml(w.message)}</p>
        <p class="gb-time"><i class="fa-regular fa-clock"></i> ${escapeHtml(w.time)}</p>
      `;
      guestbookList.appendChild(div);
    });
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('input-name').value.trim();
      const message = document.getElementById('input-message').value.trim();

      if (!name || !message) return;

      const newWish = {
        name: name,
        message: message,
        time: 'Baru saja'
      };

      const saved = localStorage.getItem('wedding_wishes_abdi_linda');
      let wishes = defaultWishes;
      if (saved) {
        try { wishes = JSON.parse(saved); } catch (err) {}
      }
      wishes.unshift(newWish);
      localStorage.setItem('wedding_wishes_abdi_linda', JSON.stringify(wishes));

      renderWishes(wishes);
      rsvpForm.reset();
      showToast('Terima kasih! Ucapan & doa restu Anda berhasil terkirim.');
    });
  }

  // --------------------------------------------------------------------------
  // 8. Q.S AR-RUM TYPEWRITER LETTER-BY-LETTER PREPARATION
  // --------------------------------------------------------------------------
  function prepareQuranTypewriter() {
    const arabicEl = document.querySelector('.quote-arabic');
    const translationEl = document.querySelector('.quote-translation');
    const quranCard = document.querySelector('.quran-quote-card');

    // Pecah kalimat Arab kata demi kata agar menjaga kerapian kaligrafi
    if (arabicEl && !arabicEl.dataset.prepared) {
      const words = arabicEl.textContent.trim().split(/\s+/);
      arabicEl.innerHTML = '';
      words.forEach((word, idx) => {
        const span = document.createElement('span');
        span.className = 'word-span';
        span.textContent = word;
        span.style.transitionDelay = `${(0.6 + (idx * 0.12)).toFixed(3)}s`;
        arabicEl.appendChild(span);
      });
      arabicEl.dataset.prepared = 'true';
    }

    // Pecah terjemahan huruf demi huruf (typewriter effect)
    if (translationEl && !translationEl.dataset.prepared) {
      const text = translationEl.textContent.trim();
      translationEl.innerHTML = '';
      const baseDelay = 1.8; // dimulakan setelah kata Arab selesai mekar
      let charIdx = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const span = document.createElement('span');
        span.className = 'char-span';
        if (char === ' ') {
          span.innerHTML = '&nbsp;';
        } else {
          span.textContent = char;
        }
        const currentDelay = baseDelay + (charIdx * 0.025); // 25 milidetik per huruf
        span.style.transitionDelay = `${currentDelay.toFixed(3)}s`;
        translationEl.appendChild(span);
        charIdx++;
      }
      if (quranCard) {
        const maxDelay = baseDelay + (charIdx * 0.025);
        quranCard.style.setProperty('--max-delay', `${maxDelay.toFixed(3)}s`);
      }
      translationEl.dataset.prepared = 'true';
    }
  }

  // --------------------------------------------------------------------------
  // 9. GLOBAL SCROLL REVEAL OBSERVER FOR ALL SLIDES & SECTIONS
  // --------------------------------------------------------------------------
  function initGlobalScrollReveals() {
    prepareQuranTypewriter();

    const revealElements = document.querySelectorAll('.quran-quote-card, .scroll-reveal, .scroll-reveal-left');
    if (!revealElements.length) return;

    // Reset kelas reveal-active awal pada semua elemen
    revealElements.forEach(el => el.classList.remove('reveal-active'));

    function checkAllReveals() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();

        // Picu animasi jika bagian atas elemen telah masuk hingga 55% layar dan belum keluar dari bawah
        if (rect.top <= windowHeight * 0.55 && rect.bottom >= 0) {
          el.classList.add('reveal-active');
        } else if (rect.top > windowHeight || rect.bottom < -50) {
          // Riset secara transparan saat elemen keluar dari layar agar dapat beranimasi ulang saat di-scroll balik (ke atas atau ke bawah)
          el.classList.remove('reveal-active');
        }
      });
    }

    // Dengarkan saat pengguna aktif melakukan scroll / touchmove
    window.addEventListener('scroll', checkAllReveals, { passive: true });
    window.addEventListener('touchmove', checkAllReveals, { passive: true });
  }

  // Initialize
  initGuestName();
  initCountdown();
  loadWishes();
  prepareQuranTypewriter();
});

// --------------------------------------------------------------------------
// 8. COPY TO CLIPBOARD HELPER & TOAST
// --------------------------------------------------------------------------
function copyRekening(number, bankName) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(number).then(() => {
      showToast(`No. Rekening ${bankName} (${number}) berhasil disalin!`);
    }).catch(() => {
      fallbackCopyTextToClipboard(number, bankName);
    });
  } else {
    fallbackCopyTextToClipboard(number, bankName);
  }
}

function fallbackCopyTextToClipboard(text, bankName) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(`No. Rekening ${bankName} (${text}) berhasil disalin!`);
  } catch (err) {
    showToast(`Gagal menyalin. Silakan catat: ${text}`);
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
