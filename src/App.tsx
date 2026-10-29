import React, { useState, useEffect, useCallback } from 'react';
import {
  CompletedMatch,
  GameState,
  MatchConfig,
  Player,
  TeamId,
  UndoSnapshot
} from './types/game';
import {
  evaluateMatchStatus,
  parseWhatsAppList,
  shuffleArray,
  sortQueuePlayers
} from './utils/volleyballRules';
import { soundFX } from './utils/sound';
import { Header } from './components/Header';
import { SetupView } from './components/SetupView';
import { Scoreboard } from './components/Scoreboard';
import { CourtTeams } from './components/CourtTeams';
import { QueueSection } from './components/QueueSection';
import { PlayerModal } from './components/PlayerModal';
import { SummaryModal } from './components/SummaryModal';

const STORAGE_KEY = 'volei_da_galera_state_v2';

const INITIAL_STATE: GameState = {
  view: 'setup',
  config: {
    teamSize: 4,
    maxWins: 5,
    targetScore: 7,
    deuceRule: true,
    shuffleInitial: true,
    teamAName: 'TIME A',
    teamBName: 'TIME B'
  },
  rawListText: '',
  teamA: [],
  teamB: [],
  queue: [],
  playerIdCounter: 1,
  match: {
    scoreA: 0,
    scoreB: 0,
    timerSeconds: 0,
    isPlaying: false,
    swappedSides: false,
    servingTeam: null
  },
  history: [],
  soundEnabled: true
};

function loadInitialState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<GameState>;
      return {
        ...INITIAL_STATE,
        ...parsed,
        config: { ...INITIAL_STATE.config, ...(parsed.config || {}) },
        match: { ...INITIAL_STATE.match, ...(parsed.match || {}) }
      };
    }
  } catch {
    // Ignora falha de leitura do storage
  }
  return INITIAL_STATE;
}

