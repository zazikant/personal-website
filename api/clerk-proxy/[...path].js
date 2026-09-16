/**
 * Clerk proxy — forwards /__clerk/* requests to Clerk's FAPI servers.
 * This is required for Clerk's proxy mode on static sites (no Next.js middleware).
 *
 * The FAPI domain (clerk.doquerag.vercel.app) is the Clerk Frontend API.
 * In proxy mode, Clerk routes through the app's /__clerk path.
 */

const FAPI_DOMAIN = 'robust-alien-14.clerk.accounts.com';

module.exports = async (req, res) => {
  // Build the target URL on Clerk's FAPI
  const path = req.url?.replace(/^\/api\/clerk-proxy/, '').replace(/^\/__clerk/, '') || '';
  const queryString = req.url?.includes('?') ? '?' + req.url.split('?')[1] : '';
  const targetUrl = `https://${FAPI_DOMAIN}${path}${queryString}`;

  // Clone headers, set host to the FAPI domain
  const headers = { ...req.headers };
  headers['host'] = FAPI_DOMAIN;
  delete headers['x-forwarded-host'];
  delete headers['x-forwarded-for'];
  delete headers['x-forwarded-proto'];

  try {
    const fetchResponse = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      redirect: 'manual',
    });

    // Clone response headers
    const responseHeaders = {};
    fetchResponse.headers.forEach((value, key) => {
      // Skip transfer-encoding header (Vercel handles this)
      if (key.toLowerCase() !== 'transfer-encoding') {
        responseHeaders[key] = value;
      }
    });

    // Handle redirects — rewrite Location header to use /__clerk path
    if (fetchResponse.status >= 300 && fetchResponse.status < 400) {
      const location = fetchResponse.headers.get('location');
      if (location) {
        // Rewrite FAPI URLs to /__clerk proxy URLs
        const rewrittenLocation = location.replace(
          `https://${FAPI_DOMAIN}`,
          'https://doquerag.vercel.app/__clerk'
        ).replace(
          `http://${FAPI_DOMAIN}`,
          'https://doquerag.vercel.app/__clerk'
        );
        responseHeaders['location'] = rewrittenLocation;
      }
    }

    res.status(fetchResponse.status);
    Object.entries(responseHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    const body = await fetchResponse.text();
    res.send(body);
  } catch (err) {
    console.error('[clerk-proxy] Error:', err.message);
    res.status(502).json({ error: 'Clerk proxy failed', message: err.message });
  }
};
