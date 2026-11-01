import assert from "node:assert/strict";
import worker from "../src/index.js";

const origin = "https://charlesatugonza077-hue.github.io";
const env = {
  RESEND_API_KEY: "test-key",
  ENQUIRY_FROM_EMAIL: "Augusta <enquiries@example.com>",
  ENQUIRY_TO_EMAIL: "inbox@example.com"
};

const valid = {
  name: "Ada Example", business: "Example Shop", contact: "ada@example.com",
  help: "Customer follow-up", message: "Please help us organise customer follow-up.",
  consent: true, source: "augusta-website"
};

async function call({ method = "POST", headers = {}, body } = {}) {
  const request = new Request("https://worker.example/enquiries", {
    method, headers: { Origin: origin, "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return worker.fetch(request, env);
}

const originalFetch = globalThis.fetch;
try {
  let response = await call({ body: valid });
  assert.equal(response.status, 500, "delivery fails closed when Resend is unavailable");
  response = await call({ body: { ...valid, consent: false } });
  assert.equal(response.status, 400, "consent is required");
  response = await call({ headers: { Origin: "https://attacker.example" }, body: valid });
  assert.equal(response.status, 403, "unexpected origins are rejected");
  response = await call({ body: { ...valid, website: "bot-filled-this" } });
  assert.equal(response.status, 200, "honeypot returns harmless success");
  response = await call({ method: "GET" });
  assert.equal(response.status, 405, "only POST is accepted");
  let emailRequest;
  globalThis.fetch = async (url, init) => { emailRequest = { url, init }; return new Response(JSON.stringify({ id: "test-email" }), { status: 200 }); };
  response = await call({ body: { ...valid, business: "A < B" } });
  assert.equal(response.status, 200, "valid enquiry succeeds when delivery is available");
  const sent = JSON.parse(emailRequest.init.body);
  assert.equal(emailRequest.url, "https://api.resend.com/emails");
  assert.equal(sent.to[0], env.ENQUIRY_TO_EMAIL);
  assert.match(sent.html, /A &lt; B/, "email content is escaped");
  console.log("Augusta enquiry worker checks passed.");
} finally { globalThis.fetch = originalFetch; }
