"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Building2,
  Lightbulb,
  Users,
  TrendingUp,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Lock,
  Mail,
  ArrowRight,
  User,
  Building,
  Rocket,
  Sun,
  Moon,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { useThemeStore } from "@/store/theme";
import { AnimatedHeroVisual } from "@/components/landing/AnimatedHeroVisual";
import { Role } from "@/types";
import { MOCK_USERS } from "@/lib/mock-data";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useSessionStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDarkMode = theme === "dark";

  const [authMode, setAuthMode] = useState<"SIGN_IN" | "SIGN_UP">("SIGN_IN");
  const [selectedRole, setSelectedRole] = useState<Role>("GOVERNMENT");
  const [fullName, setFullName] = useState<string>("Riya Sharma");
  const [orgName, setOrgName] = useState<string>("GreenTech Solutions");
  const [email, setEmail] = useState<string>("amit.sharma@gov.in");
  const [password, setPassword] = useState<string>("password123");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync with searchParams on mount (e.g. /login?role=STARTUP)
  useEffect(() => {
    const roleParam = searchParams.get("role")?.toUpperCase();
    if (roleParam === "STARTUP") {
      setSelectedRole("STARTUP");
      setEmail("founder@techstartup.in");
    } else if (roleParam === "EVALUATOR") {
      setSelectedRole("EVALUATOR");
      setEmail("priya.sharma@evaluator.org");
    }
  }, [searchParams]);

  // Handle role switch in login page
  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    const matchedUser = MOCK_USERS.find((u) => u.role === role);
    if (matchedUser) {
      setEmail(matchedUser.email);
    } else if (role === "STARTUP") {
      setEmail("founder@techstartup.in");
    }

    // Sign up is for Startups only. If switching to Government or Evaluator during Sign Up, revert to Sign In.
    if (authMode === "SIGN_UP" && role !== "STARTUP") {
      setAuthMode("SIGN_IN");
      setErrorMsg("Government & Evaluator accounts are invite-only. Sign Up is for Startups & Entrepreneurs.");
    } else {
      setErrorMsg(null);
    }
  };

  const handleAuthModeChange = (mode: "SIGN_IN" | "SIGN_UP") => {
    if (mode === "SIGN_UP") {
      setSelectedRole("STARTUP");
      setEmail("founder@techstartup.in");
      setErrorMsg(null);
    }
    setAuthMode(mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login(email, password, selectedRole);
      if (selectedRole === "STARTUP") {
        router.push("/startup/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setErrorMsg("Invalid credentials. Please verify your email and try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);

    setTimeout(async () => {
      try {
        const targetEmail =
          selectedRole === "STARTUP"
            ? "founder@techstartup.in"
            : selectedRole === "GOVERNMENT"
            ? "amit.sharma@gov.in"
            : "priya.sharma@evaluator.org";

        await login(targetEmail, "google-oauth", selectedRole);
        setGoogleLoading(false);

        if (selectedRole === "STARTUP") {
          router.push("/startup/dashboard");
        } else {
          router.push("/dashboard");
        }
      } catch {
        setErrorMsg("Google Authentication failed. Please try again.");
        setGoogleLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F5F6FA] dark:bg-[#0B1120]">
      {/* LEFT PANEL (~45% width on desktop) */}
      <div className="w-full md:w-[45%] lg:w-[44%] bg-[#16224B] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Background Radial Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-35 -mb-35" />

        {/* Top Header Logo & Entrepreneur Link */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2F5FEA] to-indigo-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">
                InnovateGov
              </h1>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Government · Entrepreneurs · Better Tomorrow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme Mode"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-300" />
              )}
            </button>
            <Link
              href="/for-startups"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-all backdrop-blur-xs"
            >
              <span>For Entrepreneur</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </Link>
          </div>
        </div>

        {/* Hero Pitch Section */}
        <div className="relative z-10 my-8 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight"
          >
            Connecting Government Challenges with Entrepreneur Innovations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-sm text-slate-300 leading-relaxed max-w-md"
          >
            A transparent, efficient and startup-friendly platform to identify, pilot, procure and scale innovative public sector solutions.
          </motion.p>
        </div>

        {/* Animated Coded Hero Visual (Government Public Sector Variant) */}
        <div className="relative z-10 py-4 my-auto flex items-center justify-center">
          <AnimatedHeroVisual variant="government" />
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
          <span>© 2026 InnovateGov Platform</span>
          <span>Version 2.0 (Developer Spec)</span>
        </div>
      </div>

      {/* RIGHT PANEL (~55% width on desktop) */}
      <div className="w-full md:w-[55%] lg:w-[56%] bg-white dark:bg-[#0B1120] p-8 lg:p-14 flex items-center justify-center">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="w-full max-w-md space-y-6"
        >
          {/* Sign In vs Sign Up Tabs Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleAuthModeChange("SIGN_IN")}
                className={`text-lg font-extrabold pb-1 transition-all ${
                  authMode === "SIGN_IN"
                    ? "text-slate-900 dark:text-white border-b-2 border-[#2F5FEA]"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleAuthModeChange("SIGN_UP")}
                className={`text-lg font-extrabold pb-1 transition-all ${
                  authMode === "SIGN_UP"
                    ? "text-slate-900 dark:text-white border-b-2 border-[#2F5FEA]"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                Sign Up
              </button>
            </div>
            {authMode === "SIGN_UP" && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-[#2F5FEA] border border-blue-500/20">
                Startups & Entrepreneurs Only
              </span>
            )}
          </div>

          {/* Google OAuth Button */}
          <motion.div variants={fadeInUp} className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2.5 min-h-[46px]"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#2F5FEA]" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Official Multi-Color Google G Logo SVG */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Or with Email
              </span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>
          </motion.div>

          {/* Main Auth Form */}
          <motion.form
            variants={staggerContainer}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* 3-Way Segmented Role Selector */}
            <motion.div variants={fadeInUp} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Select Portal Role
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleRoleChange("GOVERNMENT")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedRole === "GOVERNMENT"
                      ? "bg-[#2F5FEA] text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Government</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange("STARTUP")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedRole === "STARTUP"
                      ? "bg-[#2F5FEA] text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Startup</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange("EVALUATOR")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedRole === "EVALUATOR"
                      ? "bg-[#2F5FEA] text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Evaluator</span>
                </button>
              </div>
            </motion.div>

            {/* Sign Up Additional Fields */}
            {authMode === "SIGN_UP" && (
              <>
                <motion.div variants={fadeInUp} className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Riya Sharma"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Organization / Startup Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. GreenTech Solutions"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30"
                    />
                  </div>
                </motion.div>
              </>
            )}

            {/* Email Field */}
            <motion.div variants={fadeInUp} className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 transition-all"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={fadeInUp} className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {authMode === "SIGN_IN" && (
                  <a
                    href="#forgot"
                    onClick={(e) => e.preventDefault()}
                    className="text-xs font-semibold text-[#2F5FEA] hover:underline"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Error Alert Box */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 font-medium"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              variants={fadeInUp}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA] focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>{authMode === "SIGN_IN" ? "Signing In..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <span>{authMode === "SIGN_IN" ? "Sign In to Workspace" : "Create Entrepreneur Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
