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
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { styled } from '@mui/material/styles';
import { 
  Briefcase as JobIcon,
  Buildings as IndustryIcon,
  User as RoleIcon,
  ChartLine as PnlIcon,
  Buildings as CompanyIcon,
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
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.light + '20',
  },
}));

const StyledRadio = styled(Radio)(({ theme }) => ({
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.light + '20',
  },
}));

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  '&.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const industries = [
    'Healthcare', 'Home Services', 'Industrial / Manufacturing', 'Software / Tech', 
    'B2B Services', 'Consumer Services', 'Construction / Trades', 'Education & Training', 
    'Financial Services', 'Real Estate Services', 'E-Commerce / Digital Brands', 'Automotive', 
    'Environmental / Waste Services'
];

const roles = [
    'CEO / President', 'General Management / Operations', 'Finance Leadership', 'Sales Leadership',
    'Marketing Leadership', 'People / HR Leadership', 'Chief of Staff', 'Technology / Product Leadership',
    'Strategy / M&A', 'Field / Regional Leadership', 'Project-Based / Interim Roles', 'Open to Any Leadership Role'
];

const companySizes = ['<$5M revenue', '$5–10M revenue', '$10–30M revenue', '$30M+ revenue'];
const pnlResponsibilities = ['Yes', 'No', 'Partial (e.g. owned a cost center or business line, but not full P&L)'];

const schema = zod.object({
    interestedIndustries: zod.array(zod.string()).optional(),
    specificIndustries: zod.string().optional(),
    interestedRoles: zod.array(zod.string()).optional(),
    pnlResponsibility: zod.string().optional(),
    pnlDescription: zod.string().optional(),
    companySize: zod.string().optional(),
});

type FormValues = zod.infer<typeof schema>;

const defaultValues = {
    interestedIndustries: [],
    specificIndustries: '',
    interestedRoles: [],
    pnlResponsibility: '',
    pnlDescription: '',
    companySize: '',
} satisfies FormValues;

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

