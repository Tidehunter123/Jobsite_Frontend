'use client';

import * as React from 'react';
import { useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, TextField, useMediaQuery, useTheme } from '@mui/material';
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
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';
import Airtable from 'airtable';
import { AnimatePresence, motion } from 'framer-motion';

import { config } from '@/config';
import { UserContext } from '@/contexts/auth/user-context';
import { MultiSelect } from '@/components/core/multi-select';
import { toast } from '@/components/core/toaster';
import { JobCard } from '@/components/dashboard/jobs/job-card';
import type { Job } from '@/components/dashboard/jobs/job-card';

type category = 'Portfolio Company Roles' | 'My Profile';

interface ApiResponse {
  jobs: Job[];
  hasNextPage: boolean;
  totalPages: number;
  currentPage: number;
}

const experienceLevelOptions = [
  { label: 'Entry Level', value: 'Entry Level' },
  { label: 'Mid-Level', value: 'Mid-Level' },
  { label: 'Senior', value: 'Senior' },
  { label: 'Executive', value: 'Executive' },
] as const;

const functionAreaOptions = [
  { label: 'CEO / President', value: 'CEO / President' },
  { label: 'General Manager', value: 'General Manager' },
  { label: 'Operations / COO / Ops Manager', value: 'Operations / COO / Ops Manager' },
  { label: 'Finance / CFO / Controller', value: 'Finance / CFO / Controller' },
  { label: 'Sales & Marketing', value: 'Sales & Marketing' },
  { label: 'Strategy & Business Development', value: 'Strategy & Business Development' },
  { label: 'Product / Technology', value: 'Product / Technology' },
  { label: 'People / HR', value: 'People / HR' },
  { label: 'Board / Advisor', value: 'Board / Advisor' },
] as const;

const broadIndustryOptions = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Healthcare', value: 'Healthcare' },
] as const;

const specificIndustryOptions = [
  { label: 'SaaS', value: 'SaaS' },
  { label: 'FinTech', value: 'FinTech' },
  { label: 'HealthTech', value: 'HealthTech' },
] as const;

const companyRevenueOptions = [
  { label: 'Less than $1M', value: 'Less than $1M' },
  { label: '$1M – $5M', value: '$1M – $5M' },
  { label: '$5M – $15M', value: '$5M – $15M' },
  { label: '$15M – $50M', value: '$15M – $50M' },
  { label: '$50M+', value: '$50M+' },
] as const;

const regionOptions = [
  { label: 'Remote', value: 'Remote' },
  { label: 'Northeast', value: 'Northeast' },
  { label: 'Mid-Atlantic', value: 'Mid-Atlantic' },
  { label: 'Southeast', value: 'Southeast' },
  { label: 'Midwest', value: 'Midwest' },
  { label: 'Southwest', value: 'Southwest' },
  { label: 'West Coast', value: 'West Coast' },
  { label: 'Mountain West', value: 'Mountain West' },
  { label: 'Canada', value: 'Canada' },
] as const;

const cityOptions = [
  { label: 'New York', value: 'New York' },
  { label: 'London', value: 'London' },
  { label: 'Tokyo', value: 'Tokyo' },
] as const;

const roleTypeOptions = [
  { label: 'Full-Time', value: 'Full-Time' },
  { label: 'Interim / Contract', value: 'Interim / Contract' },
  { label: 'Part-Time', value: 'Part-Time' },
  { label: 'Board / Advisor', value: 'Contract' },
] as const;

interface JobsFiltersProps {
  onFilterChange: (filters: {
    jobTitle?: string;
    experienceLevels?: string[];
    functionAreas?: string[];
    broadIndustries?: string[];
    specificIndustries?: string[];
    companyRevenues?: string[];
    regions?: string[];
    cities?: string[];
    roleTypes?: string[];
  }) => void;
  currentFilters: {
    jobTitle: string;
    experienceLevels: string[];
    functionAreas: string[];
    broadIndustries: string[];
    specificIndustries: string[];
    companyRevenues: string[];
    regions: string[];
    cities: string[];
    roleTypes: string[];
  };
}

