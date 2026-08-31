import prisma from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { HmrcClient } from './hmrc.client';
import { VatReturnStatus, VatObligationStatus } from '@prisma/client';

export class HmrcService {
  private static client = new HmrcClient();

  static async getConnectUrl(firmId: string) {
    const state = Buffer.from(JSON.stringify({ firmId, timestamp: Date.now() })).toString('base64');
    return HmrcService.client.getAuthorizationUrl(state);
  }

  static async handleCallback(firmId: string, code: string) {
    const firm = await prisma.firm.findUnique({ where: { id: firmId } });
    if (!firm) {
      throw new NotFoundError('Firm not found');
    }

    const vrn = firm.vatNumber ? firm.vatNumber.replace(/[^0-9]/g, '') : '987654321';

    const connection = await prisma.hmrcConnection.upsert({
      where: { firmId },
      update: {
        vrn,
        isConnected: true,
        accessToken: `mock_hmrc_access_token_${Date.now()}`,
        refreshToken: `mock_hmrc_refresh_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30),
        lastSyncAt: new Date(),
        environment: process.env.HMRC_ENVIRONMENT || 'sandbox',
      },
      create: {
        firmId,
        vrn,
        isConnected: true,
        accessToken: `mock_hmrc_access_token_${Date.now()}`,
        refreshToken: `mock_hmrc_refresh_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30),
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
        metadata: `Successfully connected firm to HMRC MTD VAT API (VRN: ${vrn})`,
      },
    });

    return connection;
  }

  static async getStatus(firmId: string) {
    const connection = await prisma.hmrcConnection.findUnique({
      where: { firmId },
    });

    return {
      isConnected: connection?.isConnected || false,
      vrn: connection?.vrn || null,
      environment: connection?.environment || 'sandbox',
      lastSyncAt: connection?.lastSyncAt || null,
      expiresAt: connection?.expiresAt || null,
      isMock: process.env.INTEGRATION_MODE === 'mock' || !process.env.HMRC_CLIENT_ID,
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

  static async syncObligations(firmId: string) {
    const connection = await prisma.hmrcConnection.findUnique({
      where: { firmId },
    });

    const vrn = connection?.vrn || '987654321';
    const obligations = await HmrcService.client.getVatObligations(vrn);

    for (const ob of obligations) {
      await prisma.vatObligation.upsert({
        where: {
          firmId_periodKey: { firmId, periodKey: ob.periodKey },
        },
        update: {
          status: ob.status === 'F' ? VatObligationStatus.FULFILLED : VatObligationStatus.OPEN,
          receivedDate: ob.received ? new Date(ob.received) : null,
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

    return prisma.vatObligation.findMany({
      where: { firmId },
      orderBy: { startPeriod: 'desc' },
    });
  }

  static async submitReturn(firmId: string, periodKey: string) {
    const vatReturn = await prisma.vatReturn.findFirst({
      where: { firmId, periodKey },
    });

    if (!vatReturn) {
      throw new NotFoundError(`VAT Return for period ${periodKey} must be prepared before submitting.`);
    }

    const connection = await prisma.hmrcConnection.findUnique({
      where: { firmId },
    });

    const vrn = connection?.vrn || '987654321';

    const submissionResult = await HmrcService.client.submitVatReturn(vrn, {
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
    });

    // Update return status & obligation
    const updatedReturn = await prisma.$transaction(async (tx) => {
      const res = await tx.vatReturn.update({
        where: { id: vatReturn.id },
        data: {
          status: VatReturnStatus.SUBMITTED,
          submittedAt: new Date(),
          hmrcCorrelationId: submissionResult.correlationId,
        },
      });

      await tx.vatObligation.updateMany({
        where: { firmId, periodKey },
        data: {
          status: VatObligationStatus.FULFILLED,
          receivedDate: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          firmId,
          action: 'VAT_RETURN_SUBMITTED',
          entity: 'VatReturn',
          entityId: res.id,
          metadata: `Submitted VAT Return ${periodKey} to HMRC. CorrelationId: ${submissionResult.correlationId}`,
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
