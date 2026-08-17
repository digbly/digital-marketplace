import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useResendVerificationEmailMutation } from '../../store/services/authApi';
import { getErrorMessage } from '../../utils/apiError';

export const VerifyEmailView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [resendEmail, { isLoading, error: apiError }] = useResendVerificationEmailMutation();

  const handleResend = async () => {
    setValidationError(null);
    if (!email) {
      setValidationError('Please specify an email address.');
      return;
    }

    try {
      await resendEmail({ email }).unwrap();
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 5000);
    } catch {
      // Handled by apiError
    }
  };

  const errorMessage = validationError || (apiError ? getErrorMessage(apiError) : null);

  return (
    <div className="space-y-6 text-center animate-in fade-in duration-200">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
        <MailCheck className="w-8 h-8 animate-subtle-float" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Verify your email
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          We sent a verification link to your email address{email ? ` (${email})` : ''}. Please check your inbox and spam folder to activate your account.
        </p>
      </div>

      {/* Status or error feedback */}
      {resendStatus === 'sent' && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>A fresh verification link has been sent!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!emailParam && (
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={() => navigate('/admin')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continue to Dashboard
        </Button>

        <Button
          variant="secondary"
          size="md"
          className="w-full"
          onClick={handleResend}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Resend Verification Email
        </Button>
      </div>

      {/* Back Link */}
      <div className="text-center pt-2">
        <Link
          to="/auth/login"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
        >
          Sign in with another account
        </Link>
      </div>
    </div>
  );
};
