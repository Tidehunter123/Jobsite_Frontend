'use client';

import * as React from 'react';
import { useContext } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { CaretLeft as CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRight as CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
// import Airtable from 'airtable';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@mui/material';

import { config } from '@/config';
import { UserContext } from '@/contexts/auth/user-context';
import { MultiSelect } from '@/components/core/multi-select';
import { toast } from '@/components/core/toaster';
import { JobCard } from '@/components/dashboard/jobs/job-card';
import type { Job } from '@/components/dashboard/jobs/job-card';
import Airtable from 'airtable';

type JobCategory = 'Internship' | 'Full-time';

interface ApiResponse {
  jobs: Job[];
  hasNextPage: boolean;
  totalPages: number;
  currentPage: number;
}

const workTypeOptions = [
  { label: 'Remote', value: 'Remote' },
  { label: 'In person', value: 'In person' },
] as const;

const paymentTypeOptions = [
  { label: 'Paid', value: 'Paid' },
  { label: 'Unpaid', value: 'Unpaid' },
] as const;

const jobTypeOptions = [
  { label: 'Early Career', value: 'Early Career' },
  { label: 'Experienced', value: 'Experienced' },
] as const;

interface JobsFiltersProps {
  onFilterChange: (filters: {
    keyword?: string;
    workTypes?: string[];
    paymentTypes?: string[];
    jobTypes?: string[];
  }) => void;
}

const StyledFilterWrapper = styled('div')(({ theme }) => ({
  '& .MuiSelect-select': {
    minWidth: '200px',
    padding: theme.spacing(1.5),
  },
}));

function JobsFilters({ onFilterChange }: JobsFiltersProps): React.JSX.Element {
  const [keyword, setKeyword] = React.useState('');
  const [selectedWorkTypes, setSelectedWorkTypes] = React.useState<string[]>([]);
  const [selectedPaymentTypes, setSelectedPaymentTypes] = React.useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = React.useState<string[]>([]);

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
    onFilterChange({
      keyword: event.target.value,
      workTypes: selectedWorkTypes,
      paymentTypes: selectedPaymentTypes,
      jobTypes: selectedJobTypes,
    });
  };

  const handleWorkTypeChange = (values: string[]) => {
    setSelectedWorkTypes(values);
    onFilterChange({
      keyword,
      workTypes: values,
      paymentTypes: selectedPaymentTypes,
      jobTypes: selectedJobTypes,
    });
  };

  const handlePaymentTypeChange = (values: string[]) => {
    setSelectedPaymentTypes(values);
    onFilterChange({
      keyword,
      workTypes: selectedWorkTypes,
      paymentTypes: values,
      jobTypes: selectedJobTypes,
    });
  };

  const handleJobTypeChange = (values: string[]) => {
    setSelectedJobTypes(values);
    onFilterChange({
      keyword,
      workTypes: selectedWorkTypes,
      paymentTypes: selectedPaymentTypes,
      jobTypes: values,
    });
  };

  return (
    <Card>
      <Input
        fullWidth
        placeholder="Enter a keyword"
        value={keyword}
        onChange={handleKeywordChange}
        startAdornment={
          <InputAdornment position="start">
            <MagnifyingGlassIcon />
          </InputAdornment>
        }
        sx={{ px: 3, py: 2 }}
      />
      <Divider />
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', p: 1 }}
      >
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <StyledFilterWrapper>
            <MultiSelect
              label="Remote / In person"
              options={workTypeOptions}
              value={selectedWorkTypes}
              onChange={handleWorkTypeChange}
            />
          </StyledFilterWrapper>
          <StyledFilterWrapper>
            <MultiSelect
              label="Paid / Unpaid"
              options={paymentTypeOptions}
              value={selectedPaymentTypes}
              onChange={handlePaymentTypeChange}
            />
          </StyledFilterWrapper>
          <StyledFilterWrapper>
            <MultiSelect
              label="Job Type"
              options={jobTypeOptions}
              value={selectedJobTypes}
              onChange={handleJobTypeChange}
            />
          </StyledFilterWrapper>
        </Stack>
      </Stack>
    </Card>
  );
}

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

