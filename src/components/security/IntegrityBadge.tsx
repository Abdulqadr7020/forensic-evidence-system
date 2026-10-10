import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, Clock, Lock, XCircle } from 'lucide-react';
import { IntegrityStatus } from '../../types/models';
import { Badge } from '../ui/Badge';

export interface IntegrityBadgeProps {
  status: IntegrityStatus;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export const IntegrityBadge: React.FC<IntegrityBadgeProps> = ({
  status,
  size = 'md',
  onClick,
}) => {
  const config: Record<
    IntegrityStatus,
    { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral'; icon: React.ReactNode }
  > = {
    VERIFIED: {
      label: 'Verified Authentic',
      variant: 'success',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
    },
    VERIFICATION_PENDING: {
      label: 'Verification Pending',
      variant: 'warning',
      icon: <Clock className="w-3 h-3 text-amber-500" />,
    },
    TAMPERING_DETECTED: {
      label: 'Tampering Detected',
      variant: 'danger',
      icon: <ShieldAlert className="w-3 h-3 text-rose-500" />,
    },
    PROOF_INVALID: {
      label: 'Invalid Evidence',
      variant: 'danger',
      icon: <XCircle className="w-3 h-3 text-rose-500" />,
    },
    LEDGER_INCONSISTENT: {
      label: 'System Error',
      variant: 'warning',
      icon: <AlertTriangle className="w-3 h-3 text-amber-500" />,
    },
    VERIFICATION_FAILED: {
      label: 'Verification Failed',
      variant: 'danger',
      icon: <XCircle className="w-3 h-3 text-rose-500" />,
    },
    NOT_AUTHORIZED: {
      label: 'Access Restricted',
      variant: 'neutral',
      icon: <Lock className="w-3 h-3 text-[var(--text-muted)]" />,
    },
  };

  const current = config[status] || config.VERIFICATION_PENDING;

  return (
    <span onClick={onClick} className={onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}>
      <Badge variant={current.variant} size={size} icon={current.icon}>
        {current.label}
      </Badge>
    </span>
  );
};
