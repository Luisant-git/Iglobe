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

// ----- Simple carousels (arrows scroll) -----
document.querySelectorAll("[data-carousel]").forEach((wrap) => {
  const track = wrap.querySelector(".logo-track");
  const step = () => (track.querySelector(".logo-item")?.offsetWidth || 300) + 24;
  const prevB = wrap.querySelector(".carousel-arrow.prev");
  const nextB = wrap.querySelector(".carousel-arrow.next");
  if (prevB) prevB.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  if (nextB) nextB.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
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

// ----- Contact form (demo handler) -----
function submitForm(e) {
  e.preventDefault();

  const captcha = e.target.querySelector("[data-plane-captcha]");
  if (captcha && !captcha.classList.contains("verified")) {
    captcha.classList.add("captcha-error");
    const captchaStatus = captcha.querySelector(".captcha-status");
    if (captchaStatus) captchaStatus.textContent = "Please select the plane to continue.";
    captcha.scrollIntoView({ behavior: "smooth", block: "center" });
    captcha.querySelector(".captcha-tile")?.focus({ preventScroll: true });
    return false;
  }

  const btn = e.target.querySelector("button[type=submit]");
  const name = e.target.querySelector("#firstName")?.value.trim();
  setTimeout(() => {
    btn.innerHTML = "✅ Thank You" + (name ? " " + name + "" : "") + "!";
    btn.style.background = "#2e9e5b";
    setTimeout(() => { btn.innerHTML = "Submit"; btn.style.background = ""; e.target.reset(); }, 3200);
  }, 600);
  return false;
}
