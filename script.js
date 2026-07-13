// ---------- Background stars ----------
const starfield = document.getElementById('starfield');
for (let i = 0; i < 120; i++) {
  const s = document.createElement('div');
  s.className = 'bg-star';
  const size = Math.random() * 2 + 0.5;
  s.style.width = size + 'px';
  s.style.height = size + 'px';
  s.style.top = Math.random() * 100 + '%';
  s.style.left = Math.random() * 100 + '%';
  s.style.animationDelay = (Math.random() * 4) + 's';
  starfield.appendChild(s);
}

// ---------- Constellation data ----------
// Порядок читання = порядок скролу (згори вниз = від найдавнішого до найновішого).
// Спочатку дві "поранені планети" (без галереї, лише особистий підпис),
// потім 4 основні зірки-роки. Остання зірка (2026) — фінальна: клік по ній
// запускає вибух + запрошення, замість галереї.

const ORIGIN = [
  {
    year: '2005',
    label: 'народження',
    // TODO: заміни власними словами, коли будеш готовий
    caption: '2005 — рік, коли запалилась перша зірка. Твоя.',
  },
];

const WOUNDS = [
  {
    year: '2014',
    label: 'окупація',
    // TODO: заміни власними словами, коли будеш готовий
    caption: '2014 — рік, який ми не обираємо пам\'ятати, але не можемо забути.',
  },
  {
    year: '2022',
    label: 'повномасштабна',
    // TODO: заміни власними словами, коли будеш готовий
    caption: '2022 — рана, яка ще не загоїлась.',
  },
];

const MEMORIES = [
  {
    year: '2023',
    thumb: 'linear-gradient(135deg,#3a2f55,#1a1f33)',
    caption: 'Рік, з якого починається цей відлік.',
    gallery: [
      { type: 'video', src: 'photos/2023/document_5345922785191408778.mp4', caption: 'Той момент, коли ще не знали — сміх теж буває паливом для ракети.' },
      { type: 'video', src: 'photos/2023/IMG_9236.mp4', caption: 'Камера трясеться сильніше за нас. Рекорд сміху зафіксовано.' },
      { type: 'image', src: 'photos/2023/photo_5345922785647643541_y.jpg', caption: 'Перша спроба обійняти цілу галактику. Вдалась лише наполовину.' },
      { type: 'image', src: 'photos/2023/photo_5345922785647643542_y.jpg', caption: 'Кадр, у якому сміх переміг усю режисуру.' },
      { type: 'image', src: 'photos/2023/photo_5345922785647643543_y.jpg', caption: '«Тримайся» сказали в переносному сенсі. Взяли буквально.' },
      { type: 'image', src: 'photos/2023/photo_5345922785647643544_y.jpg', caption: 'Фінальний кадр битви за плече. Переможця так і не визначили.' },
    ]
  },
  {
    year: '2024',
    thumb: 'linear-gradient(135deg,#4a3b2a,#1a1f33)',
    caption: 'Тихий рік. Але й тиха зірка встигла блиснути.',
    gallery: [
      { type: 'video', src: 'photos/2024/IMG_6540.mp4', caption: 'Рік, який мовчав більше, ніж говорив, — та встиг залишити цей кадр.' },
    ]
  },
  {
    year: '2025',
    thumb: 'linear-gradient(135deg,#2a3b4a,#1a1f33)',
    caption: 'Рік, який ще зовсім свіжий у пам\'яті.',
    gallery: [
      { type: 'image', src: 'photos/2025/IMG_2228.JPG', caption: 'Кадр, зроблений за секунду до чергової дурні.' },
      { type: 'image', src: 'photos/2025/IMG_2229.JPG', caption: 'Погляд, що каже більше, ніж будь-який підпис під ним.' },
      { type: 'image', src: 'photos/2025/IMG_2238.JPG', caption: 'Зловлено на льоту — як і всі найкращі моменти.' },
      { type: 'video', src: 'photos/2025/IMG_2779.mp4', caption: 'Відео, де сміх голосніший за динаміки телефону.' },
      { type: 'video', src: 'photos/2025/IMG_2784.mp4', caption: 'Тут усе й почалося — те, що потім довго переказували.' },
      { type: 'video', src: 'photos/2025/IMG_2788.mp4', caption: 'Продовження історії, яку краще дивитись, ніж переповідати.' },
      { type: 'video', src: 'photos/2025/IMG_2789.mp4', caption: 'Останні кадри року. І знову — сміх до сліз.' },
    ]
  },
  {
    year: '2026',
    thumb: 'linear-gradient(135deg,#4a2a3b,#1a1f33)',
    caption: 'Торкнись, щоб дізнатись, яка зірка запалюється цього року.',
    final: true, // ця зірка не відкриває галерею — вона запускає вибух + запрошення
    gallery: []
  },
];

