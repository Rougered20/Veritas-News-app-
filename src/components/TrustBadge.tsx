import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { VerificationStatus } from '../types.js';

interface TrustBadgeProps {
  score: number;
  verdict: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  score,
  verdict,
  size = 'md',
  showScore = true,
}) => {
  const getBadgeConfig = () => {
    switch (verdict) {
      case 'VERIFIED_HIGH_CONFIDENCE':
        return {
          label: 'Verified Wire',
          bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dotColor: 'bg-emerald-600',
          icon: ShieldCheck,
          scoreColor: 'text-emerald-700 font-bold',
        };
      case 'VERIFIED_MULTI_SOURCE':
        return {
          label: 'Multi-Sourced',
          bgColor: 'bg-teal-50 text-teal-800 border-teal-200/80',
          dotColor: 'bg-teal-600',
          icon: CheckCircle2,
          scoreColor: 'text-teal-700 font-bold',
        };
      case 'DEVELOPING_CAUTION':
        return {
          label: 'Developing',
          bgColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dotColor: 'bg-amber-500',
          icon: AlertTriangle,
          scoreColor: 'text-amber-700 font-bold',
        };
      case 'DISPUTED_OR_UNVERIFIED':
      default:
        return {
          label: 'Unverified / Disputed',
          bgColor: 'bg-rose-50 text-rose-800 border-rose-200/80',
          dotColor: 'bg-rose-500',
          icon: ShieldAlert,
          scoreColor: 'text-rose-700 font-bold',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.bgColor} ${sizeClasses} whitespace-nowrap shadow-2xs`}
      title={`Automated Verification Status: ${verdict} (${score}/100 Trust Score)`}
    >
      <Icon className={iconSizes} />
      <span>{config.label}</span>
      {showScore && (
        <span className={`ml-0.5 pl-1.5 border-l border-current/20 ${config.scoreColor}`}>
          {score}%
        </span>
      )}
    </span>
  );
};
