// ---------- Background stars (той самий фон, що і на головній) ----------
const starfield = document.getElementById('starfield');
for (let i = 0; i < 80; i++) {
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

const inviteFileSelect = document.getElementById('guest-invite-file');

async function loadCertificateFiles() {
  const { data, error } = await supabaseClient.storage.from('invitations').list();
  if (error) {
    console.error(error);
    inviteFileSelect.innerHTML = `<option value="">Без сертифіката</option>`;
    return;
  }
  const files = (data || []).filter(f => f.name && !f.name.startsWith('.'));
  inviteFileSelect.innerHTML = `<option value="">Без сертифіката</option>` +
    files.map(f => `<option value="${f.name}">${f.name}</option>`).join('');
}

loadCertificateFiles();

// ---------- Auth ----------
const loginSection = document.getElementById('admin-login');
const dashboardSection = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');

async function checkSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    showDashboard();
  } else {
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginStatus.textContent = '';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    loginStatus.textContent = 'Невірний email або пароль.';
    return;
  }
  showDashboard();
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

function showDashboard() {
  loginSection.style.display = 'none';
  dashboardSection.style.display = 'block';
  loadGuests();
  loadRsvps();
  loadWishlistAdmin();
}

checkSession();

// ---------- Tabs ----------
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.admin-panel').forEach(p => p.style.display = 'none');
    document.getElementById('panel-' + tab.dataset.tab).style.display = 'block';
  });
});

// ---------- Гості ----------
const guestsTbody = document.getElementById('guests-tbody');

async function loadGuests() {
  const { data: guests, error } = await supabaseClient
    .from('guests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    guestsTbody.innerHTML = `<tr><td colspan="5" class="muted">Гостей ще нема — додай першого вище.</td></tr>`;
    return;
  }

  const { data: rsvps } = await supabaseClient.from('rsvp').select('guest_name');
  const rsvpNames = new Set((rsvps || []).map(r => r.guest_name));

  guestsTbody.innerHTML = '';
  if (!guests.length) {
    guestsTbody.innerHTML = `<tr><td colspan="5" class="muted">Гостей ще нема — додай першого вище.</td></tr>`;
    return;
  }

  guests.forEach(g => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${g.name}</td>
      <td class="muted">${g.email || '—'}</td>
      <td class="muted">${g.invite_file || '—'}</td>
      <td>${g.invite_email_sent_at
        ? `<span class="tag yes">✓ ${new Date(g.invite_email_sent_at).toLocaleDateString('uk-UA')}</span>`
        : '<span class="tag">не надіслано</span>'}</td>
      <td>${rsvpNames.has(g.name) ? '<span class="tag yes">прийде</span>' : '<span class="tag">чекаємо</span>'}</td>
      <td><button class="admin-delete-btn" data-id="${g.id}">Видалити</button></td>
    `;
    guestsTbody.appendChild(tr);
  });

  guestsTbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Видалити цього гостя зі списку?')) return;
      const { error } = await supabaseClient.from('guests').delete().eq('id', btn.dataset.id);
      if (error) { alert('Не вдалось видалити: ' + error.message); return; }
      loadGuests();
    });
  });
}

document.getElementById('guest-add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('guest-name').value.trim();
  const email = document.getElementById('guest-email').value.trim();
  const invite_file = inviteFileSelect.value || null;
  if (!name) return;

  const { error } = await supabaseClient.from('guests').insert({ name, email: email || null, invite_file });
  if (error) { alert('Не вдалось додати: ' + error.message); return; }

  document.getElementById('guest-add-form').reset();
  loadGuests();
});

// ---------- RSVP ----------
const rsvpTbody = document.getElementById('rsvp-tbody');

async function loadRsvps() {
  const { data, error } = await supabaseClient
    .from('rsvp')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    rsvpTbody.innerHTML = `<tr><td colspan="7" class="muted">Помилка завантаження: ${error.message}</td></tr>`;
    return;
  }

  rsvpTbody.innerHTML = '';
  if (!data.length) {
    rsvpTbody.innerHTML = `<tr><td colspan="7" class="muted">Ще ніхто не підтвердив прихід.</td></tr>`;
    return;
  }

  data.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.guest_name}</td>
      <td class="muted">${r.guest_email || '—'}</td>
      <td>${r.plus_one ? '✓' : '—'}</td>
      <td class="muted">${r.favorite_year || '—'}</td>
      <td class="muted">${r.comment || '—'}</td>
      <td class="muted">${new Date(r.created_at).toLocaleDateString('uk-UA')}</td>
      <td><button class="admin-delete-btn" data-id="${r.id}">Видалити</button></td>
    `;
    rsvpTbody.appendChild(tr);
  });

  rsvpTbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Видалити цей RSVP-запис?')) return;
      const { error } = await supabaseClient.from('rsvp').delete().eq('id', btn.dataset.id);
      if (error) { alert('Не вдалось видалити: ' + error.message); return; }
      loadRsvps();
      loadGuests(); // оновити колонку "RSVP" у гостях
    });
  });
}

