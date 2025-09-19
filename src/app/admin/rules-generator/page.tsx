import RulesGenerator from "@/components/admin/RulesGenerator";

export default function RulesGeneratorPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">AI Rules Generator</h1>
            <p className="text-muted-foreground mb-6">Generate rule variations for your UNO games to copy and paste into the official rules page.</p>
            <RulesGenerator />
        </div>
    )
}
