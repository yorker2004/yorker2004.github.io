(function () {
  const root = document.documentElement;
  const header = document.getElementById("siteHeader");
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const primaryNav = document.getElementById("primaryNav");
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".primary-nav a");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function getStoredTheme() {
    try {
      return localStorage.getItem("portfolio-theme");
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch (error) {
      return;
    }
  }

  function getPreferredTheme() {
    const savedTheme = getStoredTheme();
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    saveTheme(theme);
  }

  setTheme(getPreferredTheme());

  themeToggle.addEventListener("click", function () {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  function closeMenu() {
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("nav-open");
  }

  menuToggle.addEventListener("click", function () {
    const isOpen = primaryNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", isOpen);
  });

  primaryNav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 880) {
      closeMenu();
    }
  });

  function updateHeaderState() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });

  const revealTargets = document.querySelectorAll(
    ".section-heading, .signal-list div, .skill-card, .experience-card, .project-card, .contact-button"
  );

  revealTargets.forEach(function (target, index) {
    target.classList.add("reveal-target");
    target.style.setProperty("--reveal-delay", Math.min(index * 18, 90) + "ms");
  });

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  revealTargets.forEach(function (target) {
    if (reducedMotion.matches) {
      target.classList.add("is-visible");
      return;
    }
    revealObserver.observe(target);
  });

  function setupHeroCanvas() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    const pointer = { x: 0, y: 0, active: false };
    let width = 0;
    let height = 0;
    let nodes = [];
    let animationFrame = null;

    function getColors() {
      const styles = getComputedStyle(root);
      return {
        bg: styles.getPropertyValue("--bg").trim(),
        background: styles.getPropertyValue("--surface-strong").trim(),
        surface: styles.getPropertyValue("--surface").trim(),
        primary: styles.getPropertyValue("--primary").trim(),
        accent: styles.getPropertyValue("--accent").trim(),
        violet: styles.getPropertyValue("--violet").trim(),
        line: styles.getPropertyValue("--line").trim()
      };
    }

    function resizeCanvas() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const nodeCount = Math.max(34, Math.min(78, Math.floor((width * height) / 18000)));
      nodes = Array.from({ length: nodeCount }, function (_, index) {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          radius: index % 7 === 0 ? 2.4 : 1.6,
          tone: index % 3
        };
      });
    }

    function draw() {
      const colors = getColors();
      context.clearRect(0, 0, width, height);
      const backdrop = context.createLinearGradient(0, 0, width, height);
      backdrop.addColorStop(0, colors.background);
      backdrop.addColorStop(0.58, colors.surface);
      backdrop.addColorStop(1, colors.bg);
      context.fillStyle = backdrop;
      context.fillRect(0, 0, width, height);

      const gridSize = 58;
      context.strokeStyle = colors.line;
      context.lineWidth = 1;
      context.globalAlpha = 0.28;
      for (let x = 0; x < width + gridSize; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 0; y < height + gridSize; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      context.globalAlpha = 1;

      nodes.forEach(function (node, index) {
        if (!reducedMotion.matches) {
          node.x += node.vx;
          node.y += node.vy;
        }

        if (node.x < 0 || node.x > width) {
          node.vx *= -1;
        }
        if (node.y < 0 || node.y > height) {
          node.vy *= -1;
        }

        for (let nextIndex = index + 1; nextIndex < nodes.length; nextIndex += 1) {
          const other = nodes[nextIndex];
          const distance = Math.hypot(node.x - other.x, node.y - other.y);
          if (distance < 142) {
            context.globalAlpha = 1 - distance / 142;
            context.strokeStyle = node.tone === 0 ? colors.primary : colors.violet;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(node.x, node.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }

        if (pointer.active) {
          const pointerDistance = Math.hypot(node.x - pointer.x, node.y - pointer.y);
          if (pointerDistance < 190) {
            context.globalAlpha = 1 - pointerDistance / 190;
            context.strokeStyle = colors.accent;
            context.beginPath();
            context.moveTo(node.x, node.y);
            context.lineTo(pointer.x, pointer.y);
            context.stroke();
          }
        }

        context.globalAlpha = 0.95;
        context.fillStyle = node.tone === 0 ? colors.primary : node.tone === 1 ? colors.accent : colors.violet;
        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      });

      if (!reducedMotion.matches) {
        animationFrame = requestAnimationFrame(draw);
      }
    }

    canvas.addEventListener("pointermove", function (event) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    });

    canvas.addEventListener("pointerleave", function () {
      pointer.active = false;
    });

    window.addEventListener("resize", function () {
      resizeCanvas();
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      draw();
    });

    reducedMotion.addEventListener("change", function () {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      draw();
    });

    resizeCanvas();
    draw();
  }

  setupHeroCanvas();
})();
