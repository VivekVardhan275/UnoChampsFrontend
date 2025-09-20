import MatchEntryForm from "@/components/admin/MatchEntryForm";
import { getChampionships } from "@/lib/api";

export default async function LogMatchPage() {
    const championships = await getChampionships();
    
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Log New Match Result</h1>
                <p className="text-muted-foreground">Select the season, date, and participants for the new match.</p>
            </div>
            <MatchEntryForm allChampionships={championships} />
        </div>
    )
}
