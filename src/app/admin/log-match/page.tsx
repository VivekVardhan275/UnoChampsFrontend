import MatchEntryForm from "@/components/admin/MatchEntryForm";
import { getChampionships, getUsers } from "@/lib/data";

export default async function LogMatchPage() {
    const users = await getUsers();
    const championships = await getChampionships();
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Log New Match Result</h1>
            <MatchEntryForm allUsers={users} allChampionships={championships} />
        </div>
    )
}
