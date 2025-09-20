'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

function LoginButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={isSubmitting}>
       {isSubmitting ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
    </Button>
  );
}

export default function LoginForm({ role }: { role: 'ADMIN' | 'PLAYER' }) {
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        const apiRole = role.toLowerCase();
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login/${apiRole}`;

        try {
            const response = await axios.post(url, { email, password });
            const data = response.data;

            if (data.success) {
                const userData = {
                    name: data.username,
                    email: data.email,
                    role: data.typeOfUser,
                    token: data.token,
                };
                login(userData);

                if (data.typeOfUser === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        </div>
        <div className="space-y-2">
            <Label htmlFor={`password-${role}`}>Password</Label>
            <Input id={`password-${role}`} name="password" type="password" required />
        </div>
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        <LoginButton isSubmitting={isSubmitting} />
        
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
