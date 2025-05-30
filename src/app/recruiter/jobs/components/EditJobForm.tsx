import React from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { toast } from '@/components/core/toaster';

import 'react-quill/dist/quill.snow.css';

import Airtable, { FieldSet } from 'airtable';

import { config } from '@/config';
import { TextEditor } from '@/components/core/text-editor/text-editor';

interface EditJobFormProps {
  job: {
    id: string;
    jobTitle: string;
    updatedAt: string;
    status: string;
    startDate: string;
    endDate: string;
    workType: string;
    hoursPerWeek: number;
    pay: string;
    jobType: string[];
    jobDescription: string;
    applicationMethod: string;
    externalLink: string;
    contactEmail: string;
    posterName: string;
    role: string;
  };
}

const applicationMethodOptions = [
  {
    label: 'Use Our Internal Applicant Tracking System',
    value: 'Internal ATS',
    color: '#c7d2fe', // light blue
  },
  {
    label: 'Input External Link',
    value: 'External Link',
    color: '#bae6fd', // light cyan
  },
  {
    label: 'Receive Email From Candidates',
    value: 'Email',
    color: '#bbf7d0', // light green
  },
];

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

const EditJobForm: React.FC<EditJobFormProps> = ({ job }) => {
  const [jobTitle, setJobTitle] = React.useState(job.jobTitle);
  const [description, setDescription] = React.useState(`${job.jobDescription}`);
  const [workType, setWorkType] = React.useState(job.workType);
  const [hoursPerWeek, setHoursPerWeek] = React.useState(job.hoursPerWeek.toString());
  const [pay, setPay] = React.useState(job.pay);
  const [role, setRole] = React.useState(job.role);
  const [contactEmail, setContactEmail] = React.useState(job.contactEmail);
  const [externalLink, setExternalLink] = React.useState(job.externalLink);
  const [jobTypes, setJobTypes] = React.useState<string[]>(job.jobType);
  const [newJobType, setNewJobType] = React.useState('');
  const [applicationMethod, setApplicationMethod] = React.useState<string>(
    Array.isArray(job.applicationMethod) ? job.applicationMethod[0] : job.applicationMethod
  );

  const handleSave = () => {
    // Placeholder for save logic
    console.log(
      jobTitle,
      description,
      workType,
      hoursPerWeek,
      pay,
      role,
      contactEmail,
      externalLink,
      applicationMethod,
      jobTypes,
      newJobType
    );

    base('Job Postings').update(job.id, {
      'Job Title': jobTitle,
      'Job Description': description,
      'Remote/In person': workType,
      'Hours Per Week': Number(hoursPerWeek),
      'Paid/Unpaid': pay, 
      'Role': role,
      'Client Contact Email': contactEmail,
      'External Link': externalLink,
      'Job Type': jobTypes,
      'ATS': applicationMethod,
    }, (err, record) => { 
      if (err) {
        toast.error('Error updating job:', err);
      } else {
        toast.success('Job updated successfully');
        window.location.reload();
      }
    }); 
  };

  const handleMethodChange = (value: string) => {
    setApplicationMethod(value);
  };

  const handleAddJobType = () => {
    if (newJobType.trim() && !jobTypes.includes(newJobType.trim())) {
      setJobTypes([...jobTypes, newJobType.trim()]);
      setNewJobType('');
    }
  };

  const handleRemoveJobType = (typeToRemove: string) => {
    setJobTypes(jobTypes.filter((type) => type !== typeToRemove));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddJobType();
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={4}>
          {/* Basic Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, color: '#3B82F6' }}>
              Basic Information
            </Typography>
            <TextField
              label="Job Title"
              fullWidth
              margin="normal"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Description
            </Typography>
            <TextEditor
              content={description}
              onUpdate={({ editor }) => {
                setDescription(editor.getHTML());
              }}
              placeholder="Write something"
            />
          </Grid>

          {/* Job Details Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, color: '#3B82F6' }}>
              Job Details
            </Typography>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Work Type</InputLabel>
                <Select value={workType} label="Work Type" onChange={(e) => setWorkType(e.target.value)}>
                  <MenuItem value="Remote">Remote</MenuItem>
                  <MenuItem value="In person">In person</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Hours Per Week"
                fullWidth
                type="number"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Pay</InputLabel>
                <Select value={pay} label="Pay" onChange={(e) => setPay(e.target.value)}>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>
              {/* <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Job Types
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {jobTypes.map((type, index) => (
                      <Chip
                        key={index}
                        label={type}
                        color="primary"
                        variant="outlined"
                        onDelete={() => handleRemoveJobType(type)}
                        deleteIcon={<FiX />}
                      />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      placeholder="Add job type"
                      value={newJobType}
                      onChange={(e) => setNewJobType(e.target.value)}
                      onKeyPress={handleKeyPress}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      color="primary"
                      onClick={handleAddJobType}
                      disabled={!newJobType.trim()}
                    >
                      <FiPlus />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box> */}
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                  <MenuItem value="Internship">Internship</MenuItem>
                  <MenuItem value="Full-time">Full-Time</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          {/* Contact Information Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, color: '#3B82F6' }}>
              Contact Information
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Stack spacing={1}>
                  <FormControl fullWidth>
                    <InputLabel>Application Method</InputLabel>
                    <Select 
                      value={applicationMethod} 
                      label="Application Method" 
                      onChange={(e) => handleMethodChange(e.target.value)}
                    >
                      {applicationMethodOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
              <TextField
                label="Contact Email"
                fullWidth
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                disabled={!applicationMethod.includes('Email')}
              />
              <TextField
                label="External Link"
                fullWidth
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                disabled={!applicationMethod.includes('External Link')}
              />
            </Stack>
          </Grid>

          {/* Dates Section */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, color: '#3B82F6' }}>
              Timeline
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField label="Start Date" fullWidth value={job.startDate} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="End Date" fullWidth value={job.endDate} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Last Updated" fullWidth value={job.updatedAt} disabled />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onSubmit={handleSave}
            size="large"
            onClick={handleSave}
            sx={{
              backgroundColor: '#3B82F6',
              color: '#fff',
              px: 4,
              '&:hover': {
                backgroundColor: '#2563EB',
              },
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditJobForm;