export const App: React.FC = () => {
  const [state, setState] = useState<GameState>(loadInitialState);
  const [undoStack, setUndoStack] = useState<UndoSnapshot[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isConfirmEndOpen, setIsConfirmEndOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Persistência automática no LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignora erro de quota
    }
  }, [state]);

  // Cronômetro da partida
  useEffect(() => {
    if (state.view !== 'match' || !state.match.isPlaying) return;
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        match: {
          ...prev.match,
          timerSeconds: prev.match.timerSeconds + 1
        }
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.view, state.match.isPlaying]);

  const createSnapshot = (current: GameState, label: string): UndoSnapshot => ({
    label,
    timestamp: Date.now(),
    teamA: current.teamA.map((p) => ({ ...p })),
    teamB: current.teamB.map((p) => ({ ...p })),
    queue: current.queue.map((p) => ({ ...p })),
    match: { ...current.match },
    history: current.history.map((h) => ({ ...h })),
    playerIdCounter: current.playerIdCounter
  });

  const pushUndo = (current: GameState, label: string) => {
    setUndoStack((prev) => [...prev.slice(-14), createSnapshot(current, label)]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setState((prev) => ({
      ...prev,
      teamA: last.teamA,
      teamB: last.teamB,
      queue: last.queue,
      match: last.match,
      history: last.history,
      playerIdCounter: last.playerIdCounter
    }));
    showToast(`↩️ Desfeito: ${last.label}`);
  };

  const handleStartMatch = () => {
    const { players: parsed, nextId } = parseWhatsAppList(state.rawListText, 1);
    if (parsed.length < 2) {
      showToast('⚠️ Adicione pelo menos 2 jogadores na lista!');
      return;
    }

    const initialList = state.config.shuffleInitial ? shuffleArray(parsed) : parsed;
    const teamA: Player[] = [];
    const teamB: Player[] = [];
    const queue: Player[] = [];
    const now = Date.now();

    initialList.forEach((player, index) => {
      if (teamA.length < state.config.teamSize) {
        teamA.push(player);
      } else if (teamB.length < state.config.teamSize) {
        teamB.push(player);
      } else {
        queue.push({
          ...player,
          waitingSince: now + index // preserva a ordem inicial da fila
        });
      }
    });

    setUndoStack([]);
    setState((prev) => ({
      ...prev,
      view: 'match',
      teamA,
      teamB,
      queue,
      playerIdCounter: nextId,
      history: [],
      match: {
        scoreA: 0,
        scoreB: 0,
        timerSeconds: 0,
        isPlaying: true,
        swappedSides: false,
        servingTeam: null
      }
    }));

    showToast(
      state.config.shuffleInitial
        ? '🏐 Times sorteados! Bom jogo!'
        : '🏐 Times formados pela ordem da lista!'
    );
  };

  const handleRerollInitialTeams = () => {
    if (state.history.length > 0) return;
    pushUndo(state, 'Re-sorteio dos times iniciais');

    const allPlayers = shuffleArray([...state.teamA, ...state.teamB, ...state.queue]);
    const teamA: Player[] = [];
    const teamB: Player[] = [];
    const queue: Player[] = [];
    const now = Date.now();

    allPlayers.forEach((player, index) => {
      if (teamA.length < state.config.teamSize) {
        teamA.push({ ...player, waitingSince: 0 });
      } else if (teamB.length < state.config.teamSize) {
        teamB.push({ ...player, waitingSince: 0 });
      } else {
        queue.push({
          ...player,
          waitingSince: now + index
        });
      }
    });

    setState((prev) => ({
      ...prev,
      teamA,
      teamB,
      queue
    }));

    showToast('🎲 Times iniciais re-sorteados!');
  };

  const handleUpdateScore = (team: TeamId, delta: number) => {
    const currentScore = team === 'A' ? state.match.scoreA : state.match.scoreB;
    const newScore = Math.max(0, currentScore + delta);
    if (newScore === currentScore) return;

    const nextScoreA = team === 'A' ? newScore : state.match.scoreA;
    const nextScoreB = team === 'B' ? newScore : state.match.scoreB;

    if (delta > 0 && state.soundEnabled) {
      const status = evaluateMatchStatus(nextScoreA, nextScoreB, state.config);
      if (status.winner) {
        soundFX.playWhistleVictory();
      } else if (status.setPoint) {
        soundFX.playSetPoint();
      } else {
        soundFX.playPoint(team === 'A');
      }
    }

    setState((prev) => ({
      ...prev,
      match: {
        ...prev.match,
        scoreA: nextScoreA,
        scoreB: nextScoreB,
        servingTeam: delta > 0 ? team : prev.match.servingTeam
      }
    }));
  };

  const handleRegisterWin = (winningTeam: TeamId) => {
    pushUndo(state, `Vitória do Time ${winningTeam}`);

    const now = Date.now();
    const winnersSource = winningTeam === 'A' ? state.teamA : state.teamB;
    const losersSource = winningTeam === 'A' ? state.teamB : state.teamA;

    const updatedWinners = winnersSource.map((p) => {
      const nextStreak = p.winStreak + 1;
      return {
        ...p,
        gamesPlayed: p.gamesPlayed + 1,
        wins: p.wins + 1,
        winStreak: nextStreak,
        maxWinStreak: Math.max(p.maxWinStreak, nextStreak)
      };
    });

    const updatedLosers = losersSource.map((p, idx) => ({
      ...p,
      gamesPlayed: p.gamesPlayed + 1,
      losses: p.losses + 1,
      winStreak: 0,
      waitingSince: now + idx
    }));

    let nextQueue = [...state.queue, ...updatedLosers];
    let nextTeamA = winningTeam === 'A' ? [...updatedWinners] : [];
    let nextTeamB = winningTeam === 'B' ? [...updatedWinners] : [];
    let rotatedByMaxWins = false;

    // Verifica se o time vencedor atingiu o limite de vitórias seguidas
    if (updatedWinners.length > 0 && updatedWinners[0].winStreak >= state.config.maxWins) {
      rotatedByMaxWins = true;
      const restingWinners = updatedWinners.map((p, idx) => ({
        ...p,
        winStreak: 0,
        waitingSince: now + 100 + idx
      }));
      nextQueue.push(...restingWinners);
      if (winningTeam === 'A') nextTeamA = [];
      else nextTeamB = [];
    }

    nextQueue = sortQueuePlayers(nextQueue);

    while (nextTeamA.length < state.config.teamSize && nextQueue.length > 0) {
      const nextPlayer = nextQueue.shift()!;
      nextTeamA.push({ ...nextPlayer, waitingSince: 0 });
    }

    while (nextTeamB.length < state.config.teamSize && nextQueue.length > 0) {
      const nextPlayer = nextQueue.shift()!;
      nextTeamB.push({ ...nextPlayer, waitingSince: 0 });
    }

    const completedMatch: CompletedMatch = {
      id: `${now}-${state.history.length + 1}`,
      matchNumber: state.history.length + 1,
      winner: winningTeam,
      scoreA: state.match.scoreA,
      scoreB: state.match.scoreB,
      durationSeconds: state.match.timerSeconds,
      timestamp: now,
      teamANames: state.teamA.map((p) => p.name),
      teamBNames: state.teamB.map((p) => p.name),
      rotatedByMaxWins
    };

    if (state.soundEnabled) {
      soundFX.playWhistleVictory();
    }

    setState((prev) => ({
      ...prev,
      teamA: nextTeamA,
      teamB: nextTeamB,
      queue: nextQueue,
      history: [...prev.history, completedMatch],
      match: {
        scoreA: 0,
        scoreB: 0,
        timerSeconds: 0,
        isPlaying: true,
        swappedSides: false,
        servingTeam: null
      }
    }));

    if (rotatedByMaxWins) {
      showToast(
        `🏆 Vitória do Time ${winningTeam}! (${state.config.maxWins} vitórias seguidas: os dois times rodaram!)`
      );
    } else {
      showToast(`🏆 Vitória do Time ${winningTeam}! Próximo time em quadra!`);
    }
  };

  const handleSubstitutePlayer = (teamId: TeamId, playerId: number) => {
    const teamList = teamId === 'A' ? [...state.teamA] : [...state.teamB];
    const index = teamList.findIndex((p) => p.id === playerId);
    if (index === -1) return;

    const outgoing = teamList[index];
    pushUndo(state, `Substituição de ${outgoing.name}`);

    const nextQueue = [...state.queue];
    let incomingName = '';

    if (nextQueue.length > 0) {
      const incoming = { ...nextQueue.shift()!, waitingSince: 0 };
      teamList[index] = incoming;
      incomingName = incoming.name;
    } else {
      teamList.splice(index, 1);
    }

    nextQueue.push({
      ...outgoing,
      waitingSince: Date.now()
    });

    const sortedQueue = sortQueuePlayers(nextQueue);

    setState((prev) => ({
      ...prev,
      teamA: teamId === 'A' ? teamList : prev.teamA,
      teamB: teamId === 'B' ? teamList : prev.teamB,
      queue: sortedQueue
    }));

    if (incomingName) {
      showToast(`🔄 ${incomingName} entrou no lugar de ${outgoing.name}`);
    } else {
      showToast(`ℹ️ ${outgoing.name} foi para a fila de espera`);
    }
  };

  const handleAddPlayerMidGame = (name: string) => {
    pushUndo(state, `Entrada de ${name}`);
    const newPlayer: Player = {
      id: state.playerIdCounter,
      name,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winStreak: 0,
      maxWinStreak: 0,
      waitingSince: Date.now()
    };

    // Se algum time em quadra estiver incompleto e não houver ninguém na fila antes, já completa!
    if (state.queue.length === 0 && state.teamA.length < state.config.teamSize) {
      setState((prev) => ({
        ...prev,
        playerIdCounter: prev.playerIdCounter + 1,
        teamA: [...prev.teamA, { ...newPlayer, waitingSince: 0 }]
      }));
      showToast(`🏐 ${name} entrou direto para completar o Time A!`);
      return;
    }

    if (state.queue.length === 0 && state.teamB.length < state.config.teamSize) {
      setState((prev) => ({
        ...prev,
        playerIdCounter: prev.playerIdCounter + 1,
        teamB: [...prev.teamB, { ...newPlayer, waitingSince: 0 }]
      }));
      showToast(`🏐 ${name} entrou direto para completar o Time B!`);
      return;
    }

    setState((prev) => ({
      ...prev,
      playerIdCounter: prev.playerIdCounter + 1,
      queue: sortQueuePlayers([...prev.queue, newPlayer])
    }));
    showToast(`🏐 ${name} adicionado(a) na fila!`);
  };

  const handleRemovePlayer = (playerId: number) => {
    const inA = state.teamA.find((p) => p.id === playerId);
    const inB = state.teamB.find((p) => p.id === playerId);
    const inQ = state.queue.find((p) => p.id === playerId);
    const target = inA || inB || inQ;
    if (!target) return;

    pushUndo(state, `Remoção de ${target.name}`);

    if (inQ) {
      setState((prev) => ({
        ...prev,
        queue: prev.queue.filter((p) => p.id !== playerId)
      }));
      showToast(`🗑️ ${target.name} removido(a) da fila`);
      return;
    }

    // Se estava em quadra, puxa o primeiro da fila para não deixar buraco
    const teamId: TeamId = inA ? 'A' : 'B';
    const currentTeam = inA ? [...state.teamA] : [...state.teamB];
    const nextQueue = [...state.queue];
    const idx = currentTeam.findIndex((p) => p.id === playerId);

    if (nextQueue.length > 0) {
      currentTeam[idx] = { ...nextQueue.shift()!, waitingSince: 0 };
    } else {
      currentTeam.splice(idx, 1);
    }

    setState((prev) => ({
      ...prev,
      teamA: teamId === 'A' ? currentTeam : prev.teamA,
      teamB: teamId === 'B' ? currentTeam : prev.teamB,
      queue: nextQueue
    }));
    showToast(`🗑️ ${target.name} saiu da partida`);
  };

  const handleRenamePlayer = (playerId: number, newName: string) => {
    const updateList = (list: Player[]) =>
      list.map((p) => (p.id === playerId ? { ...p, name: newName } : p));

    setState((prev) => ({
      ...prev,
      teamA: updateList(prev.teamA),
      teamB: updateList(prev.teamB),
      queue: updateList(prev.queue)
    }));
    showToast(`✏️ Nome atualizado para ${newName}`);
  };

  // Localiza jogador selecionado para o Modal de Detalhes
  const selectedPlayerInfo = (() => {
    if (selectedPlayerId === null) return { player: null, location: null };
    const pA = state.teamA.find((p) => p.id === selectedPlayerId);
    if (pA) return { player: pA, location: { type: 'team' as const, team: 'A' as TeamId } };
    const pB = state.teamB.find((p) => p.id === selectedPlayerId);
    if (pB) return { player: pB, location: { type: 'team' as const, team: 'B' as TeamId } };
    const qIdx = state.queue.findIndex((p) => p.id === selectedPlayerId);
    if (qIdx !== -1) {
      return {
        player: state.queue[qIdx],
        location: { type: 'queue' as const, position: qIdx + 1 }
      };
    }
    return { player: null, location: null };
  })();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="bg-slate-800/95 border border-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl animate-fadeIn">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        view={state.view}
        soundEnabled={state.soundEnabled}
        canUndo={undoStack.length > 0}
        lastUndoLabel={undoStack[undoStack.length - 1]?.label}
        historyCount={state.history.length}
        onToggleSound={() =>
          setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onUndo={handleUndo}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onResetSession={() => setIsConfirmEndOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto p-4">
        {state.view === 'setup' ? (
          <SetupView
            rawListText={state.rawListText}
            config={state.config}
            onChangeText={(rawListText) => setState((prev) => ({ ...prev, rawListText }))}
            onChangeConfig={(partial: Partial<MatchConfig>) =>
              setState((prev) => ({
                ...prev,
                config: { ...prev.config, ...partial }
              }))
            }
            onStartMatch={handleStartMatch}
          />
        ) : (
          <div className="space-y-4 pb-12 animate-fadeIn">
            {/* Placar e Cronômetro */}
            <Scoreboard
              match={state.match}
              config={state.config}
              teamA={state.teamA}
              teamB={state.teamB}
              isFullscreen={isFullscreen}
              onUpdateScore={handleUpdateScore}
              onToggleTimer={() =>
                setState((prev) => ({
                  ...prev,
                  match: { ...prev.match, isPlaying: !prev.match.isPlaying }
                }))
              }
              onResetTimer={() =>
                setState((prev) => ({
                  ...prev,
                  match: { ...prev.match, timerSeconds: 0 }
                }))
              }
              onSwapSides={() =>
                setState((prev) => ({
                  ...prev,
                  match: { ...prev.match, swappedSides: !prev.match.swappedSides }
                }))
              }
              onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
              onRegisterWin={handleRegisterWin}
            />

            {/* Quadra: Time A e Time B */}
            <CourtTeams
              teamA={state.teamA}
              teamB={state.teamB}
              config={state.config}
              canRerollInitialTeams={state.history.length === 0}
              onRerollInitialTeams={handleRerollInitialTeams}
              onSubstitutePlayer={handleSubstitutePlayer}
              onSelectPlayer={(p) => setSelectedPlayerId(p.id)}
              onRegisterWin={handleRegisterWin}
            />

            {/* Fila de Espera e Entrada de Jogadores */}
            <QueueSection
              queue={state.queue}
              teamSize={state.config.teamSize}
              onAddPlayer={handleAddPlayerMidGame}
              onRemoveFromQueue={handleRemovePlayer}
              onSelectPlayer={(p) => setSelectedPlayerId(p.id)}
            />

            {/* Botões de Rodapé da Sessão */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsSummaryOpen(true)}
                className="flex-1 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-amber-400 transition active:scale-95"
              >
                📊 Ver Ranking & Histórico ({state.history.length})
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmEndOpen(true)}
                className="py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-800/60 text-xs font-bold text-rose-400 transition active:scale-95"
              >
                Encerrar Sessão
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Detalhes do Jogador */}
      <PlayerModal
        player={selectedPlayerInfo.player}
        location={selectedPlayerInfo.location}
        onClose={() => setSelectedPlayerId(null)}
        onRenamePlayer={handleRenamePlayer}
        onSubstitutePlayer={handleSubstitutePlayer}
        onRemovePlayer={handleRemovePlayer}
      />

      {/* Modal de Resumo / Ranking / WhatsApp */}
      <SummaryModal
        isOpen={isSummaryOpen}
        state={state}
        onClose={() => setIsSummaryOpen(false)}
      />

      {/* Modal de Confirmação para Encerrar Sessão */}
      {isConfirmEndOpen && (
        <div
          onClick={() => setIsConfirmEndOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-center"
          >
            <div className="text-4xl">🏐</div>
            <h3 className="text-lg font-black text-white">Encerrar a partida de hoje?</h3>
            <p className="text-xs text-slate-400">
              Você pode ver e copiar o resumo e ranking do dia antes de voltar para a tela inicial.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsConfirmEndOpen(false);
                  setIsSummaryOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider"
              >
                Ver Resumo / Copiar Ranking
              </button>
              <button
                onClick={() => {
                  setIsConfirmEndOpen(false);
                  setIsFullscreen(false);
                  setUndoStack([]);
                  setState((prev) => ({
                    ...prev,
                    view: 'setup',
                    match: { ...prev.match, isPlaying: false }
                  }));
                }}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider"
              >
                Sim, Encerrar e Configurar Nova
              </button>
              <button
                onClick={() => setIsConfirmEndOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
