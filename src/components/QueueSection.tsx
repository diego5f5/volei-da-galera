import React, { useState, useEffect } from 'react';
import { UserPlus, Clock, Users, HelpCircle, X, ShieldAlert, Award, ArrowDownUp } from 'lucide-react';
import { Player } from '../types/game';

interface QueueSectionProps {
  queue: Player[];
  teamSize: number;
  onAddPlayer: (name: string) => void;
  onSelectPlayer: (player: Player) => void;
}

export const QueueSection: React.FC<QueueSectionProps> = ({
  queue,
  teamSize,
  onAddPlayer,
  onSelectPlayer
}) => {
  const [newName, setNewName] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
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
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              title="Entenda as regras da fila"
              className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 active:scale-90 transition flex items-center"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
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

      {/* Modal Explicativo das Regras da Fila */}
      {showRulesModal && (
        <div
          onClick={() => setShowRulesModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border-t sm:border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <ArrowDownUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Como Funciona a Fila?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              O sistema utiliza um algoritmo automático e justo para garantir que todo mundo jogue e ninguém fique esquecido de fora:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  1ª Prioridade: Tempo de Espera (FIFO)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Quem está esperando há mais tempo na fila tem a preferência absoluta para entrar na quadra na próxima rotação.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1">
                <div className="font-bold text-sky-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  2ª Prioridade: Menos Partidas Jogadas (Desempate)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Se duas ou mais pessoas entraram na fila juntas (como os jogadores do time que acabou de perder), quem jogou <strong className="text-white">menos partidas (🏐)</strong> no dia fica na frente.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1">
                <div className="font-bold text-orange-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Limite do Rei da Quadra
                </div>
                <p className="text-slate-300 leading-relaxed">
                  O time perdedor vai para a fila. Se o time vencedor atingir o teto de vitórias seguidas (configurado na tela inicial), ele também sai e vai para a fila, permitindo a rotação de quem está aguardando.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
