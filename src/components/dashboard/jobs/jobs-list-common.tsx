'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CaretLeft as CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRight as CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { AnimatePresence, motion } from 'framer-motion';

import { MultiSelect } from '@/components/core/multi-select';
import { JobCard } from '@/components/dashboard/jobs/job-card';
import type { Job } from '@/components/dashboard/jobs/job-card';

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

interface JobsFiltersProps {
  onFilterChange: (filters: { keyword?: string; workTypes?: string[]; paymentTypes?: string[] }) => void;
}

function JobsFilters({ onFilterChange }: JobsFiltersProps): React.JSX.Element {
  const [keyword, setKeyword] = React.useState('');
  const [selectedWorkTypes, setSelectedWorkTypes] = React.useState<string[]>([]);
  const [selectedPaymentTypes, setSelectedPaymentTypes] = React.useState<string[]>([]);

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
    onFilterChange({
      keyword: event.target.value,
      workTypes: selectedWorkTypes,
      paymentTypes: selectedPaymentTypes,
    });
  };

  const handleWorkTypeChange = (values: string[]) => {
    setSelectedWorkTypes(values);
    onFilterChange({
      keyword,
      workTypes: values,
      paymentTypes: selectedPaymentTypes,
    });
  };

  const handlePaymentTypeChange = (values: string[]) => {
    setSelectedPaymentTypes(values);
    onFilterChange({
      keyword,
      workTypes: selectedWorkTypes,
      paymentTypes: values,
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
          <MultiSelect
            label="Remote / In person"
            options={workTypeOptions}
            value={selectedWorkTypes}
            onChange={handleWorkTypeChange}
            sx={{
              minWidth: 200,
              '& .MuiSelect-select': {
                py: 1.5,
                bgcolor: selectedWorkTypes.length > 0 ? 'primary.50' : 'transparent',
                borderColor: selectedWorkTypes.length > 0 ? 'primary.main' : 'divider',
              },
              '& .MuiChip-root': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 'medium',
              },
              '& .MuiSvgIcon-root': {
                color: selectedWorkTypes.length > 0 ? 'primary.main' : 'action.active',
              },
            }}
          />
          <MultiSelect
            label="Paid / Unpaid"
            options={paymentTypeOptions}
            value={selectedPaymentTypes}
            onChange={handlePaymentTypeChange}
            sx={{
              minWidth: 200,
              '& .MuiSelect-select': {
                py: 1.5,
                bgcolor: selectedPaymentTypes.length > 0 ? 'primary.50' : 'transparent',
                borderColor: selectedPaymentTypes.length > 0 ? 'primary.main' : 'divider',
              },
              '& .MuiChip-root': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 'medium',
              },
              '& .MuiSvgIcon-root': {
                color: selectedPaymentTypes.length > 0 ? 'primary.main' : 'action.active',
              },
            }}
          />
        </Stack>
      </Stack>
    </Card>
  );
}

export function JobsList(): React.JSX.Element {
  const router = useRouter();
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({
    keyword: '',
    workTypes: [] as string[],
    paymentTypes: [] as string[],
  });

  const fetchJobs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.workTypes.length > 0 && { workTypes: filters.workTypes.join(',') }),
        ...(filters.paymentTypes.length > 0 && { paymentTypes: filters.paymentTypes.join(',') }),
      });

      const response = await fetch(`http://135.181.215.55:3005/api/jobs/com-jobs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = (await response.json()) as ApiResponse;

      setJobs(data.jobs);
      setHasNextPage(data.hasNextPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      // eslint-disable-next-line no-console -- Error logging
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  React.useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (newFilters: { keyword?: string; workTypes?: string[]; paymentTypes?: string[] }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
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

  const handleUndergraduateClick = () => {
    router.push('/dashboard');
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
            bgcolor: 'var(--mui-palette-neutral-900)',
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
                  <Typography color="inherit" variant="h3">
                    Undergraduates & Recent Graduates
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Button
                      variant="text"
                      onClick={handleUndergraduateClick}
                      sx={{
                        color: 'var(--mui-palette-warning-main)',
                        fontSize: '1rem',
                        fontWeight: 500,
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        padding: 0,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          textDecoration: 'underline',
                        },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      Go to Experienced Professionals and MBAs
                      <span style={{ marginLeft: '4px' }}>→</span>
                    </Button>
                  </Stack>
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
