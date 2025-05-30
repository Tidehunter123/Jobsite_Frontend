"use client";
import React, { useEffect, useState, useContext } from 'react';
import { Box, Container, Grid, CircularProgress, Typography } from '@mui/material';
import { JobSidebar } from './components/JobSidebar';
import { JobHeader } from './components/JobHeader';
import { CongratsBox } from './components/CongratsBox';
import { JobDetails } from './components/JobDetails';
import EditJobForm from './components/EditJobForm';
import Airtable, { FieldSet } from 'airtable';
import { config } from '@/config';
import { UserContext } from '@/contexts/auth/user-context';

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

interface AirtableJobFields extends FieldSet {
  'Job Title': string;
  'Updated_at': string;
  'Email': string;
  'Status': string;
  'Ideal Start Date': string;
  'Anticipated end date': string;
  'Remote/In person': string;
  'Hours Per Week': number;
  'Paid/Unpaid': string;
  'Job Type': string[];
  'Job Description': string;
  'ATS': string;
  'External Link': string;
  'Client Contact Email': string;
  'Name of Poster': string;
  'Show/Hide': string;
  'Role': string;
}

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

export default function JobsPage() {
  const [tabValue, setTabValue] = React.useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error('useUser must be used within a UserProvider');
  }

  const { user } = userContext;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const records = await base('Job Postings')
          .select({
            filterByFormula: `{Email} = '${user?.email}'`,
            sort: [{ field: 'Updated_at', direction: 'desc' }]
          })
          .all();

        if (records.length > 0) {
          const jobsData = records.map(record => {
            const fields = record.fields as unknown as AirtableJobFields;
            return {
              id: record.id,
              jobTitle: fields['Job Title'] || '',
              updatedAt: fields['Updated_at'] ? new Date(fields['Updated_at'] as string).toLocaleDateString() : '',
              status: fields['Status'] || '',
              startDate: fields['Ideal Start Date'] || '',
              endDate: fields['Anticipated end date'] || '',
              workType: fields['Remote/In person'] || '',
              hoursPerWeek: fields['Hours Per Week'] || 0,
              pay: fields['Paid/Unpaid'] || '',
              jobType: fields['Job Type'] || [],
              jobDescription: fields['Job Description'] || '',
              applicationMethod: fields['ATS'] || '',
              externalLink: fields['External Link'] || '',
              contactEmail: fields['Client Contact Email'] || '',
              posterName: fields['Name of Poster'] || '',
              showHide: fields['Show/Hide'] || '',
              role: fields['Role'] || ''
            };
          });
          setJobs(jobsData);
          setSelectedJob(jobsData[0]); // Set the first (most recent) job as selected
          console.log(jobsData,"jobsData");
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchJobs();
    }
  }, [user?.email]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!jobs.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>No jobs found</Typography>
      </Box>
    );
  }

  if (!selectedJob) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>No job selected</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <JobSidebar
              jobs={jobs}
              selectedJob={selectedJob}
              onJobSelect={handleJobSelect}
            />
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <JobHeader
              jobId={selectedJob.id}
              jobTitle={selectedJob.jobTitle}
              tabValue={tabValue}
              showHide={selectedJob.showHide}
              onTabChange={handleTabChange}
            />

            <CongratsBox />

            {tabValue === 0 ? (
              <JobDetails
                jobTitle={selectedJob.jobTitle}
                workType={selectedJob.workType}
                hoursPerWeek={selectedJob.hoursPerWeek}
                pay={selectedJob.pay}
                jobType={selectedJob.jobType}
                jobDescription={selectedJob.jobDescription}
                applicationMethod={selectedJob.applicationMethod}
                externalLink={selectedJob.externalLink}
                contactEmail={selectedJob.contactEmail}
                posterName={selectedJob.posterName}
                updatedAt={selectedJob.updatedAt}
                role={selectedJob.role}
                startDate={selectedJob.startDate}
                endDate={selectedJob.endDate}
              />
            ) : (
              <EditJobForm job={selectedJob} />
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
