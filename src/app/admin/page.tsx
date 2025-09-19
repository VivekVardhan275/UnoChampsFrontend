import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, SlidersHorizontal, Swords } from 'lucide-react';

export default async function AdminDashboard() {

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal /> Season Management</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Create, edit, and delete championship seasons. Set start and end dates, and manage which games belong to which season.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/admin/seasons">Manage Seasons</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlusCircle /> Log Match Result</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Enter the results from a recently played game to update the league standings and player statistics.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/admin/log-match">Log New Match</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Swords /> Game & Match History</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Review past match results and current league standings, exactly as a player would see them.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/">View Standings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
