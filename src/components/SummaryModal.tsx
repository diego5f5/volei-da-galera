import React, { useState, useEffect } from 'react';
import { X, Trophy, History, Share2, Check, Crown } from 'lucide-react';
import { GameState } from '../types/game';
import { formatTime, generateWhatsAppSummary, getAllPlayers } from '../utils/volleyballRules';

interface SummaryModalProps {
  isOpen: boolean;
  state: GameState;
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, state, onClose }) => {
  const [tab, setTab] = useState<'ranking' | 'history'>('ranking');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rankedPlayers = getAllPlayers(state).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const rateA = a.gamesPlayed > 0 ? a.wins / a.gamesPlayed : 0;
    const rateB = b.gamesPlayed > 0 ? b.wins / b.gamesPlayed : 0;
    if (rateB !== rateA) return rateB - rateA;
    return b.gamesPlayed - a.gamesPlayed;
  });

  const handleCopyWhatsApp = async () => {
    const text = generateWhatsAppSummary(state);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border-t sm:border border-slate-800 w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-white">Resumo da Partida</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 p-2 bg-slate-950 border-b border-slate-800 gap-2">
          <button
            onClick={() => setTab('ranking')}
            className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
              tab === 'ranking'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Ranking ({rankedPlayers.length})
          </button>
          <button
            onClick={() => setTab('history')}
            className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
              tab === 'history'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Partidas ({state.history.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2.5">
          {tab === 'ranking' ? (
            rankedPlayers.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">Nenhum jogador registrado.</p>
            ) : (
              rankedPlayers.map((player, idx) => {
                const winRate =
                  player.gamesPlayed > 0 ? Math.round((player.wins / player.gamesPlayed) * 100) : 0;
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border ${
                      idx === 0 && player.wins > 0
                        ? 'bg-amber-400/10 border-amber-400/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="text-sm font-black w-6 text-center shrink-0">{medal}</span>
                      <div className="min-w-0 truncate">
                        <div className="text-xs font-bold text-white truncate">{player.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Aproveitamento: {winRate}% • Máx seq: {player.maxWinStreak}🔥
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black">
                        {player.wins}V
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">
                        {player.gamesPlayed}J
                      </span>
                    </div>
                  </div>
                );
              })
            )
          ) : state.history.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">
              Nenhuma partida finalizada ainda.
            </p>
          ) : (
            [...state.history].reverse().map((m) => (
              <div
                key={m.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2.5 overflow-hidden"
              >
                {/* Cabeçalho do jogo: Jogo #X e Duração */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-slate-200">Jogo #{m.matchNumber}</span>
                  <span className="font-mono text-slate-400">⏱️ {formatTime(m.durationSeconds)}</span>
                </div>

                {/* Confronto e Placar central (grid 3 colunas que nunca estoura nem quebra) */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  {/* Time A */}
                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="text-xs font-black text-sky-400 flex items-center gap-1 truncate">
                      <span>TIME A</span>
                      {m.winner === 'A' && <span title="Vencedor">🏆</span>}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-snug break-words mt-1">
                      {m.teamANames.join(', ')}
                    </div>
                  </div>

                  {/* Placar central - sempre em linha única (whitespace-nowrap) */}
                  <div className="shrink-0 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs">
                    <span
                      className={`text-base font-black tabular-nums ${
                        m.winner === 'A' ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {m.scoreA}
                    </span>
                    <span className="text-slate-600 font-bold text-xs">x</span>
                    <span
                      className={`text-base font-black tabular-nums ${
                        m.winner === 'B' ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {m.scoreB}
                    </span>
                  </div>

                  {/* Time B */}
                  <div className="min-w-0 flex flex-col justify-center items-end text-right">
                    <div className="text-xs font-black text-rose-400 flex items-center justify-end gap-1 truncate">
                      {m.winner === 'B' && <span title="Vencedor">🏆</span>}
                      <span>TIME B</span>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-snug break-words mt-1 text-right">
                      {m.teamBNames.join(', ')}
                    </div>
                  </div>
                </div>

                {m.rotatedByMaxWins && (
                  <div className="text-[10px] text-amber-400 font-bold text-center pt-2 border-t border-slate-800/60">
                    🔥 Limite de vitórias atingido — Time vencedor também rodou!
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer: Copiar para WhatsApp */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={handleCopyWhatsApp}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
          >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Resumo Copiado!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Copiar Resumo da Partida
                </>
              )}
          </button>
        </div>
      </div>
    </div>
  );
};
