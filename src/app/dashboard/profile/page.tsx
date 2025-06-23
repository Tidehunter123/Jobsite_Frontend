'use client';

import * as React from 'react';
import { useContext, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import { 
  Check as CheckIcon, 
  User as UserIcon,
  GraduationCap as EducationIcon,
  FileText as ResumeIcon,
  Briefcase as JobIcon,
  MapPin as GeographyIcon,
  CurrencyEth as CompensationIcon,
  VideoCamera as IntroIcon,
  ArrowRight as ArrowRightIcon
} from '@phosphor-icons/react/dist/ssr';
import Airtable from 'airtable';

import { config } from '@/config';
import { UserContext } from '@/contexts/auth/user-context';
import { GeneralStep } from '@/components/dashboard/profile/GeneralStep';
import { EducationStep } from '@/components/dashboard/profile/EducationStep';
import { ResumeStep } from '@/components/dashboard/profile/ResumeStep';
import { JobPreferencesStep } from '@/components/dashboard/profile/JobPreferencesStep';
import { GeographyStep } from '@/components/dashboard/profile/GeographyStep';
import { CompensationStep } from '@/components/dashboard/profile/CompensationStep';
import { IntroStep } from '@/components/dashboard/profile/IntroStep';

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

// Define the completion criteria for each section
const sectionCompletionCriteria = {
  general: (data: any) => {
    return data['First Name'] && data['Last Name'] && data['Email'] && data['Phone'] && data['City'] && data['State'];
  },
  education: (data: any) => {
    return data['Undergraduate School'] || data['MBA (Optional)'] || data['Grad School - Other than MBA (Optional)'];
  },
  resume: (data: any) => {
    return data['Resume'] || data['LinkedIn URL'] || data['Are you actively looking for a new Role?'];
  },
  jobPreferences: (data: any) => {
    return data['What industries are you most interested in operating in?'] || data['Use this space to specify specific industries that you have experience in / are interested in working in for your new role'] || data['What type of role are you most interested in?'] || data['Have you had full P&L responsibility in a prior role?'] || data['Please describe the size and scope of that responsibility (e.g. team size, revenue, EBITDA).'] || data['What size company are you best suited to lead?'];
  },
  geography: (data: any) => {
    return data['Where regions are you open to working?'] || data['Any specific cities you\'re targeting?'] || data['Are you open to relocation for the right opportunity?'];
  },
  compensation: (data: any) => {
    return data['What is your ideal compensation range (base + bonus)?'] || data['Anything else we should know about you and your role preferences?'];
  },
  intro: (data: any) => {
    return data['Video Interview URL']; // This will always be false for now since it's coming soon
  },
};

const stepsConfig = [
  { id: 'general', label: 'General', icon: UserIcon, completed: false },
  { id: 'education', label: 'Education', icon: EducationIcon, completed: false },
  { id: 'resume', label: 'Resume & LinkedIn', icon: ResumeIcon, completed: false },
  { id: 'jobPreferences', label: 'Job Preferences', icon: JobIcon, completed: false },
  { id: 'geography', label: 'Geography', icon: GeographyIcon, completed: false },
  { id: 'compensation', label: 'Compensation', icon: CompensationIcon, completed: false },
  { id: 'intro', label: '60-Second Intro', icon: IntroIcon, completed: false },
];

const StyledStepCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'completed',
})<{ active?: boolean; completed?: boolean }>(({ theme, active, completed }) => ({
  padding: theme.spacing(2.5),
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `2px solid ${active ? '#3B82F6' : 'transparent'}`,
  backgroundColor: active 
    ? '#3B82F6' 
    : completed 
    ? theme.palette.success.light + '20'
    : theme.palette.background.paper,
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
    backgroundColor: active 
      ? '#3B82F6' 
      : completed 
      ? theme.palette.success.light + '30'
      : theme.palette.action.hover,
  },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    backgroundColor: active 
      ? theme.palette.primary.contrastText 
      : completed 
      ? theme.palette.success.main 
      : 'transparent',
  },
}));

const StepIconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.main,
  marginRight: theme.spacing(2),
  transition: 'all 0.3s ease',
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

