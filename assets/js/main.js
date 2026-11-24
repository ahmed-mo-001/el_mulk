async function loadComponent(placeholderId, filePath) {
  // البحث عن كل العناصر اللي واخدة نفس الـ id حتى لو متكرر
  const elements = document.querySelectorAll(`#${placeholderId}`);
  if (!elements.length) return;

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`فشل تحميل الملف: ${filePath}`);
    let html = await response.text();

    // حذف سكريبت الـ Live Server عشان ميبوظش باقي الكروت لو الكارت جواه <svg>
    html = html.replace(
      /<!-- Code injected by live-server -->[\s\S]*?<\/script>/gi,
      "",
    );

    elements.forEach((el) => {
      el.outerHTML = html;
    });
  } catch (error) {
    console.error("خطأ أثناء استدعاء الـ Component:", error);
  }
}

// 2. قائمة جميع الـ Components حسب ترتيب ملفاتك
const componentsList = [
  { id: "navbar-placeholder", path: "./components/navbar.html" },
  { id: "course-card-placeholder", path: "./components/course-card.html" },
  {
    id: "testimonials-section-placeholder",
    path: "./components/testimonials-section.html",
  },
  { id: "guide-card-placeholder", path: "./components/guide-card.html" },
  {
    id: "cta-banner-section-placeholder",
    path: "./components/cta-banner-section.html",
  },
  { id: "faq-section-placeholder", path: "./components/faq-section.html" },
  { id: "footer-placeholder", path: "./components/footer.html" },
];

// 3. نقطة البداية: تحميل كل الـ Components أولاً ثم تشغيل جميع الحركات التفاعلية
document.addEventListener("DOMContentLoaded", async () => {
  // انتظار تحميل جميع ملفات الـ HTML بالكامل
  await Promise.all(
    componentsList.map((comp) => loadComponent(comp.id, comp.path)),
  );

  // تشغيل جميع الأكواد التفاعلية بعد أن أصبحت كل العناصر موجودة في الصفحة
  initNavbarEvents();
  initCounterAnimation();
  initAudioWaves();
  initTestimonialsSlider();
  initFaqAccordion();
});

// ================= الدوال التفاعلية (تعمل بعد انتهاء الـ fetch) =================

