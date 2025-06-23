'use client';
import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Stack } from '@mui/material';
import Box from '@mui/material/Box';

import { Logo } from '../core/logo';

export interface SplitLayoutProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  children?: React.ReactNode; // fallback for legacy usage
}

export function SplitLayout({ leftContent, rightContent, children }: SplitLayoutProps): React.JSX.Element {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  console.log('isHomePage', isHomePage);
  return (
    <Box sx={{ position: 'relative', zIndex: 9999 }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          bgcolor: '#E6F0FA',
          color: '#0A2540', // Primary Navy
          left: 0,
          position: 'fixed',
          right: 0,
          top: 0,
          zIndex: 'var(--MainNav-zIndex)',
          width: '100%',
          height: '70px',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', minHeight: '70px', py: 0, ml: 0 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto', ml: { xs: 0, md: 20 } }}>
            <Box component={RouterLink} href="/" sx={{ display: 'inline-flex' }}>
              <Logo color="light" height={30} width={150} />
            </Box>
          </Stack>
        </Container>
      </Box>
      {/* Main Split Layout */}
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          bgcolor: '#F3F4F6', // Contrast Gray
          paddingLeft: { xs: 2, md: 20 },
          paddingRight: { xs: 2, md: 20 },
          paddingTop: '70px',
        }}
      >
        {/* Left: Marketing */}
        {leftContent && (
          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'left',
              px: 6,
              py: 8,
            }}
          >
            {leftContent}
          </Box>
        )}
        {/* Right: Form */}
        <Box
          sx={{
            flex: leftContent ? '0 0 480px' : '1',
            width: '100%',
            display: isHomePage ? 'block' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            m: { xs: 2, md: 6 },
            p: { xs: 3, md: 4 },
            minHeight: { xs: 'calc(100vh - 140px)', md: 'auto' },
            maxWidth: { xs: '100%', md: '480px' },
          }}
        >
          {rightContent || children}
        </Box>
      </Box>
    </Box>
  );
}
