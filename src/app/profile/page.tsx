import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PenSquare } from 'lucide-react';

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-8">
        Your Profile
      </h1>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
            <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl">{user.name}</CardTitle>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground mb-4">You can view and edit your profile information here. Player stats are available on the public profile pages.</p>
          <Button disabled>
            <PenSquare className="mr-2 h-4 w-4" />
            Edit Profile (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
