/**
 * cart-checkout.js
 * Cloudflare Worker — receives a cart payload, creates a Stripe
 * Checkout Session with multiple line items, returns the session URL.
 *
 * ENV (set as Cloudflare Worker secrets):
 *   STRIPE_SECRET_KEY  — Stripe restricted API key (rk_live_...)
 *
 * REQUEST shape (POST):
 *   {
 *     "items": [
 *       { "price_id": "price_xxx", "quantity": 1 },
 *       ...
 *     ],
 *     "success_url": "https://provb3global.com/thank-you.html",
 *     "cancel_url":  "https://provb3global.com/shop.html"
 *   }
 *
 * RESPONSE:
 *   { "url": "https://checkout.stripe.com/c/pay/cs_..." }
 */

const ALLOWED_ORIGINS = [
  'https://provb3global.com',
  'https://www.provb3global.com',
  'https://c9352221.github.io',
  // Local dev:
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

// Whitelist of valid price IDs — prevents anyone from injecting random Stripe price IDs
const VALID_PRICE_IDS = new Set([
  'price_1TTPLIA4sVJmlCYROZoRHkQ2', // Additional Revision Round
  'price_1TTPLuA4sVJmlCYRZAhmyoIn', // Video Embed
  'price_1TTPMQA4sVJmlCYRzkIMXGoJ', // Extra Page
  'price_1TTPNiA4sVJmlCYRAGr1HsD5', // Booking Calendar Embed
  'price_1TTPOMA4sVJmlCYRzGvnjhII', // Form to CRM Integration
  'price_1TTPPDA4sVJmlCYR8tiC0quE', // Google Analytics 4 Setup
  'price_1TTPR2A4sVJmlCYR7ZuEpWcl', // Meta Pixel Install
  'price_1TTPTEA4sVJmlCYRmGQ4t3PF', // Live Reviews Widget
  'price_1TTPVFA4sVJmlCYROWUxkYQG', // Logo Design
  'price_1TTPVmA4sVJmlCYR1sAp2TUq', // Favicon Design
  'price_1TTPWVA4sVJmlCYR0OTwGaB8', // Newsletter Popup
  'price_1TTPXGA4sVJmlCYRsAmH73YI', // Speed Optimization Pass
]);

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, origin);
    }

    if (!env.STRIPE_SECRET_KEY) {
      return jsonResponse({ error: 'Server not configured' }, 500, origin);
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400, origin);
    }

    const items = Array.isArray(body.items) ? body.items : null;
    if (!items || items.length === 0) {
      return jsonResponse({ error: 'Cart is empty' }, 400, origin);
    }

    // Validate each item against the whitelist + sane quantity bounds
    const lineItems = [];
    for (const item of items) {
      const priceId = String(item.price_id || '');
      const qty = parseInt(item.quantity, 10);

      if (!VALID_PRICE_IDS.has(priceId)) {
        return jsonResponse({ error: `Invalid item: ${priceId}` }, 400, origin);
      }
      if (!Number.isFinite(qty) || qty < 1 || qty > 50) {
        return jsonResponse({ error: 'Invalid quantity' }, 400, origin);
      }

      lineItems.push({ price: priceId, quantity: qty });
    }

    const successUrl = body.success_url || 'https://provb3global.com/thank-you.html';
    const cancelUrl = body.cancel_url || 'https://provb3global.com/shop.html';

    // Build Stripe Checkout Session via form-urlencoded API
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);
    params.append('billing_address_collection', 'auto');
    params.append('allow_promotion_codes', 'true');
    lineItems.forEach((li, i) => {
      params.append(`line_items[${i}][price]`, li.price);
      params.append(`line_items[${i}][quantity]`, String(li.quantity));
    });

    let stripeRes;
    try {
      stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
    } catch (e) {
      return jsonResponse({ error: 'Network error reaching Stripe' }, 502, origin);
    }

    const data = await stripeRes.json();
    if (!stripeRes.ok) {
      const msg = (data && data.error && data.error.message) || 'Stripe error';
      return jsonResponse({ error: msg }, stripeRes.status, origin);
    }

    return jsonResponse({ url: data.url, id: data.id }, 200, origin);
  },
};
