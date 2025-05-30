'use client';

import React, { useContext, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Checkbox,
  Divider,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useTheme,
  Zoom,
  MenuItem,
  Select,
  InputLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { FiBriefcase, FiCalendar, FiClock, FiDollarSign, FiFileText, FiSend, FiUser, FiUsers } from 'react-icons/fi';
import Airtable from 'airtable';

import { TextEditor } from '@/components/core/text-editor/text-editor';
import { config } from '@/config';
import { toast } from '@/components/core/toaster';
import { UserContext } from '@/contexts/auth/supabase/user-context';

interface JobPostingFields {
  'Job Title': string;
  'Ideal Start Date': string | null;
  'Anticipated end date': string | null;
  'Remote/In person': string;
  'Hours Per Week': number;
  'Paid/Unpaid': string;
  'Job Type': string[];
  'Job Description': string;
  'ATS': string;
  'External Link': string;
  'Client Contact Email': string;
  'Status': string;
  'Name of Poster': string;
  'Email': string;
  'Role': string;
}

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

const steps = ['Basic Information', 'Job Details', 'Candidate Requirements', 'Application Method'];

const stepIcons: Record<number, JSX.Element> = {
  0: <FiUser />,
  1: <FiBriefcase />,
  2: <FiUsers />,
  3: <FiFileText />,
};


const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default function PostJobPage() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const { user } = useUser();
  const [form, setForm] = useState({
    name: '',
    jobTitle: '',
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
    workType: '',
    hoursPerWeek: '',
    pay: '',
    candidateType: [] as string[],
    jobDescription: '',
    applicationMethod: '',
    externalLink: '',
    contactEmail: '',
    role: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name?: string; value: unknown } }
  ) => {
    // For synthetic events from MUI components
    if ('target' in e && e.target) {
      const { name, value } = e.target;
      if (name === 'candidateType') {
        const option = value as string;
        setForm((prev) => {
          const current = prev.candidateType;
          return {
            ...prev,
            candidateType: current.includes(option)
              ? current.filter((v) => v !== option)
              : [...current, option],
          };
        });
      } else if (name === 'applicationMethod') {
        setForm((prev) => ({ ...prev, applicationMethod: value as string }));
      } else {
        setForm((prev) => ({ ...prev, [name!]: value }));
      }
    }
  };

  const handleDateChange = (field: string) => (value: Dayjs | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDescriptionChange = ({ editor }: { editor: any }) => {
    setForm((prev) => ({ ...prev, jobDescription: editor.getHTML() }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Format dates for Airtable
      const formattedStartDate = form.startDate ? form.startDate.format('MM/DD/YYYY') : null;
      const formattedEndDate = form.endDate ? form.endDate.format('MM/DD/YYYY') : null;

      const jobPostingData: JobPostingFields = {
        'Job Title': form.jobTitle,
        'Ideal Start Date': formattedStartDate,
        'Anticipated end date': formattedEndDate,
        'Remote/In person': form.workType,
        'Hours Per Week': parseInt(form.hoursPerWeek) || 0,
        'Paid/Unpaid': form.pay,
        'Job Type': form.candidateType,
        'Job Description': form.jobDescription,
        'ATS': form.applicationMethod,
        'External Link': form.applicationMethod === 'Input External Link' ? form.externalLink : '',
        'Client Contact Email': form.applicationMethod === 'Receive Email From Candidates' ? form.contactEmail : '',
        'Status': 'Not approved',
        'Name of Poster': user?.name || '',
        'Email': user?.email || '',
        'Role': form.role,
      };

      // Create record in Airtable
      await base('Job Postings').create(jobPostingData as any);

      toast.success('Job posted successfully!');
      window.location.href = '/recruiter/jobs';
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job. Please try again.');
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step: number) => {
    let content;
    switch (step) {
      case 0:
        content = (
          <Stack spacing={3}>
            <TextField
              label="Job Title"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <FiBriefcase style={{ marginRight: 8, color: '#3B82F6' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#3B82F6',
                  },
                  transition: 'all 0.3s ease',
                },
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DatePicker
                  label="Ideal Start Date"
                  value={form.startDate}
                  onChange={(value) => handleDateChange('startDate')(value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      variant: 'outlined',
                      InputProps: {
                        startAdornment: <FiCalendar style={{ marginRight: 8, color: '#3B82F6' }} />,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Anticipated end date"
                  value={form.endDate}
                  onChange={(value) => handleDateChange('endDate')(value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      variant: 'outlined',
                      InputProps: {
                        startAdornment: <FiCalendar style={{ marginRight: 8, color: '#3B82F6' }} />,
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        );
        break;
      case 1:
        content = (
          <Stack spacing={3}>
            <FormControl component="fieldset" required>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600, color: '#3B82F6' }}>
                Work Type
              </FormLabel>
              <RadioGroup row name="workType" value={form.workType} onChange={handleChange}>
                <FormControlLabel
                  value="In person"
                  control={<Radio />}
                  label="In person"
                  sx={{
                    mr: 4,
                    '&:hover': {
                      color: '#3B82F6',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
                <FormControlLabel
                  value="Remote"
                  control={<Radio />}
                  label="Remote"
                  sx={{
                    '&:hover': {
                      color: '#3B82F6',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
              </RadioGroup>
            </FormControl>
            <TextField
              label="Hours Per Week"
              name="hoursPerWeek"
              value={form.hoursPerWeek}
              onChange={handleChange}
              required
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <FiClock style={{ marginRight: 8, color: '#3B82F6' }} />,
                inputProps: { min: 1, max: 168 },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#3B82F6',
                  },
                  transition: 'all 0.3s ease',
                },
              }}
            />
            <FormControl component="fieldset" required>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600, color: '#3B82F6' }}>
                Pay
              </FormLabel>
              <RadioGroup row name="pay" value={form.pay} onChange={handleChange}>
                <FormControlLabel
                  value="Paid"
                  control={<Radio />}
                  label="Paid"
                  sx={{
                    mr: 4,
                    '&:hover': {
                      color: '#3B82F6',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
                <FormControlLabel
                  value="Unpaid"
                  control={<Radio />}
                  label="Unpaid"
                  sx={{
                    '&:hover': {
                      color: '#3B82F6',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Stack>
        );
        break;
      case 2:
        content = (
          <Stack spacing={3}>
            {/* <FormControl component="fieldset" required>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600, color: '#3B82F6' }}>
                Job Type
              </FormLabel>
              <FormGroup row>
                {['Early Career', 'Experienced'].map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={form.candidateType.includes(option)}
                        onChange={() => handleChange({ target: { name: 'candidateType', value: option } } as any)}
                        name="candidateType"
                        sx={{ '&.Mui-checked': { color: '#3B82F6' } }}
                      />
                    }
                    label={option}
                    sx={{ mr: 4, '&:hover': { color: '#3B82F6' }, transition: 'all 0.3s ease' }}
                  />
                ))}
              </FormGroup>
            </FormControl> */}
            <FormControl fullWidth required variant="outlined">
              <InputLabel id="role-label">Role Type</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={form.role}
                onChange={handleChange}
                label="Role Type"
              >
                <MenuItem value="Internship">Internship</MenuItem>
                <MenuItem value="Full-time">Full-time</MenuItem>
              </Select>
            </FormControl>
            <FormControl required fullWidth>
              <FormLabel sx={{ mb: 1, fontWeight: 600, color: '#3B82F6' }}>Job Description</FormLabel>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#3B82F6',
                    boxShadow: `0 0 0 2px ${alpha('#3B82F6', 0.1)}`,
                  },
                }}
              >
                <TextEditor
                  content={form.jobDescription}
                  onUpdate={handleDescriptionChange}
                  placeholder="Write a detailed job description..."
                />
              </Box>
            </FormControl>
          </Stack>
        );
        break;
      case 3:
        content = (
          <FormControl component="fieldset" required fullWidth>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600, color: '#3B82F6' }}>
              How do you want to receive applications?
            </FormLabel>
            <RadioGroup
              name="applicationMethod"
              value={form.applicationMethod}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Use Our Internal Applicant Tracking System"
                control={<Radio sx={{ '&.Mui-checked': { color: '#3B82F6' } }} />}
                label="Use Our Internal Applicant Tracking System"
              />
              <FormControlLabel
                value="Input External Link"
                control={<Radio sx={{ '&.Mui-checked': { color: '#3B82F6' } }} />}
                label="Input External Link"
              />
              <FormControlLabel
                value="Receive Email From Candidates"
                control={<Radio sx={{ '&.Mui-checked': { color: '#3B82F6' } }} />}
                label="Receive Email From Candidates"
              />
            </RadioGroup>
            {form.applicationMethod === 'Input External Link' && (
              <TextField
                label="Please provide the external application link"
                name="externalLink"
                value={form.externalLink}
                onChange={handleChange}
                required
                fullWidth
                sx={{ mt: 2, '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#3B82F6' }, transition: 'all 0.3s ease' } }}
              />
            )}
            {form.applicationMethod === 'Receive Email From Candidates' && (
              <TextField
                label="What email would you like students to reach out to?"
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                required
                fullWidth
                type="email"
                sx={{ mt: 2, '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#3B82F6' }, transition: 'all 0.3s ease' } }}
              />
            )}
          </FormControl>
        );
        break;
      default:
        content = null;
    }

    return (
      <Fade in={true} timeout={500}>
        <Box>{content}</Box>
      </Fade>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        py: 4,
        px: { xs: 2, sm: 4 },
        background: `linear-gradient(135deg, ${alpha('#3B82F6', 0.05)} 0%, ${alpha('#3B82F6', 0.1)} 100%)`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 1600,
          mx: 'auto',
          py: { xs: 8, sm: 12 },
          px: { xs: 6, sm: 10 },
          borderRadius: 2,
          boxShadow: `0 8px 32px ${alpha('#3B82F6', 0.1)}`,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#3B82F6',
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
            }}
          >
            Post a New Job
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            Fill in the details below to create your job listing
          </Typography>
        </Box>

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 6,
            '& .MuiStepLabel-label': {
              color: theme.palette.text.secondary,
              '&.Mui-active': {
                color: '#3B82F6',
                fontWeight: 600,
              },
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={() => (
                  <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: activeStep >= index ? '#3B82F6' : 'transparent',
                        color: activeStep >= index ? 'white' : theme.palette.text.secondary,
                        border: `2px solid ${activeStep >= index ? '#3B82F6' : theme.palette.divider}`,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {stepIcons[index]}
                    </Box>
                  </Zoom>
                )}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{
              mr: 1,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              color: '#3B82F6',
              borderColor: '#3B82F6',
              '&:hover': {
                color: '#3B82F6',
                borderColor: '#3B82F6',
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha('#3B82F6', 0.2)}`,
              },
            }}
            variant="outlined"
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <form onSubmit={handleSubmit}>
              <Button
                type="submit"
                endIcon={<FiSend />}
                sx={{
                  bgcolor: '#3B82F6',
                  color: '#fff',
                  px: 6,
                  py: 1.5,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#3B82F6',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha('#3B82F6', 0.3)}`,
                  },
                }}
              >
                Submit Job
              </Button>
            </form>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              sx={{
                bgcolor: '#3B82F6',
                color: '#fff',
                px: 6,
                py: 1.5,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#3B82F6',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha('#3B82F6', 0.3)}`,
                },
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
