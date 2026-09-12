"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  FileText,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  Landmark,
  PartyPopper,
  MessageSquare,
  Info,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { useThemeStore } from "@/store/theme";
import {
  getFundingApplicationByStartup,
  getWishlistMatches,
  getVerification,
  getFacilitationPipeline,
  getChallenges,
} from "@/lib/api";
import {
  FundingApplication,
  WishlistMatch,
  Verification,
  FacilitationRecord,
  Challenge,
} from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function StartupStatusPage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();
  const { theme } = useThemeStore();
  const isDarkMode = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [fundingApp, setFundingApp] = useState<FundingApplication | null>(null);
  const [wishlistMatch, setWishlistMatch] = useState<
    (WishlistMatch & { challenge?: Challenge }) | null
  >(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [facilitationRecord, setFacilitationRecord] = useState<FacilitationRecord | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser || currentUser.role !== "STARTUP") {
      router.push("/login?role=STARTUP");
      return;
    }

    const startupId = currentUser.startupId || "start-1";

    async function loadStatusData() {
      setLoading(true);
      try {
        const app = await getFundingApplicationByStartup(startupId);
        if (!app) {
          // If startup has no application on file, redirect to application form
          router.replace("/startup/apply");
          return;
        }

        setFundingApp(app);

        // Fetch matches, verifications, and facilitation pipeline for this startup
        const challenges = await getChallenges();
        let foundMatch: WishlistMatch | null = null;
        let matchedChallenge: Challenge | undefined = undefined;

        for (const c of challenges) {
          const matches = await getWishlistMatches(c.id);
          const found = matches.find((m) => m.fundingApplicationId === app.id);
          if (found) {
            foundMatch = found;
            matchedChallenge = c;
            break;
          }
        }

        if (foundMatch) {
          setWishlistMatch({ ...foundMatch, challenge: matchedChallenge });

          // Fetch verification for this match
          const ver = await getVerification(foundMatch.id);
          setVerification(ver);

          if (ver) {
            const pipeline = await getFacilitationPipeline();
            const fac = pipeline.find((p) => p.verificationId === ver.id);
            if (fac) {
              setFacilitationRecord(fac);
            }
          }
        }
      } catch (err) {
        console.error("Error loading status tracker data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStatusData();
  }, [currentUser, hasHydrated, router]);

  // Stepper Progression Mapping
  // Steps: 0: Pending -> 1: Matched -> 2: Verifying -> 3: Verified -> 4: Negotiating -> 5: Funded
  const getActiveStepIndex = () => {
    if (!fundingApp) return 0;
    if (fundingApp.status === "REJECTED" || facilitationRecord?.stage === "CLOSED_NOT_FUNDED") return -1;
    if (facilitationRecord?.stage === "FUNDED") return 5;
    if (facilitationRecord?.stage === "NEGOTIATING" || facilitationRecord?.stage === "OUTREACH") return 4;
    if (verification?.identityStatus === "APPROVED" && verification?.technicalStatus === "APPROVED") return 3;
    if (fundingApp.status === "VERIFYING" || verification) return 2;
    if (fundingApp.status === "MATCHED" || wishlistMatch) return 1;
    return 0;
  };

  const activeStepIdx = getActiveStepIndex();

  const stepperSteps = [
    { title: "Pending", desc: "Submitted to AI engine" },
    { title: "Matched", desc: "AI Wishlist shortlisting" },
    { title: "Verification", desc: "Identity & Technical review" },
    { title: "Verified", desc: "DPIIT & Tech approved" },
    { title: "In Discussion", desc: "Government department outreach" },
    { title: "Funding Secured", desc: "Grant & Pilot MoA finalized" },
  ];

  if (!hasHydrated || loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#8C634B] animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">
          Loading application status & verification telemetry...
        </p>
      </div>
    );
  }

  if (!fundingApp) return null;

  const isFunded = facilitationRecord?.stage === "FUNDED";
  const isClosed = fundingApp.status === "REJECTED" || facilitationRecord?.stage === "CLOSED_NOT_FUNDED";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="space-y-3 border-b border-[#EFECE6] dark:border-[#332D28] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#8C634B]/10 text-[#8C634B] dark:bg-amber-400/20 dark:text-amber-300 border border-[#8C634B]/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>InnovateGov Status Tracker</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Ref: {fundingApp.id.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Funding Application Progress
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submitted on {new Date(fundingApp.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} • Ask Amount: ₹{(fundingApp.fundingAskAmount / 100000).toFixed(1)} Lakhs
          </p>
        </div>

        <Link
          href="/startup/challenges"
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>Browse All Challenges</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>

      {/* CELEBRATORY SUCCESS BANNER (If Stage == FUNDED) */}
      <AnimatePresence>
        {isFunded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-2xl relative overflow-hidden space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg"
                >
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider">
                    Pilot MoA Finalized
                  </span>
                  <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">
                    Funding Secured & Approved!
                  </h2>
                </div>
              </div>

              <PartyPopper className="w-10 h-10 text-amber-200 opacity-80 hidden sm:block" />
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-emerald-100 font-medium">Secured Grant Amount</p>
                <p className="text-3xl font-black text-white">
                  ₹{((facilitationRecord?.fundingAmountSecured || fundingApp.fundingAskAmount) / 100000).toFixed(1)} Lakhs
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-100 font-medium">Government Partner</p>
                <p className="text-sm font-bold text-white">
                  {facilitationRecord?.governmentContact || "Public Works Department"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TERMINAL NEUTRAL CLOSED BANNER */}
      {isClosed && (
        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-[#201D1A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-slate-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Application Concluded — Feedback Available
            </h3>
          </div>
          <p className="text-xs leading-relaxed">
            This funding wishlist submission has concluded. Your company profile and technical assets remain registered on InnovateGov for future department challenge matching.
          </p>
        </div>
      )}

      {/* HORIZONTAL PROGRESS STEPPER */}
      {!isClosed && (
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className={`p-6 sm:p-8 rounded-3xl border ${
            isDarkMode
              ? "bg-[#201D1A] border-[#332D28]"
              : "bg-white border-[#EFECE6] shadow-sm"
          }`}
        >
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
            Live Application Pipeline
          </h2>

          <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-2">
            {/* Horizontal Line behind steps */}
            <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-[#EFECE6] dark:bg-[#332D28] z-0" />

            {stepperSteps.map((step, idx) => {
              const isCompleted = idx < activeStepIdx;
              const isActive = idx === activeStepIdx;

              return (
                <div
                  key={idx}
                  className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 flex-1 md:text-center"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-xs transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-[#8C634B] text-white ring-4 ring-[#8C634B]/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      idx + 1
                    )}
                  </motion.div>

                  <div className="md:mt-1">
                    <p
                      className={`text-xs font-bold ${
                        isActive
                          ? "text-[#8C634B] dark:text-amber-300 font-extrabold"
                          : isCompleted
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium hidden md:block max-w-[120px] mx-auto mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* CONTENT GRID: AI MATCH INSIGHT & VERIFICATION CHECKLIST */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* MATCHED CHALLENGE & AI INSIGHT CARD */}
        <motion.div
          variants={fadeInUp}
          className={`p-6 rounded-3xl border flex flex-col justify-between ${
            isDarkMode
              ? "bg-[#201D1A] border-[#332D28]"
              : "bg-white border-[#EFECE6] shadow-sm"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-[#332D28] pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-[#8C634B] dark:text-amber-400" />
                <span>Matched Government Challenge</span>
              </span>

              {wishlistMatch && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-[#2F5FEA] dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20">
                  {wishlistMatch.rank <= 2
                    ? `★ Auto-Shortlisted (Rank #${wishlistMatch.rank})`
                    : `Rank #${wishlistMatch.rank}`}
                </span>
              )}
            </div>

            {wishlistMatch ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {wishlistMatch.challenge?.title || "Water Leakage Detection System"}
                  </h3>
                  <span className="text-lg font-black text-[#8C634B] dark:text-amber-300">
                    {wishlistMatch.matchScore}% Score
                  </span>
                </div>

                {/* AI Insight Visual Treatment (reused from Recommendations screen) */}
                <div className="p-4 rounded-2xl bg-[#8C634B]/10 dark:bg-amber-400/10 border border-[#8C634B]/20 dark:border-amber-400/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#8C634B] dark:text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>InnovateGov AI Match Reasoning</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    &ldquo;{wishlistMatch.matchReason}&rdquo;
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <Clock className="w-6 h-6 mx-auto text-amber-500 animate-pulse" />
                <p className="font-bold">AI Wishlist Matching in Progress...</p>
                <p className="text-[11px] text-slate-500">
                  Our system evaluates your capability deck against live municipal challenges every 24 hours.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* VERIFICATION CHECKLIST CARD */}
        <motion.div
          variants={fadeInUp}
          className={`p-6 rounded-3xl border flex flex-col justify-between ${
            isDarkMode
              ? "bg-[#201D1A] border-[#332D28]"
              : "bg-white border-[#EFECE6] shadow-sm"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-[#332D28] pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8C634B] dark:text-amber-400" />
                <span>Verification Checklist</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Ops Compliance
              </span>
            </div>

            {verification ? (
              <div className="space-y-4">
                {/* 1. Identity & Business Verification */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#EFECE6] dark:border-[#332D28] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      {verification.identityStatus === "APPROVED" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : verification.identityStatus === "REJECTED" ? (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span>Identity & Business Verification</span>
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        verification.identityStatus === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : verification.identityStatus === "REJECTED"
                          ? "bg-red-500/10 text-red-600 border border-red-500/20"
                          : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}
                    >
                      {verification.identityStatus}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {verification.identityDocs?.map((doc, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-900 border border-[#EFECE6] dark:border-[#332D28] text-slate-600 dark:text-slate-300 flex items-center gap-1"
                      >
                        {doc.approved ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-500" />
                        )}
                        <span>{doc.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Technical Evaluation */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#EFECE6] dark:border-[#332D28] flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {verification.technicalStatus === "APPROVED" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : verification.technicalStatus === "REJECTED" ? (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span>Technical & Deployment Evaluation</span>
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      verification.technicalStatus === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : verification.technicalStatus === "REJECTED"
                        ? "bg-red-500/10 text-red-600 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {verification.technicalStatus}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <Clock className="w-6 h-6 mx-auto text-slate-400" />
                <p className="font-bold">Awaiting Verification Review</p>
                <p className="text-[11px] text-slate-500">
                  Verification begins automatically after challenge wishlist shortlisting.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* FACILITATION NOTES / GOVERNMENT OUTREACH CARD */}
      {facilitationRecord && (
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className={`p-6 rounded-3xl border ${
            isDarkMode
              ? "bg-[#201D1A] border-[#332D28]"
              : "bg-white border-[#EFECE6] shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-[#332D28] pb-3 mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#8C634B] dark:text-amber-400" />
              <span>Government Facilitation & MoA Progress</span>
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#8C634B] text-white">
              Stage: {facilitationRecord.stage}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
              <strong>Official Notes: </strong>
              {facilitationRecord.notes}
            </p>
            {facilitationRecord.governmentContact && (
              <p className="text-xs text-slate-500 font-medium">
                <strong>Assigned Department Officer: </strong>
                {facilitationRecord.governmentContact}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
