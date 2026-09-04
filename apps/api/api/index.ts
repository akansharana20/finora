import app from '../src/index';

export default function handler(req: any, res: any) {
  return app(req, res);
}

// Ensure compatibility with both ESM and CommonJS invocation on Vercel
if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  module.exports.default = handler;
}