export function JobsList(): React.JSX.Element {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not available. Make sure the component is wrapped in a UserProvider.');
  }
  const { user } = userContext;

  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<JobCategory>();
  const [filters, setFilters] = React.useState({
    keyword: '',
    workTypes: [] as string[],
    paymentTypes: [] as string[],
    jobTypes: [] as string[],
  });

  if (!config.supabase.url || !config.supabase.roleKey) {
    throw new Error('Supabase URL or roleKey is not defined.');
  }

  // Check user's preferred job category on component mount
  React.useEffect(() => {
    if (user?.email) {
      void checkUserPreferredCategory(user.email);
    }
  }, [user]);

  const checkUserPreferredCategory = async (email: string) => {
    try {
      const existing = await base('Internship')
        .select({
          filterByFormula: `{Email} = '${email}'`,
          maxRecords: 1,
        })
        .firstPage();

      if (existing.length > 0) {
        setSelectedCategory("Internship");
        console.log(existing, 'Internship');
      } else {
        const existing = await base('FT')
          .select({
            filterByFormula: `{Email} = '${user?.email}'`,
            maxRecords: 1,
          })
          .firstPage();
        if (existing.length > 0) {
          setSelectedCategory("Full-time");
          console.log(existing, 'FT');
        }
      }
    } catch (err) {
      toast.error('Error fetching user preferences. Defaulting to internships.');
    }
  };

  const fetchJobs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        category: selectedCategory,
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.workTypes.length > 0 && { workTypes: filters.workTypes.join(',') }),
        ...(filters.paymentTypes.length > 0 && { paymentTypes: filters.paymentTypes.join(',') }),
        ...(filters.jobTypes.length > 0 && { jobTypes: filters.jobTypes.join(',') }),
      });

      const response = await fetch(`http://135.181.215.55:3005/api/jobs/jobs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = (await response.json()) as ApiResponse;

      setJobs(data.jobs);
      setHasNextPage(data.hasNextPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Error fetching jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters, selectedCategory]);

  React.useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (newFilters: {
    keyword?: string;
    workTypes?: string[];
    paymentTypes?: string[];
    jobTypes?: string[];
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const handleCategoryChange = (category: JobCategory) => {
    setSelectedCategory(category);
    setPage(1); // Reset to first page when category changes
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <Stack spacing={4}>
        <Box
          sx={{
            bgcolor: '#3B82F6',
            borderRadius: 1,
            color: 'var(--mui-palette-common-white)',
            px: 4,
            py: 8,
          }}
        >
          <Grid container sx={{ alignItems: 'center' }}>
            <Grid
              size={{
                sm: 7,
                xs: 12,
              }}
            >
              <Stack spacing={3}>
                <Stack spacing={2}>
                  <Typography color="inherit" variant={isMobile ? 'h5' : 'h4'}>
                    Gain Experience in Search Funds and Small Business M&A
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid
              sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center' }}
              size={{
                sm: 5,
              }}
            >
              <Box
                alt="Shield"
                component="img"
                src="/assets/iconly-glass-shield.svg"
                sx={{ height: '100px', width: '100px' }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Category Selection Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
          <Button
            variant={selectedCategory === 'Internship' ? undefined : 'outlined'}
            onClick={() => handleCategoryChange('Internship')}
            sx={{
              backgroundColor: selectedCategory === 'Internship' ? '#3B82F6' : 'transparent',
              color: selectedCategory === 'Internship' ? '#fff' : '#3B82F6',
              borderColor: '#3B82F6',
              minWidth: 200,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            Internships
          </Button>
          <Button
            variant={selectedCategory === 'Full-time' ? undefined : 'outlined'}
            onClick={() => handleCategoryChange('Full-time')}
            sx={{
              backgroundColor: selectedCategory === 'Full-time' ? '#3B82F6' : 'transparent',
              color: selectedCategory === 'Full-time' ? '#fff' : '#3B82F6',
              borderColor: selectedCategory === 'Full-time' ? '#3B82F6' : '#3B82F6',
              minWidth: 200,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            Full-Time Roles
          </Button>
        </Box>

        <JobsFilters onFilterChange={handleFilterChange} />
        <AnimatePresence mode="wait">
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : jobs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Stack spacing={2}>
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </Stack>
            </motion.div>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No jobs found</Typography>
            </Box>
          )}
        </AnimatePresence>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', px: 3 }}>
          <IconButton disabled={page === 1 || isLoading} onClick={handlePrevPage}>
            <CaretLeftIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            Page {page} of {totalPages}
          </Typography>
          <IconButton disabled={!hasNextPage || isLoading} onClick={handleNextPage}>
            <CaretRightIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
