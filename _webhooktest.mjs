import crypto from "node:crypto";

const URL_ENDPOINT = "https://automatic-platform-beige.vercel.app/api/webhooks/moneroo";
const SECRET = process.env.MONEROO_WEBHOOK_SECRET;

async function send(label, body, signature) {
  const response = await fetch(URL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Moneroo-Signature": signature },
    body,
  });
  const text = await response.text();
  console.log(`${label}: HTTP ${response.status} ${text.slice(0, 140)}`);
}

const payload = JSON.stringify({
  event: "payment.success",
  data: { id: "test_payment_inexistant_001", amount: 1000, currency: "XOF", status: "success" },
});
const good = crypto.createHmac("sha256", SECRET).update(payload, "utf8").digest("hex");

await send("signature valide", payload, good);
await send("signature fausse", payload, "0".repeat(64));
await send("sans signature  ", payload, "");
