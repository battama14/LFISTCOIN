// LFIST Game - Optimized Game Engine with Mobile Support
class LFistGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameRunning = false;
    this.gamePaused = false;
    this.gameStartTime = 0;
    this.levelStartTime = 0;
    
    // Performance optimization
    this.ctx.imageSmoothingEnabled = false;
    this.lastFrameTime = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
    
    // Preloading state
    this.isLoading = true;
    this.loadingProgress = 0;
    this.totalAssets = 0;
    this.loadedAssets = 0;
    
    // Game state
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.destroyed = 0;
    this.totalDestroyed = 0;
    this.levelTarget = 10;
    
    // Player
    this.player = {
      x: 0,
      y: 0,
      width: 60,
      height: 60,
      speed: 6,
      punchRadius: 80,
      isPunching: false,
      punchTimer: 0,
      sprite: null,
      powerupTimer: 0,
      invulnerable: false,
      invulnerableTimer: 0
    };
    
    // Audio files
    this.audioFiles = {
      coup: null,
      bonus: null,
      ambiance: null,
      trump: null
    };
    
    // Game objects - using object pools for performance
    this.memecoins = [];
    this.powerups = [];
    this.particles = [];
    this.memecoinPool = [];
    this.powerupPool = [];
    this.particlePool = [];
    
    // Input handling
    this.keys = {};
    this.lastTime = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Game settings
    this.baseSpawnRate = 80;
    this.spawnRate = 80;
    this.spawnTimer = 0;
    this.powerupSpawnRate = 400;
    this.powerupSpawnTimer = 0;
    
    // Memecoin types with optimized properties
    this.memecoinTypes = {
      doge: { color: '#ffaa00', points: 10, speed: 1, size: 35, image: 'memecoins/binance-peg-dogecoin.png', rarity: 'common' },
      shiba: { color: '#ff6600', points: 20, speed: 1.2, size: 40, image: 'memecoins/shiba-inu.png', rarity: 'common' },
      akita: { color: '#ff00ff', points: 25, speed: 1.5, size: 30, image: 'memecoins/akita-inu.png', rarity: 'uncommon' },
      catecoin: { color: '#4444ff', points: 30, speed: 1.8, size: 32, image: 'memecoins/catecoin.png', rarity: 'rare' },
      samoyed: { color: '#ff44ff', points: 40, speed: 2, size: 35, image: 'memecoins/samoyedcoin.png', rarity: 'rare' },
      trump: { color: '#ff0000', points: 100, speed: 0.8, size: 45, image: 'memecoins/trump.jpg', rarity: 'legendary', bonus: true }
    };
    
    // Loaded images cache
    this.imageCache = {};
    this.bonusImage = null;
    this.backgroundImage = null;
    this.playerImages = {
      normal: null,
      punching: null
    };
    
    // Initialize
    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.loadAssets();
    this.resetPlayerPosition();
    this.createObjectPools();
  }

  createObjectPools() {
    // Pre-create objects for better performance
    for (let i = 0; i < 50; i++) {
      this.memecoinPool.push(this.createMemecoinObject());
      this.particlePool.push(this.createParticleObject());
    }
    for (let i = 0; i < 10; i++) {
      this.powerupPool.push(this.createPowerupObject());
    }
  }

  createMemecoinObject() {
    return {
      x: 0, y: 0, width: 35, height: 35, speed: 1, type: 'doge',
      rotation: 0, rotationSpeed: 0, active: false, image: null
    };
  }

  createPowerupObject() {
    return {
      x: 0, y: 0, width: 50, height: 50, speed: 2, type: 'bonus',
      rotation: 0, rotationSpeed: 0.1, glow: 0, active: false
    };
  }

  createParticleObject() {
    return {
      x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 30,
      color: '#ffaa00', size: 3, active: false
    };
  }

  resizeCanvas() {
    const container = document.getElementById('gameContainer');
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.resetPlayerPosition();
  }

  resetPlayerPosition() {
    this.player.x = this.canvas.width / 2 - this.player.width / 2;
    this.player.y = this.canvas.height - this.player.height - 30;
  }

  setupEventListeners() {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.punch();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse/Touch input optimized for mobile
    this.canvas.addEventListener('click', (e) => {
      if (this.gameRunning) {
        this.punch();
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.gameRunning && !this.isMobile) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        this.updatePlayerPosition();
      }
    });

    // Optimized touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.gameRunning) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.touches[0].clientX - rect.left;
        this.mouseY = e.touches[0].clientY - rect.top;
        this.updatePlayerPosition();
        this.punch();
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.gameRunning && e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.touches[0].clientX - rect.left;
        this.mouseY = e.touches[0].clientY - rect.top;
        this.updatePlayerPosition();
      }
    }, { passive: false });

    // Window resize with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.resizeCanvas();
      }, 100);
    });
  }

  updatePlayerPosition() {
    if (this.isMobile || this.mouseX !== 0 || this.mouseY !== 0) {
      this.player.x = this.mouseX - this.player.width / 2;
      this.player.y = this.mouseY - this.player.height / 2;
      this.constrainPlayer();
    }
  }

  async loadAssets() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingFill = document.getElementById('loadingFill');
    const loadingText = document.getElementById('loadingText');
    
    // Count total assets
    const imageAssets = Object.values(this.memecoinTypes).map(type => type.image);
    imageAssets.push('bonus.png', 'fondjeu2.jpeg', 'persofix.jpeg', 'persopoing.jpeg');
    const audioAssets = ['coup.mp3', 'bonus.mp3', 'ambiance.mp3', 'sontrump.mp3'];
    
    this.totalAssets = imageAssets.length + audioAssets.length;
    this.loadedAssets = 0;

    // Load images
    for (const imagePath of imageAssets) {
      try {
        const img = await this.loadImage(imagePath);
        this.imageCache[imagePath] = img;
        if (imagePath === 'bonus.png') {
          this.bonusImage = img;
        } else if (imagePath === 'fondjeu2.jpeg') {
          this.backgroundImage = img;
        } else if (imagePath === 'persofix.jpeg') {
          this.playerImages.normal = img;
        } else if (imagePath === 'persopoing.jpeg') {
          this.playerImages.punching = img;
        }
        this.updateLoadingProgress(loadingFill, loadingText);
      } catch (error) {
        console.warn(`Failed to load image: ${imagePath}`);
        this.updateLoadingProgress(loadingFill, loadingText);
      }
    }

    // Load audio files
    for (const audioFile of audioAssets) {
      try {
        const audio = await this.loadAudio(audioFile);
        let key = audioFile.replace('.mp3', '');
        if (key === 'sontrump') key = 'trump';
        this.audioFiles[key] = audio;
        this.updateLoadingProgress(loadingFill, loadingText);
      } catch (error) {
        console.warn(`Failed to load audio: ${audioFile}`);
        this.updateLoadingProgress(loadingFill, loadingText);
      }
    }

    // Create fallback player sprite in case images don't load
    this.createPlayerSprite();
    this.updateLoadingProgress(loadingFill, loadingText);

    // Start ambient music
    if (this.audioFiles.ambiance) {
      this.audioFiles.ambiance.loop = true;
      this.audioFiles.ambiance.volume = 0.3;
      try {
        await this.audioFiles.ambiance.play();
      } catch (error) {
        console.log('Ambient music will start after user interaction');
      }
    }

    // Hide loading screen and show start screen
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      document.getElementById('gameStart').style.display = 'block';
      this.isLoading = false;
    }, 500);
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  loadAudio(src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = reject;
      audio.src = src;
      audio.preload = 'auto';
    });
  }

  updateLoadingProgress(loadingFill, loadingText) {
    this.loadedAssets++;
    const progress = (this.loadedAssets / this.totalAssets) * 100;
    loadingFill.style.width = progress + '%';
    loadingText.textContent = Math.round(progress) + '%';
  }

  createPlayerSprite() {
    // Create LFIST sprite without black background (fallback)
    const canvas = document.createElement('canvas');
    canvas.width = this.player.width;
    canvas.height = this.player.height;
    const ctx = canvas.getContext('2d');
    
    // Clear background (transparent)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw LFIST character with better proportions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Body
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(centerX - 15, centerY - 10, 30, 35);
    
    // Head
    ctx.fillStyle = '#ffcc88';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 15, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#333';
    ctx.fillRect(centerX - 8, centerY - 18, 3, 3);
    ctx.fillRect(centerX + 5, centerY - 18, 3, 3);
    
    // Mouth
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(centerX - 4, centerY - 12, 8, 2);
    
    // Fists
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(centerX - 20, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 20, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    this.player.sprite = canvas;
  }

  createPlayerSprite() {
    // Create LFIST sprite without black background
    const canvas = document.createElement('canvas');
    canvas.width = this.player.width;
    canvas.height = this.player.height;
    const ctx = canvas.getContext('2d');
    
    // Clear background (transparent)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw LFIST character with better proportions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Body
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(centerX - 15, centerY - 10, 30, 35);
    
    // Head
    ctx.fillStyle = '#ffcc88';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 15, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#333';
    ctx.fillRect(centerX - 8, centerY - 18, 3, 3);
    ctx.fillRect(centerX + 5, centerY - 18, 3, 3);
    
    // Mouth
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(centerX - 4, centerY - 12, 8, 2);
    
    // Fists
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(centerX - 20, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 20, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    this.player.sprite = canvas;
  }

  constrainPlayer() {
    this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
    this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
  }

  handleInput() {
    if (!this.gameRunning) return;

    // Keyboard movement
    let moved = false;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.player.x -= this.player.speed;
      moved = true;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.player.x += this.player.speed;
      moved = true;
    }
    if (this.keys['ArrowUp'] || this.keys['KeyW']) {
      this.player.y -= this.player.speed;
      moved = true;
    }
    if (this.keys['ArrowDown'] || this.keys['KeyS']) {
      this.player.y += this.player.speed;
      moved = true;
    }

    if (moved) {
      this.constrainPlayer();
    }
  }

  punch() {
    if (this.player.isPunching) return;
    
    this.player.isPunching = true;
    this.player.punchTimer = 15;
    
    // Play punch sound
    if (this.audioFiles.coup) {
      this.audioFiles.coup.currentTime = 0;
      this.audioFiles.coup.volume = 0.4;
      this.audioFiles.coup.play().catch(() => {});
    }
    
    // Check for hits
    this.checkPunchHits();
    
    // Create punch effect
    this.createPunchEffect();
  }

  checkPunchHits() {
    const punchX = this.player.x + this.player.width / 2;
    const punchY = this.player.y + this.player.height / 2;
    
    // Check memecoins
    for (let i = this.memecoins.length - 1; i >= 0; i--) {
      const memecoin = this.memecoins[i];
      if (!memecoin.active) continue;
      
      const distance = Math.sqrt(
        Math.pow(memecoin.x + memecoin.width / 2 - punchX, 2) +
        Math.pow(memecoin.y + memecoin.height / 2 - punchY, 2)
      );
      
      if (distance < this.player.punchRadius) {
        this.destroyMemecoin(i);
      }
    }
    
    // Check powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      if (!powerup.active) continue;
      
      const distance = Math.sqrt(
        Math.pow(powerup.x + powerup.width / 2 - punchX, 2) +
        Math.pow(powerup.y + powerup.height / 2 - punchY, 2)
      );
      
      if (distance < this.player.punchRadius) {
        this.collectPowerup(i);
      }
    }
  }

  createPunchEffect() {
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    
    // Create punch particles using object pool
    for (let i = 0; i < 8; i++) {
      const particle = this.getParticleFromPool();
      if (particle) {
        particle.x = centerX + (Math.random() - 0.5) * 40;
        particle.y = centerY + (Math.random() - 0.5) * 40;
        particle.vx = (Math.random() - 0.5) * 8;
        particle.vy = (Math.random() - 0.5) * 8;
        particle.life = 20;
        particle.maxLife = 20;
        particle.color = '#ffaa00';
        particle.size = Math.random() * 4 + 2;
        particle.active = true;
        this.particles.push(particle);
      }
    }
  }

  getParticleFromPool() {
    return this.particlePool.find(p => !p.active) || this.createParticleObject();
  }

  getMemecoinFromPool() {
    return this.memecoinPool.find(m => !m.active) || this.createMemecoinObject();
  }

  getPowerupFromPool() {
    return this.powerupPool.find(p => !p.active) || this.createPowerupObject();
  }

  destroyMemecoin(index) {
    const memecoin = this.memecoins[index];
    const typeData = this.memecoinTypes[memecoin.type];
    
    // Special handling for Trump
    if (memecoin.type === 'trump') {
      // Play Trump sound
      if (this.audioFiles.trump) {
        this.audioFiles.trump.currentTime = 0;
        this.audioFiles.trump.volume = 0.6;
        this.audioFiles.trump.play().catch(() => {});
      }
      
      // Trump gives bonus points and spawns a bonus
      const bonusPoints = typeData.points * 50; // 5000 points for Trump
      this.score += bonusPoints;
      this.combo += 5; // Big combo boost
      
      // Show special Trump message
      this.showTrumpMessage();
      
      // Spawn a bonus item at Trump's position
      this.spawnBonusAtPosition(memecoin.x, memecoin.y);
      
      // Special Trump destruction effect
      this.createTrumpDestructionEffect(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
    } else {
      // Regular memecoin handling
      const baseScore = typeData.points * 10;
      const comboMultiplier = Math.floor(this.combo / 5) + 1;
      const points = baseScore * comboMultiplier;
      this.score += points;
      this.combo++;
      
      // Create regular destruction particles
      this.createDestructionEffect(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
    }
    
    this.destroyed++;
    this.totalDestroyed++;
    
    // Update max combo
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    
    // Show combo if high enough
    if (this.combo >= 5) {
      this.showCombo();
    }
    
    // Return to pool
    memecoin.active = false;
    this.memecoins.splice(index, 1);
    
    // Check level completion
    if (this.destroyed >= this.levelTarget) {
      this.completeLevel();
    }
    
    this.updateUI();
  }

  collectPowerup(index) {
    const powerup = this.powerups[index];
    
    // Show Chimay beer message
    this.showChimayMessage();
    
    // Play bonus sound
    if (this.audioFiles.bonus) {
      this.audioFiles.bonus.currentTime = 0;
      this.audioFiles.bonus.volume = 0.5;
      this.audioFiles.bonus.play().catch(() => {});
    }
    
    // Add bonus points
    this.score += 500;
    this.combo += 3;
    
    // Temporary punch radius increase
    this.player.punchRadius = 120;
    this.player.powerupTimer = 300; // 5 seconds at 60fps
    
    // Create collection effect
    this.createCollectionEffect(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
    
    // Return to pool
    powerup.active = false;
    this.powerups.splice(index, 1);
    
    this.updateUI();
  }

  createDestructionEffect(x, y) {
    for (let i = 0; i < 10; i++) {
      const particle = this.getParticleFromPool();
      if (particle) {
        particle.x = x;
        particle.y = y;
        particle.vx = (Math.random() - 0.5) * 12;
        particle.vy = (Math.random() - 0.5) * 12;
        particle.life = 30;
        particle.maxLife = 30;
        particle.color = '#ff4444';
        particle.size = Math.random() * 3 + 1;
        particle.active = true;
        this.particles.push(particle);
      }
    }
  }

  createTrumpDestructionEffect(x, y) {
    // Special golden explosion for Trump
    for (let i = 0; i < 20; i++) {
      const particle = this.getParticleFromPool();
      if (particle) {
        particle.x = x;
        particle.y = y;
        particle.vx = (Math.random() - 0.5) * 15;
        particle.vy = (Math.random() - 0.5) * 15;
        particle.life = 50;
        particle.maxLife = 50;
        particle.color = Math.random() > 0.5 ? '#ffaa00' : '#ff0000';
        particle.size = Math.random() * 6 + 3;
        particle.active = true;
        this.particles.push(particle);
      }
    }
  }

  createCollectionEffect(x, y) {
    for (let i = 0; i < 15; i++) {
      const particle = this.getParticleFromPool();
      if (particle) {
        particle.x = x;
        particle.y = y;
        particle.vx = (Math.random() - 0.5) * 10;
        particle.vy = (Math.random() - 0.5) * 10;
        particle.life = 40;
        particle.maxLife = 40;
        particle.color = '#ffaa00';
        particle.size = Math.random() * 5 + 2;
        particle.active = true;
        this.particles.push(particle);
      }
    }
  }

  showCombo() {
    const comboDisplay = document.getElementById('comboDisplay');
    const multiplier = Math.floor(this.combo / 5) + 1;
    document.getElementById('comboMultiplier').textContent = multiplier;
    comboDisplay.classList.add('show');
    
    setTimeout(() => {
      comboDisplay.classList.remove('show');
    }, 1500);
  }

  showTrumpMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #ff0000, #ffaa00);
      color: white;
      padding: 20px 40px;
      border-radius: 15px;
      font-family: 'Press Start 2P', monospace;
      font-size: 18px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
      border: 3px solid #ffaa00;
      animation: trumpPulse 0.5s ease-in-out;
    `;
    messageDiv.innerHTML = `
      🎯 LEGENDARY TRUMP DESTROYED! 🎯<br>
      <span style="font-size: 14px; color: #ffff00;">+5000 POINTS + BONUS!</span>
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes trumpPulse {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.remove();
      style.remove();
    }, 3000);
  }

  showChimayMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #8B4513, #DAA520);
      color: white;
      padding: 15px 30px;
      border-radius: 10px;
      font-family: 'Press Start 2P', monospace;
      font-size: 14px;
      text-align: center;
      z-index: 9999;
      box-shadow: 0 0 20px rgba(218, 165, 32, 0.6);
      border: 2px solid #DAA520;
      animation: chimayFloat 0.4s ease-out;
    `;
    messageDiv.innerHTML = `
      🍺 SMALL CHIMAY BEER! 🍺<br>
      <span style="font-size: 10px; color: #ffff88;">+500 POINTS + POWER UP!</span>
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes chimayFloat {
        0% { transform: translate(-50%, -50%) translateY(20px); opacity: 0; }
        100% { transform: translate(-50%, -50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.remove();
      style.remove();
    }, 2000);
  }

  spawnMemecoin() {
    const memecoin = this.getMemecoinFromPool();
    if (!memecoin) return;
    
    const types = Object.keys(this.memecoinTypes);
    let type;
    
    // Trump has 3% chance to spawn (ultra rare)
    if (Math.random() < 0.03) {
      type = 'trump';
    } else {
      // Remove trump from regular spawning
      const regularTypes = types.filter(t => t !== 'trump');
      type = regularTypes[Math.floor(Math.random() * regularTypes.length)];
    }
    
    const typeData = this.memecoinTypes[type];
    
    memecoin.x = Math.random() * (this.canvas.width - typeData.size);
    memecoin.y = -typeData.size;
    memecoin.width = typeData.size;
    memecoin.height = typeData.size;
    memecoin.speed = typeData.speed + this.level * 0.3 + Math.random() * 1.5;
    memecoin.type = type;
    memecoin.rotation = 0;
    memecoin.rotationSpeed = (Math.random() - 0.5) * 0.15;
    memecoin.image = this.imageCache[typeData.image];
    memecoin.active = true;
    
    this.memecoins.push(memecoin);
  }

  spawnPowerup() {
    const powerup = this.getPowerupFromPool();
    if (!powerup) return;
    
    powerup.x = Math.random() * (this.canvas.width - 50);
    powerup.y = -50;
    powerup.width = 50; // Increased size
    powerup.height = 50; // Increased size
    powerup.speed = 2 + Math.random();
    powerup.type = 'bonus';
    powerup.rotation = 0;
    powerup.rotationSpeed = 0.1;
    powerup.glow = 0;
    powerup.active = true;
    
    this.powerups.push(powerup);
  }

  spawnBonusAtPosition(x, y) {
    const powerup = this.getPowerupFromPool();
    if (!powerup) return;
    
    powerup.x = x;
    powerup.y = y;
    powerup.width = 50;
    powerup.height = 50;
    powerup.speed = 1;
    powerup.type = 'bonus';
    powerup.rotation = 0;
    powerup.rotationSpeed = 0.1;
    powerup.glow = 0;
    powerup.active = true;
    
    this.powerups.push(powerup);
  }

  updateMemecoins() {
    for (let i = this.memecoins.length - 1; i >= 0; i--) {
      const memecoin = this.memecoins[i];
      if (!memecoin.active) continue;
      
      memecoin.y += memecoin.speed;
      memecoin.rotation += memecoin.rotationSpeed;
      
      // Check if memecoin reached bottom
      if (memecoin.y > this.canvas.height) {
        memecoin.active = false;
        this.memecoins.splice(i, 1);
        this.loseLife();
      }
    }
  }

  updatePowerups() {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      if (!powerup.active) continue;
      
      powerup.y += powerup.speed;
      powerup.rotation += powerup.rotationSpeed;
      powerup.glow += 0.1;
      
      // Remove if off screen
      if (powerup.y > this.canvas.height) {
        powerup.active = false;
        this.powerups.splice(i, 1);
      }
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      if (!particle.active) continue;
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      // Add gravity
      particle.vy += 0.15;
      
      if (particle.life <= 0) {
        particle.active = false;
        this.particles.splice(i, 1);
      }
    }
  }

  updatePlayer() {
    // Update punch timer
    if (this.player.punchTimer > 0) {
      this.player.punchTimer--;
      if (this.player.punchTimer <= 0) {
        this.player.isPunching = false;
      }
    }
    
    // Update powerup timer
    if (this.player.powerupTimer > 0) {
      this.player.powerupTimer--;
      if (this.player.powerupTimer <= 0) {
        this.player.punchRadius = 80;
      }
    }
    
    // Update invulnerability
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer--;
      if (this.player.invulnerableTimer <= 0) {
        this.player.invulnerable = false;
      }
    }
  }

  loseLife() {
    if (this.player.invulnerable) return;
    
    this.lives--;
    this.combo = 0;
    this.player.invulnerable = true;
    this.player.invulnerableTimer = 120; // 2 seconds of invulnerability
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.createLifeLostEffect();
    }
    
    this.updateUI();
  }

  createLifeLostEffect() {
    // Screen flash effect
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  completeLevel() {
    this.gameRunning = false;
    
    // Calculate level bonus
    const levelBonus = this.level * 1000 + this.combo * 100;
    this.score += levelBonus;
    
    // Show level complete screen
    document.getElementById('levelScore').textContent = this.score;
    document.getElementById('levelBonus').textContent = levelBonus;
    document.getElementById('nextLevel').textContent = this.level + 1;
    document.getElementById('levelComplete').style.display = 'block';
  }

  nextLevel() {
    this.level++;
    this.destroyed = 0;
    this.levelTarget = Math.floor(10 + this.level * 1.5);
    
    // Increase difficulty
    this.spawnRate = Math.max(30, this.baseSpawnRate - this.level * 2);
    this.powerupSpawnRate = Math.max(200, 400 - this.level * 4);
    
    // Clear objects
    this.clearAllObjects();
    
    // Hide level complete screen
    document.getElementById('levelComplete').style.display = 'none';
    
    // Check if game completed (50 levels)
    if (this.level > 50) {
      this.gameCompleted();
      return;
    }
    
    this.updateUI();
    this.gameRunning = true;
    this.levelStartTime = Date.now();
  }

  clearAllObjects() {
    // Return all objects to pools
    this.memecoins.forEach(m => m.active = false);
    this.powerups.forEach(p => p.active = false);
    this.particles.forEach(p => p.active = false);
    
    this.memecoins = [];
    this.powerups = [];
    this.particles = [];
  }

  gameCompleted() {
    const totalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    
    // Update completion screen
    document.getElementById('completedScore').textContent = this.score;
    document.getElementById('completedCombo').textContent = this.maxCombo;
    document.getElementById('completedDestroyed').textContent = this.totalDestroyed;
    document.getElementById('completedTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Show completion screen
    document.getElementById('gameCompleted').style.display = 'block';
  }

  gameOver() {
    this.gameRunning = false;
    
    // Stop ambient music
    if (this.audioFiles.ambiance) {
      this.audioFiles.ambiance.pause();
    }
    
    // Update game over screen
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalLevel').textContent = this.level;
    
    // Show game over screen
    document.getElementById('gameOver').style.display = 'block';
  }

  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
    document.getElementById('lives').textContent = this.lives;
    document.getElementById('combo').textContent = this.combo;
    document.getElementById('target').textContent = this.levelTarget;
    document.getElementById('destroyed').textContent = this.destroyed;
    document.getElementById('levelTarget').textContent = this.levelTarget;
    
    // Update progress bar
    const progress = (this.destroyed / this.levelTarget) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background image or gradient fallback
    if (this.backgroundImage && this.backgroundImage.complete) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      // Fallback gradient
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, '#001122');
      gradient.addColorStop(0.5, '#002244');
      gradient.addColorStop(1, '#000011');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Draw particles first (background layer)
    this.renderParticles();
    
    // Draw memecoins
    this.renderMemecoins();
    
    // Draw powerups
    this.renderPowerups();
    
    // Draw player
    this.renderPlayer();
    
    // Draw punch effect
    if (this.player.isPunching) {
      this.renderPunchEffect();
    }
  }

  renderPlayer() {
    this.ctx.save();
    
    // Apply invulnerability flashing
    if (this.player.invulnerable && Math.floor(Date.now() / 100) % 2) {
      this.ctx.globalAlpha = 0.5;
    }
    
    // Choose the right player image
    let playerImage = null;
    if (this.player.isPunching && this.playerImages.punching && this.playerImages.punching.complete) {
      playerImage = this.playerImages.punching;
    } else if (this.playerImages.normal && this.playerImages.normal.complete) {
      playerImage = this.playerImages.normal;
    }
    
    // Draw player image with background removal
    if (playerImage) {
      // Create a temporary canvas to process the image and remove background
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = this.player.width;
      tempCanvas.height = this.player.height;
      
      // Draw the original image
      tempCtx.drawImage(playerImage, 0, 0, tempCanvas.width, tempCanvas.height);
      
      // Get image data to process pixels
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      
      // Remove black/dark background (make transparent)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // If pixel is very dark (likely background), make it transparent
        if (r < 50 && g < 50 && b < 50) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
        // Also remove very similar colors to black
        else if (r < 80 && g < 80 && b < 80 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
          data[i + 3] = 0;
        }
      }
      
      // Put the processed image data back
      tempCtx.putImageData(imageData, 0, 0);
      
      // Draw the processed image
      this.ctx.drawImage(tempCanvas, this.player.x, this.player.y);
    } else {
      // Fallback to generated sprite if images not loaded
      if (this.player.sprite) {
        this.ctx.drawImage(
          this.player.sprite,
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height
        );
      }
    }
    
    // Draw powerup glow effect
    if (this.player.powerupTimer > 0) {
      this.ctx.shadowColor = '#ffaa00';
      this.ctx.shadowBlur = 20;
      this.ctx.strokeStyle = '#ffaa00';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this.player.x - 5, this.player.y - 5, this.player.width + 10, this.player.height + 10);
    }
    
    this.ctx.restore();
  }

  renderMemecoins() {
    for (const memecoin of this.memecoins) {
      if (!memecoin.active) continue;
      
      this.ctx.save();
      this.ctx.translate(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
      this.ctx.rotate(memecoin.rotation);
      
      if (memecoin.image && memecoin.image.complete) {
        this.ctx.drawImage(
          memecoin.image,
          -memecoin.width / 2,
          -memecoin.height / 2,
          memecoin.width,
          memecoin.height
        );
      } else {
        // Fallback colored circle
        const typeData = this.memecoinTypes[memecoin.type];
        this.ctx.fillStyle = typeData.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, memecoin.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.restore();
    }
  }

  renderPowerups() {
    for (const powerup of this.powerups) {
      if (!powerup.active) continue;
      
      this.ctx.save();
      this.ctx.translate(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
      this.ctx.rotate(powerup.rotation);
      
      // Glow effect
      const glowIntensity = Math.sin(powerup.glow) * 0.5 + 0.5;
      this.ctx.shadowColor = '#ffaa00';
      this.ctx.shadowBlur = 15 + glowIntensity * 10;
      
      if (this.bonusImage && this.bonusImage.complete) {
        this.ctx.drawImage(
          this.bonusImage,
          -powerup.width / 2,
          -powerup.height / 2,
          powerup.width,
          powerup.height
        );
      } else {
        // Fallback golden star
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * (powerup.width / 2);
          const y = Math.sin(angle) * (powerup.height / 2);
          if (i === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
      }
      
      this.ctx.restore();
    }
  }

  renderParticles() {
    for (const particle of this.particles) {
      if (!particle.active) continue;
      
      this.ctx.save();
      const alpha = particle.life / particle.maxLife;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  renderPunchEffect() {
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    
    this.ctx.save();
    this.ctx.strokeStyle = '#ffaa00';
    this.ctx.lineWidth = 3;
    this.ctx.globalAlpha = this.player.punchTimer / 15;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.player.punchRadius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  gameLoop(currentTime) {
    if (this.isLoading) {
      requestAnimationFrame((time) => this.gameLoop(time));
      return;
    }

    // Frame rate limiting for consistent performance
    if (currentTime - this.lastFrameTime < this.frameInterval) {
      requestAnimationFrame((time) => this.gameLoop(time));
      return;
    }
    this.lastFrameTime = currentTime;

    if (this.gameRunning) {
      // Handle input
      this.handleInput();
      
      // Update game objects
      this.updatePlayer();
      this.updateMemecoins();
      this.updatePowerups();
      this.updateParticles();
      
      // Spawn objects
      this.spawnTimer++;
      if (this.spawnTimer >= this.spawnRate) {
        this.spawnMemecoin();
        this.spawnTimer = 0;
      }
      
      this.powerupSpawnTimer++;
      if (this.powerupSpawnTimer >= this.powerupSpawnRate) {
        this.spawnPowerup();
        this.powerupSpawnTimer = 0;
      }
    }
    
    // Render everything
    this.render();
    
    // Continue game loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  startGame() {
    document.getElementById('gameStart').style.display = 'none';
    this.resetGame();
    this.gameRunning = true;
    this.gameStartTime = Date.now();
    this.levelStartTime = Date.now();
    
    // Start ambient music if not already playing
    if (this.audioFiles.ambiance && this.audioFiles.ambiance.paused) {
      this.audioFiles.ambiance.play().catch(() => {});
    }
  }

  resetGame() {
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.destroyed = 0;
    this.totalDestroyed = 0;
    this.levelTarget = 10;
    this.spawnRate = this.baseSpawnRate;
    this.powerupSpawnRate = 400;
    this.spawnTimer = 0;
    this.powerupSpawnTimer = 0;
    
    this.clearAllObjects();
    this.resetPlayerPosition();
    this.updateUI();
  }

  restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('gameCompleted').style.display = 'none';
    this.startGame();
  }

  continueToNextLevel() {
    this.nextLevel();
  }

  backToMenu() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('levelComplete').style.display = 'none';
    document.getElementById('gameCompleted').style.display = 'none';
    document.getElementById('gameStart').style.display = 'block';
    this.gameRunning = false;
    
    // Pause ambient music
    if (this.audioFiles.ambiance) {
      this.audioFiles.ambiance.pause();
    }
  }

  showControls() {
    alert(`🎮 GAME CONTROLS 🎮

🖱️ MOUSE/TOUCH:
• Move mouse to control LFIST
• Click or tap to punch

⌨️ KEYBOARD:
• Arrow keys or WASD to move
• Spacebar to punch

🎯 OBJECTIVE:
• Destroy falling memecoins
• Collect golden bonuses
• Don't let memecoins reach the ground
• Complete all 50 levels!

💡 TIPS:
• Keep your combo going for bonus points
• Golden bonuses give temporary power-ups
• Each level increases difficulty
• Stay mobile to avoid losing lives`);
  }
}

// Social sharing functions
function shareOnTwitter() {
  const score = document.getElementById('finalScore').textContent;
  const level = document.getElementById('finalLevel').textContent;
  const text = `🥊 Just scored ${score} points and reached level ${level} in LFIST Game! 💥 Can you beat my score? Play now! #LFISTGame #Gaming`;
  const url = encodeURIComponent(window.location.href);
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
}

function shareOnFacebook() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnTelegram() {
  const score = document.getElementById('finalScore').textContent;
  const level = document.getElementById('finalLevel').textContent;
  const text = `🥊 Just scored ${score} points and reached level ${level} in LFIST Game! 💥 Can you beat my score?`;
  const url = encodeURIComponent(window.location.href);
  window.open(`https://t.me/share/url?url=${url}&text=${encodeURIComponent(text)}`, '_blank');
}

function copyScore() {
  const score = document.getElementById('finalScore').textContent;
  const level = document.getElementById('finalLevel').textContent;
  const text = `🥊 Just scored ${score} points and reached level ${level} in LFIST Game! 💥 Can you beat my score? ${window.location.href}`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert('Score copied to clipboard! 📋');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Score copied to clipboard! 📋');
  });
}

function shareCompletion() {
  const score = document.getElementById('completedScore').textContent;
  const combo = document.getElementById('completedCombo').textContent;
  const text = `🏆 VICTORY! I completed all 50 levels of LFIST Game! 💥 Final score: ${score} | Max combo: ${combo} | I'm a true LFIST master! 🥊 #LFISTGame #Victory #Gaming`;
  const url = encodeURIComponent(window.location.href);
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
}

function shareCompletionFacebook() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareCompletionTelegram() {
  const score = document.getElementById('completedScore').textContent;
  const combo = document.getElementById('completedCombo').textContent;
  const text = `🏆 VICTORY! I completed all 50 levels of LFIST Game! 💥 Final score: ${score} | Max combo: ${combo} | I'm a true LFIST master! 🥊`;
  const url = encodeURIComponent(window.location.href);
  window.open(`https://t.me/share/url?url=${url}&text=${encodeURIComponent(text)}`, '_blank');
}

function copyCompletion() {
  const score = document.getElementById('completedScore').textContent;
  const combo = document.getElementById('completedCombo').textContent;
  const text = `🏆 VICTORY! I completed all 50 levels of LFIST Game! 💥 Final score: ${score} | Max combo: ${combo} | I'm a true LFIST master! 🥊 ${window.location.href}`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert('Achievement copied to clipboard! 📋');
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Achievement copied to clipboard! 📋');
  });
}

// Global game functions
function startGame() {
  if (window.game) {
    window.game.startGame();
  }
}

function restartGame() {
  if (window.game) {
    window.game.restartGame();
  }
}

function continueToNextLevel() {
  if (window.game) {
    window.game.continueToNextLevel();
  }
}

function backToMenu() {
  if (window.game) {
    window.game.backToMenu();
  }
}

function showControls() {
  if (window.game) {
    window.game.showControls();
  }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.game = new LFistGame();
  window.game.gameLoop(0);
});