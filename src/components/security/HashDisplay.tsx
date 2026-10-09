import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface HashDisplayProps {
  hash: string;
  truncateLength?: number;
  label?: string;
  allowCopy?: boolean;
}

export const HashDisplay: React.FC<HashDisplayProps> = ({
  hash,
  truncateLength = 8,
  label,
  allowCopy = true,
}) => {
  const [copied, setCopied] = useState(false);
  const { info } = useToast();

  const truncated =
    hash.length > truncateLength * 2
      ? `${hash.substring(0, truncateLength)}…${hash.substring(hash.length - truncateLength)}`
      : hash;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    info('Cryptographic Hash Copied', `${label ? label + ': ' : ''}${truncated}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-secondary)] bg-[var(--surface-active)] px-2 py-0.5 rounded border border-[var(--border)] tabular-nums">
      {label && <span className="text-[10px] uppercase text-[var(--text-muted)] font-sans">{label}:</span>}
      <span title={hash} className="select-all">
        {truncated}
      </span>
      {allowCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ml-0.5"
          aria-label="Copy hash to clipboard"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
};