// ---------- Invitation details ----------
const EVENT_DETAILS = {
  date: '1 серпня 2026',        
  time: '14:00', 
  place: 'просп. Академіка Глушкова 1, BBQ сад, альтанка №23',
  rsvpLink: '#rsvp',
};

const pathSection = document.getElementById('path-section');
const svg = document.getElementById('path-svg');
const pathEl = document.getElementById('constellation-path');
const woundPathEl = document.getElementById('wound-path');
const stardustGroup = document.getElementById('stardust-group');
const SVG_NS = 'http://www.w3.org/2000/svg';

function layoutConstellation() {
  const sectionHeight = pathSection.offsetHeight;
  const width = window.innerWidth;
  svg.setAttribute('viewBox', `0 0 ${width} ${sectionHeight}`);

  pathSection.querySelectorAll('.star-node, .wound-node').forEach(n => n.remove());
  stardustGroup.innerHTML = '';

  const marginTop = 130;
  const marginBottom = 160;
  const usableHeight = sectionHeight - marginTop - marginBottom;

  const timeline = [
    ...ORIGIN.map(o => ({ ...o, kind: 'origin' })),
    ...WOUNDS.map(w => ({ ...w, kind: 'wound' })),
    ...MEMORIES.map(m => ({ ...m, kind: 'memory' })),
  ];
  const n = timeline.length;

  const points = timeline.map((item, i) => {
    const t = n > 1 ? i / (n - 1) : 0;
    const y = marginTop + t * usableHeight;
    const zigzag = (i % 2 === 0) ? -1 : 1;
    const x = width / 2 + zigzag * (width * 0.18) + (Math.random() * 20 - 10);
    return { x, y, item };
  });

  // Build DOM nodes
  points.forEach(({ x, y, item }) => {
    if (item.kind === 'origin') {
      const node = document.createElement('div');
      node.className = 'origin-node';
      node.style.left = x + 'px';
      node.style.top = y + 'px';
      node.tabIndex = 0;
      node.innerHTML = `
        <div class="origin-dot"><span class="origin-year">${item.year}</span></div>
        <div class="wound-caption origin-caption">${item.caption}</div>
      `;
      pathSection.appendChild(node);
    } else if (item.kind === 'wound') {
      const node = document.createElement('div');
      node.className = 'wound-node';
      node.style.left = x + 'px';
      node.style.top = y + 'px';
      node.tabIndex = 0;
      node.innerHTML = `
        <div class="wound-dot"><span class="wound-year">${item.year}</span></div>
        <div class="wound-caption">${item.caption}</div>
      `;   
      pathSection.appendChild(node);
    } else {
      const node = document.createElement('div');
      node.className = 'star-node' + (item.final ? ' final' : '');
      node.style.left = x + 'px';
      node.style.top = y + 'px';
      node.tabIndex = 0;
      node.innerHTML = `
        <div class="star-dot"><span class="star-year">${item.year}</span></div>
        ${item.final ? '<div class="mystery-marks">? ? ? ? ? ? ?</div>' : ''}
        <div class="memory-hint">
          <p>${item.final ? 'Клікай — дізнаєшся, що далі ✦' : (item.caption ? item.caption + ' · клікай!' : 'Клікай, щоб зазирнути в цей рік')}</p>
        </div>
      `;
      const starDot = node.querySelector('.star-dot');
      node.addEventListener('click', () => {
        if (item.final) triggerExplosion(starDot);
        else triggerWarp(item);
      });
      node.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          if (item.final) triggerExplosion(starDot);
          else triggerWarp(item);
        }
      });
      pathSection.appendChild(node);
    }
  });

  // Broken path: starts for real at the 2005 origin star (birth), runs through the
  // wound years, and lands on the first memory star — nothing dangles into empty space.
  const specialPoints = points.filter(p => p.item.kind === 'origin' || p.item.kind === 'wound');
  const firstMemory = points.find(p => p.item.kind === 'memory');
  if (specialPoints.length && firstMemory) {
    let wd = `M ${specialPoints[0].x} ${specialPoints[0].y}`;
    for (let i = 1; i < specialPoints.length; i++) {
      wd += ` L ${specialPoints[i].x} ${specialPoints[i].y}`;
    }
    wd += ` L ${firstMemory.x} ${firstMemory.y}`;
    woundPathEl.setAttribute('d', wd);
  }

  // Main starry path connecting the 4 memory stars.
  const memoryPoints = points.filter(p => p.item.kind === 'memory');
  let d = '';
  memoryPoints.forEach((p, i) => {
    if (i === 0) { d = `M ${p.x} ${p.y}`; return; }
    const prev = memoryPoints[i - 1];
    const midY = (prev.y + p.y) / 2;
    d += ` C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
  });
  pathEl.setAttribute('d', d);
  const len = pathEl.getTotalLength();
  pathEl.style.strokeDasharray = len;
  pathEl.style.strokeDashoffset = len;

  // Sprinkle stardust along the main path.
  const dustCount = 22;
  for (let i = 0; i <= dustCount; i++) {
    const pt = pathEl.getPointAtLength((i / dustCount) * len);
    const jitterX = (Math.random() * 16 - 8);
    const jitterY = (Math.random() * 16 - 8);
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', pt.x + jitterX);
    circle.setAttribute('cy', pt.y + jitterY);
    circle.setAttribute('r', (Math.random() * 1.6 + 0.6).toFixed(2));
    circle.setAttribute('class', 'stardust-dot');
    circle.style.animationDelay = (Math.random() * 3) + 's';
    stardustGroup.appendChild(circle);
  }
}

layoutConstellation();
window.addEventListener('resize', layoutConstellation);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      pathEl.classList.add('drawn');
      woundPathEl.classList.add('drawn');
      stardustGroup.querySelectorAll('.stardust-dot').forEach(d => d.classList.add('drawn'));
    }
  });
}, { threshold: 0.05 });
observer.observe(pathSection);

// ---------- Explosion ----------
const canvas = document.getElementById('explosion-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function triggerExplosion(sourceEl) {
  const rect = sourceEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  canvas.style.opacity = 1;
  const particles = [];
  const colors = ['#f4efe3', '#d4a24c', '#e8c98a', '#7c6f9e'];
  for (let i = 0; i < 140; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 2;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * 2.5 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1
    });
  }

  let frame = 0;
  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (frame < 8) {
      ctx.fillStyle = `rgba(244,239,227,${0.5 - frame * 0.06})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.98; p.vy *= 0.98;
      p.life -= 0.012;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (frame < 140) requestAnimationFrame(animate);
    else { canvas.style.opacity = 0; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  animate();

  setTimeout(() => {
    document.getElementById('modal-date').textContent = EVENT_DETAILS.date;
    document.getElementById('modal-time').textContent = EVENT_DETAILS.time;
    document.getElementById('modal-place').textContent = EVENT_DETAILS.place;
    document.getElementById('invite-modal').classList.add('show');
  }, 500);
}

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('invite-modal').classList.remove('show');
});

