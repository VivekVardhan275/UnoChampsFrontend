import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, SlidersHorizontal, Users, Swords } from 'lucide-react';

export default async function AdminDashboard() {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button asChild>
          <Link href="/admin/log-match">
            <PlusCircle className="mr-2 h-4 w-4" />
            Log New Match
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal /> Season Management</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Create, edit, and delete championship seasons. Set start and end dates, and manage which games belong to which season.</CardDescription>
            <Button disabled variant="secondary" className="mt-4">Manage Seasons (Coming Soon)</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Player Management</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>View all registered players. Edit player details, assign roles (Admin/Player), or remove players from the league.</CardDescription>
            <Button disabled variant="secondary" className="mt-4">Manage Players (Coming Soon)</Button>
          </CardContent>
        </Card>
         <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Swords /> Game & Match History</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Review, edit, or delete past match results. Correct errors in scoring or player rankings after a match has been logged.</CardDescription>
            <Button disabled variant="secondary" className="mt-4">Manage Games (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
