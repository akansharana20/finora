let appInstance: any = null;
let appInitError: any = null;

function getApp() {
  if (appInstance) return appInstance;
  if (appInitError) throw appInitError;

  try {
    const mod = require('../src/index');
    appInstance = mod.default || mod;
    return appInstance;
  } catch (err: any) {
    appInitError = err;
    console.error('Failed to initialize Finora API Express app in apps/api/api/index.ts:', err);
    throw err;
  }
}

export default function handler(req: any, res: any) {
  const rawUrl = (req.url || '').split('?')[0];

  // Guaranteed health check response without evaluating any external dependencies
  if (rawUrl === '/api/health' || rawUrl === '/health' || rawUrl === '/' || rawUrl === '/api') {
    const payload = {
      status: 'ok',
      service: 'finora-api',
      timestamp: new Date().toISOString(),
      integrationMode: process.env.INTEGRATION_MODE || 'sandbox',
    };

    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store, max-age=0');
    }

    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(200).json(payload);
    }

    res.statusCode = 200;
    return res.end(JSON.stringify(payload));
  }

  try {
    const app = getApp();
    return app(req, res);
  } catch (err: any) {
    res.statusCode = 500;
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
    }
    return res.end(JSON.stringify({
      error: 'SERVERLESS_FUNCTION_INITIALIZATION_FAILED',
      message: err?.message || 'Server error',
      stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined,
    }));
  }
}