function JobsFilters({ onFilterChange, currentFilters }: JobsFiltersProps): React.JSX.Element {
  const [jobTitle, setJobTitle] = React.useState(currentFilters.jobTitle);
  const [experienceLevels, setExperienceLevels] = React.useState<string[]>(currentFilters.experienceLevels);
  const [functionAreas, setFunctionAreas] = React.useState<string[]>(currentFilters.functionAreas);
  const [broadIndustries, setBroadIndustries] = React.useState<string[]>(currentFilters.broadIndustries);
  const [specificIndustries, setSpecificIndustries] = React.useState<string[]>(currentFilters.specificIndustries);
  const [companyRevenues, setCompanyRevenues] = React.useState<string[]>(currentFilters.companyRevenues);
  const [regions, setRegions] = React.useState<string[]>(currentFilters.regions);
  const [cities, setCities] = React.useState<string[]>(currentFilters.cities);
  const [roleTypes, setRoleTypes] = React.useState<string[]>(currentFilters.roleTypes);

  // Update local state when currentFilters change
  React.useEffect(() => {
    setJobTitle(currentFilters.jobTitle);
    setExperienceLevels(currentFilters.experienceLevels);
    setFunctionAreas(currentFilters.functionAreas);
    setBroadIndustries(currentFilters.broadIndustries);
    setSpecificIndustries(currentFilters.specificIndustries);
    setCompanyRevenues(currentFilters.companyRevenues);
    setRegions(currentFilters.regions);
    setCities(currentFilters.cities);
    setRoleTypes(currentFilters.roleTypes);
  }, [currentFilters]);

  const handleFilter = () => {
    onFilterChange({
      jobTitle,
      experienceLevels,
      functionAreas,
      broadIndustries,
      specificIndustries,
      companyRevenues,
      regions,
      cities,
      roleTypes,
    });
  };

  const handleClearAll = () => {
    setJobTitle('');
    setExperienceLevels([]);
    setFunctionAreas([]);
    setBroadIndustries([]);
    setSpecificIndustries([]);
    setCompanyRevenues([]);
    setRegions([]);
    setCities([]);
    setRoleTypes([]);
    onFilterChange({
      jobTitle: '',
      experienceLevels: [],
      functionAreas: [],
      broadIndustries: [],
      specificIndustries: [],
      companyRevenues: [],
      regions: [],
      cities: [],
      roleTypes: [],
    });
  };

  // Apply filters immediately when MultiSelect values change
  const handleExperienceLevelsChange = (values: string[]) => {
    setExperienceLevels(values);
    onFilterChange({
      jobTitle,
      experienceLevels: values,
      functionAreas,
      broadIndustries,
      specificIndustries,
      companyRevenues,
      regions,
      cities,
      roleTypes,
    });
  };

  const handleFunctionAreasChange = (values: string[]) => {
    setFunctionAreas(values);
    onFilterChange({
      jobTitle,
      experienceLevels,
      functionAreas: values,
      broadIndustries,
      specificIndustries,
      companyRevenues,
      regions,
      cities,
      roleTypes,
    });
  };

  const handleBroadIndustriesChange = (values: string[]) => {
    setBroadIndustries(values);
    onFilterChange({
      jobTitle,
      experienceLevels,
      functionAreas,
      broadIndustries: values,
      specificIndustries,
      companyRevenues,
      regions,
      cities,
      roleTypes,
    });
  };

  const handleSpecificIndustriesChange = (values: string[]) => {
    setSpecificIndustries(values);
    onFilterChange({
      jobTitle,
      experienceLevels,
      functionAreas,
      broadIndustries,
      specificIndustries: values,
      companyRevenues,
      regions,
      cities,
      roleTypes,
    });
  };

  const handleCompanyRevenuesChange = (values: string[]) => {
    setCompanyRevenues(values);
    onFilterChange({
      jobTitle,
      experienceLevels,
      functionAreas,
      broadIndustries,
      specificIndustries,
      companyRevenues: values,
      regions,
      cities,
      roleTypes,
    });
  };

  const handleRegionsChange = (values: string[]) => {
    setRegions(values);
    onFilterChange({
      jobTitle,
      experienceLevels,
      functionAreas,
      broadIndustries,
      specificIndustries,
      companyRevenues,
      regions: values,
      cities,
      roleTypes,
    });
  };

  const handleCitiesChange = (values: string[]) => {
    setCities(values);
    onFilterChange({
      jobTitle,
      experienceLevels,
      functionAreas,
      broadIndustries,
      specificIndustries,
      companyRevenues,
      regions,
      cities: values,
      roleTypes,
    });
  };

  const handleRoleTypesChange = (values: string[]) => {
    setRoleTypes(values);
    onFilterChange({
      jobTitle,
      experienceLevels,
      functionAreas,
      broadIndustries,
      specificIndustries,
      companyRevenues,
      regions,
      cities,
      roleTypes: values,
    });
  };

  const handleClearJobTitle = () => {
    setJobTitle('');
    onFilterChange({
      jobTitle: '',
      experienceLevels,
      functionAreas,
      broadIndustries,
      specificIndustries,
      companyRevenues,
      regions,
      cities,
      roleTypes,
    });
  };

  const handleClearExperienceLevels = () => {
    handleExperienceLevelsChange([]);
  };
  const handleClearFunctionAreas = () => {
    handleFunctionAreasChange([]);
  };
  const handleClearBroadIndustries = () => {
    handleBroadIndustriesChange([]);
  };
  const handleClearSpecificIndustries = () => {
    handleSpecificIndustriesChange([]);
  };
  const handleClearCompanyRevenues = () => {
    handleCompanyRevenuesChange([]);
  };
  const handleClearRegions = () => {
    handleRegionsChange([]);
  };
  const handleClearCities = () => {
    handleCitiesChange([]);
  };
  const handleClearRoleTypes = () => {
    handleRoleTypesChange([]);
  };

  // Check if any filters are applied
  const hasActiveFilters =
    jobTitle ||
    experienceLevels.length > 0 ||
    functionAreas.length > 0 ||
    broadIndustries.length > 0 ||
    specificIndustries.length > 0 ||
    companyRevenues.length > 0 ||
    regions.length > 0 ||
    cities.length > 0 ||
    roleTypes.length > 0;

  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#3B82F6', fontWeight: 'bold' }}>
              Active Filters:
            </Typography>
            <Stack spacing={1}>
              {jobTitle && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: 1,
                    bgcolor: '#F3F4F6',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Job Title:
                    </Typography>
                    <Typography variant="body2">{jobTitle}</Typography>
                  </Box>
                  <IconButton onClick={handleClearJobTitle} size="small" sx={{ p: 0 }}>
                    <XIcon size={16} />
                  </IconButton>
                </Box>
              )}
              {experienceLevels.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: 1,
                    bgcolor: '#F3F4F6',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Experience:
                    </Typography>
                    <Typography variant="body2">{experienceLevels.join(', ')}</Typography>
                  </Box>
                  <IconButton onClick={handleClearExperienceLevels} size="small" sx={{ p: 0 }}>
                    <XIcon size={16} />
                  </IconButton>
                </Box>
              )}
              {functionAreas.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: 1,
                    bgcolor: '#F3F4F6',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Function:
                    </Typography>
                    <Typography variant="body2">{functionAreas.join(', ')}</Typography>
                  </Box>
                  <IconButton onClick={handleClearFunctionAreas} size="small" sx={{ p: 0 }}>
                    <XIcon size={16} />
                  </IconButton>
                </Box>
              )}
              {/* {broadIndustries.length > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: 1,
                  p: 1, 
                  bgcolor: '#F3F4F6', 
                  borderRadius: 1,
                  fontSize: '0.875rem'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Broad Industry:</Typography>
                    <Typography variant="body2">{broadIndustries.join(', ')}</Typography>
                  </Box>
                  <IconButton onClick={handleClearBroadIndustries} size="small" sx={{ p: 0 }}>
                    <XIcon size={16} />
                  </IconButton>
                </Box>
              )} */}
              {/* {specificIndustries.length > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: 1,
                  p: 1, 
                  bgcolor: '#F3F4F6', 
                  borderRadius: 1,
                  fontSize: '0.875rem'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Specific Industry:</Typography>
                    <Typography variant="body2">{specificIndustries.join(', ')}</Typography>
                  </Box>
                  <IconButton onClick={handleClearSpecificIndustries} size="small" sx={{ p: 0 }}>
                    <XIcon size={16} />
                  </IconButton>
                </Box>
              )} */}
              {companyRevenues.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: 1,
                    bgcolor: '#F3F4F6',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Revenue:
                    </Typography>
                    <Typography variant="body2">{companyRevenues.join(', ')}</Typography>
                  </Box>
                  <IconButton onClick={handleClearCompanyRevenues} size="small" sx={{ p: 0 }}>
                    <XIcon size={16} />
                  </IconButton>
                </Box>
              )}
              {regions.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: 1,
                    bgcolor: '#F3F4F6',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Region:
                    </Typography>
                    <Typography variant="body2">{regions.join(', ')}</Typography>
                  </Box>
                  <IconButton onClick={handleClearRegions} size="small" sx={{ p: 0 }}>
                    <XIcon size={16} />
                  </IconButton>
                </Box>
              )}
              {cities.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: 1,
                    bgcolor: '#F3F4F6',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      City:
                    </Typography>
                    <Typography variant="body2">{cities.join(', ')}</Typography>
                  </Box>
                  <IconButton onClick={handleClearCities} size="small" sx={{ p: 0 }}>
                    <XIcon size={16} />
                  </IconButton>
                </Box>
              )}
              {roleTypes.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: 1,
                    bgcolor: '#F3F4F6',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Role Type:
                    </Typography>
                    <Typography variant="body2">{roleTypes.join(', ')}</Typography>
                  </Box>
                  <IconButton onClick={handleClearRoleTypes} size="small" sx={{ p: 0 }}>
                    <XIcon size={16} />
                  </IconButton>
                </Box>
              )}
            </Stack>
            <Button
              onClick={handleClearAll}
              sx={{
                mt: 2,
                backgroundColor: '#EF4444',
                color: 'white',
                '&:hover': { backgroundColor: '#DC2626' },
                fontSize: '0.875rem',
                py: 0.5,
                px: 2,
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}

        <Stack spacing={1}>
          <Typography variant="subtitle2">Job Title</Typography>
          <Input
            fullWidth
            placeholder="Search by title."
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleFilter();
              }
            }}
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlassIcon />
              </InputAdornment>
            }
          />
        </Stack>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="subtitle2">Experience Level</Typography>
          <MultiSelect
            label="All levels"
            options={experienceLevelOptions}
            value={experienceLevels}
            onChange={handleExperienceLevelsChange}
            sx={{ backgroundColor: '#F3F4F6', width: '100%' }}
          />
        </Stack>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="subtitle2">Function Area</Typography>
          <MultiSelect
            label="All areas"
            options={functionAreaOptions}
            value={functionAreas}
            onChange={handleFunctionAreasChange}
            sx={{ backgroundColor: '#F3F4F6', width: '100%' }}
          />
        </Stack>
        <Divider />
        {/* <Stack spacing={1}>
          <Typography variant="subtitle2">Broad Industry</Typography>
          <MultiSelect
            label="All industries"
            options={broadIndustryOptions}
            value={broadIndustries}
            onChange={handleBroadIndustriesChange}
            sx={{ backgroundColor: '#F3F4F6', width: '100%' }}
          />
        </Stack>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="subtitle2">Specific Industry</Typography>
          <MultiSelect
            label="All industries"
            options={specificIndustryOptions}
            value={specificIndustries}
            onChange={handleSpecificIndustriesChange}
            sx={{ backgroundColor: '#F3F4F6', width: '100%' }}
          />
        </Stack>
        <Divider /> */}
        <Stack spacing={1}>
          <Typography variant="subtitle2">Company Revenue</Typography>
          <MultiSelect
            label="All revenues"
            options={companyRevenueOptions}
            value={companyRevenues}
            onChange={handleCompanyRevenuesChange}
            sx={{ backgroundColor: '#F3F4F6', width: '100%' }}
          />
        </Stack>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="subtitle2">Region</Typography>
          <MultiSelect
            label="All regions"
            options={regionOptions}
            value={regions}
            onChange={handleRegionsChange}
            sx={{ backgroundColor: '#F3F4F6', width: '100%' }}
          />
        </Stack>
        <Divider />
        {/* <Stack spacing={1}>
          <Typography variant="subtitle2">City</Typography>
          <MultiSelect label="All cities" options={cityOptions} value={cities} onChange={handleCitiesChange} sx={{ backgroundColor: '#F3F4F6', width: '100%' }}/>
        </Stack>
        <Divider /> */}
        <Stack spacing={1}>
          <Typography variant="subtitle2">Role Type</Typography>
          <MultiSelect
            label="All types"
            options={roleTypeOptions}
            value={roleTypes}
            onChange={handleRoleTypesChange}
            sx={{ backgroundColor: '#F3F4F6', width: '100%' }}
          />
        </Stack>
        <Button
          onClick={handleFilter}
          sx={{ backgroundColor: '#3B82F6', color: 'white', '&:hover': { backgroundColor: '#3B82F6' } }}
        >
          Search Jobs
        </Button>
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
  const pathname = usePathname();
  const router = useRouter();
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
  const [selectedCategory, setSelectedCategory] = React.useState<category>('Portfolio Company Roles');
  const [filters, setFilters] = React.useState({
    jobTitle: '',
    experienceLevels: [] as string[],
    functionAreas: [] as string[],
    broadIndustries: [] as string[],
    specificIndustries: [] as string[],
    companyRevenues: [] as string[],
    regions: [] as string[],
    cities: [] as string[],
    roleTypes: [] as string[],
  });

  if (!config.supabase.url || !config.supabase.roleKey) {
    throw new Error('Supabase URL or roleKey is not defined.');
  }

  const fetchJobs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {
        page: page.toString(),
      };

      if (filters.jobTitle) {
        params.jobTitle = filters.jobTitle;
      }
      if (filters.experienceLevels.length > 0) {
        params.experienceLevel = filters.experienceLevels.join(',');
      }
      if (filters.functionAreas.length > 0) {
        params.functionArea = filters.functionAreas.join(',');
      }
      if (filters.broadIndustries.length > 0) {
        params.broadIndustrie = filters.broadIndustries.join(',');
      }
      if (filters.specificIndustries.length > 0) {
        params.specificIndustrie = filters.specificIndustries.join(',');
      }
      if (filters.companyRevenues.length > 0) {
        params.companyRevenue = filters.companyRevenues.join(',');
      }
      if (filters.regions.length > 0) {
        params.region = filters.regions.join(',');
      }
      if (filters.cities.length > 0) {
        params.citie = filters.cities.join(',');
      }
      if (filters.roleTypes.length > 0) {
        params.roleType = filters.roleTypes.join(',');
      }

      const queryParams = new URLSearchParams(params);
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
    jobTitle?: string;
    experienceLevels?: string[];
    functionAreas?: string[];
    broadIndustries?: string[];
    specificIndustries?: string[];
    companyRevenues?: string[];
    regions?: string[];
    cities?: string[];
    roleTypes?: string[];
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const handleCategoryChange = (category: category) => {
    if (pathname === '/') {
      if (category === 'My Profile') {
        router.push('/auth/supabase/sign-in');
      }
    }
    if (pathname === '/dashboard') {
      if (category === 'Portfolio Company Roles') {
        setSelectedCategory(category);
        setPage(1); // Reset to first page when category changes
      }
      if (category === 'My Profile') {
        router.push('/dashboard/profile');
      }
    }
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
            variant={selectedCategory === 'Portfolio Company Roles' ? undefined : 'outlined'}
            onClick={() => handleCategoryChange('Portfolio Company Roles')}
            sx={{
              backgroundColor: selectedCategory === 'Portfolio Company Roles' ? '#3B82F6' : 'transparent',
              color: selectedCategory === 'Portfolio Company Roles' ? '#fff' : '#3B82F6',
              borderColor: '#3B82F6',
              minWidth: 200,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            Portfolio Company Roles
          </Button>
          <Button
            variant={selectedCategory === 'My Profile' ? undefined : 'outlined'}
            onClick={() => handleCategoryChange('My Profile')}
            sx={{
              backgroundColor: selectedCategory === 'My Profile' ? '#3B82F6' : 'transparent',
              color: selectedCategory === 'My Profile' ? '#fff' : '#3B82F6',
              borderColor: selectedCategory === 'My Profile' ? '#3B82F6' : '#3B82F6',
              minWidth: 200,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            My Profile
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid size={3}>
            <JobsFilters onFilterChange={handleFilterChange} currentFilters={filters} />
          </Grid>
          <Grid size={9}>
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
          </Grid>
        </Grid>
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
