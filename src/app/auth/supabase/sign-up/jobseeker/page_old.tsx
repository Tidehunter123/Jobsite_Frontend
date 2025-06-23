'use client';

import * as React from 'react';
import { GuestGuard } from '@/components/auth/guest-guard';
import { SplitLayout } from '@/components/auth/split-layout';
import { SignUpForm } from '@/components/auth/supabase/sign-up-form';
import { RoleSelectionModal } from '@/components/auth/role-selection-modal';

export default function JobSeekerSignUpPage() {
  const [showSignUpForm, setShowSignUpForm] = React.useState(false);
  const [rolePreferences, setRolePreferences] = React.useState<{
    roleType: string;
    interestArea: string;
  } | null>(null);

  const handleRoleSelectionComplete = (roleType: string, interestArea: string) => {
    setRolePreferences({ roleType, interestArea });
    setShowSignUpForm(true);
  };

  return (
    <GuestGuard>
      <SplitLayout>
        {!showSignUpForm ? (
          <RoleSelectionModal
            open={true}
            onClose={() => {}}
            onComplete={handleRoleSelectionComplete}
          />
        ) : (
          <SignUpForm 
            role="jobseeker" 
            rolePreferences={rolePreferences}
          />
        )}
      </SplitLayout>
    </GuestGuard>
  );
} 