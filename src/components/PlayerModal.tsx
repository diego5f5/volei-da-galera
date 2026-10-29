import React, { useState, useEffect } from 'react';
import { X, Trophy, Flame, Clock, Edit3, Check, ArrowLeftRight, Trash2 } from 'lucide-react';
import { Player, TeamId } from '../types/game';

interface PlayerModalProps {
  player: Player | null;
  location: { type: 'team'; team: TeamId } | { type: 'queue'; position: number } | null;
  onClose: () => void;
  onRenamePlayer: (playerId: number, newName: string) => void;
  onSubstitutePlayer: (team: TeamId, playerId: number) => void;
  onRemovePlayer: (playerId: number) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  location,
  onClose,
  onRenamePlayer,
  onSubstitutePlayer,
  onRemovePlayer
}) => {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(player?.name ?? '');

  // Sempre que o jogador mudar ou o modal abrir/fechar, reseta o estado de edição
  useEffect(() => {
    if (player) {
      setNameInput(player.name);
      setEditing(false);
    }
  }, [player?.id, player?.name]);

  // Trava o scroll do body/html enquanto o modal estiver aberto
  useEffect(() => {
    if (player) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [player]);

  const handleClose = () => {
    setEditing(false);
    if (player) {
      setNameInput(player.name);
    }
    onClose();
  };

  if (!player || !location) return null;

  const waitMins =
    location.type === 'queue' && player.waitingSince > 0
      ? Math.max(0, Math.floor((Date.now() - player.waitingSince) / 60000))
      : 0;

  const winRate =
    player.gamesPlayed > 0 ? Math.round((player.wins / player.gamesPlayed) * 100) : 0;

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      onRenamePlayer(player.id, trimmed);
    }
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setNameInput(player.name);
    setEditing(false);
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border-t sm:border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="bg-slate-950 border border-amber-400 rounded-xl px-3 py-1.5 text-base font-bold text-white w-full focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  title="Salvar alteração"
                  className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 active:scale-95 transition"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  title="Cancelar edição"
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white active:scale-95 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white break-words">{player.name}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(player.name);
                    setEditing(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Editar nome"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-xs font-semibold text-amber-400 mt-0.5">
              {location.type === 'team'
                ? `Em quadra • Time ${location.team}`
                : `Na fila (${location.position}º lugar) • Esperando há ${waitMins} min`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <span className="text-[11px] font-semibold text-slate-400 block">Partidas Jogadas</span>
            <span className="text-2xl font-black text-white flex items-center gap-1.5 mt-0.5">
              🏐 {player.gamesPlayed}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <span className="text-[11px] font-semibold text-slate-400 block">Vitórias ({winRate}%)</span>
            <span className="text-2xl font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <Trophy className="w-5 h-5 text-amber-400" /> {player.wins}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <span className="text-[11px] font-semibold text-slate-400 block">Sequência Atual</span>
            <span className="text-xl font-black text-orange-400 flex items-center gap-1.5 mt-0.5">
              <Flame className="w-5 h-5" /> {player.winStreak} seguidas
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <span className="text-[11px] font-semibold text-slate-400 block">Maior Sequência</span>
            <span className="text-xl font-black text-sky-400 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-4 h-4" /> {player.maxWinStreak} máx
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 pt-2">
          {location.type === 'team' && (
            <button
              type="button"
              onClick={() => {
                onSubstitutePlayer(location.team, player.id);
                handleClose();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Substituir pelo 1º da Fila
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onRemovePlayer(player.id);
              handleClose();
            }}
            className="py-3 px-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Trash2 className="w-4 h-4" />
            Remover
          </button>
        </div>
      </div>
    </div>
  );
};
