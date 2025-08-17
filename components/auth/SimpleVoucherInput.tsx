import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SimpleVoucherInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  userEmail: string;
  disabled?: boolean;
}

export default function SimpleVoucherInput({ 
  value, 
  onChange, 
  onValidationChange, 
  userEmail, 
  disabled 
}: SimpleVoucherInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  const validateVoucher = async () => {
    if (!value.trim()) {
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
        voucher_code: value.trim().toUpperCase(),
        user_email: userEmail.toLowerCase()
      });

      if (error) {
        throw error;
      }

      if (data?.valid) {
        setIsValid(true);
        setError('');
        onValidationChange(true);
      } else {
        setIsValid(false);
        setError(data?.error || 'Invalid voucher code for this email');
        onValidationChange(false);
      }
    } catch (err: any) {
      console.error('Voucher validation error:', err);
      setIsValid(false);
      setError('Failed to validate voucher code. Please try again.');
      onValidationChange(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
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
            placeholder="Enter invitation code"
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
            value={value}
            onChange={(e) => {
              const newValue = e.target.value.toUpperCase();
              onChange(newValue);
              setIsValid(null);
              setError('');
              onValidationChange(false);
            }}
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
          disabled={disabled || isValidating || !value.trim() || !userEmail.trim()}
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
      
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      
      {isValid === true && (
        <p className="text-sm text-green-400">✓ Valid invitation code</p>
      )}
      
      <p className="text-xs text-slate-400">
        You need a valid invitation code to create an account.
      </p>
    </div>
  );
}