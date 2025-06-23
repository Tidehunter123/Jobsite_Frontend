'use client';

import * as React from 'react';
import { useContext, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import {
  ArrowRight as ArrowRightIcon,
  TextT as BioIcon,
  EnvelopeSimple as EmailIcon,
  MapPin as LocationIcon,
  Phone as PhoneIcon,
  User as UserIcon,
} from '@phosphor-icons/react/dist/ssr';
import Airtable from 'airtable';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

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
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
  },
}));

const schema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required' }),
  lastName: zod.string().min(1, { message: 'Last name is required' }),
  email: zod.string().email({ message: 'Please enter a valid email' }),
  phone: zod.string().min(1, { message: 'Phone is required' }),
  city: zod.string().min(1, { message: 'City is required' }),
  state: zod.string().min(1, { message: 'State is required' }),
  bio: zod.string().optional(),
});

type FormValues = zod.infer<typeof schema>;

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  bio: '',
} satisfies FormValues;

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

export function GeneralStep({ onNext, onSectionComplete }: { onNext: () => void; onSectionComplete?: (completed: boolean) => void }): React.JSX.Element {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not available. Make sure the component is wrapped in a UserProvider.');
  }
  const { user } = userContext;
  const [existingRecordId, setExistingRecordId] = React.useState<string | null>(null);
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
            fields: ['First Name', 'Last Name', 'Email', 'Phone', 'City', 'State', 'Tell us a little about yourself (Optional)'],
          })
          .all();

        if (records && records.length > 0) {
          const existingData = records[0];
          setExistingRecordId(existingData.id);
          const formData = {
            firstName: (existingData.get('First Name') as string) || '',
            lastName: (existingData.get('Last Name') as string) || '',
            email: (existingData.get('Email') as string) || '',
            phone: (existingData.get('Phone') as string) || '',
            city: (existingData.get('City') as string) || '',
            state: (existingData.get('State') as string) || '',
            bio: (existingData.get('Tell us a little about yourself (Optional)') as string) || '',
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

  const onSubmit = async (values: FormValues) => {
    console.log(values);
    
    try {
      if (existingRecordId) {
        // Update existing record
        const record = await base('Candidate Database').update(existingRecordId, {
          'First Name': values.firstName,
          'Last Name': values.lastName,
          Email: values.email,
          Phone: values.phone,
          City: values.city,
          State: values.state,
          'Tell us a little about yourself (Optional)': values.bio,
          'Login Email': user?.email,
        });
        console.log('Updated existing record:', record);
      } else {
        // Create new record
        const record = await base('Candidate Database').create({
          'First Name': values.firstName,
          'Last Name': values.lastName,
          Email: values.email,
          Phone: values.phone,
          City: values.city,
          State: values.state,
          'Tell us a little about yourself (Optional)': values.bio,
          'Login Email': user?.email,
        });
        console.log('Created new record:', record);
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
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <UserIcon size={32} weight="bold" />
            General Information
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Let's start with your basic information. This helps us personalize your experience.
          </Typography>
        </Box>

        {/* Form Fields */}
        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <FieldContainer>
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <StyledFormControl error={Boolean(errors.firstName)} fullWidth>
                    <InputLabel required>First Name</InputLabel>
                    <OutlinedInput {...field} placeholder="Enter your first name" />
                    {errors.firstName ? (
                      <FormHelperText sx={{ fontWeight: 500 }}>{errors.firstName.message}</FormHelperText>
                    ) : null}
                  </StyledFormControl>
                )}
              />
            </FieldContainer>
          </Grid>

          <Grid item md={6} xs={12}>
            <FieldContainer>
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <StyledFormControl error={Boolean(errors.lastName)} fullWidth>
                    <InputLabel required>Last Name</InputLabel>
                    <OutlinedInput {...field} placeholder="Enter your last name" />
                    {errors.lastName ? (
                      <FormHelperText sx={{ fontWeight: 500 }}>{errors.lastName.message}</FormHelperText>
                    ) : null}
                  </StyledFormControl>
                )}
              />
            </FieldContainer>
          </Grid>

          <Grid item md={6} xs={12}>
            <FieldContainer>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <StyledFormControl error={Boolean(errors.email)} fullWidth>
                    <InputLabel required>Email Address</InputLabel>
                    <OutlinedInput {...field} type="email" placeholder="your.email@example.com" />
                    {errors.email ? (
                      <FormHelperText sx={{ fontWeight: 500 }}>{errors.email.message}</FormHelperText>
                    ) : null}
                  </StyledFormControl>
                )}
              />
            </FieldContainer>
          </Grid>

          <Grid item md={6} xs={12}>
            <FieldContainer>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <StyledFormControl error={Boolean(errors.phone)} fullWidth>
                    <InputLabel required>Phone Number</InputLabel>
                    <OutlinedInput {...field} placeholder="(555) 123-4567" />
                    {errors.phone ? (
                      <FormHelperText sx={{ fontWeight: 500 }}>{errors.phone.message}</FormHelperText>
                    ) : null}
                  </StyledFormControl>
                )}
              />
            </FieldContainer>
          </Grid>

          <Grid item md={6} xs={12}>
            <FieldContainer>
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <StyledFormControl error={Boolean(errors.city)} fullWidth>
                    <InputLabel required>City</InputLabel>
                    <OutlinedInput {...field} placeholder="Enter your city" />
                    {errors.city ? (
                      <FormHelperText sx={{ fontWeight: 500 }}>{errors.city.message}</FormHelperText>
                    ) : null}
                  </StyledFormControl>
                )}
              />
            </FieldContainer>
          </Grid>

          <Grid item md={6} xs={12}>
            <FieldContainer>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <StyledFormControl error={Boolean(errors.state)} fullWidth>
                    <InputLabel required>State</InputLabel>
                    <OutlinedInput {...field} placeholder="Enter your state" />
                    {errors.state ? (
                      <FormHelperText sx={{ fontWeight: 500 }}>{errors.state.message}</FormHelperText>
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
                name="bio"
                render={({ field }) => (
                  <StyledFormControl fullWidth>
                    <InputLabel>Tell us about yourself</InputLabel>
                    <OutlinedInput
                      {...field}
                      multiline
                      rows={4}
                      placeholder="Share a brief overview of your background, experience, and what you're looking for..."
                    />
                    <FormHelperText>
                      This helps us understand your background and match you with relevant opportunities
                    </FormHelperText>
                  </StyledFormControl>
                )}
              />
            </FieldContainer>
          </Grid>
        </Grid>

        {/* Action Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
          <StyledButton
            type="submit"
            sx={{
              backgroundColor: '#3B82F6',
              color: 'white',
            }}
            disabled={isSubmitting}
            endIcon={<ArrowRightIcon size={20} />}
          >
            Continue
          </StyledButton>
        </Box>
      </Stack>
    </form>
  );
}
