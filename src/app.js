/**
 * Piedra, Papel o Tijera — Duelo Multijugador
 * Core Application Script with P2P WebRTC Sync
 */

// Sound FX Manager (Web Audio API Synthesizer)
const SoundFX = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  toggleSound() {
    this.enabled = !this.enabled;
    const btn = document.getElementById('toggle-sound-btn');
    if (this.enabled) {
      btn.textContent = '🔊';
      btn.setAttribute('aria-label', 'Desactivar Sonido');
      this.playClick();
    } else {
      btn.textContent = '🔇';
      btn.setAttribute('aria-label', 'Activar Sonido');
    }
    return this.enabled;
  },

  playTone(freq, type, duration, delay = 0) {
    if (!this.enabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  },

  playClick() {
    this.playTone(880, 'sine', 0.07);
  },

  playTick() {
    this.playTone(440, 'triangle', 0.1);
  },

  playStart() {
    this.playTone(523.25, 'sine', 0.1, 0); // C5
    this.playTone(659.25, 'sine', 0.1, 0.08); // E5
    this.playTone(783.99, 'sine', 0.15, 0.16); // G5
    this.playTone(1046.50, 'sine', 0.25, 0.24); // C6
  },

  playTie() {
    this.playTone(220, 'sawtooth', 0.25);
  },

  playSuccess() {
    this.playTone(587.33, 'sine', 0.08, 0); // D5
    this.playTone(783.99, 'sine', 0.08, 0.08); // G5
    this.playTone(987.77, 'sine', 0.12, 0.16); // B5
    this.playTone(1174.66, 'sine', 0.25, 0.24); // D6
  },

  playVictory() {
    const tempo = 0.12;
    this.playTone(523.25, 'sine', 0.15, tempo * 0); // C5
    this.playTone(523.25, 'sine', 0.15, tempo * 1); // C5
    this.playTone(523.25, 'sine', 0.15, tempo * 2); // C5
    this.playTone(523.25, 'sine', 0.3, tempo * 3);  // C5
    this.playTone(415.30, 'sine', 0.3, tempo * 5);  // Ab4
    this.playTone(466.16, 'sine', 0.3, tempo * 7);  // Bb4
    this.playTone(523.25, 'sine', 0.5, tempo * 9);  // C5
  }
};

// Canvas Effects Controller (Bursts & Confetti)
const CanvasFX = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,

  init() {
    this.canvas = document.getElementById('effect-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  spawnBurst(x, y, colors, count = 30) {
    this.init();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02,
        gravity: 0.18,
        shape: 'circle'
      });
    }
    this.startLoop();
  },

  spawnVictoryConfetti() {
    this.init();
    const colors = ['#00f2fe', '#4facfe', '#ff0844', '#ffb199', '#ffcc00', '#00ff66'];
    const interval = setInterval(() => {
      const victoryDialog = document.getElementById('victory-dialog');
      if (victoryDialog && victoryDialog.open) {
        for (let i = 0; i < 6; i++) {
          this.particles.push({
            x: Math.random() * this.canvas.width,
            y: -20,
            vx: -3 + Math.random() * 6,
            vy: 2 + Math.random() * 5,
            size: 6 + Math.random() * 12,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            decay: 0.003 + Math.random() * 0.004,
            gravity: 0.05 + Math.random() * 0.05,
            shape: Math.random() > 0.4 ? 'rect' : 'circle',
            rot: Math.random() * Math.PI,
            rotSpeed: -0.1 + Math.random() * 0.2
          });
        }
      } else {
        clearInterval(interval);
      }
    }, 100);
    this.startLoop();
  },

  startLoop() {
    if (!this.animationId) {
      this.loop();
    }
  },

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;
      
      if (p.rot !== undefined) {
        p.rot += p.rotSpeed;
      }

      if (p.alpha <= 0 || p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      
      if (p.shape === 'rect') {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rot);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.loop());
    } else {
      this.animationId = null;
    }
  }
};

