'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { validatePassword } from './actions/password';
import {
  getOtpStatus,
  validateOtp,
  generateOtpQrCode,
  enableOtp
} from './actions/otp';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { useSession } from 'next-auth/react';

enum PaymentStep {
  PASSWORD = 'password',
  OTP = 'otp',
  REGISTER_OTP = 'registerOtp',
  DONE = 'done'
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaymentModal({ open, onClose }: PaymentModalProps) {
  const { data: session } = useSession();
  const email = session?.user?.email || '';
  const [step, setStep] = useState(PaymentStep.PASSWORD);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    setStep(PaymentStep.PASSWORD);
    setPassword('');
    setOtp('');
    setQrCode(null);
  }, [open, email]);
  useEffect(() => {
    if (step === PaymentStep.PASSWORD && inputRef.current)
      inputRef.current.focus();
  }, [step]);
  const fetchQrCode = useCallback(async () => {
    setLoading(true);
    try {
      const res = await generateOtpQrCode(email);
      if (res.success && res.qrCode) {
        setQrCode(res.qrCode);
        toast('QR Code gerado com sucesso.');
      } else throw new Error(res.message ?? 'Erro ao gerar QR Code');
    } catch (err) {
      toast.error(
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Erro ao gerar QR Code'
      );
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handlePassword = useCallback(async () => {
    setLoading(true);
    try {
      const result = await validatePassword(email, password);
      if (!result.success) {
        toast.error(result.message ?? 'Senha inválida');
        return;
      }
      toast.success('Senha validada com sucesso');
      const { enabled } = await getOtpStatus(email);
      if (enabled) {
        setStep(PaymentStep.OTP);
        setQrCode(null);
      } else {
        setStep(PaymentStep.REGISTER_OTP);
        await fetchQrCode();
      }
    } catch (err) {
      toast.error('Erro ao validar senha');
    } finally {
      setLoading(false);
    }
  }, [email, password, fetchQrCode]);

  const handleOtpValidation = useCallback(async () => {
    setLoading(true);
    try {
      const result = await validateOtp(email, otp);
      if (!result.success) {
        toast.error(result.message ?? 'OTP inválido');
        return;
      }
      toast.success('Pagamento confirmado');
      setStep(PaymentStep.DONE);
    } catch {
      toast.error('Erro ao validar OTP');
    } finally {
      setLoading(false);
    }
  }, [email, otp]);

  const handleEnableOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const res = await enableOtp(email, otp);
        if (!res.success) {
          toast.error(res.message ?? 'OTP inválido, tente novamente');
          return;
        }
        toast.success('OTP habilitado com sucesso');
        setStep(PaymentStep.DONE);
        setQrCode(null);
      } catch {
        toast.error('Erro ao habilitar OTP');
      } finally {
        setLoading(false);
      }
    },
    [email, otp]
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagamento</DialogTitle>
        </DialogHeader>
        {step === PaymentStep.PASSWORD && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePassword();
            }}
            className="space-y-4"
          >
            <Input
              ref={inputRef}
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <DialogFooter>
              <Button type="submit" disabled={loading || !password}>
                {loading ? 'Validando...' : 'Avançar'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        )}
        {step === PaymentStep.OTP && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOtpValidation();
            }}
            className="space-y-4"
          >
            <div className="flex justify-center my-4">
              <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading || otp.length !== 6}>
                {loading ? 'Validando...' : 'Confirmar pagamento'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        )}
        {step === PaymentStep.REGISTER_OTP && (
          <div className="flex flex-col justify-center items-center space-y-4">
            <p className="text-center">
              Escaneie o QR Code no Google Authenticator:
            </p>
            {loading && !qrCode && <p>Carregando QR Code...</p>}
            {qrCode && <img src={qrCode} alt="QR Code OTP" className="mb-8" />}
            <form
              onSubmit={handleEnableOtp}
              className="w-full flex flex-col items-center space-y-7"
            >
              <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <DialogFooter>
                <Button type="submit" disabled={loading || otp.length !== 6}>
                  {loading ? 'Validando...' : 'Validar OTP'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancelar
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
        {step === PaymentStep.DONE && (
          <div className="text-center space-y-4">
            <p className="text-lg font-bold">Pagamento realizado!</p>
            <DialogFooter>
              <Button onClick={handleClose}>Fechar</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