// أ) تفاعلات الـ Navbar (اللغة + الروابط + قائمة الموبايل)
function initNavbarEvents() {
  // 1. تفعيل زر التبديل بين اللغتين ES و EN
  const langButtons = document.querySelectorAll(".lang-btn");
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      langButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // 2. تفعيل التبديل بين عناصر القائمة العلوية وتحديد الرابط النشط تلقائياً
  const navLinks = document.querySelectorAll(".nav-links li a");
  const navToggle = document.getElementById("navToggle");
  const navLinksContainer = document.querySelector(".nav-links");

  // تحديد الرابط النشط تلقائياً حسب الصفحة المفتوحة
  const getPage = (path) => {
    const page = path
      .split("?")[0]
      .split("#")[0]
      .split("/")
      .pop()
      .toLowerCase();
    return page === "" ? "index.html" : page;
  };

  // صفحات فرعية تتبع لينك معين في الـ nav
  const pageAliases = {
    "single-course.html": "courses.html",
    // "single-blog.html": "blogs.html",
  };

  const currentPage = getPage(window.location.pathname);
  const activePage = pageAliases[currentPage] || currentPage;

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    link.classList.toggle("active", getPage(href) === activePage);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      // منع الانتقال فقط إذا كان الرابط مجرد # تجريبي
      if (!href || href === "#") {
        e.preventDefault();
        navLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
      }

      // إغلاق القائمة في الموبايل عند الضغط على أي رابط
      if (navLinksContainer && navLinksContainer.classList.contains("active")) {
        navLinksContainer.classList.remove("active");
        if (navToggle) {
          navToggle.classList.remove("active");
          navToggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  });

  // 3. فتح وإغلاق قائمة الموبايل (Mobile Nav Toggle)
  if (navToggle && navLinksContainer) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = navLinksContainer.classList.toggle("active");
      navToggle.classList.toggle("active");
      navToggle.setAttribute("aria-expanded", isActive ? "true" : "false");
    });

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener("click", (e) => {
      const navbarEl = document.querySelector(".navbar");
      if (
        navLinksContainer.classList.contains("active") &&
        navbarEl &&
        !navbarEl.contains(e.target)
      ) {
        navLinksContainer.classList.remove("active");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    // إغلاق القائمة تلقائياً عند تكبير الشاشة لأكثر من 992px
    window.addEventListener("resize", () => {
      if (
        window.innerWidth > 992 &&
        navLinksContainer.classList.contains("active")
      ) {
        navLinksContainer.classList.remove("active");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
}

// ب) تشغيل عداد 86% عند الوصول للقسم الثاني
function initCounterAnimation() {
  const statNumber = document.querySelector(".stat-number");

  if (statNumber) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = parseInt(statNumber.getAttribute("data-target"), 10);
            let count = 0;
            const duration = 1000;
            const stepTime = Math.max(Math.floor(duration / target), 15);

            const timer = setInterval(() => {
              count += 2;
              if (count >= target) {
                statNumber.textContent = target + "%";
                clearInterval(timer);
              } else {
                statNumber.textContent = count + "%";
              }
            }, stepTime);

            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(statNumber);
  }
}

// ج) الموجات الصوتية في كروت القسم الثالث + تشغيل الصوت فعلياً
function initAudioWaves() {
  const barHeights = [
    10, 6, 15, 8, 18, 11, 20, 9, 14, 10, 13, 7, 14, 6, 17, 10, 12, 6, 16, 9, 15,
    7,
  ];

  const PAUSE_SVG = `
    <svg class="icon-pause" viewBox="0 0 24 24" fill="none">
      <path d="M8 5V19M16 5V19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`;

  const waves = document.querySelectorAll(".audio-wave");

  const pauseOthers = (current) => {
    waves.forEach((w) => {
      const a = w.querySelector(".step-audio");
      if (a && a !== current && !a.paused) a.pause();
    });
  };

  waves.forEach((wave) => {
    const barsContainer = wave.querySelector(".wave-bars");
    const playBtn = wave.querySelector(".wave-play-btn");
    const audio = wave.querySelector(".step-audio");
    const initialActive = parseInt(
      wave.getAttribute("data-active-bars") || "11",
      10,
    );

    // بناء الأعمدة
    barsContainer.innerHTML = "";
    const bars = barHeights.map((height) => {
      const bar = document.createElement("span");
      bar.className = "wave-bar";
      bar.style.height = `${height}px`;
      barsContainer.appendChild(bar);
      return bar;
    });

    // رسم التقدم: عدد الأعمدة النشطة
    const paint = (count) =>
      bars.forEach((bar, i) => {
        bar.classList.toggle("active", i < count);
        bar.classList.toggle("inactive", i >= count);
      });

    paint(initialActive); // الشكل الافتراضي زي التصميم

    if (!audio || !playBtn) return;

    playBtn.insertAdjacentHTML("beforeend", PAUSE_SVG);

    // Play / Pause
    playBtn.addEventListener("click", async () => {
      if (audio.paused) {
        pauseOthers(audio);
        try {
          await audio.play();
        } catch (err) {
          console.warn("تأكد من مسار ملف الصوت:", audio.src, err);
        }
      } else {
        audio.pause();
      }
    });

    // حالة الزر تتبع حالة الـ audio الحقيقية
    audio.addEventListener("play", () => {
      wave.classList.add("playing");
      playBtn.setAttribute("aria-label", "Pause audio");
    });
    audio.addEventListener("pause", () => {
      wave.classList.remove("playing");
      playBtn.setAttribute("aria-label", "Play audio");
    });
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      paint(initialActive);
    });

    // الموجة تتقدم مع الوقت الفعلي
    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      paint(Math.round((audio.currentTime / audio.duration) * bars.length));
    });

    // الضغط على الموجة = تقديم/تأخير (seek)
    barsContainer.addEventListener("click", (e) => {
      if (!audio.duration) return;
      const rect = barsContainer.getBoundingClientRect();
      let ratio = (e.clientX - rect.left) / rect.width;
      if (getComputedStyle(barsContainer).direction === "rtl")
        ratio = 1 - ratio;
      ratio = Math.min(Math.max(ratio, 0), 1);
      audio.currentTime = ratio * audio.duration;
      paint(Math.round(ratio * bars.length));
    });
  });
}

