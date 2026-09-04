export default function handler(_req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'ok',
    service: 'finora-api',
    timestamp: new Date().toISOString(),
    integrationMode: process.env.INTEGRATION_MODE || 'sandbox',
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  module.exports.default = handler;
}
