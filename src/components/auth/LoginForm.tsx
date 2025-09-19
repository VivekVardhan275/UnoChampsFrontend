'use client';

import { useActionState, useFormStatus } from 'react';
import { login } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, LogIn } from 'lucide-react';
import Link from 'next/link';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
       {pending ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
    </Button>
  );
}

export default function LoginForm() {
  const [state, dispatch] = useActionState(login, undefined);

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
            {state?.errors?.email && (
              <p className="text-sm font-medium text-destructive">{state.errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {state?.errors?.password && (
              <p className="text-sm font-medium text-destructive">{state.errors.password}</p>
            )}
          </div>
          {state?.message && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <LoginButton />
           <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Button variant="link" asChild className="p-0">
                <Link href="/register">
                 Sign up
                </Link>
              </Button>
            </p>
        </CardFooter>
      </Card>
    </form>
  );
}
