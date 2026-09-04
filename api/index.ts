import app from '../apps/api/src/index';

export default function handler(req: any, res: any) {
  return app(req, res);
}
