import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Sparkles } from 'lucide-react';

interface BreakingToastProps {
  pendingCount: number;
  onReveal: () => void;
}

export const BreakingToast: React.FC<BreakingToastProps> = ({ pendingCount, onReveal }) => {
  return (
    <AnimatePresence>
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
        >
          <button
            id="reveal-breaking-updates-toast"
            onClick={onReveal}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer font-medium text-sm border border-amber-500/30"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-100"></span>
            </span>
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>
              {pendingCount} new verified {pendingCount === 1 ? 'update' : 'updates'} available
            </span>
            <span className="flex items-center gap-1 pl-2 border-l border-white/20 text-xs text-amber-100 font-semibold">
              Reveal <ArrowUp className="w-3.5 h-3.5" />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
