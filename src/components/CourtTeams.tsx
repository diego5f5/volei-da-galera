import React from 'react';
import { ArrowLeftRight, Trophy, Flame, Shuffle } from 'lucide-react';
import { MatchConfig, Player, TeamId } from '../types/game';

interface CourtTeamsProps {
  teamA: Player[];
  teamB: Player[];
  config: MatchConfig;
  canRerollInitialTeams: boolean;
  onRerollInitialTeams: () => void;
  onSubstitutePlayer: (team: TeamId, playerId: number) => void;
  onSelectPlayer: (player: Player) => void;
  onRegisterWin: (team: TeamId) => void;
}

export const CourtTeams: React.FC<CourtTeamsProps> = ({
  teamA,
  teamB,
  config,
  canRerollInitialTeams,
  onRerollInitialTeams,
  onSubstitutePlayer,
  onSelectPlayer,
  onRegisterWin
}) => {
  const renderTeamColumn = (teamId: TeamId, players: Player[]) => {
    const isA = teamId === 'A';
    const teamStreak = players[0]?.winStreak ?? 0;

    return (
      <div
        className={`rounded-2xl bg-slate-900 border ${
          isA ? 'border-sky-500/30' : 'border-rose-500/30'
        } overflow-hidden flex flex-col shadow-lg`}
      >
        {/* Header do Time */}
        <div
          className={`px-3 py-2 flex items-center justify-between ${
            isA
              ? 'bg-gradient-to-r from-sky-600 to-blue-700'
              : 'bg-gradient-to-r from-rose-600 to-red-700'
          } text-white`}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xs tracking-wider uppercase">
              {isA ? config.teamAName || 'TIME A' : config.teamBName || 'TIME B'}
            </span>
            <span className="text-[10px] font-bold bg-black/25 px-1.5 py-0.5 rounded-full">
              {players.length}/{config.teamSize}
            </span>
          </div>

          {teamStreak > 0 && (
            <span
              title={`Sequência de ${teamStreak} vitória(s) de ${config.maxWins}`}
              className="inline-flex items-center gap-0.5 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full"
            >
              <Flame className="w-3 h-3 fill-slate-950" />
              {teamStreak}/{config.maxWins}
            </span>
          )}
        </div>

        {/* Lista de Jogadores do Time */}
        <div className="p-2 flex-1 divide-y divide-slate-800/70">
          {players.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Sem jogadores</p>
          ) : (
            players.map((player) => (
              <div
                key={player.id}
                onClick={() => onSelectPlayer(player)}
                className="flex items-center justify-between py-2 px-1.5 hover:bg-slate-800/60 active:bg-slate-800 rounded-lg cursor-pointer transition group"
              >
                <span className="text-xs font-semibold text-slate-100 truncate pr-1.5">
                  {player.name}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {player.winStreak > 0 && (
                    <span className="bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      🔥{player.winStreak}
                    </span>
                  )}
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-slate-700">
                    🏐{player.gamesPlayed}
                  </span>
                  <button
                    type="button"
                    title="Substituir pelo próximo da fila"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubstitutePlayer(teamId, player.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 active:scale-90 transition"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botão de Vitória do Time */}
        <button
          type="button"
          onClick={() => onRegisterWin(teamId)}
          className={`w-full py-3 px-2 font-extrabold text-xs uppercase tracking-wider border-t flex items-center justify-center gap-1.5 transition active:scale-95 ${
            isA
              ? 'bg-sky-950/60 border-sky-500/30 text-sky-300 hover:bg-sky-900/60'
              : 'bg-rose-950/60 border-rose-500/30 text-rose-300 hover:bg-rose-900/60'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Vitória {isA ? 'Time A' : 'Time B'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-2.5">
      {canRerollInitialTeams && (
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2">
          <span className="text-[11px] font-semibold text-slate-400">
            1ª Partida • Sorteio inicial
          </span>
          <button
            type="button"
            onClick={onRerollInitialTeams}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-xs font-extrabold transition active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Re-sortear Times
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {renderTeamColumn('A', teamA)}
        {renderTeamColumn('B', teamB)}
      </div>
    </div>
  );
};
