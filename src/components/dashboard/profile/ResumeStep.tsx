'use client';

import * as React from 'react';
import { useContext, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { z as zod } from 'zod';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { styled } from '@mui/material/styles';
import { useTheme, useMediaQuery } from '@mui/material';
import { 
  FileText as ResumeIcon,
  LinkedinLogo as LinkedInIcon,
  User as JobSearchIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  Paperclip as PaperclipIcon
} from '@phosphor-icons/react/dist/ssr';
import Airtable from 'airtable';
import { createClient } from '@supabase/supabase-js';

import { config } from '@/config';
import { UserContext } from '@/contexts/auth/user-context';
import { toast } from '@/components/core/toaster';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.3s ease',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
}));

const FieldContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.25, 2.5),
    fontSize: '0.875rem',
    minHeight: '44px', // Better touch target for mobile
  },
}));

const DropzoneRoot = styled('div')(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[2],
  },
  '&.has-file': {
    borderColor: theme.palette.success.main,
    backgroundColor: theme.palette.success.light + '10',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    minHeight: '120px', // Ensure minimum height for mobile
  },
  [theme.breakpoints.down('xs')]: {
    padding: theme.spacing(2.5),
  },
}));

const schema = zod.object({
  resume: zod.any().refine((files) => {
    // Allow if there are files OR if there's an existing resume (handled in component)
    if (files?.length > 0) return true;
    // The existing resume check will be done in the component
    return true;
  }, 'Resume is required.'),
  linkedinUrl: zod.string().url({ message: 'Please enter a valid URL' }),
  jobSearchStatus: zod.string(),
});

type FormValues = zod.infer<typeof schema>;

const defaultValues = {
  resume: null,
  linkedinUrl: '',
  jobSearchStatus: 'Not currently looking',
} satisfies FormValues;

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

// Initialize Supabase client
const supabase = createClient(
  config.supabase.url || '',
  config.supabase.roleKey || ''
);

