import assert from 'assert';
import { encryptToken, decryptToken } from '../src/utils/crypto';
import { buildHmrcFraudHeaders } from '../src/modules/hmrc/hmrc.fraudPrevention';
import { HmrcClient } from '../src/modules/hmrc/hmrc.client';
import { HmrcApiError } from '../src/modules/hmrc/hmrc.error';
import { getObligationDateRange } from '../src/modules/hmrc/hmrc.service';

async function runTests() {
  process.env.HMRC_CLIENT_ID = 'test-client-id';
  process.env.HMRC_CLIENT_SECRET = 'test-client-secret';
  process.env.HMRC_REDIRECT_URI = 'https://finora.example/api/hmrc/callback';
  process.env.HMRC_BASE_URL = 'https://test-api.service.hmrc.gov.uk';
  process.env.HMRC_AUTH_BASE_URL = 'https://test-www.tax.service.gov.uk';

  const encrypted = encryptToken('hmrc-access-token');
  assert.ok(encrypted.startsWith('enc:'));
  assert.strictEqual(decryptToken(encrypted), 'hmrc-access-token');
  assert.strictEqual(decryptToken('legacy-token'), 'legacy-token');

  const fraudHeaders = buildHmrcFraudHeaders(undefined, {
    userAgent: 'Mozilla/5.0',
    accept: 'application/json',
    dnt: 'true',
    plugins: 'PDF%20Viewer',
    publicIp: '82.165.197.1',
    publicPort: '49152',
    screens: 'width=1920&height=1080&scaling-factor=1&colour-depth=24',
    timezone: 'UTC+00:00',
    userId: 'user-admin-123',
  });
  assert.strictEqual(fraudHeaders['Gov-Client-Connection-Method'], 'WEB_APP_VIA_SERVER');
  assert.strictEqual(fraudHeaders['Gov-Vendor-Product-Name'], 'Finora');
  assert.strictEqual(fraudHeaders['Gov-Client-Public-IP'], '82.165.197.1');

  const client = new HmrcClient();
  const authUrl = client.getAuthorizationUrl('state-123');
  assert.ok(authUrl.startsWith('https://test-www.tax.service.gov.uk/oauth/authorize'));
  assert.ok(authUrl.includes('client_id=test-client-id'));
  assert.ok(authUrl.includes('state=state-123'));
  assert.ok(!authUrl.includes('test-client-secret'));

  const originalFetch = globalThis.fetch;
  try {
    let capturedObligationsUrl = '';
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      capturedObligationsUrl = String(input);
      return new Response(JSON.stringify({
      code: 'CLIENT_OR_AGENT_NOT_AUTHORISED',
      message: 'The client or agent is not authorised',
      }), { status: 403, headers: { 'x-correlation-id': 'corr-123' } });
    }) as typeof fetch;

    let caughtError: unknown;
    try {
      await client.getVatObligations('123456789', 'access-token', getObligationDateRange());
    } catch (error) {
      caughtError = error;
    }

    assert.ok(caughtError instanceof HmrcApiError);
    assert.strictEqual((caughtError as HmrcApiError).hmrcCode, 'CLIENT_OR_AGENT_NOT_AUTHORISED');
    assert.strictEqual((caughtError as HmrcApiError).correlationId, 'corr-123');
    assert.strictEqual((caughtError as HmrcApiError).statusCode, 403);
    assert.ok(!(caughtError as HmrcApiError).message.includes('access-token'));
    const requestUrl = new URL(capturedObligationsUrl);
    const from = requestUrl.searchParams.get('from') || '';
    const to = requestUrl.searchParams.get('to') || '';
    assert.match(from, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(to, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(new Date(`${to}T00:00:00Z`).getTime() >= new Date(`${from}T00:00:00Z`).getTime());
    assert.ok(new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime() <= 365 * 86400000);
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log('HMRC client, fraud-header, encryption, and authorization-error tests passed.');
}

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
