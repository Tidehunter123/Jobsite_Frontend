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
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import { 
  MapPin as LocationIcon,
  Buildings as RegionsIcon,
  TextT as CitiesIcon,
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
  '& .MuiRadio-root': {
    color: theme.palette.text.secondary,
    '&.Mui-checked': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiFormControlLabel-root': {
    marginLeft: 0,
    marginRight: theme.spacing(3),
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

const regions = ['Remote', 'Northeast', 'Mid-Atlantic', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 'Mountain West', 'Canada', 'Northeast U.S.', 'Midwest U.S.', 'Southwest U.S.'];
const relocationOptions = ['Yes', 'No', 'Depends on the location'];

const schema = zod.object({
  regions: zod.array(zod.string()).optional(),
  cities: zod.string().optional(),
  relocation: zod.string().optional(),
});

type FormValues = zod.infer<typeof schema>;

const defaultValues = {
  regions: [],
  cities: '',
  relocation: '',
} satisfies FormValues;

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

export function GeographyStep({ onNext, onBack, onSectionComplete }: { onNext: () => void; onBack: () => void; onSectionComplete?: (completed: boolean) => void }): React.JSX.Element {
    const userContext = useContext(UserContext);
    if (!userContext) {
        throw new Error('UserContext is not available. Make sure the component is wrapped in a UserProvider.');
    }
    const { user } = userContext;
    const [existingRecordId, setExistingRecordId] = React.useState<string | null>(null);
    
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ 
        defaultValues, 
        resolver: zodResolver(schema) 
    });

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
                        fields: ['Where regions are you open to working?', `Any specific cities you're targeting?`, 'Are you open to relocation for the right opportunity?']
                    })
                    .all();

                if (records && records.length > 0) {
                    const existingData = records[0];
                    setExistingRecordId(existingData.id);
                    const formData = {
                        regions: (existingData.get('Where regions are you open to working?') as string[]) || [],
                        cities: (existingData.get(`Any specific cities you're targeting?`) as string) || '',
                        relocation: (existingData.get('Are you open to relocation for the right opportunity?') as string) || '',
                    };
                    
                    // Reset form with existing data
                    reset(formData);
                    console.log('Prefilled form with existing geography data:', formData);
                }
            } catch (error) {
                console.error('Error fetching existing geography data:', error);
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
                    'Where regions are you open to working?': values.regions,
                    "Any specific cities you're targeting?": values.cities,
                    'Are you open to relocation for the right opportunity?': values.relocation,
                    'Login Email': user?.email,
                });
                console.log('Updated existing geography record:', record);
            } else {
                // Create new record
                const record = await base('Candidate Database').create({
                    'Where regions are you open to working?': values.regions,
                    "Any specific cities you're targeting?": values.cities,
                    'Are you open to relocation for the right opportunity?': values.relocation,
                    'Login Email': user?.email,
                });
                console.log('Created new geography record:', record);
            }
            
            if (onSectionComplete) {
                onSectionComplete(true);
            }
            onNext();
        } catch (error) {
            console.error('Error saving geography record:', error);
            toast.error('Something went wrong!');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
                {/* Header */}
                <Box>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ 
                        fontWeight: 700, 
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <LocationIcon size={32} weight="bold" />
                        Geography Preferences
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Tell us about your geographic preferences and relocation flexibility for job opportunities.
                    </Typography>
                </Box>

                {/* Form Fields */}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FieldContainer>
                            <Controller
                                name="regions"
                                control={control}
                                render={({ field }) => (
                                    <StyledFormControl fullWidth>
                                        <InputLabel>Which regions are you open to working in?</InputLabel>
                                        <Select
                                            {...field}
                                            multiple
                                            input={<OutlinedInput label="Which regions are you open to working in?" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {(selected as string[]).map((value) => (
                                                        <Chip 
                                                            key={value} 
                                                            label={value} 
                                                            sx={{ 
                                                                backgroundColor: '#3B82F6',
                                                                color: 'white',
                                                                fontWeight: 500
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        >
                                            {regions.map((region) => (
                                                <MenuItem key={region} value={region}>
                                                    {region}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>
                                            Select all regions where you'd be willing to work
                                        </FormHelperText>
                                    </StyledFormControl>
                                )}
                            />
                        </FieldContainer>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <FieldContainer>
                            <Controller
                                name="cities"
                                control={control}
                                render={({ field }) => (
                                    <StyledFormControl fullWidth>
                                        <InputLabel>Any specific cities you're targeting?</InputLabel>
                                        <OutlinedInput 
                                            {...field} 
                                            multiline 
                                            rows={3} 
                                            placeholder="e.g., New York, San Francisco, Austin, Chicago..."
                                        />
                                        <FormHelperText>
                                            List any specific cities or areas you're particularly interested in
                                        </FormHelperText>
                                    </StyledFormControl>
                                )}
                            />
                        </FieldContainer>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <FormControl component="fieldset" fullWidth>
                            <FormLabel component="legend" sx={{ 
                                fontWeight: 600, 
                                color: 'text.primary',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <LocationIcon size={20} />
                                Are you open to relocation for the right opportunity?
                            </FormLabel>
                            <Controller
                                name="relocation"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup {...field} sx={{ mt: 1 }}>
                                        {relocationOptions.map(opt => (
                                            <FormControlLabel 
                                                key={opt} 
                                                value={opt} 
                                                control={<Radio />} 
                                                label={opt}
                                                sx={{
                                                    '& .MuiFormControlLabel-label': {
                                                        fontWeight: 500,
                                                        fontSize: '1rem'
                                                    }
                                                }}
                                            />
                                        ))}
                                    </RadioGroup>
                                )}
                            />
                            <FormHelperText>
                                This helps us understand your flexibility for new opportunities
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                    <StyledButton 
                        onClick={onBack}
                        variant="outlined"
                        startIcon={<ArrowLeftIcon size={20} />}
                        sx={{
                            borderColor: 'text.secondary',
                            color: 'text.secondary',
                            '&:hover': {
                                borderColor: 'text.primary',
                                color: 'text.primary',
                            }
                        }}
                    >
                        Back
                    </StyledButton>
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