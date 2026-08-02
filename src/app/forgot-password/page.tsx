'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api/authApi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error('Password reset failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <Link href="/login" className="inline-flex items-center text-rose-gold hover:text-rose-gold-dark mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          <h2 className="text-3xl font-serif font-bold text-black">
            Forgot Password?
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a 6-digit verification code to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter Your Email"
            icon={<Mail className="w-5 h-5 text-gray-400" />}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message}
          />

          <Button type="submit" className="w-full" loading={isLoading}>
            Send Verification Code
          </Button>
        </form>
      </motion.div>
    </div>
  );
}