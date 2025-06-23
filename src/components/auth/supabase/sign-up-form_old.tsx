'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SupabaseClient } from '@supabase/supabase-js';
import Airtable from 'airtable';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { config } from '@/config';
import { paths } from '@/paths';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

const schema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required' }),
  lastName: zod.string().min(1, { message: 'Last name is required' }),
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(6, { message: 'Password should be at least 6 characters' }),
  terms: zod.boolean().refine((value) => value, 'You must accept the terms and conditions'),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { firstName: '', lastName: '', email: '', password: '', terms: false } satisfies Values;

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

export function SignUpForm({
  role,
  rolePreferences,
}: {
  role?: string;
  rolePreferences?: { roleType: string; interestArea: string } | null;
}) {
  const [supabaseClient] = React.useState<SupabaseClient>(createSupabaseClient());

  const router = useRouter();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      console.log('Starting sign-up process for:', values.email);
      setIsPending(true);

      const redirectToUrl = new URL(paths.auth.supabase.callback.pkce, window.location.origin);
      if (role === 'recruiter') {
        redirectToUrl.searchParams.set('next', paths.onboarding.recruiter);
      } else {
        redirectToUrl.searchParams.set('next', paths.dashboard.overview);
      }
      console.log('Redirect URL set to:', redirectToUrl.href);

      const { data, error } = await supabaseClient.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: redirectToUrl.href,
          data: {
            display_name: `${values.firstName} ${values.lastName}`,
            role: role,
          },
        },
      });

      if (error) {
        console.error('Supabase sign-up error:', error);
        setError('root', { type: 'server', message: error.message });
        setIsPending(false);
        return;
      }

      console.log('Supabase sign-up response:', data);

      if (data.session) {
        console.log('Session created successfully');
        // UserProvider will handle Router refresh
        // After refresh, GuestGuard will handle the redirect
        // return;
      }

      if (data.user) {
        console.log('User created successfully, role:', role);
        if (role === 'recruiter') {
          try {
            console.log('Checking for existing recruiter in database');
            // Check if email already exists
            const existing = await base('Job Board Clients')
              .select({
                filterByFormula: `{Email} = '${values.email}'`,
                maxRecords: 1,
              })
              .firstPage();

            console.log('Existing recruiter check result:', existing.length > 0 ? 'Found' : 'Not found');

            if (existing.length === 0) {
              console.log('No existing recruiter found, would create new entry');
              // If not exist, add new user
              // await base('Job Board Clients').create([
              //   {
              //     fields: {
              //       Email: values.email,
              //       "Primary Recruiter Name": `${values.firstName} ${values.lastName}`,
              //     },
              //   },
              // ]);
            }
            if (existing.length > 0) {
              console.log('Existing recruiter found, throwing error');
              throw new Error('Email already exists');
            }
          } catch (err) {
            console.error('Recruiter database error:', err);
            setError('root', { type: 'server', message: 'Failed to add recruiter to database.' });
            setIsPending(false);
            return;
          }
          console.log('Redirecting to sign-up confirmation page for recruiter');
          const searchParams = new URLSearchParams({ email: values.email });
          router.push(`${paths.auth.supabase.signUpConfirm}?${searchParams.toString()}`);
          return;
        } else {
          console.log('Processing candidate sign-up');
          // Add to SFF Candidate Database
          try {
            const roleType = rolePreferences?.roleType || '';
            const interestArea = rolePreferences?.interestArea || '';
            console.log('Candidate role type:', roleType, 'Interest area:', interestArea);

            if (roleType === 'internship') {
              console.log('Processing internship candidate');
              const existing = await base('Internship')
                .select({
                  filterByFormula: `{Email} = '${values.email}'`,
                  maxRecords: 1,
                })
                .firstPage();

              console.log('Existing internship candidate check:', existing.length > 0 ? 'Found' : 'Not found');

              if (existing.length === 0) {
                console.log('Creating new internship candidate entry');
                // If not exist, add new user
                await base('Internship').create([
                  {
                    fields: {
                      Email: values.email,
                      'First Name': values.firstName,
                      'Last Name': values.lastName,
                      'New User': true,
                      'Job Board Access': true,
                      'Interest Area': rolePreferences?.interestArea || '',
                    },
                  },
                ]);
              }
              if (existing.length > 0) {
                console.log('Updating existing internship candidate');
                // If exist, update user
                await base('Internship').update(existing[0].id, {
                  'Job Board Access': true,
                });
              }
            }
            if (roleType === 'fulltime') {
              console.log('Processing full-time candidate');
              const existing = await base('Full Time Role')
                .select({
                  filterByFormula: `{Email} = '${values.email}'`,
                  maxRecords: 1,
                })
                .firstPage();

              console.log('Existing full-time candidate check:', existing.length > 0 ? 'Found' : 'Not found');

              if (existing.length === 0) {
                console.log('Creating new full-time candidate entry');
                // If not exist, add new user
                await base('FT').create([
                  {
                    fields: {
                      Email: values.email,
                      'First Name': values.firstName,
                      'Last Name': values.lastName,
                      'New User': true,
                      'Job Board Access': true,
                      'Interest Area': rolePreferences?.interestArea || '',
                    },
                  },
                ]);
              }
              if (existing.length > 0) {
                console.log('Updating existing full-time candidate');
                // If exist, update user
                await base('FT').update(existing[0].id, {
                  'Job Board Access': true,
                });
              }
            }
          } catch (err) {
            console.error('Candidate database error:', err);
            setError('root', { type: 'server', message: 'Failed to add candidate to database.' });
            setIsPending(false);
            return;
          }
          console.log('Redirecting to sign-up confirmation page for candidate');
          const searchParams = new URLSearchParams({ email: values.email });
          router.push(`${paths.auth.supabase.signUpConfirm}?${searchParams.toString()}`);
          return;
        }
      }

      console.log('Sign-up process completed');
      setIsPending(false);
    },
    [supabaseClient, router, setError, role, rolePreferences]
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight="600">
          Sign up
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Already have an account?{' '}
          <Link
            component={RouterLink}
            href={paths.auth.supabase.signIn}
            variant="subtitle2"
            sx={{
              color: '#3B82F6',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Sign in
          </Link>
        </Typography>
      </Stack>
      <Stack spacing={3}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormControl error={Boolean(errors.firstName)}>
                  <InputLabel>First name</InputLabel>
                  <OutlinedInput
                    {...field}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'grey.300',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  />
                  {errors.firstName ? <FormHelperText>{errors.firstName.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormControl error={Boolean(errors.lastName)}>
                  <InputLabel>Last name</InputLabel>
                  <OutlinedInput
                    {...field}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'grey.300',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  />
                  {errors.lastName ? <FormHelperText>{errors.lastName.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormControl error={Boolean(errors.email)}>
                  <InputLabel>Email address</InputLabel>
                  <OutlinedInput
                    {...field}
                    type="email"
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'grey.300',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  />
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
                    type="password"
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'grey.300',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  />
                  {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="terms"
              render={({ field }) => (
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        sx={{
                          '&.Mui-checked': {
                            color: 'primary.main',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        I have read the{' '}
                        <Link
                          sx={{
                            color: '#3B82F6',
                            textDecoration: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          terms and conditions
                        </Link>
                      </Typography>
                    }
                  />
                  {errors.terms ? <FormHelperText error>{errors.terms.message}</FormHelperText> : null}
                </div>
              )}
            />
            {errors.root ? (
              <Alert
                color="error"
                sx={{
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: 'error.main',
                  },
                }}
              >
                {errors.root.message}
              </Alert>
            ) : null}
            <Button
              disabled={isPending}
              type="submit"
              sx={{
                backgroundColor: '#3B82F6',
                color: 'white',
                borderRadius: 2,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                '&:hover': {
                  backgroundColor: '#3B82F6',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.3)',
                },
              }}
            >
              Create account
            </Button>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: 'center',
                mt: 2,
              }}
            >
              Having trouble logging in?{' '}
              <Link
                href="mailto:applications@searchfundfellows.com"
                sx={{
                  color: '#3B82F6',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Email us
              </Link>{' '}
              for help.
            </Typography>
          </Stack>
        </form>
      </Stack>
    </Stack>
  );
}
