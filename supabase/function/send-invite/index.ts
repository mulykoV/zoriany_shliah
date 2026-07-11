import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { name, email } = await req.json();

  const html = `
    <div style="background:#0a0e1a;padding:40px;font-family:Georgia,serif;color:#f4efe3;text-align:center;">
      <p style="letter-spacing:.3em;color:#e8c98a;font-size:12px;">ЗАПРОШЕННЯ</p>
      <h1 style="font-style:italic;color:#f4efe3;">Зоряний шлях</h1>
      <p style="color:#7c6f9e;">Дорогий(а) <b style="color:#e8c98a;">${name}</b>,</p>
      <p>тебе чекають на святі. Твоя зірка вже запалена ✦</p>
    </div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Зоряний шлях <invite@yourdomain.com>",
      to: email,
      subject: "Твоє запрошення на зоряний шлях",
      html,
    }),
  });

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});