// ---------- Warp jump → gallery (Star Trek style) ----------
const warpCanvas = document.getElementById('warp-canvas');
const warpCtx = warpCanvas.getContext('2d');
function resizeWarpCanvas() {
  warpCanvas.width = window.innerWidth;
  warpCanvas.height = window.innerHeight;
}
resizeWarpCanvas();
window.addEventListener('resize', resizeWarpCanvas);

function triggerWarp(memory) {
  warpCanvas.style.opacity = 1;
  const cx = warpCanvas.width / 2;
  const cy = warpCanvas.height / 2;
  const streaks = [];
  for (let i = 0; i < 200; i++) {
    const angle = Math.random() * Math.PI * 2;
    streaks.push({
      angle,
      dist: Math.random() * 40,
      speed: Math.random() * 14 + 6,
      len: Math.random() * 20 + 10,
    });
  }

  let frame = 0;
  const totalFrames = 55;
  function animate() {
    frame++;
    warpCtx.fillStyle = 'rgba(6,8,17,0.35)';
    warpCtx.fillRect(0, 0, warpCanvas.width, warpCanvas.height);

    streaks.forEach(s => {
      s.dist += s.speed;
      const x1 = cx + Math.cos(s.angle) * s.dist;
      const y1 = cy + Math.sin(s.angle) * s.dist;
      const x2 = cx + Math.cos(s.angle) * (s.dist + s.len + frame);
      const y2 = cy + Math.sin(s.angle) * (s.dist + s.len + frame);
      warpCtx.strokeStyle = `rgba(244,239,227,${Math.min(1, frame / 15)})`;
      warpCtx.lineWidth = 1.2;
      warpCtx.beginPath();
      warpCtx.moveTo(x1, y1);
      warpCtx.lineTo(x2, y2);
      warpCtx.stroke();
    });

    if (frame < totalFrames) {
      requestAnimationFrame(animate);
    } else {
      warpCtx.fillStyle = 'rgba(244,239,227,1)';
      warpCtx.fillRect(0, 0, warpCanvas.width, warpCanvas.height);
      setTimeout(() => {
        warpCanvas.style.opacity = 0;
        warpCtx.clearRect(0, 0, warpCanvas.width, warpCanvas.height);
        openGallery(memory);
      }, 120);
    }
  }
  animate();
}

