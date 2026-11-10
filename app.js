(() => {
  const STORAGE_KEY = "kokorev-cultural-yard-votes";

  const labels = {
    yard: "Cultural Yard",
    hybrid: "Hybrid",
    vsm: "Official VSM",
  };

  /* Future Slider */
  const before = document.querySelector("[data-before]");
  const handle = document.querySelector("[data-handle]");
  const range = document.querySelector("[data-range]");

  const setSlider = (value) => {
    const v = Math.max(0, Math.min(100, Number(value)));
    if (before) before.style.width = `${v}%`;
    if (handle) handle.style.left = `${v}%`;
    if (range && Number(range.value) !== v) range.value = String(v);
  };

  if (range) {
    range.addEventListener("input", () => setSlider(range.value));
    setSlider(range.value);
  }

  /* Scrollytelling */
  const scrolly = document.querySelector("[data-scrolly]");
  const steps = [...document.querySelectorAll(".step")];
  const caption = document.querySelector("[data-caption]");
  const captions = {
    heritage: "Heritage fabric intact",
    threat: "Rail footprint overlaid",
    vision: "Green yard reclaiming the plot",
  };

  const activateStep = (step) => {
    const mode = step.dataset.step || "heritage";
    steps.forEach((el) => el.classList.toggle("is-active", el === step));
    if (scrolly) scrolly.dataset.mode = mode;
    if (caption) caption.textContent = captions[mode] || captions.heritage;
  };

  if (steps.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) activateStep(visible.target);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.2, 0.5, 0.8] }
    );
    steps.forEach((step) => io.observe(step));
    activateStep(steps[0]);
  }

  /* Vote tally */
  const form = document.querySelector("[data-vote-form]");
  const success = document.querySelector("[data-success]");
  const tallyRoot = document.querySelector("[data-tally]");

  const readVotes = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const renderTally = () => {
    if (!tallyRoot) return;
    const votes = readVotes();
    const counts = { yard: 0, hybrid: 0, vsm: 0 };
    votes.forEach((v) => {
      if (counts[v.position] !== undefined) counts[v.position] += 1;
    });
    const total = Math.max(votes.length, 1);

    tallyRoot.innerHTML = Object.keys(counts)
      .map((key) => {
        const pct = Math.round((counts[key] / total) * 100);
        return `
          <div class="tally-row">
            <header>
              <span>${labels[key]}</span>
              <span>${counts[key]} · ${votes.length ? pct : 0}%</span>
            </header>
            <div class="bar ${key}"><span style="width:${votes.length ? pct : 0}%"></span></div>
          </div>`;
      })
      .join("");
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const entry = {
        name: String(data.get("name") || "").trim(),
        role: String(data.get("role") || ""),
        position: String(data.get("position") || "yard"),
        note: String(data.get("note") || "").trim(),
        at: new Date().toISOString(),
      };
      const votes = readVotes();
      votes.push(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
      form.reset();
      form.querySelector('input[value="yard"]').checked = true;
      if (success) success.hidden = false;
      renderTally();
    });
  }

  renderTally();

  /* Active nav underline */
  const navLinks = [...document.querySelectorAll(".topbar nav a")];
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      if (!id || !id.startsWith("#")) return null;
      const el = document.querySelector(id);
      return el ? { link, el } : null;
    })
    .filter(Boolean);

  const setActiveNav = (active) => {
    navLinks.forEach((link) => link.classList.toggle("is-active", link === active));
  };

  if (sections.length && "IntersectionObserver" in window) {
    const navIo = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const match = sections.find((s) => s.el === visible.target);
        if (match) setActiveNav(match.link);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.15, 0.4] }
    );
    sections.forEach(({ el }) => navIo.observe(el));
  }
})();
