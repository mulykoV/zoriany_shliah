require('dotenv').config();
const cors = require('cors');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

// ---------- Заповни ці дані про подію ----------
const EVENT = {
  date: '1 серпня 2026',        // напр. '25 липня 2026'
  time: '14:00',          // напр. '18:00'
  place: 'просп. Академіка Глушкова 1, BBQ сад, альтанка №23',      // напр. 'вул. Хрещатик, 1, Київ'
  mapLink: 'https://www.google.com/maps/place/bbq+сад/data=!4m2!3m1!1s0x40d4c918b30c1159:0xd1dbd6ff46bbdd6d?sa=X&ved=1t:242&ictx=111',                    // напр. 'https://maps.google.com/?q=...' (можна лишити порожнім)               // напр. 'у темних тонах' (можна лишити порожнім)
  dressCode: '',
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post('/api/send-invite', async (req, res) => {
  const { name, email, inviteImageUrl } = req.body;
  if (!email || !name) return res.status(400).json({ error: "name і email обов'язкові" });

  try {
    let imageHtml = '';
    const attachments = [];

    if (inviteImageUrl) {
      const imgResponse = await fetch(inviteImageUrl);
      if (imgResponse.ok) {
        const buffer = Buffer.from(await imgResponse.arrayBuffer());
        attachments.push({
          filename: 'invite.png',
          content: buffer,
          cid: 'inviteimage',
        });
        imageHtml = `
          <tr>
            <td style="padding:0 0 28px;">
              <img src="cid:inviteimage" width="100%" style="max-width:460px;border-radius:10px;display:block;margin:0 auto;" />
            </td>
          </tr>`;
      }
    }

    const detailsRows = [
      EVENT.date ? { label: 'Дата', value: EVENT.date } : null,
      EVENT.time ? { label: 'Час', value: EVENT.time } : null,
      EVENT.place ? {
        label: 'Місце',
        value: EVENT.mapLink ? `<a href="${EVENT.mapLink}" style="color:#e8c98a;text-decoration:underline;">${EVENT.place}</a>` : EVENT.place,
      } : null,
      EVENT.dressCode ? { label: 'Дрес-код', value: EVENT.dressCode } : null,
    ].filter(Boolean);

    const detailsHtml = detailsRows.map(row => `
      <tr>
        <td style="padding:6px 0;color:#7c6f9e;font-size:13px;letter-spacing:.05em;text-transform:uppercase;width:110px;vertical-align:top;">${row.label}</td>
        <td style="padding:6px 0;color:#f4efe3;font-size:16px;">${row.value}</td>
      </tr>`).join('');

    const html = `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#060811;padding:40px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width:520px;background:#0a0e1a;border:1px solid rgba(212,162,76,0.4);border-radius:10px;overflow:hidden;">
              <tr>
                <td style="height:4px;background:linear-gradient(90deg,#d4a24c,#e8c98a,#d4a24c);"></td>
              </tr>
              <tr>
                <td style="padding:36px 32px 8px;text-align:center;font-family:Georgia,'Times New Roman',serif;">
                  <p style="margin:0 0 6px;color:#e8c98a;font-size:12px;letter-spacing:.35em;text-transform:uppercase;">Зоряний шлях</p>
                  <p style="margin:0 0 28px;color:#7c6f9e;font-size:16px;line-height:1.6;">
                    Дорогий(а) <b style="color:#e8c98a;">${name}</b>, тебе чекають на святі ✦
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    ${imageHtml}
                  </table>
                </td>
              </tr>
              ${detailsRows.length ? `
              <tr>
                <td style="padding:0 32px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(124,111,158,0.25);padding-top:20px;">
                    ${detailsHtml}
                  </table>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:28px 32px 36px;text-align:center;font-family:Georgia,serif;">
                  <p style="margin:0;color:#4a4470;font-size:13px;letter-spacing:.1em;">✦ ✦ ✦</p>
                </td>
              </tr>
              <tr>
                <td style="height:4px;background:linear-gradient(90deg,#d4a24c,#e8c98a,#d4a24c);"></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;

    await transporter.sendMail({
      from: `Зоряний шлях <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Запрошення на зоряний шлях',
      text: `Дорогий(а) ${name}, тебе чекають на святі. Твоя зірка вже запалена.${EVENT.date ? ` Дата: ${EVENT.date}.` : ''}${EVENT.time ? ` Час: ${EVENT.time}.` : ''}${EVENT.place ? ` Місце: ${EVENT.place}.` : ''}`,
      html,
      attachments,
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Сервер запущено на http://localhost:3001'));