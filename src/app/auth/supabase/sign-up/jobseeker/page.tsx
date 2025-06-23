'use client';

import * as React from 'react';
import { GuestGuard } from '@/components/auth/guest-guard';
import { SplitLayout } from '@/components/auth/split-layout';
import { SignUpForm } from '@/components/auth/supabase/sign-up-form';

export default function JobSeekerSignUpPage() {
  return (
    <GuestGuard>
      <SplitLayout>
          <SignUpForm 
            role="jobseeker" 
          />
      </SplitLayout>
    </GuestGuard>
  );
} 