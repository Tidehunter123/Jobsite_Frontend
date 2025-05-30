'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

const schema = zod.object({ email: zod.string().min(1, { message: 'Email is required' }).email() });

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '' } satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
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
      setIsPending(true);

      const redirectToUrl = new URL(paths.auth.supabase.callback.pkce, window.location.origin);
      redirectToUrl.searchParams.set('next', paths.auth.supabase.updatePassword);

      const { error } = await supabaseClient.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectToUrl.href,
      });

      if (error) {
        setError('root', { type: 'server', message: error.message });
        setIsPending(false);
        return;
      }

      const searchParams = new URLSearchParams({ email: values.email });
      router.push(`${paths.auth.supabase.recoveryLinkSent}?${searchParams.toString()}`);
    },
    [supabaseClient, router, setError]
  );

  return (
    <Stack spacing={4}>
      <Typography variant="h5">Reset password</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Stack spacing={2}>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormControl error={Boolean(errors.email)}>
                  <InputLabel>Email address</InputLabel>
                  <OutlinedInput {...field} type="email" />
                  {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
            <Button disabled={isPending} type="submit" sx={{ backgroundColor: '#3278ff', color: '#ffffff' }}>
              Send recovery link
            </Button>
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
}
