import React from 'react';
import { Download, X, Sparkles } from 'lucide-react';

interface InstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ onInstall, onDismiss }) => {
  return (
    <aside
      aria-label="Instalar aplicativo"
      className="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-blue-500/30 px-3.5 pb-2.5 shadow-xl relative z-40 animate-fadeIn"
      style={{
        paddingTop: 'calc(max(0.625rem, env(safe-area-inset-top, 0px)) + 0.25rem)',
        paddingLeft: 'max(0.875rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.875rem, env(safe-area-inset-right, 0px))'
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Logo / Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-base shrink-0 shadow-md font-bold">
            🏐
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-xs font-black text-white truncate">Instalar Vôlei da Galera</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-bold shrink-0">
                <Sparkles className="w-2.5 h-2.5" /> PWA
              </span>
            </div>
            <p className="text-[11px] text-blue-200/90 truncate mt-0.5">
              Atalho na tela de início, funciona offline
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onInstall}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            Instalar
          </button>
          <button
            onClick={onDismiss}
            title="Agora não"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-90 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
