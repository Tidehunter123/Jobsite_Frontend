'use client'

import React from "react";
import { Box, Container, Stack } from "@mui/material";
import { ATSTracker } from "../../../components/recruiter/service/ATSTracker";
import { NotificationBadge } from "../../../components/recruiter/service/NotificationBadge";
import { MessageCard } from "../../../components/recruiter/service/MessageCard";
import { CandidateList } from "../../../components/recruiter/service/CandidateList";

export default function ATSPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <ATSTracker currentStep={0} />
      <Stack direction="row" justifyContent="flex-start" mb={2}>
        <NotificationBadge count={1} />
      </Stack>
      <MessageCard />
      <CandidateList />
    </Container>
  );
}
