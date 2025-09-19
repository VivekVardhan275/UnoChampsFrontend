export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be hashed. Optional for client-side objects.
  avatarUrl: string;
  role: 'ADMIN' | 'PLAYER';
};

export type MatchParticipant = {
  userId: string;
  rank: number; // e.g., 1 for 1st place
  points: number;
};

export type MatchToCreate = Omit<Match, 'id'>;

export type Match = {
  id: string;
  name: string;
  championshipId: string;
  date: string; // ISO 8601 format
  participants: MatchParticipant[];
};

export type Championship = {
  id: string;
  name: string;
};

export type Standing = {
  rank: number;
  player: User;
  totalPoints: number;
  gamesPlayed: number;
  finishes: {
    first: number;
    second: number;
    third: number;
  };
  finishMap: { [key: number]: number };
};
