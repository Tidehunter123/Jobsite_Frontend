'use client'

import React, { ReactNode, ReactElement, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Chip,
  Stack,
  Link,
  Divider,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";
import { FaLinkedin, FaRegFilePdf, FaUserTie, FaGraduationCap, FaUserCheck } from "react-icons/fa";
import { MdEmail, MdPhone, MdOutlineInfo, MdOutlineStar, MdOutlineWorkOutline } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import Airtable, { Attachment } from "airtable";
import { config } from "@/config";

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode | string;
};

type ContactChipProps = {
  icon: ReactNode;
  label: string;
  sx?: any;
  onClick?: () => void;
};

interface CandidateData {
  id: string;
  name: string;
  headshot?: Attachment[];
  candidateType: string;
  university: string;
  reviewRecommendation: string;
  client: string;
  orderId?: string;
  status?: string;
  candidateLink?: string;
  clientLink?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  resume?: Attachment[];
  videoInterview?: string;
  major?: string;
  graduationYear?: string;
  springCommitments?: string;
  summerCommitments?: string;
  about?: string;
  evaluation?: string;
  qualifications?: string[];
  videoInterviewUrl?: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: '100%' }}>
      <Box sx={{ color: '#3B82F6', fontSize: 20, minWidth: 24, display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          minWidth: 160, 
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, pl: 1 }}>
        {typeof value === 'string' ? (
          <Typography variant="body2" sx={{ color: 'text.primary' }}>{value}</Typography>
        ) : value}
      </Box>
    </Stack>
  );
}

function ContactChip({ icon, label, sx, onClick }: ContactChipProps) {
  const validIcon = React.isValidElement(icon) ? icon : undefined;
  return (
    <Chip
      icon={validIcon}
      label={label}
      variant="outlined"
      sx={{
        fontSize: 16,
        px: 2,
        py: 1,
        bgcolor: 'background.paper',
        boxShadow: 1,
        borderRadius: 2,
        '& .MuiChip-icon': { fontSize: 22 },
        ...sx,
      }}
      onClick={onClick}
    />
  );
}

