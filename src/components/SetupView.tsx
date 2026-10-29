import React, { useMemo, useState } from 'react';
import {
  Users,
  Trophy,
  Flame,
  Shuffle,
  ListOrdered,
  Trash2,
  Play,
  UserPlus,
  ClipboardPaste,
  X
} from 'lucide-react';
import { MatchConfig } from '../types/game';
import { parseWhatsAppList } from '../utils/volleyballRules';

interface SetupViewProps {
  rawListText: string;
  config: MatchConfig;
  onChangeText: (text: string) => void;
  onChangeConfig: (partial: Partial<MatchConfig>) => void;
  onStartMatch: () => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  rawListText,
  config,
  onChangeText,
  onChangeConfig,
  onStartMatch
}) => {
  const [inputMode, setInputMode] = useState<'single' | 'paste'>('single');
  const [singleName, setSingleName] = useState('');

  const parsedPlayers = useMemo(() => parseWhatsAppList(rawListText).players, [rawListText]);

  const handleAddSinglePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = singleName.trim();
    if (!trimmed) return;

    const currentNames = parsedPlayers.map((p) => p.name);
    const updatedNames = [...currentNames, trimmed];
    onChangeText(updatedNames.join('\n'));
    setSingleName('');
  };

  const handleRemoveSinglePlayer = (indexToRemove: number) => {
    const currentNames = parsedPlayers.map((p) => p.name);
    const updatedNames = currentNames.filter((_, idx) => idx !== indexToRemove);
    onChangeText(updatedNames.join('\n'));
  };

  const teamPresets = [
    { size: 2, label: 'Dupla (2x2)' },
    { size: 3, label: 'Trio (3x3)' },
    { size: 4, label: 'Quarteto (4x4)' },
    { size: 6, label: 'Sexteto (6x6)' }
  ];

  const scorePresets = [12, 15, 21, 25];

  const teamsCount = Math.floor(parsedPlayers.length / config.teamSize);
  const queueCount = Math.max(0, parsedPlayers.length - config.teamSize * 2);

  return (
    <div className="space-y-4 pb-10 animate-fadeIn">
      {/* Players Input Card */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Jogadores
          </label>
          {parsedPlayers.length > 0 && (
            <button
              type="button"
              onClick={() => onChangeText('')}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-900/50 transition"
            >
              <Trash2 className="w-3 h-3" /> Limpar lista
            </button>
          )}
        </div>

        {/* Toggle: Adicionar um por um vs Colar lista */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => setInputMode('single')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              inputMode === 'single'
                ? 'bg-slate-800 text-amber-400 shadow-xs border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Um por um
          </button>
          <button
            type="button"
            onClick={() => setInputMode('paste')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              inputMode === 'paste'
                ? 'bg-slate-800 text-amber-400 shadow-xs border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            Colar lista
          </button>
        </div>

        {inputMode === 'single' ? (
          <div className="space-y-3">
            <form onSubmit={handleAddSinglePlayer} className="flex items-center gap-2">
              <input
                type="text"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                placeholder="Nome do jogador..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                Adicionar
              </button>
            </form>

            {parsedPlayers.length === 0 ? (
              <div className="py-5 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Nenhum jogador adicionado ainda.
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/60 bg-slate-950/60 rounded-xl border border-slate-800/80 p-1.5">
                {parsedPlayers.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-900 rounded-lg transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-black text-amber-400 w-5">
                        {idx + 1}.
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {p.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSinglePlayer(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition"
                      title="Remover jogador"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={rawListText}
              onChange={(e) => onChangeText(e.target.value)}
              rows={6}
              placeholder={"Cole aqui a lista copiada (um nome por linha)...\n1- Nome\n2- Nome\n3- Nome"}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/70 text-sm text-slate-100 placeholder:text-slate-600 font-medium leading-relaxed"
            />

            {parsedPlayers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto no-scrollbar">
                {parsedPlayers.map((p, i) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/80 text-[11px] text-slate-200"
                  >
                    <span className="text-amber-400 font-bold">{i + 1}.</span> {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Detection Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30">
            {parsedPlayers.length} {parsedPlayers.length === 1 ? 'jogador na lista' : 'jogadores na lista'}
          </span>
          {parsedPlayers.length >= 2 && (
            <span className="text-slate-400 font-medium">
              {teamsCount >= 2
                ? `2 times de ${config.teamSize} + ${queueCount} na fila`
                : 'Jogadores suficientes para iniciar'}
            </span>
          )}
        </div>
      </div>

      {/* Team Distribution Mode (Shuffle vs Order) */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Formação Inicial dos Times
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeConfig({ shuffleInitial: true })}
            className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
              config.shuffleInitial
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Shuffle className={`w-5 h-5 shrink-0 ${config.shuffleInitial ? 'text-amber-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-xs font-bold">Sortear Tudo</div>
              <div className="text-[10px] opacity-75">Embaralha a lista</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangeConfig({ shuffleInitial: false })}
            className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
              !config.shuffleInitial
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <ListOrdered className={`w-5 h-5 shrink-0 ${!config.shuffleInitial ? 'text-amber-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-xs font-bold">Ordem da Lista</div>
              <div className="text-[10px] opacity-75">Por ordem de chegada</div>
            </div>
          </button>
        </div>
      </div>

      {/* Team Size */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            Jogadores por Time
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChangeConfig({ teamSize: Math.max(2, config.teamSize - 1) })}
              className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 active:scale-95"
            >
              -
            </button>
            <span className="w-10 text-center font-black text-base text-amber-400">{config.teamSize}</span>
            <button
              type="button"
              onClick={() => onChangeConfig({ teamSize: Math.min(10, config.teamSize + 1) })}
              className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {teamPresets.map((preset) => (
            <button
              key={preset.size}
              type="button"
              onClick={() => onChangeConfig({ teamSize: preset.size })}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition ${
                config.teamSize === preset.size
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Score & Deuce ("Vai a 2") */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Pontos do Set
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChangeConfig({ targetScore: Math.max(5, config.targetScore - 1) })}
              className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 active:scale-95"
            >
              -
            </button>
            <span className="w-10 text-center font-black text-base text-amber-400">{config.targetScore}</span>
            <button
              type="button"
              onClick={() => onChangeConfig({ targetScore: Math.min(50, config.targetScore + 1) })}
              className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {scorePresets.map((pts) => (
            <button
              key={pts}
              type="button"
              onClick={() => onChangeConfig({ targetScore: pts })}
              className={`py-2 rounded-xl text-xs font-bold border transition ${
                config.targetScore === pts
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
              }`}
            >
              {pts} pts
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-200">Regra "Vai a 2" (Diferença de 2 pts)</div>
            <div className="text-[11px] text-slate-400">Exige abrir 2 pontos de vantagem no final do set</div>
          </div>
          <button
            type="button"
            onClick={() => onChangeConfig({ deuceRule: !config.deuceRule })}
            className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
              config.deuceRule ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Max Wins Rotation */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg flex items-center justify-between">
        <div>
          <label className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Limite de Vitórias Seguidas
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Após {config.maxWins} {config.maxWins === 1 ? 'vitória' : 'vitórias'}, o time vencedor também roda
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChangeConfig({ maxWins: Math.max(1, config.maxWins - 1) })}
            className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 active:scale-95"
          >
            -
          </button>
          <span className="w-8 text-center font-black text-base text-orange-400">{config.maxWins}</span>
          <button
            type="button"
            onClick={() => onChangeConfig({ maxWins: Math.min(20, config.maxWins + 1) })}
            className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      {/* Start Button */}
      <button
        type="button"
        onClick={onStartMatch}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:brightness-105 active:scale-[0.98] transition flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5 fill-slate-950" />
        GERAR TIMES E ENTRAR EM QUADRA
      </button>
    </div>
  );
};
