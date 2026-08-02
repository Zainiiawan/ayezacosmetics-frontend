'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { Lock, CheckCircle, ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { authApi } from '@/lib/api/authApi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ResetPasswordFormData {
  otp: string;
  password?: string;
  confirmPassword?: string;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Either we have an email (new OTP flow) or token (old magic link fallback)
  const emailParam = searchParams.get('email') ?? '';
  const tokenParam = searchParams.get('token') ?? '';
  
  // Step 1: OTP, Step 2: New Password
  // If we already have a token in URL (old flow), we can skip straight to Step 2
  const [step, setStep] = useState<1 | 2>(tokenParam ? 2 : 1);
  const [secureToken, setSecureToken] = useState<string>(tokenParam);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  const onOtpSubmit = async (data: ResetPasswordFormData) => {
    if (!emailParam) {
      setError('Missing email address. Please request a new code.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await authApi.verifyResetOtp(emailParam, data.otp);
      setSecureToken(response.token);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: ResetPasswordFormData) => {
    if (!secureToken) {
      setError('Missing reset token. Please verify your OTP again.');
      return;
    }
    if (!data.password || !data.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authApi.resetPassword(secureToken, data.password, data.confirmPassword);
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The session may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-black mb-2">Password Reset Successful!</h2>
        <p className="text-gray-600 mb-6">Your password has been updated. Redirecting to login...</p>
        <Link href="/login"><Button>Go to Login</Button></Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link href="/login" className="inline-flex items-center text-rose-gold hover:text-rose-gold-dark mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Login
      </Link>
      
      <h2 className="text-3xl font-serif font-bold text-black mb-2">
        {step === 1 ? 'Verify Code' : 'Create New Password'}
      </h2>
      <p className="text-gray-600 mb-8">
        {step === 1 
          ? 'Enter the 6-digit verification code sent to your email.' 
          : 'Please enter your new password below.'}
      </p>

      {step === 1 && (
        <form onSubmit={handleSubmit(onOtpSubmit)} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={emailParam}
            disabled
            icon={<Mail className="w-5 h-5 text-gray-400" />}
          />
          <Input
            label="6-Digit Verification Code"
            type="text"
            placeholder="123456"
            maxLength={6}
            icon={<KeyRound className="w-5 h-5 text-gray-400" />}
            {...register('otp', {
              required: 'Verification code is required',
              pattern: { value: /^\d{6}$/, message: 'Code must be exactly 6 digits' },
            })}
            error={errors.otp?.message}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" loading={isLoading}>
            Verify Code
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6">
          <Input
            label="New Password"
            type="password"
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
            })}
            error={errors.password?.message}
          />
          <Input
            label="Confirm Password"
            type="password"
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            })}
            error={errors.confirmPassword?.message}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" loading={isLoading}>
            Reset Password
          </Button>
        </form>
      )}
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