export function ResumeStep({ onNext, onBack, onSectionComplete }: { onNext: () => void, onBack: () => void, onSectionComplete?: (completed: boolean) => void }): React.JSX.Element {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('xs'));
  
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not available. Make sure the component is wrapped in a UserProvider.');
  }
  const { user } = userContext;
  const [existingRecordId, setExistingRecordId] = React.useState<string | null>(null);
  const [existingResume, setExistingResume] = React.useState<{ filename: string; url: string } | null>(null);
  
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ 
    defaultValues, 
    resolver: zodResolver(schema),
    mode: 'onChange'
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles: File[]) => {
      setValue('resume', acceptedFiles, { shouldValidate: true });
    },
  });
  
  const files = watch('resume');

  // Check for existing user data when component mounts
  useEffect(() => {
    const fetchExistingUserData = async () => {
      if (!user?.email) {
        return;
      }

      try {
        const records = await base('Candidate Database')
          .select({
            filterByFormula: `{Login Email} = '${user.email}'`,
            fields: ['Resume', 'LinkedIn URL', 'Are you actively looking for a new Role?'],
          })
          .all();

        if (records && records.length > 0) {
          const existingData = records[0];
          setExistingRecordId(existingData.id);
          
          // Handle existing resume data
          const resumeData = existingData.get('Resume') as any[];
          console.log('Raw resume data from Airtable:', resumeData); // Debug log
          if (resumeData && resumeData.length > 0) {
            const resume = resumeData[0];
            console.log('Existing resume data:', resume); // Debug log
            console.log('Resume URL:', resume.url); // Debug log
            console.log('Resume filename:', resume.filename); // Debug log
            setExistingResume({
              filename: resume.filename || resume.name || 'Resume.pdf',
              url: resume.url || resume.download_url || resume.thumbnails?.full?.url
            });
          }
          
          const formData = {
            resume: null, // We don't pre-populate file uploads for security reasons
            linkedinUrl: (existingData.get('LinkedIn URL') as string) || '',
            jobSearchStatus: (existingData.get('Are you actively looking for a new Role?') as string) || 'Not currently looking',
          };
          
          // Reset form with existing data
          reset(formData);
          console.log('Prefilled form with existing user data:', formData);
        }
      } catch (error) {
        console.error('Error fetching existing user data:', error);
        // Don't show error toast as this is not critical for user experience
      }
    };

    fetchExistingUserData();
  }, [user?.email, reset]);

  // Custom validation for resume field
  const validateResume = (files: any) => {
    if (files?.length > 0) return true;
    if (existingResume) return true;
    return 'Resume is required.';
  };

  // Function to handle viewing resume
  const handleViewResume = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropzone from triggering
    
    if (!existingResume?.url) {
      toast.error('Resume URL not available');
      return;
    }

    console.log('Attempting to open resume URL:', existingResume.url); // Debug log

    try {
      // Try to open the URL directly first
      const newWindow = window.open(existingResume.url, '_blank', 'noopener,noreferrer');
      
      // If the window was blocked or failed to open, try alternative approach
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Create a temporary link element and click it
        const link = document.createElement('a');
        link.href = existingResume.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error opening resume URL:', error);
      toast.error('Unable to open resume. Please try uploading a new one.');
    }
  };

  const onSubmit = async (values: FormValues) => {
    console.log(values);
    
    try {
      const recordData = {
        'LinkedIn URL': values.linkedinUrl,
        'Are you actively looking for a new Role?': values.jobSearchStatus,
        'Login Email': user?.email,
      };

      // Check if there's a new file to upload OR if there's an existing resume
      if (values.resume?.[0]) {
        try {
          // Upload file to Supabase Storage
          const fileName = values.resume[0].name;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(fileName, values.resume[0]);

          if (uploadError) {
            throw new Error('Failed to upload resume to storage');
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(fileName);

          if (existingRecordId) {
            // Update existing record without attachment first
            const record = await base('Candidate Database').update(existingRecordId, recordData);
            console.log('Updated existing record:', record);
            
            // Then update with the attachment
            await base('Candidate Database').update([
              {
                id: existingRecordId,
                fields: {
                  Resume: [
                    {
                      url: publicUrl,
                    }
                  ] as any
                }
              }
            ]);
          } else {
            // Create new record without attachment first
            const record = await base('Candidate Database').create({
              ...recordData,
              Resume: [], // Initialize with empty array
            });
            console.log('Created new record:', record);
            
            // Then update with the attachment
            await base('Candidate Database').update([
              {
                id: record.id,
                fields: {
                  Resume: [
                    {
                      url: publicUrl,
                    }
                  ] as any
                }
              }
            ]);
          }

          // Clean up the file from Supabase storage after a delay
          setTimeout(() => {
            supabase.storage.from('resumes').remove([fileName]);
          }, 3000);
        } catch (error) {
          console.error('Error uploading resume:', error);
          toast.error('Failed to upload resume. Please try again.');
          return;
        }
      } else if (existingResume) {
        // No new file uploaded but there's an existing resume, just update other fields
        if (existingRecordId) {
          // Update existing record (keep existing resume)
          const record = await base('Candidate Database').update(existingRecordId, recordData);
          console.log('Updated existing record with existing resume:', record);
        } else {
          // Create new record with existing resume
          const record = await base('Candidate Database').create({
            ...recordData,
            Resume: [
              {
                url: existingResume.url,
              }
            ] as any
          });
          console.log('Created new record with existing resume:', record);
        }
      } else {
        // No resume file at all, just save the other data
        if (existingRecordId) {
          // Update existing record
          const record = await base('Candidate Database').update(existingRecordId, recordData);
          console.log('Updated existing record:', record);
        } else {
          // Create new record
          const record = await base('Candidate Database').create(recordData);
          console.log('Created new record:', record);
        }
      }
      
      onNext();
      if (onSectionComplete) {
        onSectionComplete(true);
      }
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Something went wrong!');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
              gap: { xs: 1.5, sm: 2 },
              flexWrap: 'wrap'
            }}
          >
            <ResumeIcon size={isMobile ? 28 : 32} weight="bold" />
            Resume & LinkedIn
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              lineHeight: { xs: 1.5, sm: 1.6 }
            }}
          >
            Upload your resume and share your LinkedIn profile to help us understand your professional background.
          </Typography>
        </Box>

        {/* Form Fields */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12}>
            <FieldContainer>
              <Typography 
                variant="subtitle2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Resume Upload (PDF only)
              </Typography>
              <DropzoneRoot {...getRootProps()} className={files?.[0] || existingResume ? 'has-file' : ''}>
                <input {...getInputProps()} />
                {files?.[0] ? (
                  <Stack alignItems="center" spacing={1}>
                    <PaperclipIcon size={isMobile ? 20 : 24} weight="bold" color="#10B981" />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500, 
                        color: 'success.main',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        textAlign: 'center',
                        wordBreak: 'break-word'
                      }}
                    >
                      {files[0].name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Click to replace file
                    </Typography>
                  </Stack>
                ) : existingResume ? (
                  <Stack alignItems="center" spacing={1}>
                    <PaperclipIcon size={isMobile ? 20 : 24} weight="bold" color="#10B981" />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500, 
                        color: 'success.main',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        textAlign: 'center',
                        wordBreak: 'break-word'
                      }}
                    >
                      {existingResume.filename}
                    </Typography>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={{ xs: 1, sm: 2 }} 
                      alignItems="center"
                      sx={{ width: '100%' }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleViewResume}
                        sx={{ 
                          textTransform: 'none', 
                          fontWeight: 600,
                          borderColor: '#10B981',
                          color: '#10B981',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          padding: { xs: '6px 12px', sm: '8px 16px' },
                          minHeight: { xs: '36px', sm: '40px' },
                          '&:hover': {
                            borderColor: '#059669',
                            backgroundColor: 'rgba(16, 185, 129, 0.04)',
                          }
                        }}
                      >
                        View Resume
                      </Button>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Click to replace file
                      </Typography>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
                    <PaperclipIcon size={isMobile ? 28 : 32} weight="light" color="#6B7280" />
                    <Stack spacing={1} alignItems="center">
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          textAlign: 'center'
                        }}
                      >
                        Drag & drop your resume here
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          textAlign: 'center'
                        }}
                      >
                        or <Button 
                          component="span" 
                          sx={{ 
                            textTransform: 'none', 
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            padding: { xs: '2px 4px', sm: '4px 8px' }
                          }}
                        >
                          browse files
                        </Button>
                      </Typography>
                    </Stack>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        textAlign: 'center'
                      }}
                    >
                      PDF format only, max 10MB
                    </Typography>
                  </Stack>
                )}
              </DropzoneRoot>
              {validateResume(files) !== true && (
                <FormHelperText 
                  error 
                  sx={{ 
                    fontWeight: 500, 
                    mt: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  {validateResume(files) as string}
                </FormHelperText>
              )}
            </FieldContainer>
          </Grid>

          <Grid item xs={12}>
            <FieldContainer>
              <Controller
                control={control}
                name="linkedinUrl"
                render={({ field }) => (
                  <StyledFormControl error={Boolean(errors.linkedinUrl)} fullWidth>
                    <InputLabel 
                      required
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      LinkedIn Profile URL
                    </InputLabel>
                    <OutlinedInput 
                      {...field} 
                      placeholder="https://linkedin.com/in/your-profile"
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        '& .MuiOutlinedInput-input': {
                          padding: { xs: '12px 14px', sm: '16px 14px' }
                        }
                      }}
                    />
                    {errors.linkedinUrl ? (
                      <FormHelperText 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {errors.linkedinUrl.message}
                      </FormHelperText>
                    ) : null}
                  </StyledFormControl>
                )}
              />
            </FieldContainer>
          </Grid>

          <Grid item xs={12}>
            <FieldContainer>
              <FormControl component="fieldset" fullWidth>
                <FormLabel 
                  component="legend" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary', 
                    mb: 2,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Are you actively looking for a new role?
                </FormLabel>
                <Controller
                  control={control}
                  name="jobSearchStatus"
                  render={({ field }) => (
                    <RadioGroup {...field} sx={{ ml: 0 }}>
                      <FormControlLabel 
                        value="Actively looking" 
                        control={<Radio />} 
                        label={
                          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            Actively looking
                          </Typography>
                        }
                        sx={{ 
                          mb: 1,
                          '& .MuiFormControlLabel-label': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }
                        }}
                      />
                      <FormControlLabel 
                        value="Open to the right opportunity" 
                        control={<Radio />} 
                        label={
                          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            Open to the right opportunity
                          </Typography>
                        }
                        sx={{ 
                          mb: 1,
                          '& .MuiFormControlLabel-label': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }
                        }}
                      />
                      <FormControlLabel 
                        value="Not currently looking" 
                        control={<Radio />} 
                        label={
                          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            Not currently looking
                          </Typography>
                        }
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }
                        }}
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
            </FieldContainer>
          </Grid>
        </Grid>

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
              borderColor: '#6B7280',
              color: '#6B7280',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                borderColor: '#374151',
                backgroundColor: 'rgba(107, 114, 128, 0.04)',
              },
            }}
          >
            Back
          </StyledButton>
          
          <StyledButton 
            type="submit" 
            sx={{
              backgroundColor: '#3B82F6',
              color: 'white',
              width: { xs: '100%', sm: 'auto' },
            }}
            disabled={isSubmitting}
            endIcon={<ArrowRightIcon size={isMobile ? 18 : 20} />}
          >
            Continue
          </StyledButton>
        </Box>
      </Stack>
    </form>
  );
} 