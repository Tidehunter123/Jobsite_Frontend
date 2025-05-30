import * as React from 'react';
import { GuestGuard } from '@/components/auth/guest-guard';
import { SplitLayout } from '@/components/auth/split-layout';
import { SignUpForm } from '@/components/auth/supabase/sign-up-form';
import { Box, Typography, Stack } from '@mui/material';
import { MdCheckCircle } from 'react-icons/md';

function Bubble({ size, top, left, opacity }: { size: number, top: string, left: string, opacity: number }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(120deg,rgb(92, 145, 198) 0%, #fff 100%)',
        opacity,
        top,
        left,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

function RecruiterMarketing() {
  return (
    <Box 
      sx={{ 
        width: '100%', 
        maxWidth: 520,
        position: 'relative',
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }}
    >
      {/* Background Bubbles */}
      <Bubble size={150} top="-150px" left="-60px" opacity={0.18} />
      <Bubble size={120} top="220px" left="80%" opacity={0.12} />
      <Bubble size={90} top="380px" left="-30px" opacity={0.13} />
      <Bubble size={140} top="100%" left="100%" opacity={0.10} />
      {/* Headline pill with background bubble */}
      <Box sx={{ position: 'relative', mb: 6 }}>
        <Box
          sx={{
            position: 'relative',
            background: 'linear-gradient(135deg, #0A2540 0%, #3B82F6 100%)',
            color: '#fff',
            borderRadius: '16px',
            px: 4,
            py: 3.5,
            fontWeight: 700,
            fontSize: 28,
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(10, 37, 64, 0.15)',
            transition: 'transform 0.2s ease-in-out',
            zIndex: 1,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 25px rgba(10, 37, 64, 0.2)',
            }
          }}
        >
          Powerful, <span style={{ 
            textDecoration: 'underline',
            background: 'linear-gradient(120deg, #E6F0FA 0%, #fff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>FREE</span> recruiting tools<br />
          to find your perfect match!
        </Box>
      </Box>
      {/* Features */}
      <Stack spacing={3} sx={{ mb: 8 }}>
        {[
          'Post your job and source candidates for FREE',
          'Save time with intelligent applicant sorting',
          'Free built-in ATS to manage your pipeline',
          'Industry high 40% candidate response rate',
        ].map((text, i) => (
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={2} 
            key={i}
            sx={{
              p: 2,
              borderRadius: '12px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: '#E6F0FA',
                transform: 'translateX(4px)',
              }
            }}
          >
            <MdCheckCircle size={28} color="#3B82F6" />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#0A2540', 
                fontWeight: 500,
                fontSize: '1.1rem'
              }}
            >
              {text}
            </Typography>
          </Stack>
        ))}
      </Stack>

    </Box>
  );
}

export default function RecruiterSignUpPage() {
  return (
    <GuestGuard>
      <SplitLayout
        leftContent={<RecruiterMarketing />}
        rightContent={<SignUpForm role="recruiter" />}
      />
    </GuestGuard>
  );
} 