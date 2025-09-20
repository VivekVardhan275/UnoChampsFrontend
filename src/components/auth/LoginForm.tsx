'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '@/lib/actions';
import { Button } from '@/components/ui/button';
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

export default function LoginForm({ role }: { role: 'ADMIN' | 'PLAYER' }) {
  const [state, dispatch] = useActionState(login, undefined);

  return (
    <form action={dispatch} className="space-y-4">
        <input type="hidden" name="role" value={role} />
        <div className="space-y-2">
        <Label htmlFor={`email-${role}`}>Email</Label>
        <Input
            id={`email-${role}`}
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
        <Label htmlFor={`password-${role}`}>Password</Label>
        <Input id={`password-${role}`} name="password" type="password" required />
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
        
        <LoginButton />
        
        <p className="text-sm text-center text-muted-foreground pt-2">
            Don&apos;t have an account?{' '}
            <Button variant="link" asChild className="p-0">
            <Link href="/register">
                Sign up
            </Link>
            </Button>
        </p>
    </form>
  );
}
