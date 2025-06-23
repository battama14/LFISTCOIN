// LFIST Game - Moteur de jeu complet avec 50 niveaux
class LFistGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameRunning = false;
    this.gamePaused = false;
    this.gameStartTime = 0;
    this.levelStartTime = 0;
    
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
    this.levelTarget = 100;
    this.bonusCollected = 0; // Bonus collected counter
    this.rotSoundPlayed = false; // To avoid playing sound multiple times
    
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
      sprite: null,
      punchSprite: null,
      powerupTimer: 0,
      invulnerable: false,
      invulnerableTimer: 0
    };
    
    // Background images
    this.backgroundImages = {
      bg1: null,
      bg2: null,
      currentBg: 0
    };
    
    // Option to process images (can be disabled if problematic)
    this.processImages = false; // Disabled as PNG images already have transparent background
    
    // Debug mode to test all memecoins
    this.debugMode = false; // Set to false for normal game
    this.trumpSpawnCounter = 0; // Counter to force Trump in debug
    this.forceNextTrump = false; // Force next spawn to be Trump
    this.globalSpawnCounter = 0; // Global counter to force Trump occasionally
    
    // Audio files
    this.audioFiles = {
      coup: null,
      bonus: null,
      trump: null,
      ambiance: null,
      rot: null // Nouveau son pour les bonus multiples
    };
    
    // Game objects
    this.memecoins = [];
    this.powerups = [];
    this.particles = [];
    this.animations = [];
    
    // Input handling
    this.keys = {};
    this.lastTime = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Mobile optimization
    this.touchStartTime = 0;
    this.lastTouchX = 0;
    this.lastTouchY = 0;
    this.touchSensitivity = 1.2; // Increased sensitivity for mobile
    
    // Performance optimization
    this.frameSkip = 0;
    this.maxFrameSkip = this.isMobile ? 2 : 0; // Skip frames on mobile if needed
    this.renderQuality = this.isMobile ? 'low' : 'high';
    this.particleLimit = this.isMobile ? 50 : 100; // Limit particles on mobile
    this.lastFrameTime = 0;
    this.targetFPS = this.isMobile ? 30 : 60; // Lower FPS target on mobile
    this.frameInterval = 1000 / this.targetFPS;
    
    // Game settings
    this.baseSpawnRate = 60;
    this.spawnRate = 60;
    this.spawnTimer = 0;
    this.powerupSpawnRate = 800; // Reduced from 300 to 800 (almost 3x fewer bonuses)
    this.powerupSpawnTimer = 0;
    
    // Memecoin types with different properties and images
    this.memecoinTypes = {
      // Common memecoins (high spawn rate)
      doge: { color: '#ffaa00', points: 10, speed: 1, size: 40, image: 'memecoins/binance-peg-dogecoin.png', rarity: 'common' },
      pepe: { color: '#00ff00', points: 15, speed: 1.2, size: 35, image: 'memecoins/pepe.jpg', rarity: 'common' },
      shiba: { color: '#ff6600', points: 20, speed: 1.5, size: 45, image: 'memecoins/shiba-inu.png', rarity: 'common' },
      bonk: { color: '#ff8800', points: 18, speed: 1.3, size: 38, image: 'memecoins/bonk.jpg', rarity: 'common' },
      floki: { color: '#ffcc00', points: 22, speed: 1.4, size: 42, image: 'memecoins/floki.png', rarity: 'common' },
      
      // Uncommon memecoins (medium spawn rate)
      akita: { color: '#ff00ff', points: 25, speed: 1.8, size: 30, image: 'memecoins/akita-inu.png', rarity: 'uncommon' },
      babydoge: { color: '#00ffff', points: 30, speed: 2, size: 25, image: 'memecoins/baby-doge-coin.jpg', rarity: 'uncommon' },
      dogelon: { color: '#ff4444', points: 35, speed: 2.2, size: 28, image: 'memecoins/dogelon-mars.jpg', rarity: 'uncommon' },
      bingus: { color: '#ff6699', points: 32, speed: 2.1, size: 33, image: 'memecoins/bingus-the-cat.jpg', rarity: 'uncommon' },
      vibing: { color: '#9966ff', points: 28, speed: 1.9, size: 36, image: 'memecoins/vibing-cat.jpg', rarity: 'uncommon' },
      bigdog: { color: '#ff9933', points: 38, speed: 2.3, size: 34, image: 'memecoins/big-dog-fink.png', rarity: 'uncommon' },
      
      // Rare memecoins (low spawn rate)
      hoge: { color: '#44ff44', points: 40, speed: 2.5, size: 32, image: 'memecoins/hoge-finance.jpg', rarity: 'rare' },
      catecoin: { color: '#4444ff', points: 45, speed: 2.8, size: 35, image: 'memecoins/catecoin.png', rarity: 'rare' },
      samoyed: { color: '#ff44ff', points: 50, speed: 3, size: 38, image: 'memecoins/samoyedcoin.png', rarity: 'rare' },
      wojak: { color: '#cccccc', points: 55, speed: 3.2, size: 40, image: 'memecoins/wojak.png', rarity: 'rare' },
      bink: { color: '#00ccff', points: 48, speed: 2.9, size: 37, image: 'memecoins/bink-ai.png', rarity: 'rare' },
      robin: { color: '#cc6600', points: 60, speed: 3.5, size: 39, image: 'memecoins/robin-rug.png', rarity: 'rare' },
      
      // Legendary (special bonus - spawns rarely)
      trump: { color: '#ff6600', points: 500, speed: 4, size: 50, image: 'memecoins/trump.jpg', rarity: 'legendary', special: true }
    };
    
    // Images des memecoins
    this.memecoinImages = {};
    
    // Sound effects (using Web Audio API)
    this.audioContext = null;
    this.sounds = {};
    
    // High scores
    this.highScores = this.loadHighScores();
    
    // Initialize
    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.loadAssets();
    this.resetPlayerPosition();
    this.initAudio();
    
    // Show start screen
    setTimeout(() => {
      const gameStart = document.getElementById('gameStart');
      if (gameStart) {
        gameStart.style.display = 'block';
      }
    }, 1000);
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      // Create separate gain nodes for music and sound effects
      this.musicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      
      // Connect to destination
      this.musicGain.connect(this.audioContext.destination);
      this.sfxGain.connect(this.audioContext.destination);
      
      // Set initial volumes
      this.musicGain.gain.setValueAtTime(0.3, this.audioContext.currentTime); // Music quieter
      this.sfxGain.gain.setValueAtTime(0.15, this.audioContext.currentTime); // SFX moderate
    } catch (e) {
      console.log('Web Audio API not supported');
    }
  }

  playSound(frequency, duration, type = 'sine') {
    if (!this.audioContext || !this.sfxGain) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Connect through SFX gain node to avoid interfering with music
    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    // Lower volume for sound effects to not overpower music
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  resizeCanvas() {
    // Mobile optimization: Use device pixel ratio for crisp rendering
    const dpr = this.isMobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio || 1;
    
    // Desktop fullscreen vs mobile with header
    const canvasWidth = window.innerWidth;
    const canvasHeight = this.isMobile ? (window.innerHeight - 80) : window.innerHeight;
    
    this.canvas.width = canvasWidth * dpr;
    this.canvas.height = canvasHeight * dpr;
    
    this.canvas.style.width = canvasWidth + 'px';
    this.canvas.style.height = canvasHeight + 'px';
    
    this.ctx.scale(dpr, dpr);
    
    // Store logical dimensions for game calculations
    this.logicalWidth = canvasWidth;
    this.logicalHeight = canvasHeight;
    
    this.resetPlayerPosition();
  }

  resetPlayerPosition() {
    const width = this.logicalWidth || this.canvas.width;
    const height = this.logicalHeight || this.canvas.height;
    this.player.x = width / 2 - this.player.width / 2;
    this.player.y = height - this.player.height - 20;
  }

  setupEventListeners() {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.punch();
      }
      if (e.code === 'KeyP') {
        this.togglePause();
      }
      // Raccourci de debug pour tester tous les memecoins (Touche T)
      if (e.code === 'KeyT' && this.debugMode) {
        console.log('🧪 Test: Spawning tous les types de memecoins...');
        this.spawnAllMemecoinTypes();
      }
      // Shortcut to spawn Trump immediately (R key)
      if (e.code === 'KeyR' && this.debugMode) {
        console.log('🚨 Test: Spawning Trump coin!');
        this.forceNextTrump = true;
        this.spawnMemecoin(); // Utilise la logique normale mais force Trump
      }
      // Raccourci pour forcer le traitement transparent (Touche B pour Background)
      if (e.code === 'KeyB') {
        console.log('🔧 Force processing transparent background...');
        this.forceProcessPlayerSprite();
        this.forceProcessPunchSprite();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse input
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
        this.player.x = this.mouseX - this.player.width / 2;
        this.player.y = this.mouseY - this.player.height / 2;
        this.constrainPlayer();
      }
    });

    // Optimized touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.gameRunning && e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = (touch.clientX - rect.left) * this.touchSensitivity;
        const touchY = (touch.clientY - rect.top) * this.touchSensitivity;
        
        this.lastTouchX = touchX;
        this.lastTouchY = touchY;
        this.touchStartTime = Date.now();
        
        // Immediate response for better mobile experience
        this.player.x = touchX - this.player.width / 2;
        this.player.y = touchY - this.player.height / 2;
        this.constrainPlayer();
        this.punch();
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.gameRunning && e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = (touch.clientX - rect.left) * this.touchSensitivity;
        const touchY = (touch.clientY - rect.top) * this.touchSensitivity;
        
        // Smooth movement with interpolation for better performance
        const deltaX = touchX - this.lastTouchX;
        const deltaY = touchY - this.lastTouchY;
        
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) { // Only update if significant movement
          this.player.x = touchX - this.player.width / 2;
          this.player.y = touchY - this.player.height / 2;
          this.constrainPlayer();
          
          this.lastTouchX = touchX;
          this.lastTouchY = touchY;
        }
      }
    });
    
    // Touch end for additional punch on tap
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this.gameRunning) {
        const touchDuration = Date.now() - this.touchStartTime;
        // Quick tap = additional punch
        if (touchDuration < 200) {
          this.punch();
        }
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  loadAssets() {
    this.loadImages();
    this.loadAudio();
  }

  loadImages() {
    const memecoinCount = Object.keys(this.memecoinTypes).length;
    let loadedImages = 0;
    const totalImages = 5 + memecoinCount; // 5 images de base + images des memecoins (ajout bonus.png)
    
    const onImageLoad = () => {
      loadedImages++;
      if (loadedImages === totalImages) {
        console.log('All images loaded successfully!');
        // Traiter les images du personnage pour enlever le fond noir
        if (this.processImages) {
          this.processPlayerImages();
        }
      }
    };
    
    // Charger l'image du personnage normal
    this.player.sprite = new Image();
    this.player.sprite.onload = () => {
      console.log('✅ persofix.jpeg loaded successfully!', this.player.sprite.naturalWidth, 'x', this.player.sprite.naturalHeight);
      // Traitement immédiat après chargement
      setTimeout(() => {
        this.forceProcessPlayerSprite();
      }, 100);
      onImageLoad();
    };
    this.player.sprite.onerror = () => {
      console.error('❌ Erreur lors du chargement de persofix.jpeg');
      this.createFallbackSprite();
      onImageLoad();
    };
    this.player.sprite.src = 'persofix.png'; // Changé en PNG pour la transparence
    
    // Timeout fallback pour le sprite normal
    setTimeout(() => {
      if (!this.player.sprite.complete || this.player.sprite.naturalWidth === 0) {
        console.log('Player sprite timeout, creating fallback');
        this.createFallbackSprite();
      }
    }, 3000);
    
    // Charger l'image du personnage qui frappe
    this.player.punchSprite = new Image();
    this.player.punchSprite.onload = () => {
      console.log('✅ persopoing.jpeg loaded successfully!', this.player.punchSprite.naturalWidth, 'x', this.player.punchSprite.naturalHeight);
      // Traitement immédiat après chargement
      setTimeout(() => {
        this.forceProcessPunchSprite();
      }, 100);
      onImageLoad();
    };
    this.player.punchSprite.onerror = () => {
      console.error('❌ Erreur lors du chargement de persopoing.jpeg');
      this.createFallbackPunchSprite();
      onImageLoad();
    };
    this.player.punchSprite.src = 'persopoing.png'; // Changé en PNG pour la transparence
    
    // Timeout fallback pour le sprite de frappe
    setTimeout(() => {
      if (!this.player.punchSprite.complete || this.player.punchSprite.naturalWidth === 0) {
        console.log('Player punch sprite timeout, creating fallback');
        this.createFallbackPunchSprite();
      }
    }, 3000);
    
    // Charger les images de fond
    this.backgroundImages.bg1 = new Image();
    this.backgroundImages.bg1.onload = onImageLoad;
    this.backgroundImages.bg1.onerror = () => {
      console.error('Erreur lors du chargement de fondjeu1.jpeg');
      onImageLoad();
    };
    this.backgroundImages.bg1.src = 'fondjeu1.jpeg';
    
    this.backgroundImages.bg2 = new Image();
    this.backgroundImages.bg2.onload = onImageLoad;
    this.backgroundImages.bg2.onerror = () => {
      console.error('Erreur lors du chargement de fondjeu2.jpeg');
      onImageLoad();
    };
    this.backgroundImages.bg2.src = 'fondjeu2.jpeg';
    
    // Charger l'image bonus
    this.bonusImage = new Image();
    this.bonusImage.onload = () => {
      console.log('Bonus image loaded successfully', this.bonusImage.width, 'x', this.bonusImage.height);
      onImageLoad();
    };
    this.bonusImage.onerror = () => {
      console.error('Failed to load bonus image, creating fallback');
      this.createBonusSprite();
      onImageLoad();
    };
    this.bonusImage.src = 'bonus.png';
    
    // Charger les images des memecoins
    this.loadMemecoinImages(onImageLoad);
  }
  
  loadMemecoinImages(onImageLoad) {
    console.log('🔄 Loading memecoin images...');
    console.log('📋 Types to load:', Object.keys(this.memecoinTypes));
    
    this.totalAssets += Object.keys(this.memecoinTypes).length;
    
    Object.entries(this.memecoinTypes).forEach(([key, memecoin]) => {
      const img = new Image();
      console.log(`🔄 Loading: ${key} -> ${memecoin.image}`);
      
      img.onload = () => {
        console.log(`✅ Image ${key} loaded: ${memecoin.image} (${img.naturalWidth}x${img.naturalHeight})`);
        if (key === 'trump') {
          console.log('🚨 TRUMP IMAGE LOADED SUCCESSFULLY! 🚨');
        }
        this.loadedAssets++;
        this.updateLoadingProgress();
        onImageLoad();
      };
      img.onerror = () => {
        console.error(`Erreur lors du chargement de ${memecoin.image}`);
        // Créer une image de fallback
        this.createFallbackMemecoinImage(key, memecoin);
        onImageLoad();
      };
      img.src = memecoin.image;
      this.memecoinImages[key] = img;
    });
  }
  
  createFallbackMemecoinImage(key, memecoin) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = memecoin.size;
    canvas.height = memecoin.size;
    
    // Créer un cercle coloré comme fallback
    ctx.fillStyle = memecoin.color;
    ctx.beginPath();
    ctx.arc(memecoin.size / 2, memecoin.size / 2, memecoin.size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Ajouter le nom du memecoin
    ctx.fillStyle = 'white';
    ctx.font = `${Math.floor(memecoin.size / 4)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(key.toUpperCase(), memecoin.size / 2, memecoin.size / 2);
    
    this.memecoinImages[key] = canvas;
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
  
  processPlayerImages() {
    try {
      console.log('🔄 Processing player images to remove black background...');
      
      // Traiter l'image normale
      if (this.player.sprite && this.player.sprite.complete) {
        console.log('Processing normal sprite...');
        const originalSprite = this.player.sprite;
        this.player.sprite = this.removeBlackBackground(this.player.sprite);
        console.log('✅ Normal sprite processed');
        
        // Vérifier si le traitement a fonctionné
        if (this.player.sprite === originalSprite) {
          console.log('⚠️ Normal sprite unchanged, trying alternative method');
          this.player.sprite = this.removeBlackBackgroundAlternative(originalSprite);
        }
      }
      
      // Traiter l'image de frappe
      if (this.player.punchSprite && this.player.punchSprite.complete) {
        console.log('Processing punch sprite...');
        const originalPunchSprite = this.player.punchSprite;
        this.player.punchSprite = this.removeBlackBackground(this.player.punchSprite);
        console.log('✅ Punch sprite processed');
        
        // Vérifier si le traitement a fonctionné
        if (this.player.punchSprite === originalPunchSprite) {
          console.log('⚠️ Punch sprite unchanged, trying alternative method');
          this.player.punchSprite = this.removeBlackBackgroundAlternative(originalPunchSprite);
        }
      }
    } catch (error) {
      console.log('❌ Impossible de traiter les images (CORS ou autre), utilisation directe:', error);
      // En cas d'erreur, on garde les images originales
    }
  }
  
  removeBlackBackground(image) {
    try {
      console.log('🎨 Removing black background from image:', image.naturalWidth, 'x', image.naturalHeight);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      
      // Dessiner l'image sur le canvas
      ctx.drawImage(image, 0, 0);
      
      // Obtenir les données de pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Parcourir tous les pixels
      let transparentPixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Détecter les pixels noirs et très sombres (fond noir)
        // Conditions plus larges pour capturer tout le fond noir
        if (r < 50 && g < 50 && b < 50 && (r + g + b) < 100) {
          data[i + 3] = 0; // Alpha = 0 (transparent)
          transparentPixels++;
        }
      }
      
      console.log('✨ Made', transparentPixels, 'pixels transparent out of', data.length / 4, 'total pixels');
      
      // Remettre les données modifiées
      ctx.putImageData(imageData, 0, 0);
      
      return canvas;
    } catch (error) {
      console.log('❌ Erreur lors du traitement de l\'image:', error);
      // Essayer une méthode alternative
      return this.removeBlackBackgroundAlternative(image);
    }
  }

  removeBlackBackgroundAlternative(image) {
    try {
      console.log('🔄 Trying alternative black background removal...');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      
      // Dessiner l'image sur le canvas
      ctx.drawImage(image, 0, 0);
      
      // Obtenir les données de pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Méthode plus agressive : rendre transparent tout ce qui est très sombre
      let transparentPixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Conditions encore plus larges pour capturer le fond noir
        if ((r + g + b) < 150) { // Somme des couleurs < 150 = très sombre
          data[i + 3] = 0; // Alpha = 0 (transparent)
          transparentPixels++;
        }
      }
      
      console.log('✨ Alternative method: Made', transparentPixels, 'pixels transparent');
      
      // Remettre les données modifiées
      ctx.putImageData(imageData, 0, 0);
      
      return canvas;
    } catch (error) {
      console.log('❌ Alternative method also failed:', error);
      return image; // Retourner l'image originale en cas d'erreur
    }
  }

  forceProcessPlayerSprite() {
    console.log('🔧 Force processing player sprite...');
    if (this.player.sprite && this.player.sprite.complete) {
      try {
        this.player.sprite = this.createTransparentVersion(this.player.sprite);
        console.log('✅ Player sprite force processed');
      } catch (error) {
        console.log('❌ Force processing failed:', error);
      }
    }
  }

  forceProcessPunchSprite() {
    console.log('🔧 Force processing punch sprite...');
    if (this.player.punchSprite && this.player.punchSprite.complete) {
      try {
        this.player.punchSprite = this.createTransparentVersion(this.player.punchSprite);
        console.log('✅ Punch sprite force processed');
      } catch (error) {
        console.log('❌ Force processing failed:', error);
      }
    }
  }

  createTransparentVersion(image) {
    console.log('🎨 Creating transparent version of image...');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    
    // Dessiner l'image
    ctx.drawImage(image, 0, 0);
    
    try {
      // Obtenir les données de pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let transparentCount = 0;
      
      // Traitement pixel par pixel - version très agressive
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        // Si le pixel est sombre (fond noir/gris foncé)
        if (brightness < 80) {
          data[i + 3] = 0; // Rendre transparent
          transparentCount++;
        }
      }
      
      console.log(`✨ Made ${transparentCount} pixels transparent (${((transparentCount / (data.length / 4)) * 100).toFixed(1)}%)`);
      
      // Remettre les données
      ctx.putImageData(imageData, 0, 0);
      
      return canvas;
    } catch (error) {
      console.log('❌ Pixel processing failed, using original:', error);
      return image;
    }
  }
  
  loadAudio() {
    this.totalAssets += 5; // 5 fichiers audio (ajout de rot.mp3)
    
    // Charger le son de coup
    this.audioFiles.coup = new Audio();
    this.audioFiles.coup.src = 'coup.mp3';
    this.audioFiles.coup.preload = 'auto';
    this.audioFiles.coup.volume = 0.5; // Reduced volume
    this.audioFiles.coup.oncanplaythrough = () => {
      this.loadedAssets++;
      this.updateLoadingProgress();
    };
    this.audioFiles.coup.onerror = () => {
      console.log('Unable to load coup.mp3');
      this.loadedAssets++;
      this.updateLoadingProgress();
    };
    
    // Charger le son de bonus
    this.audioFiles.bonus = new Audio();
    this.audioFiles.bonus.src = 'bonus.mp3';
    this.audioFiles.bonus.preload = 'auto';
    this.audioFiles.bonus.volume = 0.6; // Reduced volume
    this.audioFiles.bonus.onerror = () => {
      console.log('Impossible de charger bonus.mp3');
    };
    
    // Charger le son de Trump
    this.audioFiles.trump = new Audio();
    this.audioFiles.trump.src = 'sontrump.mp3';
    this.audioFiles.trump.preload = 'auto';
    this.audioFiles.trump.volume = 0.7; // Reduced volume
    this.audioFiles.trump.onerror = () => {
      console.log('Impossible de charger sontrump.mp3');
    };
    
    // Charger la musique d'ambiance
    this.audioFiles.ambiance = new Audio();
    this.audioFiles.ambiance.src = 'ambiance.mp3';
    this.audioFiles.ambiance.preload = 'auto';
    this.audioFiles.ambiance.volume = 0.3; // Volume plus faible pour l'ambiance
    this.audioFiles.ambiance.loop = true; // Boucle infinie
    this.audioFiles.ambiance.onerror = () => {
      console.log('Impossible de charger ambiance.mp3');
    };
    
    // Charger le son rot (pour les bonus multiples)
    this.audioFiles.rot = new Audio();
    this.audioFiles.rot.src = 'rot.mp3';
    this.audioFiles.rot.preload = 'auto';
    this.audioFiles.rot.volume = 0.6; // Reduced volume
    this.audioFiles.rot.oncanplaythrough = () => {
      this.loadedAssets++;
      this.updateLoadingProgress();
    };
    this.audioFiles.rot.onerror = () => {
      console.log('Impossible de charger rot.mp3');
      this.loadedAssets++;
      this.updateLoadingProgress();
    };
  }
  
  playAudioFile(audioName) {
    try {
      const originalAudio = this.audioFiles[audioName];
      if (!originalAudio || originalAudio.readyState < 2) return;
      
      // For background music, use the original instance
      if (audioName === 'ambiance') {
        originalAudio.volume = 0.25; // Keep background music quiet
        const playPromise = originalAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.log(`Error playing ${audioName}:`, e);
          });
        }
        return;
      }
      
      // For sound effects, create a new instance to avoid interrupting music
      const audio = originalAudio.cloneNode();
      audio.volume = audioName === 'trump' ? 0.5 : 0.4; // Lower SFX volumes
      audio.currentTime = 0;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log(`Error playing ${audioName}:`, e);
        });
      }
      
      // Clean up after playing
      audio.addEventListener('ended', () => {
        audio.remove();
      });
      
    } catch (error) {
      console.log(`Audio error ${audioName}:`, error);
    }
  }
  
  startBackgroundMusic() {
    this.playAudioFile('ambiance');
  }
  
  stopBackgroundMusic() {
    try {
      if (this.audioFiles.ambiance) {
        this.audioFiles.ambiance.pause();
        this.audioFiles.ambiance.currentTime = 0;
      }
    } catch (e) {
      console.log('Error stopping music:', e.message);
    }
  }
  
  updateLoadingProgress() {
    this.loadingProgress = (this.loadedAssets / this.totalAssets) * 100;
    if (this.loadedAssets >= this.totalAssets) {
      this.isLoading = false;
      console.log('✅ All assets loaded!');
    }
  }
  
  createFallbackSprite() {
    // Créer un sprite de secours si l'image ne charge pas
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    
    // Dessiner le personnage LFIST de base
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(20, 15, 40, 50);
    ctx.fillStyle = '#ffcc88';
    ctx.fillRect(25, 5, 30, 25);
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(10, 25, 15, 15);
    ctx.fillRect(55, 25, 15, 15);
    ctx.fillStyle = '#333';
    ctx.fillRect(30, 10, 5, 5);
    ctx.fillRect(45, 10, 5, 5);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(35, 18, 10, 3);
    ctx.fillStyle = '#0066cc';
    ctx.fillRect(25, 60, 12, 15);
    ctx.fillRect(43, 60, 12, 15);
    
    this.player.sprite = canvas;
  }
  
  createFallbackPunchSprite() {
    // Créer un sprite de frappe de secours
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    
    // Dessiner le personnage en position de frappe
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(20, 15, 40, 50);
    ctx.fillStyle = '#ffcc88';
    ctx.fillRect(25, 5, 30, 25);
    // Poings plus grands pour l'effet de frappe
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(5, 20, 20, 20);
    ctx.fillRect(55, 20, 20, 20);
    ctx.fillStyle = '#333';
    ctx.fillRect(30, 10, 5, 5);
    ctx.fillRect(45, 10, 5, 5);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(35, 18, 10, 3);
    ctx.fillStyle = '#0066cc';
    ctx.fillRect(25, 60, 12, 15);
    ctx.fillRect(43, 60, 12, 15);
    
    this.player.punchSprite = canvas;
  }

  constrainPlayer() {
    this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
    this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
  }

  handleInput() {
    if (!this.gameRunning || this.gamePaused) return;

    // Keyboard movement (pour ceux qui préfèrent le clavier)
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
    this.player.punchTimer = 15; // Durée réduite pour une animation plus fluide
    
    // Play punch sound
    this.playAudioFile('coup');
    
    // Fallback sound effect
    this.playSound(200, 0.1, 'square');
    
    // Check for hits
    this.checkPunchHits();
    
    // Create punch effect
    this.createPunchEffect();
  }

  checkPunchHits() {
    const punchX = this.player.x + this.player.width / 2;
    const punchY = this.player.y + this.player.height / 2;
    
    let hitCount = 0;
    
    // Check memecoins
    for (let i = this.memecoins.length - 1; i >= 0; i--) {
      const memecoin = this.memecoins[i];
      const distance = Math.sqrt(
        Math.pow(memecoin.x + memecoin.width / 2 - punchX, 2) +
        Math.pow(memecoin.y + memecoin.height / 2 - punchY, 2)
      );
      
      if (distance < this.player.punchRadius) {
        this.destroyMemecoin(i);
        hitCount++;
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
    
    // Bonus pour hits multiples
    if (hitCount > 1) {
      this.combo += hitCount - 1;
      this.score += hitCount * 5;
    }
  }

  createPunchEffect() {
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    
    // Create punch particles
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 80,
        y: centerY + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 30,
        maxLife: 30,
        color: '#ffaa00',
        size: Math.random() * 6 + 2,
        type: 'punch'
      });
    }
  }

  destroyMemecoin(index) {
    const memecoin = this.memecoins[index];
    const memecoinType = this.memecoinTypes[memecoin.type];
    
    // Gestion spéciale pour Trump
    if (memecoin.type === 'trump') {
      this.destroyTrumpCoin(memecoin, memecoinType);
    } else {
      // Add score with combo multiplier
      const baseScore = memecoinType.points;
      const comboMultiplier = Math.floor(this.combo / 5) + 1;
      const levelMultiplier = 1 + (this.level - 1) * 0.1;
      const points = Math.floor(baseScore * comboMultiplier * levelMultiplier);
      
      this.score += points;
      this.combo++;
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
      
      // Sound effect
      this.playSound(300 + memecoin.type.length * 50, 0.15, 'sawtooth');
    }
    
    // Create destruction particles
    this.createDestructionEffect(
      memecoin.x + memecoin.width / 2, 
      memecoin.y + memecoin.height / 2,
      memecoinType.color
    );
    
    // Remove memecoin
    this.memecoins.splice(index, 1);
    
    // Check level completion
    if (this.destroyed >= this.levelTarget) {
      this.completeLevel();
    }
    
    this.updateUI();
  }
  
  destroyTrumpCoin(memecoin, memecoinType) {
    // MEGA BONUS pour Trump !
    const baseScore = memecoinType.points; // 500 points de base
    const comboMultiplier = Math.floor(this.combo / 5) + 1;
    const levelMultiplier = 1 + (this.level - 1) * 0.2; // Bonus plus élevé par niveau
    const trumpBonus = 2; // Bonus x2 supplémentaire pour Trump
    const points = Math.floor(baseScore * comboMultiplier * levelMultiplier * trumpBonus);
    
    this.score += points;
    this.combo += 10; // Gros bonus de combo
    this.destroyed += 3; // Compte comme 3 destructions
    this.totalDestroyed += 3;
    
    // Update max combo
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    
    // Toujours montrer le combo pour Trump
    this.showCombo();
    
    // Créer l'effet spécial de destruction de Trump
    this.createTrumpDestructionEffect(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
    
    // Son spécial pour la destruction de Trump
    this.playTrumpDestroySound();
    
    // Afficher le bonus spécial
    this.showTrumpBonus(points);
    
    console.log(`🎯 TRUMP DESTROYED! +${points} points! Combo: ${this.combo}`);
  }
  
  createTrumpDestructionEffect(x, y) {
    // Explosion dorée spectaculaire pour Trump
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
        life: 80,
        maxLife: 80,
        color: i % 3 === 0 ? '#ffaa00' : (i % 3 === 1 ? '#ff6600' : '#fff'),
        size: Math.random() * 8 + 4,
        type: 'trump_explosion'
      });
    }
    
    // Étoiles dorées
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        life: 100,
        maxLife: 100,
        color: '#ffaa00',
        size: Math.random() * 6 + 3,
        type: 'trump_star'
      });
    }
  }
  
  playTrumpDestroySound() {
    // Jouer le son Trump spécial en priorité
    this.playAudioFile('trump');
    
    // Séquence de sons de fallback si le fichier audio ne marche pas
    setTimeout(() => {
      this.playSound(800, 0.4, 'square');
      setTimeout(() => this.playSound(1000, 0.3, 'sine'), 100);
      setTimeout(() => this.playSound(1200, 0.2, 'triangle'), 200);
      setTimeout(() => this.playSound(600, 0.3, 'sawtooth'), 300);
    }, 100);
  }
  
  showTrumpBonus(points) {
    // Affichage spécial du bonus Trump
    const bonusDisplay = document.createElement('div');
    bonusDisplay.style.cssText = `
      position: fixed;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #ff6600, #ffaa00, #fff);
      color: #000;
      padding: 15px 30px;
      border-radius: 20px;
      font-size: 28px;
      font-weight: bold;
      text-align: center;
      z-index: 9999;
      box-shadow: 0 0 40px rgba(255, 170, 0, 0.9);
      border: 4px solid #fff;
      animation: trumpBonus 4s ease-out forwards;
    `;
    bonusDisplay.innerHTML = `🎯 TRUMP HIT! 🎯<br><span style="font-size: 32px; color: #ff6600;">+${points} POINTS!</span>`;
    
    // Ajouter l'animation CSS si elle n'existe pas
    if (!document.getElementById('trumpBonusCss')) {
      const style = document.createElement('style');
      style.id = 'trumpBonusCss';
      style.textContent = `
        @keyframes trumpBonus {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3) rotate(-10deg); }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1.3) rotate(5deg); }
          30% { transform: translate(-50%, -50%) scale(1.1) rotate(-2deg); }
          45% { transform: translate(-50%, -50%) scale(1.2) rotate(1deg); }
          60% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          85% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) rotate(0deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(bonusDisplay);
    
    // Supprimer l'affichage après l'animation
    setTimeout(() => {
      if (bonusDisplay.parentNode) {
        bonusDisplay.parentNode.removeChild(bonusDisplay);
      }
    }, 4000);
  }

  collectPowerup(index) {
    const powerup = this.powerups[index];
    
    // Add bonus points
    const bonusPoints = 50 + this.level * 10;
    this.score += bonusPoints;
    this.combo += 3;
    
    // Incrémenter le compteur de bonus collectés
    this.bonusCollected++;
    console.log(`🍺 Bonus collected #${this.bonusCollected}`);
    
    // Jouer le son rot.mp3 après 10-15 bonus (aléatoire pour la surprise)
    if (this.bonusCollected >= 10 && !this.rotSoundPlayed) {
      const rotTrigger = 10 + Math.floor(Math.random() * 6); // Entre 10 et 15
      if (this.bonusCollected >= rotTrigger) {
        console.log('🎵 Triggering rot.mp3 sound!');
        this.playAudioFile('rot');
        this.rotSoundPlayed = true;
        
        // Réinitialiser pour rejouer plus tard (tous les 20-25 bonus)
        setTimeout(() => {
          this.rotSoundPlayed = false;
          this.bonusCollected = 0; // Reset le compteur
        }, 2000);
      }
    }
    
    // Apply powerup effect
    this.applyPowerup(powerup.type);
    
    // Play bonus sound
    this.playAudioFile('bonus');
    
    // Fallback sound effect
    this.playSound(500, 0.3, 'sine');
    
    // Create collection effect
    this.createCollectionEffect(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
    
    // Show notification
    this.showPowerupNotification(powerup.type);
    
    // Remove powerup
    this.powerups.splice(index, 1);
    
    this.updateUI();
  }

  applyPowerup(type) {
    switch (type) {
      case 'fist':
        // Increase punch radius
        this.player.punchRadius = 150;
        this.player.powerupTimer = 300; // 5 seconds at 60fps
        break;
      case 'shield':
        // Temporary invulnerability
        this.player.invulnerable = true;
        this.player.invulnerableTimer = 180; // 3 seconds
        break;
      case 'speed':
        // Increase movement speed
        this.player.speed = 12;
        this.player.powerupTimer = 240; // 4 seconds
        break;
      case 'multi':
        // Multi-hit effect (handled in punch logic)
        this.player.powerupTimer = 180;
        break;
    }
  }

  showPowerupNotification(type) {
    const notifications = {
      fist: 'BEER BREAK!',
      shield: 'BEER BREAK!',
      speed: 'BEER BREAK!',
      multi: 'BEER BREAK!'
    };
    
    const notification = document.getElementById('powerupNotification');
    if (notification) {
      notification.textContent = notifications[type] || 'POWER-UP ACTIVATED!';
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 2000);
    }
  }

  createDestructionEffect(x, y, color) {
    // Reduce particles on mobile for better performance
    const particleCount = this.isMobile ? 8 : 20;
    const lifespan = this.isMobile ? 30 : 50;
    
    for (let i = 0; i < particleCount && this.particles.length < this.particleLimit; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        life: lifespan,
        maxLife: lifespan,
        color: color,
        size: Math.random() * 5 + 2,
        type: 'destruction'
      });
    }
  }

  createCollectionEffect(x, y) {
    // Reduce particles on mobile for better performance
    const particleCount = this.isMobile ? 10 : 25;
    const lifespan = this.isMobile ? 40 : 60;
    
    for (let i = 0; i < particleCount && this.particles.length < this.particleLimit; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: lifespan,
        maxLife: lifespan,
        color: '#ffaa00',
        size: Math.random() * 8 + 3,
        type: 'collection'
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
    let type;
    let memecoinType;
    
    // Chance spéciale pour Trump (memecoin légendaire)
    let trumpChance = this.debugMode ? 0.1 : (this.level >= 2 ? 0.03 + (this.level * 0.003) : 0.015); // En debug: 10%, sinon: 1.5% dès le niveau 1, 3% + 0.3% par niveau après le niveau 2
    
    // Compteur global pour garantir que Trump apparaît de temps en temps
    this.globalSpawnCounter++;
    
    // En mode debug, forcer Trump tous les 5 spawns ou si forcé
    if (this.debugMode) {
      this.trumpSpawnCounter++;
      if (this.trumpSpawnCounter >= 5 || this.forceNextTrump) {
        trumpChance = 1; // Force Trump
        this.trumpSpawnCounter = 0;
        this.forceNextTrump = false;
      }
    } else {
      // En mode normal, forcer Trump tous les 100-150 spawns pour garantir qu'il apparaisse
      const forceInterval = 100 + Math.floor(Math.random() * 50); // Entre 100 et 150 spawns
      if (this.globalSpawnCounter >= forceInterval) {
        trumpChance = 1; // Force Trump
        this.globalSpawnCounter = 0;
        console.log('🚨 TRUMP FORCED after', forceInterval, 'spawns! 🚨');
      }
    }
    
    if (Math.random() < trumpChance || this.forceNextTrump) {
      // Spawn Trump (rare et spécial)
      type = 'trump';
      memecoinType = this.memecoinTypes[type];
      console.log('🚨 TRUMP COIN SPOTTED! 🚨', `Chance: ${(trumpChance * 100).toFixed(1)}%`);
      
      // Créer un effet d'annonce spécial
      this.createTrumpAnnouncement();
    } else {
      // Spawn normal des autres memecoins avec système de rareté
      const types = Object.keys(this.memecoinTypes).filter(t => t !== 'trump'); // Exclure Trump du spawn normal
      
      // Système de probabilité basé sur la rareté et le niveau
      let selectedType;
      const rand = Math.random();
      
      if (this.debugMode) {
        // En mode debug, spawn équitable de tous les types
        selectedType = types[Math.floor(Math.random() * types.length)];
      } else {
        // Système de rareté basé sur les probabilités
        if (rand < 0.6) {
          // 60% chance pour common
          const commonTypes = types.filter(t => this.memecoinTypes[t].rarity === 'common');
          selectedType = commonTypes[Math.floor(Math.random() * commonTypes.length)];
        } else if (rand < 0.85) {
          // 25% chance pour uncommon
          const uncommonTypes = types.filter(t => this.memecoinTypes[t].rarity === 'uncommon');
          selectedType = uncommonTypes[Math.floor(Math.random() * uncommonTypes.length)];
        } else {
          // 15% chance pour rare
          const rareTypes = types.filter(t => this.memecoinTypes[t].rarity === 'rare');
          selectedType = rareTypes[Math.floor(Math.random() * rareTypes.length)];
        }
        
        // Fallback si aucun type trouvé
        if (!selectedType) {
          selectedType = types[Math.floor(Math.random() * types.length)];
        }
      }
      
      type = selectedType;
      memecoinType = this.memecoinTypes[type];
      
      // Debug: afficher les informations de spawn
      if (this.debugMode && Math.random() < 0.1) {
        console.log(`Level ${this.level}: Spawned ${type} (${memecoinType.rarity}) - ${memecoinType.points} points`);
      }
    }
    
    const memecoin = {
      x: Math.random() * (this.canvas.width - memecoinType.size),
      y: -memecoinType.size,
      width: memecoinType.size,
      height: memecoinType.size,
      speed: type === 'trump' ? memecoinType.speed + this.level * 0.5 : (memecoinType.speed + this.level * 0.3 + Math.random() * 1.5),
      type: type,
      rotation: 0,
      rotationSpeed: type === 'trump' ? (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 0.3,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: type === 'trump' ? 0.2 + Math.random() * 0.2 : 0.1 + Math.random() * 0.1,
      isSpecial: type === 'trump'
    };
    
    // Limit objects on mobile for better performance
    const maxObjects = this.isMobile ? 15 : 25;
    if (this.memecoins.length < maxObjects) {
      this.memecoins.push(memecoin);
    }
  }
  
  createTrumpAnnouncement() {
    // Créer un effet visuel d'annonce pour Trump
    const announcement = document.createElement('div');
    announcement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #ff6600, #ffaa00);
      color: white;
      padding: 20px 40px;
      border-radius: 15px;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      z-index: 9999;
      box-shadow: 0 0 30px rgba(255, 102, 0, 0.8);
      border: 3px solid #fff;
      animation: trumpAnnounce 3s ease-out forwards;
    `;
    announcement.innerHTML = '🚨 TRUMP COIN! 🚨<br><span style="font-size: 16px;">500 BONUS POINTS!</span>';
    
    // Ajouter l'animation CSS
    if (!document.getElementById('trumpAnnounceCss')) {
      const style = document.createElement('style');
      style.id = 'trumpAnnounceCss';
      style.textContent = `
        @keyframes trumpAnnounce {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          40% { transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(announcement);
    
    // Supprimer l'annonce après l'animation
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 3000);
    
    // Son spécial pour Trump (plus fort)
    this.playSound(800, 0.5, 'square');
    setTimeout(() => this.playSound(600, 0.3, 'sine'), 200);
  }
  
  // Fonction de test pour spawner tous les types de memecoins
  spawnAllMemecoinTypes() {
    const types = Object.keys(this.memecoinTypes);
    types.forEach((type, index) => {
      setTimeout(() => {
        const memecoinType = this.memecoinTypes[type];
        const memecoin = {
          x: (index * 60) % (this.canvas.width - memecoinType.size),
          y: -memecoinType.size - (Math.floor(index / 10) * 100),
          width: memecoinType.size,
          height: memecoinType.size,
          speed: memecoinType.speed,
          type: type,
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.1 + Math.random() * 0.1
        };
        this.memecoins.push(memecoin);
        console.log(`Spawned ${type} memecoin`);
      }, index * 500); // Délai entre chaque spawn
    });
  }
  
  spawnTrumpCoin() {
    const memecoinType = this.memecoinTypes['trump'];
    const memecoin = {
      x: Math.random() * (this.canvas.width - memecoinType.size),
      y: -memecoinType.size,
      width: memecoinType.size,
      height: memecoinType.size,
      speed: memecoinType.speed + this.level * 0.5,
      type: 'trump',
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.2 + Math.random() * 0.2,
      isSpecial: true
    };
    
    this.memecoins.push(memecoin);
    this.createTrumpAnnouncement();
  }

  spawnPowerup() {
    const types = ['fist', 'shield', 'speed', 'multi'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const powerup = {
      x: Math.random() * (this.canvas.width - 50),
      y: -50,
      width: 50,
      height: 50,
      speed: 2 + Math.random() * 2,
      type: type,
      rotation: 0,
      rotationSpeed: 0.15,
      glow: 0,
      pulse: 0
    };
    
    this.powerups.push(powerup);
  }

  updateMemecoins() {
    for (let i = this.memecoins.length - 1; i >= 0; i--) {
      const memecoin = this.memecoins[i];
      memecoin.y += memecoin.speed;
      memecoin.rotation += memecoin.rotationSpeed;
      memecoin.wobble += memecoin.wobbleSpeed;
      
      // Add wobble movement
      memecoin.x += Math.sin(memecoin.wobble) * 0.5;
      
      // Check if memecoin reached bottom
      if (memecoin.y > this.canvas.height) {
        this.memecoins.splice(i, 1);
        if (!this.player.invulnerable) {
          this.loseLife();
        }
      }
    }
  }

  updatePowerups() {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      powerup.y += powerup.speed;
      powerup.rotation += powerup.rotationSpeed;
      powerup.glow += 0.15;
      powerup.pulse += 0.1;
      
      // Remove if off screen (with buffer for mobile performance)
      const offScreenBuffer = this.isMobile ? 50 : 100;
      if (powerup.y > this.canvas.height + offScreenBuffer) {
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
      
      // Add gravity for destruction particles
      if (particle.type === 'destruction') {
        particle.vy += 0.3;
      }
      
      // Fade particles
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      
      // Remove dead particles or particles off screen (mobile optimization)
      if (particle.life <= 0 || 
          (this.isMobile && (particle.x < -50 || particle.x > this.canvas.width + 50 || 
                            particle.y < -50 || particle.y > this.canvas.height + 50))) {
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
        // Reset powerup effects
        this.player.punchRadius = 100;
        this.player.speed = 8;
      }
    }
    
    // Update invulnerability timer
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer--;
      if (this.player.invulnerableTimer <= 0) {
        this.player.invulnerable = false;
      }
    }
  }

  loseLife() {
    this.lives--;
    this.combo = 0; // Reset combo on life lost
    
    // Sound effect
    this.playSound(150, 0.5, 'sawtooth');
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Flash effect and temporary invulnerability
      this.player.invulnerable = true;
      this.player.invulnerableTimer = 120; // 2 seconds
      this.createLifeLostEffect();
    }
    
    this.updateUI();
  }

  createLifeLostEffect() {
    // Screen flash particles
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: 0,
        vy: 0,
        life: 30,
        maxLife: 30,
        color: '#ff4444',
        size: Math.random() * 10 + 5,
        type: 'flash'
      });
    }
  }

  completeLevel() {
    this.gameRunning = false;
    
    // Calculate level completion time
    const levelTime = Math.floor((Date.now() - this.levelStartTime) / 1000);
    
    // Calculate level bonus
    const timeBonus = Math.max(0, 120 - levelTime) * 20; // Bonus for completing quickly (plus de temps)
    const comboBonus = this.maxCombo * 100;
    const levelBonus = this.level * 2000 + timeBonus + comboBonus; // Bonus plus élevé
    this.score += levelBonus;
    
    // Sound effect
    this.playSound(400, 1, 'sine');
    
    // Show level complete screen
    const elements = {
      'completedLevel': this.level,
      'levelScore': this.score,
      'levelBonus': levelBonus,
      'levelMaxCombo': this.maxCombo,
      'levelTime': levelTime
    };
    
    Object.keys(elements).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = elements[id];
      }
    });
    
    const levelComplete = document.getElementById('levelComplete');
    if (levelComplete) {
      levelComplete.style.display = 'block';
    }
  }

  nextLevel() {
    this.level++;
    this.destroyed = 0;
    this.maxCombo = 0;
    this.levelStartTime = Date.now();
    
    // Increase difficulty
    this.levelTarget = Math.floor(100 + this.level * 15); // Commence à 100, augmente de 15 par niveau
    this.spawnRate = Math.max(15, this.baseSpawnRate - this.level * 2);
    this.powerupSpawnRate = Math.max(400, 800 - this.level * 10); // Bonus encore plus rares
    
    // Le fond reste fixe maintenant
    
    // Clear objects
    this.memecoins = [];
    this.powerups = [];
    this.particles = [];
    
    // Reset player powerups
    this.player.punchRadius = 100;
    this.player.speed = 8;
    this.player.powerupTimer = 0;
    this.player.invulnerable = false;
    this.player.invulnerableTimer = 0;
    
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
    const totalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    
    // Celebration effect
    this.createCelebrationEffect();
    
    // Show completion screen
    const completedScore = document.getElementById('completedScore');
    if (completedScore) completedScore.textContent = this.score;
    
    const completedMaxCombo = document.getElementById('completedMaxCombo');
    if (completedMaxCombo) completedMaxCombo.textContent = this.maxCombo;
    
    const completedTotalDestroyed = document.getElementById('completedTotalDestroyed');
    if (completedTotalDestroyed) completedTotalDestroyed.textContent = this.totalDestroyed;
    
    const totalTimeEl = document.getElementById('totalTime');
    if (totalTimeEl) totalTimeEl.textContent = totalTime;
    
    const gameCompleted = document.getElementById('gameCompleted');
    if (gameCompleted) gameCompleted.style.display = 'block';
    
    // Victory sound
    this.playVictorySound();
  }

  createCelebrationEffect() {
    const celebration = document.getElementById('celebration');
    if (celebration) {
      celebration.innerHTML = '';
      
      for (let i = 0; i < 20; i++) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = Math.random() * 100 + '%';
        firework.style.top = Math.random() * 100 + '%';
        firework.style.animationDelay = Math.random() * 2 + 's';
        celebration.appendChild(firework);
      }
      
      setTimeout(() => {
        celebration.innerHTML = '';
      }, 5000);
    }
  }

  playVictorySound() {
    if (!this.audioContext) return;
    
    const notes = [262, 294, 330, 349, 392, 440, 494, 523]; // C major scale
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playSound(freq, 0.3, 'sine');
      }, index * 200);
    });
  }

  gameOver() {
    this.gameRunning = false;
    
    // Sound effect
    this.playSound(100, 1, 'sawtooth');
    
    // Show game over screen
    const gameOverElements = {
      'finalScore': this.score,
      'finalLevel': this.level,
      'maxCombo': this.maxCombo,
      'totalDestroyed': this.totalDestroyed
    };
    
    Object.keys(gameOverElements).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = gameOverElements[id];
      }
    });
    
    const gameOver = document.getElementById('gameOver');
    if (gameOver) {
      gameOver.style.display = 'block';
    }
  }

  togglePause() {
    if (!this.gameRunning) return;
    
    this.gamePaused = !this.gamePaused;
    if (this.gamePaused) {
      // Show pause overlay
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#00ff88';
      this.ctx.font = '48px "Press Start 2P"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSE', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.font = '16px "Press Start 2P"';
      this.ctx.fillText('Press P to continue', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
  }

  updateUI() {
    const uiElements = {
      'score': this.score.toLocaleString(),
      'level': this.level,
      'lives': this.lives,
      'combo': this.combo,
      'target': this.levelTarget,
      'destroyed': this.destroyed,
      'levelTarget': this.levelTarget,
      'speed': (1 + (this.level - 1) * 0.1).toFixed(1) + 'x'
    };
    
    Object.keys(uiElements).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = uiElements[id];
      }
    });
    
    // Update progress bar
    const progress = (this.destroyed / this.levelTarget) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      progressFill.style.width = progress + '%';
    }
  }

  update(currentTime) {
    if (!this.gameRunning || this.gamePaused) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Handle input
    this.handleInput();
    
    // Update game objects
    this.updatePlayer();
    
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
    
    // Draw invulnerability effect
    if (this.player.invulnerable) {
      this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
    }
    
    // Draw punch effect
    if (this.player.isPunching) {
      this.ctx.strokeStyle = this.player.powerupTimer > 0 ? '#ff00ff' : '#ffaa00';
      this.ctx.lineWidth = 8;
      const originalAlpha = this.ctx.globalAlpha;
      this.ctx.globalAlpha = 0.6;
      this.ctx.beginPath();
      this.ctx.arc(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        this.player.punchRadius,
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
      this.ctx.globalAlpha = originalAlpha;
    }
    
    // Choisir le sprite approprié
    const currentSprite = this.player.isPunching && this.player.punchSprite ? 
                         this.player.punchSprite : this.player.sprite;
    
    // Draw player sprite avec transparence
    if (currentSprite) {
      // Ajouter un léger effet de rebond quand le joueur frappe
      let offsetY = 0;
      if (this.player.isPunching) {
        offsetY = Math.sin(this.player.punchTimer * 0.5) * 3;
      }
      
      // Optimize rendering quality based on device
      this.ctx.imageSmoothingEnabled = this.renderQuality === 'high';
      if (this.ctx.imageSmoothingEnabled) {
        this.ctx.imageSmoothingQuality = this.isMobile ? 'medium' : 'high';
      }
      
      // Calculer les dimensions en préservant les proportions
      const spriteAspectRatio = currentSprite.naturalWidth / currentSprite.naturalHeight;
      const playerAspectRatio = this.player.width / this.player.height;
      
      let drawWidth = this.player.width;
      let drawHeight = this.player.height;
      let drawX = this.player.x;
      let drawY = this.player.y + offsetY;
      
      // Ajuster les dimensions pour préserver les proportions
      if (spriteAspectRatio > playerAspectRatio) {
        // L'image est plus large, ajuster la hauteur
        drawHeight = drawWidth / spriteAspectRatio;
        drawY += (this.player.height - drawHeight) / 2;
      } else {
        // L'image est plus haute, ajuster la largeur
        drawWidth = drawHeight * spriteAspectRatio;
        drawX += (this.player.width - drawWidth) / 2;
      }
      
      this.ctx.drawImage(
        currentSprite,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );
    }
    
    this.ctx.restore();
  }

  drawMemecoin(memecoin) {
    this.ctx.save();
    this.ctx.translate(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
    this.ctx.rotate(memecoin.rotation);
    
    const memecoinType = this.memecoinTypes[memecoin.type];
    const memecoinImage = this.memecoinImages[memecoin.type];
    
    // Special effect for Trump (reduced on mobile)
    if (memecoin.isSpecial && memecoin.type === 'trump' && !this.isMobile) {
      // Golden glowing aura (disabled on mobile for performance)
      const glowIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
      this.ctx.shadowColor = '#ffaa00';
      this.ctx.shadowBlur = 20 * glowIntensity;
      
      // Golden particles around Trump (reduced on mobile)
      const particleChance = this.isMobile ? 0.1 : 0.3;
      if (Math.random() < particleChance) {
        this.createTrumpParticle(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
      }
    }
    
    if (memecoinImage && memecoinImage.complete) {
      // Draw memecoin image with optimized quality
      this.ctx.imageSmoothingEnabled = this.renderQuality === 'high';
      if (this.ctx.imageSmoothingEnabled) {
        this.ctx.imageSmoothingQuality = this.isMobile ? 'medium' : 'high';
      }
      
      // Créer un masque circulaire pour l'image
      this.ctx.beginPath();
      this.ctx.arc(0, 0, memecoin.width / 2 - 2, 0, Math.PI * 2);
      this.ctx.clip();
      
      // Dessiner l'image centrée
      this.ctx.drawImage(
        memecoinImage,
        -memecoin.width / 2,
        -memecoin.height / 2,
        memecoin.width,
        memecoin.height
      );
      
      // Restaurer le contexte pour dessiner la bordure
      this.ctx.restore();
      this.ctx.save();
      this.ctx.translate(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
      this.ctx.rotate(memecoin.rotation);
      
      // Ajouter une bordure brillante
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = memecoinType.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, memecoin.width / 2 - 1, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Réinitialiser l'ombre
      this.ctx.shadowBlur = 0;
      
    } else {
      // Fallback: dessiner un cercle coloré si l'image n'est pas disponible
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, memecoin.width / 2);
      gradient.addColorStop(0, memecoinType.color);
      gradient.addColorStop(1, this.darkenColor(memecoinType.color, 0.3));
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, memecoin.width / 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add border
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Add type indicator
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(memecoin.type.toUpperCase(), 0, 0);
    }
    
    // Réinitialiser l'ombre après le dessin
    this.ctx.shadowBlur = 0;
    
    this.ctx.restore();
  }
  
  createTrumpParticle(x, y) {
    // Create special golden particles for Trump (reduced for mobile performance)
    if (!this.isMobile || Math.random() < 0.5) { // Reduce particles on mobile
      this.particles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: this.isMobile ? 20 : 30, // Shorter life on mobile
        maxLife: this.isMobile ? 20 : 30,
        color: '#ffaa00',
        size: Math.random() * 4 + 2,
        type: 'trump_aura'
      });
    }
  }

  drawPowerup(powerup) {
    this.ctx.save();
    this.ctx.translate(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
    this.ctx.rotate(powerup.rotation);
    
    // Glow effect
    const glowIntensity = Math.sin(powerup.glow) * 0.5 + 0.5;
    const pulseSize = 1 + Math.sin(powerup.pulse) * 0.2;
    this.ctx.scale(pulseSize, pulseSize);
    
    this.ctx.shadowColor = '#ffaa00';
    this.ctx.shadowBlur = 30 * glowIntensity;
    
    // Draw bonus image if loaded, otherwise fallback to original system
    if (this.bonusImage && this.bonusImage.complete && this.bonusImage.naturalWidth > 0) {
      this.ctx.drawImage(
        this.bonusImage,
        -powerup.width / 2,
        -powerup.height / 2,
        powerup.width,
        powerup.height
      );
    } else {
      // Fallback: Draw powerup based on type
      const colors = {
        fist: '#ffaa00',
        shield: '#00aaff',
        speed: '#ff00aa',
        multi: '#aa00ff'
      };
      
      this.ctx.fillStyle = colors[powerup.type] || '#ffaa00';
      this.ctx.fillRect(-powerup.width / 2, -powerup.height / 2, powerup.width, powerup.height);
      
      // Add icon based on type
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      const icons = {
        fist: '👊',
        shield: '🛡️',
        speed: '⚡',
        multi: '✨'
      };
      this.ctx.fillText(icons[powerup.type] || '💎', 0, 4);
    }
    
    this.ctx.restore();
  }

  drawParticle(particle) {
    this.ctx.save();
    
    const alpha = particle.life / particle.maxLife;
    this.ctx.globalAlpha = alpha;
    
    if (particle.type === 'flash') {
      this.ctx.globalAlpha = alpha * 0.3;
    }
    
    // Effets spéciaux pour les particules de Trump
    if (particle.type === 'trump_explosion') {
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = 10;
      this.ctx.globalAlpha = alpha * 0.8;
    } else if (particle.type === 'trump_star') {
      this.ctx.shadowColor = '#ffaa00';
      this.ctx.shadowBlur = 15;
      // Dessiner une étoile au lieu d'un cercle
      this.drawStar(particle.x, particle.y, particle.size, particle.color);
      this.ctx.restore();
      return;
    } else if (particle.type === 'trump_aura') {
      this.ctx.shadowColor = '#ffaa00';
      this.ctx.shadowBlur = 8;
      this.ctx.globalAlpha = alpha * 0.6;
    }
    
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  drawStar(x, y, size, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.translate(x, y);
    
    // Dessiner une étoile à 5 branches
    for (let i = 0; i < 5; i++) {
      this.ctx.lineTo(0, -size);
      this.ctx.translate(0, -size);
      this.ctx.rotate(Math.PI / 5);
      this.ctx.lineTo(0, -size * 0.5);
      this.ctx.translate(0, -size * 0.5);
      this.ctx.rotate(Math.PI / 5);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawBackground() {
    // Choisir l'image de fond en fonction du niveau
    const bgImage = this.level <= 25 ? this.backgroundImages.bg1 : this.backgroundImages.bg2;
    
    if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
      // Calculer les dimensions pour couvrir tout l'écran en gardant les proportions
      const canvasRatio = this.canvas.width / this.canvas.height;
      const imageRatio = bgImage.naturalWidth / bgImage.naturalHeight;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (canvasRatio > imageRatio) {
        // Canvas plus large que l'image
        drawWidth = this.canvas.width;
        drawHeight = this.canvas.width / imageRatio;
        offsetX = 0;
        offsetY = (this.canvas.height - drawHeight) / 2;
      } else {
        // Canvas plus haut que l'image
        drawWidth = this.canvas.height * imageRatio;
        drawHeight = this.canvas.height;
        offsetX = (this.canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
      
      // Dessiner l'image de fond pour couvrir tout l'écran
      this.ctx.drawImage(bgImage, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      // Fond de secours si les images ne sont pas chargées
      const time = Date.now() * 0.001;
      
      // Gradient de fond
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw moving stars
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 100; i++) {
        const x = (i * 137.5 + time * 20) % this.canvas.width;
        const y = (i * 73.3 + time * 15) % this.canvas.height;
        const size = Math.sin(i + time) * 0.5 + 1;
        this.ctx.fillRect(x, y, size, size);
      }
    }
    
    // Overlay d'intensité pour les niveaux élevés
    if (this.level > 10) {
      this.ctx.fillStyle = `rgba(255, 0, 204, ${0.05 + (this.level - 10) * 0.01})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  render() {
    // Clear canvas completely
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background
    this.drawBackground();
    
    // Draw game objects (optimized particle rendering for mobile)
    if (this.isMobile) {
      // Render only every other particle on mobile for performance
      for (let i = 0; i < this.particles.length; i += 2) {
        this.drawParticle(this.particles[i]);
      }
    } else {
      this.particles.forEach(particle => this.drawParticle(particle));
    }
    this.memecoins.forEach(memecoin => this.drawMemecoin(memecoin));
    this.powerups.forEach(powerup => this.drawPowerup(powerup));
    this.drawPlayer();
    
    // Draw pause overlay
    if (this.gamePaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#00ff88';
      this.ctx.font = '48px "Press Start 2P"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSE', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.font = '16px "Press Start 2P"';
      this.ctx.fillText('Press P to continue', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
  }

  darkenColor(color, factor) {
    // Simple color darkening function
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * (1 - factor));
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * (1 - factor));
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * (1 - factor));
    return `rgb(${r}, ${g}, ${b})`;
  }

  gameLoop(currentTime) {
    // Adaptive FPS control for mobile performance
    if (this.isMobile) {
      const elapsed = currentTime - this.lastFrameTime;
      if (elapsed < this.frameInterval) {
        requestAnimationFrame((time) => this.gameLoop(time));
        return;
      }
      this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
    }
    
    // Performance optimization: Skip frames on mobile if needed
    if (this.isMobile && this.frameSkip < this.maxFrameSkip) {
      this.frameSkip++;
      requestAnimationFrame((time) => this.gameLoop(time));
      return;
    }
    this.frameSkip = 0;
    
    // Delta time calculation for smooth gameplay
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Only update if game is running and not paused
    if (this.gameRunning && !this.gamePaused) {
      this.update(deltaTime);
    }
    
    this.render();
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  start() {
    this.gameRunning = true;
    this.gameStartTime = Date.now();
    this.levelStartTime = Date.now();
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
    this.totalDestroyed = 0;
    this.levelTarget = 100;
    this.spawnRate = this.baseSpawnRate;
    this.spawnTimer = 0;
    this.powerupSpawnRate = 800; // Nouvelle valeur réduite
    this.powerupSpawnTimer = 0;
    this.trumpSpawnCounter = 0;
    this.forceNextTrump = false;
    this.globalSpawnCounter = 0;
    this.bonusCollected = 0; // Reset compteur bonus
    this.rotSoundPlayed = false; // Reset son rot
    
    // Background reste fixe
    
    this.memecoins = [];
    this.powerups = [];
    this.particles = [];
    
    // Reset player
    this.player.punchRadius = 100;
    this.player.speed = 8;
    this.player.powerupTimer = 0;
    this.player.invulnerable = false;
    this.player.invulnerableTimer = 0;
    
    this.resetPlayerPosition();
    this.updateUI();
  }

  // High Score Management
  loadHighScores() {
    const scores = localStorage.getItem('lfist-game-scores');
    return scores ? JSON.parse(scores) : [];
  }

  saveHighScore(name, score, level) {
    const newScore = {
      name: name || 'Anonyme',
      score: score,
      level: level,
      date: new Date().toLocaleDateString()
    };
    
    this.highScores.push(newScore);
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 10); // Keep top 10
    
    localStorage.setItem('lfist-game-scores', JSON.stringify(this.highScores));
  }

  displayHighScores() {
    const scoresList = document.getElementById('scoresList');
    if (scoresList) {
      if (this.highScores.length === 0) {
        scoresList.innerHTML = '<p>Aucun score enregistré</p>';
        return;
      }
      
      let html = '<ol>';
      this.highScores.forEach((score, index) => {
        html += `<li>${score.name} - ${score.score.toLocaleString()} pts (Niveau ${score.level}) - ${score.date}</li>`;
      });
      html += '</ol>';
      scoresList.innerHTML = html;
    }
  }

  clearHighScores() {
    if (confirm('Êtes-vous sûr de vouloir effacer tous les scores ?')) {
      this.highScores = [];
      localStorage.removeItem('lfist-game-scores');
      this.displayHighScores();
    }
  }
  
  start() {
    this.gameRunning = true;
    this.gameStartTime = Date.now();
    this.startBackgroundMusic(); // Démarrer la musique d'ambiance
    this.gameLoop();
  }
}

// Global game instance
let game;

// Game control functions
function startGame() {
  const gameStart = document.getElementById('gameStart');
  if (gameStart) {
    gameStart.style.display = 'none';
  }
  
  if (!game) {
    game = new LFistGame();
  } else {
    game.reset();
  }
  game.start();
}

function restartGame() {
  const screens = ['gameOver', 'levelComplete', 'gameCompleted'];
  screens.forEach(screenId => {
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.style.display = 'none';
    }
  });
  
  if (game) {
    game.reset();
    game.start();
  }
}

function nextLevel() {
  if (game) {
    game.nextLevel();
  }
}

function pauseGame() {
  if (game) {
    game.togglePause();
  }
}

// Social media sharing functions
function getShareMessage() {
  const finalScore = document.getElementById('finalScore').textContent;
  const finalLevel = document.getElementById('finalLevel').textContent;
  
  return `🎮 I scored ${finalScore} points at level ${finalLevel} on LFIST GAME! 🥊\n\n💪 Think you can beat my score?\n\n🚀 Play now at lfitcoin.netlify.app\n\n#LFISTCOIN @LFISTCOIN 🚀`;
}

function shareOnTwitter() {
  const message = getShareMessage();
  const url = encodeURIComponent('https://lfitcoin.netlify.app');
  const text = encodeURIComponent(message);
  
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function shareOnFacebook() {
  const url = encodeURIComponent('https://lfitcoin.netlify.app');
  const quote = encodeURIComponent(getShareMessage());
  
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
}

function shareOnTelegram() {
  const message = getShareMessage();
  const url = 'https://lfitcoin.netlify.app';
  const text = encodeURIComponent(`${message}\n\n${url}`);
  
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
}

function copyShareText() {
  const message = getShareMessage() + '\n\nhttps://lfitcoin.netlify.app';
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).then(() => {
      showCopyNotification();
    }).catch(() => {
      fallbackCopyText(message);
    });
  } else {
    fallbackCopyText(message);
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showCopyNotification();
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    alert('Unable to copy automatically. Here is the message:\n\n' + text);
  }
  
  document.body.removeChild(textArea);
}

function showCopyNotification() {
  // Créer une notification de copie
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(45deg, #00ff88, #00cc66);
    color: #000;
    padding: 15px 30px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    animation: copyNotification 2s ease-out forwards;
  `;
  notification.textContent = '✅ Message copied!';
  
  // Ajouter l'animation CSS
  if (!document.getElementById('copyNotificationCss')) {
    const style = document.createElement('style');
    style.id = 'copyNotificationCss';
    style.textContent = `
      @keyframes copyNotification {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Supprimer la notification après l'animation
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 2000);
}

// Game completion sharing functions
function getGameCompletedMessage() {
  const completedScore = document.getElementById('completedScore').textContent;
  const completedMaxCombo = document.getElementById('completedMaxCombo').textContent;
  const completedTotalDestroyed = document.getElementById('completedTotalDestroyed').textContent;
  
  return `🎉 I COMPLETED LFIST GAME! 🎉\n\n🏆 Final score: ${completedScore} points\n💥 Max combo: ${completedMaxCombo}\n🎯 Total destroyed: ${completedTotalDestroyed}\n\n🔥 ALL 50 LEVELS COMPLETED! 🔥\n\n💪 Think you can do better?\n\n🚀 Play now at lfitcoin.netlify.app\n\n#LFISTCOIN @LFISTCOIN 🚀`;
}

function shareGameCompleted() {
  const message = getGameCompletedMessage();
  const url = encodeURIComponent('https://lfitcoin.netlify.app');
  const text = encodeURIComponent(message);
  
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function shareGameCompletedFacebook() {
  const url = encodeURIComponent('https://lfitcoin.netlify.app');
  const quote = encodeURIComponent(getGameCompletedMessage());
  
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
}

function shareGameCompletedTelegram() {
  const message = getGameCompletedMessage();
  const url = 'https://lfitcoin.netlify.app';
  const text = encodeURIComponent(`${message}\n\n${url}`);
  
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
}

function copyGameCompletedText() {
  const message = getGameCompletedMessage() + '\n\nhttps://lfitcoin.netlify.app';
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).then(() => {
      showCopyNotification();
    }).catch(() => {
      fallbackCopyText(message);
    });
  } else {
    fallbackCopyText(message);
  }
}

function goHome() {
  window.location.href = 'Index.html';
}

function saveScore() {
  const playerName = document.getElementById('playerName');
  if (playerName && game) {
    const name = playerName.value.trim();
    if (name) {
      game.saveHighScore(name, game.score, game.level);
      alert('Score sauvegardé !');
    } else {
      alert('Veuillez entrer votre nom');
    }
  }
}

function saveChampionScore() {
  const championName = document.getElementById('championName');
  if (championName && game) {
    const name = championName.value.trim();
    if (name) {
      game.saveHighScore(name + ' 👑', game.score, 50);
      alert('Félicitations ! Vous êtes dans le Hall of Fame !');
    } else {
      alert('Veuillez entrer votre nom de champion');
    }
  }
}

function showHighScores() {
  if (!game) game = new LFistGame();
  game.displayHighScores();
  
  const gameStart = document.getElementById('gameStart');
  if (gameStart) gameStart.style.display = 'none';
  
  const highScores = document.getElementById('highScores');
  if (highScores) highScores.style.display = 'block';
}

function hideHighScores() {
  const highScores = document.getElementById('highScores');
  if (highScores) highScores.style.display = 'none';
  
  const gameStart = document.getElementById('gameStart');
  if (gameStart) gameStart.style.display = 'block';
}

function clearScores() {
  if (game) {
    game.clearHighScores();
  }
}

function showControls() {
  alert('CONTROLS:\n\n🖱️ Mouse: Move character\n👆 Click/Tap: Punch\n⌨️ Arrows or WASD: Move\n⏸️ P: Pause\n🚀 Space/Enter: Punch');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('LFIST Game Ready! 🥊');
  
  // Preload game instance for high scores
  game = new LFistGame();
});