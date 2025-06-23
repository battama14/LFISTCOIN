// LFIST Game - Corrections minimales pour les 3 problèmes
// Copie du fichier original avec corrections ciblées

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
    
    // Images
    this.backgroundImage = null;
    this.playerImages = {
      normal: null,
      punching: null
    };
    
    // Memecoin types with Trump
    this.memecoinTypes = {
      doge: { color: '#ffaa00', points: 10, speed: 2, size: 40, image: 'memecoins/binance-peg-dogecoin.png', rarity: 'common' },
      shiba: { color: '#ff6600', points: 20, speed: 2.2, size: 40, image: 'memecoins/shiba-inu.png', rarity: 'common' },
      akita: { color: '#ff4400', points: 25, speed: 2.5, size: 40, image: 'memecoins/akita-inu.png', rarity: 'uncommon' },
      catecoin: { color: '#ff8800', points: 30, speed: 2.8, size: 40, image: 'memecoins/catecoin.png', rarity: 'rare' },
      samoyed: { color: '#ffcc00', points: 40, speed: 3, size: 40, image: 'memecoins/samoyedcoin.png', rarity: 'rare' },
      trump: { color: '#ff0000', points: 100, speed: 0.8, size: 45, image: 'memecoins/trump.jpg', rarity: 'legendary', bonus: true }
    };
    
    // Game objects
    this.memecoins = [];
    this.powerups = [];
    this.particles = [];
    
    // Object pools for performance
    this.memecoinPool = [];
    this.powerupPool = [];
    this.particlePool = [];
    
    // Spawn timers
    this.spawnTimer = 0;
    this.powerupSpawnTimer = 0;
    
    // Mobile detection
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    this.setupCanvas();
    this.loadAssets();
  }

  setupCanvas() {
    // Responsive canvas setup
    const container = document.getElementById('gameContainer');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Maintain 4:3 aspect ratio
    const aspectRatio = 4 / 3;
    let canvasWidth, canvasHeight;
    
    if (containerWidth / containerHeight > aspectRatio) {
      canvasHeight = containerHeight * 0.9;
      canvasWidth = canvasHeight * aspectRatio;
    } else {
      canvasWidth = containerWidth * 0.9;
      canvasHeight = canvasWidth / aspectRatio;
    }
    
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.style.width = canvasWidth + 'px';
    this.canvas.style.height = canvasHeight + 'px';
    
    // Center player
    this.player.x = this.canvas.width / 2 - this.player.width / 2;
    this.player.y = this.canvas.height / 2 - this.player.height / 2;
  }

  async loadAssets() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingFill = document.getElementById('loadingFill');
    const loadingText = document.getElementById('loadingText');
    
    const imageAssets = [
      'memecoins/binance-peg-dogecoin.png',
      'memecoins/shiba-inu.png', 
      'memecoins/akita-inu.png',
      'memecoins/catecoin.png',
      'memecoins/samoyedcoin.png',
      'memecoins/trump.jpg',
      'bonus.png',
      'fondjeu2.jpeg',
      'persofix.jpeg',
      'persopoing.jpeg'
    ];
    
    const audioAssets = [
      'coup.mp3',
      'bonus.mp3', 
      'ambiance.mp3',
      'sontrump.mp3'
    ];
    
    this.totalAssets = imageAssets.length + audioAssets.length;
    this.loadedAssets = 0;
    
    // Load images
    for (const src of imageAssets) {
      try {
        const img = await this.loadImage(src);
        
        // Store specific images
        if (src === 'fondjeu2.jpeg') {
          this.backgroundImage = img;
        } else if (src === 'persofix.jpeg') {
          this.playerImages.normal = img;
        } else if (src === 'persopoing.jpeg') {
          this.playerImages.punching = img;
        }
        
        this.loadedAssets++;
        this.updateLoadingProgress();
      } catch (error) {
        console.warn(`Failed to load image: ${src}`);
        this.loadedAssets++;
        this.updateLoadingProgress();
      }
    }
    
    // Load audio
    for (const src of audioAssets) {
      try {
        const audio = await this.loadAudio(src);
        const key = src.replace('.mp3', '').replace('son', '');
        this.audioFiles[key] = audio;
        
        this.loadedAssets++;
        this.updateLoadingProgress();
      } catch (error) {
        console.warn(`Failed to load audio: ${src}`);
        this.loadedAssets++;
        this.updateLoadingProgress();
      }
    }
    
    // Start ambient music
    if (this.audioFiles.ambiance) {
      this.audioFiles.ambiance.loop = true;
      this.audioFiles.ambiance.volume = 0.3;
      this.audioFiles.ambiance.play().catch(() => {});
    }
    
    // Hide loading screen and start game
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      this.startGame();
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
      audio.onloadeddata = () => resolve(audio);
      audio.onerror = reject;
      audio.src = src;
    });
  }

  updateLoadingProgress() {
    const progress = (this.loadedAssets / this.totalAssets) * 100;
    const loadingFill = document.getElementById('loadingFill');
    const loadingText = document.getElementById('loadingText');
    loadingFill.style.width = progress + '%';
    loadingText.textContent = Math.round(progress) + '%';
  }

  startGame() {
    this.gameRunning = true;
    this.gameStartTime = Date.now();
    this.levelStartTime = Date.now();
    this.createPlayerSprite();
    this.setupControls();
    this.gameLoop();
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

  setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (!this.gameRunning) return;
      
      switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.player.x -= this.player.speed;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.player.x += this.player.speed;
          break;
        case 'ArrowUp':
        case 'KeyW':
          this.player.y -= this.player.speed;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.player.y += this.player.speed;
          break;
        case 'Space':
          this.punch();
          e.preventDefault();
          break;
      }
      this.constrainPlayer();
    });
    
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      touchStartX = touch.clientX - rect.left;
      touchStartY = touch.clientY - rect.top;
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.gameRunning) return;
      
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      // Convert to canvas coordinates
      const canvasX = (touchX / rect.width) * this.canvas.width;
      const canvasY = (touchY / rect.height) * this.canvas.height;
      
      // Move player towards touch
      this.player.x = canvasX - this.player.width / 2;
      this.player.y = canvasY - this.player.height / 2;
      this.constrainPlayer();
    });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.punch();
    });
  }

  constrainPlayer() {
    this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
    this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
  }

  punch() {
    if (this.player.punchTimer > 0) return;
    
    this.player.isPunching = true;
    this.player.punchTimer = 20;
    
    // Play punch sound
    if (this.audioFiles.coup) {
      this.audioFiles.coup.currentTime = 0;
      this.audioFiles.coup.volume = 0.5;
      this.audioFiles.coup.play().catch(() => {});
    }
    
    // Check for hits
    this.checkPunchHits();
  }

  checkPunchHits() {
    const punchRadius = this.player.powerupTimer > 0 ? 120 : 80;
    const playerCenterX = this.player.x + this.player.width / 2;
    const playerCenterY = this.player.y + this.player.height / 2;
    
    // Check memecoins
    for (let i = this.memecoins.length - 1; i >= 0; i--) {
      const memecoin = this.memecoins[i];
      const distance = Math.sqrt(
        Math.pow(memecoin.x + memecoin.width / 2 - playerCenterX, 2) +
        Math.pow(memecoin.y + memecoin.height / 2 - playerCenterY, 2)
      );
      
      if (distance < punchRadius) {
        this.destroyMemecoin(i);
      }
    }
    
    // Check powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      const distance = Math.sqrt(
        Math.pow(powerup.x + powerup.width / 2 - playerCenterX, 2) +
        Math.pow(powerup.y + powerup.height / 2 - playerCenterY, 2)
      );
      
      if (distance < punchRadius) {
        this.collectPowerup(i);
      }
    }
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
      
      // Show special Trump message - CORRECTION 1
      this.showTrumpMessage();
      
      // Spawn a bonus item at Trump's position
      this.spawnBonusAtPosition(memecoin.x, memecoin.y);
      
      // Special Trump destruction effect
      this.createTrumpDestructionEffect(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
    } else {
      // Regular memecoin destruction
      const basePoints = typeData.points * 10;
      const comboMultiplier = Math.floor(this.combo / 5) + 1;
      const points = basePoints * comboMultiplier;
      
      this.score += points;
      this.combo++;
      
      // Create destruction effect
      this.createDestructionEffect(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2, typeData.color);
    }
    
    this.destroyed++;
    this.totalDestroyed++;
    
    // Show combo if high enough
    if (this.combo >= 5) {
      this.showCombo();
    }
    
    // Return to pool
    memecoin.active = false;
    this.memecoins.splice(index, 1);
    
    // Check level completion
    if (this.destroyed >= this.levelTarget) {
      this.nextLevel();
    }
    
    this.updateUI();
  }

  collectPowerup(index) {
    const powerup = this.powerups[index];
    
    // Show Chimay beer message - CORRECTION 2
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

  // CORRECTION 1: Trump message function
  showTrumpMessage() {
    console.log('🎯 TRUMP MESSAGE TRIGGERED!');
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background: linear-gradient(45deg, #ff0000, #ffaa00) !important;
      color: white !important;
      padding: 20px 40px !important;
      border-radius: 15px !important;
      font-family: Arial, sans-serif !important;
      font-size: 20px !important;
      font-weight: bold !important;
      text-align: center !important;
      z-index: 999999 !important;
      box-shadow: 0 0 30px rgba(255, 0, 0, 0.8) !important;
      border: 3px solid #ffaa00 !important;
      pointer-events: none !important;
      opacity: 1 !important;
      display: block !important;
    `;
    messageDiv.innerHTML = `
      🎯 LEGENDARY TRUMP DESTROYED! 🎯<br>
      <span style="font-size: 16px; color: #ffff00;">+5000 POINTS + BONUS!</span>
    `;
    
    document.body.appendChild(messageDiv);
    console.log('Trump message added to DOM');
    
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
        console.log('Trump message removed');
      }
    }, 3000);
  }

  // CORRECTION 2: Chimay message function
  showChimayMessage() {
    console.log('🍺 CHIMAY MESSAGE TRIGGERED!');
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed !important;
      top: 30% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background: linear-gradient(45deg, #8B4513, #DAA520) !important;
      color: white !important;
      padding: 15px 30px !important;
      border-radius: 10px !important;
      font-family: Arial, sans-serif !important;
      font-size: 16px !important;
      font-weight: bold !important;
      text-align: center !important;
      z-index: 999998 !important;
      box-shadow: 0 0 20px rgba(218, 165, 32, 0.6) !important;
      border: 2px solid #DAA520 !important;
      pointer-events: none !important;
      opacity: 1 !important;
      display: block !important;
    `;
    messageDiv.innerHTML = `
      🍺 SMALL CHIMAY BEER! 🍺<br>
      <span style="font-size: 12px; color: #ffff88;">+500 POINTS + POWER UP!</span>
    `;
    
    document.body.appendChild(messageDiv);
    console.log('Chimay message added to DOM');
    
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
        console.log('Chimay message removed');
      }
    }, 2000);
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

  spawnMemecoin() {
    const memecoin = this.getMemecoinFromPool();
    if (!memecoin) return;
    
    const types = Object.keys(this.memecoinTypes);
    let type;
    
    // Trump has 3% chance to spawn (ultra rare) - CORRECTION 3
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
    memecoin.speed = typeData.speed + Math.random() * 0.5;
    memecoin.type = type;
    memecoin.rotation = 0;
    memecoin.rotationSpeed = (Math.random() - 0.5) * 0.1;
    memecoin.active = true;
    
    this.memecoins.push(memecoin);
  }

  spawnPowerup() {
    const powerup = this.getPowerupFromPool();
    if (!powerup) return;
    
    powerup.x = Math.random() * (this.canvas.width - 50);
    powerup.y = -50;
    powerup.width = 50;  // CORRECTION 4: Larger bonus size
    powerup.height = 50; // CORRECTION 4: Larger bonus size
    powerup.speed = 1.5 + Math.random() * 0.5;
    powerup.rotation = 0;
    powerup.rotationSpeed = 0.1;
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
    powerup.rotation = 0;
    powerup.rotationSpeed = 0.1;
    powerup.active = true;
    
    this.powerups.push(powerup);
  }

  getMemecoinFromPool() {
    for (const memecoin of this.memecoinPool) {
      if (!memecoin.active) {
        return memecoin;
      }
    }
    
    // Create new if pool is empty
    const newMemecoin = { active: false };
    this.memecoinPool.push(newMemecoin);
    return newMemecoin;
  }

  getPowerupFromPool() {
    for (const powerup of this.powerupPool) {
      if (!powerup.active) {
        return powerup;
      }
    }
    
    // Create new if pool is empty
    const newPowerup = { active: false };
    this.powerupPool.push(newPowerup);
    return newPowerup;
  }

  createDestructionEffect(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const particle = this.getParticleFromPool();
      if (particle) {
        particle.x = x;
        particle.y = y;
        particle.vx = (Math.random() - 0.5) * 8;
        particle.vy = (Math.random() - 0.5) * 8;
        particle.life = 30;
        particle.maxLife = 30;
        particle.color = color;
        particle.size = Math.random() * 4 + 2;
        particle.active = true;
        this.particles.push(particle);
      }
    }
  }

  createTrumpDestructionEffect(x, y) {
    // Special golden effect for Trump
    for (let i = 0; i < 20; i++) {
      const particle = this.getParticleFromPool();
      if (particle) {
        particle.x = x;
        particle.y = y;
        particle.vx = (Math.random() - 0.5) * 12;
        particle.vy = (Math.random() - 0.5) * 12;
        particle.life = 50;
        particle.maxLife = 50;
        particle.color = i % 2 === 0 ? '#ffaa00' : '#ff0000';
        particle.size = Math.random() * 6 + 3;
        particle.active = true;
        this.particles.push(particle);
      }
    }
  }

  createCollectionEffect(x, y) {
    for (let i = 0; i < 6; i++) {
      const particle = this.getParticleFromPool();
      if (particle) {
        particle.x = x;
        particle.y = y;
        particle.vx = (Math.random() - 0.5) * 6;
        particle.vy = (Math.random() - 0.5) * 6;
        particle.life = 25;
        particle.maxLife = 25;
        particle.color = '#00ff88';
        particle.size = Math.random() * 3 + 2;
        particle.active = true;
        this.particles.push(particle);
      }
    }
  }

  getParticleFromPool() {
    for (const particle of this.particlePool) {
      if (!particle.active) {
        return particle;
      }
    }
    
    // Create new if pool is empty
    const newParticle = { active: false };
    this.particlePool.push(newParticle);
    return newParticle;
  }

  nextLevel() {
    this.level++;
    this.destroyed = 0;
    this.levelTarget = Math.min(20, 10 + this.level * 2);
    this.levelStartTime = Date.now();
    
    // Increase difficulty
    this.spawnTimer = Math.max(30, 60 - this.level * 2);
    
    this.updateUI();
  }

  updateUI() {
    document.getElementById('scoreDisplay').textContent = this.score.toLocaleString();
    document.getElementById('levelDisplay').textContent = this.level;
    document.getElementById('livesDisplay').textContent = this.lives;
    document.getElementById('comboCounter').textContent = this.combo;
    document.getElementById('destroyedDisplay').textContent = this.destroyed;
    document.getElementById('targetDisplay').textContent = this.levelTarget;
    
    const progress = (this.destroyed / this.levelTarget) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
  }

  update() {
    if (!this.gameRunning || this.gamePaused) return;
    
    // Update player
    if (this.player.punchTimer > 0) {
      this.player.punchTimer--;
      if (this.player.punchTimer === 0) {
        this.player.isPunching = false;
      }
    }
    
    if (this.player.powerupTimer > 0) {
      this.player.powerupTimer--;
    }
    
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer--;
      if (this.player.invulnerableTimer === 0) {
        this.player.invulnerable = false;
      }
    }
    
    // Spawn memecoins
    this.spawnTimer++;
    const spawnRate = Math.max(30, 60 - this.level * 2);
    if (this.spawnTimer >= spawnRate) {
      this.spawnMemecoin();
      this.spawnTimer = 0;
    }
    
    // Spawn powerups
    this.powerupSpawnTimer++;
    if (this.powerupSpawnTimer >= 400) {
      this.spawnPowerup();
      this.powerupSpawnTimer = 0;
    }
    
    // Update memecoins
    for (let i = this.memecoins.length - 1; i >= 0; i--) {
      const memecoin = this.memecoins[i];
      memecoin.y += memecoin.speed;
      memecoin.rotation += memecoin.rotationSpeed;
      
      if (memecoin.y > this.canvas.height) {
        // Memecoin escaped
        if (memecoin.type !== 'trump') { // Trump doesn't cause damage if missed
          this.lives--;
          this.combo = 0;
          
          if (this.lives <= 0) {
            this.gameOver();
            return;
          }
        }
        
        memecoin.active = false;
        this.memecoins.splice(i, 1);
      }
    }
    
    // Update powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      powerup.y += powerup.speed;
      powerup.rotation += powerup.rotationSpeed;
      
      if (powerup.y > this.canvas.height) {
        powerup.active = false;
        this.powerups.splice(i, 1);
      }
    }
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      if (particle.life <= 0) {
        particle.active = false;
        this.particles.splice(i, 1);
      }
    }
    
    this.updateUI();
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // CORRECTION 3: Draw background with proper aspect ratio
    if (this.backgroundImage && this.backgroundImage.complete) {
      // Calculate aspect ratios
      const canvasRatio = this.canvas.width / this.canvas.height;
      const imageRatio = this.backgroundImage.width / this.backgroundImage.height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imageRatio > canvasRatio) {
        // Image is wider than canvas - fit to height
        drawHeight = this.canvas.height;
        drawWidth = drawHeight * imageRatio;
        drawX = (this.canvas.width - drawWidth) / 2;
        drawY = 0;
      } else {
        // Image is taller than canvas - fit to width
        drawWidth = this.canvas.width;
        drawHeight = drawWidth / imageRatio;
        drawX = 0;
        drawY = (this.canvas.height - drawHeight) / 2;
      }
      
      // Draw background image with proper proportions
      this.ctx.drawImage(this.backgroundImage, drawX, drawY, drawWidth, drawHeight);
      
      // Fill any remaining areas with dark color
      if (drawX > 0) {
        this.ctx.fillStyle = '#001122';
        this.ctx.fillRect(0, 0, drawX, this.canvas.height);
        this.ctx.fillRect(drawX + drawWidth, 0, this.canvas.width - drawX - drawWidth, this.canvas.height);
      }
      if (drawY > 0) {
        this.ctx.fillStyle = '#001122';
        this.ctx.fillRect(0, 0, this.canvas.width, drawY);
        this.ctx.fillRect(0, drawY + drawHeight, this.canvas.width, this.canvas.height - drawY - drawHeight);
      }
    } else {
      // Fallback gradient
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, '#001122');
      gradient.addColorStop(0.5, '#002244');
      gradient.addColorStop(1, '#000011');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Draw player - CORRECTION 4: Simple background removal
    this.renderPlayer();
    
    // Draw memecoins
    this.memecoins.forEach(memecoin => {
      this.ctx.save();
      this.ctx.translate(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
      this.ctx.rotate(memecoin.rotation);
      
      const typeData = this.memecoinTypes[memecoin.type];
      const image = this.getMemecoinImage(memecoin.type);
      
      if (image && image.complete) {
        this.ctx.drawImage(image, -memecoin.width / 2, -memecoin.height / 2, memecoin.width, memecoin.height);
      } else {
        // Fallback
        this.ctx.fillStyle = typeData.color;
        this.ctx.fillRect(-memecoin.width / 2, -memecoin.height / 2, memecoin.width, memecoin.height);
      }
      
      this.ctx.restore();
    });
    
    // Draw powerups
    this.powerups.forEach(powerup => {
      this.ctx.save();
      this.ctx.translate(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
      this.ctx.rotate(powerup.rotation);
      
      const bonusImage = this.getBonusImage();
      if (bonusImage && bonusImage.complete) {
        this.ctx.drawImage(bonusImage, -powerup.width / 2, -powerup.height / 2, powerup.width, powerup.height);
      } else {
        // Fallback
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.fillRect(-powerup.width / 2, -powerup.height / 2, powerup.width, powerup.height);
      }
      
      this.ctx.restore();
    });
    
    // Draw particles
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
      this.ctx.restore();
    });
    
    // Draw punch effect
    if (this.player.isPunching) {
      this.renderPunchEffect();
    }
  }

  // CORRECTION 4: Simple player rendering with basic background removal
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
    
    // Draw player image with simple background removal
    if (playerImage) {
      // Use CSS filter to remove dark backgrounds
      this.ctx.filter = 'contrast(1.2) brightness(1.1)';
      this.ctx.globalCompositeOperation = 'multiply';
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
      
      this.ctx.globalCompositeOperation = 'screen';
      this.ctx.drawImage(
        playerImage,
        this.player.x,
        this.player.y,
        this.player.width,
        this.player.height
      );
      
      this.ctx.filter = 'none';
      this.ctx.globalCompositeOperation = 'source-over';
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

  renderPunchEffect() {
    const punchRadius = this.player.powerupTimer > 0 ? 120 : 80;
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    
    this.ctx.save();
    this.ctx.strokeStyle = this.player.powerupTimer > 0 ? '#ffaa00' : '#ff4444';
    this.ctx.lineWidth = 3;
    this.ctx.globalAlpha = 0.6;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, punchRadius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  getMemecoinImage(type) {
    // Simple image loading - you can expand this
    const imageMap = {
      'doge': 'memecoins/binance-peg-dogecoin.png',
      'shiba': 'memecoins/shiba-inu.png',
      'akita': 'memecoins/akita-inu.png',
      'catecoin': 'memecoins/catecoin.png',
      'samoyed': 'memecoins/samoyedcoin.png',
      'trump': 'memecoins/trump.jpg'
    };
    
    // Return cached image if available
    const src = imageMap[type];
    if (src && this.loadedImages && this.loadedImages[src]) {
      return this.loadedImages[src];
    }
    
    return null;
  }

  getBonusImage() {
    // Return bonus image if loaded
    if (this.loadedImages && this.loadedImages['bonus.png']) {
      return this.loadedImages['bonus.png'];
    }
    return null;
  }

  gameOver() {
    this.gameRunning = false;
    
    // Stop ambient music
    if (this.audioFiles.ambiance) {
      this.audioFiles.ambiance.pause();
    }
    
    // Show game over screen
    setTimeout(() => {
      const playAgain = confirm(`Game Over!\n\nFinal Score: ${this.score.toLocaleString()}\nLevel Reached: ${this.level}\nMax Combo: ${this.maxCombo}\n\nPlay again?`);
      
      if (playAgain) {
        location.reload();
      }
    }, 100);
  }

  gameLoop() {
    const currentTime = performance.now();
    
    if (currentTime - this.lastFrameTime >= this.frameInterval) {
      this.update();
      this.render();
      this.lastFrameTime = currentTime;
    }
    
    if (this.gameRunning) {
      requestAnimationFrame(() => this.gameLoop());
    }
  }
}

// Initialize game when page loads
window.addEventListener('load', () => {
  new LFistGame();
});