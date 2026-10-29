import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Clock, Users } from 'lucide-react';
import { Player } from '../types/game';

interface QueueSectionProps {
  queue: Player[];
  teamSize: number;
  onAddPlayer: (name: string) => void;
  onRemoveFromQueue: (playerId: number) => void;
  onSelectPlayer: (player: Player) => void;
}

export const QueueSection: React.FC<QueueSectionProps> = ({
  queue,
  teamSize,
  onAddPlayer,
  onRemoveFromQueue,
  onSelectPlayer
}) => {
  const [newName, setNewName] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddPlayer(newName.trim());
    setNewName('');
  };

  return (
    <div className="space-y-3">
      {/* Card da Fila de Espera */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="bg-slate-800/70 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm text-white">Fila de Espera</span>
          </div>
          <div className="flex items-center gap-1.5">
            {queue.length > 0 && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Próximo time: 1º ao {Math.min(teamSize, queue.length)}º
              </span>
            )}
            <span className="bg-slate-950 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {queue.length} {queue.length === 1 ? 'pessoa' : 'pessoas'}
            </span>
          </div>
        </div>

        <div className="p-2 max-h-64 overflow-y-auto divide-y divide-slate-800/60">
          {queue.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              Ninguém esperando na fila no momento.
            </div>
          ) : (
            queue.map((player, idx) => {
              const isNextTeam = idx < teamSize;
              const waitMins =
                player.waitingSince > 0 ? Math.max(0, Math.floor((now - player.waitingSince) / 60000)) : 0;

              return (
                <div
                  key={player.id}
                  onClick={() => onSelectPlayer(player)}
                  className={`flex items-center justify-between py-2 px-2 rounded-xl cursor-pointer transition ${
                    isNextTeam
                      ? 'bg-amber-400/5 hover:bg-amber-400/10'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${
                        isNextTeam
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}º
                    </span>
                    <div className="truncate">
                      <span className="text-xs font-semibold text-slate-100 truncate block">
                        {player.name}
                      </span>
                      {isNextTeam && (
                        <span className="text-[10px] font-bold text-amber-400/90 block leading-none mt-0.5">
                          Próximo a entrar
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded-md border border-slate-800">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      {waitMins}m
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-slate-700">
                      🏐 {player.gamesPlayed}
                    </span>
                    <button
                      type="button"
                      title="Remover da fila"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromQueue(player.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 active:scale-90 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Adicionar Jogador Atrasado */}
      <form
        onSubmit={handleAdd}
        className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-lg"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Chegou agora? Digite o nome..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        />
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Na Fila
        </button>
      </form>
    </div>
  );
};
