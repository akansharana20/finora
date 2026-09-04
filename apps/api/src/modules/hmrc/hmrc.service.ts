import { Request } from 'express';
import prisma from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { HmrcClient, HmrcSubmissionReceipt } from './hmrc.client';
import { buildHmrcFraudHeaders } from './hmrc.fraudPrevention';
import { encryptToken, decryptToken } from '../../utils/crypto';
import { VatReturnStatus, VatObligationStatus } from '@prisma/client';

export class HmrcService {
  private static client = new HmrcClient();

  static async getConnectUrl(firmId: string) {
    const firm = await prisma.firm.findUnique({ where: { id: firmId } });
    if (!firm) {
      throw new NotFoundError('Firm not found');
    }

    // State payload encodes firmId and timestamp
    const state = Buffer.from(JSON.stringify({ firmId, timestamp: Date.now() })).toString('base64');
    return HmrcService.client.getAuthorizationUrl(state);
  }

  static async handleCallback(firmId: string, code: string) {
    const firm = await prisma.firm.findUnique({ where: { id: firmId } });
    if (!firm) {
      throw new NotFoundError('Firm not found');
    }

    const vrn = firm.vatNumber ? firm.vatNumber.replace(/[^0-9]/g, '') : '987654321';

    // Real OAuth exchange via HMRC client
    const tokenResponse = await HmrcService.client.exchangeCodeForTokens(code);

    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);
    const encryptedAccessToken = encryptToken(tokenResponse.access_token);
    const encryptedRefreshToken = encryptToken(tokenResponse.refresh_token);

    const connection = await prisma.hmrcConnection.upsert({
      where: { firmId },
      update: {
        vrn,
        isConnected: true,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        scope: tokenResponse.scope || 'read:vat write:vat',
        lastSyncAt: new Date(),
        environment: process.env.HMRC_ENVIRONMENT || 'sandbox',
      },
      create: {
        firmId,
        vrn,
        isConnected: true,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        scope: tokenResponse.scope || 'read:vat write:vat',
        lastSyncAt: new Date(),
        environment: process.env.HMRC_ENVIRONMENT || 'sandbox',
      },
    });

    await prisma.auditLog.create({
      data: {
        firmId,
        action: 'HMRC_CONNECTED',
        entity: 'HmrcConnection',
        entityId: connection.id,
        metadata: `Successfully connected firm to HMRC MTD VAT API (VRN: ${vrn}, Env: ${connection.environment})`,
      },
    });

