export const config = { runtime: 'nodejs' };

export default async function handler(req) {
  const url = new URL(req.url, `https://${req.headers.host || 'wibestories.vercel.app'}`);
  const email = url.searchParams.get('email');
  const occasionId = url.searchParams.get('occasion');

  const hasResendKey = !!process.env.RESEND_API_KEY;

  let importOk = false;
  let occasionData = null;
  let importError = null;
  try {
    const m = await import('./lib/occasion-email.js');
    importOk = true;
    if (occasionId) {
      occasionData = m.getOccasionById(occasionId);
    }
    if (!occasionData) {
      occasionData = m.getNextOccasion();
    }
  } catch (e) {
    importError = e.message;
  }

  return new Response(JSON.stringify({
    email,
    occasionId,
    hasResendKey,
    importOk,
    occasionData: occasionData ? { id: occasionData.id, name: occasionData.name } : null,
    importError,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
