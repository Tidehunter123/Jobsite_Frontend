'use client';

import * as React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowSquareOut as ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { Briefcase as BriefcaseIcon } from '@phosphor-icons/react/dist/ssr/Briefcase';
import { Buildings as BuildingsIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretUp as CaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { Heart as HeartIcon } from '@phosphor-icons/react/dist/ssr/Heart';
import { MapPin as MapPinIcon } from '@phosphor-icons/react/dist/ssr/MapPin';
import { Share as ShareIcon } from '@phosphor-icons/react/dist/ssr/Share';
import { Star as StarIcon } from '@phosphor-icons/react/dist/ssr/Star';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export interface Job {
  id: string;
  jobPostingId: string;
  companyName: string;
  jobTitle: string;
  idealStartDate: string;
  experienceLevel: string;
  companyInformation: string;
  functionArea: string;
  broadIndustry: string;
  specificIndustry: string;
  sponsorType: string;
  companyRevenue: string;
  equity: string;
  industryExperienceRequired: string;
  region: string;
  state: string;
  postedOn: string;
  roleType: string;
  logo: AttachmentField[];
  city: string;
  jobDescription: string;
  aboutTheSponsor: string;
  employees: string;
  recruiterFirstName?: string;
  recruiterPicture?: AttachmentField[];
  recruiterBio?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
}

interface AttachmentField {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small: { url: string; width: number; height: number };
    large: { url: string; width: number; height: number };
    full: { url: string; width: number; height: number };
  };
}

interface JobCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  onShare?: (jobId: string) => void;
  isSaved?: boolean;
}

const MotionCard = motion(Card);

