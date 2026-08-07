'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { setToken } from '../../../lib/auth';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CreditCard,
  Users,
  ShieldCheck,
  Building2,
  TrendingUp,
  Activity,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button, Input, Label } from '@repo/ui';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  pin: z.string().min(4, 'PIN must be at least 4 characters'),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Login failed');
      }

      const { accessToken } = await response.json();
      setToken(accessToken);

      router.push('/admin');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden font-sans text-slate-900 selection:bg-indigo-100">
      {/* ----------------------------------------------------- */}
      {/* GLOBAL BACKGROUND MESH GRADIENT & BLOBS               */}
      {/* ----------------------------------------------------- */}
      <div className="absolute inset-0 z-0 bg-[#fcfcff]">
        <div className="absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/30 blur-[120px] will-change-transform" />
        <div className="absolute -bottom-[10%] left-[20%] h-[40vw] w-[40vw] rounded-full bg-gradient-to-tr from-sky-200/40 to-blue-200/30 blur-[120px] will-change-transform" />
        <div className="absolute -right-[5%] top-[10%] h-[45vw] w-[45vw] rounded-full bg-gradient-to-bl from-purple-200/40 to-pink-200/20 blur-[140px] will-change-transform" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.015] mix-blend-overlay" />
      </div>

      {/* Decorative Floating Particles */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
              y: [0, -30, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0],
            }}
            transition={{
              duration: 4 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
            className="absolute rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
            style={{
              top: `${15 + i * 13}%`,
              left: `${10 + i * 12}%`,
              width: `${4 + (i % 3)}px`,
              height: `${4 + (i % 3)}px`,
            }}
          />
        ))}
      </div>

      {/* ----------------------------------------------------- */}
      {/* LEFT SECTION (Branding & Features)                    */}
      {/* ----------------------------------------------------- */}
      <div className="relative z-10 hidden w-[55%] flex-col justify-between p-12 lg:flex xl:p-20">
        {/* Branding Header */}
        <div className="flex flex-col items-start space-y-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-[0_8px_30px_rgb(99,102,241,0.4)]">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">DineFlow</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl space-y-8"
          >
            <h1 className="text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900 drop-shadow-sm xl:text-7xl">
              Run your restaurant. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Delight every guest.
              </span>
            </h1>
            <p className="max-w-xl text-xl leading-relaxed text-slate-600">
              Manage operations, POS, inventory, staff and analytics from one intelligent, unified
              platform.
            </p>
          </motion.div>
        </div>

        {/* Feature Highlights Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 gap-6 pr-12 xl:pr-24"
        >
          {/* Feature 1 */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_20px_40px_rgba(99,102,241,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <BarChart3 className="h-6 w-6 transition-transform group-hover:scale-110" />
            </div>
            <h3 className="relative z-10 mt-5 text-lg font-bold text-slate-900">Smart Analytics</h3>
            <p className="relative z-10 mt-2 text-sm leading-relaxed text-slate-500">
              Real-time business insights and forecasting.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_20px_40px_rgba(99,102,241,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              <CreditCard className="h-6 w-6 transition-transform group-hover:scale-110" />
            </div>
            <h3 className="relative z-10 mt-5 text-lg font-bold text-slate-900">Unified POS</h3>
            <p className="relative z-10 mt-2 text-sm leading-relaxed text-slate-500">
              Fast billing & contactless payments.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_20px_40px_rgba(99,102,241,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]">
              <Users className="h-6 w-6 transition-transform group-hover:scale-110" />
            </div>
            <h3 className="relative z-10 mt-5 text-lg font-bold text-slate-900">Team Management</h3>
            <p className="relative z-10 mt-2 text-sm leading-relaxed text-slate-500">
              Manage staff schedules and payroll effortlessly.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_20px_40px_rgba(99,102,241,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(2,132,199,0.3)]">
              <ShieldCheck className="h-6 w-6 transition-transform group-hover:scale-110" />
            </div>
            <h3 className="relative z-10 mt-5 text-lg font-bold text-slate-900">
              Enterprise Security
            </h3>
            <p className="relative z-10 mt-2 text-sm leading-relaxed text-slate-500">
              Bank-grade security and role-based access.
            </p>
          </motion.div>
        </motion.div>

        {/* Floating Statistic Cards with Continuous Animation */}
        <div className="relative z-10 mt-16 flex flex-wrap gap-6">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-4 rounded-3xl border border-white/60 bg-white/50 px-6 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-inner">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">250+</p>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Restaurants
              </p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="flex items-center gap-4 rounded-3xl border border-white/60 bg-white/50 px-6 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">1.2M+</p>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Orders</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="flex items-center gap-4 rounded-3xl border border-white/60 bg-white/50 px-6 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">99.9%</p>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Uptime</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* RIGHT SECTION (Login Form)                            */}
      {/* ----------------------------------------------------- */}
      <div className="relative z-20 flex w-full flex-col items-center justify-center p-6 lg:w-[45%] lg:px-12 xl:px-24">
        {/* Mobile Header Branding */}
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">DineFlow</span>
        </div>

        {/* Glow Behind the Login Card */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="w-full max-w-lg"
        >
          {/* High-End Glassmorphism Login Card */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/70 p-10 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.5)_inset] backdrop-blur-3xl sm:p-14">
            <div className="mb-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-white text-indigo-600 shadow-[0_8px_30px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,1)_inset]"
              >
                <Lock className="h-8 w-8 drop-shadow-sm" />
              </motion.div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome Back
              </h2>
              <p className="mt-3 text-base text-slate-500">Sign in to continue to DineFlow.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-100 bg-red-50/80 p-5 text-sm font-medium text-red-600 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {error}
                  </div>
                </motion.div>
              )}

              <div className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-bold uppercase tracking-widest text-slate-400"
                  >
                    Email Address
                  </Label>
                  <div className="group relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@restaurant.com"
                      className="h-14 rounded-2xl border-slate-200/60 bg-white/60 pl-12 pr-4 text-base shadow-inner transition-all hover:bg-white/80 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      {...register('email')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-500"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* PIN Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="pin"
                    className="text-xs font-bold uppercase tracking-widest text-slate-400"
                  >
                    Secure PIN
                  </Label>
                  <div className="group relative">
                    <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                    <Input
                      id="pin"
                      type="password"
                      placeholder="••••"
                      className="h-14 rounded-2xl border-slate-200/60 bg-white/60 pl-12 pr-4 text-base shadow-inner transition-all hover:bg-white/80 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      {...register('pin')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.pin && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-500"
                    >
                      {errors.pin.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Extra Options */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 cursor-pointer select-none"
                  >
                    Remember Me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-500"
                >
                  Forgot PIN?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 text-lg font-bold text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(99,102,241,0.5)] active:translate-y-0"
              >
                {/* Button Hover Glow Overlay */}
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <svg
                      className="h-6 w-6 animate-spin text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <>
                    Sign In to Workspace
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-10 text-center text-sm font-medium text-slate-500">
            Need help?{' '}
            <a
              href="#"
              className="font-bold text-indigo-600 transition-colors hover:text-indigo-500"
            >
              Contact Administrator
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
