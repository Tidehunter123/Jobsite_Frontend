import React from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { MdAccessTime, MdAdd, MdCalendarMonth, MdEmail, MdLocationOn, MdShare, MdWork } from 'react-icons/md';

interface JobDetailsProps {
  jobTitle: string;
  pay: string;
  jobType: string[];
  jobDescription: string;
  applicationMethod: string;
  externalLink: string;
  contactEmail: string;
  posterName: string;
  updatedAt: string;
  workType: string;
  hoursPerWeek: number;
  role: string;
  startDate: string;
  endDate: string;
}

export const JobDetails: React.FC<JobDetailsProps> = ({
  jobTitle,
  pay,
  jobType,
  jobDescription,
  applicationMethod,
  externalLink,
  contactEmail,
  posterName,
  updatedAt,
  workType,
  hoursPerWeek,
  role,
  startDate,
  endDate,
}) => {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#1a1a1a' }}>
            {jobTitle}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="#3B82F6" fontWeight="600">
              {pay}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Stack direction="row" spacing={1}>
              <Chip
                label={role}
                sx={{
                  backgroundColor: '#E3F2FD',
                  color: '#1976D2',
                  fontWeight: 500,
                }}
              />
            </Stack>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mb: 4 }}>
          <Button
            size="medium"
            sx={{
              backgroundColor: '#3B82F6',
              color: 'white',
              px: 4,
              py: 1.5,
              '&:hover': { backgroundColor: '#2563EB' },
              mr: 2,
              borderRadius: 2,
            }}
            startIcon={<MdAdd />}
          >
            Find Talent
          </Button>
          <Button
            variant="outlined"
            size="medium"
            sx={{
              borderColor: '#3B82F6',
              color: '#3B82F6',
              px: 4,
              py: 1.5,
              '&:hover': { borderColor: '#2563EB', backgroundColor: '#F8FAFC' },
              borderRadius: 2,
            }}
            startIcon={<MdShare />}
          >
            Share
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ color: '#4B5563', lineHeight: 1.7 }}>{jobDescription}</Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#1a1a1a' }}>
                How to Apply
              </Typography>
              <Typography sx={{ color: '#4B5563', lineHeight: 1.7 }}>{applicationMethod}</Typography>
              {externalLink && (
                <Button
                  variant="contained"
                  href={externalLink}
                  target="_blank"
                  sx={{
                    mt: 2,
                    backgroundColor: '#10B981',
                    '&:hover': { backgroundColor: '#059669' },
                  }}
                >
                  Apply Now
                </Button>
              )}
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: '#F8FAFC', borderRadius: 2 }}>
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1a1a1a' }}>
                      Job Details
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MdWork color="#6B7280" />
                        <Typography variant="body2" color="#4B5563">
                          {workType}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MdAccessTime color="#6B7280" />
                        <Typography variant="body2" color="#4B5563">
                          {hoursPerWeek} hours/week
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MdCalendarMonth color="#6B7280" />
                        <Typography variant="body2" color="#4B5563">
                          Start Date: {startDate && new Date(startDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MdCalendarMonth color="#6B7280" />
                        <Typography variant="body2" color="#4B5563">
                          End Date: {endDate && new Date(endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MdCalendarMonth color="#6B7280" />
                        <Typography variant="body2" color="#4B5563">
                          Last Updated: {updatedAt}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Divider />

                  <Box>
                    <Stack spacing={2}>
                      {contactEmail && (
                        <>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1a1a1a' }}>
                            Contact Information
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MdEmail color="#6B7280" />
                            <Typography variant="body2" color="#4B5563">
                              {contactEmail}
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
