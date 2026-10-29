import React, { useEffect } from 'react';
import { X, Share2, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  isIOS: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, isIOS, onClose }) => {
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border-t sm:border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl shadow-md font-bold">
              🏐
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight">Instalar Aplicativo</h3>
              <p className="text-xs text-amber-400/90 font-medium mt-0.5">Vôlei da Galera no seu celular</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Funciona 100% offline</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Tela cheia sem barras</span>
          </div>
        </div>

        {/* Instructions */}
        {isIOS ? (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3.5 space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-400" />
              Como instalar no iPhone (Safari / Chrome):
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  No navegador, toque no botão de{' '}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-bold border border-slate-700">
                    <Share2 className="w-3 h-3" /> Compartilhar
                  </span>{' '}
                  (na barra inferior do Safari ou no topo do Chrome).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  Role as opções para baixo e toque em{' '}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                    <PlusSquare className="w-3 h-3" /> Adicionar à Tela de Início
                  </span>.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  Toque em <strong className="text-white">Adicionar</strong> no canto superior direito. Pronto! O ícone do Vôlei da Galera vai para sua tela de início.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3.5 space-y-2.5 text-xs text-slate-300">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Como instalar no Android / Computador:
            </div>
            <p>
              Toque no menu do navegador (três pontinhos <strong className="text-white">⋮</strong>) e selecione{' '}
              <span className="text-amber-300 font-bold">"Instalar aplicativo"</span> ou{' '}
              <span className="text-amber-300 font-bold">"Adicionar à tela inicial"</span>.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95"
        >
          Entendi
        </button>
      </div>
    </div>
  );
};
