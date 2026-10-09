import React from 'react';

export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`w-full overflow-x-auto border border-[var(--border)] rounded-lg bg-[var(--surface)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <table
      className={`w-full text-left text-xs border-collapse ${className}`}
      {...props}
    >
      {children}
    </table>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead
      className={`bg-[var(--surface-elevated)] border-b border-[var(--border)] text-[var(--text-secondary)] font-medium ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody
      className={`divide-y divide-[var(--border-subtle)] text-[var(--text-primary)] ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<
  React.HTMLAttributes<HTMLTableRowElement> & { isHoverable?: boolean; isSelected?: boolean }
> = ({ children, isHoverable = true, isSelected = false, className = '', ...props }) => {
  return (
    <tr
      className={`transition-colors duration-100 ${
        isHoverable ? 'hover:bg-[var(--surface-hover)]' : ''
      } ${isSelected ? 'bg-[var(--surface-active)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th
      className={`py-2.5 px-3.5 text-[11px] font-medium tracking-tight whitespace-nowrap ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<
  React.TdHTMLAttributes<HTMLTableCellElement> & { isMonospace?: boolean }
> = ({ children, isMonospace = false, className = '', ...props }) => {
  return (
    <td
      className={`py-3 px-3.5 align-middle whitespace-nowrap ${
        isMonospace ? 'font-mono text-[11px] tabular-nums' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};
