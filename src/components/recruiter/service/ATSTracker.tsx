import React from "react";
import { Stepper, Step, StepLabel, Box } from "@mui/material";

const steps = ["Applicants", "Interview", "Case Study", "Offer"];

export function ATSTracker({ currentStep }: { currentStep: number }) {
  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Stepper activeStep={currentStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
} 