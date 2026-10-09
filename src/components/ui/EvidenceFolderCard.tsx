import React from 'react';
import { DocumentRecord } from '../../types/models';

export interface EvidenceFolderCardProps {
  document: DocumentRecord;
  onInspectProof: (doc: DocumentRecord) => void;
}

export const EvidenceFolderCard: React.FC<EvidenceFolderCardProps> = ({
  document,
  onInspectProof,
}) => {
  const isTampered = document.integrityStatus === 'TAMPERING_DETECTED';

  return (
    <button
      type="button"
      onClick={() => onInspectProof(document)}
      title={`Click to view all details for ${document.name}`}
      className="group flex flex-col items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all duration-200 cursor-pointer select-none text-left w-full h-full shadow-xs hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500/40"
    >
      {/* ── Blank Small Logo (Minimalist Evidence Folder Graphic) ── */}
      <div className="relative flex items-center justify-center w-14 h-12 sm:w-16 sm:h-14 my-1 transition-transform duration-200 group-hover:scale-108 shrink-0">
        <svg
          viewBox="0 0 64 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Back Tab */}
          <path
            d="M4 10C4 6.68629 6.68629 4 10 4H22C24.3869 4 26.5841 5.4124 27.5644 7.57321L28.4356 9.42679C29.4159 11.5876 31.6131 13 34 13H54C57.3137 13 60 15.6863 60 19V42C60 45.3137 57.3137 48 54 48H10C6.68629 48 4 45.3137 4 42V10Z"
            className="fill-sky-500/25 dark:fill-sky-400/20 stroke-sky-500/40 dark:stroke-sky-400/30"
            strokeWidth="1.5"
          />
          {/* Front Pocket / Flap (Blank) */}
          <path
            d="M4 19C4 15.6863 6.68629 13 10 13H54C57.3137 13 60 15.6863 60 19V42C60 45.3137 57.3137 48 54 48H10C6.68629 48 4 45.3137 4 42V19Z"
            className="fill-sky-500/85 dark:fill-sky-500/75 stroke-sky-600/50 dark:stroke-sky-400/40"
            strokeWidth="1.5"
          />
        </svg>

        {/* Subtle Indicator if tampered */}
        {isTampered && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 ring-2 ring-[var(--surface)]" />
          </span>
        )}
      </div>

      {/* ── Title on the Bottom ── */}
      <div className="mt-2 text-center w-full min-w-0">
        <p
          className="text-xs font-medium text-[var(--text-primary)] group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-tight break-words"
          title={document.name}
        >
          {document.name}
        </p>
        <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 truncate">
          {document.caseNumber}
        </p>
      </div>
    </button>
  );
};