    // Sanitized connection status (tokens strictly excluded from response)
    return {
      isConnected: connection.isConnected,
      vrn: connection.vrn,
      environment: connection.environment,
      lastSyncAt: connection.lastSyncAt,
    };
  }

  private static async getValidAccessToken(firmId: string): Promise<string | undefined> {
    const connection = await prisma.hmrcConnection.findUnique({
      where: { firmId },
    });

    if (!connection || !connection.isConnected || !connection.accessToken) {
      return undefined;
    }

    // Check if token is expired or within 5 minutes of expiring
    const isExpiringSoon = connection.expiresAt && connection.expiresAt.getTime() - Date.now() < 5 * 60 * 1000;

    if (isExpiringSoon && connection.refreshToken) {
      try {
        const plainRefreshToken = decryptToken(connection.refreshToken);
        const refreshed = await HmrcService.client.refreshAccessToken(plainRefreshToken);

        const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
        const newEncryptedAccess = encryptToken(refreshed.access_token);
        const newEncryptedRefresh = encryptToken(refreshed.refresh_token);

        await prisma.hmrcConnection.update({
          where: { firmId },
          data: {
            accessToken: newEncryptedAccess,
            refreshToken: newEncryptedRefresh,
            expiresAt: newExpiresAt,
          },
        });

        return refreshed.access_token;
      } catch (err) {
        console.error('Failed to refresh HMRC token automatically:', err);
        // Fall back to current decrypted token if refresh fails
      }
    }

    return decryptToken(connection.accessToken);
  }

  static async getStatus(firmId: string) {
    const connection = await prisma.hmrcConnection.findUnique({
      where: { firmId },
    });

    const isMock = process.env.INTEGRATION_MODE === 'mock' || (!process.env.HMRC_CLIENT_ID && process.env.INTEGRATION_MODE !== 'sandbox');

    return {
      isConnected: connection?.isConnected || false,
      vrn: connection?.vrn || null,
      environment: connection?.environment || 'sandbox',
      lastSyncAt: connection?.lastSyncAt || null,
      expiresAt: connection?.expiresAt || null,
      isMock,
    };
  }

  static async disconnect(firmId: string) {
    const connection = await prisma.hmrcConnection.findUnique({
      where: { firmId },
    });

    if (connection) {
      await prisma.hmrcConnection.update({
        where: { firmId },
        data: {
          isConnected: false,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
        },
      });

      await prisma.auditLog.create({
        data: {
          firmId,
          action: 'HMRC_DISCONNECTED',
          entity: 'HmrcConnection',
          entityId: connection.id,
          metadata: `Disconnected firm from HMRC MTD API`,
        },
      });
    }

    return { message: 'Disconnected from HMRC successfully' };
  }

  static async syncObligations(firmId: string, req?: Request) {
    const connection = await prisma.hmrcConnection.findUnique({
      where: { firmId },
    });

    const firm = await prisma.firm.findUnique({ where: { id: firmId } });
    const vrn = connection?.vrn || (firm?.vatNumber ? firm.vatNumber.replace(/[^0-9]/g, '') : '987654321');

    const accessToken = await HmrcService.getValidAccessToken(firmId);
    const fraudHeaders = buildHmrcFraudHeaders(req);

    // Call HMRC API
    const obligations = await HmrcService.client.getVatObligations(vrn, accessToken, {
      fraudHeaders,
    });

    for (const ob of obligations) {
      await prisma.vatObligation.upsert({
        where: {
          firmId_periodKey: { firmId, periodKey: ob.periodKey },
        },
        update: {
          status: ob.status === 'F' ? VatObligationStatus.FULFILLED : VatObligationStatus.OPEN,
          receivedDate: ob.received ? new Date(ob.received) : null,
          startPeriod: new Date(ob.start),
          endPeriod: new Date(ob.end),
          dueDate: new Date(ob.due),
        },
        create: {
          firmId,
          startPeriod: new Date(ob.start),
          endPeriod: new Date(ob.end),
          dueDate: new Date(ob.due),
          status: ob.status === 'F' ? VatObligationStatus.FULFILLED : VatObligationStatus.OPEN,
          periodKey: ob.periodKey,
          receivedDate: ob.received ? new Date(ob.received) : null,
        },
      });
    }

    if (connection) {
      await prisma.hmrcConnection.update({
        where: { firmId },
        data: { lastSyncAt: new Date() },
      });
    }

    await prisma.auditLog.create({
      data: {
        firmId,
        action: 'HMRC_OBLIGATIONS_SYNCED',
        entity: 'VatObligation',
        entityId: firmId,
        metadata: `Synchronized ${obligations.length} VAT obligations from HMRC MTD API (VRN: ${vrn})`,
      },
    });

    return prisma.vatObligation.findMany({
      where: { firmId },
      orderBy: { startPeriod: 'desc' },
    });
  }

  static async submitReturn(firmId: string, periodKey: string, req?: Request) {
    const vatReturn = await prisma.vatReturn.findFirst({
      where: { firmId, periodKey },
    });

    if (!vatReturn) {
      throw new NotFoundError(`VAT Return for period ${periodKey} must be prepared before submitting.`);
    }

    if (vatReturn.status === VatReturnStatus.SUBMITTED) {
      throw new BadRequestError(`VAT Return for period ${periodKey} has already been submitted to HMRC.`);
    }

    const connection = await prisma.hmrcConnection.findUnique({
      where: { firmId },
    });

    const firm = await prisma.firm.findUnique({ where: { id: firmId } });
    const vrn = connection?.vrn || (firm?.vatNumber ? firm.vatNumber.replace(/[^0-9]/g, '') : '987654321');

    await prisma.auditLog.create({
      data: {
        firmId,
        action: 'VAT_RETURN_SUBMISSION_ATTEMPTED',
        entity: 'VatReturn',
        entityId: vatReturn.id,
        metadata: `Attempting submission of VAT return period ${periodKey} to HMRC for VRN ${vrn}`,
      },
    });

    const accessToken = await HmrcService.getValidAccessToken(firmId);
    const fraudHeaders = buildHmrcFraudHeaders(req);

    let submissionResult: HmrcSubmissionReceipt;
    try {
      submissionResult = await HmrcService.client.submitVatReturn(
        vrn,
        {
          periodKey: vatReturn.periodKey,
          vatDueSales: Number(vatReturn.box1),
          vatDueAcquisitions: Number(vatReturn.box2),
          totalVatDue: Number(vatReturn.box3),
          vatReclaimedCurrPeriod: Number(vatReturn.box4),
          netVatDue: Number(vatReturn.box5),
          totalValueSalesExVAT: Number(vatReturn.box6),
          totalValuePurchasesExVAT: Number(vatReturn.box7),
          totalValueGoodsSuppliedExVAT: Number(vatReturn.box8),
          totalAcquisitionsExVAT: Number(vatReturn.box9),
          finalised: true,
        },
        accessToken,
        fraudHeaders
      );
    } catch (err: any) {
      // Submission failed at HMRC: do NOT mark return as SUBMITTED!
      await prisma.auditLog.create({
        data: {
          firmId,
          action: 'VAT_RETURN_SUBMISSION_FAILED',
          entity: 'VatReturn',
          entityId: vatReturn.id,
          metadata: `Submission failed for period ${periodKey}: ${err.message || 'Unknown HMRC error'}`,
        },
      });
      throw err;
    }

    // Update return status & obligation only upon confirmed success
    const updatedReturn = await prisma.$transaction(async (tx) => {
      const res = await tx.vatReturn.update({
        where: { id: vatReturn.id },
        data: {
          status: VatReturnStatus.SUBMITTED,
          submittedAt: new Date(submissionResult.processingDate || Date.now()),
          hmrcCorrelationId: submissionResult.correlationId,
        },
      });

      await tx.vatObligation.updateMany({
        where: { firmId, periodKey },
        data: {
          status: VatObligationStatus.FULFILLED,
          receivedDate: new Date(submissionResult.processingDate || Date.now()),
        },
      });

      await tx.auditLog.create({
        data: {
          firmId,
          action: 'VAT_RETURN_SUBMITTED',
          entity: 'VatReturn',
          entityId: res.id,
          metadata: `Submitted VAT Return ${periodKey} to HMRC. CorrelationId: ${submissionResult.correlationId}, Bundle: ${submissionResult.formBundleNumber}`,
        },
      });

      return res;
    });

    return {
      vatReturn: updatedReturn,
      hmrcReceipt: submissionResult,
    };
  }
}
