// LFIST Game - JavaScript Game Engine Complet
class LFistGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameRunning = false;
    this.gamePaused = false;
    
    // Game state
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.destroyed = 0;
    this.levelTarget = 10;
    
    // Player
    this.player = {
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      speed: 8,
      punchRadius: 100,
      isPunching: false,
      punchTimer: 0,
      sprite: null
    };
    
    // Game objects
    this.memecoins = [];
    this.powerups = [];
    this.particles = [];
    this.animations = [];
    
    // Input handling
    this.keys = {};
    this.lastTime = 0;
    
    // Game settings
    this.spawnRate = 60; // frames between spawns
    this.spawnTimer = 0;
    this.powerupSpawnRate = 300;
    this.powerupSpawnTimer = 0;
    
    // Initialize
    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.loadAssets();
    this.resetPlayerPosition();
    
    // Show start screen
    document.getElementById('gameStart').style.display = 'block';
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight - 80; // Account for header
    this.resetPlayerPosition();
  }

  resetPlayerPosition() {
    this.player.x = this.canvas.width / 2 - this.player.width / 2;
    this.player.y = this.canvas.height - this.player.height - 20;
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

    // Mouse/Touch input for mobile
    this.canvas.addEventListener('click', (e) => {
      if (this.gameRunning) {
        this.punch();
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.gameRunning) {
        const rect = this.canvas.getBoundingClientRect();
        this.player.x = e.clientX - rect.left - this.player.width / 2;
        this.player.y = e.clientY - rect.top - this.player.height / 2;
        this.constrainPlayer();
      }
    });

    // Touch events for mobile
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.gameRunning && e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.player.x = e.touches[0].clientX - rect.left - this.player.width / 2;
        this.player.y = e.touches[0].clientY - rect.top - this.player.height / 2;
        this.constrainPlayer();
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.gameRunning) {
        this.punch();
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  loadAssets() {
    // Create simple sprites using canvas drawing
    this.createSprites();
    // Load bonus image
    this.loadBonusImage();
  }

  createSprites() {
    // Create LFIST sprite with transparent background
    const lfistCanvas = document.createElement('canvas');
    lfistCanvas.width = 80;
    lfistCanvas.height = 80;
    const lfistCtx = lfistCanvas.getContext('2d');
    
    // Clear canvas to ensure transparency
    lfistCtx.clearRect(0, 0, 80, 80);
    
    // Draw LFIST character
    lfistCtx.fillStyle = '#00ff88';
    lfistCtx.fillRect(20, 10, 40, 50); // Body
    lfistCtx.fillStyle = '#ffcc88';
    lfistCtx.fillRect(25, 5, 30, 25); // Head
    lfistCtx.fillStyle = '#ff4444';
    lfistCtx.fillRect(10, 25, 15, 15); // Left fist
    lfistCtx.fillRect(55, 25, 15, 15); // Right fist
    lfistCtx.fillStyle = '#333';
    lfistCtx.fillRect(30, 10, 5, 5); // Left eye
    lfistCtx.fillRect(45, 10, 5, 5); // Right eye
    lfistCtx.fillStyle = '#ff0000';
    lfistCtx.fillRect(35, 18, 10, 3); // Mouth
    
    this.player.sprite = lfistCanvas;
  }

  loadBonusImage() {
    // Load bonus.png image
    this.bonusImage = new Image();
    this.bonusImage.onload = () => {
      console.log('Bonus image loaded successfully', this.bonusImage.width, 'x', this.bonusImage.height);
    };
    this.bonusImage.onerror = () => {
      console.error('Failed to load bonus image, creating fallback');
      this.createBonusSprite();
    };
    this.bonusImage.src = 'bonus.png';
    
    // Timeout fallback
    setTimeout(() => {
      if (!this.bonusImage.complete || this.bonusImage.naturalWidth === 0) {
        console.log('Bonus image timeout, creating fallback');
        this.createBonusSprite();
      }
    }, 2000);
  }

  createBonusSprite() {
    // Create a simple bonus sprite as fallback
    const bonusCanvas = document.createElement('canvas');
    bonusCanvas.width = 40;
    bonusCanvas.height = 40;
    const bonusCtx = bonusCanvas.getContext('2d');
    
    // Clear canvas
    bonusCtx.clearRect(0, 0, 40, 40);
    
    // Draw beer mug
    bonusCtx.fillStyle = '#ffaa00';
    bonusCtx.fillRect(8, 12, 20, 24); // Mug body
    bonusCtx.fillStyle = '#ffffff';
    bonusCtx.fillRect(10, 14, 16, 8); // Foam
    bonusCtx.fillStyle = '#ffaa00';
    bonusCtx.fillRect(28, 18, 6, 12); // Handle
    bonusCtx.fillRect(30, 20, 2, 8); // Handle hole
    
    // Convert canvas to image
    this.bonusImage = new Image();
    this.bonusImage.src = bonusCanvas.toDataURL();
  }

  constrainPlayer() {
    this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
    this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
  }

  handleInput() {
    if (!this.gameRunning) return;

    // Keyboard movement
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.player.x -= this.player.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.player.x += this.player.speed;
    }
    if (this.keys['ArrowUp'] || this.keys['KeyW']) {
      this.player.y -= this.player.speed;
    }
    if (this.keys['ArrowDown'] || this.keys['KeyS']) {
      this.player.y += this.player.speed;
    }

    this.constrainPlayer();
  }

  punch() {
    if (this.player.isPunching) return;
    
    this.player.isPunching = true;
    this.player.punchTimer = 20; // frames
    
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
    
    // Create punch particles
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 60,
        y: centerY + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30,
        maxLife: 30,
        color: '#ffaa00',
        size: Math.random() * 5 + 2
      });
    }
  }

  destroyMemecoin(index) {
    const memecoin = this.memecoins[index];
    
    // Add score with combo multiplier
    const baseScore = 100;
    const comboMultiplier = Math.floor(this.combo / 5) + 1;
    const points = baseScore * comboMultiplier;
    this.score += points;
    this.combo++;
    this.destroyed++;
    
    // Update max combo
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    
    // Show combo if high enough
    if (this.combo >= 5) {
      this.showCombo();
    }
    
    // Create destruction particles
    this.createDestructionEffect(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
    
    // Remove memecoin
    this.memecoins.splice(index, 1);
    
    // Check level completion
    if (this.destroyed >= this.levelTarget) {
      this.completeLevel();
    }
    
    this.updateUI();
  }

  collectPowerup(index) {
    const powerup = this.powerups[index];
    
    // Add bonus points
    this.score += 500;
    this.combo += 3;
    
    // Special effects based on powerup type
    if (powerup.type === 'fist') {
      // Temporary punch radius increase
      this.player.punchRadius = 150;
      setTimeout(() => {
        this.player.punchRadius = 100;
      }, 5000);
    }
    
    // Create collection effect
    this.createCollectionEffect(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
    
    // Remove powerup
    this.powerups.splice(index, 1);
    
    this.updateUI();
  }

  createDestructionEffect(x, y) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 40,
        maxLife: 40,
        color: '#ff4444',
        size: Math.random() * 4 + 1
      });
    }
  }

  createCollectionEffect(x, y) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 50,
        maxLife: 50,
        color: '#ffaa00',
        size: Math.random() * 6 + 2
      });
    }
  }

  showCombo() {
    const comboDisplay = document.getElementById('comboDisplay');
    const multiplier = Math.floor(this.combo / 5) + 1;
    document.getElementById('comboMultiplier').textContent = multiplier;
    comboDisplay.classList.add('show');
    
    setTimeout(() => {
      comboDisplay.classList.remove('show');
    }, 2000);
  }

  spawnMemecoin() {
    const types = ['doge', 'pepe', 'shiba', 'floki'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const memecoin = {
      x: Math.random() * (this.canvas.width - 40),
      y: -40,
      width: 40,
      height: 40,
      speed: 2 + this.level * 0.5 + Math.random() * 2,
      type: type,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    };
    
    this.memecoins.push(memecoin);
  }

  spawnPowerup() {
    const powerup = {
      x: Math.random() * (this.canvas.width - 40),
      y: -50,
      width: 40,
      height: 40,
      speed: 3 + Math.random(),
      type: 'fist',
      rotation: 0,
      rotationSpeed: 0.1,
      glow: 0
    };
    
    this.powerups.push(powerup);
  }

  updateMemecoins() {
    for (let i = this.memecoins.length - 1; i >= 0; i--) {
      const memecoin = this.memecoins[i];
      memecoin.y += memecoin.speed;
      memecoin.rotation += memecoin.rotationSpeed;
      
      // Check if memecoin reached bottom
      if (memecoin.y > this.canvas.height) {
        this.memecoins.splice(i, 1);
        this.loseLife();
      }
    }
  }

  updatePowerups() {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      powerup.y += powerup.speed;
      powerup.rotation += powerup.rotationSpeed;
      powerup.glow += 0.1;
      
      // Remove if off screen
      if (powerup.y > this.canvas.height) {
        this.powerups.splice(i, 1);
      }
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      // Add gravity
      particle.vy += 0.2;
      
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  loseLife() {
    this.lives--;
    this.combo = 0; // Reset combo on life lost
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Flash effect
      this.createLifeLostEffect();
    }
    
    this.updateUI();
  }

  createLifeLostEffect() {
    // Screen flash effect
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  completeLevel() {
    this.gameRunning = false;
    
    // Calculate level bonus
    const levelBonus = this.level * 1000 + this.combo * 100;
    this.score += levelBonus;
    
    // Show level complete screen
    document.getElementById('levelScore').textContent = this.score;
    document.getElementById('levelBonus').textContent = levelBonus;
    document.getElementById('levelComplete').style.display = 'block';
  }

  nextLevel() {
    this.level++;
    this.destroyed = 0;
    this.levelTarget = Math.floor(10 + this.level * 2.5);
    
    // Increase difficulty
    this.spawnRate = Math.max(20, 60 - this.level * 2);
    this.powerupSpawnRate = Math.max(150, 300 - this.level * 5);
    
    // Clear objects
    this.memecoins = [];
    this.powerups = [];
    this.particles = [];
    
    // Hide level complete screen
    document.getElementById('levelComplete').style.display = 'none';
    
    // Check if game completed (50 levels)
    if (this.level > 50) {
      this.gameCompleted();
      return;
    }
    
    this.updateUI();
    this.gameRunning = true;
  }

  gameCompleted() {
    // Show special completion screen
    alert(`🏆 FÉLICITATIONS ! 🏆\n\nVous avez terminé tous les 50 niveaux !\n\nScore Final: ${this.score}\nCombo Maximum: ${this.maxCombo}\n\nVous êtes un vrai maître LFIST !`);
    this.restartGame();
  }

  gameOver() {
    this.gameRunning = false;
    
    // Show game over screen
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalLevel').textContent = this.level;
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

  update(currentTime) {
    if (!this.gameRunning) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Handle input
    this.handleInput();
    
    // Update punch timer
    if (this.player.punchTimer > 0) {
      this.player.punchTimer--;
      if (this.player.punchTimer <= 0) {
        this.player.isPunching = false;
      }
    }
    
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
    
    // Update game objects
    this.updateMemecoins();
    this.updatePowerups();
    this.updateParticles();
  }

  drawPlayer() {
    this.ctx.save();
    
    // Draw punch effect
    if (this.player.isPunching) {
      this.ctx.strokeStyle = '#ffaa00';
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.arc(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        this.player.punchRadius,
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
    }
    
    // Draw player sprite
    if (this.player.sprite) {
      this.ctx.drawImage(
        this.player.sprite,
        this.player.x,
        this.player.y,
        this.player.width,
        this.player.height
      );
    }
    
    this.ctx.restore();
  }

  drawMemecoin(memecoin) {
    this.ctx.save();
    this.ctx.translate(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
    this.ctx.rotate(memecoin.rotation);
    
    // Draw memecoin based on type
    const colors = {
      doge: '#ffaa00',
      pepe: '#00ff00',
      shiba: '#ff6600',
      floki: '#ff00ff'
    };
    
    this.ctx.fillStyle = colors[memecoin.type] || '#ffaa00';
    this.ctx.fillRect(-memecoin.width / 2, -memecoin.height / 2, memecoin.width, memecoin.height);
    
    // Add simple face
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(-8, -8, 3, 3); // Left eye
    this.ctx.fillRect(5, -8, 3, 3);  // Right eye
    this.ctx.fillRect(-5, 2, 10, 2); // Mouth
    
    this.ctx.restore();
  }

  drawPowerup(powerup) {
    this.ctx.save();
    this.ctx.translate(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
    this.ctx.rotate(powerup.rotation);
    
    // Glow effect
    const glowIntensity = Math.sin(powerup.glow) * 0.5 + 0.5;
    this.ctx.shadowColor = '#ffaa00';
    this.ctx.shadowBlur = 20 * glowIntensity;
    
    // Draw bonus image if loaded, otherwise fallback to rectangle
    if (this.bonusImage && this.bonusImage.complete && this.bonusImage.naturalWidth > 0) {
      this.ctx.drawImage(
        this.bonusImage,
        -powerup.width / 2,
        -powerup.height / 2,
        powerup.width,
        powerup.height
      );
    } else {
      // Fallback: Draw fist powerup
      this.ctx.fillStyle = '#ffaa00';
      this.ctx.fillRect(-powerup.width / 2, -powerup.height / 2, powerup.width, powerup.height);
      
      // Add fist details
      this.ctx.fillStyle = '#ff6600';
      this.ctx.fillRect(-8, -8, 16, 10);
      this.ctx.fillRect(-6, 2, 12, 8);
    }
    
    // Reset shadow for text
    this.ctx.shadowBlur = 0;
    
    // Draw "pause biere" text below the bonus
    this.ctx.fillStyle = '#ffaa00';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('pause biere', 0, powerup.height / 2 + 15);
    
    this.ctx.restore();
  }

  drawParticle(particle) {
    this.ctx.save();
    
    const alpha = particle.life / particle.maxLife;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = particle.color;
    
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = 'rgba(15, 32, 39, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background stars
    this.drawStars();
    
    // Draw game objects
    this.particles.forEach(particle => this.drawParticle(particle));
    this.memecoins.forEach(memecoin => this.drawMemecoin(memecoin));
    this.powerups.forEach(powerup => this.drawPowerup(powerup));
    this.drawPlayer();
  }

  drawStars() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 137.5) % this.canvas.width;
      const y = (i * 73.3) % this.canvas.height;
      this.ctx.fillRect(x, y, 1, 1);
    }
  }

  gameLoop(currentTime) {
    this.update(currentTime);
    this.render();
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  start() {
    this.gameRunning = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  reset() {
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.destroyed = 0;
    this.levelTarget = 10;
    this.spawnRate = 60;
    this.spawnTimer = 0;
    this.powerupSpawnRate = 300;
    this.powerupSpawnTimer = 0;
    
    this.memecoins = [];
    this.powerups = [];
    this.particles = [];
    
    this.resetPlayerPosition();
    this.updateUI();
  }
}

// Global game instance
let game;

// Game control functions
function startGame() {
  document.getElementById('gameStart').style.display = 'none';
  game = new LFistGame();
  game.start();
}

function restartGame() {
  document.getElementById('gameOver').style.display = 'none';
  document.getElementById('levelComplete').style.display = 'none';
  game.reset();
  game.start();
}

function nextLevel() {
  game.nextLevel();
}

function goHome() {
  window.location.href = 'Index.html';
}

function showControls() {
  alert(`🎮 CONTRÔLES DU JEU 🎮

🖱️ SOURIS/TACTILE:
• Déplacez la souris pour bouger LFIST
• Cliquez pour donner un coup de poing

⌨️ CLAVIER:
• Flèches directionnelles ou WASD pour se déplacer
• ESPACE pour donner un coup de poing

🎯 OBJECTIFS:
• Détruisez les memecoins qui tombent
• Collectez les poings dorés pour des bonus
• Ne laissez pas les memecoins toucher le sol
• Survivez aux 50 niveaux !

💡 ASTUCES:
• Les combos augmentent vos points
• Les poings dorés augmentent votre portée temporairement
• La difficulté augmente à chaque niveau`);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Game will be initialized when start button is clicked
  console.log('LFIST Game Ready! 🥊');
});