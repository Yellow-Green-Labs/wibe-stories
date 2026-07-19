// Short URL endpoint for shared cards.
// Serves OG meta for bots (WhatsApp/Twitter crawlers) and
// a landing page with branding + card image + "Create Your Own" for humans.
//
// GET /c/:id
// og:image points to /api/og/:id which reads the JPEG from Blob storage
// and serves it directly to crawlers (same-origin, no proxy hop).
// WhatsApp/Facebook crawlers fetch a ~30–60 KB hero image instead of a
// 200 KB padded PNG. Original card PNG is used for the landing-page display.

import { head } from '@vercel/blob';

const BLOB_HOST = 'jkzbaevzmimaelrr.public.blob.vercel-storage.com';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  const host = req.headers.host || 'wibestories.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${host}`;

  // Extract short ID from URL path: /c/abc123
  const url = new URL(req.url, origin);
  // Strip zero-width space (\u200B) and other non-alphanumeric chars that
  // sneak into shared URLs as separators between the card link and CTA text.
  const id = url.pathname.replace(/^\/c\//, '').replace(/[^\w-]/g, '');

  if (!id || id.length < 4 || id.length > 12 || !/^[a-zA-Z0-9]+$/.test(id)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Card not found');
    return;
  }

  // Card image is original square version in cards/ directory
  const cardUrl = `https://${BLOB_HOST}/cards/${id}.png`;
  const shareUrl = `${origin}/c/${id}`;
  const homeUrl = origin + '/';

  // Fetch card metadata sidecar if available
  let metaText = '', metaName = '', metaTone = 'original', metaP = '0', metaR = 'rounded', metaPro = false;
  try {
    const metaRes = await fetch(`https://${BLOB_HOST}/meta/${id}.json`);
    if (metaRes.ok) {
      const meta = await metaRes.json();
      metaText = meta.text || '';
      metaName = meta.name || '';
      metaTone = meta.tone || 'original';
      metaP = meta.p || '0';
      metaR = meta.r || 'rounded';
      metaPro = meta.pro === true;
    }
  } catch (e) {
    // Old cards without sidecar — fall through with defaults
  }

  // Check if voice audio exists for this card
  let hasVoice = false;
  try {
    const voiceRes = await fetch(`https://${BLOB_HOST}/voice/${id}`, { method: 'HEAD' });
    hasVoice = voiceRes.ok;
  } catch (e) { /* no voice */ }

  // Calculate expiry from blob metadata
  let expiryHtml = '';
  try {
    const cardBlob = await head(`https://${BLOB_HOST}/cards/${id}.png`);
    if (cardBlob.uploadedAt) {
      const ageMs = Date.now() - new Date(cardBlob.uploadedAt).getTime();
      const daysElapsed = Math.floor(ageMs / 86400000);
      const maxAgeDays = metaPro ? 14 : 7;
      const daysRemaining = Math.max(0, maxAgeDays - daysElapsed);
      if (daysRemaining > 5) { expiryHtml = `Expires in ${daysRemaining} days`; }
      else if (daysRemaining > 1) { expiryHtml = `Expires in ${daysRemaining} days`; }
      else if (daysRemaining === 1) { expiryHtml = 'Expires tomorrow'; }
      else { expiryHtml = 'Expires today'; }
    }
  } catch (e) { /* old card without metadata — no badge */ }

  // "Create your own" always goes to clean state — no hash params.
  // Including card data in the hash caused the URL to persist through refreshes,
  // making it impossible to get back to a fresh state.
  const appUrl = homeUrl;

  // OG image = the actual card JPEG served through our own domain via /api/og/:id,
  // so scrapers fetch it from the same origin as the page, avoiding cross-domain CDN issues.
  const ogUrl = `${origin}/api/og/${id}`;

  const safeOgUrl = escapeHtml(ogUrl);
  const safeCardUrl = escapeHtml(cardUrl);
  const safeShareUrl = escapeHtml(shareUrl);
  const safeHomeUrl = escapeHtml(homeUrl);
  const safeAppUrl = escapeHtml(appUrl);
  const safeName = escapeHtml(metaName);
  const voiceUrl = `https://${BLOB_HOST}/voice/${id}`;
  const safeVoiceUrl = escapeHtml(voiceUrl);

  const altText = safeName
    ? `You have received a Wibe Story from ${safeName}`
    : 'A Wibe Story card';

  const captionHtml = safeName
    ? `<p class="landing-caption">${safeName} shared a Wibe Story with you.</p>`
    : '';

  const ogAltText = safeName
    ? `A Wibe Story shared by ${safeName}`
    : 'A Wibe Story card';

  const ogTitle = safeName
    ? `${safeName} shared a Wibe Story — tap to create yours`
    : 'Wibe Stories — Turn your voice into a beautiful card';

  const ogDesc = safeName
    ? `${safeName} shared a Wibe Story with you. Tap to listen and create your own in 44 languages.`
    : 'Speak naturally, get a beautiful card. Free, no account, 44 languages.';

  const twitterDesc = safeName
    ? `${safeName} shared a Wibe Story with you. Tap to create yours.`
    : 'Turn your voice into a beautiful card. Free, no account, 44 languages.';

  const punchLines = [
    "Stop typing. Start talking.",
    "Your voice is the new keyboard.",
    "Write at the speed of thought.",
    "Give your hands a break.",
    "The fastest way to write.",
    "Just talk. We'll do the typing.",
    "Why type when you can talk?",
    "Writing, without the keyboard.",
    "Finally, writing that keeps up with you.",
    "Write 4× faster. Just talk.",
    "Talk, Say it. Don't type, Send it.",
    "Write by talking."
  ];
  const hookLine = punchLines[Math.floor(Math.random() * punchLines.length)];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${ogDesc}">
<link rel="icon" href="${safeHomeUrl}assets/brand/ws-l-b.ico" type="image/x-icon">
<title>${ogTitle}</title>
<meta property="og:title" content="${ogTitle}">
<meta property="og:description" content="${ogDesc}">
<meta property="og:image" content="${safeOgUrl}">
<meta property="og:image:secure_url" content="${safeOgUrl}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:alt" content="${ogAltText}">
<meta property="og:url" content="${safeShareUrl}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Wibe Stories">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${ogTitle}">
<meta name="twitter:description" content="${twitterDesc}">
<meta name="twitter:image" content="${safeOgUrl}">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{
  overflow:hidden;
  height:100vh;height:100dvh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  background:#1a1a1a;
  color:#ffffeb;
  padding:16px;
}
.landing-wrap{
  width:100%;
  max-width:600px;
  height:100vh;height:100dvh;
  display:flex;
  flex-direction:column;
  align-items:center;
}
.center-content{
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:16px;
  width:100%;
}
.branding{
  display:flex;
  align-items:center;
  gap:8px;
}
.branding-logo{
  width:24px;
  height:24px;
  object-fit:contain;
}
.branding-name{
  font-size:clamp(16px,2.5vw,20px);
  font-weight:700;
  color:#ffffeb;
}
.card-img{
  max-height:40vh;
  width:auto;
  max-width:100%;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 20px 60px rgba(0,0,0,0.3);
  display:block;
}
.card-img img{
  width:100%;
  height:100%;
  object-fit:contain;
  display:block;
  -webkit-user-select:none;
  user-select:none;
}
.cta{
  display:inline-block;
  background:#ffffeb;
  color:#1a1a1a;
  text-decoration:none;
  padding:12px 28px;
  border-radius:999px;
  font-size:clamp(15px,2.2vw,18px);
  font-weight:600;
  transition:transform .15s ease,background .15s ease;
}
.cta:hover{background:#fff;transform:translateY(-1px)}
.hook-line{font-size:clamp(12px,2vw,14px);color:#a5a596;margin:0;text-align:center}
.hook-flow{display:inline-block;font-size:clamp(14px,2.2vw,16px);font-weight:700;color:#f59e0b;text-decoration:none;border-bottom:1px solid transparent;transition:border-color .2s}
.hook-flow:hover{border-bottom-color:#f59e0b}
.hook-flow span{display:inline-block;animation:wave-letter-auto 2.5s ease-in-out infinite}
.hook-flow.pulse{animation:pulse-glow 3s ease-in-out infinite}
@keyframes wave-letter-auto{0%,70%{transform:translateY(0)}80%{transform:translateY(-4px)}90%,100%{transform:translateY(0)}}
@keyframes pulse-glow{0%,100%{text-shadow:0 0 4px rgba(245,158,11,.2)}50%{text-shadow:0 0 16px rgba(245,158,11,.5)}}
@media(prefers-reduced-motion:reduce){.hook-flow span{animation:none!important}.hook-flow.pulse{animation:none!important}}
.divider{width:40px;border:none;border-top:1px solid #444;margin:2px 0}
.landing-caption{font-size:clamp(13px,2vw,15px);color:#ffffeb;margin:0;text-align:center}
.landing-meta{font-size:12px;color:#a5a596;text-align:center;line-height:1.5;margin:0}
.watermark{font-size:11px;color:#555;text-align:center;margin-top:auto;padding-top:8px}
.footer-logo{height:14px;width:auto;vertical-align:middle;display:inline-block}
@media (hover: hover){.footer-logo:hover{animation:logoFlip 0.8s ease-in-out}}
@keyframes logoFlip{0%{transform:rotateY(0deg)}25%{transform:rotateY(-180deg)}50%{transform:rotateY(0deg)}75%{transform:rotateY(180deg)}100%{transform:rotateY(0deg)}}
.dl-btns{display:flex;justify-content:center;align-items:center;margin-top:4px}
.dl-link{color:#ffffeb;font-weight:700;font-size:14px;text-decoration:underline;transition:opacity .15s}
.dl-link:hover{opacity:.7}
@media (max-height:600px){
  .branding{display:none}
  .center-content{gap:6px}
  .landing-caption{display:none}
  .card-img{max-height:35vh}
  .cta{padding:10px 22px;font-size:14px}
}
@media (max-width:400px){
  html,body{padding:12px}
  .branding-logo{width:20px;height:20px}
}
</style>
</head>
<body>
<main class="landing-wrap">
  <div class="branding">
    <img class="branding-logo" src="${safeHomeUrl}assets/brand/ws-logo-blwbg.png" alt="Wibe Stories">
    <span class="branding-name">Wibe Stories</span>
  </div>
  <div class="center-content">
    ${safeName ? `<p class="landing-caption"><strong>${safeName}</strong> shared a Wibe Story with you.</p>` : ''}
    <div class="card-img">
      <img src="${safeCardUrl}" alt="${altText}" oncontextmenu="return false">
    </div>
    <a class="cta" href="${safeAppUrl}">Create your own &rarr;</a>
    <p class="hook-line">${hookLine} <a class="hook-flow pulse" href="https://wisprflow.ai/r?BEST76" target="_blank" rel="noopener">→Wispr Flow</a></p>
    <hr class="divider">
    <p class="landing-meta">${hasVoice ? 'With voice' : 'Text only'}${expiryHtml ? ' · ' + expiryHtml : ''}</p>
    ${hasVoice ? '<audio controls src="' + safeVoiceUrl + '" style="width:100%;max-width:280px;border-radius:8px;display:block;margin:0 auto"></audio>' : ''}
    <div class="dl-btns">
      <a class="dl-link" href="/download/${id}" download="wibe-story.png">Download story card</a>
    </div>
  </div>
  <p class="watermark">&copy; 2026 YGLabs <img src="${safeHomeUrl}assets/brand/YGL-L-W.png" class="footer-logo" alt="YGLabs"></p>
</main>
<script>(function(){var e=document.querySelector('.hook-flow');if(!e||window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;var t=e.textContent;e.innerHTML='';var c=0;for(var i=0;i<t.length;i++){if(t[i]===' '){e.appendChild(document.createTextNode(' '))}else{var s=document.createElement('span');s.textContent=t[i];s.style.animationDelay=(c*0.06)+'s';e.appendChild(s);c++}}})()</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html;charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
  res.end(html);
}
