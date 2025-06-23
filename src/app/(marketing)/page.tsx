import React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { JobsList } from '@/components/dashboard/jobs/jobs-list-initial';

export const metadata = { title: `DealTeam - Recruiting Leaders to run Independent Sponsor-Backed ...` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <JobsList />;
}