// د) تفاعلات سكشن الأسئلة الشائعة (FAQ Accordion)
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector(".faq-question");
    const icon = item.querySelector(".faq-icon");

    if (!questionBtn) return;

    questionBtn.addEventListener("click", () => {
      const isAlreadyActive = item.classList.contains("active");

      faqItems.forEach((otherItem) => {
        otherItem.classList.remove("active");
        const otherIcon = otherItem.querySelector(".faq-icon");
        if (otherIcon) otherIcon.textContent = "+";
      });

      if (!isAlreadyActive) {
        item.classList.add("active");
        if (icon) icon.textContent = "−";
      }
    });
  });
}

// هـ) تفاعلات سكشن آراء العملاء (5 Cards Carousel)
function initTestimonialsSlider() {
  const cards = Array.from(document.querySelectorAll(".testim-card"));
  const prevBtn = document.getElementById("testimPrevBtn");
  const nextBtn = document.getElementById("testimNextBtn");

  if (cards.length !== 5) return;

  let positions = [0, 1, 2, 3, 4];

  function applyPositions() {
    cards.forEach((card, index) => {
      card.classList.remove("pos-0", "pos-1", "pos-2", "pos-3", "pos-4");
      card.classList.add(`pos-${positions[index]}`);
    });
  }

  applyPositions();

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      positions = positions.map((pos) => (pos + 1) % 5);
      applyPositions();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      positions = positions.map((pos) => (pos - 1 + 5) % 5);
      applyPositions();
    });
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      const currentPos = positions[index];
      if (currentPos === 2) return;

      const diff = (2 - currentPos + 5) % 5;
      positions = positions.map((pos) => (pos + diff) % 5);
      applyPositions();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // 1. استدعاء النافبار بالـ ID الخاص بها
  await loadNavbarComponent();

  // 2. تفعيل التبديل بين Monthly plan و Lesson package
  const tabButtons = document.querySelectorAll(".pricing-tab-btn");
  const billingInfoText = document.getElementById("billingInfoText");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const tabType = btn.getAttribute("data-tab");

      // تغيير النصوص داخل الصندوق بناءً على التبويب المختار
      if (tabType === "package") {
        billingInfoText.textContent =
          "One-time payment for the selected lesson package. Valid for 6 months from purchase date.";
      } else {
        billingInfoText.textContent =
          "Billed every 4 weeks automatically. Free lesson rescheduling with 12h notice.";
      }
    });
  });

  // 3. تفعيل الأزرار (Pills & Days Selection) داخل الصندوق
  setupSelectionGroup("#durationOptions", ".option-pill");
  setupSelectionGroup("#teacherOptions", ".option-pill");
  setupSelectionGroup("#daysOptions", ".day-num-btn");
});

// دالة جلب النافبار بالـ ID
async function loadNavbarComponent() {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  try {
    const response = await fetch("./components/navbar.html");
    if (!response.ok) throw new Error("فشل تحميل الـ Navbar");
    const html = await response.text();
    placeholder.outerHTML = html;
  } catch (error) {
    console.error("خطأ في استدعاء النافبار:", error);
  }
}

