# 🏐 Vôlei da Galera

Aplicação Web Progressiva (**PWA**) para organizar partidas e peladas de vôlei entre amigos, com sorteio de times, controle automático de fila ("Rei da Quadra"), placar em tela cheia e ranking exportável para o WhatsApp.

## ✨ Funcionalidades

- **Importação Inteligente do WhatsApp**: Cole a lista numerada do grupo e veja os jogadores detectados em tempo real.
- **Formatos Flexíveis**: Dupla (2x2), Trio (3x3), Quarteto (4x4), Sexteto (6x6) ou customizado (2 a 10 por time).
- **Sorteio ou Ordem de Chegada**: Embaralhe os times iniciais ou mantenha a ordem da lista.
- **Rotação Automática da Fila**:
  - Prioridade 1 (FIFO): Quem está esperando há mais tempo na fila.
  - Prioridade 2 (Desempate): Quem jogou menos partidas no dia.
  - Limite configurável de vitórias seguidas (ex: após 3 vitórias seguidas, o time vencedor também roda).
- **Placar Pro & Modo Tela Cheia**:
  - Regra **"Vai a 2"** (diferença de 2 pontos) opcional.
  - Indicador de **Saque** (🏐), **Set Point** (🔥) e **Ponto de Vitória** (🏆).
  - **Inverter Lados da Quadra** com 1 toque.
  - **Wake Lock API**: Mantém a tela do celular acesa automaticamente no modo tela cheia.
  - **Sons sintetizados offline** (Web Audio API) para pontos, set point e apito final.
- **Persistência Automática + Desfazer (Undo)**:
  - Salva tudo no `localStorage` para não perder o andamento se fechar ou recarregar o app.
  - Botão de **Desfazer** para reverter vitórias clicadas por engano, substituições ou remoções.
- **Resumo, Ranking do Dia e Histórico**:
  - Acompanhe quem mais venceu no dia, aproveitamento (%) e histórico de sets.
  - Copie o resumo formatado com emojis direto para o grupo do WhatsApp.

## 🚀 Como rodar localmente

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Gerar build de produção (com Service Worker e Manifest PWA)
npm run build
```

## 🌐 Deploy no GitHub Pages

O repositório já conta com o workflow `.github/workflows/deploy.yml` configurado:
1. No GitHub, acesse **Settings > Pages** do repositório `volei-da-galera`.
2. Em **Build and deployment > Source**, selecione **GitHub Actions**.
3. A cada push na branch `main`, o site e o PWA serão publicados automaticamente!
