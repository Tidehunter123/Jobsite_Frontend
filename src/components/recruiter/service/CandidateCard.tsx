import React from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { FaGraduationCap } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { CandidateProfile } from "../../../utils/airtable";
import Airtable from "airtable";
import { config } from "@/config";
import { toast } from "@/components/core/toaster";
import { useRouter } from "next/navigation";
const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

type RecommendationType = 'Top Choice' | 'Strong Candidate' | 'Good Candidate';

type ColorConfig = {
  color: string;
  bgColor: string;
  hoverColor: string;
  hoverBgColor: string;
};

const recommendationColors: Record<RecommendationType, ColorConfig> = {
  'Good Candidate': {
    color: '#2E7D32', // Green
    bgColor: '#E8F5E9',
    hoverColor: '#1B5E20',
    hoverBgColor: '#C8E6C9'
  },
  'Strong Candidate': {
    color: '#1976D2', // Blue
    bgColor: '#E3F2FD',
    hoverColor: '#1565C0',
    hoverBgColor: '#BBDEFB'
  },
  'Top Choice': {
    color: '#ED6C02', // Orange
    bgColor: '#FFF3E0',
    hoverColor: '#E65100',
    hoverBgColor: '#FFE0B2'
  }
};

export function CandidateCard({ candidate, expanded, onExpand, onSetupInterview }: { 
  candidate: CandidateProfile, 
  expanded: boolean, 
  onExpand: () => void, 
  onSetupInterview: () => void 
}) {
  const router = useRouter();
  const headshotUrl = candidate.headshot?.[0]?.thumbnails?.full?.url || candidate.headshot?.[0]?.url;
  const hasInterview = candidate.status === 'Interview';

  const handleOpenProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/recruiter/service/detail?candidateId=${candidate.candidateLink}`);
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    base('Candidate-Client Profile').update(candidate.id, {
      'Show/Hide': 'Hide'
    }, (err, record) => {
      if (err) {
        console.error('Error updating candidate status:', err);
        toast.error('Failed to update candidate status');
      } else {
        console.log('Candidate status updated successfully:', record);
        toast.success('Candidate declined successfully');
        window.location.reload();
      }
    });
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        border: expanded ? 2 : 0,
        borderColor: expanded ? 'primary.main' : 'transparent',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {hasInterview && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: -48,
            width: 180,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#3B82F6',
            color: '#fff',
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: 1,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(67, 233, 123, 0.15)',
            transform: 'rotate(-25deg)',
            zIndex: 10,
            border: '2px solid #fff',
            textShadow: '0 1px 4px rgba(0,0,0,0.08)',
            p: 0,
            m: 0,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          Interview
        </Box>
      )}
      <CardContent sx={{ p: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              opacity: 0.9
            }
          }} 
          onClick={onExpand}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {headshotUrl ? (
              <Avatar 
                src={headshotUrl} 
                alt={candidate.name} 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  mr: 2.5,
                  border: '3px solid #fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  mr: 2.5,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem',
                  border: '3px solid #fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {candidate.name.charAt(0)}
              </Avatar>
            )}
            <Box>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ 
                  fontSize: '1.25rem',
                  mb: 0.5,
                  color: 'text.primary'
                }}
              >
                {candidate.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ 
                    mr: 1, 
                    fontWeight: 600, 
                    fontSize: 13, 
                    borderRadius: 2, 
                    px: 1.5, 
                    py: 0.2,
                    borderColor: recommendationColors[candidate.reviewRecommendation as RecommendationType]?.color || 'success.main',
                    color: recommendationColors[candidate.reviewRecommendation as RecommendationType]?.color || 'success.main',
                    bgcolor: recommendationColors[candidate.reviewRecommendation as RecommendationType]?.bgColor || 'transparent',
                    '&:hover': {
                      borderColor: recommendationColors[candidate.reviewRecommendation as RecommendationType]?.hoverColor || 'success.dark',
                      bgcolor: recommendationColors[candidate.reviewRecommendation as RecommendationType]?.hoverBgColor || 'success.light',
                      color: recommendationColors[candidate.reviewRecommendation as RecommendationType]?.hoverColor || 'success.dark'
                    }
                  }}
                >
                  {candidate.reviewRecommendation}
                </Button>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, ml: 4 }}>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ 
                mr: 2, 
                fontWeight: 500, 
                fontSize: 14, 
                borderRadius: 2, 
                px: 2, 
                py: 0.2, 
                bgcolor: 'rgba(0,0,0,0.02)',
                color: '#3B82F6',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.04)',
                  borderColor: 'text.secondary'
                }
              }}
            >
              {candidate.candidateType}
            </Button>
            <Typography 
              variant="body1" 
              fontWeight={500} 
              sx={{ 
                mr: 4,
                color: 'text.secondary'
              }}
            >
              {candidate.university}
            </Typography>
          </Box>
          <Button 
            onClick={handleOpenProfile}
            sx={{ 
              bgcolor: '#3B82F6', 
              color: '#fff', 
              borderRadius: 2, 
              fontWeight: 600, 
              fontSize: 15, 
              px: 3, 
              py: 1.2, 
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': { 
                bgcolor: '#3B82F6',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(79, 209, 197, 0.3)'
              }
            }} 
          >
            View Profile
          </Button>
        </Box>

        {expanded && (
          <Box 
            sx={{ 
              mt: 3,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'divider',
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            {candidate.university && (
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1.5} 
                sx={{ 
                  mb: 1.5,
                  color: 'text.secondary'
                }}
              >
                <FaGraduationCap size={20} style={{ opacity: 0.7 }} />
                <Typography variant="body2">
                  {candidate.university}
                </Typography>
              </Stack>
            )}
            {candidate.reviewRecommendation && (
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1.5} 
                sx={{ 
                  mb: 2,
                  color: 'text.secondary'
                }}
              >
                <MdLocationOn size={20} style={{ opacity: 0.7 }} />
                <Typography variant="body2">
                  {candidate.reviewRecommendation}
                </Typography>
              </Stack>
            )}
            <Stack 
              direction="row" 
              spacing={2} 
              sx={{ 
                mt: 3,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Button 
                sx={{
                  bgcolor: "#3B82F6",
                  color: "#fff",
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                  '&:hover': {
                    bgcolor: "#3B82F6",
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)'
                  }
                }}
                onClick={onSetupInterview}
              >
                Setup Interview
              </Button>
              <Button 
                onClick={handleDecline}
                variant="outlined" 
                color="inherit"
                sx={{
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.04)',
                    borderColor: 'text.secondary'
                  }
                }}
              >
                Decline
              </Button>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 