import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ArrowLeftRight,
  Plus,
  Minus,
  Trophy,
  Zap,
  RotateCcw
} from 'lucide-react';
import { ActiveMatch, MatchConfig, TeamId } from '../types/game';
import { evaluateMatchStatus, formatTime } from '../utils/volleyballRules';

interface ScoreboardProps {
  match: ActiveMatch;
  config: MatchConfig;
  isFullscreen: boolean;
  onUpdateScore: (team: TeamId, delta: number) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSwapSides: () => void;
  onToggleFullscreen: () => void;
  onRegisterWin: (team: TeamId) => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  match,
  config,
  isFullscreen,
  onUpdateScore,
  onToggleTimer,
  onResetTimer,
  onSwapSides,
  onToggleFullscreen,
  onRegisterWin
}) => {
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const evalStatus = evaluateMatchStatus(match.scoreA, match.scoreB, config);

  // Wake Lock API para manter tela acesa no modo Placar Tela Cheia
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    async function requestWakeLock() {
      if (isFullscreen && 'wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          setWakeLockActive(true);
          wakeLock.addEventListener('release', () => {
            setWakeLockActive(false);
          });
        } catch {
          setWakeLockActive(false);
        }
      }
    }

    if (isFullscreen) {
      requestWakeLock();
    } else {
      setWakeLockActive(false);
    }

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [isFullscreen]);

  const leftTeam: TeamId = match.swappedSides ? 'B' : 'A';
  const rightTeam: TeamId = match.swappedSides ? 'A' : 'B';

  const getTeamData = (team: TeamId) => {
    const isA = team === 'A';
    return {
      id: team,
      name: isA ? config.teamAName || 'TIME A' : config.teamBName || 'TIME B',
      score: isA ? match.scoreA : match.scoreB,
      isServing: match.servingTeam === team,
      isWinner: evalStatus.winner === team,
      isSetPoint: evalStatus.setPoint === team,
      accentText: isA ? 'text-sky-400' : 'text-rose-400',
      accentBg: isA ? 'bg-sky-600 hover:bg-sky-500' : 'bg-rose-600 hover:bg-rose-500',
      cardBorder: isA ? 'border-sky-500/30' : 'border-rose-500/30',
      cardBg: isA ? 'from-sky-950/50 to-slate-900' : 'from-rose-950/50 to-slate-900'
    };
  };

  const left = getTeamData(leftTeam);
  const right = getTeamData(rightTeam);

  return (
    <>
      {/* Placar Compacto na Tela de Partida */}
      <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Status Banner (Vai a 2 / Set Point / Vitória) */}
        {(evalStatus.isDeuce || evalStatus.setPoint || evalStatus.winner) && (
          <div className="mb-2.5 flex items-center justify-center">
            {evalStatus.winner ? (
              <button
                onClick={() => onRegisterWin(evalStatus.winner!)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 animate-pulse"
              >
                <Trophy className="w-4 h-4" />
                FIM DE SET! CONFIRMAR VITÓRIA DO TIME {evalStatus.winner}
              </button>
            ) : evalStatus.isDeuce ? (
              <span className="px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold tracking-wide">
                ⚡ VAI A 2! (DIFERENÇA DE 2 PONTOS)
              </span>
            ) : (
              <span className="px-3 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[11px] font-extrabold tracking-wide">
                🔥 SET POINT — TIME {evalStatus.setPoint}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 items-center gap-2">
          {/* Lado Esquerdo */}
          <div
            className={`flex flex-col items-center p-2.5 rounded-xl bg-gradient-to-b ${left.cardBg} border ${
              left.isWinner ? 'border-emerald-400 ring-2 ring-emerald-400/30' : left.cardBorder
            } transition-all`}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <span className={`text-[11px] font-black tracking-wider ${left.accentText}`}>
                {left.name}
              </span>
              {left.isServing && <span title="Com o saque" className="text-xs">🏐</span>}
            </div>

            <div className="text-4xl font-black text-white tabular-nums my-1 leading-none">
              {left.score}
            </div>

            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                onClick={() => onUpdateScore(left.id, -1)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center active:scale-90 transition"
                aria-label={`Diminuir ponto ${left.name}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdateScore(left.id, 1)}
                className={`w-10 h-10 rounded-full ${left.accentBg} text-white flex items-center justify-center shadow-md active:scale-90 transition`}
                aria-label={`Adicionar ponto ${left.name}`}
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Centro: Cronômetro e Controles do Placar */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Alvo: {config.targetScore} pts
            </div>

            <div className="text-2xl font-mono font-black tracking-wider text-amber-400 tabular-nums">
              {formatTime(match.timerSeconds)}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onToggleTimer}
                title={match.isPlaying ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 flex items-center justify-center active:scale-90 transition"
              >
                {match.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                onClick={onSwapSides}
                title="Inverter lados da quadra no placar"
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 flex items-center justify-center active:scale-90 transition"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onToggleFullscreen}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition active:scale-95"
            >
              <Maximize2 className="w-3 h-3 text-amber-400" />
              Tela Cheia
            </button>
          </div>

          {/* Lado Direito */}
          <div
            className={`flex flex-col items-center p-2.5 rounded-xl bg-gradient-to-b ${right.cardBg} border ${
              right.isWinner ? 'border-emerald-400 ring-2 ring-emerald-400/30' : right.cardBorder
            } transition-all`}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <span className={`text-[11px] font-black tracking-wider ${right.accentText}`}>
                {right.name}
              </span>
              {right.isServing && <span title="Com o saque" className="text-xs">🏐</span>}
            </div>

            <div className="text-4xl font-black text-white tabular-nums my-1 leading-none">
              {right.score}
            </div>

            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                onClick={() => onUpdateScore(right.id, 1)}
                className={`w-10 h-10 rounded-full ${right.accentBg} text-white flex items-center justify-center shadow-md active:scale-90 transition`}
                aria-label={`Adicionar ponto ${right.name}`}
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
              <button
                onClick={() => onUpdateScore(right.id, -1)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center active:scale-90 transition"
                aria-label={`Diminuir ponto ${right.name}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay Placar Pro em Tela Cheia */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 animate-fadeIn select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                Set a {config.targetScore} pts {config.deuceRule ? '(Vai a 2)' : ''}
              </span>
              {wakeLockActive && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[11px] font-bold text-amber-300">
                  <Zap className="w-3 h-3" /> Tela Acesa
                </span>
              )}
            </div>

            {/* Timer in Fullscreen */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full">
              <span className="text-xl sm:text-2xl font-mono font-black text-amber-400 tabular-nums">
                {formatTime(match.timerSeconds)}
              </span>
              <button
                onClick={onToggleTimer}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white"
              >
                {match.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={onResetTimer}
                title="Zerar cronômetro"
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onSwapSides}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 active:scale-95 transition flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Lados</span>
              </button>
              <button
                onClick={onToggleFullscreen}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 active:scale-95 transition"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Winner Banner in Fullscreen */}
          {evalStatus.winner && (
            <div className="my-2 flex justify-center">
              <button
                onClick={() => {
                  onRegisterWin(evalStatus.winner!);
                  onToggleFullscreen();
                }}
                className="px-6 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-xl shadow-emerald-500/30 animate-bounce"
              >
                <Trophy className="w-5 h-5" />
                CONFIRMAR VITÓRIA DO TIME {evalStatus.winner} E RODAR FILA
              </button>
            </div>
          )}

          {/* Giant Score Blocks */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
            {[left, right].map((team) => (
              <div
                key={team.id}
                onClick={() => onUpdateScore(team.id, 1)}
                className={`relative rounded-3xl bg-gradient-to-b ${team.cardBg} border-2 ${
                  team.isWinner
                    ? 'border-emerald-400 ring-4 ring-emerald-400/20'
                    : team.isSetPoint
                    ? 'border-amber-400'
                    : team.cardBorder
                } flex flex-col items-center justify-between p-5 cursor-pointer active:scale-[0.99] transition`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className={`text-lg sm:text-2xl font-black tracking-widest ${team.accentText}`}>
                    {team.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {team.isServing && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                        🏐 SAQUE
                      </span>
                    )}
                    {team.isSetPoint && (
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold">
                        🔥 SET POINT
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[110px] sm:text-[160px] font-black leading-none tabular-nums tracking-tighter select-none my-auto">
                  {team.score}
                </div>

                <div
                  className="w-full flex items-center justify-between gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onUpdateScore(team.id, -1)}
                    className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center active:scale-90 transition"
                  >
                    <Minus className="w-6 h-6" />
                  </button>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Toque no card para +1 ponto
                  </span>
                  <button
                    onClick={() => onUpdateScore(team.id, 1)}
                    className={`w-14 h-14 rounded-2xl ${team.accentBg} text-white flex items-center justify-center shadow-lg active:scale-90 transition`}
                  >
                    <Plus className="w-7 h-7" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
