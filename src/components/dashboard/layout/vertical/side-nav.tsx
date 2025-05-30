import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useColorScheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowSquareOut as ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretRight as CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';

import type { NavItemConfig } from '@/types/nav';
import type { NavColor } from '@/types/settings';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';

import { icons } from '../nav-icons';
import { navColorStyles } from './styles';

export interface SideNavProps {
  color?: NavColor;
  items?: NavItemConfig[];
}

export function SideNav({ color = 'evident', items = [] }: SideNavProps): React.JSX.Element {
  const pathname = usePathname();

  const { colorScheme = 'light' } = useColorScheme();

  const styles = navColorStyles[colorScheme][color];

  return (
    <Box
      sx={{
        ...styles,
        bgcolor: '#E3E3E3',
        borderRight: 'var(--SideNav-border)',
        color: '#000000',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        left: 0,
        position: 'fixed',
        top: 0,
        width: 'var(--SideNav-width)',
        zIndex: 'var(--SideNav-zIndex)',
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        <div>
          <Box
            component={RouterLink}
            href={paths.home}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5, // Adjust spacing between icon and text
              textDecoration: 'none', // Removes underline
            }}
          >
            <Logo color="light" height={45} width={45} />
            <Typography
              variant="h4"
              fontWeight="bold"
              fontFamily="'Mollen Personal Use', sans-serif"
              color="#000000"
              sx={{ textDecoration: 'none' }} // Ensure no underline
            >
              MacroFlow
            </Typography>
          </Box>
        </div>
      </Stack>
      <Box
        component="nav"
        sx={{
          flex: '1 1 auto',
          overflowY: 'auto',
          p: 2,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {renderNavGroups({ items, pathname })}
      </Box>
    </Box>
  );
}

function renderNavGroups({ items, pathname }: { items: NavItemConfig[]; pathname: string }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    acc.push(
      <Stack component="li" key={curr.key} spacing={1.5}>
        <div>{renderNavItems({ depth: 0, items: curr.items, pathname })}</div>
      </Stack>
    );

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={2} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

function renderNavItems({
  depth = 0,
  items = [],
  pathname,
}: {
  depth: number;
  items?: NavItemConfig[];
  pathname: string;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { items: childItems, key, ...item } = curr;

    const forceOpen = childItems
      ? Boolean(childItems.find((childItem) => childItem.href && pathname.startsWith(childItem.href)))
      : false;

    acc.push(
      <NavItem depth={depth} forceOpen={forceOpen} key={key} pathname={pathname} {...item}>
        {childItems ? renderNavItems({ depth: depth + 1, pathname, items: childItems }) : null}
      </NavItem>
    );

    return acc;
  }, []);

  return (
    <Stack component="ul" data-depth={depth} spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  children?: React.ReactNode;
  depth: number;
  forceOpen?: boolean;
  pathname: string;
}

function NavItem({
  children,
  depth,
  disabled,
  external,
  forceOpen = false,
  href,
  icon,
  label,
  matcher,
  pathname,
  title,
}: NavItemProps): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(forceOpen);
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? icons[icon] : null;
  const ExpandIcon = open ? CaretDownIcon : CaretRightIcon;
  const isBranch = children && !href;
  const showChildren = Boolean(children && open);

  return (
    <Box component="li" data-depth={depth} sx={{ userSelect: 'none' }}>
      <Box
        {...(isBranch
          ? {
              onClick: (): void => {
                setOpen(!open);
              },
              onKeyUp: (event: React.KeyboardEvent<HTMLDivElement>): void => {
                if (event.key === 'Enter' || event.key === ' ') {
                  setOpen(!open);
                }
              },
              role: 'button',
            }
          : {
              ...(href
                ? {
                    component: external ? 'a' : RouterLink,
                    href,
                    target: external ? '_blank' : undefined,
                    rel: external ? 'noreferrer' : undefined,
                  }
                : { role: 'button' }),
            })}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: '#000000',
          cursor: 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          ...(disabled && {
            bgcolor: 'var(--NavItem-disabled-background)',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && {
            bgcolor: 'rgba(0, 0, 0,0.2)',
            color: 'var(--NavItem-active-color)',
            ...(depth > 0 && {
              '&::before': {
                bgcolor: 'var(--NavItem-children-indicator)',
                borderRadius: '2px',
                content: '" "',
                height: '20px',
                left: '-14px',
                position: 'absolute',
                width: '3px',
              },
            }),
          }),
          ...(open && { color: 'var(--NavItem-open-color)' }),
          '&:hover': {
            ...(!disabled &&
              !active && { bgcolor: 'var(--NavItem-hover-background)', color: 'var(--NavItem-hover-color)' }),
          },
        }}
        tabIndex={0}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {Icon ? (
            <Icon
              fill={active ? 'var(--NavItem-icon-active-color)' : '#000000'}
              fontSize="var(--icon-fontSize-md)"
              weight={forceOpen || active ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
          >
            {title}
          </Typography>
        </Box>
        {label ? <Chip color="primary" label={label} size="small" /> : null}
        {external ? (
          <Box sx={{ alignItems: 'center', display: 'flex', flex: '0 0 auto' }}>
            <ArrowSquareOutIcon color="var(--NavItem-icon-color)" fontSize="var(--icon-fontSize-sm)" />
          </Box>
        ) : null}
        {isBranch ? (
          <Box sx={{ alignItems: 'center', display: 'flex', flex: '0 0 auto' }}>
            <ExpandIcon color="var(--NavItem-expand-color)" fontSize="var(--icon-fontSize-sm)" />
          </Box>
        ) : null}
      </Box>
      {showChildren ? (
        <Box sx={{ pl: '24px' }}>
          <Box sx={{ borderLeft: '1px solid var(--NavItem-children-border)', pl: '12px' }}>{children}</Box>
        </Box>
      ) : null}
    </Box>
  );
}