// ---------- Gallery (thumbnail grid, nothing cropped) + Lightbox ----------
let currentGalleryItems = [];
let currentLightboxIndex = 0;

function openGallery(memory) {
  document.getElementById('gallery-year').textContent = memory.year;
  document.getElementById('gallery-caption').textContent = memory.caption || '';
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = '';

  currentGalleryItems = memory.gallery || [];

  if (!currentGalleryItems.length) {
    grid.innerHTML = `<div class="gallery-empty">Фото цього року ще в дорозі — скоро тут з'являться кадри.</div>`;
  } else {
    currentGalleryItems.forEach((item, index) => {
      const wrap = document.createElement('button');
      wrap.type = 'button';
      wrap.className = 'gallery-item';
      wrap.setAttribute('aria-label', item.caption || (item.type === 'video' ? 'Відео' : 'Фото'));

      const frame = document.createElement('div');
      frame.className = 'gallery-thumb-frame';

      if (item.type === 'video') {
        const vid = document.createElement('video');
        vid.src = item.src + '#t=0.1';
        vid.muted = true;
        vid.playsInline = true;
        vid.preload = 'metadata';
        vid.addEventListener('error', () => {
          frame.classList.add('media-broken');
        });
        frame.appendChild(vid);
        const playBadge = document.createElement('div');
        playBadge.className = 'play-badge';
        playBadge.innerHTML = '&#9658;';
        frame.appendChild(playBadge);
      } else {
        const img = document.createElement('img');
        img.src = item.src;
        img.loading = 'lazy';
        img.alt = item.caption || '';
        frame.appendChild(img);
      }

      wrap.appendChild(frame);

      if (item.caption) {
        const plaque = document.createElement('div');
        plaque.className = 'plaque';
        plaque.textContent = item.caption;
        wrap.appendChild(plaque);
      }

      wrap.addEventListener('click', () => openLightbox(index));
      grid.appendChild(wrap);
    });
  }
  document.getElementById('gallery-modal').classList.add('show');
}

document.getElementById('close-gallery').addEventListener('click', () => {
  document.getElementById('gallery-modal').classList.remove('show');
});

const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightbox-content');
const lightboxCaption = document.getElementById('lightbox-caption');