export function JobPreferencesStep({ onNext, onBack, onSectionComplete }: { onNext: () => void; onBack: () => void; onSectionComplete?: (completed: boolean) => void }): React.JSX.Element {
    const userContext = useContext(UserContext);
    if (!userContext) {
        throw new Error('UserContext is not available. Make sure the component is wrapped in a UserProvider.');
    }
    const { user } = userContext;
    const [existingRecordId, setExistingRecordId] = React.useState<string | null>(null);
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ defaultValues, resolver: zodResolver(schema) });

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
                        fields: ['What industries are you most interested in operating in?', 'Use this space to specify specific industries that you have experience in / are interested in working in for your new role', 'What type of role are you most interested in?', 'Have you had full P&L responsibility in a prior role?', 'Please describe the size and scope of that responsibility (e.g. team size, revenue, EBITDA).', 'What size company are you best suited to lead?'],
                    })
                    .all();

                if (records && records.length > 0) {
                    const existingData = records[0];
                    setExistingRecordId(existingData.id);
                    const formData = {
                        interestedIndustries: (existingData.get('What industries are you most interested in operating in?') as string[]) || [],
                        specificIndustries: (existingData.get('Use this space to specify specific industries that you have experience in / are interested in working in for your new role') as string) || '',
                        interestedRoles: (existingData.get('What type of role are you most interested in?') as string[]) || [],
                        pnlResponsibility: (existingData.get('Have you had full P&L responsibility in a prior role?') as string) || '',
                        pnlDescription: (existingData.get('Please describe the size and scope of that responsibility (e.g. team size, revenue, EBITDA).') as string) || '',
                        companySize: (existingData.get('What size company are you best suited to lead?') as string) || '',
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
                    'What industries are you most interested in operating in?': values.interestedIndustries,
                    'Use this space to specify specific industries that you have experience in / are interested in working in for your new role': values.specificIndustries,
                    'What type of role are you most interested in?': values.interestedRoles,
                    'Have you had full P&L responsibility in a prior role?': values.pnlResponsibility,
                    'Please describe the size and scope of that responsibility (e.g. team size, revenue, EBITDA).': values.pnlDescription,
                    'What size company are you best suited to lead?': values.companySize,
                    'Login Email': user?.email,
                });
                console.log('Updated existing record:', record);
            } else {
                // Create new record
                const record = await base('Candidate Database').create({
                    'What industries are you most interested in operating in?': values.interestedIndustries,
                    'Use this space to specify specific industries that you have experience in / are interested in working in for your new role': values.specificIndustries,
                    'What type of role are you most interested in?': values.interestedRoles,
                    'Have you had full P&L responsibility in a prior role?': values.pnlResponsibility,
                    'Please describe the size and scope of that responsibility (e.g. team size, revenue, EBITDA).': values.pnlDescription,
                    'What size company are you best suited to lead?': values.companySize,
                    'Login Email': user?.email,
                });
                console.log('Created new record:', record);
            }
            
            if (onSectionComplete) {
                onSectionComplete(true);
            }
            onNext();
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
                    <Typography variant="h4" component="h2" gutterBottom sx={{ 
                        fontWeight: 700, 
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <JobIcon size={32} weight="bold" />
                        Job Preferences
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Tell us about your ideal role and the types of companies you'd like to work with.
                    </Typography>
                </Box>

                {/* Form Fields */}
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <FieldContainer>
                            <Typography variant="subtitle1" sx={{ 
                                fontWeight: 600, 
                                color: 'text.primary', 
                                mb: 2,
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1 
                            }}>
                                <IndustryIcon size={20} />
                                What industries are you most interested in operating in?
                            </Typography>
                            <FormGroup>
                                <Grid container spacing={2}>
                                    {industries.map((industry) => (
                                        <Grid item key={industry} xs={12} sm={6} md={4}>
                                            <Controller
                                                name="interestedIndustries"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={
                                                            <StyledCheckbox 
                                                                checked={field.value?.includes(industry)} 
                                                                onChange={(e) => {
                                                                    const newValues = e.target.checked
                                                                        ? [...(field.value || []), industry]
                                                                        : field.value?.filter(v => v !== industry);
                                                                    field.onChange(newValues);
                                                                }} 
                                                            />
                                                        }
                                                        label={industry}
                                                        sx={{ 
                                                            '& .MuiFormControlLabel-label': { 
                                                                fontSize: '0.9rem',
                                                                fontWeight: 500
                                                            } 
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </FormGroup>
                        </FieldContainer>
                    </Grid>

                    <Grid item xs={12}>
                        <FieldContainer>
                            <Controller
                                control={control}
                                name="specificIndustries"
                                render={({ field }) => (
                                    <StyledFormControl fullWidth>
                                        <InputLabel>Use this space to specify specific industries...</InputLabel>
                                        <OutlinedInput {...field} multiline rows={3} />
                                        <FormHelperText>
                                            Add any specific industries or sectors not listed above
                                        </FormHelperText>
                                    </StyledFormControl>
                                )}
                            />
                        </FieldContainer>
                    </Grid>

                    <Grid item xs={12}>
                        <FieldContainer>
                            <Typography variant="subtitle1" sx={{ 
                                fontWeight: 600, 
                                color: 'text.primary', 
                                mb: 2,
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1 
                            }}>
                                <RoleIcon size={20} />
                                What type of role are you most interested in?
                            </Typography>
                            <FormGroup>
                                <Grid container spacing={2}>
                                    {roles.map((role) => (
                                        <Grid item key={role} xs={12} sm={6}>
                                            <Controller
                                                name="interestedRoles"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={
                                                            <StyledCheckbox 
                                                                checked={field.value?.includes(role)} 
                                                                onChange={(e) => {
                                                                    const newValues = e.target.checked
                                                                        ? [...(field.value || []), role]
                                                                        : field.value?.filter(v => v !== role);
                                                                    field.onChange(newValues);
                                                                }} 
                                                            />
                                                        }
                                                        label={role}
                                                        sx={{ 
                                                            '& .MuiFormControlLabel-label': { 
                                                                fontSize: '0.9rem',
                                                                fontWeight: 500
                                                            } 
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </FormGroup>
                        </FieldContainer>
                    </Grid>

                    <Grid item xs={12}>
                        <FieldContainer>
                            <Typography variant="subtitle1" sx={{ 
                                fontWeight: 600, 
                                color: 'text.primary', 
                                mb: 2,
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1 
                            }}>
                                <PnlIcon size={20} />
                                Have you had full P&L responsibility in a prior role?
                            </Typography>
                            <Controller
                                control={control}
                                name="pnlResponsibility"
                                render={({ field }) => (
                                    <RadioGroup {...field} sx={{ ml: 0 }}>
                                        {pnlResponsibilities.map(resp => (
                                            <FormControlLabel 
                                                key={resp} 
                                                value={resp} 
                                                control={<StyledRadio />} 
                                                label={resp}
                                                sx={{ 
                                                    mb: 1,
                                                    '& .MuiFormControlLabel-label': { 
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500
                                                    } 
                                                }}
                                            />
                                        ))}
                                    </RadioGroup>
                                )}
                            />
                        </FieldContainer>
                    </Grid>

                    <Grid item xs={12}>
                        <FieldContainer>
                            <Controller
                                control={control}
                                name="pnlDescription"
                                render={({ field }) => (
                                    <StyledFormControl fullWidth>
                                        <InputLabel>Please describe the size and scope of that responsibility...</InputLabel>
                                        <OutlinedInput {...field} multiline rows={3} />
                                        <FormHelperText>
                                            Include details about budget size, team size, and business impact
                                        </FormHelperText>
                                    </StyledFormControl>
                                )}
                            />
                        </FieldContainer>
                    </Grid>

                    <Grid item xs={12}>
                        <FieldContainer>
                            <Typography variant="subtitle1" sx={{ 
                                fontWeight: 600, 
                                color: 'text.primary', 
                                mb: 2,
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1 
                            }}>
                                <CompanyIcon size={20} />
                                What size company are you best suited to lead?
                            </Typography>
                            <Controller
                                control={control}
                                name="companySize"
                                render={({ field }) => (
                                    <RadioGroup {...field} sx={{ ml: 0 }}>
                                        {companySizes.map(size => (
                                            <FormControlLabel 
                                                key={size} 
                                                value={size} 
                                                control={<StyledRadio />} 
                                                label={size}
                                                sx={{ 
                                                    mb: 1,
                                                    '& .MuiFormControlLabel-label': { 
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500
                                                    } 
                                                }}
                                            />
                                        ))}
                                    </RadioGroup>
                                )}
                            />
                        </FieldContainer>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                    <StyledButton 
                        onClick={onBack}
                        variant="outlined"
                        startIcon={<ArrowLeftIcon size={20} />}
                        sx={{
                            borderColor: '#6B7280',
                            color: '#6B7280',
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