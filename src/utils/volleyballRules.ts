import { GameState, MatchConfig, Player, TeamId } from '../types/game';

/**
 * Extrai nomes de uma lista colada do WhatsApp, ignorando números, traços e linhas de cabeçalho vazias
 */
export function parseWhatsAppList(text: string, startId = 1): { players: Player[]; nextId: number } {
  const lines = text.split('\n');
  const players: Player[] = [];
  let currentId = startId;

  // Regex aprimorada baseada no volei_manager.html original:
  // Remove numeração no início (ex: "1-", "02.", "3)", "4 - ")
  const lineRegex = /^\s*\d+[\s\-\.\?\)\:]*\s*(.+)$/;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Ignora linhas típicas de cabeçalho de WhatsApp se tiverem dois pontos no fim sem número
    if (/^(lista|v[oô]lei|confirmados|data|local|hor[aá]rio)\b.*:$/i.test(trimmed)) {
      continue;
    }

    const match = trimmed.match(lineRegex);
    const candidateName = (match ? match[1] : trimmed)
      .replace(/^[\-\•\*]\s*/, '') // remove bullets
      .trim();

    if (candidateName.length > 0) {
      players.push({
        id: currentId++,
        name: candidateName,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winStreak: 0,
        maxWinStreak: 0,
        waitingSince: 0
      });
    }
  }

  return { players, nextId: currentId };
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Ordena a fila exatamente pela regra do protótipo:
 * 1. Prioridade (FIFO): Quem está esperando há mais tempo (menor timestamp waitingSince)
 * 2. Desempate: Quem jogou menos partidas na sessão
 */
export function sortQueuePlayers(queue: Player[]): Player[] {
  return [...queue].sort((a, b) => {
    if (a.waitingSince !== b.waitingSince) {
      return a.waitingSince - b.waitingSince;
    }
    return a.gamesPlayed - b.gamesPlayed;
  });
}

export interface MatchEvaluation {
  winner: TeamId | null;
  setPoint: TeamId | null;
  isDeuce: boolean;
}

/**
 * Avalia se algum time atingiu a vitória ou está em Set Point (considerando a regra "Vai a 2")
 */
export function evaluateMatchStatus(scoreA: number, scoreB: number, config: MatchConfig): MatchEvaluation {
  const target = config.targetScore;
  const minLead = config.deuceRule ? 2 : 1;

  const isDeuce = config.deuceRule && scoreA >= target - 1 && scoreB >= target - 1 && Math.abs(scoreA - scoreB) < 2;

  // Verifica vencedor
  if (scoreA >= target && scoreA - scoreB >= minLead) {
    return { winner: 'A', setPoint: null, isDeuce: false };
  }
  if (scoreB >= target && scoreB - scoreA >= minLead) {
    return { winner: 'B', setPoint: null, isDeuce: false };
  }

  // Verifica se o próximo ponto de A dá a vitória
  const nextAWins = scoreA + 1 >= target && scoreA + 1 - scoreB >= minLead;
  const nextBWins = scoreB + 1 >= target && scoreB + 1 - scoreA >= minLead;

  let setPoint: TeamId | null = null;
  if (nextAWins && !nextBWins) setPoint = 'A';
  else if (nextBWins && !nextAWins) setPoint = 'B';

  return { winner: null, setPoint, isDeuce };
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function getAllPlayers(state: GameState): Player[] {
  const map = new Map<number, Player>();
  [...state.teamA, ...state.teamB, ...state.queue].forEach((p) => {
    map.set(p.id, p);
  });
  return Array.from(map.values());
}

export function generateWhatsAppSummary(state: GameState): string {
  const allPlayers = getAllPlayers(state).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
    return a.name.localeCompare(b.name);
  });

  const dateStr = new Date().toLocaleDateString('pt-BR');
  const lines: string[] = [];

  lines.push(`🏐 *VÔLEI DA GALERA - RESUMO (${dateStr})* 🏐`);
  lines.push(`📊 Partidas realizadas: *${state.history.length}*`);
  lines.push(`👥 Jogadores participantes: *${allPlayers.length}*`);
  lines.push('');

  if (allPlayers.length > 0) {
    lines.push(`👑 *RANKING DO DIA:*`);
    allPlayers.forEach((p, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
      const winRate = p.gamesPlayed > 0 ? Math.round((p.wins / p.gamesPlayed) * 100) : 0;
      lines.push(`${medal} *${p.name}* — ${p.wins}V / ${p.gamesPlayed}J (${winRate}%)`);
    });
    lines.push('');
  }

  if (state.history.length > 0) {
    lines.push(`🔥 *HISTÓRICO DE JOGOS:*`);
    state.history.forEach((m) => {
      const winIconA = m.winner === 'A' ? '🏆 ' : '';
      const winIconB = m.winner === 'B' ? ' 🏆' : '';
      lines.push(
        `#${m.matchNumber}: ${winIconA}Time A *${m.scoreA}* x *${m.scoreB}* Time B${winIconB} (${formatTime(m.durationSeconds)})`
      );
    });
  }

  return lines.join('\n');
}
