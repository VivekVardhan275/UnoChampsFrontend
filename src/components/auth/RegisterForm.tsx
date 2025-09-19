'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { register } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';

function RegisterButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
       {pending ? 'Registering...' : <><UserPlus className="mr-2 h-4 w-4" /> Register</>}
    </Button>
  );
}

export default function RegisterForm() {
  const [state, dispatch] = useFormState(register, undefined);

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>Join the Championship</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" name="name" placeholder="Your Name" required />
            {state?.errors?.name && (
              <p className="text-sm font-medium text-destructive">{state.errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            {state?.errors?.email && (
              <p className="text-sm font-medium text-destructive">{state.errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
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
          <RegisterButton />
          <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" asChild className="p-0">
                <Link href="/login">
                 Log in
                </Link>
              </Button>
            </p>
        </CardFooter>
      </Card>
    </form>
  );
}