// ---------- Вішліст ----------
const wishlistAdminList = document.getElementById('wishlist-admin-list');

async function loadWishlistAdmin() {
  const { data: items, error } = await supabaseClient
    .from('wishlist_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    wishlistAdminList.innerHTML = `<p class="muted">Помилка завантаження: ${error.message}</p>`;
    return;
  }

  const { data: contributors } = await supabaseClient.from('wishlist_contributors').select('*');

  wishlistAdminList.innerHTML = '';
  if (!items.length) {
    wishlistAdminList.innerHTML = `<p class="muted">Вішліст поки порожній — додай перший товар вище.</p>`;
    return;
  }

  items.forEach(item => {
    const itemContributors = (contributors || []).filter(c => c.item_id === item.id);
    const collected = itemContributors.reduce((s, c) => s + Number(c.amount || 0), 0);

    const card = document.createElement('div');
    card.className = 'wishlist-admin-card';
    card.innerHTML = `
      <div class="row">
        <div style="display:flex; gap:1rem; align-items:flex-start;">
          ${item.image_url ? `<img class="thumb" src="${item.image_url}" />` : ''}
          <div>
            <div class="item-name">${item.name}</div>
            <div class="item-meta">
              ${item.needed_amount > 0 ? `${collected} / ${item.needed_amount}` : (itemContributors.length ? 'застовпили' : 'вільно')}
              ${item.product_url ? ` · <a href="${item.product_url}" target="_blank" style="color:var(--gold-soft);">товар ↗</a>` : ''}
            </div>
          </div>
        </div>
        <button class="admin-delete-btn" data-item-id="${item.id}">Видалити товар</button>
      </div>
      <div class="contributors">
        ${itemContributors.length === 0
          ? '<div class="contributor-empty">Ще ніхто не забронював</div>'
          : itemContributors.map(c => `
              <div class="contributor-row">
                <span>${c.contributor_name}${item.needed_amount > 0 ? ` — ${c.amount || 0}` : ''}</span>
                <button class="admin-delete-btn" data-contrib-id="${c.id}">Зняти бронь</button>
              </div>
            `).join('')}
      </div>
    `;
    wishlistAdminList.appendChild(card);
  });

  wishlistAdminList.querySelectorAll('[data-item-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Видалити цей товар з вішліста разом з усіма бронюваннями?')) return;
      const { error } = await supabaseClient.from('wishlist_items').delete().eq('id', btn.dataset.itemId);
      if (error) { alert('Не вдалось видалити: ' + error.message); return; }
      loadWishlistAdmin();
    });
  });

  wishlistAdminList.querySelectorAll('[data-contrib-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Зняти це бронювання?')) return;
      const { error } = await supabaseClient.from('wishlist_contributors').delete().eq('id', btn.dataset.contribId);
      if (error) { alert('Не вдалось зняти: ' + error.message); return; }
      loadWishlistAdmin();
    });
  });
}

document.getElementById('item-add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('item-name').value.trim();
  const product_url = document.getElementById('item-product-url').value.trim();
  const image_url = document.getElementById('item-image-url').value.trim();
  const needed_amount = Number(document.getElementById('item-amount').value || 0);
  const sort_order = Number(document.getElementById('item-sort').value || 0);
  if (!name) return;

  const { error } = await supabaseClient.from('wishlist_items').insert({
    name,
    product_url: product_url || null,
    image_url: image_url || null,
    needed_amount,
    sort_order,
  });
  if (error) { alert('Не вдалось додати: ' + error.message); return; }

  document.getElementById('item-add-form').reset();
  loadWishlistAdmin();
});
