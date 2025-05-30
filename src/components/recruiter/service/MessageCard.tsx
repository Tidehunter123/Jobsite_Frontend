import React from "react";
import { Card, CardContent, Avatar, Typography, Box } from "@mui/material";

export function MessageCard() {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Avatar
          src="/recruiter.jpg"
          alt="Recruiter"
          sx={{ width: 48, height: 48, mr: 2 }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            Cam
          </Typography>
          <Typography variant="subtitle2" color="primary" fontWeight="600">
            GoBuyside Search Lead
          </Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
            Austin VP Search: Day 5 Update
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We've vetted a short list of strong candidates for your review.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
} 