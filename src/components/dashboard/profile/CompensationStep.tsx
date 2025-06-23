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
  CurrencyDollar as MoneyIcon,
  TextT as PreferencesIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  CurrencyEth as CompensationIcon,
} from '@phosphor-icons/react/dist/ssr';
import Airtable from 'airtable';

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
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.25, 3),
    fontSize: '0.9rem',
    minHeight: '44px', // Better touch target
  },
}));

const schema = zod.object({
  compensationRange: zod.string().min(1, { message: 'Compensation range is required' }),
  otherPreferences: zod.string().optional(),
});

type FormValues = zod.infer<typeof schema>;

const defaultValues = {
  compensationRange: '',
  otherPreferences: '',
} satisfies FormValues;

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

export function CompensationStep({ onNext, onBack, onSectionComplete }: { onNext: () => void; onBack: () => void; onSectionComplete?: (completed: boolean) => void }): React.JSX.Element {
    const userContext = useContext(UserContext);
    if (!userContext) {
        throw new Error('UserContext is not available. Make sure the component is wrapped in a UserProvider.');
    }
    const { user } = userContext;
    const [existingRecordId, setExistingRecordId] = React.useState<string | null>(null);
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ defaultValues, resolver: zodResolver(schema) });
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                        fields: ['What is your ideal compensation range (base + bonus)?', 'Anything else we should know about you and your role preferences?'],
                    })
                    .all();

                if (records && records.length > 0) {
                    const existingData = records[0];
                    setExistingRecordId(existingData.id);
                    const formData = {
                        compensationRange: (existingData.get('What is your ideal compensation range (base + bonus)?') as string) || '',
                        otherPreferences: (existingData.get('Anything else we should know about you and your role preferences?') as string) || '',
                    };
                    
                    // Reset form with existing data
                    reset(formData);
                    console.log('Prefilled compensation form with existing user data:', formData);
                }
            } catch (error) {
                console.error('Error fetching existing compensation data:', error);
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
                    'What is your ideal compensation range (base + bonus)?': values.compensationRange,
                    'Anything else we should know about you and your role preferences?': values.otherPreferences,
                    'Login Email': user?.email,
                });
                console.log('Updated existing compensation record:', record);
            } else {
                // Create new record
                const record = await base('Candidate Database').create({
                    'What is your ideal compensation range (base + bonus)?': values.compensationRange,
                    'Anything else we should know about you and your role preferences?': values.otherPreferences,
                    'Login Email': user?.email,
                });
                console.log('Created new compensation record:', record);
            }
            
            if (onSectionComplete) {
                onSectionComplete(true);
            }
            onNext();
        } catch (error) {
            console.error('Error saving compensation record:', error);
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
                        <CompensationIcon size={isMobile ? 24 : 32} weight="bold" />
                        Compensation & Preferences
                    </Typography>
                    <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            lineHeight: { xs: 1.5, sm: 1.6 }
                        }}
                    >
                        Help us understand your compensation expectations and any additional preferences for your ideal role.
                    </Typography>
                </Box>

                {/* Form Fields */}
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12}>
                        <FieldContainer>
                            <Controller
                                name="compensationRange"
                                control={control}
                                render={({ field }) => (
                                    <StyledFormControl fullWidth error={Boolean(errors.compensationRange)}>
                                        <InputLabel required>What is your ideal compensation range (base + bonus)?</InputLabel>
                                        <OutlinedInput 
                                            {...field} 
                                            placeholder="e.g., $120,000 - $150,000"
                                            sx={{
                                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                                '& .MuiInputBase-input': {
                                                    padding: { xs: '12px 14px', sm: '16px 14px' }
                                                }
                                            }}
                                        />
                                        <FormHelperText sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                            We won't send you roles out of this range!
                                        </FormHelperText>
                                        {errors.compensationRange ? (
                                            <FormHelperText sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                {errors.compensationRange.message}
                                            </FormHelperText>
                                        ) : null}
                                    </StyledFormControl>
                                )}
                            />
                        </FieldContainer>
                    </Grid>
                    <Grid item xs={12}>
                        <FieldContainer>
                            <Controller
                                name="otherPreferences"
                                control={control}
                                render={({ field }) => (
                                    <StyledFormControl fullWidth>
                                        <InputLabel>Anything else we should know about you and your role preferences?</InputLabel>
                                        <OutlinedInput 
                                            {...field} 
                                            multiline 
                                            rows={isMobile ? 3 : 4} 
                                            placeholder="Share any specific preferences, deal-breakers, or additional context that would help us find the perfect match..."
                                            sx={{
                                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                                '& .MuiInputBase-input': {
                                                    padding: { xs: '12px 14px', sm: '16px 14px' }
                                                }
                                            }}
                                        />
                                        <FormHelperText sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                            This helps us tailor our recommendations to your specific needs and preferences
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
                            '&:hover': {
                                borderColor: '#374151',
                                backgroundColor: 'rgba(107, 114, 128, 0.04)',
                            },
                            order: { xs: 2, sm: 1 }
                        }}
                    >
                        Back
                    </StyledButton>
                    <StyledButton 
                        type="submit" 
                        sx={{
                            backgroundColor: '#3B82F6',
                            color: 'white',
                            order: { xs: 1, sm: 2 }
                        }}
                        disabled={isSubmitting}
                        endIcon={<ArrowRightIcon size={isMobile ? 18 : 20} />}
                    >
                        Complete
                    </StyledButton>
                </Box>
            </Stack>
        </form>
    );
} 