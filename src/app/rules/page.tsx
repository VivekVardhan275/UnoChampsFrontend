import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-8 text-center">
        Official Rules & Scoring
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="text-primary" />
            Championship Rulebook
          </CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            Welcome to the official rulebook for the UNOstat Championship. This document outlines the rules of play and the scoring system used to determine rankings. The Administrator is responsible for keeping this section up-to-date.
          </p>

          <h2>Scoring System</h2>
          <p>
            Points are awarded by the Administrator at the end of each game based on the final ranking of players. The system does not automatically calculate points; it only records what the Admin enters. The official points distribution is as follows:
          </p>
          <ul>
            <li><strong>1st Place:</strong> 100 Points</li>
            <li><strong>2nd Place:</strong> 50 Points</li>
            <li><strong>3rd Place:</strong> 25 Points</li>
            <li><strong>4th Place:</strong> 10 Points</li>
            <li><strong>5th Place and below:</strong> 0 Points</li>
          </ul>

          <h2>Tie-Breaking ("Countback")</h2>
          <p>
            In the event of a tie in total points on the leaderboard, the following "countback" procedure will be used to determine the higher rank:
          </p>
          <ol>
            <li>The player with more 1st place finishes is ranked higher.</li>
            <li>If still tied, the player with more 2nd place finishes is ranked higher.</li>
            <li>If still tied, the player with more 3rd place finishes is ranked higher (and so on for all subsequent places).</li>
            <li>If players are still tied after comparing all finishing positions, they will share the rank.</li>
          </ol>
          
          <h2>Game Rules</h2>
          <p>
            All games are to be played with a standard deck of UNO cards. The following are house rules that apply to this championship.
          </p>
          <p><em>(Admin: This is where you would paste the generated or custom rules for your league.)</em></p>
          <blockquote>
            <strong>Example Rule: Stacking Draw Cards</strong>
            <p>Stacking is allowed. A player can play a "+2" card on another "+2" card, forcing the next player to draw 4 cards. The same applies to "+4" cards. A player who cannot add to the stack must draw the total number of cards.</p>
          </blockquote>
          
        </CardContent>
      </Card>
    </div>
  );
}