function renderLightboxItem(index) {
  const item = currentGalleryItems[index];
  if (!item) return;
  lightboxContent.innerHTML = '';

  let el;
  if (item.type === 'video') {
    el = document.createElement('video');
    el.src = item.src;
    el.controls = true;
    el.autoplay = true;
    el.playsInline = true;
    el.addEventListener('error', () => {
      lightboxContent.innerHTML = `
        <div class="media-error">
          <p>Цей файл не програється в браузері (типово для .mov з iPhone).</p>
          <p>Перекодуй його в .mp4 (H.264) — дивись <code>convert-videos.sh</code> у проєкті.</p>
          <a class="btn" href="${item.src}" download>Завантажити оригінал</a>
        </div>`;
    });
  } else {
    el = document.createElement('img');
    el.src = item.src;
    el.alt = item.caption || '';
  }
  lightboxContent.appendChild(el);
  lightboxCaption.textContent = item.caption || '';
}

function openLightbox(index) {
  currentLightboxIndex = index;
  renderLightboxItem(index);
  lightbox.classList.add('show');
}

function closeLightbox() {
  lightbox.classList.remove('show');
  lightboxContent.innerHTML = '';
}

function stepLightbox(delta) {
  if (!currentGalleryItems.length) return;
  currentLightboxIndex = (currentLightboxIndex + delta + currentGalleryItems.length) % currentGalleryItems.length;
  renderLightboxItem(currentLightboxIndex);
}

document.getElementById('close-lightbox').addEventListener('click', closeLightbox);
document.getElementById('lightbox-prev').addEventListener('click', () => stepLightbox(-1));
document.getElementById('lightbox-next').addEventListener('click', () => stepLightbox(1));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('show')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') stepLightbox(-1);
  if (e.key === 'ArrowRight') stepLightbox(1);
});

// ---------- Wishlist (live from Supabase) ----------
// Просте бронювання: перший, хто тисне "Забронювати", бронює річ одразу для всієї
// компанії (без сум і відсотків). Якщо в рядку wishlist_items є поля product_url
// та image_url — покажемо клікабельну назву і мініатюру фото.
const wishlistEl = document.getElementById('wishlist-list');

async function loadWishlist() {
  const { data: items, error: itemsError } = await supabaseClient
    .from('wishlist_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (itemsError) {
    wishlistEl.innerHTML = `<p style="color:var(--violet);text-align:center;">Не вдалось завантажити вішліст. Перевір config.js.</p>`;
    console.error(itemsError);
    return;
  }

  const { data: contributors, error: contribError } = await supabaseClient
    .from('wishlist_contributors')
    .select('*');

  if (contribError) console.error(contribError);

  wishlistEl.innerHTML = '';
  items.forEach(item => {
    const itemContributors = (contributors || []).filter(c => c.item_id === item.id);
    const isReserved = itemContributors.length > 0;
    const reservedNames = itemContributors.map(c => c.contributor_name).join(', ');

    const div = document.createElement('div');
    div.className = 'wish-item';

    const nameTag = item.product_url
      ? `<a class="name" href="${item.product_url}" target="_blank" rel="noopener">${item.name}</a>`
      : `<div class="name">${item.name}</div>`;

    const thumb = item.image_url
      ? `<img class="wish-thumb" src="${item.image_url}" alt="${item.name}" />`
      : '';

    div.innerHTML = `
      <div class="wish-item-top">
        <div class="left">
          ${thumb}
          <div>
            ${nameTag}
            <div class="status">${isReserved ? 'заброньовано ✦ ' + reservedNames : 'вільно'}</div>
          </div>
        </div>
        ${(() => {
          if (!isReserved) return `<button class="btn reserve-btn" data-item="${item.id}">Забронювати</button>`;
          const myToken = localStorage.getItem('wish_token_' + item.id);
          const mine = itemContributors.find(c => c.token && c.token === myToken);
          return mine ? `<button class="btn cancel-btn" data-item="${item.id}" data-contrib="${mine.id}">Скасувати</button>` : '';
        })()}
      </div>
      ${isReserved ? '' : `
      <form class="reserve-form" data-item="${item.id}">
        <input type="text" placeholder="Твоє ім'я" class="contrib-name" required />
        <button type="submit" class="btn primary">Готово</button>
      </form>`}
    `;
    wishlistEl.appendChild(div);
  });

  wishlistEl.querySelectorAll('.reserve-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = wishlistEl.querySelector(`.reserve-form[data-item="${btn.dataset.item}"]`);
      form.classList.toggle('open');
    });
  });

  wishlistEl.querySelectorAll('.reserve-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const itemId = form.dataset.item;
      const name = form.querySelector('.contrib-name').value.trim();
      if (!name) return;

      const token = crypto.randomUUID();
      const { error } = await supabaseClient.from('wishlist_contributors').insert({
        item_id: itemId,
        contributor_name: name,
        amount: 0,
        token,
      });

      if (error) {
        alert('Щось пішло не так, спробуй ще раз.');
        console.error(error);
        return;
      }
      localStorage.setItem('wish_token_' + itemId, token);
      loadWishlist();
    });
  });

  wishlistEl.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { error } = await supabaseClient
        .from('wishlist_contributors')
        .delete()
        .eq('id', btn.dataset.contrib);
      if (error) { alert('Не вдалось скасувати.'); console.error(error); return; }
      localStorage.removeItem('wish_token_' + btn.dataset.item);
      loadWishlist();
    });
  });
}

