export type TeamId = 'A' | 'B';

export type AppView = 'setup' | 'match';

export interface Player {
  id: number;
  name: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winStreak: number;
  maxWinStreak: number;
  waitingSince: number;
}

export interface MatchConfig {
  teamSize: number;
  maxWins: number;
  targetScore: number;
  deuceRule: boolean; // Regra "Vai a 2" (diferença mínima de 2 pontos)
  shuffleInitial: boolean; // Sorteio aleatório ou manter ordem da lista
  teamAName: string;
  teamBName: string;
}

export interface ActiveMatch {
  scoreA: number;
  scoreB: number;
  timerSeconds: number;
  isPlaying: boolean;
  swappedSides: boolean; // Inverter lados visualmente no placar
  servingTeam: TeamId | null; // Qual time está com o saque atualmente
}

export interface CompletedMatch {
  id: string;
  matchNumber: number;
  winner: TeamId;
  scoreA: number;
  scoreB: number;
  durationSeconds: number;
  timestamp: number;
  teamANames: string[];
  teamBNames: string[];
  rotatedByMaxWins: boolean;
}

export interface UndoSnapshot {
  label: string;
  timestamp: number;
  teamA: Player[];
  teamB: Player[];
  queue: Player[];
  match: ActiveMatch;
  history: CompletedMatch[];
  playerIdCounter: number;
}

export interface GameState {
  view: AppView;
  config: MatchConfig;
  rawListText: string;
  teamA: Player[];
  teamB: Player[];
  queue: Player[];
  playerIdCounter: number;
  match: ActiveMatch;
  history: CompletedMatch[];
  soundEnabled: boolean;
}
