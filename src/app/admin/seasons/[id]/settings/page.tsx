import SeasonForm from "@/components/admin/SeasonForm";
import { getChampionshipById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditSeasonPage({ params }: { params: { id: string } }) {
    const season = await getChampionshipById(params.id);

    if (!season) {
        notFound();
    }
    
    return (
        <div className="space-y-6 max-w-lg mx-auto">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href={`/admin/seasons/${params.id}`}>
                        <ArrowLeft />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Season Settings</h1>
                    <p className="text-muted-foreground">Update the details for the season: {season.name}</p>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Season Details</CardTitle>
                    <CardDescription>Change the name of the season below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SeasonForm season={season} />
                </CardContent>
            </Card>
        </div>
    )
}