// Game Engine State and Connection Manager
const Game = {
  // Config
  p1: { name: 'Jugador 1', avatar: '🦊', score: 0, choice: null },
  p2: { name: 'Jugador 2', avatar: '🦁', score: 0, choice: null },
  gameMode: 'local', // 'local', 'cpu', or 'online'
  targetScore: 3,
  
  // Game running state
  round: 1,
  currentTurn: 1, // 1 or 2
  
  // P2P Specific states
  peer: null,
  conn: null,
  p2pRole: null, // 'host' or 'guest'
  
  init() {
    // Nav Tabs Configuration
    this.setupTabListeners();
    
    // Config panel listeners
    this.setupConfigListeners();
    
    // Core game triggers
    document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
    document.getElementById('exit-arena-btn').addEventListener('click', () => this.exitArena());
    
    // Play choices
    const choiceCards = document.querySelectorAll('#choice-picker .choice-card');
    choiceCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const choice = e.currentTarget.getAttribute('data-choice');
        this.handlePlayerChoice(choice);
      });
    });
    
    // Pass & Play transitions
    document.getElementById('pass-confirm-btn').addEventListener('click', () => this.startPlayer2Turn());
    document.getElementById('next-round-btn').addEventListener('click', () => this.handleNextRoundTrigger());
    document.getElementById('rematch-btn').addEventListener('click', () => this.handleRematchTrigger());
    
    // Header actions
    document.getElementById('toggle-sound-btn').addEventListener('click', () => SoundFX.toggleSound());
    
    const helpDialog = document.getElementById('help-dialog');
    document.getElementById('help-btn').addEventListener('click', () => {
      SoundFX.playClick();
      helpDialog.showModal();
    });
    
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundFX.playClick();
        const dialogId = e.currentTarget.getAttribute('data-close');
        document.getElementById(dialogId).close();
      });
    });
    
    helpDialog.addEventListener('close', () => SoundFX.playClick());
    document.getElementById('victory-dialog').addEventListener('close', () => SoundFX.playClick());

    // P2P Specific UI triggers
    document.getElementById('lobby-create-room-btn').addEventListener('click', () => this.startP2PHost());
    document.getElementById('lobby-join-view-btn').addEventListener('click', () => this.showP2PJoinView());
    document.getElementById('connect-room-btn').addEventListener('click', () => this.connectToP2PHost());
    
    // Cancel & Back lobby buttons
    document.getElementById('cancel-host-btn').addEventListener('click', () => this.cancelP2PConnection());
    document.getElementById('cancel-join-btn').addEventListener('click', () => this.showP2PSelectionView());
    document.getElementById('cancel-loading-btn').addEventListener('click', () => this.cancelP2PConnection());
    
    // Link copy buttons
    document.getElementById('copy-code-btn').addEventListener('click', () => this.copyRoomCode());
    document.getElementById('copy-invite-link-btn').addEventListener('click', () => this.copyInviteLink());

    // Canvas resize
    CanvasFX.init();

    // Check query params for direct room link
    this.checkDirectRoomLink();
  },

  setupTabListeners() {
    const tabs = document.querySelectorAll('.tabs-container .tab-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundFX.playClick();
        tabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        this.gameMode = e.currentTarget.getAttribute('data-tab');
        this.updateGameModeUI();
      });
    });
  },

  setupConfigListeners() {
    // P1 Avatars
    const p1Avatars = document.querySelectorAll('#p1-avatar-container .avatar-btn');
    p1Avatars.forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundFX.playClick();
        p1Avatars.forEach(a => a.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        this.p1.avatar = e.currentTarget.getAttribute('data-avatar');
      });
    });

    // P2 Avatars
    const p2Avatars = document.querySelectorAll('#p2-avatar-container .avatar-btn');
    p2Avatars.forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundFX.playClick();
        p2Avatars.forEach(a => a.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        this.p2.avatar = e.currentTarget.getAttribute('data-avatar');
      });
    });

    // Score Target Selector
    const scoreOpts = document.querySelectorAll('#target-score-selector .selector-option');
    scoreOpts.forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundFX.playClick();
        scoreOpts.forEach(o => o.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        
        this.targetScore = parseInt(e.currentTarget.getAttribute('data-value'), 10);
      });
    });
  },

  updateGameModeUI() {
    this.cleanupP2P();

    const p1Card = document.getElementById('p1-card-config');
    const p2Card = document.getElementById('p2-card-config');
    const onlineLobby = document.getElementById('online-lobby-container');
    const rulesSettings = document.getElementById('match-rules-settings');
    const startBtn = document.getElementById('start-game-btn');
    const p1HeaderLabel = document.getElementById('p1-config-header-label');
    
    // Default setup views
    p1Card.style.display = 'flex';
    p2Card.style.display = 'flex';
    onlineLobby.classList.add('hidden');
    rulesSettings.classList.remove('hidden');
    startBtn.classList.remove('hidden');
    p1Card.style.opacity = '1';
    p2Card.style.opacity = '1';
    
    // Set labels
    p1HeaderLabel.innerHTML = '<span>🎮</span> Jugador 1';
    document.getElementById('p1-name-input').disabled = false;

    if (this.gameMode === 'local') {
      // Standard Pass & Play
      p2Card.style.display = 'flex';
      const nameInput = document.getElementById('p2-name-input');
      nameInput.disabled = false;
      if (nameInput.value === 'C.P.U.') nameInput.value = 'Jugador 2';
    } else if (this.gameMode === 'cpu') {
      // Versus CPU
      const nameInput = document.getElementById('p2-name-input');
      nameInput.value = 'C.P.U.';
      nameInput.disabled = true;
      p2Card.style.opacity = '0.6';
      
      const p2Avatars = document.getElementById('p2-avatar-container');
      const robotBtn = p2Avatars.querySelector('[data-avatar="🤖"]');
      if (robotBtn) {
        p2Avatars.querySelectorAll('.avatar-btn').forEach(a => a.classList.remove('selected'));
        robotBtn.classList.add('selected');
        this.p2.avatar = '🤖';
      }
    } else if (this.gameMode === 'online') {
      // P2P Multiplayer Lobby
      p2Card.style.display = 'none';
      onlineLobby.classList.remove('hidden');
      rulesSettings.classList.add('hidden');
      startBtn.classList.add('hidden');
      
      p1HeaderLabel.innerHTML = '<span>👤</span> Mi Perfil';
      this.showP2PSelectionView();
    }
  },

  // Check URL parameters for direct join links
  checkDirectRoomLink() {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId) {
      // Change Tab to Online
      const tabs = document.querySelectorAll('.tabs-container .tab-btn');
      tabs.forEach(t => t.classList.remove('active'));
      const onlineTab = document.querySelector('.tab-btn[data-tab="online"]');
      if (onlineTab) {
        onlineTab.classList.add('active');
        this.gameMode = 'online';
        this.updateGameModeUI();
        
        // Go straight to join input and prefill
        this.showP2PJoinView();
        document.getElementById('join-room-input').value = roomId;
      }
    }
  },

  showToast(message, duration = 3000) {
    const toast = document.getElementById('connection-status-toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  },

  /* ================= P2P Lobby Views Navigation ================= */
  showP2PSelectionView() {
    this.hideAllLobbySubviews();
    document.getElementById('lobby-selection-view').classList.remove('hidden');
  },

  showP2PJoinView() {
    this.hideAllLobbySubviews();
    document.getElementById('lobby-join-view').classList.remove('hidden');
    document.getElementById('join-room-input').focus();
  },

  showP2PLoadingView(title, desc) {
    this.hideAllLobbySubviews();
    document.getElementById('lobby-loading-title').textContent = title;
    document.getElementById('lobby-loading-desc').textContent = desc;
    document.getElementById('lobby-loading-view').classList.remove('hidden');
  },

  hideAllLobbySubviews() {
    document.querySelectorAll('.lobby-subview').forEach(view => {
      view.classList.add('hidden');
    });
  },

  /* ================= PeerJS Signaling Setup ================= */
  initPeer(role, onOpenSuccess) {
    this.cleanupP2P();
    this.p2pRole = role;
    
    this.peer = new Peer();
    
    this.peer.on('open', (id) => {
      console.log(`Peer opened successfully. ID: ${id}`);
      if (onOpenSuccess) onOpenSuccess(id);
    });
    
    this.peer.on('error', (err) => {
      console.error("Peer error occurred:", err);
      let errorMsg = "Error en la red. Inténtalo de nuevo.";
      if (err.type === 'peer-unavailable') {
        errorMsg = "Sala no disponible. Verifica el código.";
      }
      this.showToast(errorMsg);
      this.cancelP2PConnection();
    });
  },

  startP2PHost() {
    SoundFX.playClick();
    
    // Save configuration names/avatars
    this.p1.name = document.getElementById('p1-name-input').value.trim() || 'Jugador 1';
    
    this.showP2PLoadingView("Creando Sala...", "Inicializando red multijugador P2P...");
    
    this.initPeer('host', (id) => {
      this.hideAllLobbySubviews();
      document.getElementById('lobby-host-view').classList.remove('hidden');
      document.getElementById('room-code-display').textContent = id;
      
      // Wait for guest connection
      this.peer.on('connection', (connection) => {
        this.conn = connection;
        this.setupConnectionListeners();
      });
    });
  },

  connectToP2PHost() {
    SoundFX.playClick();
    
    const hostId = document.getElementById('join-room-input').value.trim();
    if (!hostId) {
      this.showToast("Introduce un código válido");
      return;
    }
    
    this.p2.name = document.getElementById('p1-name-input').value.trim() || 'Jugador 2';
    
    this.showP2PLoadingView("Conectando...", `Buscando la sala ${hostId} en la red...`);
    
    this.initPeer('guest', (myId) => {
      this.conn = this.peer.connect(hostId, { reliable: true });
      this.setupConnectionListeners();
    });
  },

  setupConnectionListeners() {
    if (!this.conn) return;
    
    this.conn.on('open', () => {
      console.log("WebRTC P2P Data Connection is open!");
      
      if (this.p2pRole === 'guest') {
        // Guest sends their details to host
        this.conn.send({
          type: 'join_info',
          name: this.p2.name,
          avatar: this.p2.avatar
        });
      }
    });
    
    this.conn.on('data', (data) => {
      this.handleP2PMessage(data);
    });
    
    this.conn.on('close', () => {
      console.log("Opponent left match (connection closed).");
      this.showToast("El rival abandonó la partida");
      this.exitArena();
    });

    this.conn.on('error', (err) => {
      console.error("Connection error:", err);
      this.showToast("Conexión perdida. Intentando reconectar...");
      this.exitArena();
    });
  },

  handleP2PMessage(data) {
    if (!data || !data.type) return;
    
    console.log("P2P Data received:", data);
    
    switch (data.type) {
      case 'join_info':
        if (this.p2pRole === 'host') {
          // Host receives Guest information
          this.p2.name = data.name;
          this.p2.avatar = data.avatar;
          
          // Host replies with Game settings
          this.conn.send({
            type: 'init_match',
            name: this.p1.name,
            avatar: this.p1.avatar,
            targetScore: this.targetScore
          });
          
          this.startGame();
        }
        break;
        
      case 'init_match':
        if (this.p2pRole === 'guest') {
          // Guest receives Host information and match configs
          // Note: In Guest's local memory, Host is P1, Guest is P2
          this.p1.name = data.name;
          this.p1.avatar = data.avatar;
          this.targetScore = data.targetScore;
          
          this.startGame();
        }
        break;
        
      case 'choice':
        // Opponent choice received
        if (this.p2pRole === 'host') {
          this.p2.choice = data.choice;
          document.getElementById('p2-status-badge').className = 'player-status-badge status-ready';
          document.getElementById('p2-status-badge').textContent = 'Listo';
          
          if (this.p1.choice) {
            this.startCountdown();
          }
        } else {
          this.p1.choice = data.choice;
          document.getElementById('p1-status-badge').className = 'player-status-badge status-ready';
          document.getElementById('p1-status-badge').textContent = 'Listo';
          
          if (this.p2.choice) {
            this.startCountdown();
          }
        }
        break;
        
      case 'next_round':
        this.round = data.round;
        this.startRound();
        break;
        
      case 'rematch':
        this.startGame();
        break;
    }
  },

  cancelP2PConnection() {
    SoundFX.playClick();
    this.cleanupP2P();
    this.showP2PSelectionView();
  },

  cleanupP2P() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.p2pRole = null;
  },

  cleanupPeer() {
    this.cleanupP2P();
  },

  /* ================= Clipboard Sharing Handlers ================= */
  copyRoomCode() {
    SoundFX.playClick();
    const code = document.getElementById('room-code-display').textContent;
    navigator.clipboard.writeText(code).then(() => {
      this.showToast("¡Código copiado al portapapeles!");
    }).catch(err => {
      console.error("Copy failed:", err);
    });
  },

  copyInviteLink() {
    SoundFX.playClick();
    const code = document.getElementById('room-code-display').textContent;
    const inviteLink = `${window.location.origin}${window.location.pathname}?room=${code}`;
    
    navigator.clipboard.writeText(inviteLink).then(() => {
      this.showToast("¡Enlace directo copiado!");
    }).catch(err => {
      console.error("Copy link failed:", err);
    });
  },

  /* ================= Core Arena Execution Loop ================= */
  startGame() {
    if (this.gameMode !== 'online') {
      this.p1.name = document.getElementById('p1-name-input').value.trim() || 'Jugador 1';
      this.p2.name = this.gameMode === 'cpu' ? 'C.P.U.' : (document.getElementById('p2-name-input').value.trim() || 'Jugador 2');
    }
    
    this.p1.score = 0;
    this.p2.score = 0;
    this.round = 1;
    
    SoundFX.playStart();
    
    document.getElementById('setup-panel').style.display = 'none';
    document.getElementById('arena-panel').style.display = 'flex';
    
    this.updateScoreboard();
    this.startRound();
  },

  exitArena() {
    SoundFX.playClick();
    this.cleanupP2P();
    
    document.getElementById('arena-panel').style.display = 'none';
    document.getElementById('setup-panel').style.display = 'flex';
    this.updateGameModeUI();
  },

  updateScoreboard() {
    document.getElementById('p1-display-avatar').textContent = this.p1.avatar;
    document.getElementById('p1-display-name').textContent = this.p1.name;
    document.getElementById('p1-score').textContent = this.p1.score;
    
    document.getElementById('p2-display-avatar').textContent = this.p2.avatar;
    document.getElementById('p2-display-name').textContent = this.p2.name;
    document.getElementById('p2-score').textContent = this.p2.score;
    
    document.getElementById('round-title').textContent = `Ronda ${this.round}`;
    document.getElementById('target-title').textContent = `Al mejor de ${this.targetScore}`;
    
    // Status Badges Visibility (P2P only)
    const b1 = document.getElementById('p1-status-badge');
    const b2 = document.getElementById('p2-status-badge');
    if (this.gameMode === 'online') {
      b1.classList.remove('hidden');
      b2.classList.remove('hidden');
    } else {
      b1.classList.add('hidden');
      b2.classList.add('hidden');
    }
  },

  startRound() {
    this.p1.choice = null;
    this.p2.choice = null;
    this.currentTurn = 1;
    
    // Reset views
    document.getElementById('choice-picker').style.display = 'flex';
    document.getElementById('online-wait-overlay').style.display = 'none';
    document.getElementById('pass-screen').style.display = 'none';
    document.getElementById('countdown-screen').style.display = 'none';
    document.getElementById('reveal-screen').style.display = 'none';
    
    if (this.gameMode === 'online') {
      // Sync badges
      const b1 = document.getElementById('p1-status-badge');
      const b2 = document.getElementById('p2-status-badge');
      b1.className = 'player-status-badge status-thinking';
      b1.textContent = 'Eligiendo';
      b2.className = 'player-status-badge status-thinking';
      b2.textContent = 'Eligiendo';
      
      const turnTitle = document.getElementById('turn-title');
      turnTitle.textContent = '¡Elige tu opción!';
      turnTitle.className = 'turn-banner';
      document.getElementById('arena-panel').className = 'glass-panel arena-screen';
    } else {
      this.setTurnUI(1);
    }
  },

  setTurnUI(playerNum) {
    const arenaPanel = document.getElementById('arena-panel');
    const turnTitle = document.getElementById('turn-title');
    
    arenaPanel.classList.remove('turn-p1', 'turn-p2');
    
    if (playerNum === 1) {
      arenaPanel.classList.add('turn-p1');
      turnTitle.textContent = `Turno de ${this.p1.name}`;
      turnTitle.className = 'turn-banner p1';
    } else {
      arenaPanel.classList.add('turn-p2');
      turnTitle.textContent = `Turno de ${this.p2.name}`;
      turnTitle.className = 'turn-banner p2';
    }
  },

  handlePlayerChoice(choice) {
    SoundFX.playClick();
    
    if (this.gameMode === 'online') {
      if (this.p2pRole === 'host') {
        this.p1.choice = choice;
        document.getElementById('p1-status-badge').className = 'player-status-badge status-ready';
        document.getElementById('p1-status-badge').textContent = 'Listo';
        
        this.conn.send({ type: 'choice', choice: choice });
        
        if (this.p2.choice) {
          this.startCountdown();
        } else {
          this.showOnlineWaitOverlay(this.p2.name);
        }
      } else {
        this.p2.choice = choice;
        document.getElementById('p2-status-badge').className = 'player-status-badge status-ready';
        document.getElementById('p2-status-badge').textContent = 'Listo';
        
        this.conn.send({ type: 'choice', choice: choice });
        
        if (this.p1.choice) {
          this.startCountdown();
        } else {
          this.showOnlineWaitOverlay(this.p1.name);
        }
      }
    } else {
      // Local/CPU Turn management
      if (this.currentTurn === 1) {
        this.p1.choice = choice;
        
        if (this.gameMode === 'cpu') {
          const CPUOptions = ['rock', 'paper', 'scissors'];
          this.p2.choice = CPUOptions[Math.floor(Math.random() * CPUOptions.length)];
          this.startCountdown();
        } else {
          this.showPassScreen();
        }
      } else {
        this.p2.choice = choice;
        this.startCountdown();
      }
    }
  },

  showOnlineWaitOverlay(oppName) {
    document.getElementById('choice-picker').style.display = 'none';
    document.getElementById('online-wait-opponent-name').textContent = oppName;
    document.getElementById('online-wait-overlay').style.display = 'flex';
  },

  showPassScreen() {
    const passScreen = document.getElementById('pass-screen');
    const passAvatar = document.getElementById('pass-screen-avatar');
    const passPlayerName = document.getElementById('pass-screen-player-name');
    
    passAvatar.textContent = this.p2.avatar;
    passPlayerName.textContent = this.p2.name;
    
    document.getElementById('choice-picker').style.display = 'none';
    passScreen.style.display = 'flex';
    this.currentTurn = 2;
  },

  startPlayer2Turn() {
    SoundFX.playClick();
    document.getElementById('pass-screen').style.display = 'none';
    document.getElementById('choice-picker').style.display = 'flex';
    this.setTurnUI(2);
  },

  startCountdown() {
    document.getElementById('choice-picker').style.display = 'none';
    document.getElementById('online-wait-overlay').style.display = 'none';
    
    const countdownScreen = document.getElementById('countdown-screen');
    countdownScreen.style.display = 'flex';
    
    const countEl = document.getElementById('countdown-number');
    let count = 3;
    countEl.textContent = count;
    SoundFX.playTick();
    
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countEl.textContent = count;
        SoundFX.playTick();
      } else {
        clearInterval(interval);
        this.evaluateRound();
      }
    }, 600);
  },

  evaluateRound() {
    document.getElementById('countdown-screen').style.display = 'none';
    const revealScreen = document.getElementById('reveal-screen');
    revealScreen.style.display = 'flex';
    
    const card1 = document.getElementById('reveal-p1-card');
    const card2 = document.getElementById('reveal-p2-card');
    card1.className = 'reveal-card p1-card';
    card2.className = 'reveal-card p2-card';
    
    document.getElementById('reveal-p1-avatar').textContent = this.p1.avatar;
    document.getElementById('reveal-p1-choice-name').textContent = this.translateChoice(this.p1.choice);
    document.getElementById('reveal-p1-label-name').textContent = this.p1.name;
    document.getElementById('reveal-p1-svg').querySelector('use').setAttribute('href', `#icon-${this.p1.choice}`);
    
    document.getElementById('reveal-p2-avatar').textContent = this.p2.avatar;
    document.getElementById('reveal-p2-choice-name').textContent = this.translateChoice(this.p2.choice);
    document.getElementById('reveal-p2-label-name').textContent = this.p2.name;
    document.getElementById('reveal-p2-svg').querySelector('use').setAttribute('href', `#icon-${this.p2.choice}`);
    
    let winner = 0; // 0 tie, 1 p1, 2 p2
    const banner = document.getElementById('result-banner');
    
    if (this.p1.choice === this.p2.choice) {
      banner.textContent = '¡Empate!';
      banner.className = 'result-banner draw';
      SoundFX.playTie();
    } else if (
      (this.p1.choice === 'rock' && this.p2.choice === 'scissors') ||
      (this.p1.choice === 'paper' && this.p2.choice === 'rock') ||
      (this.p1.choice === 'scissors' && this.p2.choice === 'paper')
    ) {
      winner = 1;
      banner.textContent = `¡Punto para ${this.p1.name}!`;
      banner.className = 'result-banner p1-win';
      this.p1.score++;
      
      card1.classList.add('winner-card');
      card2.classList.add('loser-card');
      SoundFX.playSuccess();
    } else {
      winner = 2;
      banner.textContent = `¡Punto para ${this.p2.name}!`;
      banner.className = 'result-banner p2-win';
      this.p2.score++;
      
      card2.classList.add('winner-card');
      card1.classList.add('loser-card');
      SoundFX.playSuccess();
    }
    
    this.updateScoreboard();
    
    const p1Rect = card1.getBoundingClientRect();
    const p2Rect = card2.getBoundingClientRect();
    
    const p1Color = ['#00f2fe', '#4facfe', '#ffffff'];
    const p2Color = ['#ff0844', '#ffb199', '#ffffff'];
    const tieColor = ['#ffcc00', '#ffe680', '#ffffff'];
    
    if (winner === 1) {
      CanvasFX.spawnBurst(p1Rect.left + p1Rect.width/2, p1Rect.top + p1Rect.height/2, p1Color);
    } else if (winner === 2) {
      CanvasFX.spawnBurst(p2Rect.left + p2Rect.width/2, p2Rect.top + p2Rect.height/2, p2Color);
    } else {
      CanvasFX.spawnBurst(p1Rect.left + p1Rect.width/2, p1Rect.top + p1Rect.height/2, tieColor, 15);
      CanvasFX.spawnBurst(p2Rect.left + p2Rect.width/2, p2Rect.top + p2Rect.height/2, tieColor, 15);
    }
    
    // Config next round controls
    const nextBtn = document.getElementById('next-round-btn');
    const guestWaitLabel = document.getElementById('guest-wait-next-round-label');
    const isGameOver = this.p1.score >= this.targetScore || this.p2.score >= this.targetScore;
    
    if (this.gameMode === 'online') {
      if (this.p2pRole === 'host') {
        nextBtn.classList.remove('hidden');
        guestWaitLabel.classList.add('hidden');
        nextBtn.textContent = isGameOver ? 'Ver Resultados' : 'Siguiente Ronda';
      } else {
        nextBtn.classList.add('hidden');
        guestWaitLabel.classList.remove('hidden');
        guestWaitLabel.textContent = isGameOver ? 'Esperando resultados...' : 'Esperando que el anfitrión continúe...';
      }
    } else {
      nextBtn.classList.remove('hidden');
      guestWaitLabel.classList.add('hidden');
      nextBtn.textContent = isGameOver ? 'Ver Resultados' : 'Siguiente Ronda';
    }
  },

  translateChoice(choice) {
    if (choice === 'rock') return 'Piedra';
    if (choice === 'paper') return 'Papel';
    if (choice === 'scissors') return 'Tijera';
    return '';
  },

  handleNextRoundTrigger() {
    SoundFX.playClick();
    
    if (this.gameMode === 'online' && this.p2pRole === 'host') {
      const isGameOver = this.p1.score >= this.targetScore || this.p2.score >= this.targetScore;
      if (isGameOver) {
        this.finishMatch();
      } else {
        this.round++;
        this.conn.send({ type: 'next_round', round: this.round });
        this.startRound();
      }
    } else if (this.gameMode !== 'online') {
      const isGameOver = this.p1.score >= this.targetScore || this.p2.score >= this.targetScore;
      if (isGameOver) {
        this.finishMatch();
      } else {
        this.round++;
        this.updateScoreboard();
        this.startRound();
      }
    }
  },

  finishMatch() {
    const winnerName = this.p1.score >= this.targetScore ? this.p1.name : this.p2.name;
    const winnerEmoji = this.p1.score >= this.targetScore ? this.p1.avatar : this.p2.avatar;
    
    document.getElementById('victory-emoji').textContent = winnerEmoji;
    document.getElementById('victory-subtitle').textContent = `¡${winnerName} ha ganado la partida con score ${Math.max(this.p1.score, this.p2.score)} a ${Math.min(this.p1.score, this.p2.score)}!`;
    
    // Toggle victory controls for Host vs Guest in P2P
    const hostActions = document.getElementById('host-victory-actions');
    const guestActions = document.getElementById('guest-victory-actions');
    
    if (this.gameMode === 'online') {
      if (this.p2pRole === 'host') {
        hostActions.classList.remove('hidden');
        guestActions.classList.add('hidden');
      } else {
        hostActions.classList.add('hidden');
        guestActions.classList.remove('hidden');
      }
    } else {
      hostActions.classList.remove('hidden');
      guestActions.classList.add('hidden');
    }

    const victoryDialog = document.getElementById('victory-dialog');
    victoryDialog.showModal();
    
    SoundFX.playVictory();
    CanvasFX.spawnVictoryConfetti();
  },

  handleRematchTrigger() {
    SoundFX.playClick();
    document.getElementById('victory-dialog').close();
    
    if (this.gameMode === 'online' && this.p2pRole === 'host') {
      this.conn.send({ type: 'rematch' });
    }
    
    this.startGame();
  }
};

window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