// دالة مساعدة لتفعيل الأزرار (Active State) عند الضغط عليها
function setupSelectionGroup(containerSelector, itemSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const items = container.querySelectorAll(itemSelector);
  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // 1. استدعاء الـ Navbar بالـ ID
  await loadNavbarComponent();

  // 2. التبديل بين Monthly plan و Lesson package
  const tabBtns = document.querySelectorAll(".pricing-tab-btn");
  const views = document.querySelectorAll(".plan-view-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const targetId = btn.getAttribute("data-target");
      views.forEach((view) => {
        view.classList.toggle("active", view.id === targetId);
      });
    });
  });

  // 3. تفعيل أزرار الاختيار في التبويب الأول والمشترك
  setupSingleSelect("#durationOptions", ".duration-btn");
  setupSingleSelect("#teacherOptions", ".teacher-btn");
  setupSingleSelect("#daysOptions", ".day-num-btn");

  // 4. تفاعلات عداد الدروس والباقات في التبويب الثاني (Lesson package)
  let lessonCount = 0;
  const countDisplay = document.getElementById("lessonCountDisplay");
  const counterTitleText = document.getElementById("counterTitleText");
  const decreaseBtn = document.getElementById("decreaseLessonsBtn");
  const increaseBtn = document.getElementById("increaseLessonsBtn");
  const presetCards = document.querySelectorAll(".package-preset-card");

  function updateLessonUI(newCount) {
    lessonCount = Math.max(0, newCount);
    countDisplay.textContent = lessonCount;
    counterTitleText.textContent = `${lessonCount} lessons`;

    // تحديد الكارت المطابق للعدد إن وجد
    presetCards.forEach((card) => {
      const cardLessons = parseInt(card.getAttribute("data-lessons"), 10);
      card.classList.toggle("active", cardLessons === lessonCount);
    });
  }

  if (increaseBtn && decreaseBtn) {
    increaseBtn.addEventListener("click", () =>
      updateLessonUI(lessonCount + 1),
    );
    decreaseBtn.addEventListener("click", () =>
      updateLessonUI(lessonCount - 1),
    );
  }

  presetCards.forEach((card) => {
    card.addEventListener("click", () => {
      const selectedLessons = parseInt(card.getAttribute("data-lessons"), 10);
      updateLessonUI(selectedLessons);
    });
  });

  // 5. فتح وإغلاق المربع المنبثق (Modal) في منتصف الشاشة عند الضغط على Confirm
  const confirmBtn = document.getElementById("confirmSubBtn");
  const modal = document.getElementById("subscriptionModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  if (confirmBtn && modal) {
    confirmBtn.addEventListener("click", () => {
      modal.classList.add("active");
    });

    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });

    // إغلاق المربع عند الضغط على الخلفية الشفافة خارج المربع
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  }
});

// دالة جلب الـ Navbar وتنظيف أي سكريبت من Live Server
async function loadNavbarComponent() {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  try {
    const response = await fetch("./components/navbar.html");
    if (!response.ok) throw new Error("فشل تحميل الـ Navbar");
    let html = await response.text();
    html = html.replace(
      /<!-- Code injected by live-server -->[\s\S]*?<\/script>/gi,
      "",
    );
    placeholder.outerHTML = html;
  } catch (error) {
    console.error("خطأ في استدعاء النافبار:", error);
  }
}

