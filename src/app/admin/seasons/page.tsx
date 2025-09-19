import { getChampionships } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SeasonForm from "@/components/admin/SeasonForm";
import SeasonsList from "@/components/admin/SeasonsList";

export default async function SeasonsPage() {
    const seasons = await getChampionships();

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold">Season Management</h1>
                <p className="text-muted-foreground">Create, edit, and manage championship seasons.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Season</CardTitle>
                            <CardDescription>Add a new season to the championship.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SeasonForm />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Existing Seasons</CardTitle>
                             <CardDescription>View and manage all current and past seasons.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SeasonsList seasons={seasons} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
