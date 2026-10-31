const ALLOWED_ORIGINS = new Set([
  "https://charlesatugonza077-hue.github.io",
  "http://localhost:8787"
]);

const json = (body, status = 200, origin = "") => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=UTF-8",
    "access-control-allow-origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://charlesatugonza077-hue.github.io",
    "vary": "Origin"
  }
});

const clean = (value, max) => String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
const escapeHtml = (value) => value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", "\"": "&quot;" }[char]));

function validate(payload) {
  const enquiry = {
    name: clean(payload.name, 120),
    business: clean(payload.business, 160),
    contact: clean(payload.contact, 180),
    help: clean(payload.help, 100),
    message: clean(payload.message, 1800),
    consent: payload.consent === true,
    source: clean(payload.source, 80) || "augusta-website"
  };
  if (!enquiry.name || !enquiry.business || !enquiry.contact || !enquiry.help || !enquiry.message || !enquiry.consent) return null;
  return enquiry;
}

function emailHtml(enquiry) {
  const row = (label, value) => `<p><strong>${label}</strong><br>${escapeHtml(value)}</p>`;
  return `<h2>New Augusta enquiry</h2>${row("Name", enquiry.name)}${row("Business or organisation", enquiry.business)}${row("Preferred contact", enquiry.contact)}${row("Support requested", enquiry.help)}${row("Situation", enquiry.message)}<p><small>Source: ${escapeHtml(enquiry.source)} · Consent confirmed: yes</small></p>`;
}

async function sendWithResend(enquiry, env) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "authorization": `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM_EMAIL,
      to: [env.ENQUIRY_TO_EMAIL],
      subject: `New Augusta enquiry: ${enquiry.business}`,
      html: emailHtml(enquiry),
      reply_to: enquiry.contact.includes("@") ? enquiry.contact : undefined
    })
  });
  if (!response.ok) throw new Error("Email delivery failed");
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://charlesatugonza077-hue.github.io", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "vary": "Origin" } });
    if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405, origin);
    if (!ALLOWED_ORIGINS.has(origin)) return json({ ok: false, error: "Origin not allowed" }, 403, origin);
    if (request.headers.get("content-type")?.includes("application/json") !== true) return json({ ok: false, error: "JSON required" }, 415, origin);
    try {
      const payload = await request.json();
      if (clean(payload.website, 80)) return json({ ok: true }, 200, origin);
      const enquiry = validate(payload);
      if (!enquiry) return json({ ok: false, error: "Please complete all required fields." }, 400, origin);
      await sendWithResend(enquiry, env);
      return json({ ok: true }, 200, origin);
    } catch (error) {
      return json({ ok: false, error: "Unable to send enquiry" }, 500, origin);
    }
  }
};
