# HMRC Sandbox Verification Checklist

Use this checklist for a fresh HMRC Sandbox user. Values below are templates;
replace every placeholder with the value from the HMRC Developer Hub or the
deployment platform. Never commit the completed values.

## API environment

Configure these variables on the API deployment:

```dotenv
NODE_ENV=production
INTEGRATION_MODE=sandbox
DATABASE_URL=<production-postgres-connection-string>
JWT_SECRET=<random-secret-at-least-32-characters>
HMRC_STATE_SECRET=<different-random-secret-at-least-32-characters>
HMRC_ENCRYPTION_KEY=<random-secret-at-least-32-characters>
HMRC_CLIENT_ID=<new-hmrc-sandbox-client-id>
HMRC_CLIENT_SECRET=<new-hmrc-sandbox-client-secret>
HMRC_REDIRECT_URI=https://<api-host>/api/hmrc/callback
HMRC_BASE_URL=https://test-api.service.hmrc.gov.uk
HMRC_AUTH_BASE_URL=https://test-www.tax.service.gov.uk
HMRC_ENVIRONMENT=sandbox
FRONTEND_URL=https://<web-host>
CORS_ORIGIN=https://<web-host>
```

The HMRC application must register the exact `HMRC_REDIRECT_URI`, including
scheme, hostname, path, and absence or presence of a trailing slash. The
frontend deployment must use:

```dotenv
VITE_API_URL=https://<api-host>/api
```

## Database preparation

1. Confirm `DATABASE_URL` points to the intended Sandbox verification database.
2. Deploy tracked migrations:

   ```bash
   npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
   ```

3. Confirm the `hmrc_oauth_states` table exists.
4. Do not run the legacy seed script against this database.

## Fresh connection test

1. Sign in to the deployed web app.
2. Select the intended firm and record its firm name and VRN.
3. Open Integrations and confirm the HMRC status is disconnected.
4. Start HMRC connection. The browser should be sent to the HMRC Sandbox authorization host.
5. Authorize with the newly created HMRC Sandbox user and the VRN configured for that user.
6. Confirm HMRC redirects to `/integrations?hmrc=connected` on the web host.
7. Confirm the integration page reports a connected HMRC account.
8. Confirm the API has one connection for the selected firm and no connection for another firm.

## Data and submission test

1. Trigger **Sync obligations** for the connected firm.
2. Confirm returned obligations are from HMRC and are scoped to the selected firm.
3. Confirm a firm with no HMRC obligations shows an empty state rather than fabricated periods.
4. For an open obligation, prepare the VAT return from real accounting data.
5. Review all nine VAT boxes before submitting.
6. Submit once and record HMRC's returned receipt/processing identifier.
7. Confirm an HMRC rejection is shown as an error and is not represented as a successful submission.
8. Confirm a second firm cannot read, sync, or submit against the first firm's HMRC data.

## Failure checks

- Denied authorization returns to the web Integrations page with an HMRC error state.
- Missing or altered OAuth state is rejected.
- Replaying the callback is rejected.
- Expired access tokens require reauthorization when refresh fails.
- HMRC `401`, `403`, `429`, and `5xx` responses remain structured errors without exposing tokens or secrets.
- Browser callbacks never land on an API 404 page.

## Evidence to record

Record the deployment revision, timestamp, firm ID, HMRC Sandbox user/VRN
identifier, obligation period key, and HMRC response status. Do not record
client secrets, access tokens, refresh tokens, or authorization codes.