import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  InputBase,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import { MdAdd } from 'react-icons/md';
import { useRouter } from 'next/navigation';

interface Job {
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
  showHide: string;
  role: string;
}

interface JobSidebarProps {
  jobs: Job[];
  selectedJob: Job | null;
  onJobSelect: (job: Job) => void;
}

export const JobSidebar: React.FC<JobSidebarProps> = ({ jobs, selectedJob, onJobSelect }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'drafts'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const activeJobs = jobs.filter(job => job.status === 'Approved');
  const draftJobs = jobs.filter(job => job.status === 'Not approved');
  
  const displayedJobs = activeTab === 'active' ? activeJobs : draftJobs;

  const filteredJobs = displayedJobs.filter(job =>
    job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Jobs</Typography>
          <Button
            startIcon={<MdAdd />}
            sx={{
              backgroundColor: '#3B82F6',
              color: 'white',
              '&:hover': {
                backgroundColor: '#3B82F6',
              },
            }}
            size="medium"
            onClick={() => router.push('/recruiter/post-job')}
          >
            Post Job
          </Button>
        </Box>
        
        <Paper
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', mb: 2 }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search by job"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Typography
            variant="subtitle2"
            onClick={() => setActiveTab('active')}
            sx={{
              color: activeTab === 'active' ? '#3B82F6' : 'text.secondary',
              borderBottom: '2px solid',
              borderColor: activeTab === 'active' ? '#3B82F6' : 'transparent',
              pb: 0.5,
              cursor: 'pointer',
              '&:hover': {
                color: '#3B82F6',
              },
            }}
          >
            Active ({activeJobs.length})
          </Typography>
          <Typography 
            variant="subtitle2" 
            onClick={() => setActiveTab('drafts')}
            sx={{
              color: activeTab === 'drafts' ? '#3B82F6' : 'text.secondary',
              borderBottom: '2px solid',
              borderColor: activeTab === 'drafts' ? '#3B82F6' : 'transparent',
              pb: 0.5,
              cursor: 'pointer',
              '&:hover': {
                color: '#3B82F6',
              },
            }}
          >
            Drafts ({draftJobs.length})
          </Typography>
        </Box>

        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {filteredJobs.map((job) => (
            <React.Fragment key={job.id}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={selectedJob?.id === job.id}
                  onClick={() => onJobSelect(job)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.lighter',
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        color={selectedJob?.id === job.id ? '#3B82F6' : 'text.primary'}
                        fontWeight={selectedJob?.id === job.id ? 600 : 500}
                        sx={{
                          fontSize: '0.95rem',
                          letterSpacing: '0.01em',
                          mb: 0.5
                        }}
                      >
                        {job.jobTitle}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            mb: 0.5
                          }}
                        >
                          {job.workType}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            fontSize: '0.75rem',
                            opacity: 0.8
                          }}
                        >
                          Last edit: {job.updatedAt}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <Divider variant="inset" component="li" sx={{ opacity: 0.6 }} />
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}; 