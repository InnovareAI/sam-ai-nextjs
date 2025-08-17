import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VoucherCodeInputProps {
  onVoucherValidated: (voucherCode: string, email: string) => void;
  userEmail: string;
  disabled?: boolean;
}

export default function VoucherCodeInput({ onVoucherValidated, userEmail, disabled }: VoucherCodeInputProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [voucherInfo, setVoucherInfo] = useState<any>(null);

  const validateVoucher = async () => {
    if (!voucherCode.trim()) {
      setError('Please enter a voucher code');
      return;
    }

    if (!userEmail.trim()) {
      setError('Please enter your email address first');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const { data, error } = await supabase.rpc('validate_voucher_code', {
        voucher_code: voucherCode.trim().toUpperCase(),
        user_email: userEmail.toLowerCase()
      });

      if (error) {
        throw error;
      }

      if (data?.valid) {
        setIsValid(true);
        setVoucherInfo(data);
        onVoucherValidated(voucherCode.trim().toUpperCase(), userEmail.toLowerCase());
      } else {
        setIsValid(false);
        setError(data?.error || 'Invalid voucher code');
      }
    } catch (err: any) {
      console.error('Voucher validation error:', err);
      setIsValid(false);
      setError('Failed to validate voucher code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateVoucher();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voucherCode" className="text-slate-200">
          Invitation Code *
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="voucherCode"
              type="text"
              placeholder="Enter your invitation code"
              className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
              value={voucherCode}
              onChange={(e) => {
                setVoucherCode(e.target.value.toUpperCase());
                setIsValid(null);
                setError('');
                setVoucherInfo(null);
              }}
              onKeyPress={handleKeyPress}
              disabled={disabled || isValidating}
              required
            />
            {isValid === true && (
              <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-400" />
            )}
            {isValid === false && (
              <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-400" />
            )}
          </div>
          <Button
            type="button"
            onClick={validateVoucher}
            disabled={disabled || isValidating || !voucherCode.trim() || !userEmail.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {isValid === true && voucherInfo && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div>
              <strong>Valid invitation code!</strong>
              {voucherInfo.description && (
                <div className="mt-1 text-sm opacity-80">
                  {voucherInfo.description}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-slate-400">
        You need a valid invitation code to create an account. Contact your administrator if you don't have one.
      </div>
    </div>
  );
}