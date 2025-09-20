import SeasonForm from "@/components/admin/SeasonForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";


export default function EditSeasonPage({ params }: { params: { id: string } }) {
    const decodedId = params.id ? decodeURIComponent(params.id) : null;

    if (!decodedId) {
        notFound();
        return null;
    }

    const season = {
        id: decodedId,
        name: decodedId
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href={`/admin/seasons`}>
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
                    <CardTitle>Rename Season</CardTitle>
                    <CardDescription>Change the name of the season below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SeasonForm season={season} />
                </CardContent>
            </Card>
        </div>
    )
}
