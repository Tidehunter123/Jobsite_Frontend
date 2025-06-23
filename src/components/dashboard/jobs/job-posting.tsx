import React from 'react';
import { useContext } from 'react';
import { Avatar, Box, Button, Grid, Link as MuiLink, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery } from '@mui/material';
import Airtable from 'airtable';
import dayjs from 'dayjs';
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaFacebookF,
  FaGlobe,
  FaGraduationCap,
  FaHourglassHalf,
  FaIndustry,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTwitter,
  FaUsers,
  FaUserTie,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

import { config } from '@/config';
import { UserContext } from '@/contexts/auth/user-context';

import { type Job } from './job-card';
import { toast } from '@/components/core/toaster';
import { useRouter } from 'next/navigation';

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

function SponsorInfoCard({ sponsorType, aboutSponsor }: { sponsorType?: string; aboutSponsor?: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: 2, md: 3 },
        p: { xs: 2, sm: 3 },
        bgcolor: '#f7fafd',
        textAlign: 'center',
        mb: { xs: 2, md: 3 },
      }}
    >
      <Typography 
        variant="h6" 
        fontWeight={700} 
        sx={{ 
          mb: { xs: 1.5, md: 2 }, 
          color: '#2563eb',
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}
      >
        {sponsorType}
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          textAlign: 'justify', 
          lineHeight: 1.6,
          fontSize: { xs: '0.9rem', sm: '1rem' }
        }}
      >
        {aboutSponsor || 'No sponsor information available.'}
      </Typography>
    </Paper>
  );
}

