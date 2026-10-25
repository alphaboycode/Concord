import React from "react";
import { txUrl } from "../config";
import { Loader2, CheckCircle2, XCircle, ExternalLink, X } from "lucide-react";

export interface ToastData {
  id: string;
  type: "prompt" | "pending" | "success" | "error";
  title: string;
  message?: string;
  txHash?: string;
}

interface TransactionToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const TransactionToast: React.FC<TransactionToastProps> = ({
  toast,
  onClose,
}) => {
  if (!toast) return null;

  return (
    <aside
      aria-label="Transaction notification"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white dark:bg-civic-darkCard border border-civic-lightBorder dark:border-civic-darkBorder rounded-2xl p-4 shadow-xl dark:shadow-soft-dark transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start space-x-3">
        {/* Status Icon */}
        <div className="flex-shrink-0 pt-0.5">
          {toast.type === "prompt" && (
            <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
          {toast.type === "pending" && (
            <div className="w-7 h-7 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
          {toast.type === "success" && (
            <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          {toast.type === "error" && (
            <div className="w-7 h-7 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {toast.message}
            </p>
          )}

          {toast.txHash && (
            <a
              href={txUrl(toast.txHash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-mono font-medium text-brand-600 dark:text-brand-400 hover:underline mt-2"
            >
              <span>View on BotChain Scan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
