"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Building2,
  DollarSign,
  FileText,
  Upload,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  X,
  File,
  Loader2,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { useThemeStore } from "@/store/theme";
import {
  getFundingApplicationByStartup,
  submitFundingApplication,
} from "@/lib/api";
import { MOCK_STARTUPS } from "@/lib/mock-data";
import { Startup } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function StartupApplyPage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();
  const { theme } = useThemeStore();
  const isDarkMode = theme === "dark";

  const [loadingCheck, setLoadingCheck] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form Fields State
  const [startupProfile, setStartupProfile] = useState<Startup | null>(null);
  const [capabilitySummary, setCapabilitySummary] = useState("");
  const [fundingAskAmount, setFundingAskAmount] = useState<number>(2500000);
  const [fundingPurpose, setFundingPurpose] = useState("");
  const [documents, setDocuments] = useState<{ name: string; type: string }[]>([
    { name: "DPIIT_Recognition_Certificate.pdf", type: "application/pdf" },
    { name: "Technical_Capability_Deck.pdf", type: "application/pdf" },
  ]);
  const [newDocName, setNewDocName] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser || currentUser.role !== "STARTUP") {
      router.push("/login?role=STARTUP");
      return;
    }

    const startupId = currentUser.startupId || "start-1";
    const foundStartup = MOCK_STARTUPS.find((s) => s.id === startupId) || MOCK_STARTUPS[0];
    setStartupProfile(foundStartup);
    setCapabilitySummary(foundStartup.capabilitySummary);
    setFundingPurpose(
      `Commercial pilot deployment & hardware scaling for ${foundStartup.name}`
    );

    async function checkExistingApp() {
      try {
        const existing = await getFundingApplicationByStartup(startupId);
        if (existing) {
          // One-time submission rule: if already applied, redirect to status tracker
          router.replace("/startup/status");
          return;
        }
      } catch (err) {
        console.error("Error checking funding application:", err);
      } finally {
        setLoadingCheck(false);
      }
    }

    checkExistingApp();
  }, [currentUser, hasHydrated, router]);

  const handleAddMockDoc = () => {
    if (!newDocName.trim()) return;
    const formattedName = newDocName.trim().endsWith(".pdf")
      ? newDocName.trim()
      : `${newDocName.trim()}.pdf`;

    setDocuments((prev) => [...prev, { name: formattedName, type: "application/pdf" }]);
    setNewDocName("");
  };

  const handleRemoveDoc = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupProfile || submitting) return;

    setSubmitting(true);
    try {
      await submitFundingApplication({
        startupId: startupProfile.id,
        capabilitySummary,
        fundingAskAmount: Number(fundingAskAmount),
        fundingPurpose,
        documents,
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        router.push("/startup/status");
      }, 1500);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitting(false);
    }
  };

  if (!hasHydrated || loadingCheck) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#8C634B] animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">
          Verifying funding wishlist status...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="space-y-3 border-b border-[#EFECE6] dark:border-[#332D28] pb-6"
      >
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#8C634B]/10 text-[#8C634B] dark:bg-[#A87D61]/20 dark:text-amber-300 border border-[#8C634B]/20 flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5" />
            <span>InnovateGov Funding Wishlist</span>
          </span>
          <span className="text-xs font-medium text-slate-400">
            One-Time Founder Application
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Submit Your Startup Funding Application
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
          Register your technical capability and funding request with InnovateGov. Our AI matching engine connects your application directly to relevant government challenges and municipal department pilots.
        </p>
      </motion.div>

      {/* Success Modal Toast */}
      <AnimatePresence>
        {submittedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 text-xs font-bold shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-extrabold text-sm">Application Submitted Successfully!</p>
              <p className="text-[11px] font-medium opacity-90">
                Redirecting to your live Status Tracker...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form Card */}
      <motion.form
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* SECTION 1: Company Profile Summary (Prefilled) */}
        <motion.div
          variants={fadeInUp}
          className={`p-6 rounded-3xl border ${
            isDarkMode
              ? "bg-[#201D1A] border-[#332D28]"
              : "bg-white border-[#EFECE6] shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5 border-b border-[#EFECE6] dark:border-[#332D28] pb-3">
            <Building2 className="w-4 h-4 text-[#8C634B] dark:text-amber-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              1. Verified Company Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Company Name
              </label>
              <input
                type="text"
                readOnly
                value={startupProfile?.name || ""}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900 border border-[#EFECE6] dark:border-[#332D28] font-bold text-slate-900 dark:text-white cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                readOnly
                value={startupProfile?.location || "India"}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900 border border-[#EFECE6] dark:border-[#332D28] font-bold text-slate-900 dark:text-white cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Founded Year & Team Size
              </label>
              <input
                type="text"
                readOnly
                value={`Founded ${startupProfile?.foundedYear || 2021} • ${startupProfile?.teamSize || 15} Team Members`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900 border border-[#EFECE6] dark:border-[#332D28] font-bold text-slate-900 dark:text-white cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Sector Tags
              </label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {startupProfile?.sectorTags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#8C634B]/10 text-[#8C634B] dark:bg-amber-400/10 dark:text-amber-300 border border-[#8C634B]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* SECTION 2: Solution & Technical Capability */}
        <motion.div
          variants={fadeInUp}
          className={`p-6 rounded-3xl border ${
            isDarkMode
              ? "bg-[#201D1A] border-[#332D28]"
              : "bg-white border-[#EFECE6] shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5 border-b border-[#EFECE6] dark:border-[#332D28] pb-3">
            <Sparkles className="w-4 h-4 text-[#8C634B] dark:text-amber-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              2. Technical Solution & Capability Description
            </h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Core Technical Solution & Public Sector Relevance
            </label>
            <textarea
              required
              rows={4}
              value={capabilitySummary}
              onChange={(e) => setCapabilitySummary(e.target.value)}
              placeholder="Describe your technology, hardware/software deployment readiness, and public sector problem areas resolved..."
              className="w-full p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#EFECE6] dark:border-[#332D28] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8C634B]/30 font-sans leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              This summary is processed by InnovateGov&apos;s AI matcher against active and upcoming municipal challenges.
            </p>
          </div>
        </motion.div>

        {/* SECTION 3: Funding Ask & Purpose */}
        <motion.div
          variants={fadeInUp}
          className={`p-6 rounded-3xl border ${
            isDarkMode
              ? "bg-[#201D1A] border-[#332D28]"
              : "bg-white border-[#EFECE6] shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5 border-b border-[#EFECE6] dark:border-[#332D28] pb-3">
            <DollarSign className="w-4 h-4 text-[#8C634B] dark:text-amber-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              3. Funding Requirement
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Funding Ask Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-slate-500 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min={100000}
                  max={10000000}
                  step={100000}
                  value={fundingAskAmount}
                  onChange={(e) => setFundingAskAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#EFECE6] dark:border-[#332D28] text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#8C634B]/30"
                />
              </div>
              <p className="text-[11px] font-bold text-[#8C634B] dark:text-amber-300 pt-0.5">
                = ₹{(fundingAskAmount / 100000).toFixed(1)} Lakhs
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Primary Funding Purpose
              </label>
              <input
                type="text"
                required
                value={fundingPurpose}
                onChange={(e) => setFundingPurpose(e.target.value)}
                placeholder="e.g. Commercial pilot deployment & sensor scaling"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#EFECE6] dark:border-[#332D28] text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8C634B]/30"
              />
            </div>
          </div>
        </motion.div>

        {/* SECTION 4: Documents Upload Manager */}
        <motion.div
          variants={fadeInUp}
          className={`p-6 rounded-3xl border ${
            isDarkMode
              ? "bg-[#201D1A] border-[#332D28]"
              : "bg-white border-[#EFECE6] shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5 border-b border-[#EFECE6] dark:border-[#332D28] pb-3">
            <Upload className="w-4 h-4 text-[#8C634B] dark:text-amber-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              4. Verification Documents (Pitch Deck, Incorporation, DPIIT)
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Attach document name (e.g. Financial_Audit_FY25.pdf)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#EFECE6] dark:border-[#332D28] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8C634B]/30"
              />
              <button
                type="button"
                onClick={handleAddMockDoc}
                className="px-4 py-2.5 rounded-xl bg-[#8C634B] text-white font-extrabold text-xs hover:bg-[#724E38] transition-all shrink-0 cursor-pointer"
              >
                + Add Document
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Attached Documents ({documents.length})
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#EFECE6] dark:border-[#332D28] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <File className="w-4 h-4 text-[#8C634B] shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {doc.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submit Action Button */}
        <motion.div variants={fadeInUp} className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="py-4 px-8 rounded-2xl bg-[#8C634B] hover:bg-[#724E38] text-white font-extrabold text-sm shadow-xl shadow-amber-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Submitting Funding Application...</span>
              </>
            ) : (
              <>
                <span>Submit Funding Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      </motion.form>
    </div>
  );
}
