import React from 'react';
import { Volume2, VolumeX, Undo2, Trophy, RotateCcw, Download } from 'lucide-react';
import { AppView } from '../types/game';

interface HeaderProps {
  view: AppView;
  soundEnabled: boolean;
  canUndo: boolean;
  lastUndoLabel?: string;
  historyCount: number;
  showInstallButton?: boolean;
  onInstallClick?: () => void;
  onToggleSound: () => void;
  onUndo: () => void;
  onOpenSummary: () => void;
  onResetSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  view,
  soundEnabled,
  canUndo,
  lastUndoLabel,
  historyCount,
  showInstallButton = false,
  onInstallClick,
  onToggleSound,
  onUndo,
  onOpenSummary,
  onResetSession
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 pt-3 pb-3 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-blue-600 p-0.5 shadow-md shadow-amber-500/10 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-lg">
              🏐
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white leading-none flex items-center gap-1.5">
              Vôlei da Galera
            </h1>
            <p className="text-[11px] font-medium text-amber-400/90 mt-0.5">
              {view === 'setup' ? 'Configurar Partida' : `Em Quadra • ${historyCount} ${historyCount === 1 ? 'jogo' : 'jogos'}`}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          {showInstallButton && onInstallClick && (
            <button
              onClick={onInstallClick}
              title="Instalar App na tela de início"
              className="p-2 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/25 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {view === 'match' && (
            <>
              <button
                onClick={onUndo}
                disabled={!canUndo}
                title={lastUndoLabel ? `Desfazer: ${lastUndoLabel}` : 'Nada para desfazer'}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition active:scale-95 ${
                  canUndo
                    ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                    : 'bg-slate-900/50 border-slate-800/60 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Undo2 className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSummary}
                title="Ranking e Histórico"
                className="relative p-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 hover:bg-slate-700 transition active:scale-95"
              >
                <Trophy className="w-4 h-4" />
                {historyCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {historyCount}
                  </span>
                )}
              </button>
            </>
          )}

          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Som ativado' : 'Som desativado'}
            className={`p-2 rounded-xl border transition active:scale-95 ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-sky-400 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {view === 'match' && (
            <button
              onClick={onResetSession}
              title="Nova Sessão / Configurar"
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-400 hover:bg-rose-950/50 hover:border-rose-800 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