loadWishlist();

// ---------- RSVP: список гостей (живий, з Supabase — керується з /admin.html) ----------
// Кастомний dropdown замість нативного <select>, щоб повністю відповідав дизайну
// і давав легко повернутись назад до списку після "мене нема у списку".
const selectWrap = document.getElementById('name-select');
const selectTrigger = document.getElementById('name-select-trigger');
const selectLabel = document.getElementById('name-select-label');
const selectPanel = document.getElementById('name-select-panel');
const nameValueInput = document.getElementById('rsvp-name-value');
const nameOtherWrap = document.getElementById('name-other-wrap');
const nameOther = document.getElementById('rsvp-name-other');
const backToListBtn = document.getElementById('back-to-list-btn');

function selectGuest(name, label) {
  nameValueInput.value = name;
  selectLabel.textContent = label;
  selectTrigger.classList.add('has-value');
  closePanel();

  if (name === '__other__') {
    selectWrap.style.display = 'none';
    nameOtherWrap.style.display = 'flex';
    nameOther.focus();
  } else {
    selectWrap.style.display = 'block';
    nameOtherWrap.style.display = 'none';
    nameOther.value = '';
  }
}

function openPanel() { selectWrap.classList.add('open'); }
function closePanel() { selectWrap.classList.remove('open'); }

selectTrigger.addEventListener('click', () => {
  selectWrap.classList.contains('open') ? closePanel() : openPanel();
});

document.addEventListener('click', (e) => {
  if (!selectWrap.contains(e.target)) closePanel();
});

backToListBtn.addEventListener('click', () => {
  nameOtherWrap.style.display = 'none';
  nameOther.value = '';
  selectWrap.style.display = 'block';
  nameValueInput.value = '';
  selectLabel.textContent = "Обери своє ім'я";
  selectTrigger.classList.remove('has-value');
  openPanel();
});

let guestsCache = [];
let submittedNamesSet = new Set();

function normalizeName(name) {
  return (name || '').trim().toLowerCase();
}

async function loadGuestList() {
  const { data: guests, error } = await supabaseClient
    .from('guests')
    .select('name, invite_file')
    .order('name', { ascending: true });

  const { data: rsvps, error: rsvpError } = await supabaseClient
    .from('rsvp')
    .select('guest_name');

  if (rsvpError) console.error(rsvpError);
  submittedNamesSet = new Set((rsvps || []).map(r => normalizeName(r.guest_name)));

  guestsCache = guests || [];
  // Гості, які вже підтвердили прихід (є в таблиці rsvp), зникають зі списку вибору.
  // Якщо адмін видаляє їхній RSVP-запис — вони знову з'являються, бо список
  // завжди звіряється з живими даними з Supabase.
  const availableGuests = guestsCache.filter(g => !submittedNamesSet.has(normalizeName(g.name)));

  selectPanel.innerHTML = '';

  if (error) {
    console.error(error);
    selectPanel.innerHTML = `<div class="custom-select-empty">Не вдалось завантажити список</div>`;
  } else if (!availableGuests.length) {
    selectPanel.innerHTML = `<div class="custom-select-empty">Усі вже підтвердили прихід ✦</div>`;
  } else {
    availableGuests.forEach(g => {
      const opt = document.createElement('div');
      opt.className = 'custom-select-option';
      opt.textContent = g.name;
      opt.addEventListener('click', () => selectGuest(g.name, g.name));
      selectPanel.appendChild(opt);
    });
  }

  const otherOpt = document.createElement('div');
  otherOpt.className = 'custom-select-option other-option';
  otherOpt.textContent = 'Мене нема у списку';
  otherOpt.addEventListener('click', () => selectGuest('__other__', 'Мене нема у списку'));
  selectPanel.appendChild(otherOpt);
}

