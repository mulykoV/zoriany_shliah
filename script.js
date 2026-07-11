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
// Заміни на реальні роки/фото/тексти. photo може бути посиланням на реальне зображення
// (background-image через url(...)) замість градієнта-плейсхолдера.
const memories = [
  { year: '2008', text: 'Той самий кумедний кадр — ще до того, як хтось із нас знав, ким стане.', photo: 'linear-gradient(135deg,#5a4a2a,#1a1f33)' },
  { year: '2016', text: 'Перша спільна вечірка на даху — саме тоді все почалося.', photo: 'linear-gradient(135deg,#3a2f55,#1a1f33)' },
  { year: '2018', text: 'Похід у Карпати, де хтось загубив намет, а знайшов найкращих друзів.', photo: 'linear-gradient(135deg,#4a3b2a,#1a1f33)' },
  { year: '2020', text: 'Той рік, коли ми святкували через екран — і все одно було тепло.', photo: 'linear-gradient(135deg,#2a3b4a,#1a1f33)' },
  { year: '2022', text: 'Перше спільне подорож містом свічок і дощу.', photo: 'linear-gradient(135deg,#4a2a3b,#1a1f33)' },
  { year: '2024', text: 'Ніч, коли ми вирішили, що традиція мусить тривати завжди.', photo: 'linear-gradient(135deg,#2a4a3b,#1a1f33)' },
];

// Щоб використати реальне фото замість градієнта:
// photo: 'url(photos/2008.jpg)'   (додай файл у папку /photos)

// ---------- Invitation details ----------
// Заповни реальними даними — вони підставляться в модалку після вибуху
const EVENT_DETAILS = {
  date: '— впиши дату —',
  time: '— впиши час —',
  place: '— впиши адресу —',
  rsvpLink: '#rsvp',
};

const pathSection = document.getElementById('path-section');
const svg = document.getElementById('path-svg');
const pathEl = document.getElementById('constellation-path');

function layoutConstellation() {
  const sectionHeight = pathSection.offsetHeight;
  const width = window.innerWidth;
  svg.setAttribute('viewBox', `0 0 ${width} ${sectionHeight}`);

  pathSection.querySelectorAll('.star-node, .final-star-wrap').forEach(n => n.remove());

  const points = [];
  const n = memories.length;
  const marginTop = 100;
  const marginBottom = 260;
  const usableHeight = sectionHeight - marginTop - marginBottom;

  memories.forEach((m, i) => {
    const t = i / (n - 1);
    const y = sectionHeight - marginBottom - t * usableHeight;
    const zigzag = (i % 2 === 0) ? -1 : 1;
    const x = width / 2 + zigzag * (width * 0.18) + (Math.random() * 20 - 10);
    points.push({ x, y });

    const node = document.createElement('div');
    node.className = 'star-node';
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    node.tabIndex = 0;
    node.innerHTML = `
      <div class="star-dot"></div>
      <div class="year-label">${m.year}</div>
      <div class="memory-card" style="${x > width / 2 ? 'right:30px;' : 'left:30px;'} top:-40px;">
        <div class="memory-photo" style="background:${m.photo}"></div>
        <div class="year">${m.year}</div>
        <p>${m.text}</p>
      </div>
    `;
    pathSection.appendChild(node);
  });

  const finalY = sectionHeight - marginBottom - usableHeight - 90;
  const finalX = width / 2;
  points.push({ x: finalX, y: finalY });

  const finalWrap = document.createElement('div');
  finalWrap.className = 'final-star-wrap';
  finalWrap.style.left = finalX + 'px';
  finalWrap.style.top = finalY + 'px';
  finalWrap.style.transform = 'translate(-50%,-50%)';
  finalWrap.innerHTML = `
    <button class="final-star" id="final-star-btn">????</button>
    <div class="final-label">торкнись, щоб дізнатись</div>
  `;
  pathSection.appendChild(finalWrap);

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const midY = (prev.y + cur.y) / 2;
    d += ` C ${prev.x} ${midY}, ${cur.x} ${midY}, ${cur.x} ${cur.y}`;
  }
  pathEl.setAttribute('d', d);
  pathEl.style.strokeDasharray = pathEl.getTotalLength();
  pathEl.style.strokeDashoffset = pathEl.getTotalLength();

  document.getElementById('final-star-btn').addEventListener('click', triggerExplosion);
}

layoutConstellation();
window.addEventListener('resize', layoutConstellation);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) pathEl.classList.add('drawn');
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

function triggerExplosion() {
  const btn = document.getElementById('final-star-btn');
  const rect = btn.getBoundingClientRect();
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

// ---------- Wishlist (live from Supabase) ----------
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
    const collected = itemContributors.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const pct = item.needed_amount > 0
      ? Math.min(100, Math.round(collected / item.needed_amount * 100))
      : (itemContributors.length > 0 ? 100 : 0);

    const div = document.createElement('div');
    div.className = 'wish-item';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'stretch';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
        <div class="left">
          <div class="name">${item.name}</div>
          <div class="progress">
            ${item.needed_amount > 0 ? pct + '% зібрано' : (itemContributors.length ? 'застовпили' : 'вільно')}
            ${itemContributors.length ? '· ' + itemContributors.map(c => c.contributor_name).join(', ') : ''}
          </div>
          ${item.needed_amount > 0 ? `<div class="wish-bar"><div class="wish-bar-fill" style="width:${pct}%"></div></div>` : ''}
        </div>
        <button class="btn reserve-btn" data-item="${item.id}">Долучитись</button>
      </div>
      <form class="reserve-form" data-item="${item.id}">
        <input type="text" placeholder="Твоє ім'я" class="contrib-name" required />
        ${item.needed_amount > 0 ? '<input type="number" placeholder="Сума" class="contrib-amount" min="0" />' : ''}
        <button type="submit" class="btn primary">Готово</button>
      </form>
    `;
    wishlistEl.appendChild(div);
  });

  // toggle mini-forms
  wishlistEl.querySelectorAll('.reserve-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = wishlistEl.querySelector(`.reserve-form[data-item="${btn.dataset.item}"]`);
      form.classList.toggle('open');
    });
  });

  // handle submit -> insert contributor row -> reload
  wishlistEl.querySelectorAll('.reserve-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const itemId = form.dataset.item;
      const name = form.querySelector('.contrib-name').value.trim();
      const amountInput = form.querySelector('.contrib-amount');
      const amount = amountInput ? Number(amountInput.value || 0) : 0;
      if (!name) return;

      const { error } = await supabaseClient.from('wishlist_contributors').insert({
        item_id: itemId,
        contributor_name: name,
        amount: amount,
      });

      if (error) {
        alert('Щось пішло не так, спробуй ще раз.');
        console.error(error);
        return;
      }
      loadWishlist();
    });
  });
}

loadWishlist();

// ---------- RSVP ----------
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('rsvp-status');
    const guest_name = document.getElementById('rsvp-name').value.trim();
    const plus_one = document.getElementById('rsvp-plusone').checked;
    const comment = document.getElementById('rsvp-comment').value.trim();
    const favorite_year = document.getElementById('rsvp-year').value.trim();

    if (!guest_name) return;

    const { error } = await supabaseClient.from('rsvp').insert({
      guest_name, plus_one, comment, favorite_year
    });

    if (error) {
      statusEl.textContent = 'Не вдалось надіслати. Спробуй ще раз.';
      console.error(error);
      return;
    }
    statusEl.textContent = 'Дякую! Вже занотовано зіркою ✦';
    rsvpForm.reset();
  });
}
