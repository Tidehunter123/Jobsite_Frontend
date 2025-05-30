import React, { useState } from "react";
import { CandidateCard } from "./CandidateCard";
import { Box, Container } from "@mui/material";

const candidates = [
  { name: "Charles Farrell", title: "Senior Associate", company: "Apex Bridge Equity Partners" },
  { name: "Kathryn Smith", title: "Vice President", company: "Redwood Meridian Capital" },
  {
    name: "Lindsay Hinton",
    title: "Senior Associate",
    company: "Axiom Credit Partners",
    photo: "/lindsay.jpg",
    degree: "B.S. Business Administration, 3.8 GPA",
    location: "Austin, Texas"
  }
];

export function CandidateList() {
  const [expandedIdx, setExpandedIdx] = useState(2); // Lindsay expanded by default
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        {candidates.map((c, idx) => (
          <CandidateCard
            key={c.name}
            candidate={c}
            expanded={expandedIdx === idx}
            onExpand={() => setExpandedIdx(idx)}
          />
        ))}
      </Box>
    </Container>
  );
} 