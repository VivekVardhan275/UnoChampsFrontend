import SeasonForm from "@/components/admin/SeasonForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// This is a mock page and does not fetch real data.
const MOCK_SEASON = {
    id: 'mock-season-id',
    name: "Sample Season Name"
};

export default function EditSeasonPage({ params }: { params: { id: string } }) {
    const season = MOCK_SEASON;
    const decodedId = params.id; // Not used for fetching, but kept for consistency

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
                    <CardTitle>Season Details</CardTitle>
                    <CardDescription>Change the name of the season below.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* The SeasonForm will be in its 'create' state as no season prop is passed */}
                    <SeasonForm />
                </CardContent>
            </Card>
        </div>
    )
}
