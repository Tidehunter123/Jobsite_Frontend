import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';

export const CongratsBox: React.FC = () => {
  return (
    <Card
      sx={{
        bgcolor: 'primary.lighter',
        border: 1,
        borderColor: 'primary.light',
        mb: 3,
      }}
    >
      <CardContent>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Congrats! Your job is now live. Make it stand out even more by promoting it.
            </Typography>
            <Typography color="text.secondary" paragraph>
              Promoting your job will showcase it to more qualified candidates who match what you're looking for. Salary information is not required for promoted jobs.
            </Typography>
            <Button sx={{ backgroundColor: '#3B82F6', color: 'white', '&:hover': { backgroundColor: '#3B82F6' } }}>
              Promote Job
            </Button>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                width: 120,
                height: 100,
                bgcolor: '#3B82F6',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h2">💻</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 