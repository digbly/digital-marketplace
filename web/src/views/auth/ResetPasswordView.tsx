import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useResetPasswordMutation } from '../../store/services/authApi';
import { getErrorMessage } from '../../utils/apiError';

interface ResetPasswordFormInputs {
  email: string;
  password: string;
  passwordConfirmation: string;
}

export const ResetPasswordView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>({
    mode: 'onTouched',
    defaultValues: {
      email: emailParam,
      password: '',
      passwordConfirmation: '',
    },
  });

  const [resetPassword, { isLoading, error: apiError }] = useResetPasswordMutation();

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    try {
      await resetPassword({
        email: data.email,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
        token: tokenParam || 'mock-reset-token',
      }).unwrap();

      setIsSuccess(true);
    } catch {
      // Handled via apiError
    }
  };

  const serverErrorMessage = apiError ? getErrorMessage(apiError) : null;

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Password updated!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Your password has been successfully reset. You can now use your new password to sign in.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => navigate('/auth/login')}
          >
            Proceed to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create new password
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your new password must be at least 8 characters
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

        <Input
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 characters"
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          error={errors.password?.message}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters long',
            },
          })}
        />

        <Input
          label="Confirm New Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat new password"
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          error={errors.passwordConfirmation?.message}
          {...register('passwordConfirmation', {
            required: 'Please confirm your password',
            validate: (value, formValues) =>
              value === formValues.password || 'Passwords do not match',
          })}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          leftIcon={<KeyRound className="w-4 h-4" />}
        >
          Reset Password
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center pt-2">
        <Link
          to="/auth/login"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
        >
          Cancel and return to sign in
        </Link>
      </div>
    </div>
  );
};
