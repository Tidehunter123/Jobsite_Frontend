import React from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Box,
  Stack,
} from "@mui/material";
import { FaGraduationCap } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

interface Candidate {
  name: string;
  title: string;
  company: string;
  photo?: string;
  degree?: string;
  location?: string;
}

export function CandidateCard({ candidate, expanded, onExpand }: { 
  candidate: Candidate, 
  expanded: boolean, 
  onExpand: () => void 
}) {
  return (
    <Card 
      sx={{ 
        mb: 2,
        border: expanded ? 2 : 0,
        borderColor: expanded ? 'primary.main' : 'transparent'
      }}
    >
      <CardContent>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer' 
          }} 
          onClick={onExpand}
        >
          {candidate.photo ? (
            <Avatar 
              src={candidate.photo} 
              alt={candidate.name} 
              sx={{ width: 40, height: 40, mr: 2 }}
            />
          ) : (
            <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
              {candidate.name.charAt(0)}
            </Avatar>
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {candidate.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {candidate.title}, {candidate.company}
            </Typography>
          </Box>
        </Box>

        {expanded && (
          <Box sx={{ mt: 2 }}>
            {candidate.degree && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <FaGraduationCap size={20} color="#666" />
                <Typography variant="body2" color="text.secondary">
                  {candidate.degree}
                </Typography>
              </Stack>
            )}
            {candidate.location && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <MdLocationOn size={20} color="#666" />
                <Typography variant="body2" color="text.secondary">
                  {candidate.location}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" color="primary">
                Setup Interview
              </Button>
              <Button variant="outlined" color="inherit">
                Decline
              </Button>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 