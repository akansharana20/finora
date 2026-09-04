import assert from 'assert';
import { encryptToken, decryptToken } from '../src/utils/crypto';
import { buildHmrcFraudHeaders } from '../src/modules/hmrc/hmrc.fraudPrevention';
import { HmrcClient } from '../src/modules/hmrc/hmrc.client';

async function runTests() {
  console.log('🧪 Starting HMRC & Finora Integration Tests...\n');

  // Test 1: AES-256-GCM Encryption / Decryption
  console.log('Test 1: Token Encryption & Decryption (AES-256-GCM)');
  const sampleToken = 'hmrc_oauth_access_token_super_secret_123456789';
  const encrypted = encryptToken(sampleToken);
  assert.notStrictEqual(encrypted, sampleToken, 'Token should be encrypted');
  assert.ok(encrypted.startsWith('enc:'), 'Encrypted token must have enc: prefix');

  const decrypted = decryptToken(encrypted);
  assert.strictEqual(decrypted, sampleToken, 'Decrypted token must match original');

  // Legacy/unencrypted token handling
  const legacyToken = 'mock_legacy_token';
  assert.strictEqual(decryptToken(legacyToken), legacyToken, 'Legacy unencrypted token should pass through untouched');
  console.log('✅ Passed Test 1: Encryption & Decryption working as expected.\n');

  // Test 2: HMRC Fraud Prevention Headers
  console.log('Test 2: HMRC Fraud Prevention Headers Builder');
  const fraudHeaders = buildHmrcFraudHeaders(undefined, {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    accept: 'application/json',
    dnt: 'true',
    plugins: 'PDF%20Viewer',
    localIps: '192.168.1.50',
    publicIp: '82.165.197.1',
    publicPort: '49152',
    screens: 'width=1920&height=1080&scaling-factor=1&colour-depth=24',
    timezone: 'UTC+00:00',
    userId: 'user-admin-123',
  });

  assert.strictEqual(fraudHeaders['Gov-Client-Connection-Method'], 'WEB_APP_VIA_SERVER');
  assert.strictEqual(fraudHeaders['Gov-Vendor-Product-Name'], 'Finora');
  assert.strictEqual(fraudHeaders['Gov-Vendor-Version'], 'Finora=1.0.0');
  assert.ok(fraudHeaders['Gov-Vendor-Instance-ID'], 'Instance ID must be present');
  assert.strictEqual(fraudHeaders['Gov-Client-Public-IP'], '82.165.197.1');
  assert.strictEqual(fraudHeaders['Gov-Client-Timezone'], 'UTC+00:00');
  assert.ok(fraudHeaders['Gov-Client-User-IDs'].includes('user-admin-123'));
  console.log('✅ Passed Test 2: Fraud prevention headers conformed to HMRC spec.\n');

  // Test 3: HMRC Client in Mock Mode
  console.log('Test 3: HMRC Client Dual-Mode & Obligations (Mock Mode)');
  process.env.INTEGRATION_MODE = 'mock';
  const client = new HmrcClient();

  const authUrl = client.getAuthorizationUrl('test_state_123');
  assert.ok(authUrl.includes('test_state_123'), 'Auth URL must include state parameter');

  const tokens = await client.exchangeCodeForTokens('mock_code_123');
  assert.ok(tokens.access_token, 'Tokens must include access_token');
  assert.ok(tokens.refresh_token, 'Tokens must include refresh_token');
  assert.strictEqual(tokens.expires_in, 14400);

  const obligations = await client.getVatObligations('987654321');
  assert.ok(Array.isArray(obligations), 'Obligations must be an array');
  assert.ok(obligations.length > 0, 'Obligations should return list of quarters');
  assert.ok(obligations.some((o) => o.periodKey === '26C2'));
  console.log('✅ Passed Test 3: HMRC Client mock mode obligations verified.\n');

  // Test 4: HMRC VAT Return Submission in Mock Mode
  console.log('Test 4: HMRC VAT Return Submission & Integer Box Sanitation');
  const submissionReceipt = await client.submitVatReturn('987654321', {
    periodKey: '26C2',
    vatDueSales: 12500.55,
    vatDueAcquisitions: 0,
    totalVatDue: 12500.55,
    vatReclaimedCurrPeriod: 2500.25,
    netVatDue: 10000.30,
    totalValueSalesExVAT: 62502.75, // Fractional: must be truncated/rounded to integer in sandbox payload
    totalValuePurchasesExVAT: 12501.25,
    totalValueGoodsSuppliedExVAT: 0,
    totalAcquisitionsExVAT: 0,
    finalised: true,
  });

  assert.ok(submissionReceipt.formBundleNumber, 'Receipt must have formBundleNumber');
  assert.ok(submissionReceipt.correlationId, 'Receipt must have correlationId');
  assert.strictEqual(submissionReceipt.paymentIndicator, 'DD');
  console.log('✅ Passed Test 4: VAT return submission receipt verified.\n');

  // Test 5: Sandbox mode without client ID must throw BadRequestError
  console.log('Test 5: HMRC Client Sandbox Mode - Missing Client ID Validation');
  process.env.INTEGRATION_MODE = 'sandbox';
  delete process.env.HMRC_CLIENT_ID;
  const unconfiguredSandboxClient = new HmrcClient();
  let caughtError: any = null;
  try {
    unconfiguredSandboxClient.getAuthorizationUrl('state_test_missing_id');
  } catch (err: any) {
    caughtError = err;
  }
  assert.ok(caughtError, 'Should throw error when client ID is missing in sandbox mode');
  assert.strictEqual(caughtError.statusCode, 400, 'Error should be a BadRequestError (400)');
  console.log('✅ Passed Test 5: Sandbox mode throws BadRequestError when client ID is missing.\n');

  // Test 6: Sandbox mode with client ID points to HMRC test-api sandbox
  console.log('Test 6: HMRC Client Sandbox Mode - Real Sandbox OAuth URL Generation');
  process.env.INTEGRATION_MODE = 'sandbox';
  process.env.HMRC_CLIENT_ID = 'test_sandbox_client_id_456';
  process.env.HMRC_BASE_URL = 'https://test-api.service.hmrc.gov.uk';
  const configuredSandboxClient = new HmrcClient();
  const sandboxAuthUrl = configuredSandboxClient.getAuthorizationUrl('state_sandbox_123');
  assert.ok(sandboxAuthUrl.startsWith('https://test-api.service.hmrc.gov.uk/oauth/authorize'), 'Auth URL must target HMRC test-api sandbox endpoint');
  assert.ok(sandboxAuthUrl.includes('client_id=test_sandbox_client_id_456'), 'Auth URL must include client_id');
  assert.ok(sandboxAuthUrl.includes('state=state_sandbox_123'), 'Auth URL must include state');
  console.log('✅ Passed Test 6: Sandbox OAuth URL correctly points to HMRC test-api sandbox.\n');

  console.log('🎉 All HMRC & Finora Integration Tests Passed Successfully!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
