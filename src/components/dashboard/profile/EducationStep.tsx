'use client';

import * as React from 'react';
import { useContext, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import { useTheme, useMediaQuery } from '@mui/material';
import { 
  GraduationCap as GraduationIcon,
  Building as BuildingIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon
} from '@phosphor-icons/react/dist/ssr';
import Airtable from 'airtable';

import { config } from '@/config';
import { UserContext } from '@/contexts/auth/user-context';
import { toast } from '@/components/core/toaster';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.3s ease',
    [theme.breakpoints.down('sm')]: {
      fontSize: '16px', // Prevents zoom on iOS
    },
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
    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
    },
    '&.Mui-focused': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
}));

const FieldContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&:focus-within .field-icon': {
    color: theme.palette.primary.main,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.25, 3),
    fontSize: '0.9rem',
    minHeight: '44px', // Better touch target
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
  },
}));

const schema = zod.object({
  undergraduateSchool: zod.string().min(1, { message: 'Undergraduate School is required' }),
  mba: zod.string().optional(),
  gradSchool: zod.string().optional(),
});

type FormValues = zod.infer<typeof schema>;

const defaultValues = {
  undergraduateSchool: '',
  mba: '',
  gradSchool: '',
} satisfies FormValues;

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

export function EducationStep({ onNext, onBack, onSectionComplete }: { onNext: () => void, onBack: () => void, onSectionComplete?: (completed: boolean) => void }): React.JSX.Element {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not available. Make sure the component is wrapped in a UserProvider.');
  }
  const { user } = userContext;
  const [existingRecordId, setExistingRecordId] = React.useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues, resolver: zodResolver(schema) });

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
            fields: ['Undergraduate School', 'MBA (Optional)', 'Grad School - Other than MBA (Optional)'],
          })
          .all();

        console.log(records, 'records');

        if (records && records.length > 0) {
          const existingData = records[0];
          setExistingRecordId(existingData.id);
          const formData = {
            undergraduateSchool: (existingData.get('Undergraduate School') as string) || '',
            mba: (existingData.get('MBA (Optional)') as string) || '',
            gradSchool: (existingData.get('Grad School - Other than MBA (Optional)') as string) || '',
          };
          
          // Reset form with existing data
          reset(formData);
          console.log('Prefilled education form with existing user data:', formData);
        }
      } catch (error) {
        console.error('Error fetching existing education data:', error);
        // Don't show error toast as this is not critical for user experience
      }
    };

    fetchExistingUserData();
  }, [user?.email, reset]);

  const onSubmit = async (values: FormValues) => {
    console.log(values);
    
    try {
      if (existingRecordId) {
        // Update existing record
        const record = await base('Candidate Database').update(existingRecordId, {
          'Undergraduate School': values.undergraduateSchool,
          'MBA (Optional)': values.mba,
          'Grad School - Other than MBA (Optional)': values.gradSchool,
          'Login Email': user?.email,
        });
        console.log('Updated existing education record:', record);
      } else {
        // Create new record
        const record = await base('Candidate Database').create({
          'Undergraduate School': values.undergraduateSchool,
          'MBA (Optional)': values.mba,
          'Grad School - Other than MBA (Optional)': values.gradSchool,
          'Login Email': user?.email,
        });
        console.log('Created new education record:', record);
      }
      
      if (onSectionComplete) {
        onSectionComplete(true);
      }
      onNext();
    } catch (error) {
      console.error('Error saving education record:', error);
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
              gap: { xs: 1, sm: 2 },
              flexWrap: 'wrap'
            }}
          >
            <GraduationIcon size={isMobile ? 24 : 32} weight="bold" />
            Education Background
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: { xs: 1.5, sm: 1.6 }
            }}
          >
            Tell us about your educational journey. This helps us understand your academic background and qualifications.
          </Typography>
        </Box>

        {/* Form Fields */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12}>
            <FieldContainer>
              <Controller
                control={control}
                name="undergraduateSchool"
                render={({ field }) => (
                  <StyledFormControl error={Boolean(errors.undergraduateSchool)} fullWidth>
                    <InputLabel required>Undergraduate School</InputLabel>
                    <OutlinedInput {...field} placeholder="Enter your undergraduate institution" />
                    {errors.undergraduateSchool ? (
                      <FormHelperText sx={{ fontWeight: 500 }}>{errors.undergraduateSchool.message}</FormHelperText>
                    ) : null}
                  </StyledFormControl>
                )}
              />
            </FieldContainer>
          </Grid>
          
          <Grid item xs={12}>
            <FieldContainer>
              <Controller
                control={control}
                name="mba"
                render={({ field }) => (
                  <StyledFormControl fullWidth>
                    <InputLabel>MBA (Optional)</InputLabel>
                    <OutlinedInput {...field} placeholder="Enter your MBA institution if applicable" />
                    <FormHelperText sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Include your MBA program and institution if you have one
                    </FormHelperText>
                  </StyledFormControl>
                )}
              />
            </FieldContainer>
          </Grid>
          
          <Grid item xs={12}>
            <FieldContainer>
              <Controller
                control={control}
                name="gradSchool"
                render={({ field }) => (
                  <StyledFormControl fullWidth>
                    <InputLabel>Grad School - Other than MBA (Optional)</InputLabel>
                    <OutlinedInput {...field} placeholder="Enter other graduate programs or institutions" />
                    <FormHelperText sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Include any other graduate degrees, certifications, or advanced education
                    </FormHelperText>
                  </StyledFormControl>
                )}
              />
            </FieldContainer>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          pt: { xs: 1, sm: 2 },
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
              order: { xs: 2, sm: 1 },
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
              order: { xs: 1, sm: 2 },
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