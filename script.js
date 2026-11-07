const COUNTDOWN_TO = new Date("2026-12-11T22:00:00+05:30").getTime();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function makePetals(container, count) {
  if (!container || container.childElementCount) return;
  const tones = ["#f6c9c6", "#fff7f4", "#e7a3ab", "#f0d2a4", "#f7edda", "#ffd0dc"];

  for (let i = 0; i < count; i += 1) {
    const petal = document.createElement("i");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDuration = `${8 + Math.random() * 10}s`;
    petal.style.animationDelay = `${-Math.random() * 14}s`;
    petal.style.opacity = String(0.4 + Math.random() * 0.5);
    petal.style.background = `linear-gradient(135deg, #fff, ${tones[i % tones.length]} 60%, #c96b78)`;
    petal.style.width = `${8 + Math.random() * 9}px`;
    petal.style.height = `${12 + Math.random() * 10}px`;
    container.appendChild(petal);
  }
}

function makeSparks(container, count) {
  if (!container) return;

  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement("i");
    spark.className = "spark";
    spark.style.left = `${Math.random() * 100}%`;
    spark.style.top = `${Math.random() * 100}%`;
    spark.style.animationDelay = `${Math.random() * 2.8}s`;
    spark.style.animationDuration = `${1.8 + Math.random() * 2.2}s`;
    container.appendChild(spark);
  }
}

function splitText() {
  document.querySelectorAll("[data-words]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";

    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "word";
      span.style.setProperty("--d", `${index * 0.08}s`);
      span.textContent = word;
      el.appendChild(span);

      if (index < words.length - 1) {
        el.appendChild(document.createTextNode(" "));
      }
    });
  });

  document.querySelectorAll("[data-letters]").forEach((el) => {
    const letters = Array.from(el.textContent.trim());
    el.textContent = "";

    letters.forEach((letter, index) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.setProperty("--d", `${index * 0.06}s`);
      span.textContent = letter;
      el.appendChild(span);
    });
  });
}

