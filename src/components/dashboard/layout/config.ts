import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

// NOTE: We did not use React Components for Icons, because
//  you may one to get the config from the server.

// NOTE: First level elements are groups.

export interface LayoutConfig {
  navItems: NavItemConfig[];
}

export const layoutConfig = {
  navItems: [
    {
      key: 'recruiter',
      title: 'Recruiter',
      items: [
        { key: 'dashboard', title: 'Dashboard', href: '#', icon: 'chart-line' },
        { key: 'jobs', title: 'Jobs', href: '/recruiter/jobs', icon: 'briefcase' },
        { key: 'applicants', title: 'Applicants', href: '#', icon: 'users' },
        { key: 'find-talent', title: 'Find Talent', href: '#', icon: 'magnifying-glass' },
        { key: 'messages', title: 'Messages', href: '#', icon: 'chat-circle' },
        { key: 'ats', title: 'ATS', href: '#', icon: 'file-text' },
      ],
    },
  ],
} satisfies LayoutConfig;
