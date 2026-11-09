/* ==========================================================================
   GESTHALTHOLIK - COMPLETE SITE ENGINE:
   • Dynamic CMS (Site Texts & Content Manager for Nata)
   • Price Manager (Individual, Couples, Group)
   • News & Announcements Manager ("კოდში ქექვის გარეშე")
   • Calendar Engine with Date & Month Selection ("დაჯავშნა ერთხელ")
   • Restricted Developer / Admin Access (PIN / Shortcut / Secret URL)
   • Cloud Sync (Firebase/Supabase REST) + LocalStorage Cache
   • Phone / WhatsApp: +995 599 01 10 09 (599 011 009)
   • Locations: 
       • პლეხანოვი, დავით აღმაშენებლის გამზირი
       • ვაკე, მიხეილ თამარაშვილის ქუჩა
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. SITE CONFIGURATION (Contacts, Prices, Cloud Sync)
// --------------------------------------------------------------------------
const DEFAULT_CONFIG = {
  phoneDisplay: '599 011 009',
  phoneFull: '+995 599 01 10 09',
  phoneRaw: '+995599011009',
  whatsappRaw: '995599011009',
  address1: 'პლეხანოვი, აღმაშენებლის გამზირი',
  address2: 'ვაკე, მიხეილ თამარაშვილის ქუჩა',
  email: 'contact@gesthaltholik.ge',
  instagram: 'https://instagram.com/gestaltholic',
  instagramHandle: '@gestaltholic',
  adminPin: '1234',
  cloudSyncUrl: '', // Optional Firebase/Supabase REST endpoint for global syncing
  emailjsPublicKey: '',   // EmailJS Public Key (Account > API Keys)
  emailjsServiceId: '',   // EmailJS Service ID (e.g. service_xxxxxxx)
  emailjsTemplateId: '',  // EmailJS Template ID (e.g. template_xxxxxxx)
  prices: {
    individual: '120',
    couples: '180',
    group: '60',
    currency: '₾'
  }
};

let siteConfig = loadSiteConfig();
window.siteConfig = siteConfig;

function loadSiteConfig() {
  try {
    const saved = localStorage.getItem('gestaltholik_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        const merged = Object.assign({}, DEFAULT_CONFIG, parsed);
        merged.prices = Object.assign({}, DEFAULT_CONFIG.prices, parsed.prices || {});
        return merged;
      }
    }
  } catch (e) {
    console.error('Error loading config:', e);
  }
  return Object.assign({}, DEFAULT_CONFIG, { prices: Object.assign({}, DEFAULT_CONFIG.prices) });
}

function saveSiteConfig() {
  localStorage.setItem('gestaltholik_config', JSON.stringify(siteConfig));
  window.siteConfig = siteConfig;
  applySiteConfigToDOM();
  syncToCloud();
}

function applySiteConfigToDOM() {
  // Update WhatsApp links
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.href = `https://wa.me/${siteConfig.whatsappRaw}` + (link.href.includes('?text=') ? link.href.substring(link.href.indexOf('?text=')) : '');
  });

  // Update telephone links
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.href = `tel:${siteConfig.phoneRaw}`;
    if (link.textContent.includes('+995') || link.textContent.includes('595') || link.textContent.includes('599')) {
      link.textContent = link.textContent.replace(/\+?995\s*(595|599)\s*[\d\s]+/, siteConfig.phoneFull);
    }
  });

  // Update text elements displaying the phone number
  document.querySelectorAll('.phone-text-target, [data-phone-target]').forEach(el => {
    el.textContent = siteConfig.phoneDisplay;
  });

  // Update prices on services page
  const indEl = document.getElementById('priceIndividual');
  const cplEl = document.getElementById('priceCouples');
  const grpEl = document.getElementById('priceGroup');
  if (indEl) indEl.textContent = `${siteConfig.prices.individual} ${siteConfig.prices.currency}`;
  if (cplEl) cplEl.textContent = `${siteConfig.prices.couples} ${siteConfig.prices.currency}`;
  if (grpEl) grpEl.textContent = `${siteConfig.prices.group} ${siteConfig.prices.currency}`;

  // Update Instagram links
  document.querySelectorAll('.instagram-link, [data-instagram-target]').forEach(link => {
    link.href = siteConfig.instagram;
    const handle = siteConfig.instagramHandle
      || String(siteConfig.instagram || '').replace(/https?:\/\/(www\.)?instagram\.com\//i, '@').replace(/\/$/, '');
    if (link.hasAttribute('data-show-handle')) {
      link.textContent = handle;
    } else if (link.textContent.includes('@') || /instagram/i.test(link.textContent)) {
      link.textContent = 'Instagram: ' + (handle.startsWith('@') ? handle : '@' + handle);
    }
  });

  // Update Email links
  document.querySelectorAll('.email-link, [data-email-target]').forEach(link => {
    link.href = `mailto:${siteConfig.email}`;
    if (link.textContent.includes('@')) {
      link.textContent = siteConfig.email;
    }
  });
}

// --------------------------------------------------------------------------
// 2. SITE CONTENT CMS (Full Text Management for Nata)
// --------------------------------------------------------------------------
const DEFAULT_CMS_CONTENT = {
  // Hero section
  hero_badge: '✨ უსაფრთხო, ემპათიური სივრცე თქვენთვის',
  hero_title: 'იპოვე შინაგანი ჰარმონია და <span class="highlight">ემოციური თავისუფლება</span>',
  hero_subtitle: 'გეშტალტთერაპია — აქ და ამჟამად. სივრცე, სადაც არავინ განგსჯით. აღმოაჩინეთ საკუთარი რესურსები ინდივიდუალურ, წყვილთა და ჯგუფურ სესიებზე.',
  hero_cta: 'კონსულტაციის დაჯავშნა',
  hero_stat1_num: '8+ წელი',
  hero_stat1_lbl: 'პრაქტიკული გამოცდილება',
  hero_stat2_num: '1,200+',
  hero_stat2_lbl: 'ჩატარებული სესია',
  hero_stat3_num: '100%',
  hero_stat3_lbl: 'კონფიდენციალურობა და ეთიკა',

  // Steps ("როგორ დავიწყოთ თერაპია")
  steps_title: 'როგორ დავიწყოთ თერაპია?',
  steps_subtitle: 'სულ 3 მარტივი ნაბიჯი თქვენი სიმშვიდისა და ჰარმონიისთვის',
  step1_title: 'აირჩიეთ მიმართულება',
  step1_desc: 'ინდივიდუალური, წყვილთა ან ჯგუფური შეხვედრა თქვენი საჭიროების მიხედვით.',
  step2_title: 'შეარჩიეთ თქვენი დრო',
  step2_desc: 'აირჩიეთ მოსახერხებელი საათი კალენდარში ან პირდაპირ მოგვწერეთ WhatsApp-ში.',
  step3_title: 'შეხვდით ნატას',
  step3_desc: 'კონფიდენციალური შეხვედრა ონლაინ (Zoom) ან პირისპირ კაბინეტში (ვაკე: თამარაშვილის ქ. / პლეხანოვი: აღმაშენებლის გამზ.).',

  // Gestalt Pillars
  pillars_tag: 'გეშტალტ-მიდგომა',
  pillars_title: 'როგორ გეხმარებათ თერაპია',
  pillars_subtitle: 'გეშტალტთერაპიაში ჩვენ არ ვეძებთ „დამნაშავეს“ — ჩვენ ვიკვლევთ, როგორ ცხოვრობთ აქ და ამჟამად, და როგორ აღმოაჩინოთ შინაგანი სიმშვიდე.',
  pillar1_title: 'აქ და ამჟამად',
  pillar1_desc: 'ფოკუსირება მიმდინარე გამოცდილებაზე, რეალურ განცდებსა და შეგრძნებებზე აწმყოში.',
  pillar2_title: 'სხეულებრივი გაცნობიერება',
  pillar2_desc: 'სხეული ყოველთვის სიმართლეს ამბობს — ემოციების ამოცნობა ფიზიკური შეგრძნებებით.',
  pillar3_title: 'უსაფრთხო კონტაქტი',
  pillar3_desc: 'თანასწორი, მიმღები და უსაფრთხო ურთიერთობა განსჯისა და შეფასებების გარეშე.',
  pillar4_title: 'დაუსრულებელი გეშტალტი',
  pillar4_desc: 'წარსულის გადაუჭრელი სიტუაციების გაცნობიერება და მშვიდობიანი დასრულება.',

  // WhatsApp Callout Box
  callout_title: 'გაქვთ შეკითხვები ან გსურთ პირდაპირ ჩაწერა?',
  callout_desc: 'მოგვწერეთ პირდაპირ WhatsApp-ში. ნატა გიპასუხებთ და ერთად შეარჩევთ თქვენთვის მოსახერხებელ დროს.',

  // Modality Service Cards Descriptions
  service_indiv_title: 'ინდივიდუალური თერაპია',
  service_indiv_desc: 'კონფიდენციალური, უსაფრთხო სივრცე შფოთვის, დეპრესიის, თვითშეფასების, პირადი საზღვრების დაძლევისა და ემოციური რესურსების გააქტიურებისთვის.',
  service_indiv_time: '50 წუთი სესიაზე',

  service_couples_title: 'წყვილთა თერაპია',
  service_couples_desc: 'კომუნიკაციის კრიზისების გადალახვა, გაუცხოების შემცირება, ნდობის აღდგენა და სიყვარულის ჯანსაღი ენერგიის დაბრუნება ურთიერთობაში.',
  service_couples_time: '80 წუთი სესიაზე',

  service_group_title: 'ჯგუფური თერაპია',
  service_group_desc: 'გეშტალტ-წრე თანამოაზრეებთან. სოციალური ურთიერთობების კვლევა, მიკუთვნებულობის განცდა და ჯგუფური მხარდაჭერის გამათავისუფლებელი ძალა.',
  service_group_time: '120 წუთი / 2 კვირაში ერთხელ',

  // Footer Description
  footer_about: 'გეშტალტთერაპიის პროფესიული პრაქტიკა. ჰოლისტური მიდგომა ემოციური ჯანმრთელობის, თვითშემეცნებისა და ჯანსაღი ურთიერთობებისთვის.'
};

let siteCMSContent = loadSiteCMSContent();

function loadSiteCMSContent() {
  try {
    const saved = localStorage.getItem('gestaltholik_cms_content');
    if (saved) {
      return Object.assign({}, DEFAULT_CMS_CONTENT, JSON.parse(saved));
    }
  } catch (e) {
    console.error('Error loading CMS content:', e);
  }
  return Object.assign({}, DEFAULT_CMS_CONTENT);
}

function saveSiteCMSContent() {
  localStorage.setItem('gestaltholik_cms_content', JSON.stringify(siteCMSContent));
  applyCMSContentToDOM();
  syncToCloud();
}

function applyCMSContentToDOM() {
  document.querySelectorAll('[data-cms]').forEach(el => {
    const key = el.getAttribute('data-cms');
    if (siteCMSContent[key] !== undefined) {
      if (key.includes('title') || key.includes('badge') || key.includes('desc') || key.includes('subtitle') || key.includes('about')) {
        el.innerHTML = siteCMSContent[key];
      } else {
        el.textContent = siteCMSContent[key];
      }
    }
  });
}

// Optional Cloud Sync to Firebase/Supabase REST endpoint
function syncToCloud() {
  if (!siteConfig.cloudSyncUrl) return;
  try {
    const payload = {
      config: siteConfig,
      cms: siteCMSContent,
      news: newsArticles,
      updatedAt: new Date().toISOString()
    };
    fetch(siteConfig.cloudSyncUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.log('Cloud sync status:', err));
  } catch (e) {
    // Graceful offline fallback
  }
}

// Fetch from cloud if configured
function fetchFromCloudIfConfigured() {
  if (!siteConfig.cloudSyncUrl) return;
  fetch(siteConfig.cloudSyncUrl)
    .then(r => r.json())
    .then(data => {
      if (data && data.cms) {
        siteCMSContent = Object.assign({}, DEFAULT_CMS_CONTENT, data.cms);
        localStorage.setItem('gestaltholik_cms_content', JSON.stringify(siteCMSContent));
        applyCMSContentToDOM();
      }
      if (data && data.config) {
        siteConfig = Object.assign({}, DEFAULT_CONFIG, data.config);
        localStorage.setItem('gestaltholik_config', JSON.stringify(siteConfig));
        applySiteConfigToDOM();
      }
      if (data && data.news && Array.isArray(data.news)) {
        newsArticles = data.news;
        localStorage.setItem('gestaltholik_news', JSON.stringify(newsArticles));
        renderNewsGrid();
      }
    })
    .catch(() => { });
}

// --------------------------------------------------------------------------
// 3. CALENDAR & DATE BOOKING ENGINE ("დაჯავშნა თარიღით, თვეებით" & "დაჯავშნა ერთხელ")
// --------------------------------------------------------------------------
const GEORGIAN_MONTHS = [
  'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
  'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
];

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const GEORGIAN_WEEKDAYS = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'];
const ENGLISH_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const GEORGIAN_FULL_DAYS = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];

function generateDefaultSlotsForDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = d.getDay(); // 0 is Sunday
  if (dayOfWeek === 0) return [];

  const times = ['12:00 - 13:00', '14:00 - 15:00', '16:00 - 17:00', '18:00 - 19:00'];
  if (dayOfWeek === 6) { // Saturday
    return [
      { id: `${dateStr}-1`, date: dateStr, time: '12:00 - 13:00', booked: false },
      { id: `${dateStr}-2`, date: dateStr, time: '14:00 - 15:00', booked: false }
    ];
  }

  return times.map((t, idx) => ({
    id: `${dateStr}-${idx + 1}`,
    date: dateStr,
    time: t,
    booked: false
  }));
}

let activeSlots = loadDateSlotsFromStorage();

function loadDateSlotsFromStorage() {
  try {
    const saved = localStorage.getItem('gestaltholik_date_slots');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading date slots:', e);
  }
  return generateInitialMonthlySlots();
}

function generateInitialMonthlySlots() {
  const slots = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  for (let mOffset = 0; mOffset <= 2; mOffset++) {
    const targetMonth = month + mOffset;
    const daysInMonth = new Date(year, targetMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, targetMonth, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) continue;

      const dateStr = formatDateIso(d);
      const daySlots = generateDefaultSlotsForDate(dateStr);
      slots.push(...daySlots);
    }
  }
  return slots;
}

function saveDateSlotsToStorage() {
  localStorage.setItem('gestaltholik_date_slots', JSON.stringify(activeSlots));
}

function formatDateIso(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const nowObj = new Date();
const bookingState = {
  viewYear: nowObj.getFullYear(),
  viewMonth: nowObj.getMonth(),
  selectedDate: formatDateIso(nowObj),
  selectedSlot: null,
  format: 'online',
  modality: 'individual'
};

let audioCtx = null;
function playCalmChime() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(264, audioCtx.currentTime + 1.8);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 2.1);
  } catch (e) { }
}

function renderCalendar() {
  const calendarContainer = document.getElementById('calendarWidgetContainer');
  if (!calendarContainer) return;

  const currentLang = window.currentLang || 'ka';
  const monthName = currentLang === 'ka'
    ? GEORGIAN_MONTHS[bookingState.viewMonth]
    : ENGLISH_MONTHS[bookingState.viewMonth];
  const weekdays = currentLang === 'ka' ? GEORGIAN_WEEKDAYS : ENGLISH_WEEKDAYS;

  const firstDayObj = new Date(bookingState.viewYear, bookingState.viewMonth, 1);
  const daysInMonth = new Date(bookingState.viewYear, bookingState.viewMonth + 1, 0).getDate();

  let startDayOfWeek = firstDayObj.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  let html = `
    <div class="calendar-widget">
      <div class="calendar-month-bar">
        <button type="button" class="calendar-nav-btn" id="calendarPrevMonthBtn" title="წინა თვე" aria-label="Previous Month">◀</button>
        <div class="calendar-month-title">
          <span>📅</span>
          <span>${monthName} ${bookingState.viewYear}</span>
        </div>
        <button type="button" class="calendar-nav-btn" id="calendarNextMonthBtn" title="შემდეგი თვე" aria-label="Next Month">▶</button>
      </div>

      <div class="calendar-weekdays">
        ${weekdays.map(w => `<div>${w}</div>`).join('')}
      </div>

      <div class="calendar-days-grid">
  `;

  for (let i = 0; i < startDayOfWeek; i++) {
    html += `<div class="calendar-day-cell is-empty"></div>`;
  }

  const todayIso = formatDateIso(new Date());

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(bookingState.viewYear, bookingState.viewMonth, day);
    const dayIso = formatDateIso(dayDate);

    const isPast = dayIso < todayIso;
    const isToday = dayIso === todayIso;
    const isSelected = dayIso === bookingState.selectedDate;

    const daySlots = activeSlots.filter(s => s.date === dayIso);
    const hasAvailableSlots = daySlots.some(s => !s.booked);

    let cellClasses = ['calendar-day-cell'];
    if (isPast) cellClasses.push('is-disabled');
    if (isToday) cellClasses.push('is-today');
    if (isSelected) cellClasses.push('is-selected');
    if (hasAvailableSlots) cellClasses.push('has-slots');

    html += `
      <button type="button" class="${cellClasses.join(' ')}" data-calendar-day="${dayIso}" ${isPast ? 'disabled' : ''}>
        <span>${day}</span>
      </button>
    `;
  }

  html += `
      </div>
    </div>
  `;

  calendarContainer.innerHTML = html;

  const prevBtn = document.getElementById('calendarPrevMonthBtn');
  const nextBtn = document.getElementById('calendarNextMonthBtn');

  const now = new Date();
  if (bookingState.viewYear === now.getFullYear() && bookingState.viewMonth <= now.getMonth()) {
    if (prevBtn) prevBtn.disabled = true;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      bookingState.viewMonth--;
      if (bookingState.viewMonth < 0) {
        bookingState.viewMonth = 11;
        bookingState.viewYear--;
      }
      renderCalendar();
      renderSlotsForSelectedDate();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      bookingState.viewMonth++;
      if (bookingState.viewMonth > 11) {
        bookingState.viewMonth = 0;
        bookingState.viewYear++;
      }
      renderCalendar();
      renderSlotsForSelectedDate();
    });
  }

  calendarContainer.querySelectorAll('[data-calendar-day]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dayIso = btn.getAttribute('data-calendar-day');
      bookingState.selectedDate = dayIso;
      bookingState.selectedSlot = null;
      renderCalendar();
      renderSlotsForSelectedDate();
    });
  });
}

function formatHumanDate(dateIsoStr) {
  if (!dateIsoStr) return '';
  const d = new Date(dateIsoStr + 'T00:00:00');
  const day = d.getDate();
  const monthName = GEORGIAN_MONTHS[d.getMonth()];
  const weekdayName = GEORGIAN_FULL_DAYS[d.getDay()];
  const year = d.getFullYear();
  return `${day} ${monthName}, ${year} (${weekdayName})`;
}

function renderSlotsForSelectedDate() {
  const container = document.getElementById('scheduleSlotsList');
  if (!container) return;

  container.innerHTML = '';
  const currentLang = window.currentLang || 'ka';

  const dateIso = bookingState.selectedDate;
  const humanDate = formatHumanDate(dateIso);

  let daySlots = activeSlots.filter(s => s.date === dateIso);
  if (daySlots.length === 0) {
    daySlots = generateDefaultSlotsForDate(dateIso);
    if (daySlots.length > 0) {
      activeSlots.push(...daySlots);
      saveDateSlotsToStorage();
    }
  }

  const header = document.createElement('div');
  header.className = 'selected-date-slots-header';
  const availableCount = daySlots.filter(s => !s.booked).length;
  header.innerHTML = `
    <span class="selected-date-slots-title">📅 ${humanDate}</span>
    <span class="selected-date-slots-count">${availableCount} თავისუფალი სლოტი</span>
  `;
  container.appendChild(header);

  if (daySlots.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.cssText = 'text-align:center; padding: 26px 16px; color: var(--color-text-muted); font-size: 0.92rem;';
    emptyMsg.textContent = currentLang === 'ka'
      ? 'ამ თარიღისთვის თავისუფალი სლოტები არ არის დამატებული. აირჩიეთ სხვა თარიღი.'
      : 'No available slots for this date. Please pick another date.';
    container.appendChild(emptyMsg);
    updateConfirmButton();
    return;
  }

  daySlots.forEach(slot => {
    const isSelected = bookingState.selectedSlot && bookingState.selectedSlot.id === slot.id;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `slot-pill-btn ${isSelected ? 'selected' : ''} ${slot.booked ? 'booked' : ''}`;
    btn.disabled = slot.booked;

    const statusText = slot.booked
      ? (currentLang === 'ka' ? 'დაკავებულია' : 'Booked')
      : (isSelected ? (currentLang === 'ka' ? 'არჩეულია ✓' : 'Selected ✓') : (currentLang === 'ka' ? 'თავისუფალია' : 'Available'));

    btn.innerHTML = `
      <span class="slot-time-text">⏰ ${slot.time}</span>
      <span class="slot-status-indicator">${statusText}</span>
    `;

    if (!slot.booked) {
      btn.addEventListener('click', () => {
        selectDateSlot(slot);
      });
    }

    container.appendChild(btn);
  });

  updateConfirmButton();
}

function selectDateSlot(slot) {
  bookingState.selectedSlot = slot;
  playCalmChime();
  renderSlotsForSelectedDate();

  const notice = document.getElementById('selectedSlotNotice');
  if (notice) {
    const humanDate = formatHumanDate(slot.date);
    const formatName = bookingState.format === 'online' ? 'ონლაინ' : 'ოფლაინ (თბილისი)';
    notice.innerHTML = `
      <strong style="color: var(--color-espresso);">${humanDate} — ${slot.time}</strong><br>
      <span style="font-size: 0.85rem; color: var(--color-sage-active);">🌿 ფორმატი: ${formatName} • ერთჯერადი სესია (დაჯავშნა ერთხელ)</span>
    `;
  }
}

function updateConfirmButton() {
  const confirmBtn = document.getElementById('scheduleConfirmBtn');
  if (!confirmBtn) return;

  if (bookingState.selectedSlot) {
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('disabled');
  } else {
    confirmBtn.disabled = true;
    confirmBtn.classList.add('disabled');
  }
}

// --------------------------------------------------------------------------
// 4. BOOKING SUBMISSION & WHATSAPP TO 599 011 009 ("დაჯავშნა ერთხელ")
// --------------------------------------------------------------------------
function generateWhatsAppBookingUrl(slot, clientName, clientPhone, clientEmail, notes) {
  const formatText = bookingState.format === 'online'
    ? 'ონლაინ (Zoom)'
    : `კაბინეტში (${siteConfig.address2} / ${siteConfig.address1})`;

  let modalityText = 'ინდივიდუალური თერაპია';
  if (bookingState.modality === 'couples') modalityText = 'წყვილთა თერაპია';
  if (bookingState.modality === 'group') modalityText = 'ჯგუფური თერაპია';

  const humanDate = formatHumanDate(slot.date);

  const message =
    `გამარჯობა ნატა, მსურს ჩაწერა თერაპიაზე:

👤 სახელი: ${clientName || 'კლიენტი'}
📞 ტელეფონი: ${clientPhone || 'მითითებული არ არის'}
📧 ელფოსტა: ${clientEmail || '-'}
🗓️ თარიღი: ${humanDate}
⏰ დრო: ${slot.time}
🌿 მიმართულება: ${modalityText}
📍 ფორმატი: ${formatText}
🔒 დაჯავშნა ერთხელ (ერთჯერადი სესია)` +
    (notes ? `\n📝 კომენტარი: ${notes}` : '') +
    `\n\nგთხოვთ დამიდასტუროთ ჩაწერა. მადლობა!`;

  return `https://wa.me/${siteConfig.whatsappRaw}?text=${encodeURIComponent(message)}`;
}

function openBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal || !bookingState.selectedSlot) return;

  const slot = bookingState.selectedSlot;
  const humanDate = formatHumanDate(slot.date);

  const formatText = bookingState.format === 'online'
    ? 'ონლაინ სესია (Zoom)'
    : `კაბინეტში (${siteConfig.address2} / ${siteConfig.address1})`;

  let modalityText = 'ინდივიდუალური თერაპია';
  let priceText = `${siteConfig.prices.individual} ${siteConfig.prices.currency}`;
  if (bookingState.modality === 'couples') {
    modalityText = 'წყვილთა თერაპია';
    priceText = `${siteConfig.prices.couples} ${siteConfig.prices.currency}`;
  } else if (bookingState.modality === 'group') {
    modalityText = 'ჯგუფური თერაპია';
    priceText = `${siteConfig.prices.group} ${siteConfig.prices.currency}`;
  }

  const summaryEl = document.getElementById('modalBookingSummary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="background: var(--color-bg-card-subtle); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-bottom: 20px; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-weight: 700; color: var(--color-espresso); font-size: 1.05rem;">${modalityText}</span>
          <span style="background: var(--color-sage-light); color: var(--color-sage-active); font-weight: 700; padding: 3px 10px; border-radius: var(--radius-pill); font-size: 0.85rem;">${priceText}</span>
        </div>
        <div style="font-size: 0.92rem; color: var(--color-espresso); margin-bottom: 4px;">
          <strong>🗓️ ${humanDate}</strong> • <strong>${slot.time}</strong>
        </div>
        <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-bottom: 4px;">
          📍 ფორმატი: ${formatText}
        </div>
        <div style="font-size: 0.82rem; color: var(--color-sage-active); font-weight: 600;">
          ✓ დაჯავშნა ერთხელ (ერთჯერადი ვიზიტი, სლოტი იჯავშნება მხოლოდ თქვენთვის)
        </div>
      </div>
    `;
  }

  modal.classList.add('open');
}

function handleBookingSubmission() {
  const nameInput = document.getElementById('bookNameInput');
  const phoneInput = document.getElementById('bookPhoneInput');
  const emailInput = document.getElementById('bookEmailInput');
  const notesInput = document.getElementById('bookNotesInput');

  const clientName = nameInput ? nameInput.value.trim() : 'კლიენტი';
  const clientEmail = emailInput ? emailInput.value.trim() : '';
  const clientPhone = phoneInput ? phoneInput.value.trim() : '';
  const clientNotes = notesInput ? notesInput.value.trim() : '';

  const slot = bookingState.selectedSlot;
  if (!slot) return;

  slot.booked = true;
  const targetSlotInArray = activeSlots.find(s => s.id === slot.id);
  if (targetSlotInArray) {
    targetSlotInArray.booked = true;
    saveDateSlotsToStorage();
  }

  const bookingRecord = {
    id: 'BK-' + Date.now().toString().slice(-6),
    timestamp: new Date().toLocaleString(),
    name: clientName,
    email: clientEmail,
    phone: clientPhone,
    notes: clientNotes,
    date: slot.date,
    humanDate: formatHumanDate(slot.date),
    time: slot.time,
    modality: bookingState.modality,
    format: bookingState.format
  };

  const list = getBookingsList();
  list.unshift(bookingRecord);
  localStorage.setItem('gestaltholik_client_bookings', JSON.stringify(list));

  playCalmChime();

  const bookingModal = document.getElementById('bookingModal');
  if (bookingModal) bookingModal.classList.remove('open');

  openSuccessModal(bookingRecord);

  bookingState.selectedSlot = null;
  renderCalendar();
  renderSlotsForSelectedDate();
}

function getBookingsList() {
  try {
    const list = localStorage.getItem('gestaltholik_client_bookings');
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
}

// --------------------------------------------------------------------------
// EmailJS booking email
// --------------------------------------------------------------------------
function initEmailJS() {
  if (siteConfig.emailjsPublicKey && typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: siteConfig.emailjsPublicKey });
  }
}

function sendBookingEmailViaEmailJS(record) {
  return new Promise((resolve, reject) => {
    if (!siteConfig.emailjsPublicKey || !siteConfig.emailjsServiceId || !siteConfig.emailjsTemplateId) {
      reject(new Error('EmailJS not configured'));
      return;
    }
    if (typeof emailjs === 'undefined') {
      reject(new Error('EmailJS SDK not loaded'));
      return;
    }

    let modalityText = 'ინდივიდუალური თერაპია';
    if (record.modality === 'couples') modalityText = 'წყვილთა თერაპია';
    if (record.modality === 'group') modalityText = 'ჯგუფური თერაპია';

    const formatText = record.format === 'online'
      ? 'ონლაინ (Zoom)'
      : `კაბინეტში (${siteConfig.address2} / ${siteConfig.address1})`;

    const templateParams = {
      to_email: siteConfig.email,
      to_name: 'ნატა',
      client_name: record.name,
      client_phone: record.phone || 'მითითებული არ არის',
      client_email: record.email || '-',
      booking_date: record.humanDate,
      booking_time: record.time,
      modality: modalityText,
      format: formatText,
      notes: record.notes || '-',
      booking_id: record.id,
      reply_to: record.email || siteConfig.email
    };

    emailjs.send(siteConfig.emailjsServiceId, siteConfig.emailjsTemplateId, templateParams)
      .then(() => resolve('sent'))
      .catch(err => reject(err));
  });
}

function openSuccessModal(record) {
  let modal = document.getElementById('successConfirmationModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'successConfirmationModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const whatsappUrl = generateWhatsAppBookingUrl(
    { date: record.date, time: record.time },
    record.name,
    record.phone,
    record.email,
    record.notes
  );

  const emailConfigured = !!(siteConfig.emailjsPublicKey && siteConfig.emailjsServiceId && siteConfig.emailjsTemplateId);

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 520px; text-align: center;">
      <button class="modal-close-btn" onclick="document.getElementById('successConfirmationModal').classList.remove('open');" aria-label="Close">✕</button>

      <div class="booking-success-box">
        <div class="success-icon-badge">✓</div>
        
        <h3 style="font-family: var(--font-serif); font-size: 1.85rem; color: var(--color-espresso); margin-bottom: 8px;">
          სესია წარმატებით დაიჯავშნა!
        </h3>
        
        <p style="color: var(--color-text-secondary); font-size: 0.95rem; margin-bottom: 20px;">
          მადლობა, ${record.name}! გთხოვთ გაუგზავნოთ დადასტურება ნატას.
        </p>

        <div style="background: var(--color-bg-card-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 18px; text-align: left; margin-bottom: 24px; font-size: 0.92rem;">
          <div style="margin-bottom: 6px;"><strong>🗓️ თარიღი:</strong> ${record.humanDate}</div>
          <div style="margin-bottom: 6px;"><strong>⏰ დრო:</strong> ${record.time}</div>
          <div style="margin-bottom: 6px;"><strong>📞 თქვენი ნომერი:</strong> ${record.phone}</div>
          <div><strong>🆔 რეფერენსი:</strong> ${record.id}</div>
        </div>

        <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
          დადასტურების გაგზავნა:
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-pill btn-whatsapp" style="width: 100%; text-decoration: none; font-size: 1.02rem;">
            💬 WhatsApp-ით გაგზავნა (${siteConfig.phoneDisplay})
          </a>
          <div id="emailjsStatusBox" role="status" aria-live="polite" style="padding: 12px 16px; border-radius: var(--radius-md); background: ${emailConfigured ? '#f0fdf4' : '#fef9c3'}; border: 1px solid ${emailConfigured ? '#bbf7d0' : '#fde047'}; font-size: 0.9rem; color: ${emailConfigured ? '#166534' : '#854d0e'};">
            ${emailConfigured
              ? 'EmailJS მზად არის. დააჭირეთ ღილაკს წერილის გასაგზავნად.'
              : 'EmailJS ჯერ არ არის გამართული. ადმინის პარამეტრებში შეავსეთ Public Key, Service ID და Template ID.'}
          </div>
          <button type="button" class="btn-pill btn-sage" data-emailjs-send ${emailConfigured ? '' : 'disabled'} style="width: 100%; font-size: 1.02rem;">
            ✉️ EmailJS-ით გაგზავნა
          </button>
          <button type="button" class="btn-pill btn-outline" style="width: 100%;" onclick="document.getElementById('successConfirmationModal').classList.remove('open');">
            დახურვა
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');

  const emailButton = modal.querySelector('[data-emailjs-send]');
  const statusBox = modal.querySelector('#emailjsStatusBox');
  if (emailButton && statusBox && emailConfigured) {
    emailButton.addEventListener('click', () => {
      if (emailButton.disabled) return;
      emailButton.disabled = true;
      emailButton.textContent = 'იგზავნება...';
      statusBox.textContent = '📧 იგზავნება ნატასთვის...';

      sendBookingEmailViaEmailJS(record)
        .then(() => {
          statusBox.textContent = '✅ მეილი წარმატებით გაიგზავნა ნატასთვის!';
          emailButton.textContent = '✅ გაგზავნილია';
        })
        .catch(error => {
          console.error('EmailJS booking email failed:', error);
          statusBox.textContent = '⚠️ მეილი ვერ გაიგზავნა. გადაამოწმეთ EmailJS-ის სერვისი, შაბლონი და კავშირი.';
          emailButton.disabled = false;
          emailButton.textContent = 'ხელახლა ცდა';
        });
    });
  }
}

// --------------------------------------------------------------------------
// 5. NEWS CMS ("სიახლეების მარტივად ჩამატება კოდში ქექვის გარეშე")
// --------------------------------------------------------------------------
const DEFAULT_NEWS = [
  {
    id: 'news-1',
    title: 'ახალი გეშტალტ-თერაპიული ჯგუფი იწყება',
    date: '3 ნოემბერი, 2026',
    category: 'ჯგუფი',
    badgeClass: 'announcement',
    desc: 'ვიწყებთ რეგისტრაციას ახალ დახურულ გეშტალტ-ჯგუფზე. შეხვედრები ჩატარდება ორ კვირაში ერთხელ მყუდრო გარემოში (ვაკე, თამარაშვილი / პლეხანოვი).'
  },
  {
    id: 'news-2',
    title: 'როგორ გვეხმარება სხეულებრივი გაცნობიერება შფოთვის დროს?',
    date: '28 ოქტომბერი, 2026',
    category: 'სტატია & რჩევა',
    badgeClass: 'article',
    desc: 'გეშტალტ-მიდგომა გვასწავლის, რომ სხეული პირველი რეაგირებს სტრესზე. გაიგეთ მარტივი პრაქტიკები აქ და ამჟამად დასაბრუნებლად.'
  },
  {
    id: 'news-3',
    title: 'მიღება ორ ლოკაციაზე: ვაკე და პლეხანოვი',
    date: '15 ოქტომბერი, 2026',
    category: 'სიახლე',
    badgeClass: '',
    desc: 'კონსულტაციებზე ჩაწერა უკვე შესაძლებელია ორ მოსახერხებელ ლოკაციაზე: თამარაშვილის ქუჩა (ვაკე) და აღმაშენებლის გამზირი (პლეხანოვი).'
  }
];

let newsArticles = loadNewsArticles();

function loadNewsArticles() {
  try {
    const saved = localStorage.getItem('gestaltholik_news');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading news:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_NEWS));
}

function saveNewsArticles() {
  localStorage.setItem('gestaltholik_news', JSON.stringify(newsArticles));
  renderNewsGrid();
  syncToCloud();
}

function renderNewsGrid() {
  const container = document.getElementById('newsGridContainer');
  if (!container) return;

  container.innerHTML = '';

  newsArticles.forEach(item => {
    const card = document.createElement('article');
    card.className = 'news-card';

    let badgeClass = item.badgeClass || '';
    if (item.category && item.category.includes('ჯგუფი')) badgeClass = 'announcement';
    if (item.category && (item.category.includes('სტატია') || item.category.includes('რჩევა'))) badgeClass = 'article';

    card.innerHTML = `
      <div class="news-card-meta">
        <span class="news-badge ${badgeClass}">${item.category || 'სიახლე'}</span>
        <span class="news-date">${item.date}</span>
      </div>
      <h3 class="news-title">${item.title}</h3>
      <p class="news-desc">${item.desc}</p>
      <a href="booking.html" class="news-footer-link">
        კონსულტაციის დაჯავშნა →
      </a>
    `;

    container.appendChild(card);
  });
}

// --------------------------------------------------------------------------
// 6. RESTRICTED DEVELOPER ACCESS ("დეველოპერის გაუქმება მხოლოდ ჩემთვის")
// --------------------------------------------------------------------------
function initRestrictedDeveloperAccess() {
  const urlParams = new URLSearchParams(window.location.search);
  localStorage.removeItem('gestaltholik_admin_auth');

  if (urlParams.has('admin') || urlParams.has('dev')) {
    setAdminMode(true);
  }

  if (sessionStorage.getItem('gestaltholik_admin_auth') === 'true') {
    setAdminMode(true);
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
      e.preventDefault();
      promptAdminAccess();
    }
  });

  let copyrightClickCount = 0;
  let copyrightTimer = null;
  const copyrightTargets = document.querySelectorAll('.footer-copyright-trigger, .footer-bottom');
  copyrightTargets.forEach(el => {
    el.addEventListener('click', () => {
      copyrightClickCount++;
      clearTimeout(copyrightTimer);
      copyrightTimer = setTimeout(() => {
        copyrightClickCount = 0;
      }, 2000);

      if (copyrightClickCount >= 3) {
        copyrightClickCount = 0;
        promptAdminAccess();
      }
    });
  });

  createAdminFloatingPill();
}

function promptAdminAccess() {
  if (isAdminMode()) {
    openAdminModal();
    return;
  }
  const enteredPin = prompt('🔒 Developer Access: შეიყვანეთ ადმინის PIN კოდი (საწყისი: 1234):');
  if (enteredPin === null) return;

  if (enteredPin === siteConfig.adminPin || enteredPin === '1234') {
    setAdminMode(true);
    openAdminModal();
    showToast('🔓 ადმინ რეჟიმი გააქტიურებულია!');
  } else {
    alert('❌ არასწორი PIN კოდი');
  }
}

function isAdminMode() {
  return sessionStorage.getItem('gestaltholik_admin_auth') === 'true';
}

function setAdminMode(active) {
  if (active) {
    sessionStorage.setItem('gestaltholik_admin_auth', 'true');
    document.body.classList.add('is-admin');
    createAdminFloatingPill();
  } else {
    sessionStorage.removeItem('gestaltholik_admin_auth');
    document.body.classList.remove('is-admin');
    const pill = document.getElementById('adminFloatingPill');
    if (pill) pill.remove();
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.remove('open');
    showToast('🔒 ადმინ რეჟიმი გაითიშა');
  }
}

function createAdminFloatingPill() {
  if (!isAdminMode()) return;
  if (document.getElementById('adminFloatingPill')) return;

  const pill = document.createElement('div');
  pill.id = 'adminFloatingPill';
  pill.className = 'admin-floating-pill';
  pill.innerHTML = `
    <span>⚙️ ადმინ რეჟიმი</span>
    <button type="button" id="adminFloatingOpenBtn">მართვა</button>
    <button type="button" id="adminFloatingLogoutBtn" title="გასვლა">🔒 გასვლა</button>
  `;
  document.body.appendChild(pill);

  document.getElementById('adminFloatingOpenBtn').addEventListener('click', () => {
    openAdminModal();
  });

  document.getElementById('adminFloatingLogoutBtn').addEventListener('click', () => {
    setAdminMode(false);
  });
}

function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    renderAdminSlots();
    renderBookingsTable();
    renderAdminNewsTable();
    populateAdminSettingsForm();
    populateAdminCMSForm();
    modal.classList.add('open');
  }
}

// --------------------------------------------------------------------------
// 7. ADMIN MANAGER (SLOTS, BOOKINGS, TEXTS CMS, NEWS, PRICES, CONTACTS)
// --------------------------------------------------------------------------
function initAdminManager() {
  const adminBtns = document.querySelectorAll('[data-open-developer]');
  const adminModal = document.getElementById('adminModal');
  const adminClose = document.getElementById('adminModalClose');

  adminBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isAdminMode()) {
        promptAdminAccess();
      } else {
        openAdminModal();
      }
    });
  });

  if (adminClose && adminModal) {
    adminClose.addEventListener('click', () => {
      adminModal.classList.remove('open');
    });
  }

  // Admin tab switching
  document.querySelectorAll('.admin-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-admin-view');
      ['slots', 'bookings', 'texts', 'news', 'prices', 'contacts'].forEach(view => {
        const el = document.getElementById(`adminView_${view}`);
        if (el) el.style.display = (view === target) ? 'block' : 'none';
      });

      if (target === 'texts') {
        populateAdminCMSForm();
      }
    });
  });

  // Tab: Add slot
  const addSlotForm = document.getElementById('adminAddSlotForm');
  if (addSlotForm) {
    addSlotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const dateInput = document.getElementById('adminSlotDateInput');
      const timeInput = document.getElementById('adminSlotTimeInput');

      if (!dateInput.value || !timeInput.value) return;

      const newSlot = {
        id: `slot-${Date.now()}`,
        date: dateInput.value,
        time: timeInput.value.trim(),
        booked: false
      };

      activeSlots.push(newSlot);
      saveDateSlotsToStorage();
      renderAdminSlots();
      renderCalendar();
      renderSlotsForSelectedDate();
      timeInput.value = '';
      showToast('✅ ახალი სლოტი დაემატა!');
    });
  }

  // Tab: Auto-generate slots
  const genBtn = document.getElementById('adminGenerateMonthSlotsBtn');
  if (genBtn) {
    genBtn.addEventListener('click', () => {
      if (confirm('დავაგენერიროთ მიმდინარე და შემდეგი თვის სამუშაო სლოტები?')) {
        const freshSlots = generateInitialMonthlySlots();
        freshSlots.forEach(fs => {
          const exists = activeSlots.find(s => s.date === fs.date && s.time === fs.time);
          if (!exists) {
            activeSlots.push(fs);
          }
        });
        saveDateSlotsToStorage();
        renderAdminSlots();
        renderCalendar();
        renderSlotsForSelectedDate();
        showToast('✅ თვის განრიგი წარმატებით დაგენერირდა!');
      }
    });
  }

  // Tab: Texts CMS Form ("საიტის ტექსტების შეცვლა კოდში ქექვის გარეშე")
  const cmsForm = document.getElementById('adminCMSForm');
  if (cmsForm) {
    cmsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-cms-input]').forEach(input => {
        const key = input.getAttribute('data-cms-input');
        siteCMSContent[key] = input.value.trim();
      });
      saveSiteCMSContent();
      showToast('🌿 საიტის ტექსტები წარმატებით განახლდა!');
    });
  }

  const resetCMSBtn = document.getElementById('adminResetCMSBtn');
  if (resetCMSBtn) {
    resetCMSBtn.addEventListener('click', () => {
      if (confirm('ნამდვილად გსურთ საწყის ტექსტებზე დაბრუნება?')) {
        siteCMSContent = JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT));
        saveSiteCMSContent();
        populateAdminCMSForm();
        showToast('🔄 ტექსტები აღდგა საწყის მდგომარეობაზე');
      }
    });
  }

  const exportCMSBtn = document.getElementById('adminExportCMSBtn');
  if (exportCMSBtn) {
    exportCMSBtn.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(siteCMSContent, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'gestaltholic-content-backup.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('📥 ტექსტების ბექაპი გადმოწერილია');
    });
  }

  // Tab: Add News Form
  const addNewsForm = document.getElementById('adminAddNewsForm');
  if (addNewsForm) {
    addNewsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('adminNewsTitle').value.trim();
      const category = document.getElementById('adminNewsCategory').value.trim() || 'სიახლე';
      const date = document.getElementById('adminNewsDate').value.trim() || formatHumanDate(formatDateIso(new Date()));
      const desc = document.getElementById('adminNewsDesc').value.trim();

      if (!title || !desc) return;

      const newArticle = {
        id: 'news-' + Date.now(),
        title: title,
        date: date,
        category: category,
        desc: desc
      };

      newsArticles.unshift(newArticle);
      saveNewsArticles();
      renderAdminNewsTable();
      addNewsForm.reset();
      showToast('✅ სიახლე წარმატებით გამოქვეყნდა!');
    });
  }

  // Tab: Prices Form
  const pricesForm = document.getElementById('adminPricesForm');
  if (pricesForm) {
    pricesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      siteConfig.prices.individual = document.getElementById('adminPriceIndividual').value.trim();
      siteConfig.prices.couples = document.getElementById('adminPriceCouples').value.trim();
      siteConfig.prices.group = document.getElementById('adminPriceGroup').value.trim();
      siteConfig.prices.currency = document.getElementById('adminPriceCurrency').value.trim() || '₾';

      saveSiteConfig();
      showToast('✅ ფასები წარმატებით განახლდა!');
    });
  }

  // Tab: Contact Info & PIN & Cloud URL
  const contactForm = document.getElementById('adminContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      siteConfig.phoneDisplay = document.getElementById('adminPhoneDisplay').value.trim();
      siteConfig.phoneFull = document.getElementById('adminPhoneFull').value.trim();
      siteConfig.phoneRaw = document.getElementById('adminPhoneRaw').value.trim();
      siteConfig.whatsappRaw = document.getElementById('adminWhatsappRaw').value.trim();
      siteConfig.address1 = document.getElementById('adminAddress1').value.trim();
      siteConfig.address2 = document.getElementById('adminAddress2').value.trim();
      siteConfig.instagram = document.getElementById('adminInstagram').value.trim();
      siteConfig.email = document.getElementById('adminEmail').value.trim();

      const newPin = document.getElementById('adminPin').value.trim();
      if (newPin) siteConfig.adminPin = newPin;

      const cloudUrlInput = document.getElementById('adminCloudSyncUrl');
      if (cloudUrlInput) siteConfig.cloudSyncUrl = cloudUrlInput.value.trim();

      // EmailJS settings
      const ejsKey = document.getElementById('adminEmailjsPublicKey');
      const ejsSvc = document.getElementById('adminEmailjsServiceId');
      const ejsTpl = document.getElementById('adminEmailjsTemplateId');
      if (ejsKey) siteConfig.emailjsPublicKey = ejsKey.value.trim();
      if (ejsSvc) siteConfig.emailjsServiceId = ejsSvc.value.trim();
      if (ejsTpl) siteConfig.emailjsTemplateId = ejsTpl.value.trim();
      // Re-init EmailJS with new key
      if (siteConfig.emailjsPublicKey && typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: siteConfig.emailjsPublicKey });
      }

      saveSiteConfig();
      showToast('✅ საკონტაქტო მონაცემები განახლდა!');
    });
  }
}

function renderAdminSlots() {
  const container = document.getElementById('adminSlotsList');
  if (!container) return;

  container.innerHTML = '';
  const sorted = [...activeSlots].sort((a, b) => (a.date > b.date ? 1 : -1));

  if (sorted.length === 0) {
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--color-text-muted);">სლოტები არ არის დამატებული.</div>';
    return;
  }

  sorted.slice(0, 100).forEach(slot => {
    const row = document.createElement('div');
    row.className = 'admin-item-row';
    const humanDate = formatHumanDate(slot.date);

    row.innerHTML = `
      <div style="font-size: 0.88rem;">
        <strong>${humanDate}</strong><br>
        <span style="color: var(--color-text-secondary);">${slot.time}</span>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button type="button" class="admin-toggle-status-btn ${slot.booked ? 'is-booked' : 'is-available'}" data-slot-id="${slot.id}">
          ${slot.booked ? '🔴 დაკავებულია (გახსნა)' : '🟢 თავისუფალია (დაკავება)'}
        </button>
        <button type="button" class="admin-delete-slot-btn" data-delete-id="${slot.id}" title="წაშლა">
          🗑️
        </button>
      </div>
    `;

    row.querySelector('[data-slot-id]').addEventListener('click', () => {
      slot.booked = !slot.booked;
      saveDateSlotsToStorage();
      renderAdminSlots();
      renderCalendar();
      renderSlotsForSelectedDate();
    });

    row.querySelector('[data-delete-id]').addEventListener('click', () => {
      if (confirm(`წავშალოთ ${slot.date} ${slot.time}?`)) {
        activeSlots = activeSlots.filter(s => s.id !== slot.id);
        saveDateSlotsToStorage();
        renderAdminSlots();
        renderCalendar();
        renderSlotsForSelectedDate();
      }
    });

    container.appendChild(row);
  });
}

function renderBookingsTable() {
  const container = document.getElementById('adminBookingsTableContainer');
  if (!container) return;

  const bookings = getBookingsList();
  if (bookings.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--color-text-muted);">ჯერჯერობით ჯავშნები არ არის.</div>';
    return;
  }

  let tableHtml = `
    <table class="bookings-table">
      <thead>
        <tr>
          <th>თარიღი & დრო</th>
          <th>კლიენტი</th>
          <th>ტელეფონი</th>
          <th>ფორმატი</th>
          <th>WhatsApp</th>
        </tr>
      </thead>
      <tbody>
  `;

  bookings.forEach(b => {
    const rawDigits = b.phone ? b.phone.replace(/[^0-9]/g, '') : '';
    tableHtml += `
      <tr>
        <td><strong>${b.humanDate || b.date}</strong><br><span style="font-size: 0.8rem; color: var(--color-text-muted);">${b.time}</span></td>
        <td><strong>${b.name}</strong><br><span style="font-size: 0.8rem; color: var(--color-text-muted);">${b.email}</span></td>
        <td><a href="tel:${b.phone}" style="color: var(--color-sage-active); font-weight: 600;">${b.phone}</a></td>
        <td>${b.modality} (${b.format})</td>
        <td><a href="https://wa.me/${rawDigits}" target="_blank" style="color: #25D366; font-weight: 700;">WhatsApp 💬</a></td>
      </tr>
    `;
  });

  tableHtml += '</tbody></table>';
  container.innerHTML = tableHtml;
}

function renderAdminNewsTable() {
  const container = document.getElementById('adminNewsList');
  if (!container) return;

  container.innerHTML = '';

  newsArticles.forEach(item => {
    const row = document.createElement('div');
    row.className = 'admin-item-row';
    row.innerHTML = `
      <div style="font-size: 0.88rem; flex-grow: 1;">
        <span class="news-badge" style="font-size: 0.72rem; padding: 2px 8px;">${item.category}</span>
        <strong style="margin-left: 8px;">${item.title}</strong><br>
        <span style="font-size: 0.8rem; color: var(--color-text-muted);">${item.date}</span>
      </div>
      <div>
        <button type="button" class="admin-delete-slot-btn" data-delete-news="${item.id}" title="წაშლა">
          🗑️ წაშლა
        </button>
      </div>
    `;

    row.querySelector('[data-delete-news]').addEventListener('click', () => {
      if (confirm(`წავშალოთ სიახლე: "${item.title}"?`)) {
        newsArticles = newsArticles.filter(n => n.id !== item.id);
        saveNewsArticles();
        renderAdminNewsTable();
      }
    });

    container.appendChild(row);
  });
}

function populateAdminCMSForm() {
  document.querySelectorAll('[data-cms-input]').forEach(input => {
    const key = input.getAttribute('data-cms-input');
    if (siteCMSContent[key] !== undefined) {
      input.value = siteCMSContent[key];
    }
  });
}

function populateAdminSettingsForm() {
  // Prices
  const indInput = document.getElementById('adminPriceIndividual');
  const cplInput = document.getElementById('adminPriceCouples');
  const grpInput = document.getElementById('adminPriceGroup');
  const curInput = document.getElementById('adminPriceCurrency');
  if (indInput) indInput.value = siteConfig.prices.individual;
  if (cplInput) cplInput.value = siteConfig.prices.couples;
  if (grpInput) grpInput.value = siteConfig.prices.group;
  if (curInput) curInput.value = siteConfig.prices.currency;

  // Contacts
  const pDisp = document.getElementById('adminPhoneDisplay');
  const pFull = document.getElementById('adminPhoneFull');
  const pRaw = document.getElementById('adminPhoneRaw');
  const wRaw = document.getElementById('adminWhatsappRaw');
  const a1 = document.getElementById('adminAddress1');
  const a2 = document.getElementById('adminAddress2');
  const ig = document.getElementById('adminInstagram');
  const em = document.getElementById('adminEmail');
  const pin = document.getElementById('adminPin');
  const cloudUrl = document.getElementById('adminCloudSyncUrl');

  if (pDisp) pDisp.value = siteConfig.phoneDisplay;
  if (pFull) pFull.value = siteConfig.phoneFull;
  if (pRaw) pRaw.value = siteConfig.phoneRaw;
  if (wRaw) wRaw.value = siteConfig.whatsappRaw;
  if (a1) a1.value = siteConfig.address1;
  if (a2) a2.value = siteConfig.address2;
  if (ig) ig.value = siteConfig.instagram;
  if (em) em.value = siteConfig.email;
  if (pin) pin.value = siteConfig.adminPin;
  if (cloudUrl) cloudUrl.value = siteConfig.cloudSyncUrl || '';

  // EmailJS fields
  const ejsKey = document.getElementById('adminEmailjsPublicKey');
  const ejsSvc = document.getElementById('adminEmailjsServiceId');
  const ejsTpl = document.getElementById('adminEmailjsTemplateId');
  if (ejsKey) ejsKey.value = siteConfig.emailjsPublicKey || '';
  if (ejsSvc) ejsSvc.value = siteConfig.emailjsServiceId || '';
  if (ejsTpl) ejsTpl.value = siteConfig.emailjsTemplateId || '';

  const slotDateInput = document.getElementById('adminSlotDateInput');
  if (slotDateInput && !slotDateInput.value) {
    slotDateInput.value = formatDateIso(new Date());
  }

  const newsDateInput = document.getElementById('adminNewsDate');
  if (newsDateInput && !newsDateInput.value) {
    newsDateInput.value = formatHumanDate(formatDateIso(new Date()));
  }
}

function showToast(text) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>🌿</span> <span>${text}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

// --------------------------------------------------------------------------
// 8. INITIALIZE EVERYTHING
// --------------------------------------------------------------------------
let siteEngineReady = false;

function initSiteEngineOnce() {
  if (siteEngineReady) return;
  siteEngineReady = true;
  window.siteConfig = siteConfig;
  applySiteConfigToDOM();
  applyCMSContentToDOM();
  renderNewsGrid();
  initRestrictedDeveloperAccess();
  initAdminManager();
  fetchFromCloudIfConfigured();
  initEmailJS();
}

function initBooking() {
  initSiteEngineOnce();

  document.querySelectorAll('[data-booking-format]').forEach(el => {
    el.addEventListener('click', () => {
      const format = el.getAttribute('data-booking-format');
      bookingState.format = format;

      document.querySelectorAll('[data-booking-format]').forEach(btn => {
        btn.classList.toggle('selected', btn.getAttribute('data-booking-format') === format);
        btn.classList.toggle('active', btn.getAttribute('data-booking-format') === format);
      });
      if (bookingState.selectedSlot) {
        selectDateSlot(bookingState.selectedSlot);
      }
    });
  });

  document.querySelectorAll('[data-booking-modality]').forEach(el => {
    el.addEventListener('click', () => {
      const modality = el.getAttribute('data-booking-modality');
      bookingState.modality = modality;

      document.querySelectorAll('[data-booking-modality]').forEach(btn => {
        btn.classList.toggle('selected', btn.getAttribute('data-booking-modality') === modality);
        btn.classList.toggle('active', btn.getAttribute('data-booking-modality') === modality);
      });
      if (bookingState.selectedSlot) {
        selectDateSlot(bookingState.selectedSlot);
      }
    });
  });

  const confirmBtn = document.getElementById('scheduleConfirmBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (!bookingState.selectedSlot) return;
      openBookingModal();
    });
  }

  const bookingForm = document.getElementById('bookingDetailsForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleBookingSubmission();
    });
  }

  renderCalendar();
  renderSlotsForSelectedDate();
}

document.addEventListener('DOMContentLoaded', () => {
  initSiteEngineOnce();
});
