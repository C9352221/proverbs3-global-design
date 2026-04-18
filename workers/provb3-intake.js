/**
 * Cloudflare Worker: Proverbs 3 Intake Proxy
 *
 * Handles form submissions from provb3global.com (design + book intake forms)
 * and creates/updates GHL contacts. Replaces FormSubmit.
 *
 * SETUP:
 * 1. dash.cloudflare.com → Workers & Pages → Create
 * 2. Name it "provb3-intake"
 * 3. Paste this code
 * 4. Settings → Variables → Add (encrypted):
 *    - GHL_API_KEY = GHL Private Integration Token
 * 5. Expected endpoint: provb3-intake.<subdomain>.workers.dev
 */

const ALLOWED_ORIGINS = [
  'https://provb3global.com',
  'https://www.provb3global.com',
  'https://c9352221.github.io',
  'http://localhost',
  'http://127.0.0.1',
];

const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';
const GHL_LOCATION_ID = 'AIPTqymDwrSMF9zx8Pul';

const DESIGN_TAG = 'design intake';
const BOOK_TAG = 'book intake';

function ghlHeaders(apiKey) {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json',
  };
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || ALLOWED_ORIGINS[0],
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

async function addOrRetriggerTag(contactId, existingTags, apiKey, tag) {
  const url = `${GHL_API_URL}${contactId}`;
  const headers = ghlHeaders(apiKey);
  const hasTag = (existingTags || []).includes(tag);

  if (hasTag) {
    const tagsWithout = existingTags.filter(t => t !== tag);
    await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ tags: tagsWithout }),
    });
    await new Promise(r => setTimeout(r, 500));
  }

  const currentTags = hasTag
    ? existingTags.filter(t => t !== tag)
    : (existingTags || []);
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ tags: [...currentTags, tag] }),
  });
  return res.ok;
}

async function appendNote(contactId, note, apiKey) {
  const url = `${GHL_API_URL}${contactId}/notes`;
  await fetch(url, {
    method: 'POST',
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ body: note }),
  });
}

function splitName(fullName) {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() || '';
  const lastName = parts.join(' ');
  return { firstName, lastName };
}

function buildNote(body) {
  const lines = [];
  const skip = new Set(['email', 'phone', 'firstName', 'lastName', 'formType', 'contactName', 'contactEmail', 'contactPhone']);
  for (const [key, value] of Object.entries(body)) {
    if (skip.has(key)) continue;
    if (value === null || value === undefined || value === '') continue;
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
    lines.push(`${label}: ${value}`);
  }
  return lines.join('\n');
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o));
    const safeOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(safeOrigin) });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ success: false, message: 'Method not allowed' }, 405, safeOrigin);
    }

    if (!isAllowed) {
      return jsonResponse({ success: false, message: 'Forbidden' }, 403, safeOrigin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ success: false, message: 'Invalid request body' }, 400, safeOrigin);
    }

    const formType = body.formType || 'design-intake';
    const activeTag = formType === 'book-intake' ? BOOK_TAG : DESIGN_TAG;
    const activeSource = formType === 'book-intake' ? 'Book intake form' : 'Design intake form';

    const email = body.email || body.contactEmail || '';
    const phone = body.phone || body.contactPhone || '';
    const contactName = body.contactName || body.authorName || body.businessName || '';
    let firstName = body.firstName || '';
    let lastName = body.lastName || '';
    if (!firstName && contactName) {
      const split = splitName(contactName);
      firstName = split.firstName;
      lastName = split.lastName;
    }

    if (!email && !phone) {
      return jsonResponse({ success: false, message: 'Email or phone is required' }, 400, safeOrigin);
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ success: false, message: 'Invalid email address' }, 400, safeOrigin);
    }

    const ghlPayload = {
      locationId: GHL_LOCATION_ID,
      source: activeSource,
      tags: [activeTag],
    };
    if (firstName) ghlPayload.firstName = firstName;
    if (lastName) ghlPayload.lastName = lastName;
    if (email) ghlPayload.email = email;
    if (phone) ghlPayload.phone = phone;

    const noteText = `${formType === 'book-intake' ? 'Book Intake' : 'Design Intake'}\n${buildNote(body)}`;

    try {
      const ghlRes = await fetch(GHL_API_URL, {
        method: 'POST',
        headers: ghlHeaders(env.GHL_API_KEY),
        body: JSON.stringify(ghlPayload),
      });

      if (ghlRes.ok) {
        const result = await ghlRes.json();
        const contactId = result.contact?.id;
        if (contactId && noteText) {
          await appendNote(contactId, noteText, env.GHL_API_KEY);
        }
        return jsonResponse({
          success: true,
          message: 'Intake received',
          contactId,
        }, 200, safeOrigin);
      }

      const errText = await ghlRes.text();
      console.error('GHL error:', ghlRes.status, errText);

      if (ghlRes.status === 400 || ghlRes.status === 422 || errText.includes('duplicate') || errText.includes('already exists')) {
        let existingId = null;
        try {
          const errData = JSON.parse(errText);
          existingId = errData.meta?.contactId;
        } catch {}

        if (existingId) {
          const contactRes = await fetch(`${GHL_API_URL}${existingId}`, {
            headers: ghlHeaders(env.GHL_API_KEY),
          });
          if (contactRes.ok) {
            const contactData = await contactRes.json();
            const existingTags = contactData.contact?.tags || [];
            await addOrRetriggerTag(existingId, existingTags, env.GHL_API_KEY, activeTag);
            if (noteText) {
              await appendNote(existingId, noteText, env.GHL_API_KEY);
            }
          }
        }

        return jsonResponse({
          success: true,
          message: 'Welcome back! We received your intake.',
        }, 200, safeOrigin);
      }

      return jsonResponse({
        success: false,
        message: 'Something went wrong. Please try again later.',
      }, 502, safeOrigin);

    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({
        success: false,
        message: 'Service unavailable. Please try again later.',
      }, 503, safeOrigin);
    }
  },
};