function startObserver() {
  const nodes = document.querySelectorAll(".reveal");

  if (reduceMotion) {
    nodes.forEach((node) => node.classList.add("is-in"));
    makePetals(document.getElementById("shower"), 32);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);

        if (entry.target.closest("#closing")) {
          makePetals(document.getElementById("shower"), 36);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}


/* =========================================
   OPENING - MUSIC UPDATED
========================================= */

function setupOpening() {
  const opening = document.getElementById("opening");
  const enter = document.getElementById("enter-btn");
  const envelope = document.getElementById("envelope-open");

  let closed = false;
  let userClicked = false;

  function finish() {
    if (closed) return;

    closed = true;

    // Automatic opening: attempt music playback
    // Browser may block autoplay without user interaction
    if (!userClicked) {
      playMusic();
    }

    opening.classList.add("is-leaving");

    window.setTimeout(() => {
      opening.remove();
      document.body.classList.remove("is-opening");

      const heading = document.querySelector("#darshan h1");

      if (heading) {
        heading.setAttribute("tabindex", "-1");
      }

      startObserver();

    }, reduceMotion ? 0 : 1100);
  }

  // Envelope seal click
  if (envelope) {
    envelope.addEventListener("click", () => {
      userClicked = true;
      playMusic();
      finish();
    });
  }

  // Enter button click
  if (enter) {
    enter.addEventListener("click", () => {
      userClicked = true;
      playMusic();
      finish();
    });
  }

  // Automatically close opening screen after 2 seconds
  window.setTimeout(finish, 2000);
}


/* =========================================
   COUNTDOWN
========================================= */

function setCount(id, value) {
  const el = document.getElementById(id);
  const text = String(value).padStart(2, "0");

  if (el.textContent === text) return;

  el.textContent = text;

  const box = el.parentElement;
  box.classList.remove("tick");

  void box.offsetWidth;

  box.classList.add("tick");
}

function updateCountdown() {
  const remaining = COUNTDOWN_TO - Date.now();
  const status = document.getElementById("count-status");

  if (remaining <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach((id) => setCount(id, 0));
    status.textContent = "The varmala celebration has begun.";
    return;
  }

  setCount("days", Math.floor(remaining / 86400000));
  setCount("hours", Math.floor(remaining / 3600000) % 24);
  setCount("minutes", Math.floor(remaining / 60000) % 60);
  setCount("seconds", Math.floor(remaining / 1000) % 60);
}


/* =========================================
   MP3 MUSIC - UPDATED
========================================= */

const weddingAudio = document.getElementById("wedding-audio");

async function playMusic() {
  if (!weddingAudio) return;

  try {
    weddingAudio.volume = 0.6;

    await weddingAudio.play();

    const button = document.getElementById("music-btn");

    if (button) {
      button.setAttribute("aria-pressed", "true");
      button.classList.add("is-playing");

      const label = button.querySelector(".music-label");

      if (label) {
        label.textContent = "Pause";
      }
    }

  } catch (error) {
    console.log("Music autoplay blocked or failed:", error);

    const button = document.getElementById("music-btn");

    if (button) {
      button.setAttribute("aria-pressed", "false");
      button.classList.remove("is-playing");

      const label = button.querySelector(".music-label");

      if (label) {
        label.textContent = "Tap for Music";
      }
    }
  }
}
function enableMusicOnInteraction() {
  const startMusic = () => {
    const audio = document.getElementById("wedding-audio");

    if (!audio || !audio.paused) return;

    audio.play()
      .then(() => {
        document.body.classList.add("music-playing");

        const musicBtn = document.getElementById("music-btn");
        if (musicBtn) {
          musicBtn.textContent = "♫ Sound On";
        }
      })
      .catch(() => {
        // Browser ne autoplay block kiya hai.
        // Agle user interaction par dobara try hoga.
      });
  };

  window.addEventListener("scroll", startMusic, { passive: true });
  window.addEventListener("click", startMusic);
  window.addEventListener("touchstart", startMusic, { passive: true });
  window.addEventListener("keydown", startMusic);
  window.addEventListener("wheel", startMusic, { passive: true });
}

function pauseMusic() {
  if (!weddingAudio) return;

  weddingAudio.pause();

  const button = document.getElementById("music-btn");

  if (button) {
    button.setAttribute("aria-pressed", "false");
    button.classList.remove("is-playing");

    const label = button.querySelector(".music-label");

    if (label) {
      label.textContent = "Music";
    }
  }
}

function setupMusic() {
  const button = document.getElementById("music-btn");

  if (!button) return;

  button.addEventListener("click", () => {
    if (!weddingAudio) return;

    if (weddingAudio.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  });
}


/* =========================================
   ORIGINAL TOAST FUNCTION
========================================= */

function toast(message) {
  const el = document.getElementById("toast");

  el.textContent = message;
  el.classList.add("show");

  window.clearTimeout(toast.timer);

  toast.timer = window.setTimeout(() => {
    el.classList.remove("show");
  }, 2800);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const area = document.createElement("textarea");

  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-999px";

  document.body.appendChild(area);

  area.select();
  document.execCommand("copy");
  area.remove();
}

function setupShare() {
  const button = document.getElementById("share-btn");

  button.addEventListener("click", async () => {
    const payload = {
      title: "Gaurav & Rinki — Wedding Invitation",
      text: "You are invited to the royal wedding of Gaurav & Rinki. Varmala: 11 December 2026, 10:00 PM IST, Bhatan, Kosi Kalan, Mathura.",
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }

    try {
      await copyText(`${payload.text} ${payload.url}`);
      toast("Invitation link copied.");
    } catch (error) {
      toast(payload.url);
    }
  });
}

function setupNav() {
  const nav = document.getElementById("site-nav");
  const open = document.getElementById("menu-btn");
  const close = document.getElementById("nav-close");

  function setOpen(isOpen) {
    nav.hidden = !isOpen;
    open.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  open.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function setupProgress() {
  const bar = document.getElementById("progress");

  const onScroll = () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = height > 0 ? window.scrollY / height : 0;

    bar.style.transform = `scaleX(${ratio})`;
  };

  document.addEventListener("scroll", onScroll, { passive: true });

  onScroll();
}


/* =========================================
   GROOM & BRIDE PHOTOS
========================================= */

async function useUploadedPortraits() {
  const portraits = {
    groom: "assets/Gaurav.png",
    bride: "assets/rinki.png"
  };

  for (const person of ["groom", "bride"]) {
    const image = document.querySelector(`[data-photo="${person}"]`);

    if (!image) continue;

    image.src = portraits[person];

    image.alt = person === "groom"
      ? "Portrait of Gaurav"
      : "Portrait of Rinki";
  }
}


/* =========================================
   ORIGINAL INITIALIZATION - PRESERVED
========================================= */

document.querySelectorAll(".event-card").forEach((card, index) => {
  card.style.setProperty("--delay", `${(index % 4) * 0.08}s`);
});

makePetals(document.getElementById("opening-petals"), 18);
makePetals(document.getElementById("petal-layer"), 14);
makePetals(document.getElementById("royal-petals"), 16);

makeSparks(document.getElementById("opening-sparks"), 26);
makeSparks(document.getElementById("closing-sparks"), 20);
makeSparks(document.getElementById("count-sparks"), 16);

splitText();

setupOpening();
setupMusic();
enableMusicOnInteraction(); // NEW LINE
setupShare();
setupNav();
setupProgress();

useUploadedPortraits();

updateCountdown();

window.setInterval(updateCountdown, 1000);