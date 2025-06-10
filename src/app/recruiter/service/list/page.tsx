'use client'

import React, { useState } from "react";
import { Box, Container, Stack, Alert } from "@mui/material";
import { ATSTracker } from "../../../../components/recruiter/service/ATSTracker";
import { NotificationBadge } from "../../../../components/recruiter/service/NotificationBadge";
import { MessageCard } from "../../../../components/recruiter/service/MessageCard";
import { CandidateList } from "../../../../components/recruiter/service/CandidateList";
import { useSearchParams } from "next/navigation";
import { CalendlyForm } from "../../../../components/recruiter/service/CalendlyForm";
import { CandidateProfile } from "../../../../utils/airtable";

export default function ATSPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const [currentStep, setCurrentStep] = useState(0);
  const [showCalendlyForm, setShowCalendlyForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

  const handleSetupInterview = (candidate: CandidateProfile) => {
    setSelectedCandidate(candidate);
    setCurrentStep(1);
    setShowCalendlyForm(true);
  };

  const handleBack = () => {
    setCurrentStep(0);
    setShowCalendlyForm(false);
    setSelectedCandidate(null);
  };

  if (!orderId) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
        <Alert severity="error">
          No order ID provided. Please provide an order ID in the URL.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <ATSTracker currentStep={currentStep} />
      <Stack direction="row" justifyContent="flex-start" mb={4}>
        <NotificationBadge count={1} />
      </Stack>
      <MessageCard />
      {showCalendlyForm ? (
        <CalendlyForm onBack={handleBack} candidate={selectedCandidate || undefined} />
      ) : (
        <CandidateList onSetupInterview={handleSetupInterview} />
      )}
    </Container>
  );
}