export function JobCard({ job, onSave, onShare, isSaved = false }: JobCardProps): React.JSX.Element {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(isSaved);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const toggleDescription = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const handleCardClick = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleSaveJob = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsLiked(!isLiked);
    onSave?.(job.id);
  };

  const handleShareJob = (event: React.MouseEvent) => {
    event.stopPropagation();
    onShare?.(job.id);
  };

  const handleViewDetails = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('View job details:', job.jobPostingId);
    router.push(`/dashboard/posting?id=${job.jobPostingId}`);
  };

  const getIndustryColor = (industry: string) => {
    const colors = {
      Technology: '#3B82F6',
      Healthcare: '#10B981',
      Finance: '#F59E0B',
      Education: '#8B5CF6',
      Manufacturing: '#EF4444',
      Retail: '#EC4899',
      Consulting: '#06B6D4',
      Media: '#84CC16',
    };
    return colors[industry as keyof typeof colors] || '#6B7280';
  };

  const getTimeAgo = (date: string) => {
    const now = dayjs();
    const posted = dayjs(date);
    const diffDays = now.diff(posted, 'day');

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2 },
      }}
      onClick={handleCardClick}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderColor: '#3B82F6',
          transform: 'translateY(-8px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${getIndustryColor(job.broadIndustry)} 0%, ${getIndustryColor(job.specificIndustry)} 100%)`,
        },
      }}
    >
      {/* Header Section */}
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          pb: { xs: 1.5, sm: 1.5 },
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {/* Top Row - Company Info & Actions */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'flex-start' }} mb={1.5}>
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: '100%' }}>
            <Box
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${getIndustryColor(job.broadIndustry)}20 0%, ${getIndustryColor(job.specificIndustry)}20 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #e2e8f0',
                position: 'relative',
                flexShrink: 0,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '16px',
                  padding: '2px',
                  background: `linear-gradient(135deg, ${getIndustryColor(job.broadIndustry)}, ${getIndustryColor(job.specificIndustry)})`,
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                },
              }}
            >
              <img
                src={job.logo && Array.isArray(job.logo) ? job.logo[0]?.url : undefined}
                alt={job.companyName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  lineHeight: 1.4,
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {job.companyName}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
                {job.experienceLevel && (
                  <Chip
                    label={job.experienceLevel}
                    size="small"
                    icon={<BriefcaseIcon size={14} />}
                    sx={{
                      backgroundColor: `${getIndustryColor(job.broadIndustry)}15`,
                      color: getIndustryColor(job.broadIndustry),
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: '24px',
                      '& .MuiChip-icon': {
                        color: getIndustryColor(job.broadIndustry),
                      },
                    }}
                  />
                )}
                <Chip
                  label={getTimeAgo(job.postedOn)}
                  size="small"
                  icon={<ClockIcon size={14} />}
                  sx={{
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: '24px',
                    '& .MuiChip-icon': {
                      color: '#92400E',
                    },
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: 'flex-end', sm: 'flex-start' } }}>
            <Button
              size="small"
              onClick={handleSaveJob}
              sx={{
                minWidth: 'auto',
                p: 1,
                borderRadius: '12px',
                backgroundColor: isLiked ? '#FEE2E2' : 'transparent',
                color: isLiked ? '#DC2626' : '#6B7280',
                border: isLiked ? '1px solid #FECACA' : '1px solid #E5E7EB',
                '&:hover': {
                  backgroundColor: isLiked ? '#FECACA' : '#F3F4F6',
                  borderColor: isLiked ? '#FCA5A5' : '#D1D5DB',
                },
              }}
            >
              <HeartIcon size={18} weight={isLiked ? 'fill' : 'regular'} />
            </Button>
            <Button
              size="small"
              onClick={handleShareJob}
              sx={{
                minWidth: 'auto',
                p: 1,
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: '#6B7280',
                border: '1px solid #E5E7EB',
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                  borderColor: '#D1D5DB',
                },
              }}
            >
              <ShareIcon size={18} />
            </Button>
          </Stack>
        </Stack>

        {/* Job Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#0f172a',
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
            lineHeight: 1.3,
            mb: 1,
          }}
        >
          {job.jobTitle}
        </Typography>

        {/* Function Area & Location */}
        <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {job.functionArea && (
            <Chip
              label={job.functionArea}
              size="small"
              sx={{
                backgroundColor: '#3B82F6',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: '28px',
                px: 1.5,
              }}
            />
          )}
          {job.state && (
            <Chip
              label={`${job.state}, ${job.region}`}
              size="small"
              icon={<MapPinIcon size={14} />}
              sx={{
                backgroundColor: '#F3F4F6',
                color: '#374151',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: '28px',
                '& .MuiChip-icon': {
                  color: '#6B7280',
                },
              }}
            />
          )}
        </Stack>

        {/* Quick Info Row */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2 }}
          sx={{
            p: { xs: 1.5, sm: 2 },
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            mt: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: getIndustryColor(job.broadIndustry),
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#374151',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {job.broadIndustry} • {job.specificIndustry}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            {job.companyRevenue} • {job.sponsorType}
          </Typography>
        </Stack>
      </CardContent>

      {/* Content Section */}
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Company Information */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="description"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              {job.companyInformation && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: isDescriptionExpanded ? 'none' : 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    {job.companyInformation}
                  </Typography>
                  {job.companyInformation.length > 150 && (
                    <Typography
                      component="button"
                      onClick={toggleDescription}
                      sx={{
                        background: 'none',
                        border: 'none',
                        color: '#3B82F6',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        fontWeight: 600,
                        mt: 1,
                        '&:hover': {
                          color: '#2563EB',
                        },
                      }}
                    >
                      {isDescriptionExpanded ? (
                        <>
                          Show less
                          <CaretUpIcon size={16} />
                        </>
                      ) : (
                        <>
                          Read more
                          <CaretDownIcon size={16} />
                        </>
                      )}
                    </Typography>
                  )}
                </Box>
              )}
              <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <Stack spacing={2} sx={{ mt: 2 }}>
                {/* Additional Details */}
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {job.equity && (
                    <Chip
                      label={job.equity}
                      size="small"
                      icon={<StarIcon size={14} />}
                      sx={{
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: '24px',
                        '& .MuiChip-icon': {
                          color: '#92400E',
                        },
                      }}
                    />
                  )}
                  {job.industryExperienceRequired && (
                    <Chip
                      label={job.industryExperienceRequired}
                      size="small"
                      sx={{
                        backgroundColor: '#DBEAFE',
                        color: '#1E40AF',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: '24px',
                      }}
                    />
                  )}
                </Stack>

                {/* Dates */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1, sm: 2 }}
                  sx={{
                    pt: 1,
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarIcon size={16} color="#6b7280" />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      }}
                    >
                      Posted {dayjs(job.postedOn).format('MMM D, YYYY')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarIcon size={16} color="#6b7280" />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      }}
                    >
                      Start {dayjs(job.idealStartDate).format('MMM D, YYYY')}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>

        <Box sx={{ flexGrow: 1 }} />

        {/* Action Section */}
        <Stack
          sx={{
            mt: 2,
            pt: isExpanded ? 2 : 0,
            borderTop: isExpanded ? '1px solid #f1f5f9' : 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <Button
                  variant="contained"
                  onClick={handleViewDetails}
                  startIcon={<ArrowSquareOutIcon size={16} />}
                  sx={{
                    background: `linear-gradient(135deg, ${getIndustryColor(job.broadIndustry)} 0%, ${getIndustryColor(job.specificIndustry)} 100%)`,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    padding: { xs: '10px 16px', sm: '12px 20px' },
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  View Job Details
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </CardContent>
    </MotionCard>
  );
}