// دالة لتبديل الكلاس النشط بين مجموعة أزرار
function setupSingleSelect(containerSelector, buttonSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const buttons = container.querySelectorAll(buttonSelector);
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

// إزالة كلاس active لإخفاء المربع
const finalConfirmBtn = document.getElementById("finalConfirmBtn");
const modal = document.getElementById("subscriptionModal");

if (finalConfirmBtn && modal) {
  finalConfirmBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. تفعيل التبديل بين أزرار الاختيار (Who will be learning & Preferred teacher)
  const pillGroups = document.querySelectorAll(".pill-group");

  pillGroups.forEach((group) => {
    const buttons = group.querySelectorAll(".pill-btn");
    const groupName = group.getAttribute("data-group");
    const hiddenInput = document.getElementById(`${groupName}Input`);

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        if (hiddenInput) {
          hiddenInput.value = btn.getAttribute("data-value");
        }
      });
    });
  });

  // 2. تجهيز زر Send Your Information لفتح الـ Modal لاحقاً
  const contactForm = document.getElementById("contactTrialForm");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // هنا سيتم استدعاء وإظهار المربع المنبثق (Modal) في نص الشاشة عندما نجهزه
      console.log("Form submitted! Ready to trigger centered modal.");
    });
  }
});

// 1. تبديل أزرار الاختيار (Pills)
document.querySelectorAll(".pill-btn").forEach((btn) => {
  btn.onclick = () => {
    btn.parentElement.querySelector(".active")?.classList.remove("active");
    btn.classList.add("active");
  };
});

// 2. إظهار وإخفاء المربع المنبثق (Modal)
const ModalOverlay = document.getElementById("successModalOverlay");

document.getElementById("contactTrialForm").onsubmit = (e) => {
  e.preventDefault();
  ModalOverlay.classList.add("active");
};

document.getElementById("closeModalBtn").onclick = () => {
  ModalOverlay.classList.remove("active");
};

// صفحة ال single-blog

const steps = document.querySelectorAll(".article-step-block");
const tocLinks = document.querySelectorAll(".toc-link");

const setActive = (id) => {
  tocLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
};

// 1. التفعيل التلقائي عند ظهور السكشن على الشاشة (Scroll Spy)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  },
  { rootMargin: "-20% 0px -65% 0px" },
);

steps.forEach((step) => observer.observe(step));

// 2. التفعيل الفوري عند الضغط على الرابط في القائمة
tocLinks.forEach((link) => {
  link.onclick = () => setActive(link.getAttribute("href").slice(1));
});

const termsBlocks = document.querySelectorAll(".terms-block");
const toLinksII = document.querySelectorAll(".terms-toc-link");

const setActiveTerm = (id) => {
  toLinksII.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
};

// 1. التفعيل التلقائي في الفهرس عند ظهور البند على الشاشة أثناء الـ Scroll
const observerII = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveTerm(entry.target.id);
    });
  },
  { rootMargin: "-20% 0px -65% 0px" },
);

termsBlocks.forEach((block) => observerII.observe(block));

// 2. التفعيل الفوري عند الضغط على البند في الفهرس
toLinksII.forEach((link) => {
  link.onclick = () => setActiveTerm(link.getAttribute("href").slice(1));
});

// ================= Contact page: Custom Select + Date/Time Picker =================

const initCustomSelect = () => {
  const root = document.getElementById("courseSelect");
  if (!root) return;
  const trigger = root.querySelector(".cs-trigger");
  const label = root.querySelector(".cs-value");
  const input = root.querySelector("input[type=hidden]");

  const setOpen = (open) => {
    root.classList.toggle("open", open);
    trigger.setAttribute("aria-expanded", open);
  };

  trigger.addEventListener("click", () =>
    setOpen(!root.classList.contains("open")),
  );

  root.querySelectorAll(".cs-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      root
        .querySelectorAll(".cs-option")
        .forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
      label.textContent = opt.textContent;
      input.value = opt.dataset.value;
      setOpen(false);
    });
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) setOpen(false);
  });
};

