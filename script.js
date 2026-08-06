/* ==========================================================================
   UNDANGAN DIGITAL RISNA & CESAR - INTERACTIVE LOGIC & SWIPE CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const cover1 = document.getElementById('cover1');
  const cover2 = document.getElementById('cover2');
  const mainInvitation = document.getElementById('mainInvitation');
  const btnOpenInvitation = document.getElementById('btnOpenInvitation');
  
  const swipeContainer = document.getElementById('swipeContainer');
  const swipeTrack = swipeContainer ? swipeContainer.querySelector('.swipe-track') : null;
  const swipeHandle = document.getElementById('swipeHandle');
  const swipeProgress = document.getElementById('swipeProgress');

  const bgMusic = document.getElementById('bgMusic');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const diskIcon = musicToggleBtn ? musicToggleBtn.querySelector('.disk-icon') : null;

  // Guest Name Parameter Detection (?to=Nama+Tamu)
  const urlParams = new URLSearchParams(window.location.search);
  const guestNameParam = urlParams.get('to') || urlParams.get('n');
  if (guestNameParam) {
    const guestDisplayEl = document.getElementById('guestNameDisplay');
    if (guestDisplayEl) {
      guestDisplayEl.textContent = guestNameParam;
    }
  }

  // ==========================================
  // SWIPE RIGHT SLIDER LOGIC (COVER 1 -> COVER 2)
  // ==========================================
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let maxDrag = 0;

  function initSwipe() {
    if (!swipeTrack || !swipeHandle) return;
    maxDrag = swipeTrack.clientWidth - swipeHandle.clientWidth - 8;
  }
  initSwipe();
  window.addEventListener('resize', initSwipe);

  // Mouse / Touch Start
  function onDragStart(e) {
    isDragging = true;
    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    swipeHandle.style.transition = 'none';
    if (swipeProgress) swipeProgress.style.transition = 'none';
  }

  // Mouse / Touch Move
  function onDragMove(e) {
    if (!isDragging) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    let deltaX = clientX - startX;
    
    // Clamp movement
    if (deltaX < 0) deltaX = 0;
    if (deltaX > maxDrag) deltaX = maxDrag;

    currentX = deltaX;
    swipeHandle.style.transform = `translateX(${deltaX}px)`;
    if (swipeProgress) {
      const percentage = (deltaX / maxDrag) * 100;
      swipeProgress.style.width = `${percentage}%`;
    }

    // Auto unlock if dragged more than 75%
    if (deltaX / maxDrag >= 0.75) {
      isDragging = false;
      unlockCover1();
    }
  }

  // Mouse / Touch End
  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    swipeHandle.style.transition = 'transform 0.3s ease';
    if (swipeProgress) swipeProgress.style.transition = 'width 0.3s ease';

    // Check if passed threshold
    if (currentX / maxDrag >= 0.6) {
      unlockCover1();
    } else {
      // Reset position
      swipeHandle.style.transform = 'translateX(0px)';
      if (swipeProgress) swipeProgress.style.width = '0%';
    }
  }

  if (swipeHandle) {
    swipeHandle.addEventListener('mousedown', onDragStart);
    swipeHandle.addEventListener('touchstart', onDragStart, { passive: true });

    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('touchmove', onDragMove, { passive: true });

    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);
  }

  // Unlock Cover 1 function (Swiping opens Cover 2)
  function unlockCover1() {
    if (swipeHandle) swipeHandle.style.transform = `translateX(${maxDrag}px)`;
    if (swipeProgress) swipeProgress.style.width = '100%';

    setTimeout(() => {
      cover1.classList.add('hidden-up');
      if (cover2) cover2.classList.add('active-cover');
    }, 250);
  }

  // Open Main Invitation Handler from Cover 2 ("Ketuk untuk membuka")
  if (btnOpenInvitation) {
    btnOpenInvitation.addEventListener('click', () => {
      if (cover2) cover2.classList.add('hidden-up');
      mainInvitation.classList.remove('hidden');
      
      // Trigger smooth entrance animation right when opening
      setTimeout(() => {
        mainInvitation.classList.add('active-anim');
      }, 50);

      musicToggleBtn.classList.remove('hidden');
      playAudio();

      const appContainer = document.getElementById('appContainer');
      if (appContainer) {
        appContainer.scrollTop = 0;
      }
    });
  }

  // ==========================================
  // SLIDE OBSERVER FOR AR-RUM & SECTION ANIMATIONS
  // ==========================================
  const appContainerEl = document.getElementById('appContainer');
  const invitationSections = document.querySelectorAll('.invitation-section');

  if ('IntersectionObserver' in window && invitationSections.length) {
    const slideObserverOptions = {
      root: appContainerEl || null,
      threshold: 0.25
    };

    const slideObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, slideObserverOptions);

    invitationSections.forEach(section => {
      slideObserver.observe(section);
    });
  }

  // ==========================================
  // AUDIO MUSIC CONTROLLER
  // ==========================================
  let isPlaying = false;

  function playAudio() {
    if (!bgMusic) return;
    bgMusic.play().then(() => {
      isPlaying = true;
      musicToggleBtn.classList.remove('hidden');
      if (diskIcon) diskIcon.classList.add('spinning');
    }).catch(err => {
      console.log('Audio autoplay prevented:', err);
    });
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      if (isPlaying) {
        bgMusic.pause();
        isPlaying = false;
        if (diskIcon) diskIcon.classList.remove('spinning');
      } else {
        bgMusic.play();
        isPlaying = true;
        if (diskIcon) diskIcon.classList.add('spinning');
      }
    });
  }


  // ==========================================
  // COUNTDOWN TIMER LOGIC (Sabtu, 22 Agustus 2026)
  // ==========================================
  const weddingDate = new Date('August 22, 2026 08:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      document.getElementById('days').innerText = '00';
      document.getElementById('hours').innerText = '00';
      document.getElementById('minutes').innerText = '00';
      document.getElementById('seconds').innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days < 10 ? '0' + days : days;
    document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
    document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();


  // ==========================================
  // RSVP & GUESTBOOK WISHES STORE (LOCALSTORAGE)
  // ==========================================
  const rsvpForm = document.getElementById('rsvpForm');
  const wishForm = document.getElementById('wishForm');
  const wishesList = document.getElementById('wishesList');

  // Default Initial Wishes (Empty by default)
  const defaultWishes = [];

  function loadWishes() {
    const stored = localStorage.getItem('wedding_wishes');
    const wishes = stored ? JSON.parse(stored) : defaultWishes;
    
    if (wishesList) {
      wishesList.innerHTML = '';
      if (!wishes || wishes.length === 0) {
        wishesList.innerHTML = '<p class="empty-wishes-text" style="font-size: 0.82rem; color: #777777; text-align: center; padding: 15px 0; font-style: italic;">Belum ada ucapan & doa. Jadilah yang pertama memberikan doa restu!</p>';
        return;
      }
      wishes.forEach(w => {
        const item = document.createElement('div');
        item.className = 'wish-item';
        item.innerHTML = `
          <div class="wish-header">
            <span class="wish-sender">${escapeHtml(w.name)}</span>
            <span class="wish-time">${escapeHtml(w.date)}</span>
          </div>
          <p class="wish-body">${escapeHtml(w.message)}</p>
        `;
        wishesList.appendChild(item);
      });
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  loadWishes();

  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('wishName');
      const msgInput = document.getElementById('wishMessage');

      if (!nameInput.value.trim() || !msgInput.value.trim()) return;

      const stored = localStorage.getItem('wedding_wishes');
      const wishes = stored ? JSON.parse(stored) : defaultWishes;

      wishes.unshift({
        name: nameInput.value.trim(),
        message: msgInput.value.trim(),
        date: 'Baru saja'
      });

      localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
      nameInput.value = '';
      msgInput.value = '';
      
      loadWishes();
      showToast('Ucapan & doa berhasil terkirim!');
    });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Terima kasih! Konfirmasi kehadiran Anda telah tersimpan.');
      rsvpForm.reset();
    });
  }

  // ==========================================
  // GALLERY LIGHTBOX MODAL CONTROLLER
  // ==========================================
  const imageModal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const closeModal = document.getElementById('closeModal');
  const galleryImgs = document.querySelectorAll('.gallery-img');

  if (imageModal && modalImg) {
    galleryImgs.forEach(img => {
      img.addEventListener('click', () => {
        imageModal.classList.remove('hidden');
        setTimeout(() => imageModal.classList.add('show'), 10);
        modalImg.src = img.src;
      });
    });

    function closeGalleryModal() {
      imageModal.classList.remove('show');
      setTimeout(() => {
        imageModal.classList.add('hidden');
      }, 300);
    }

    if (closeModal) closeModal.addEventListener('click', closeGalleryModal);
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) closeGalleryModal();
    });
  }
});


// ==========================================
// COPY ACCOUNT NUMBER & TOAST FUNCTION
// ==========================================
function copyAccount(accNo, bankName) {
  navigator.clipboard.writeText(accNo).then(() => {
    showToast(`Nomor Rekening ${bankName} (${accNo}) berhasil disalin!`);
  }).catch(() => {
    // Fallback
    const tempInput = document.createElement('input');
    tempInput.value = accNo;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(`Nomor Rekening ${bankName} berhasil disalin!`);
  });
}

function showToast(text) {
  const toast = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastText');
  if (!toast || !toastText) return;

  toastText.textContent = text;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