export default function ProfilePage(): React.JSX.Element {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not available. Make sure the component is wrapped in a UserProvider.');
  }
  const { user } = userContext;
  
  const [activeStep, setActiveStep] = React.useState('general');
  const [formData, setFormData] = React.useState({});
  const [userRecordData, setUserRecordData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [completedSections, setCompletedSections] = React.useState<{[key: string]: boolean}>({});

  // Fetch user data from Airtable and determine completed sections
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        const records = await base('Candidate Database')
          .select({
            filterByFormula: `{Login Email} = '${user.email}'`,
            fields: [
              'First Name', 'Last Name', 'Email', 'Phone', 'City', 'State', 'Tell us a little about yourself (Optional)',
              'Undergraduate School', 'MBA (Optional)', 'Grad School - Other than MBA (Optional)',
              'Resume', 'LinkedIn URL', 'Are you actively looking for a new Role?',
              'What industries are you most interested in operating in?', 'Use this space to specify specific industries that you have experience in / are interested in working in for your new role',
              'What type of role are you most interested in?', 'Have you had full P&L responsibility in a prior role?','Please describe the size and scope of that responsibility (e.g. team size, revenue, EBITDA).', 'What size company are you best suited to lead?',
              'Where regions are you open to working?', `Any specific cities you're targeting?`, 'Are you open to relocation for the right opportunity?',
              'What is your ideal compensation range (base + bonus)?', 'Anything else we should know about you and your role preferences?',
              'Video Interview URL'
            ],
          })
          .all();

        if (records && records.length > 0) {
          const userData = records[0].fields;
          setUserRecordData(userData);
          
          // Determine which sections are completed
          const completed: {[key: string]: boolean} = {};
          Object.keys(sectionCompletionCriteria).forEach(sectionId => {
            completed[sectionId] = sectionCompletionCriteria[sectionId as keyof typeof sectionCompletionCriteria](userData);
          });
          
          setCompletedSections(completed);
        } else {
          // No existing data, all sections are incomplete
          const completed: {[key: string]: boolean} = {};
          Object.keys(sectionCompletionCriteria).forEach(sectionId => {
            completed[sectionId] = false;
          });
          setCompletedSections(completed);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set all sections as incomplete on error
        const completed: {[key: string]: boolean} = {};
        Object.keys(sectionCompletionCriteria).forEach(sectionId => {
          completed[sectionId] = false;
        });
        setCompletedSections(completed);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.email]);

  // Function to refresh user data and completion status
  const refreshUserData = async () => {
    if (!user?.email) return;

    try {
      const records = await base('Candidate Database')
        .select({
          filterByFormula: `{Login Email} = '${user.email}'`,
          fields: [
            'First Name', 'Last Name', 'Email', 'Phone', 'City', 'State', 'Tell us a little about yourself (Optional)',
            'Undergraduate School', 'MBA', 'Grad School',
            'Resume URL', 'LinkedIn URL', 'Job Search Status',
            'Interested Industries', 'Interested Roles', 'PNL Responsibility', 'Company Size',
            'Preferred Regions', 'Preferred Cities', 'Relocation Willingness',
            'Compensation Range', 'Other Preferences',
            'Intro Video URL'
          ],
        })
        .all();

      if (records && records.length > 0) {
        const userData = records[0].fields;
        setUserRecordData(userData);
        
        // Determine which sections are completed
        const completed: {[key: string]: boolean} = {};
        Object.keys(sectionCompletionCriteria).forEach(sectionId => {
          completed[sectionId] = sectionCompletionCriteria[sectionId as keyof typeof sectionCompletionCriteria](userData);
        });
        
        setCompletedSections(completed);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const handleStepClick = (stepId: string) => {
    setActiveStep(stepId);
  };

  const handleNext = () => {
    const currentIndex = stepsConfig.findIndex((step) => step.id === activeStep);
    if (currentIndex < stepsConfig.length - 1) {
      setActiveStep(stepsConfig[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = stepsConfig.findIndex((step) => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(stepsConfig[currentIndex - 1].id);
    }
  };
  
  const handleSubmit = () => {
    // In a real app, you would send the formData to your server here
    console.log('Submitting form data:', formData);
    alert('Profile submitted successfully!');
  };

  // Callback to update completion status when a section is completed
  const updateSectionCompletion = (sectionId: string, isCompleted: boolean) => {
    setCompletedSections(prev => ({
      ...prev,
      [sectionId]: isCompleted
    }));
    
    // Refresh user data to ensure we have the latest state
    setTimeout(() => {
      refreshUserData();
    }, 1000); // Small delay to ensure Airtable has updated
  };

  // Update stepsConfig with dynamic completion status
  const dynamicStepsConfig = stepsConfig.map(step => ({
    ...step,
    completed: completedSections[step.id] || false
  }));

  const steps = [
    { id: 'general', label: 'General', component: <GeneralStep onNext={handleNext} onSectionComplete={(completed) => updateSectionCompletion('general', completed)} />, completed: completedSections.general || false },
    { id: 'education', label: 'Education', component: <EducationStep onNext={handleNext} onBack={handleBack} onSectionComplete={(completed) => updateSectionCompletion('education', completed)} />, completed: completedSections.education || false },
    { id: 'resume', label: 'Resume & LinkedIn', component: <ResumeStep onNext={handleNext} onBack={handleBack} onSectionComplete={(completed) => updateSectionCompletion('resume', completed)} />, completed: completedSections.resume || false },
    { id: 'jobPreferences', label: 'Job Preferences', component: <JobPreferencesStep onNext={handleNext} onBack={handleBack} onSectionComplete={(completed) => updateSectionCompletion('jobPreferences', completed)} />, completed: completedSections.jobPreferences || false },
    { id: 'geography', label: 'Geography', component: <GeographyStep onNext={handleNext} onBack={handleBack} onSectionComplete={(completed) => updateSectionCompletion('geography', completed)} />, completed: completedSections.geography || false },
    { id: 'compensation', label: 'Compensation', component: <CompensationStep onNext={handleNext} onBack={handleBack} onSectionComplete={(completed) => updateSectionCompletion('compensation', completed)} />, completed: completedSections.compensation || false },
    { id: 'intro', label: '60-Second Intro (Optional)', component: <IntroStep onBack={handleBack} onSubmit={handleSubmit} onSectionComplete={(completed) => updateSectionCompletion('intro', completed)} />, completed: completedSections.intro || false },
  ];

  const activeStepIndex = steps.findIndex((step) => step.id === activeStep);
  const ActiveComponent = steps[activeStepIndex].component;
  
  const completedSteps = Object.values(completedSections).filter(Boolean).length;
  const progressPercentage = (completedSteps / stepsConfig.length) * 100;

  if (loading) {
    return (
      <Box sx={{ p: 4, backgroundColor: 'grey.50', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6">Loading your profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: 'grey.50', minHeight: '100vh', maxWidth: { xs: '95%', md: '80%' }, alignItems: 'center', margin: 'auto' }}>
      <Grid container spacing={4}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              mb: 1
            }}>
              Complete Your Profile
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Let's build your professional profile to help you find the perfect opportunity
            </Typography>
            
            {/* Progress Section */}
            <ProgressContainer>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Profile Completion
                </Typography>
                <Chip 
                  label={`${completedSteps}/${stepsConfig.length} completed`}
                  variant="outlined"
                  sx={{
                    backgroundColor: '#3B82F6',
                    color: 'white',
                  }}
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: '#3B82F6',
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.round(progressPercentage)}% complete
              </Typography>
            </ProgressContainer>
          </Box>
        </Grid>

        {/* Steps Navigation */}
        <Grid item lg={4} md={4} xs={12}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                Profile Sections
              </Typography>
              <Stack spacing={2}>
                {dynamicStepsConfig.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <StyledStepCard
                      key={step.id}
                      active={activeStep === step.id}
                      completed={step.completed}
                      onClick={() => handleStepClick(step.id)}
                      elevation={activeStep === step.id ? 4 : 1}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <StepIconWrapper>
                          {step.completed ? (
                            <CheckIcon size={20} weight="bold" color="#3B82F6" />
                          ) : (
                            <IconComponent size={20} weight="bold" color="#3B82F6" />
                          )}
                        </StepIconWrapper>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {step.label}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Step {index + 1}
                          </Typography>
                        </Box>
                      </Box>
                      {activeStep === step.id && (
                        <ArrowRightIcon size={20} weight="bold" />
                      )}
                    </StyledStepCard>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content Area */}
        <Grid item lg={8} md={8} xs={12}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'divider',
            minHeight: '600px'
          }}>
            <CardContent sx={{ p: 4 }}>
              {ActiveComponent}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
