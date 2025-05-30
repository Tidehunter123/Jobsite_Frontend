import * as React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Briefcase, Building, GraduationCap, Users } from '@phosphor-icons/react';

interface RoleSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (roleType: string, interestArea: string) => void;
}

export function RoleSelectionModal({ open, onClose, onComplete }: RoleSelectionModalProps) {
  const theme = useTheme();
  const [roleType, setRoleType] = React.useState<string>('');
  const [interestArea, setInterestArea] = React.useState<string>('');

  const handleSubmit = () => {
    if (roleType && interestArea) {
      onComplete(roleType, interestArea);
    }
  };

  const RoleOption = ({
    value,
    label,
    icon,
    selected,
  }: {
    value: string;
    label: string;
    icon: React.ReactNode;
    selected: boolean;
  }) => (
    <Paper
      elevation={selected ? 4 : 1}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: '2px solid',
        borderColor: selected ? '#3B82F6' : 'transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
        backgroundColor: selected ? 'primary.50' : 'background.paper',
      }}
      onClick={() => setRoleType(value)}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderColor: selected ? '#3B82F6' : 'transparent',
            borderRadius: '50%',
            backgroundColor: selected ? '#3B82F6' : 'grey.100',
            color: selected ? 'white' : 'grey.700',
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" fontWeight={selected ? 600 : 400}>
          {label}
        </Typography>
      </Stack>
    </Paper>
  );

  const InterestOption = ({
    value,
    label,
    icon,
    selected,
  }: {
    value: string;
    label: string;
    icon: React.ReactNode;
    selected: boolean;
  }) => (
    <Paper
      elevation={selected ? 4 : 1}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: '2px solid',
        borderColor: selected ? '#3B82F6' : 'transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
        backgroundColor: selected ? 'primary.50' : 'background.paper',
      }}
      onClick={() => setInterestArea(value)}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: selected ? '#3B82F6' : 'grey.100',
            color: selected ? 'white' : 'grey.700',
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" fontWeight={selected ? 600 : 400}>
          {label}
        </Typography>
      </Stack>
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h4" fontWeight="600" gutterBottom>
          Welcome to Deal Team Jobs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Let's get to know you better. Please select your preferences below.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={4} sx={{ mt: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Which of the following are you exploring?
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <RoleOption
                value="internship"
                label="Internship"
                icon={<GraduationCap size={24} />}
                selected={roleType === 'internship'}
              />
              <RoleOption
                value="fulltime"
                label="Full Time Role"
                icon={<Briefcase size={24} />}
                selected={roleType === 'fulltime'}
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Which roles are you interested in?
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <InterestOption
                value="investment"
                label="Investment Team"
                icon={<Users size={24} />}
                selected={interestArea === 'investment'}
              />
              <InterestOption
                value="operations"
                label="Portfolio Company Operations"
                icon={<Building size={24} />}
                selected={interestArea === 'operations'}
              />
              <InterestOption value="both" label="Both" icon={<Users size={24} />} selected={interestArea === 'both'} />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#3B82F6',
            color: '#3B82F6',
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            '&:hover': {
              borderColor: '#3B82F6',
              color: '#3B82F6',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!roleType || !interestArea}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            backgroundColor: '#3B82F6',
            color: 'white',
            '&:hover': {
              backgroundColor: '#3B82F6',
              color: 'white',
            },
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
