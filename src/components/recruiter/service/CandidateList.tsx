import React, { useState, useEffect } from "react";
import { CandidateCard } from "./CandidateCard";
import { Box, Container, CircularProgress } from "@mui/material";
import { getCandidatesByOrderId, CandidateProfile } from "../../../utils/airtable";
import { useSearchParams } from "next/navigation";

export function CandidateList({ onSetupInterview }: { onSetupInterview: (candidate: CandidateProfile) => void }) {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');

  // Load expanded state from localStorage on mount
  useEffect(() => {
    const savedExpandedIdx = localStorage.getItem(`expandedIdx-${orderId}`);
    if (savedExpandedIdx !== null) {
      setExpandedIdx(parseInt(savedExpandedIdx, 10));
    }
  }, [orderId]);

  // Save expanded state to localStorage when it changes
  useEffect(() => {
    if (expandedIdx !== null) {
      localStorage.setItem(`expandedIdx-${orderId}`, expandedIdx.toString());
    } else {
      localStorage.removeItem(`expandedIdx-${orderId}`);
    }
  }, [expandedIdx, orderId]);

  useEffect(() => {
    async function fetchCandidates() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCandidatesByOrderId(orderId);
        console.log('data', data);
        setCandidates(data);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCandidates();
  }, [orderId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!candidates.length) {
    return (
      <Box textAlign="center" py={4}>
        No candidates found for this order.
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        {candidates.map((candidate, idx) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            expanded={expandedIdx === idx}
            onExpand={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            onSetupInterview={() => onSetupInterview(candidate)}
          />
        ))}
      </Box>
    </Container>
  );
} 