const initDateTimePicker = () => {
  const root = document.getElementById("dtPicker");
  if (!root) return;

  const trigger = root.querySelector(".cs-trigger");
  const label = root.querySelector(".cs-value");
  const input = root.querySelector("input[type=hidden]");
  const title = root.querySelector(".dt-title");
  const daysEl = root.querySelector(".dt-days");
  const hoursEl = root.querySelector(".dt-hours");
  const minutesEl = root.querySelector(".dt-minutes");
  const periodBtns = root.querySelectorAll(".dt-per");
  const confirmBtn = root.querySelector(".dt-confirm");
  const prevBtn = root.querySelector('[data-nav="prev"]');
  const nextBtn = root.querySelector('[data-nav="next"]');
  const continueBtn = root.querySelector(".dt-continue");
  const backBtn = root.querySelector(".dt-back");
  const pickedDateEl = root.querySelector(".dt-picked-date");
  const stepDate = root.querySelector('[data-step="date"]');
  const stepTime = root.querySelector('[data-step="time"]');

  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;
  let selectedHour = null;
  let selectedMinute = "00";
  let selectedPeriod = "AM";

  const showStep = (step) => {
    stepDate.hidden = step !== "date";
    stepTime.hidden = step !== "time";
  };

  const setOpen = (open) => {
    root.classList.toggle("open", open);
    trigger.setAttribute("aria-expanded", open);
    if (open) showStep("date");
  };

  const renderCalendar = () => {
    title.textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
    prevBtn.disabled =
      view.getFullYear() === today.getFullYear() &&
      view.getMonth() === today.getMonth();
    daysEl.innerHTML = "";

    const firstDay = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
    const total = new Date(
      view.getFullYear(),
      view.getMonth() + 1,
      0,
    ).getDate();

    for (let i = 0; i < firstDay; i++)
      daysEl.appendChild(document.createElement("span"));

    for (let d = 1; d <= total; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dt-day";
      btn.textContent = d;
      btn.disabled = date < today;
      if (date.getTime() === today.getTime()) btn.classList.add("today");
      if (selectedDate && date.getTime() === selectedDate.getTime())
        btn.classList.add("active");

      btn.addEventListener("click", () => {
        selectedDate = date;
        continueBtn.disabled = false;
        renderCalendar();
      });
      daysEl.appendChild(btn);
    }
  };

  const formatDate = (d) =>
    `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;

  const renderTimes = () => {
    hoursEl.innerHTML = "";
    for (let h = 1; h <= 12; h++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dt-time";
      btn.textContent = h;
      if (h === selectedHour) btn.classList.add("active");
      btn.addEventListener("click", () => {
        selectedHour = h;
        renderTimes();
      });
      hoursEl.appendChild(btn);
    }

    minutesEl.innerHTML = "";
    ["00", "15", "30", "45"].forEach((m) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dt-time";
      btn.textContent = `:${m}`;
      if (m === selectedMinute) btn.classList.add("active");
      btn.addEventListener("click", () => {
        selectedMinute = m;
        renderTimes();
      });
      minutesEl.appendChild(btn);
    });

    periodBtns.forEach((b) =>
      b.classList.toggle("active", b.dataset.period === selectedPeriod),
    );
    confirmBtn.disabled = selectedHour === null;
  };

  periodBtns.forEach((b) =>
    b.addEventListener("click", () => {
      selectedPeriod = b.dataset.period;
      renderTimes();
    }),
  );

  confirmBtn.addEventListener("click", () => {
    const value = `${formatDate(selectedDate)} · ${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    input.value = value;
    label.textContent = value;
    label.classList.remove("placeholder");
    setOpen(false);
  });

  trigger.addEventListener("click", () =>
    setOpen(!root.classList.contains("open")),
  );

  prevBtn.addEventListener("click", () => {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    renderCalendar();
  });

  continueBtn.addEventListener("click", () => {
    pickedDateEl.textContent = formatDate(selectedDate);
    renderTimes();
    showStep("time");
  });

  backBtn.addEventListener("click", () => showStep("date"));

  document.addEventListener("click", (e) => {
    if (!e.composedPath().includes(root)) setOpen(false);
  });

  renderCalendar();
};

document.addEventListener("DOMContentLoaded", () => {
  initCustomSelect();
  initDateTimePicker();
});