function RecruiterInfoCard({
  recruiterFirstName,
  recruiterPicture,
  recruiterBio,
  recruiterEmail,
  recruiterPhone,
}: {
  recruiterFirstName?: string;
  recruiterPicture?: { url: string }[];
  recruiterBio?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  }) {
  if (!recruiterFirstName) {
    return null;
  }

  const handleEmailClick = () => {
    if (recruiterEmail) {
      window.open(`mailto:${recruiterEmail}?subject=Regarding ${recruiterFirstName}'s job posting`, '_blank');
    }
  };

  const handlePhoneClick = () => {
    if (recruiterPhone) {
      window.open(`tel:${recruiterPhone}`, '_blank');
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: 2, md: 3 },
        p: { xs: 2, sm: 3 },
        bgcolor: 'white',
        mb: { xs: 2, md: 3 },
        border: '1px solid #e2e8f0',
      }}
    >
      <Typography 
        variant="h6" 
        fontWeight={700} 
        sx={{ 
          mb: { xs: 1.5, md: 2 },
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}
      >
        About the Recruiter
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: { xs: 1.5, md: 2 },
        flexDirection: { xs: 'column', sm: 'row' },
        textAlign: { xs: 'center', sm: 'left' }
      }}>
        <Avatar
          src={recruiterPicture?.[0]?.url}
          alt={recruiterFirstName}
          sx={{ 
            width: { xs: 80, sm: 60 }, 
            height: { xs: 80, sm: 60 }, 
            mr: { xs: 0, sm: 2 },
            mb: { xs: 1, sm: 0 }
          }}
        />
        <Box>
          <Typography 
            variant="h6" 
            fontWeight={600}
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            {recruiterFirstName}
          </Typography>
        </Box>
      </Box>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          lineHeight: 1.6, 
          mb: { xs: 2, md: 3 },
          fontSize: { xs: '0.9rem', sm: '1rem' }
        }}
      >
        {recruiterBio}
      </Typography>
      
      {/* Contact Information */}
      {(recruiterEmail || recruiterPhone) && (
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Typography 
            variant="subtitle2" 
            fontWeight={600} 
            sx={{ 
              mb: 1, 
              color: '#2563eb',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Contact Information
          </Typography>
          {recruiterEmail && (
            <Box sx={{ 
              display: 'flex', 
              mb: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' }
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mr: { xs: 0, sm: 1 },
                  mb: { xs: 0.5, sm: 0 },
                  fontSize: { xs: '0.85rem', sm: '0.875rem' }
                }}
              >
                Email:
              </Typography>
              <MuiLink
                href={`mailto:${recruiterEmail}`}
                onClick={handleEmailClick}
                sx={{ 
                  color: '#2563eb', 
                  textDecoration: 'none',
                  fontSize: { xs: '0.85rem', sm: '0.875rem' },
                  wordBreak: 'break-all',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {recruiterEmail}
              </MuiLink>
            </Box>
          )}
          {recruiterPhone && (
            <Box sx={{ 
              display: 'flex', 
              mb: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' }
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mr: { xs: 0, sm: 1 },
                  mb: { xs: 0.5, sm: 0 },
                  fontSize: { xs: '0.85rem', sm: '0.875rem' }
                }}
              >
                Phone:
              </Typography>
              <MuiLink
                href={`tel:${recruiterPhone}`}
                onClick={handlePhoneClick}
                sx={{ 
                  color: '#2563eb', 
                  textDecoration: 'none',
                  fontSize: { xs: '0.85rem', sm: '0.875rem' },
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {recruiterPhone}
              </MuiLink>
            </Box>
          )}
        </Box>
      )}
      
      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 1, sm: 2 },
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <Button
          variant="outlined"
          href={`tel:${recruiterPhone}`}
          sx={{ 
            flex: 1, 
            borderColor: '#e2e8f0', 
            color: 'text.primary',
            py: { xs: 1.5, sm: 1 },
            fontSize: { xs: '0.9rem', sm: '0.875rem' },
            '&:hover': {
              borderColor: '#2563eb',
              color: '#2563eb'
            }
          }}
        >
          Connect with Recruiter
        </Button>
        {recruiterEmail && (
          <Button
            onClick={handleEmailClick}
            sx={{ 
              flex: 1, 
              backgroundColor: '#3b82f6',
              color: 'white',
              py: { xs: 1.5, sm: 1 },
              fontSize: { xs: '0.9rem', sm: '0.875rem' },
              '&:hover': {
                backgroundColor: '#3b82f6'
              }
            }}
          >
            Send Email
          </Button>
        )}
      </Box>
    </Paper>
  );
}

export default function JobPosting({ job }: { job: Job }) {
  if (!job) return <Typography>No job data found.</Typography>;
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not available. Make sure the component is wrapped in a UserProvider.');
  }
  const { user } = userContext;
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Add state for modal
  const [openConfirmModal, setOpenConfirmModal] = React.useState(false);

  const handleApply = async () => {
    const userQuery = await base('Candidate Database')
      .select({
        filterByFormula: `{Login Email} = '${user?.email}'`,
      })
      .firstPage();
    const application = await base('Applications').create({
      'Job Posting Id': job.jobPostingId,
      Name: userQuery[0].get('First Name') + ' ' + userQuery[0].get('Last Name'),
    });
    if(application) {
      toast.success('Application submitted successfully.');
      router.push('/dashboard');
    } else {
      toast.error('Failed to submit application.');
    }
  };

  const handleApplyClick = () => {
    setOpenConfirmModal(true);
  };

  const handleConfirmApply = () => {
    setOpenConfirmModal(false);
    handleApply();
  };

  const handleCancelApply = () => {
    setOpenConfirmModal(false);
  };

  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      minHeight: '100vh', 
      py: { xs: 1, sm: 2, md: 4 },
      px: { xs: 1, sm: 2 }
    }}>
      {/* HEADER */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          bgcolor: 'white',
          borderRadius: { xs: 2, md: 3 },
          px: { xs: 3, sm: 4, md: 6, lg: 8 },
          py: { xs: 3, sm: 4, md: 5 },
          boxShadow: 1,
          mb: { xs: 2, md: 4 },
          gap: { xs: 3, md: 0 },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1.5, sm: 2 }, 
          width: '100%',
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <Avatar
            src={job.logo?.[0]?.url || job.logo?.[0]?.thumbnails?.small?.url}
            alt={job.companyName}
            sx={{
              width: { xs: 80, sm: 100, md: 100 },
              height: { xs: 80, sm: 100, md: 100 },
              borderRadius: 2,
              bgcolor: 'grey.100',
              mb: { xs: 1, sm: 0 },
            }}
            variant="rounded"
          />
          <Box sx={{ flex: 1, width: '100%' }}>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              sx={{ 
                mb: { xs: 1, md: 1 }, 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.875rem' },
                lineHeight: { xs: 1.3, sm: 1.4 }
              }}
            >
              {job.jobTitle}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 2 }, 
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FaBriefcase size={isMobile ? 14 : 16} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {job.experienceLevel || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FaBuilding size={isMobile ? 14 : 16} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {job.functionArea || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FaUserTie size={isMobile ? 14 : 16} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {job.roleType || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FaMapMarkerAlt size={isMobile ? 14 : 16} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {job.city || 'N/A'}, {job.state || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FaCalendarAlt size={isMobile ? 14 : 16} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {dayjs(job.postedOn).format('MMM D, YYYY')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Right: Deadline + Apply */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-end' },
            gap: 2,
            width: { xs: '100%', md: 'auto' },
            mt: { xs: 0, md: 0 },
          }}
        >
          <Button
            size="large"
            onClick={handleApplyClick}
            sx={{ 
              minWidth: { xs: '100%', md: 215 }, 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              py: { xs: 1.5, sm: 1.5 },
              fontSize: { xs: '1rem', sm: '0.875rem' },
              borderRadius: { xs: 2, sm: 1 },
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }}
          >
            Apply Now
          </Button>
        </Box>
      </Box>
      {/* DETAILS */}
      <Grid 
        container 
        spacing={{ xs: 2, md: 4 }} 
        justifyContent="center" 
        sx={{ 
          px: { xs: 2, sm: 3, md: 4, lg: 5 }
        }}
      >
        <Grid item xs={12} md={8} order={{ xs: 2, md: 1 }}>
          <RecruiterInfoCard
            recruiterFirstName={job.recruiterFirstName}
            recruiterPicture={job.recruiterPicture}
            recruiterBio={job.recruiterBio}
            recruiterEmail={job.recruiterEmail}
            recruiterPhone={job.recruiterPhone}
          />
          <Paper sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            mb: { xs: 2, md: 3 }, 
            border: '0px',
            borderRadius: { xs: 2, md: 3 }
          }}>
            <Typography 
              variant="h5" 
              fontWeight={600} 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                mb: { xs: 1.5, md: 2 }
              }}
            >
              Job Description
            </Typography>
            <Box sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.6,
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontWeight: 600,
                mb: { xs: 1, sm: 1.5 },
                mt: { xs: 1.5, sm: 2 }
              },
              '& p': {
                mb: { xs: 1, sm: 1.5 }
              },
              '& ul, & ol': {
                pl: { xs: 2, sm: 3 }
              },
              '& li': {
                mb: { xs: 0.5, sm: 1 }
              }
            }}>
              <ReactMarkdown>{job.jobDescription}</ReactMarkdown>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} order={{ xs: 1, md: 2 }}>
          <SponsorInfoCard sponsorType={job.sponsorType} aboutSponsor={job.aboutTheSponsor} />
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              borderRadius: { xs: 2, md: 3 }, 
              mb: { xs: 2, md: 3 }, 
              bgcolor: '#f7fafd' 
            }}
          >
            <Typography 
              variant="h6" 
              fontWeight={600} 
              mb={2}
              sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
            >
              Job Overview
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: 2 }}>
              <FaChartLine color="#2563eb" size={isMobile ? 18 : 22} style={{ marginTop: 2 }} />
              <Box>
                <Typography 
                  fontWeight={600} 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Company Revenue
                </Typography>
                <Typography 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  {job.companyRevenue}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: 2 }}>
              <FaUsers color="#2563eb" size={isMobile ? 18 : 22} style={{ marginTop: 2 }} />
              <Box>
                <Typography 
                  fontWeight={600} 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Employees
                </Typography>
                <Typography 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  {job.employees}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: 2 }}>
              <FaIndustry color="#2563eb" size={isMobile ? 18 : 22} style={{ marginTop: 2 }} />
              <Box>
                <Typography 
                  fontWeight={600} 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Broad Industry
                </Typography>
                <Typography 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  {job.broadIndustry}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: 2 }}>
              <FaBuilding color="#2563eb" size={isMobile ? 18 : 22} style={{ marginTop: 2 }} />
              <Box>
                <Typography 
                  fontWeight={600} 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Specific Industry
                </Typography>
                <Typography 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  {job.specificIndustry}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: 2 }}>
              <FaCheckCircle color="#2563eb" size={isMobile ? 18 : 22} style={{ marginTop: 2 }} />
              <Box>
                <Typography 
                  fontWeight={600} 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Industry Experience Required?
                </Typography>
                <Typography 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  {job.industryExperienceRequired}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: 2 }}>
              <FaMoneyBillWave color="#2563eb" size={isMobile ? 18 : 22} style={{ marginTop: 2 }} />
              <Box>
                <Typography 
                  fontWeight={600} 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Equity?
                </Typography>
                <Typography 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  {job.equity}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: 2 }}>
              <FaGlobe color="#2563eb" size={isMobile ? 18 : 22} style={{ marginTop: 2 }} />
              <Box>
                <Typography 
                  fontWeight={600} 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Region
                </Typography>
                <Typography 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  {job.region}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: 2 }}>
              <FaMapMarkerAlt color="#2563eb" size={isMobile ? 18 : 22} style={{ marginTop: 2 }} />
              <Box>
                <Typography 
                  fontWeight={600} 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  City
                </Typography>
                <Typography 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  {job.city}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: 2 }}>
              <FaMapMarkerAlt color="#2563eb" size={isMobile ? 18 : 22} style={{ marginTop: 2 }} />
              <Box>
                <Typography 
                  fontWeight={600} 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  State
                </Typography>
                <Typography 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  {job.state}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Modal */}
      <Dialog
        open={openConfirmModal}
        onClose={handleCancelApply}
        aria-labelledby="confirm-application-dialog-title"
        aria-describedby="confirm-application-dialog-description"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, md: 4 },
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            m: { xs: 2, sm: 0 },
            maxHeight: { xs: 'calc(100vh - 32px)', sm: 'none' }
          }
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: { xs: 2, sm: 3 },
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <DialogTitle 
            id="confirm-application-dialog-title" 
            sx={{ 
              fontWeight: 700, 
              color: 'white',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              p: 0,
              mb: 1,
            }}
          >
            Confirm Your Application
          </DialogTitle>
        </Box>
        
        <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Typography 
              id="confirm-application-dialog-description" 
              sx={{ 
                mb: { xs: 2, sm: 3 }, 
                fontSize: { xs: '1rem', sm: '1.1rem' },
                lineHeight: 1.6,
                color: '#374151',
              }}
            >
              Are you sure you want to apply for the{' '}
              <Box component="span" sx={{ fontWeight: 700, color: '#1f2937' }}>
                {job.jobTitle}
              </Box>{' '}
              position at{' '}
              <Box component="span" sx={{ fontWeight: 700, color: '#1f2937' }}>
                {job.companyName}
              </Box>?
            </Typography>
            
            {/* Job Details Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, md: 3 },
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                mb: { xs: 2, sm: 3 },
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Avatar
                  src={job.logo?.[0]?.url || job.logo?.[0]?.thumbnails?.small?.url}
                  alt={job.companyName}
                  sx={{
                    width: { xs: 60, sm: 48 },
                    height: { xs: 60, sm: 48 },
                    borderRadius: 2,
                    mr: { xs: 0, sm: 2 },
                    mb: { xs: 1, sm: 0 },
                    bgcolor: 'grey.100',
                  }}
                  variant="rounded"
                />
                <Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={600} 
                    sx={{ 
                      color: '#1f2937', 
                      mb: 0.5,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                  >
                    {job.jobTitle}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', sm: '0.875rem' }
                    }}
                  >
                    {job.companyName}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: { xs: 1, sm: 2 },
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaMapMarkerAlt size={isMobile ? 12 : 14} color="#6b7280" />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    {job.city}, {job.state}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaBriefcase size={isMobile ? 12 : 14} color="#6b7280" />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    {job.experienceLevel}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaUserTie size={isMobile ? 12 : 14} color="#6b7280" />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    {job.roleType}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          pt: 0, 
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button 
            onClick={handleCancelApply} 
            variant="outlined"
            startIcon={<FaTimes />}
            fullWidth={isMobile}
            sx={{ 
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 1.5 },
              borderRadius: { xs: 2, sm: 2 },
              borderColor: '#d1d5db',
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: { xs: '0.9rem', sm: '0.95rem' },
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: '#f9fafb',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmApply} 
            variant="contained"
            startIcon={<FaCheck />}
            fullWidth={isMobile}
            sx={{ 
              px: { xs: 2, sm: 4 },
              py: { xs: 1.5, sm: 1.5 },
              borderRadius: { xs: 2, sm: 2 },
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: { xs: '0.9rem', sm: '0.95rem' },
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
              }
            }}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
