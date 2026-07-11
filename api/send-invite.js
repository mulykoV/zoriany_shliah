// Vercel Serverless Function: POST /api/send-invite
// Викликається з script.js після успішного RSVP, щоб надіслати гостю
// персоналізовану email-листівку з його ім'ям.
//
// Потребує змінну середовища RESEND_API_KEY у Vercel:
// Project Settings → Environment Variables → RESEND_API_KEY = re_xxxxxxxx
// (ключ береш на resend.com після реєстрації й підтвердження домену відправника)

const { Resend } = require('resend');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'name і email обов\'язкові' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Проста, але атмосферна HTML-листівка. Це працює одразу без генерації картинки.
  // Якщо захочеш саме PNG-картку — наступний крок: підключити @vercel/og,
  // згенерувати зображення з ім'ям на фоні сузір'я і докласти його як inline-картинку.
  const html = `
  <div style="background:#0a0e1a;padding:48px 24px;font-family:Georgia,serif;text-align:center;">
    <p style="color:#d4a24c;letter-spacing:4px;font-size:11px;text-transform:uppercase;margin-bottom:16px;">
      Плеяда · нове сузір'я
    </p>
    <h1 style="color:#f4efe3;font-style:italic;font-size:32px;margin:0 0 24px;">
      Зірка запалена, ${name}
    </h1>
    <p style="color:#7c6f9e;font-size:15px;line-height:1.8;max-width:420px;margin:0 auto 28px;">
      Твоя присутність підтверджена. Чекаємо саме на тебе — приходь запалити разом з нами нову зірку.
    </p>
    <a href="https://ТВІЙ-ДОМЕН.vercel.app"
       style="display:inline-block;background:#d4a24c;color:#0a0e1a;padding:12px 28px;
              border-radius:3px;text-decoration:none;font-size:14px;letter-spacing:0.5px;">
      Переглянути запрошення
    </a>
  </div>`;

  try {
    const data = await resend.emails.send({
      from: 'Зоряний шлях <invite@ТВІЙ-ПІДТВЕРДЖЕНИЙ-ДОМЕН.com>',
      to: email,
      subject: `${name}, тебе кличе нова зірка ✦`,
      html,
    });
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Не вдалось надіслати лист' });
  }
};