export default function CandidateDetailPage() {
  const searchParams = useSearchParams();
  const candidateId = searchParams?.get('candidateId');
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log(candidate, "candidate");
  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!candidateId) {
        setError("No candidate ID provided");
        setLoading(false);
        return;
      }

      try {
        const record = await base('Candidate-Client Profile')
          .find(candidateId);
        console.log(record, "record");
        if (record) {
          setCandidate({
            id: record.id,
            name: record.get('Name') as string,
            headshot: record.get('Headshot') as Attachment[],
            candidateType: record.get('Candidate Type') as string,
            university: record.get('University') as string,
            reviewRecommendation: record.get('Reviewer Recommendation Lookup') as string,
            client: record.get('Company Name') as string,
            orderId: record.get('Order ID') as string,
            status: record.get('Status') as string,
            candidateLink: record.get('Candidate') as string,
            clientLink: record.get('Client') as string,
            email: record.get('Email') as string,
            phone: record.get('Phone') as string,
            linkedin: record.get('LinkedIn') as string,
            resume: record.get('Resume') as Attachment[],
            videoInterview: record.get('Video Interview') as string,
            major: record.get('Major') as string,
            graduationYear: record.get('Graduation Year') as string,
            springCommitments: record.get('Spring Commitments') as string,
            summerCommitments: record.get('Summer Commitments') as string,
            about: record.get('About Yourself') as string,
            evaluation: record.get('Overall Evaluation (to client)') as string,
            qualifications: record.get('Candidate Qualities') as string[],
            videoInterviewUrl: record.get('Video Interview URL') as string,
          });
        }
      } catch (err) {
        console.error('Error fetching candidate data:', err);
        setError("Failed to fetch candidate data");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [candidateId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !candidate) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || "Candidate not found"}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2, md: 6 } }}>
      <Card
        sx={{
          maxWidth: 800,
          mx: 'auto',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          p: { xs: 3, sm: 5 },
          overflow: 'visible',
          bgcolor: 'background.paper',
          mt: 5,
        }}
      >
        {/* Profile Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            mb: 4,
            mt: -12,
          }}
        >
          <Avatar
            src={candidate.headshot?.[0]?.url}
            alt={candidate.name}
            sx={{
              width: 120,
              height: 120,
              border: `4px solid #3B82F6`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              mb: 2,
              bgcolor: 'background.paper',
            }}
          />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {candidate.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            {candidate.candidateType} @ {candidate.university}
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center">
            {candidate.qualifications?.map((qualification) => (
              <Chip 
                icon={<FaUserCheck />} 
                key={qualification} 
                label={qualification} 
                variant="outlined" 
                
                sx={{
                  color:"#3B82F6",
                  borderColor: "#3B82F6",
                  mb: 1,
                  '& .MuiChip-icon': { fontSize: 18 },
                  '& .MuiChip-label': { fontSize: 14, fontWeight: 500 }
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Info Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'grey.50' }}>
              <Stack spacing={2.5}>
                <InfoRow icon={<FaGraduationCap />} label="Major" value={candidate.major || '-'} />
                <InfoRow icon={<MdOutlineWorkOutline />} label="Graduation Year" value={candidate.graduationYear || '-'} />
                <InfoRow icon={<MdOutlineInfo />} label="Candidate Type" value={candidate.candidateType || '-'} />
                <InfoRow 
                  icon={<MdOutlineInfo />} 
                  label="Available in Spring?" 
                  value={
                    <Chip 
                      label="Available Spring" 
                      color="success" 
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                  } 
                />
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'grey.50' }}>
              <Stack spacing={2.5}>
                <InfoRow icon={<MdOutlineInfo />} label="Spring Commitments" value={candidate.springCommitments || '-'} />
                <InfoRow icon={<MdOutlineInfo />} label="Summer Commitments" value={candidate.summerCommitments || '-'} />
                <InfoRow icon={<MdOutlineInfo />} label="About yourself" value={candidate.about || '-'} />
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Action Buttons */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="center" 
          alignItems="center" 
          mb={4}
        >
          {candidate.resume && (
            <Button
              startIcon={<FaRegFilePdf />}
              component={Link}
              href={candidate.resume?.[0]?.url}
              target="_blank"
              rel="noopener"
              sx={{ 
                bgcolor:"#3B82F6",
                color:"#fff",
                minWidth: 200, 
                fontWeight: 600, 
                boxShadow: 2,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              Resume
            </Button>
          )}
          {candidate.linkedin && (
            <Button
              variant="outlined"
              startIcon={<FaLinkedin />}
              component={Link}
              href={candidate.linkedin}
              target="_blank"
              rel="noopener"
              sx={{ 
                color:"#3B82F6",
                borderColor:"#3B82F6",
                minWidth: 200, 
                fontWeight: 600, 
                boxShadow: 1,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  bgcolor:"#3B82F6",
                  color:"#fff",
                  boxShadow: 2
                }
              }}
            >
              LinkedIn
            </Button>
          )}
          {candidate.videoInterviewUrl && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<MdOutlineInfo />}
              component={Link}
              href={candidate.videoInterviewUrl}
              target="_blank"
              rel="noopener"
              sx={{ 
                minWidth: 200, 
                fontWeight: 600, 
                boxShadow: 1,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  boxShadow: 2
                }
              }}
            >
              Video Interview
            </Button>
          )}
        </Stack>

        <Divider sx={{ my: 4 }} />

        {/* Evaluation Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'grey.50', 
            p: 4, 
            borderRadius: 3, 
            mb: 4,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Overall Evaluation to Client
          </Typography>
          <Typography color="text.secondary" fontSize={16} sx={{ lineHeight: 1.7 }}>
            {candidate.evaluation || 'No evaluation available.'}
          </Typography>
        </Paper>

        {/* Contact Section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems="center"
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          {candidate.phone && (
            <ContactChip 
              icon={<MdPhone />} 
              label={candidate.phone}
              onClick={() => window.location.href = `tel:${candidate.phone}`}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s'
                }
              }}
            />
          )}
          {candidate.email && (
            <ContactChip 
              icon={<MdEmail />} 
              label={candidate.email}
              onClick={() => window.location.href = `mailto:${candidate.email}`}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s'
                }
              }}
            />
          )}
        </Stack>
      </Card>
    </Box>
  );
}
