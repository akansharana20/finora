/**
 * Environment configuration and startup/runtime validator for Finora API.
 * Ensures critical secrets and endpoints are present and valid without leaking values.
 */

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  // 1. DATABASE_URL
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL environment variable is missing.');
  }

  // 2. JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    if (isProduction) {
      errors.push('JWT_SECRET environment variable is required in production.');
    } else {
      warnings.push('JWT_SECRET is unset; using local development fallback secret.');
    }
  } else if (jwtSecret.length < 32 && isProduction) {
    errors.push('JWT_SECRET must be at least 32 characters in production.');
  }

  // 3. FRONTEND_URL
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    const trimmed = frontendUrl.trim().replace(/\/+$/, '');
    if (trimmed.includes('-api.') || trimmed.endsWith('/api')) {
      warnings.push(`FRONTEND_URL appears to point to an API host (${trimmed}). Expected web frontend URL.`);
    }
  } else if (isProduction) {
    warnings.push('FRONTEND_URL is not set; falling back to default production frontend host.');
  }

  // 4. HMRC Configuration
  if (!process.env.HMRC_CLIENT_ID) {
    warnings.push('HMRC_CLIENT_ID is missing; HMRC authorization will not be possible.');
  }
  if (!process.env.HMRC_CLIENT_SECRET) {
    warnings.push('HMRC_CLIENT_SECRET is missing; HMRC token exchange will not be possible.');
  }
  if (!process.env.HMRC_REDIRECT_URI) {
    warnings.push('HMRC_REDIRECT_URI is unset; HMRC authorization will not be possible.');
  }
  if (!process.env.HMRC_BASE_URL) {
    warnings.push('HMRC_BASE_URL is unset; HMRC API requests will not be possible.');
  }
  if (!process.env.HMRC_AUTH_BASE_URL) {
    warnings.push('HMRC_AUTH_BASE_URL is unset; HMRC authorization will not be possible.');
  }

  // 5. HMRC Encryption Key
  if (!process.env.HMRC_ENCRYPTION_KEY && !jwtSecret && isProduction) {
    errors.push('Neither HMRC_ENCRYPTION_KEY nor JWT_SECRET is set for AES-256-GCM token encryption.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getValidatedFrontendUrl(): string {
  const envUrl = process.env.FRONTEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    // Guard against accidental configuration pointing to API host
    if (!trimmed.includes('-api.') && !trimmed.endsWith('/api')) {
      return trimmed;
    }
    console.warn('[Config] FRONTEND_URL appears to point to an API endpoint; using default web frontend.');
  }
  return process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173';
}
