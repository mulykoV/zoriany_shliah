# Зоряний шлях

Сайт-запрошення на день народження: інтерактивне сузір'я спогадів, що завершується вибухом-запрошенням, вішліст із груповим бронюванням і RSVP.

## Що всередині

- `index.html` — сторінка
- `style.css` — весь вигляд
- `script.js` — анімації сузір'я/вибуху + логіка вішліста й RSVP
- `config.js` — сюди встав ключі Supabase (не комітити з реальними production-секретами у публічний репо, якщо репо публічний — anon-ключ можна, service_role — ніколи)
- `supabase/schema.sql` — SQL-схема бази

## Кроки ініціалізації з нуля

### 1. Git + GitHub
```bash
cd zoriany-shliah
git init
git add .
git commit -m "init: зоряний шлях"
```
Створи новий репозиторій на github.com (можна приватний), тоді:
```bash
git remote add origin https://github.com/ТВІЙ_НІК/zoriany-shliah.git
git branch -M main
git push -u origin main
```

### 2. Supabase (безкоштовний тір)
1. Зареєструйся на supabase.com → New Project (обери регіон ближче до України/Європи)
2. Дочекайся ініціалізації проєкту (~2 хв)
3. Відкрий SQL Editor → New query → встав весь вміст `supabase/schema.sql` → Run
4. Перейди в Project Settings → API → скопzіюй `Project URL` і `anon public` ключ
5. Встав їх у `config.js` замість `YOUR-PROJECT` і `YOUR-ANON-PUBLIC-KEY`
6. Заповни свої реальні пункти вішліста прямо в Supabase → Table Editor → `wishlist_items` (онови/додай рядки, встанови справжні суми)

⚠️ **Важливо:** безкоштовний проєкт Supabase призупиняється після ~1 тижня без запитів. Якщо гості не заходять довго — просто відкрий дашборд Supabase і натисни "Resume project", секунда справи.

### 3. Vercel (деплой)
1. Зареєструйся на vercel.com через GitHub
2. New Project → обери репозиторій `zoriany-shliah`
3. Framework Preset: **Other** (це статика, білд не потрібен)
4. Deploy — за хвилину отримаєш посилання типу `zoriany-shliah.vercel.app`
5. (Опційно) Settings → Domains → додай власний домен, якщо є

Кожен `git push` в `main` автоматично передеплоїть сайт.

### 4. Наповнення контентом
- У `script.js` онови масив `memories` — реальні роки, тексти, і, коли будуть фото, заміни `photo: 'linear-gradient(...)'` на `photo: 'url(photos/2008.jpg)'` (додай фото в папку `photos/`)
- Заповни `EVENT_DETAILS` у `script.js` — дата, час, місце
- Онови пункти вішліста прямо в Supabase Table Editor

### 5. Локальний перегляд перед пушем
Просто відкрий `index.html` у браузері, або для коректної роботи fetch-запитів онов через локальний сервер:
```bash
npx serve .
```

## Що можна доробити далі
- Прев'ю-картинка для соцмереж (og:image) зі стилізованим сузір'ям
- Лічильник "днів до дня народження" на hero-екрані
- Модерація вішліста — проста admin-сторінка з паролем через Supabase Auth (зараз редагування тільки через Table Editor вручну)
