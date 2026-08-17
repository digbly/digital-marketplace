import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useForgotPasswordMutation } from '../../store/services/authApi';
import { getErrorMessage } from '../../utils/apiError';

interface ForgotPasswordFormInputs {
  email: string;
}

export const ForgotPasswordView: React.FC = () => {
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
  });

  const [forgotPassword, { isLoading, error: apiError }] = useForgotPasswordMutation();

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    try {
      await forgotPassword({ email: data.email }).unwrap();
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch {
      // Server error is handled via apiError state
    }
  };

  const serverErrorMessage = apiError ? getErrorMessage(apiError) : null;

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Check your email
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            We sent a password reset link to <strong className="text-slate-900 dark:text-slate-200 font-semibold">{submittedEmail}</strong>. Please follow the instructions to reset your password.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => setIsSubmitted(false)}
          >
            Send Another Link
          </Button>

          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reset your password
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter the email associated with your account and we&apos;ll send you a recovery link.
        </p>
      </div>

      {/* Backend Error Alert */}
      {serverErrorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverErrorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email address is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address',
            },
          })}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          leftIcon={<Send className="w-4 h-4" />}
        >
          Send Reset Instructions
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center pt-2">
        <Link
          to="/auth/login"
          className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
};
