import React from 'react';
import { CaseRecord } from '../../types/models';

export interface CaseFolderCardProps {
  caseRecord: CaseRecord;
  onViewCase: (c: CaseRecord) => void;
}

export const CaseFolderCard: React.FC<CaseFolderCardProps> = ({
  caseRecord,
  onViewCase,
}) => {
  return (
    <button
      type="button"
      onClick={() => onViewCase(caseRecord)}
      title={`Click to view all details for ${caseRecord.title}`}
      className="group flex flex-col items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all duration-200 cursor-pointer select-none text-left w-full h-full shadow-xs hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/40"
    >
      {/* ── Blank Small Logo (Differentiated Legal Case Dossier Folder Graphic) ── */}
      <div className="relative flex items-center justify-center w-14 h-12 sm:w-16 sm:h-14 my-1 transition-transform duration-200 group-hover:scale-108 shrink-0">
        <svg
          viewBox="0 0 64 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Back Tab (Right-shifted tab for Case Dossier distinction) */}
          <path
            d="M4 10C4 6.68629 6.68629 4 10 4H34C36.3869 4 38.5841 5.4124 39.5644 7.57321L40.4356 9.42679C41.4159 11.5876 43.6131 13 46 13H54C57.3137 13 60 15.6863 60 19V42C60 45.3137 57.3137 48 54 48H10C6.68629 48 4 45.3137 4 42V10Z"
            className="fill-amber-500/25 dark:fill-amber-400/20 stroke-amber-500/40 dark:stroke-amber-400/30"
            strokeWidth="1.5"
          />

          {/* Dossier Front Pocket / Flap (Blank) */}
          <path
            d="M4 19C4 15.6863 6.68629 13 10 13H54C57.3137 13 60 15.6863 60 19V42C60 45.3137 57.3137 48 54 48H10C6.68629 48 4 45.3137 4 42V19Z"
            className="fill-amber-500/85 dark:fill-amber-500/75 stroke-amber-600/50 dark:stroke-amber-400/40"
            strokeWidth="1.5"
          />

          {/* Case Dossier Center Clasp / Band to differentiate from evidence sleeve */}
          <rect
            x="27"
            y="13"
            width="10"
            height="14"
            rx="2"
            className="fill-amber-700/80 dark:fill-amber-400/80 stroke-amber-800/40"
            strokeWidth="1"
          />
          <circle
            cx="32"
            cy="20"
            r="2"
            className="fill-white dark:fill-neutral-900"
          />
        </svg>

        {/* Evidence files count badge */}
        <span className="absolute -bottom-1 -right-1 text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
          {caseRecord.documentCount}
        </span>
      </div>

      {/* ── Title on the Bottom ── */}
      <div className="mt-2 text-center w-full min-w-0">
        <p
          className="text-xs font-medium text-[var(--text-primary)] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight break-words"
          title={caseRecord.title}
        >
          {caseRecord.title}
        </p>
        <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 truncate">
          {caseRecord.caseNumber}
        </p>
      </div>
    </button>
  );
};
