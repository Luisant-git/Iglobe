// Sticky header
const header = document.getElementById("header");
if (header) {
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 20));
}

// Top bar close
const topbarClose = document.getElementById("topbarClose");
if (topbarClose) topbarClose.addEventListener("click", () => document.getElementById("topbar").remove());

// Mobile menu
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");
hamburger.addEventListener("click", () => nav.classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach((l) => l.addEventListener("click", () => nav.classList.remove("open")));

// Reveal on scroll
const io = new IntersectionObserver(
  (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("visible"), io.unobserve(e.target))),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ----- Hero slider (fade, auto play) -----
const slides = document.querySelectorAll(".slide");
if (slides.length) {
  let idx = 0;
  const show = (i) => {
    slides[idx].classList.remove("active-area");
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add("active-area");
  };
  let timer = setInterval(() => show(idx + 1), 6000);
  const setManual = (n) => { clearInterval(timer); show(n); timer = setInterval(() => show(n + 1), 6000); };
  const prev = document.querySelector(".slider-arrow.prev");
  const next = document.querySelector(".slider-arrow.next");
  if (prev) prev.onclick = () => setManual(idx - 1);
  if (next) next.onclick = () => setManual(idx + 1);
}

// ----- Logo carousels (arrows, dots + auto scroll) -----
document.querySelectorAll("[data-carousel]").forEach((wrap) => {
  const track = wrap.querySelector(".logo-track");
  const items = Array.from(track.querySelectorAll(".logo-item"));
  // Clone items if no overflow (so auto-scroll has something to scroll)
  if (track.scrollWidth <= track.clientWidth) {
    items.forEach(item => { track.appendChild(item.cloneNode(true)); });
  }
  const step = () => (items[0]?.offsetWidth || 300) + 24;
  const dotsWrap = wrap.querySelector(".carousel-dots");
  let dots = [];
  let timer = null;

  if (dotsWrap) {
    items.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "carousel-dot" + (i === 0 ? " active" : "");
      b.type = "button";
      b.setAttribute("aria-label", "Slide " + (i + 1));
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
    });
    dots = Array.from(dotsWrap.querySelectorAll(".carousel-dot"));
  }

  const updateDots = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const progress = maxScroll <= 0 ? 0 : track.scrollLeft / maxScroll;
    const index = Math.min(items.length - 1, Math.round(progress * (items.length - 1)));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  };

  const goTo = (index) => {
    const item = items[index];
    if (!item) return;
    track.scrollTo({ left: item.offsetLeft - (track.clientWidth - item.offsetWidth) / 2, behavior: "smooth" });
    resetTimer();
  };

  const nextSlide = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= maxScroll - 1) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: step(), behavior: "smooth" });
    }
  };

  const startTimer = () => { stopTimer(); timer = setInterval(nextSlide, 3000); };
  const stopTimer = () => { if (timer) clearInterval(timer); timer = null; };
  const resetTimer = () => { stopTimer(); startTimer(); };

  const prevB = wrap.querySelector(".carousel-arrow.prev");
  const nextB = wrap.querySelector(".carousel-arrow.next");
  if (prevB) prevB.addEventListener("click", () => {
    track.scrollBy({ left: -step(), behavior: "smooth" });
    resetTimer();
  });
  if (nextB) nextB.addEventListener("click", () => {
    nextSlide();
    resetTimer();
  });

  track.addEventListener("scroll", updateDots);
  wrap.addEventListener("mouseenter", stopTimer);
  wrap.addEventListener("mouseleave", startTimer);

  startTimer();
});

// ----- Animated counters -----
const counterIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 2000, 1);
        el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  },
  { threshold: 0.4 }
);
document.querySelectorAll(".counter").forEach((c) => counterIO.observe(c));

// ----- Scroll to top -----
const toTop = document.getElementById("toTop");
if (toTop) {
  const toggleToTop = () => toTop.classList.toggle("show", window.scrollY > 400);
  window.addEventListener("scroll", toggleToTop, { passive: true });
  toggleToTop();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ----- Plane captcha -----
document.querySelectorAll("[data-plane-captcha]").forEach((captcha) => {
  const grid = captcha.querySelector(".captcha-grid");
  const status = captcha.querySelector(".captcha-status");
  const hidden = captcha.querySelector('input[name="humanVerified"]');
  const tiles = Array.from(captcha.querySelectorAll(".captcha-tile"));

  // Randomize the tile order on each load.
  tiles.sort(() => Math.random() - 0.5).forEach((tile) => grid.appendChild(tile));

  const reset = () => {
    captcha.classList.remove("verified", "captcha-error");
    tiles.forEach((tile) => tile.classList.remove("correct", "wrong"));
    status.textContent = "";
    if (hidden) hidden.value = "";
  };

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      if (captcha.classList.contains("verified")) return;
      captcha.classList.remove("captcha-error");
      tiles.forEach((t) => t.classList.remove("wrong"));

      if (tile.dataset.answer === "plane") {
        captcha.classList.add("verified");
        tile.classList.add("correct");
        status.textContent = "Verified — thank you! You can submit the form.";
        if (hidden) hidden.value = "yes";
      } else {
        tile.classList.add("wrong");
        status.textContent = "That's not the plane. Please try again.";
        setTimeout(() => tile.classList.remove("wrong"), 1200);
      }
    });
  });

  captcha.closest("form")?.addEventListener("reset", reset);
});

// ----- Booking form handling -----
const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  bookingForm.addEventListener("submit", function(e) {
    const captcha = bookingForm.querySelector("[data-plane-captcha]");
    if (captcha && !captcha.classList.contains("verified")) {
      e.preventDefault();
      captcha.classList.add("captcha-error");
      const captchaStatus = captcha.querySelector(".captcha-status");
      if (captchaStatus) captchaStatus.textContent = "Please select the plane to continue.";
      captcha.scrollIntoView({ behavior: "smooth", block: "center" });
      captcha.querySelector(".captcha-tile")?.focus({ preventScroll: true });
      return false;
    }
  });
}

// Check for form submission status
const urlParams = new URLSearchParams(window.location.search);
const formMessage = document.getElementById("formMessage");
if (formMessage && urlParams.get('status') === 'success') {
  formMessage.innerHTML = '<div style="padding:20px;background:#d4edda;color:#155724;border-radius:10px;">✅ Booking request sent successfully! We will contact you soon.</div>';
  setTimeout(() => { formMessage.innerHTML = ''; }, 8000);
} else if (formMessage && urlParams.get('status') === 'error') {
  formMessage.innerHTML = '<div style="padding:20px;background:#f8d7da;color:#721c24;border-radius:10px;">❌ Failed to send request. Please try again.</div>';
  setTimeout(() => { formMessage.innerHTML = ''; }, 8000);
}
