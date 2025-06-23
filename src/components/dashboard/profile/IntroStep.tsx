'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { 
  VideoCamera as VideoIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon
} from '@phosphor-icons/react/dist/ssr';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  textAlign: 'center',
  '& .coming-soon-icon': {
    fontSize: '4rem',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
}));

export function IntroStep({ onBack, onSubmit, onSectionComplete }: { onBack: () => void; onSubmit: () => void; onSectionComplete?: (completed: boolean) => void }): React.JSX.Element {
    const handleSubmit = () => {
        if (onSectionComplete) {
            onSectionComplete(true);
        }
        onSubmit();
    };

    return (
        <Stack spacing={4}>
            {/* Header */}
            <Box>
                <Typography variant="h4" component="h2" gutterBottom sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <VideoIcon size={32} weight="bold" />
                    60-Second Intro Video
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Add a personal touch to your profile with a brief introduction video.
                </Typography>
            </Box>

            {/* Content */}
            <ContentBox>
                <VideoIcon size={64} weight="light" className="coming-soon-icon" />
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    Coming Soon!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                    This feature is currently in development. You can submit your profile now and add an intro video later when it becomes available.
                </Typography>
            </ContentBox>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                <StyledButton 
                    onClick={onBack}
                    variant="outlined"
                    startIcon={<ArrowLeftIcon size={20} />}
                    sx={{
                        borderColor: '#E5E7EB',
                        color: '#6B7280',
                        '&:hover': {
                            borderColor: '#D1D5DB',
                            backgroundColor: '#F9FAFB',
                        }
                    }}
                >
                    Back
                </StyledButton>
                <StyledButton 
                    onClick={handleSubmit}
                    sx={{
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#2563EB',
                        }
                    }}
                    endIcon={<ArrowRightIcon size={20} />}
                >
                    Submit Profile
                </StyledButton>
            </Box>
        </Stack>
    );
} 