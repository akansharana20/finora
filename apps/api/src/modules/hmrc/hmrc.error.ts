import { AppError } from '../../utils/errors';

export interface HmrcApiErrorOptions {
  message: string;
  statusCode: number;
  operation: string;
  hmrcCode?: string;
  correlationId?: string;
  safeDetails?: Record<string, any>;
}

function sanitizeSafeMessage(raw: string): string {
  if (!raw) return 'Unknown error';
  // Strip any accidental credential/token/key leaks if present in raw error text
  return raw
    .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED]')
    .replace(/secret[=:][^\s&]+/gi, 'secret=[REDACTED]')
    .replace(/client_secret[=:][^\s&]+/gi, 'client_secret=[REDACTED]')
    .replace(/key[=:][^\s&]+/gi, 'key=[REDACTED]')
    .slice(0, 300);
}

export class HmrcApiError extends AppError {
  public code: string;
  public hmrcCode?: string;
  public correlationId?: string;
  public operation: string;
  public rawStatus?: number;

  constructor(options: HmrcApiErrorOptions) {
    super(options.message, options.statusCode, {
      operation: options.operation,
      hmrcCode: options.hmrcCode,
      correlationId: options.correlationId,
      ...(options.safeDetails || {}),
    });
    this.name = 'HmrcApiError';
    this.code = options.hmrcCode || 'HMRC_API_ERROR';
    this.hmrcCode = options.hmrcCode;
    this.correlationId = options.correlationId;
    this.operation = options.operation;
    this.rawStatus = options.statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static fromHmrcResponse(
    status: number,
    errorBody: string | any,
    operation: string,
    correlationId?: string
  ): HmrcApiError {
    let parsedCode: string | undefined;
    let parsedMessage: string | undefined;

    if (typeof errorBody === 'object' && errorBody !== null) {
      parsedCode = errorBody.code || errorBody.error;
      parsedMessage = errorBody.message || errorBody.error_description;
    } else if (typeof errorBody === 'string') {
      try {
        const json = JSON.parse(errorBody);
        parsedCode = json.code || json.error;
        parsedMessage = json.message || json.error_description;
      } catch {
        parsedMessage = errorBody.slice(0, 250);
      }
    }

    let userMessage = 'HMRC request failed. Please try again.';
    let clientStatusCode = status;

    if (status === 401) {
      userMessage = 'HMRC authorization has expired. Please reconnect this company to HMRC.';
      clientStatusCode = 401;
    } else if (status === 403) {
      userMessage = 'HMRC has denied access for this company. Please check the HMRC authorization.';
      clientStatusCode = 403;
    } else if (status === 400) {
      const safeReason = parsedMessage ? sanitizeSafeMessage(parsedMessage) : (parsedCode || 'Invalid request parameters');
      userMessage = `HMRC rejected the request: ${safeReason}`;
      clientStatusCode = 400;
    } else if (status === 429) {
      userMessage = 'HMRC is temporarily rate limiting requests. Please try again shortly.';
      clientStatusCode = 429;
    } else if (status >= 500 && status < 600) {
      userMessage = 'HMRC is temporarily unavailable. Please try again later.';
      clientStatusCode = 502;
    } else {
      userMessage = `HMRC request failed (${status}): ${sanitizeSafeMessage(parsedMessage || 'Unknown upstream error')}`;
    }

    return new HmrcApiError({
      message: userMessage,
      statusCode: clientStatusCode,
      operation,
      hmrcCode: parsedCode,
      correlationId,
    });
  }

  static networkError(operation: string, err?: any): HmrcApiError {
    return new HmrcApiError({
      message: 'Unable to reach HMRC. Please try again.',
      statusCode: 504,
      operation,
      safeDetails: {
        reason: err?.message ? sanitizeSafeMessage(err.message) : 'Network timeout or unreachable host',
      },
    });
  }
}
