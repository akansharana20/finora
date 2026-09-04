export default function handler(_req: any, res: any) {
  const payload = {
    status: 'ok',
    service: 'finora-api',
    timestamp: new Date().toISOString(),
    integrationMode: process.env.INTEGRATION_MODE || 'sandbox',
  };

  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
  }

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(200).json(payload);
  }

  res.statusCode = 200;
  return res.end(JSON.stringify(payload));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  module.exports.default = handler;
}
