import LoginForm from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex items-start justify-center gap-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login to UNOstat</h1>
        <LoginForm />
      </div>
      <div className="w-full max-w-sm sticky top-28 hidden lg:block">
        <Card>
            <CardHeader>
                <CardTitle>Mock Credentials</CardTitle>
                <CardDescription>Use these accounts for testing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                    <h3 className="flex items-center gap-2 font-semibold"><Shield className="h-4 w-4" /> Admin User</h3>
                    <p className="text-sm text-muted-foreground mt-1">For managing players and matches.</p>
                    <div className="mt-2 space-y-1 text-sm font-mono">
                        <p><strong>Email:</strong> alice@example.com</p>
                        <p><strong>Pass:</strong> password123</p>
                    </div>
                </div>
                 <div className="p-4 bg-muted rounded-lg">
                    <h3 className="flex items-center gap-2 font-semibold"><User className="h-4 w-4" /> Player User</h3>
                     <p className="text-sm text-muted-foreground mt-1">For viewing standings and profiles.</p>
                    <div className="mt-2 space-y-1 text-sm font-mono">
                        <p><strong>Email:</strong> bob@example.com</p>
                        <p><strong>Pass:</strong> password123</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
