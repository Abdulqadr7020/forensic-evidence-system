import { UserRole } from '../../types/auth';
import {
  LayoutDashboard,
  FolderLock,
  FileCheck2,
  ArrowLeftRight,
  Microscope,
  ShieldCheck,
  History,
  ShieldAlert,
  Layers,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  allowedRoles: UserRole[];
  badgeCount?: number;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    allowedRoles: ['police', 'forensic', 'prosecutor', 'admin', 'auditor'],
  },
  {
    id: 'cases',
    label: 'Cases',
    icon: FolderLock,
    allowedRoles: ['police', 'forensic', 'prosecutor', 'admin'],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileCheck2,
    allowedRoles: ['police', 'forensic', 'prosecutor', 'admin', 'auditor'],
  },
  {
    id: 'transfers',
    label: 'Evidence Transfers',
    icon: ArrowLeftRight,
    allowedRoles: ['police', 'forensic', 'admin'],
  },
  {
    id: 'forensic',
    label: 'Forensic Reports',
    icon: Microscope,
    allowedRoles: ['forensic', 'prosecutor', 'admin'],
  },
  {
    id: 'integrity',
    label: 'Integrity Verification',
    icon: ShieldCheck,
    allowedRoles: ['police', 'forensic', 'prosecutor', 'admin', 'auditor'],
  },
  {
    id: 'audit',
    label: 'Audit Trail',
    icon: History,
    allowedRoles: ['admin', 'auditor'],
  },
  {
    id: 'design-system',
    label: 'Design System',
    icon: Layers,
    allowedRoles: ['police', 'forensic', 'prosecutor', 'admin', 'auditor'],
  },
];
