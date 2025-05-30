'use client';

import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  TypographyProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { HTMLMotionProps, motion } from 'framer-motion';
import Airtable from 'airtable';
import { config } from '@/config';

import { UserContext } from '@/contexts/auth/supabase/user-context';
import { FileDropzone } from '@/components/core/file-dropzone';
import { useRouter } from 'next/navigation';

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const StyledBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
  borderRadius: '24px',
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

type MotionTypographyProps = HTMLMotionProps<'div'> & {
  component?: React.ElementType;
  variant?: TypographyProps['variant'];
  paragraph?: boolean;
  gutterBottom?: boolean;
  sx?: any;
};

const MotionTypography = motion(Typography) as React.ComponentType<MotionTypographyProps>;
const MotionListItem = motion(Typography) as React.ComponentType<HTMLMotionProps<'li'> & { sx?: any }>;

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 0,
      }}
    >
      <Grid container sx={{ minHeight: '100vh', overflow: 'hidden', bgcolor: 'white' }}>
        {/* Left: Onboarding Text */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 8 }}>
          <StyledBox sx={{ maxWidth: 700, width: '100%' }}>
            {/* Onboarding content start */}
            <MotionTypography
              variant="h4"
              gutterBottom
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                mb: 6,
              }}
            >
              8 million candidates are waiting
            </MotionTypography>
            <MotionTypography
              variant="body1"
              paragraph
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.6, mb: 4 }}
            >
              We make it easy for you to connect with high-quality startup talent who are ready for a new challenge.
              Start sourcing today:
            </MotionTypography>
            <Box
              component="ol"
              sx={{
                pl: 3,
                mb: 5,
                '& li': {
                  position: 'relative',
                  paddingLeft: '1.5rem',
                  marginBottom: '1.5rem',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  },
                },
              }}
            >
              <MotionListItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                sx={{ mb: 2 }}
              >
                <strong>1. Set up your account</strong>
              </MotionListItem>
              <MotionListItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                sx={{ mb: 2 }}
              >
                <strong>2. Invite your team</strong>
              </MotionListItem>
              <MotionListItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <strong>3. Start recruiting</strong>
              </MotionListItem>
            </Box>
            <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={onNext}
                sx={{
                  minWidth: 200,
                  height: 56,
                  borderRadius: '28px',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 12px rgba(33, 150, 243, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                  },
                }}
              >
                Let's get started
              </Button>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                  '& a': {
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  },
                }}
              >
                It takes less than five minutes! Need help? Click <Link href="#">here</Link> to chat with us.
              </Typography>
            </Box>
            {/* Onboarding content end */}
          </StyledBox>
        </Grid>
        {/* Right: Illustration/Image */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f6fafd',
            p: 4,
          }}
        >
          <Box
            component="img"
            src="/onboarding-illustration.svg"
            alt="Onboarding Illustration"
            sx={{
              width: '100%',
              maxWidth: 400,
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function Step2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [logo, setLogo] = useState<File[]>([]);
  const [type, setType] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [basedState, setBasedState] = useState('');
  const [basedCity, setBasedCity] = useState('');
  const { user } = useUser();
  const [primaryRecruiterName, setPrimaryRecruiterName] = useState(user?.name || '');
  const [primaryRecruiterEmail, setPrimaryRecruiterEmail] = useState(user?.email || '');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(user?.email || '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Upload logo if exists
      let logoUrl = '';
      if (logo.length > 0) {
        // TODO: Implement logo upload to your storage service
        // For now, we'll skip logo upload
      }

      // Save to Airtable
      await base('Job Board Clients').create([
        {
          fields: {
            'Name': companyName,
            'Email': email,
            'Type': type,
            'Website': website,
            'Linkedin': linkedin,
            'Based_State': basedState,
            'Based_City': basedCity,
            'Primary Recruiter Name': primaryRecruiterName,
            'Primary Recruiter Email': primaryRecruiterEmail,
            'Description': description,
            'Logo': logoUrl,
          },
        },
      ]);

      onNext();
    } catch (err) {
      setError('Failed to save company information. Please try again.');
      console.error('Error saving company data:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          mt: { xs: 3, sm: 5 },
          mb: { xs: 3, sm: 5 },
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
          },
        }}
      >
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 4,
            textAlign: 'center',
          }}
        >
          Let's create your Account
        </Typography>
        <Stack spacing={3.5} sx={{ mt: 4 }}>
          <TextField
            required
            fullWidth
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
          />
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                fontWeight: 500,
                color: 'text.secondary',
                mb: 1.5,
              }}
            >
              Logo*
            </Typography>
            <FileDropzone files={logo} onDrop={(files) => setLogo(files)} caption="Upload Logo or drag it in" />
          </Box>
          <input type="hidden" value={email} />
          <FormControl fullWidth>
            <InputLabel>Type*</InputLabel>
            <Select
              required
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            >
              <MenuItem value="Operating Company">Operating Company</MenuItem>
              <MenuItem value="Search Fund – Traditional">Search Fund – Traditional</MenuItem>
              <MenuItem value="Search Fund – Committed Capital Vehicle">
                Search Fund – Committed Capital Vehicle
              </MenuItem>
              <MenuItem value="Self-Funded Searcher">Self-Funded Searcher</MenuItem>
              <MenuItem value="Independent Sponsor">Independent Sponsor</MenuItem>
              <MenuItem value="Investor">Investor</MenuItem>
              <MenuItem value="Business Broker">Business Broker</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            required
            fullWidth
            type="url"
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
          />
          <TextField
            fullWidth
            type="url"
            label="Linkedin"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Based State"
              value={basedState}
              onChange={(e) => setBasedState(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
            />
            <TextField
              required
              fullWidth
              label="Based City"
              value={basedCity}
              onChange={(e) => setBasedCity(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
            />
          </Box>
          <TextField
            required
            fullWidth
            label="Primary Recruiter Name"
            value={primaryRecruiterName}
            onChange={(e) => setPrimaryRecruiterName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
          />
          <TextField
            required
            fullWidth
            label="Primary Recruiter Email"
            value={primaryRecruiterEmail}
            onChange={(e) => setPrimaryRecruiterEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
          />
          <TextField
            required
            fullWidth
            multiline
            minRows={3}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 4,
              gap: 2,
            }}
          >
            <Button
              onClick={onBack}
              variant="outlined"
              disabled={isSubmitting}
              sx={{
                borderColor: '#3B82F6',
                color: '#3B82F6',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#3B82F6',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              }}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              sx={{
                backgroundColor: '#3B82F6',
                color: '#ffffff',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
              }}
            >
              {isSubmitting ? 'Saving...' : 'Next'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}

function Step3() {
  const { push } = useRouter();
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          py: { xs: 4, md: 8 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Grid container spacing={6}>
          <Grid item xs={12} md={12}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography 
                variant="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: '#3B82F6',
                  mb: 2
                }}
              >
                You're all set!
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'text.secondary',
                  maxWidth: '800px',
                  mx: 'auto',
                  mb: 3
                }}
              >
                You're officially in the DealTeam network — built for private equity firms, independent sponsors,
                searchers, and their portfolio companies.
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 4
                }}
              >
                Now, choose how you'd like to move forward:
              </Typography>
            </Box>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    Explore DealTeam Recruiting
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: 'text.secondary',
                      mb: 3
                    }}
                  >
                    We tap into our network of thousands of pre-vetted candidates who've built profiles on DealTeam, then hand-select the best-fit individuals based on your specific needs. Using proprietary tagging and private equity expertise, we deliver a fast, targeted shortlist of operators and investment professionals — built for teams that need to hire efficiently.
                  </Typography>
                  <Button 
                    size="large"
                    fullWidth
                    sx={{ 
                      backgroundColor: '#3B82F6',
                      color: '#ffffff',
                      mt: 'auto',
                      py: 1.5,
                      fontWeight: 600
                    }}
                  >
                    Find Talent
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    Post a Job Yourself
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: 'text.secondary',
                      mb: 3,
                    }}
                  >
                    Prefer to manage the process yourself? List your role and start receiving applications from candidates actively pursuing roles in private equity, M&A, and portfolio company operations.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="large"
                    fullWidth
                    sx={{ 
                      borderColor: '#3B82F6',
                      color: '#3B82F6',
                      mt: 'auto',
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#3B82F6',
                      }
                    }}
                    onClick={() => {
                      push('/recruiter/post-job');
                    }}
                  >
                    Post a Job
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default function RecruiterOnboardingPage() {
  const [step, setStep] = useState(1);
  return (
    <Box>
      {step === 1 && <Step1 onNext={() => setStep(2)} />}
      {step === 2 && <Step2 onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <Step3 />}
    </Box>
  );
}
