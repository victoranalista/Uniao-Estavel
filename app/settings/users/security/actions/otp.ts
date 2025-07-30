'use server';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { otpLimiter } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';
import { fetchHistory, isAdmin, validateRequired } from './userAuth';
import type { Result, OtpStatus, QrResult } from '../types';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';

const checkOtpRateLimit = async (email: string) => {
  const { success } = await otpLimiter.limit(email);
  return success;
};

export const validateOtp = async (
  email: string,
  otp: string
): Promise<Result> => {
  await requireSession([Role.ADMIN]);
  const error = validateRequired({ email, otp });
  if (error) return error;
  if (!/^\d{6}$/.test(otp))
    return { success: false, message: 'Formato de OTP inválido' };
  try {
    if (!(await checkOtpRateLimit(email)))
      return {
        success: false,
        message: 'Já houve um pagamento. Tente novamente em 40 segundos'
      };
    const history = await fetchHistory(email);
    if (!isAdmin(history))
      return { success: false, message: 'Você não pode realizar essa ação' };
    if (!history?.totpSecret || !history.totpEnabled)
      return { success: false, message: 'OTP não cadastrado' };
    if (
      !speakeasy.totp.verify({
        secret: history.totpSecret,
        encoding: 'base32',
        token: otp,
        window: 1
      })
    )
      return { success: false, message: 'OTP inválido' };
    return { success: true };
  } catch {
    return { success: false, message: 'Internal server error' };
  }
};

export const getOtpStatus = async (email: string): Promise<OtpStatus> => {
  if (!email) return { enabled: false };
  try {
    const history = await fetchHistory(email);
    return { enabled: !!history?.totpEnabled };
  } catch {
    return { enabled: false };
  }
};

export const generateOtpQrCode = async (email: string): Promise<QrResult> => {
  if (!email) return { success: false };
  try {
    const historyRaw = await fetchHistory(email);
    if (!historyRaw) return { success: false };
    if (!isAdmin(historyRaw))
      return { success: false, message: 'Você não pode realizar essa ação' };
    if (historyRaw.totpEnabled) return { success: false };
    if (historyRaw.totpSecret) {
      const otpauthUrl = speakeasy.otpauthURL({
        secret: historyRaw.totpSecret,
        label: `CC Catarina - ${email}`,
        encoding: 'base32'
      });
      const qrCode = await qrcode.toDataURL(otpauthUrl);
      return { success: true, qrCode, secret: historyRaw.totpSecret };
    }
    const secretObj = speakeasy.generateSecret({
      name: `CC Catarina - ${email}`
    });
    if (!secretObj.base32 || !secretObj.otpauth_url)
      return { success: false, message: 'Erro ao gerar secret' };
    const qrCode = await qrcode.toDataURL(secretObj.otpauth_url);
    await prisma.userHistory.update({
      where: { id: historyRaw.id },
      data: { totpSecret: secretObj.base32, totpEnabled: false }
    });
    return { success: true, qrCode, secret: secretObj.base32 };
  } catch {
    return { success: false, message: 'Internal server error' };
  }
};

export const enableOtp = async (
  email: string,
  otp: string
): Promise<Result> => {
  const error = validateRequired({ email, otp });
  if (error) return error;
  if (!/^\d{6}$/.test(otp))
    return { success: false, message: 'Formato de OTP inválido' };
  try {
    const historyRaw = await fetchHistory(email);
    if (!historyRaw)
      return { success: false, message: 'Usuário não encontrado' };
    if (!isAdmin(historyRaw))
      return { success: false, message: 'Você não pode realizar essa ação' };
    if (!historyRaw.totpSecret)
      return { success: false, message: 'Erro ao gerar secret' };
    if (
      !speakeasy.totp.verify({
        secret: historyRaw.totpSecret,
        encoding: 'base32',
        token: otp,
        window: 1
      })
    )
      return { success: false, message: 'OTP inválido' };
    await prisma.userHistory.update({
      where: { id: historyRaw.id },
      data: { totpEnabled: true, totpVerifiedAt: new Date() }
    });
    return { success: true };
  } catch {
    return { success: false, message: 'Internal server error' };
  }
};
