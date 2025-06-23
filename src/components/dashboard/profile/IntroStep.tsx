'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useTheme, useMediaQuery } from '@mui/material';
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
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.25, 3),
    fontSize: '0.875rem',
    minHeight: '44px', // Better touch target for mobile
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
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    '& .coming-soon-icon': {
      fontSize: '3rem',
      marginBottom: theme.spacing(1.5),
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
    '& .coming-soon-icon': {
      fontSize: '2.5rem',
      marginBottom: theme.spacing(1),
    },
  },
}));

export function IntroStep({ onBack, onSubmit, onSectionComplete }: { onBack: () => void; onSubmit: () => void; onSectionComplete?: (completed: boolean) => void }): React.JSX.Element {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const handleSubmit = () => {
        if (onSectionComplete) {
            onSectionComplete(true);
        }
        onSubmit();
    };

    return (
        <Stack spacing={{ xs: 3, sm: 4 }}>
            {/* Header */}
            <Box>
                <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    component="h2" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 700, 
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1, sm: 2 },
                        flexDirection: { xs: 'column', sm: 'row' },
                        textAlign: { xs: 'center', sm: 'left' }
                    }}
                >
                    <VideoIcon size={isMobile ? 24 : 32} weight="bold" />
                    60-Second Intro Video
                </Typography>
                <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{
                        textAlign: { xs: 'center', sm: 'left' },
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                >
                    Add a personal touch to your profile with a brief introduction video.
                </Typography>
            </Box>

            {/* Content */}
            <ContentBox>
                <VideoIcon size={isMobile ? 48 : isTablet ? 56 : 64} weight="light" className="coming-soon-icon" />
                <Typography 
                    variant={isMobile ? "h6" : "h6"} 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '1.125rem', sm: '1.25rem' }
                    }}
                >
                    Coming Soon!
                </Typography>
                <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                        maxWidth: 500, 
                        mx: 'auto',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        px: { xs: 1, sm: 0 }
                    }}
                >
                    This feature is currently in development. You can submit your profile now and add an intro video later when it becomes available.
                </Typography>
            </ContentBox>

            {/* Action Buttons */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                pt: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
            }}>
                <StyledButton 
                    onClick={onBack}
                    variant="outlined"
                    startIcon={<ArrowLeftIcon size={isMobile ? 18 : 20} />}
                    sx={{
                        borderColor: '#E5E7EB',
                        color: '#6B7280',
                        '&:hover': {
                            borderColor: '#D1D5DB',
                            backgroundColor: '#F9FAFB',
                        },
                        order: { xs: 2, sm: 1 }
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
                        },
                        order: { xs: 1, sm: 2 }
                    }}
                    endIcon={<ArrowRightIcon size={isMobile ? 18 : 20} />}
                >
                    Submit Profile
                </StyledButton>
            </Box>
        </Stack>
    );
} 