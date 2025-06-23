'use client';

import * as React from 'react';
import { useEffect } from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, useMediaQuery, useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import Airtable from 'airtable';

import type { NavItemConfig } from '@/types/nav';
import { config } from '@/config';
import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';
import { Logo } from '@/components/core/logo';

import { MobileNav } from '../mobile-nav';
import { UserPopover } from '../user-popover/user-popover';

export interface MainNavProps {
  items: NavItemConfig[];
}

export function MainNav({ items }: MainNavProps): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const pathname = usePathname();
  console.log(pathname, 'pathname');

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          bgcolor: '#E6F0FA',
          color: '#0A2540', // Primary Navy
          left: 0,
          position: 'sticky',
          right: 0,
          top: 0,
          zIndex: 'var(--MainNav-zIndex)',
          width: '100vw',
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          sx={{
            display: 'flex',
            minHeight: 'var(--MainNav-height)',
            py: { xs: '8px', sm: '10px' },
            ml: 0,
            width: '100%',
            maxWidth: '100% !important',
            paddingLeft: { xs: '16px', sm: '20px' },
            paddingRight: { xs: '16px', sm: '20px' },
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: 1, ml: { xs: 0, sm: 20 } }}>
            <Box component={RouterLink} href="/" sx={{ display: 'inline-flex' }}>
              <Logo color="light" height={isMobile ? 25 : 30} width={isMobile ? 120 : 150} />
            </Box>
            {pathname !== '/onboarding/recruiter' && !pathname?.includes('/dashboard') && pathname !== '/' && (
              <Stack 
                direction="row" 
                spacing={{ xs: 2, sm: 4 }} 
                sx={{ 
                  ml: { xs: 2, sm: 6 },
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                {items[0]?.items?.map((item) => (
                  <Box key={item.title} sx={{ position: 'relative', display: 'inline-block' }}>
                    <RouterLink
                      href={item.href || '#'}
                      style={{
                        color: '#0A2540',
                        fontWeight: 600,
                        fontSize: isMobile ? '14px' : '16px',
                        textDecoration: pathname === item.href ? 'underline' : 'none',
                        position: 'relative',
                        padding: isMobile ? '6px 12px' : '8px 16px',
                        transition: 'color 0.2s',
                        display: 'inline-block',
                      }}
                    >
                      {item.title}
                    </RouterLink>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 2 }}
            sx={{
              alignItems: 'center',
              justifyContent: 'flex-end',
              mr: { xs: 2, sm: 5 },
            }}
          >
            {pathname !== '/' && (
              <>
                <Divider
                  flexItem
                  orientation="vertical"
                  sx={{ borderColor: 'var(--MainNav-divider)', display: { xs: 'none', lg: 'block' } }}
                />
                <UserButton />
              </>
            )}
            {/* Mobile Menu Button */}
            {isMobile && pathname !== '/onboarding/recruiter' && !pathname?.includes('/dashboard') && pathname !== '/' && (
              <IconButton
                onClick={() => setOpenNav(true)}
                sx={{
                  color: '#0A2540',
                  display: { xs: 'flex', md: 'none' },
                  ml: 1
                }}
              >
                <ListIcon />
              </IconButton>
            )}
          </Stack>
        </Container>
      </Box>
      {/* Mobile Navigation Drawer */}
      <MobileNav items={items} onClose={() => setOpenNav(false)} open={openNav} />
    </React.Fragment>
  );
}

function UserButton(): React.JSX.Element {
  const popover = usePopover<HTMLButtonElement>();
  const { user } = useUser();

  return (
    <React.Fragment>
      <Box
        component="button"
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        sx={{ border: 'none', background: 'transparent', cursor: 'pointer', p: 0 }}
      >
        <Badge
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          color="success"
          sx={{
            '& .MuiBadge-dot': {
              border: '2px solid var(--MainNav-background)',
              borderRadius: '50%',
              bottom: '6px',
              height: '12px',
              right: '6px',
              width: '12px',
            },
          }}
          variant="dot"
        >
          <Avatar src={user?.avatar} />
        </Badge>
      </Box>
      <UserPopover anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
    </React.Fragment>
  );
}
