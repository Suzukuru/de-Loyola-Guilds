// Keep functions available to inline HTML handlers (non-module script).
(() => {
  // Global State
  const favoritedClubs = {};
  window.favoritedClubs = favoritedClubs;
 
  function toggleDarkMode() {
    document.body.classList.toggle("global-dark-mode");
  }
 
  function toggleSidebar() {
    document.getElementById("sidebar")?.classList.toggle("collapsed");
  }
 
  function clearBodyThemes() {
    [...document.body.classList].forEach((cls) => {
      if (cls.startsWith("theme-")) document.body.classList.remove(cls);
    });
  }

  function getThemeClassFromElement(el) {
    if (!el) return null;
    return [...el.classList].find((cls) => cls.startsWith("theme-")) ?? null;
  }

  function applyThemeForPage(targetPage) {
    clearBodyThemes();
    const themeClass = getThemeClassFromElement(targetPage);
    if (themeClass) document.body.classList.add(themeClass);
  }

  function switchPage(pageId, navElement = null) {
    const pages = document.querySelectorAll(".page-container");
    pages.forEach((page) => page.classList.remove("active"));
 
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => item.classList.remove("active"));
 
    if (navElement) navElement.classList.add("active");
 
   // Special handling for login-only layout and North Star reset
   if (pageId === "login") {
     document.body.classList.add("login-only");
   } else {
     document.body.classList.remove("login-only");
   }
   if (pageId === "north-star") {
     resetNorthStar();
   }

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add("active");
      applyThemeForPage(targetPage);
    } else {
      clearBodyThemes();
    }
  }
 
  function filterClubs() {
    const searchText = (document.getElementById("searchInput")?.value ?? "").toLowerCase();
    const categoryText = document.getElementById("categorySelect")?.value ?? "All";
    const cards = document.querySelectorAll(".club-card");
 
    cards.forEach((card) => {
      const title = (card.getAttribute("data-title") ?? "").toLowerCase();
      const category = card.getAttribute("data-category") ?? "";
 
      const matchesSearch = title.includes(searchText);
      const matchesCategory = categoryText === "All" || category === categoryText;
 
      card.style.display = matchesSearch && matchesCategory ? "flex" : "none";
    });
  }
 
  function toggleMenu(evt, clubId) {
    evt?.stopPropagation();
    closeAllMenus();
    const menu = document.getElementById(`menu-${clubId}`);
    menu?.classList.toggle("active");
  }
 
  function closeAllMenus() {
    document.querySelectorAll(".card-menu-dropdown").forEach((menu) => menu.classList.remove("active"));
  }
 
  function toggleFavorite(evt, clubId, title, pageId) {
    evt?.stopPropagation();
    closeAllMenus();
 
    if (favoritedClubs[clubId]) {
      delete favoritedClubs[clubId];
      const el = document.getElementById(`fav-text-${clubId}`);
      if (el) el.innerText = "Favorite";
    } else {
      favoritedClubs[clubId] = { title, pageId };
      const el = document.getElementById(`fav-text-${clubId}`);
      if (el) el.innerText = "Unfavorite";
    }
 
    renderFavoritesList();
  }
 
  function renderFavoritesList() {
      const list = document.getElementById("favorites-list");
      const badge = document.getElementById("my-clubs-badge");
      if (!list || !badge) return;

      list.innerHTML = "";
      let count = 0;

      for (const [clubId, data] of Object.entries(favoritedClubs)) {
        count++;
        const li = document.createElement("li");
        li.className = "fav-item";
        li.setAttribute("data-club-id", clubId);
        li.title = "Click to open · Right-click to unfavorite";
        li.onclick = () => switchPage(data.pageId);
        li.oncontextmenu = (e) => {
          e.preventDefault();
          toggleFavorite({ stopPropagation() {} }, clubId, data.title, data.pageId);
        };
        li.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> ${data.title}`;
        list.appendChild(li);
      }

      badge.innerText = String(count);
      renderGlobalCalendar();
    }
 
  // --- NEW CLUB PAGE SCRIPTS ---
  function switchTab(clubId, tabName, btnElement) {
    // Update buttons
    const buttons = btnElement?.parentElement?.querySelectorAll(".tab-btn") ?? [];
    buttons.forEach((btn) => btn.classList.remove("active"));
    btnElement?.classList.add("active");
 
    // Update content
    const tabs = document.querySelectorAll(`#club-details-${clubId} .tab-content`);
    tabs.forEach((tab) => tab.classList.remove("active"));
    document.getElementById(`tab-${clubId}-${tabName}`)?.classList.add("active");
  }
 
  function filterGallery(clubId, year, btnElement) {
    // Update filter buttons
    const buttons = btnElement?.parentElement?.querySelectorAll(".filter-btn") ?? [];
    buttons.forEach((btn) => btn.classList.remove("active"));
    btnElement?.classList.add("active");
 
    // Filter images
    const gallery = document.getElementById(`gallery-${clubId}`);
    if (!gallery) return;
 
    gallery.querySelectorAll(".gallery-item").forEach((item) => {
      const matches = year === "all" || item.getAttribute("data-year") === year;
      item.style.display = matches ? "block" : "none";
    });
  }
 
  function login(evt) {
   evt?.preventDefault?.();
   window.isLoggedIn = true;
   // After login, land on the Site Home page instead of Dashboard
   switchPage("site-home", document.getElementById("nav-site-home"));
   renderGlobalCalendar();
  }

  // ------- Global 2026 calendar (favorites) -------
  const GLOBAL_CAL_YEAR = 2026;
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const clubEventSources = [
    { clubId: "cw", clubTitle: "Computer Wizards Club", date: "2026-02-10", title: "Intro to AI Bootcamp" },
    { clubId: "cw", clubTitle: "Computer Wizards Club", date: "2026-03-15", title: "Web Dev Workshop" },
    { clubId: "cw", clubTitle: "Computer Wizards Club", date: "2026-05-08", title: "Industry Speaker Series" },
    { clubId: "cw", clubTitle: "Computer Wizards Club", date: "2026-09-20", title: "Tech Week (Sep 20–24)" },
    { clubId: "cw", clubTitle: "Computer Wizards Club", date: "2026-09-21", title: "Blue Hacks Hackathon" },
    { clubId: "knights", clubTitle: "Knights Yearbook", date: "2026-02-05", title: "Cover Design Workshop" },
    { clubId: "knights", clubTitle: "Knights Yearbook", date: "2026-03-05", title: "Portrait Shoot Day" },
    { clubId: "knights", clubTitle: "Knights Yearbook", date: "2026-04-12", title: "Senior Interview Day" },
    { clubId: "knights", clubTitle: "Knights Yearbook", date: "2026-11-18", title: "Layout Sprint (Nov 18–22)" },
    { clubId: "knights", clubTitle: "Knights Yearbook", date: "2026-11-20", title: "Layout Submission" },
    { clubId: "rcy", clubTitle: "Red Cross Youth", date: "2026-04-20", title: "First Aid Certification" },
    { clubId: "rcy", clubTitle: "Red Cross Youth", date: "2026-06-12", title: "Campus Blood Drive" },
    { clubId: "rcy", clubTitle: "Red Cross Youth", date: "2026-08-15", title: "Disaster Prep Workshop" },
    { clubId: "rcy", clubTitle: "Red Cross Youth", date: "2026-10-10", title: "Community Outreach (Oct 10–14)" },
    { clubId: "rcy", clubTitle: "Red Cross Youth", date: "2026-12-05", title: "Life Support Seminar" },
    { clubId: "drawing", clubTitle: "Kamay Atenista", date: "2026-02-15", title: "Figure Drawing Session" },
    { clubId: "drawing", clubTitle: "Kamay Atenista", date: "2026-04-05", title: "Digital Art Workshop" },
    { clubId: "drawing", clubTitle: "Kamay Atenista", date: "2026-06-20", title: "Sketch Crawl" },
    { clubId: "drawing", clubTitle: "Kamay Atenista", date: "2026-08-08", title: "Art Exhibit Prep (Aug 8–12)" },
    { clubId: "drawing", clubTitle: "Kamay Atenista", date: "2026-08-10", title: "Gallery Night" },
    { clubId: "band", clubTitle: "Ateneo Blue Band", date: "2026-02-01", title: "Sectionals – Brass" },
    { clubId: "band", clubTitle: "Ateneo Blue Band", date: "2026-03-07", title: "Full Band Rehearsal" },
    { clubId: "band", clubTitle: "Ateneo Blue Band", date: "2026-03-16", title: "Halftime Performance" },
    { clubId: "band", clubTitle: "Ateneo Blue Band", date: "2026-05-15", title: "Spring Concert" },
    { clubId: "band", clubTitle: "Ateneo Blue Band", date: "2026-09-25", title: "Band Camp (Sep 25–29)" }
  ];

  const globalCalState = { month: 0 }; // January
  const CLUB_CAL_YEAR = GLOBAL_CAL_YEAR;

  function getMonthEvents(year, month, onlyFavorited = true) {
    const results = [];
    clubEventSources.forEach((ev) => {
      const d = new Date(ev.date + "T00:00:00");
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      if (onlyFavorited && !favoritedClubs[ev.clubId]) return;
      results.push({ ...ev, day: d.getDate() });
    });
    return results;
  }

  function renderGlobalCalendar() {
    const grid = document.getElementById("global-calendar-grid");
    const label = document.getElementById("global-cal-label");
    const eventsPane = document.getElementById("global-calendar-events");
    if (!grid || !label || !eventsPane) return;

    const year = GLOBAL_CAL_YEAR;
    const month = globalCalState.month;
    label.textContent = `${monthNames[month]} ${year}`;

    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthEvents = getMonthEvents(year, month, true);
    const eventsByDay = {};
    monthEvents.forEach((ev) => {
      if (!eventsByDay[ev.day]) eventsByDay[ev.day] = [];
      eventsByDay[ev.day].push(ev);
    });

    grid.innerHTML = "";
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    dayNames.forEach((d) => {
      const h = document.createElement("div");
      h.className = "cal-day-header";
      h.textContent = d;
      grid.appendChild(h);
    });

    const totalCells = 42;
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement("div");
      cell.className = "cal-cell";
      const dayNum = i - startDay + 1;
      if (dayNum > 0 && dayNum <= daysInMonth) {
        cell.textContent = String(dayNum);
        const evs = eventsByDay[dayNum];
        if (evs && evs.length) {
          cell.classList.add("event-highlight");
          const tip = document.createElement("div");
          tip.className = "event-tooltip";
          evs.forEach((ev) => {
            const h4 = document.createElement("h4");
            h4.textContent = ev.title;
            const loc = document.createElement("span");
            loc.className = "loc";
            loc.textContent = ev.clubTitle;
            tip.appendChild(h4);
            tip.appendChild(loc);
          });
          cell.appendChild(tip);
        }
      }
      grid.appendChild(cell);
    }

    eventsPane.innerHTML = "<h3>Events</h3>";
    if (!monthEvents.length) {
      const empty = document.createElement("div");
      empty.className = "event-detail";
      empty.textContent = "No favorite-club events this month.";
      eventsPane.appendChild(empty);
      return;
    }
    monthEvents
      .sort((a, b) => a.day - b.day || a.clubTitle.localeCompare(b.clubTitle))
      .forEach((ev) => {
        const card = document.createElement("div");
        card.className = "event-card";
        const badge = document.createElement("span");
        badge.className = "event-badge";
        badge.textContent = ev.clubTitle;
        const title = document.createElement("div");
        title.className = "event-title";
        title.textContent = ev.title;
        const detail = document.createElement("div");
        detail.className = "event-detail";
        detail.textContent = `${monthNames[month]} ${ev.day}, ${year}`;
        card.appendChild(badge);
        card.appendChild(title);
        card.appendChild(detail);
        eventsPane.appendChild(card);
      });
  }

  function changeGlobalMonth(delta) {
    let m = globalCalState.month + delta;
    if (m < 0) m = 11;
    if (m > 11) m = 0;
    globalCalState.month = m;
    renderGlobalCalendar();
  }

  // ------- Per-club 2026 calendars -------
  const clubCalState = {
    cw: { month: 0 },
    knights: { month: 0 },
    rcy: { month: 0 },
    drawing: { month: 0 },
    band: { month: 0 },
  };

  const clubCalEvents = {
    cw: [
      { month: 1, day: 10, title: "Intro to AI & Machine Learning", detail: "Hands-on workshop for new members." },
      { month: 2, day: 15, title: "Web Dev Workshop", detail: "HTML, CSS, and JavaScript fundamentals." },
      { month: 4, day: 8, title: "Industry Speaker Series", detail: "Guest from local tech companies." },
      { month: 8, day: 20, title: "Tech Week (Sep 20–24)", detail: "Five-day tech talks and workshops." },
      { month: 8, day: 24, title: "CodeFest Hackathon 2026", detail: "24-hour campus hackathon." },
      { month: 8, day: 5, title: "Game Dev Jam", detail: "Build a game in a weekend." },
    ],
    knights: [
      { month: 1, day: 5, title: "Cover Design Workshop", detail: "Learn layout and typography." },
      { month: 2, day: 5, title: "Portrait Shoot Day", detail: "Formal portraits for seniors." },
      { month: 2, day: 13, title: "Layout Sprint", detail: "Spread design work session." },
      { month: 3, day: 12, title: "Senior Interview Day", detail: "Q&A with graduating class." },
      { month: 10, day: 18, title: "Layout Sprint (Nov 18–22)", detail: "Final layout push before print." },
      { month: 10, day: 20, title: "Yearbook Final Review", detail: "Final editorial checks." },
    ],
    rcy: [
      { month: 3, day: 20, title: "First Aid Certification", detail: "CPR and basic life support." },
      { month: 5, day: 12, title: "Campus Blood Drive", detail: "Whole-day blood donation activity." },
      { month: 7, day: 3, title: "Disaster Response Drill", detail: "Simulation with local responders." },
      { month: 7, day: 15, title: "Disaster Prep Workshop", detail: "Emergency kit and evacuation." },
      { month: 9, day: 10, title: "Community Outreach (Oct 10–14)", detail: "Five-day barangay health drive." },
      { month: 11, day: 5, title: "Life Support Seminar", detail: "Advanced first aid training." },
    ],
    drawing: [
      { month: 0, day: 15, title: "Figure Drawing Night", detail: "Live model sketching." },
      { month: 3, day: 5, title: "Digital Art Workshop", detail: "Procreate and Photoshop basics." },
      { month: 5, day: 20, title: "Sketch Crawl", detail: "Campus-wide drawing walk." },
      { month: 7, day: 8, title: "Art Exhibit Prep (Aug 8–12)", detail: "Five-day setup and curation." },
      { month: 7, day: 18, title: "Gallery Showcase", detail: "Exhibit of member works." },
      { month: 10, day: 2, title: "Zine Making Jam", detail: "Create and print mini zines." },
    ],
    band: [
      { month: 1, day: 1, title: "Sectionals – Brass", detail: "Brass section practice." },
      { month: 2, day: 7, title: "Full Band Rehearsal", detail: "Run-through for halftime show." },
      { month: 2, day: 16, title: "Halftime Performance", detail: "Performance at home game." },
      { month: 4, day: 15, title: "Spring Concert", detail: "End-of-year recital." },
      { month: 8, day: 25, title: "Band Camp (Sep 25–29)", detail: "Five-day intensive rehearsal." },
      { month: 8, day: 28, title: "Battle of the Bands", detail: "Inter-school competition." },
    ],
  };

  function getClubMonthEvents(clubId, year, month) {
    const source = clubCalEvents[clubId] ?? [];
    return source
      .filter((ev) => ev.month === month)
      .map((ev) => ({ ...ev, day: ev.day, month }));
  }

  function renderClubCalendar(clubId) {
    const state = clubCalState[clubId];
    if (!state) return;
    const grid = document.getElementById(`club-cal-grid-${clubId}`);
    const label = document.getElementById(`club-cal-label-${clubId}`);
    const eventsPane = document.getElementById(`club-cal-events-${clubId}`);
    if (!grid || !label || !eventsPane) return;

    const year = CLUB_CAL_YEAR;
    const month = state.month;
    label.textContent = `${monthNames[month]} ${year}`;

    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthEvents = getClubMonthEvents(clubId, year, month);
    const eventsByDay = {};
    monthEvents.forEach((ev) => {
      if (!eventsByDay[ev.day]) eventsByDay[ev.day] = [];
      eventsByDay[ev.day].push(ev);
    });

    grid.innerHTML = "";
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    dayNames.forEach((d) => {
      const h = document.createElement("div");
      h.className = "cal-day-header";
      h.textContent = d;
      grid.appendChild(h);
    });

    const totalCells = 42;
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement("div");
      cell.className = "cal-cell";
      const dayNum = i - startDay + 1;
      if (dayNum > 0 && dayNum <= daysInMonth) {
        cell.textContent = String(dayNum);
        const evs = eventsByDay[dayNum];
        if (evs && evs.length) {
          cell.classList.add("event-highlight");
          const tip = document.createElement("div");
          tip.className = "event-tooltip";
          evs.forEach((ev) => {
            const h4 = document.createElement("h4");
            h4.textContent = ev.title;
            const loc = document.createElement("span");
            loc.className = "loc";
            loc.textContent = monthNames[month] + " " + ev.day + ", " + year;
            tip.appendChild(h4);
            tip.appendChild(loc);
          });
          cell.appendChild(tip);
        }
      }
      grid.appendChild(cell);
    }

    eventsPane.innerHTML = "<h3>Upcoming Events</h3>";
    if (!monthEvents.length) {
      const empty = document.createElement("div");
      empty.className = "event-detail";
      empty.textContent = "No events scheduled this month.";
      eventsPane.appendChild(empty);
      return;
    }
    monthEvents
      .sort((a, b) => a.day - b.day)
      .forEach((ev) => {
        const card = document.createElement("div");
        card.className = "event-card";
        const badge = document.createElement("span");
        badge.className = "event-badge";
        badge.textContent = monthNames[ev.month];
        const title = document.createElement("div");
        title.className = "event-title";
        title.textContent = ev.title;
        const detail = document.createElement("div");
        detail.className = "event-detail";
        detail.textContent = `${monthNames[ev.month]} ${ev.day}, ${year}`;
        card.appendChild(badge);
        card.appendChild(title);
        card.appendChild(detail);
        eventsPane.appendChild(card);
      });
  }

  function changeClubMonth(clubId, delta) {
    const state = clubCalState[clubId];
    if (!state) return;
    let m = state.month + delta;
    if (m < 0) m = 11;
    if (m > 11) m = 0;
    state.month = m;
    renderClubCalendar(clubId);
  }

  // ------- North Star (matching) -------
  const northStarState = { queue: [], index: 0, matches: [] };
  const nsSelectedCategories = []; // { value, label }
  const nsClubFolderMap = { cw: "computer_wizards", knights: "knights_yearbook", rcy: "red_cross", drawing: "kamay_atenista", band: "blue_band" };
  const northStarClubs = [
    {
      id: "cw",
      title: "Computer Wizards Club",
      pageId: "club-details-cw",
      category: "Technology & Innovation",
      image: "images/COMWIZ.jpg",
      tagline: "Level up your coding, AI, and tech skills with peers who ship real projects."
    },
    {
      id: "knights",
      title: "Knights Yearbook",
      pageId: "club-details-knights",
      category: "Media & Publications",
      image: "images/KNIGHTS.jpg",
      tagline: "Tell the campus story through photography, layout, and editorial work."
    },
    {
      id: "rcy",
      title: "Red Cross Youth",
      pageId: "club-details-rcy",
      category: "Community Service",
      image: "images/RedCross.jpg",
      tagline: "Serve in real emergencies and community drives while earning life-saving skills."
    },
    {
      id: "drawing",
      title: "Kamay Atenista",
      pageId: "club-details-drawing",
      category: "Arts & Design",
      image: "images/KAMAY%20ATENISTA.jpg",
      tagline: "Grow your creative voice with fellow illustrators, painters, and designers."
    },
    {
      id: "band",
      title: "Ateneo Blue Band",
      pageId: "club-details-band",
      category: "Music & Arts",
      image: "images/BlueBand.jpg",
      tagline: "Be the soundtrack of campus life through high-energy performances."
    },
  ];

  function buildNorthStarQueue(categories) {
   if (!categories.length) {
      return [...northStarClubs].sort(() => Math.random() - 0.5);
    }
   const set = new Set(categories);
    const matched = northStarClubs.filter((club) => set.has(club.category));
    if (matched.length) return matched.sort(() => Math.random() - 0.5);
    return [...northStarClubs].sort(() => Math.random() - 0.5);
  }

  function renderNsSelectedCategories() {
   const chips = document.getElementById("ns-selected-cats");
   if (!chips) return;
   if (!nsSelectedCategories.length) {
     chips.innerHTML = "No interests selected yet \u2013 we\u2019ll consider all clubs.";
     return;
   }
   chips.innerHTML = "";
   nsSelectedCategories.forEach((cat) => {
     const span = document.createElement("span");
     span.className = "ns-match-card";
     span.textContent = cat.label;
     span.onclick = () => nsRemoveCategory(cat.value);
     chips.appendChild(span);
   });
  }

  function nsAddCategory() {
   const select = document.getElementById("ns-category-select");
   if (!select) return;
   const value = select.value;
   const label = select.options[select.selectedIndex]?.text || "";
   if (!value || nsSelectedCategories.some((c) => c.value === value)) return;
   nsSelectedCategories.push({ value, label });

   // Update chips
   renderNsSelectedCategories();

   // Remove selected option from dropdown
   select.remove(select.selectedIndex);
   select.selectedIndex = 0;
  }

  function nsRemoveCategory(value) {
   const select = document.getElementById("ns-category-select");
   if (!select) return;
   const index = nsSelectedCategories.findIndex((c) => c.value === value);
   if (index === -1) return;
   const [removed] = nsSelectedCategories.splice(index, 1);

   // Re-add option to dropdown
   const opt = document.createElement("option");
   opt.value = removed.value;
   opt.textContent = removed.label;
   select.appendChild(opt);

   // Re-render chips
   renderNsSelectedCategories();
  }

  function resetNorthStar() {
   const intro = document.getElementById("ns-intro");
   const view = document.getElementById("ns-current");
   const results = document.getElementById("ns-results");
   const chips = document.getElementById("ns-selected-cats");
   const select = document.getElementById("ns-category-select");
   const row = document.getElementById("ns-matches-row");
   const msg = document.getElementById("ns-matches-msg");
   const footer = document.getElementById("ns-results-footer");

   nsSelectedCategories.length = 0;
   if (select) {
     select.innerHTML = `
        <option value="">Select a category…</option>
        <option value="Technology & Innovation">Technology & Innovation</option>
        <option value="Media & Publications">Media & Publications</option>
        <option value="Community Service">Community Service</option>
        <option value="Arts & Design">Arts & Design</option>
        <option value="Music & Arts">Music & Arts</option>
      `;
     select.selectedIndex = 0;
   }

   if (chips) {
     chips.innerHTML = "No interests selected yet – we’ll consider all clubs.";
   }
   if (row) {
     row.innerHTML = "";
     row.classList.remove("ns-single-row");
   }
   if (msg) msg.innerHTML = "";
   if (footer) footer.innerHTML = "";

   if (intro) intro.style.display = "block";
   if (view) view.style.display = "none";
   if (results) results.style.display = "none";

   northStarState.queue = [];
   northStarState.index = 0;
   northStarState.matches = [];
  }

  function startNorthStar() {
    const view = document.getElementById("ns-current");
    const intro = document.getElementById("ns-intro");
    const results = document.getElementById("ns-results");
    if (!view || !intro || !results) return;

   northStarState.queue = buildNorthStarQueue(nsSelectedCategories.map((c) => c.value));
    northStarState.index = 0;
    northStarState.matches = [];

    intro.style.display = "none";
    results.style.display = "none";
    view.style.display = "block";
    showNorthStarClub();
  }

  function showNorthStarClub() {
   const container = document.getElementById("ns-current-club");
   if (!container) return;
   const club = northStarState.queue[northStarState.index];
   if (!club) {
     showNorthStarResults();
     return;
   }
   const folder = nsClubFolderMap[club.id] || club.id;
   const nsPhoto1 = `club_images/${folder}/1.jpg`;
   const nsPhoto2 = `club_images/${folder}/2.jpg`;
   container.innerHTML = `
      <div class="ns-card ns-card-large">
        <img src="${club.image}" alt="${club.title}" class="ns-card-logo">
        <div class="ns-card-body">
          <div class="ns-card-category">${club.category}</div>
          <h3>${club.title}</h3>
          <p>${club.tagline}</p>
          <div class="ns-card-gallery">
            <img src="${nsPhoto1}" alt="${club.title} highlight 1" class="ns-card-photo" onerror="this.src='images/AteneodeDavao.png'">
            <img src="${nsPhoto2}" alt="${club.title} highlight 2" class="ns-card-photo" onerror="this.src='images/AteneodeDavao.png'">
          </div>
        </div>
      </div>
    `;
  }

  function northStarVote(direction) {
    const club = northStarState.queue[northStarState.index];
    if (!club) return;
    if (direction === "up") {
      if (!favoritedClubs[club.id]) {
        toggleFavorite({ stopPropagation() {} }, club.id, club.title, club.pageId);
      }
      northStarState.matches.push(club);
    }
    northStarState.index += 1;
    if (northStarState.index >= northStarState.queue.length) {
      showNorthStarResults();
    } else {
      showNorthStarClub();
    }
  }

  function showNorthStarResults() {
    const view = document.getElementById("ns-current");
    const results = document.getElementById("ns-results");
    const row = document.getElementById("ns-matches-row");
    const msg = document.getElementById("ns-matches-msg");
   const footer = document.getElementById("ns-results-footer");
   if (!view || !results || !row || !msg) return;

    view.style.display = "none";
   results.style.display = "block";
   results.classList.add("ns-results-visible");
    row.innerHTML = "";
   row.classList.remove("ns-single-row");
   if (footer) footer.innerHTML = "";

    if (!northStarState.matches.length) {
      results.classList.add("ns-no-matches");
      msg.innerHTML = `
        <h2>NO MATCHES FOUND</h2>
        <div style="font-size:40px;margin:16px 0;">:(</div>
        <p>Look in <button class="home-cta-btn" onclick="switchPage('dashboard', document.getElementById('nav-dashboard'))">Dashboard</button> to see all clubs.</p>
      `;
     if (footer) {
       footer.innerHTML = `<button class="home-cta-btn ns-redo-btn" type="button" onclick="resetNorthStar()">Run Matching Again</button>`;
     }
      return;
    }

   results.classList.remove("ns-no-matches");
   msg.innerHTML = `<h2>MATCHES</h2><p>These club(s) have been added to your favorites.</p>`;
   const single = northStarState.matches.length === 1;
   if (single) row.classList.add("ns-single-row");

   northStarState.matches.forEach((club) => {
     const div = document.createElement("div");
     div.className = "ns-match-card ns-match-card-result" + (single ? " ns-single-result" : "");
     div.innerHTML = `
        <article class="ns-match-result-card">
          <img src="${club.image}" alt="${club.title}" class="ns-match-logo">
          <div class="ns-match-body">
            <div class="ns-card-category">${club.category}</div>
            <h3>${club.title}</h3>
            <p>${club.tagline}</p>
            <button class="home-cta-btn ns-match-cta" type="button">View Club</button>
          </div>
        </article>
      `;
     div.querySelector(".ns-match-cta")?.addEventListener("click", (evt) => {
       evt.stopPropagation();
       switchPage(club.pageId);
     });
     div.onclick = () => switchPage(club.pageId);
     row.appendChild(div);
   });

   if (footer) {
     const specialLine = single ? '<p class="ns-single-tagline">The one and only one.</p>' : "";
     footer.innerHTML = `
        ${specialLine}
        <button class="home-cta-btn ns-redo-btn" type="button" onclick="resetNorthStar()">Run Matching Again</button>
      `;
   }
  }

  // Export to window for inline handlers
  window.toggleDarkMode = toggleDarkMode;
  window.toggleSidebar = toggleSidebar;
  window.switchPage = switchPage;
  window.filterClubs = filterClubs;
  window.toggleMenu = toggleMenu;
  window.closeAllMenus = closeAllMenus;
  window.toggleFavorite = toggleFavorite;
  window.renderFavoritesList = renderFavoritesList;
  window.switchTab = switchTab;
  window.filterGallery = filterGallery;
  window.login = login;
  window.changeGlobalMonth = changeGlobalMonth;
  window.changeClubMonth = changeClubMonth;
  window.startNorthStar = startNorthStar;
  window.northStarVote = northStarVote;
  window.nsAddCategory = nsAddCategory;
  window.resetNorthStar = resetNorthStar;

  // Initial calendar renders
  renderGlobalCalendar();
  renderClubCalendar("cw");
  renderClubCalendar("knights");
  renderClubCalendar("rcy");
  renderClubCalendar("drawing");
  renderClubCalendar("band");
 })();