loadGuestList();

// ---------- RSVP ----------
const rsvpForm = document.getElementById('rsvp-form');
const RSVP_DONE_KEY = 'rsvp_done_name';

function lockRsvpForm(guestName) {
  const statusEl = document.getElementById('rsvp-status');
  rsvpForm.style.display = 'none';
  const already = document.createElement('p');
  already.className = 'rsvp-already';
  already.textContent = guestName
    ? `Дякуємо, ${guestName}! Твоя присутність вже підтверджена ✦`
    : 'Дякуємо! Твоя присутність вже підтверджена ✦';
  rsvpForm.parentNode.insertBefore(already, rsvpForm);
  if (statusEl) statusEl.textContent = '';
}

// Якщо людина вже підтвердила прихід раніше на цьому пристрої — форму більше не показуємо.
const alreadyDoneName = localStorage.getItem(RSVP_DONE_KEY);
if (alreadyDoneName !== null && rsvpForm) {
  lockRsvpForm(alreadyDoneName);
}

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('rsvp-status');
    const selected = nameValueInput.value;
    const guest_name = selected === '__other__' ? nameOther.value.trim() : selected;
    const guest_email = document.getElementById('rsvp-email').value.trim();
    const plus_one = document.getElementById('rsvp-plusone').checked;
    const comment = document.getElementById('rsvp-comment').value.trim();
    const favorite_year = document.getElementById('rsvp-year').value.trim();

    if (!guest_name) {
      statusEl.textContent = "Спочатку обери своє ім'я вище ↑";
      return;
    }

    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Захист від дублю: перевіряємо живі дані ще раз перед відправкою —
    // раптом хтось інший (або ти сам з іншої вкладки) вже підтвердив це ім'я.
    const { data: existing, error: checkError } = await supabaseClient
      .from('rsvp')
      .select('id')
      .ilike('guest_name', guest_name);

    if (checkError) console.error(checkError);
    if (existing && existing.length) {
      statusEl.textContent = 'Це ім\'я вже підтвердило прихід. Онови сторінку й обери інше.';
      if (submitBtn) submitBtn.disabled = false;
      loadGuestList();
      return;
    }

    const { error } = await supabaseClient.from('rsvp').insert({
      guest_name, guest_email, plus_one, comment, favorite_year
    });

    if (error) {
      statusEl.textContent = 'Не вдалось надіслати. Спробуй ще раз.';
      console.error(error);
      if (submitBtn) submitBtn.disabled = false;
      return;
    }
    statusEl.textContent = 'Дякую! Вже занотовано зіркою ✦';

    // Один раз — і все: більше форма для цього пристрою не з'явиться,
    // а ім'я зникає зі спільного списку вибору для всіх.
    localStorage.setItem(RSVP_DONE_KEY, guest_name);
    lockRsvpForm(guest_name);
    loadGuestList();

    const guestEntry = guestsCache.find(g => g.name === guest_name);
    const inviteImageUrl = guestEntry && guestEntry.invite_file
      ? 'https://ptupydcoysclmdjmwswt.supabase.co/storage/v1/object/public/invitations/' + guestEntry.invite_file
      : null;

    fetch('/api/send-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: guest_name, email: guest_email, inviteImageUrl }),
    }).catch(err => console.warn('send-invite не спрацював:', err));
  });
}