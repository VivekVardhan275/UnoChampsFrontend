import LoginForm from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield } from 'lucide-react';

const RoleCredentials = ({ icon, role, description, email, password }: { icon: React.ReactNode, role: string, description: string, email: string, password: string }) => (
    <div className="p-4 bg-muted rounded-lg border">
        <h3 className="flex items-center gap-2 font-semibold">{icon} {role}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <div className="mt-3 space-y-1 text-sm font-mono bg-background/50 p-2 rounded">
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Pass:</strong> {password}</p>
        </div>
    </div>
);

export default function LoginPage() {
  return (
    <div className="flex items-start justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login to UNOstat</h1>
        <p className="text-center text-muted-foreground mb-6">Since mock data has been removed, you must first register a user before you can log in.</p>
        <Tabs defaultValue="player" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="player"><User className="mr-2 h-4 w-4" />Player Login</TabsTrigger>
                <TabsTrigger value="admin"><Shield className="mr-2 h-4 w-4" />Admin Login</TabsTrigger>
            </TabsList>
            <TabsContent value="player">
                <Card>
                    <CardHeader>
                        <CardTitle>Player Login</CardTitle>
                        <CardDescription>Access your profile and view championship standings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <LoginForm />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="admin">
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Login</CardTitle>
                        <CardDescription>Manage players, log matches, and configure the league.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <LoginForm />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
