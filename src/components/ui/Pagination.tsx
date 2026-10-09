import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-3 py-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)] w-full">
      <div className="text-[11px] font-mono tabular-nums">
        Showing <span className="font-semibold text-[var(--text-primary)]">{startItem}</span> to{' '}
        <span className="font-semibold text-[var(--text-primary)]">{endItem}</span> of{' '}
        <span className="font-semibold text-[var(--text-primary)]">{totalItems}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Previous
        </Button>
        <span className="text-[11px] font-mono px-2 tabular-nums">
          {currentPage} / {Math.max(1, totalPages)}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
