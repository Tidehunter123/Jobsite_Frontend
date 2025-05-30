'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '', password: '' } satisfies Values;

export function SignInForm(): React.JSX.Element {
  const [supabaseClient] = React.useState<SupabaseClient>(createSupabaseClient());

  const router = useRouter();

  const [showPassword, setShowPassword] = React.useState<boolean>();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleSignUpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignUpJobSeeker = () => {
    router.push('/auth/supabase/sign-up/jobseeker');
    handleClose();
  };

  const handleSignUpRecruiter = () => {
    router.push('/auth/supabase/sign-up/recruiter');
    handleClose();
  };

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await supabaseClient.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          // You should resend the verification email.
          // For the sake of simplicity, we will just redirect to the confirmation page.
          const searchParams = new URLSearchParams({ email: values.email });
          router.push(`${paths.auth.supabase.signUpConfirm}?${searchParams.toString()}`);
        } else {
          setError('root', { type: 'server', message: error.message });
          setIsPending(false);
        }
      } else {
        // UserProvider will handle Router refresh
        // After refresh, GuestGuard will handle the redirect
      }
    },
    [supabaseClient, router, setError]
  );

  return (
    <Stack spacing={6} sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Sign in</Typography>
        <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{' '}
          <Button
            sx={{
              backgroundColor: 'transparent',
              color: '#3B82F6',
              fontWeight: 500,
              minWidth: 'auto',
              padding: '4px 8px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline'
              }
            }}
            onClick={handleSignUpClick}
          >
            Sign Up
          </Button>
        </Typography>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            sx: { borderRadius: 3, boxShadow: 3, mt: 1, minWidth: 220 },
          }}
        >
          <MenuItem onClick={handleSignUpJobSeeker}>I'm looking for a job</MenuItem>
          <MenuItem onClick={handleSignUpRecruiter}>I'm looking for candidates</MenuItem>
        </Menu>
      </Stack>
      <Stack spacing={4}>
        <Stack spacing={3}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.email)}>
                    <InputLabel>Email address</InputLabel>
                    <OutlinedInput {...field} type="email" sx={{ height: '56px' }} />
                    {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.password)}>
                    <InputLabel>Password</InputLabel>
                    <OutlinedInput
                      {...field}
                      sx={{ height: '56px' }}
                      endAdornment={
                        showPassword ? (
                          <EyeIcon
                            cursor="pointer"
                            fontSize="var(--icon-fontSize-md)"
                            onClick={(): void => {
                              setShowPassword(false);
                            }}
                          />
                        ) : (
                          <EyeSlashIcon
                            cursor="pointer"
                            fontSize="var(--icon-fontSize-md)"
                            onClick={(): void => {
                              setShowPassword(true);
                            }}
                          />
                        )
                      }
                      type={showPassword ? 'text' : 'password'}
                    />
                    {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
              {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
              <Button
                disabled={isPending}
                type="submit"
                sx={{
                  backgroundColor: '#3B82F6',
                  color: '#ffffff',
                  height: '48px',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#3B82F6',
                  },
                }}
              >
                Sign in
              </Button>
            </Stack>
          </form>
          <div>
            <Link
              component={RouterLink}
              href={paths.auth.supabase.resetPassword}
              variant="subtitle2"
              sx={{ color: '#3B82F6' }}
            >
              Forgot password?
            </Link>
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '24px' }}>
              Having trouble logging in?{' '}
              <a href="mailto:applications@searchfundfellows.com" style={{ color: '#3B82F6' }}>
                Email us
              </a>{' '}
              for help.
            </p>
          </div>
        </Stack>
      </Stack>
    </Stack>
  );
}
