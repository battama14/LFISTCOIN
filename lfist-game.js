// 🥊 LFIST GAME - Version Optimisée PC/Mobile
// Jeu de destruction de memecoins avec LFIST

class LFistGame {
    constructor() {
        // Canvas et contexte
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // État du jeu
        this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameover', 'levelcomplete', 'victory'
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.combo = 0;
        this.maxCombo = 0;
        this.destroyed = 0;
        this.totalDestroyed = 0;
        
        // Paramètres de niveau
        this.levelTarget = 10;
        this.maxLevel = 50;
        
        // Joueur LFIST
        this.player = {
            x: 0,
            y: 0,
            width: 60,
            height: 60,
            speed: 6,
            hitRadius: 40,
            color: '#00ff88',
            trail: []
        };
        
        // Collections d'objets
        this.memecoins = [];
        this.powerups = [];
        this.particles = [];
        this.stars = [];
        
        // Contrôles
        this.keys = {};
        this.touch = { active: false, x: 0, y: 0 };
        
        // Temps et animation
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        
        // Spawn des objets
        this.memecoinSpawnTimer = 0;
        this.memecoinSpawnRate = 60; // frames
        this.powerupSpawnTimer = 0;
        this.powerupSpawnRate = 600; // frames
        this.trumpSpawnCounter = 0;
        
        // Effets et animations
        this.screenShake = 0;
        this.comboTimer = 0;
        
        // Audio
        this.sounds = {
            intro: document.getElementById('introSound'),
            ambiance: document.getElementById('ambianceSound'),
            punch: document.getElementById('punchSound'),
            powerup: document.getElementById('powerupSound'),
            trump: document.getElementById('trumpSound'),
            rot: document.getElementById('rotSound')
        };
        
        // Compteur de bonus pour le son rot
        this.bonusCollected = 0;
        
        // Types de memecoins avec images
        this.memecoinTypes = {
            doge: { image: 'memecoins/binance-peg-dogecoin_4_11zon.webp', points: 100, speed: 2 },
            pepe: { image: 'memecoins/pepe_13_11zon.webp', points: 150, speed: 2.5 },
            shiba: { image: 'memecoins/shiba-inu_16_11zon.webp', points: 120, speed: 2.2 },
            floki: { image: 'memecoins/floki_10_11zon.webp', points: 130, speed: 2.3 },
            bonk: { image: 'memecoins/bonk_7_11zon.webp', points: 110, speed: 2.1 },
            wojak: { image: 'memecoins/wojak_19_11zon.webp', points: 140, speed: 2.4 },
            akita: { image: 'memecoins/akita-inu_1_11zon.webp', points: 125, speed: 2.3 },
            trump: { image: 'memecoins/trump_17_11zon.webp', points: 500, speed: 3, rare: true }
        };
        
        // Images du personnage
        this.playerImages = {
            normal: null, // persofix.png
            punching: null // persopoing.png
        };
        
        // Image du power-up
        this.powerupImage = null; // bonus.png
        
        // Images des memecoins chargées
        this.memecoinImages = {};
        
        // État du joueur
        this.player.isPunching = false;
        this.player.punchTimer = 0;
        
        // Initialisation
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.createStarField();
        this.resetPlayer();
        this.loadAssets();
        this.showStartScreen();
        this.gameLoop();
        
        // Démarrer la musique d'intro automatiquement
        setTimeout(() => {
            this.tryAutoplayIntro();
        }, 500);
    }
    
    loadAssets() {
        console.log('🔄 Chargement des images...');
        
        // Charger les images du personnage
        this.playerImages.normal = new Image();
        this.playerImages.normal.onload = () => console.log('✅ persofix.png chargée');
        this.playerImages.normal.onerror = () => console.error('❌ Erreur persofix.png');
        this.playerImages.normal.src = 'persofix.png';
        
        this.playerImages.punching = new Image();
        this.playerImages.punching.onload = () => console.log('✅ persopoing.png chargée');
        this.playerImages.punching.onerror = () => console.error('❌ Erreur persopoing.png');
        this.playerImages.punching.src = 'persopoing.png';
        
        // Charger l'image du power-up
        this.powerupImage = new Image();
        this.powerupImage.onload = () => console.log('✅ bonus.png chargée');
        this.powerupImage.onerror = () => console.error('❌ Erreur bonus.png');
        this.powerupImage.src = 'bonus.png';
        
        // Charger les images des memecoins
        for (const [type, data] of Object.entries(this.memecoinTypes)) {
            const img = new Image();
            img.onload = () => console.log(`✅ ${type} chargé: ${data.image}`);
            img.onerror = () => console.error(`❌ Erreur ${type}: ${data.image}`);
            img.src = data.image;
            this.memecoinImages[type] = img;
        }
        
        console.log('🎮 Chargement des images LFIST Game lancé!');
        
        // Configuration audio
        this.setupAudio();
    }
    
    setupAudio() {
        // Volumes par défaut
        this.setVolume('intro', 0.6);
        this.setVolume('ambiance', 0.4);
        this.setVolume('punch', 0.7);
        this.setVolume('powerup', 0.8);
        this.setVolume('trump', 0.9);
        this.setVolume('rot', 0.8);
        
        // Logs de vérification des fichiers audio
        Object.keys(this.sounds).forEach(key => {
            const sound = this.sounds[key];
            if (sound) {
                sound.addEventListener('loadeddata', () => {
                    console.log(`✅ Audio chargé: ${key} (${Math.round(sound.duration)}s)`);
                });
                sound.addEventListener('error', (e) => {
                    console.error(`❌ Erreur audio: ${key}`, e);
                });
            }
        });
        
        console.log('🔊 Configuration audio terminée');
    }
    
    tryAutoplayIntro() {
        const introSound = this.sounds.intro;
        if (introSound) {
            // Vérifier d'abord si l'audio est prêt
            if (introSound.readyState >= 2) {
                introSound.volume = 0.6; // Volume approprié
                introSound.play().then(() => {
                    console.log('🎵 Musique d\'intro lancée automatiquement');
                    this.audioEnabled = true;
                }).catch(e => {
                    console.log('🔇 Autoplay bloqué par le navigateur');
                    this.showAudioPrompt();
                });
            } else {
                // Si pas prêt, réessayer dans 500ms
                setTimeout(() => this.tryAutoplayIntro(), 500);
            }
        }
    }
    
    showAudioPrompt() {
        const audioButton = document.getElementById('audioButton');
        if (audioButton) {
            audioButton.style.background = 'linear-gradient(45deg, #ff6600, #ff4400)';
            audioButton.textContent = '🔊 CLIQUER POUR DÉMARRER L\'AUDIO';
            audioButton.style.animation = 'pulse 1s infinite';
            audioButton.style.fontSize = '9px';
        }
    }
    
    setupCanvas() {
        this.resizeCanvas();
        this.ctx.imageSmoothingEnabled = false;
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.resetPlayer();
    }
    
    resetPlayer() {
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 40;
    }
    
    setupEventListeners() {
        // Clavier
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyP' && this.gameState === 'playing') {
                this.togglePause();
            }
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Tactile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.touch.active = true;
            this.touch.x = e.touches[0].clientX - rect.left;
            this.touch.y = e.touches[0].clientY - rect.top;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.touch.active) {
                const rect = this.canvas.getBoundingClientRect();
                this.touch.x = e.touches[0].clientX - rect.left;
                this.touch.y = e.touches[0].clientY - rect.top;
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touch.active = false;
        });
        
        // Souris (pour les tests)
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                this.touch.x = e.clientX - rect.left;
                this.touch.y = e.clientY - rect.top;
                this.touch.active = true;
            }
        });
    }
    
    createStarField() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.8 + 0.2
            });
        }
    }
    
    // ===== GAME STATES =====
    
    showStartScreen() {
        this.gameState = 'menu';
        this.hideAllScreens();
        document.getElementById('startScreen').style.display = 'flex';
        
        // Arrêter la musique d'ambiance et jouer l'intro
        this.stopSound('ambiance');
        this.playSound('intro');
    }
    
    hideAllScreens() {
        const screens = ['startScreen', 'gameOverScreen', 'levelCompleteScreen', 'victoryScreen'];
        screens.forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
    }
    
    startGame() {
        this.hideAllScreens();
        this.gameState = 'playing';
        this.resetGame();
        
        // Arrêter l'intro et jouer la musique d'ambiance
        this.stopSound('intro');
        this.playSound('ambiance');
        
        document.getElementById('mobileHint').style.display = 'block';
        setTimeout(() => {
            document.getElementById('mobileHint').style.display = 'none';
        }, 3000);
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.combo = 0;
        this.maxCombo = 0;
        this.destroyed = 0;
        this.totalDestroyed = 0;
        this.levelTarget = 100; // Premier niveau : 100 memecoins
        this.bonusCollected = 0;
        
        this.memecoins = [];
        this.powerups = [];
        this.particles = [];
        
        this.memecoinSpawnTimer = 0;
        this.powerupSpawnTimer = 0;
        this.trumpSpawnCounter = 0;
        
        this.resetPlayer();
        this.updateUI();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
    
    gameOver() {
        this.gameState = 'gameover';
        
        // Arrêter la musique d'ambiance
        this.stopSound('ambiance');
        
        document.getElementById('finalScore').textContent = this.score.toLocaleString();
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('finalCombo').textContent = this.maxCombo;
        document.getElementById('finalDestroyed').textContent = this.totalDestroyed;
        document.getElementById('gameOverScreen').style.display = 'flex';
    }
    
    levelComplete() {
        this.gameState = 'levelcomplete';
        const levelBonus = this.level * 100 + this.combo * 50;
        this.score += levelBonus;
        
        document.getElementById('completedLevel').textContent = this.level;
        document.getElementById('levelBonus').textContent = levelBonus.toLocaleString();
        document.getElementById('levelCompleteScreen').style.display = 'flex';
    }
    
    victory() {
        this.gameState = 'victory';
        
        // Arrêter la musique d'ambiance
        this.stopSound('ambiance');
        
        document.getElementById('victoryScore').textContent = this.score.toLocaleString();
        document.getElementById('victoryCombo').textContent = this.maxCombo;
        document.getElementById('victoryDestroyed').textContent = this.totalDestroyed;
        document.getElementById('victoryScreen').style.display = 'flex';
    }
    
    nextLevel() {
        this.hideAllScreens();
        this.level++;
        
        if (this.level > 50) {
            this.victory();
            return;
        }
        
        this.destroyed = 0;
        // Progression : 100, 120, 140, 160, 180, etc.
        this.levelTarget = 100 + (this.level - 1) * 20;
        
        // Spawn plus rapide et plus nombreux avec les niveaux
        this.memecoinSpawnRate = Math.max(15, 50 - this.level * 1.5); // Plus rapide
        this.powerupSpawnRate = Math.max(200, 500 - this.level * 8); // Plus fréquent
        
        this.memecoins = [];
        this.powerups = [];
        this.particles = [];
        
        this.gameState = 'playing';
        this.updateUI();
        
        this.showNotification(`🎉 LEVEL ${this.level}! 🎉`, 'level');
    }
    
    restartGame() {
        this.hideAllScreens();
        this.startGame();
    }
    
    // ===== GAME LOGIC =====
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.gameTime += deltaTime;
        this.updatePlayer();
        this.updateMemecoins();
        this.updatePowerups();
        this.updateParticles();
        this.updateStars();
        this.handleSpawning();
        this.checkCollisions();
        this.updateEffects();
        this.updateUI();
    }
    
    updatePlayer() {
        const speed = this.player.speed;
        
        // Contrôles clavier
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x = Math.max(0, this.player.x - speed);
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + speed);
        }
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.player.y = Math.max(0, this.player.y - speed);
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.player.y = Math.min(this.canvas.height - this.player.height, this.player.y + speed);
        }
        
        // Gestion de l'animation de coup de poing
        if (this.player.punchTimer > 0) {
            this.player.punchTimer--;
            this.player.isPunching = true;
        } else {
            this.player.isPunching = false;
        }
        
        // Contrôle tactile
        if (this.touch.active) {
            const targetX = this.touch.x - this.player.width / 2;
            const targetY = this.touch.y - this.player.height / 2;
            
            const dx = targetX - this.player.x;
            const dy = targetY - this.player.y;
            
            if (Math.abs(dx) > 5) {
                this.player.x += dx * 0.1;
            }
            if (Math.abs(dy) > 5) {
                this.player.y += dy * 0.1;
            }
            
            // Limites
            this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
            this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
        }
        
        // Trail effect
        this.player.trail.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y + this.player.height / 2,
            time: this.gameTime
        });
        
        this.player.trail = this.player.trail.filter(point => 
            this.gameTime - point.time < 200
        );
    }
    
    updateMemecoins() {
        for (let i = this.memecoins.length - 1; i >= 0; i--) {
            const memecoin = this.memecoins[i];
            memecoin.y += memecoin.speed;
            memecoin.rotation += memecoin.rotationSpeed;
            
            // Effets spéciaux pour Trump
            if (memecoin.type === 'trump') {
                memecoin.glowIntensity = Math.sin(this.gameTime * 0.01) * 0.5 + 0.5;
            }
            
            // Suppression si hors écran
            if (memecoin.y > this.canvas.height + 50) {
                this.memecoins.splice(i, 1);
                if (memecoin.type !== 'trump') { // Trump ne fait pas perdre de vie
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
            powerup.bobOffset = Math.sin(this.gameTime * 0.005 + powerup.phase) * 3;
            
            if (powerup.y > this.canvas.height + 50) {
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
            particle.opacity = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateStars() {
        for (const star of this.stars) {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
        }
    }
    
    updateEffects() {
        if (this.screenShake > 0) {
            this.screenShake -= 2;
        }
        
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer === 0) {
                this.combo = 0;
                this.updateUI();
            }
        }
    }
    
    handleSpawning() {
        // Spawn memecoins
        this.memecoinSpawnTimer++;
        if (this.memecoinSpawnTimer >= this.memecoinSpawnRate) {
            // Spawn multiple memecoins aux niveaux élevés
            const spawnCount = Math.min(1 + Math.floor(this.level / 10), 4);
            for (let i = 0; i < spawnCount; i++) {
                if (Math.random() < 0.8 || i === 0) { // Garantir au moins 1 spawn
                    this.spawnMemecoin();
                }
            }
            this.memecoinSpawnTimer = 0;
        }
        
        // Spawn powerups
        this.powerupSpawnTimer++;
        if (this.powerupSpawnTimer >= this.powerupSpawnRate) {
            this.spawnPowerup();
            this.powerupSpawnTimer = 0;
        }
    }
    
    spawnMemecoin() {
        const types = Object.keys(this.memecoinTypes);
        let type;
        
        // Logique de spawn Trump (très rare - seulement bonus de points)
        this.trumpSpawnCounter++;
        const trumpChance = 0.005 + (this.level * 0.0005); // 0.5% base + très petit bonus par niveau
        
        if (Math.random() < trumpChance || this.trumpSpawnCounter > 200) {
            type = 'trump';
            this.trumpSpawnCounter = 0;
            this.showTrumpWarning();
            console.log('🚨 RARE TRUMP COIN SPAWNED!');
        } else {
            // Spawn normal (sans trump)
            const normalTypes = types.filter(t => t !== 'trump');
            type = normalTypes[Math.floor(Math.random() * normalTypes.length)];
        }
        
        const memecoinData = this.memecoinTypes[type];
        
        // Vitesse augmente avec les niveaux
        const levelSpeedBonus = this.level * 0.3;
        const baseSpeed = memecoinData.speed + levelSpeedBonus;
        
        const memecoin = {
            x: Math.random() * (this.canvas.width - 40),
            y: -40,
            width: type === 'trump' ? 50 : 35,
            height: type === 'trump' ? 50 : 35,
            type: type,
            image: this.memecoinImages[type],
            points: memecoinData.points,
            speed: baseSpeed + Math.random() * 1.0,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            glowIntensity: 0
        };
        
        this.memecoins.push(memecoin);
    }
    
    spawnPowerup() {
        const powerup = {
            x: Math.random() * (this.canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            type: 'beer',
            speed: 1.5,
            rotation: 0,
            rotationSpeed: 0.1,
            bobOffset: 0,
            phase: Math.random() * Math.PI * 2
        };
        
        this.powerups.push(powerup);
    }
    
    checkCollisions() {
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        
        // Collision avec memecoins
        for (let i = this.memecoins.length - 1; i >= 0; i--) {
            const memecoin = this.memecoins[i];
            const memecoinCenterX = memecoin.x + memecoin.width / 2;
            const memecoinCenterY = memecoin.y + memecoin.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(playerCenterX - memecoinCenterX, 2) +
                Math.pow(playerCenterY - memecoinCenterY, 2)
            );
            
            if (distance < this.player.hitRadius) {
                this.destroyMemecoin(i);
            }
        }
        
        // Collision avec powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            const powerupCenterX = powerup.x + powerup.width / 2;
            const powerupCenterY = powerup.y + powerup.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(playerCenterX - powerupCenterX, 2) +
                Math.pow(playerCenterY - powerupCenterY, 2)
            );
            
            if (distance < this.player.hitRadius) {
                this.collectPowerup(i);
            }
        }
    }
    
    destroyMemecoin(index) {
        const memecoin = this.memecoins[index];
        
        // Déclencher l'animation de punch
        this.player.punchTimer = 15; // 15 frames d'animation
        
        // Calcul des points avec combo
        let points = memecoin.points;
        const comboMultiplier = Math.min(Math.floor(this.combo / 5) + 1, 5);
        points *= comboMultiplier;
        
        // Bonus spécial pour Trump
        if (memecoin.type === 'trump') {
            points *= 2;
            this.combo += 5;
            this.showNotification(`🎯 TRUMP HIT! +${points} pts! 🎯`, 'trump');
            this.playSound('trump');
            this.createTrumpExplosion(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
        } else {
            this.combo++;
            this.playSound('punch'); // Son coup.mp3
            this.createExplosion(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2, '#ff6600');
        }
        
        this.score += points;
        this.destroyed++;
        this.totalDestroyed++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.comboTimer = 180; // 3 secondes à 60fps
        
        // Screen shake
        this.screenShake = memecoin.type === 'trump' ? 15 : 5;
        
        // Suppression du memecoin
        this.memecoins.splice(index, 1);
        
        // Vérification fin de niveau
        if (this.destroyed >= this.levelTarget) {
            this.levelComplete();
        }
    }
    
    collectPowerup(index) {
        const powerup = this.powerups[index];
        
        // Incrémenter le compteur de bonus
        this.bonusCollected++;
        
        // Effets du powerup
        const effects = [
            { type: 'score', value: 250, text: '🍺 Cheers! +250 pts!' },
            { type: 'life', value: 1, text: '🍺 Cheers! +1 life!' },
            { type: 'combo', value: 3, text: '🍺 Cheers! +3 combo!' },
            { type: 'slowmo', value: 300, text: '🍺 Cheers! Slow motion!' }
        ];
        
        const effect = effects[Math.floor(Math.random() * effects.length)];
        
        switch (effect.type) {
            case 'score':
                this.score += effect.value;
                break;
            case 'life':
                this.lives = Math.min(5, this.lives + effect.value);
                break;
            case 'combo':
                this.combo += effect.value;
                this.comboTimer = 180;
                break;
            case 'slowmo':
                // Implémentation du slow motion si nécessaire
                break;
        }
        
        this.showNotification(effect.text, 'beer');
        this.playSound('powerup');
        this.createPowerupExplosion(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
        
        // Jouer le son rot tous les 15 bonus
        if (this.bonusCollected % 15 === 0) {
            setTimeout(() => {
                this.playSound('rot');
                this.showNotification(`💨 In your face patriarchy! 💨`, 'beer');
            }, 500);
        }
        
        this.powerups.splice(index, 1);
    }
    
    loseLife() {
        this.lives--;
        this.combo = 0;
        this.screenShake = 20;
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.showNotification(`💔 LIFE LOST! ${this.lives} remaining`, 'damage');
        }
    }
    
    // ===== EFFECTS =====
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                color: color,
                life: 30,
                maxLife: 30,
                opacity: 1
            });
        }
    }
    
    createTrumpExplosion(x, y) {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 6 + 3,
                color: Math.random() > 0.5 ? '#ffd700' : '#ff6600',
                life: 60,
                maxLife: 60,
                opacity: 1
            });
        }
    }
    
    createPowerupExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 3 + 2,
                color: '#ffaa00',
                life: 40,
                maxLife: 40,
                opacity: 1
            });
        }
    }
    
    // ===== RENDERING =====
    
    render() {
        // Clear avec screen shake
        this.ctx.save();
        if (this.screenShake > 0) {
            this.ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }
        
        // Background
        this.drawBackground();
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.drawStars();
            this.drawParticles();
            this.drawMemecoins();
            this.drawPowerups();
            this.drawPlayer();
            
            if (this.gameState === 'paused') {
                this.drawPauseOverlay();
            }
        } else {
            this.drawStars();
        }
        
        this.ctx.restore();
    }
    
    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
        );
        gradient.addColorStop(0, '#0f1419');
        gradient.addColorStop(1, '#000000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawStars() {
        this.ctx.save();
        for (const star of this.stars) {
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }
    
    drawPlayer() {
        this.ctx.save();
        
        // Trail
        this.ctx.globalAlpha = 0.3;
        for (let i = 0; i < this.player.trail.length; i++) {
            const point = this.player.trail[i];
            const age = this.gameTime - point.time;
            const alpha = Math.max(0, 1 - age / 200);
            
            this.ctx.globalAlpha = alpha * 0.3;
            this.ctx.fillStyle = this.player.color;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Player avec vraie image
        this.ctx.globalAlpha = 1;
        this.ctx.shadowColor = this.player.color;
        this.ctx.shadowBlur = 10;
    
        // Choisir l'image selon l'état
        const playerImage = this.player.isPunching ? 
            this.playerImages.punching : this.playerImages.normal;
        
        if (playerImage && playerImage.complete) {
            this.ctx.drawImage(
                playerImage,
                this.player.x,
                    this.player.y,
                this.player.width,
                this.player.height
            );
        } else {
            // Fallback si l'image n'est pas chargée
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = this.player.color;
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }
        
        // Hit radius (debug)
        if (false) { // Mettre à true pour debug
            this.ctx.shadowBlur = 0;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                this.player.hitRadius, 0, Math.PI * 2
            );
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawMemecoins() {
        for (const memecoin of this.memecoins) {
            this.ctx.save();
            this.ctx.translate(memecoin.x + memecoin.width / 2, memecoin.y + memecoin.height / 2);
            this.ctx.rotate(memecoin.rotation);
            
            // Glow effect pour Trump
            if (memecoin.type === 'trump') {
                this.ctx.shadowColor = '#ffd700';
                this.ctx.shadowBlur = 20 + memecoin.glowIntensity * 10;
            }
            
            // Dessiner l'image du memecoin
            if (memecoin.image && memecoin.image.complete) {
                this.ctx.drawImage(
                    memecoin.image,
                    -memecoin.width / 2,
                    -memecoin.height / 2,
                    memecoin.width,
                    memecoin.height
                );
            } else {
                // Fallback si l'image n'est pas chargée
                this.ctx.shadowBlur = 0;
                const colors = {
                    doge: '#ffaa00',
                    pepe: '#00ff00',
                    shiba: '#ff6600',
                    floki: '#ff00ff',
                    bonk: '#ff4400',
                    wojak: '#888888',
                    akita: '#cc6600',
                    trump: '#ff6600'
                };
                this.ctx.fillStyle = colors[memecoin.type] || '#ffaa00';
                this.ctx.fillRect(-memecoin.width / 2, -memecoin.height / 2, memecoin.width, memecoin.height);
                
                // Visage simple
                this.ctx.fillStyle = '#000000';
                const eyeSize = memecoin.type === 'trump' ? 6 : 4;
                this.ctx.fillRect(-8, -8, eyeSize, eyeSize);
                this.ctx.fillRect(2, -8, eyeSize, eyeSize);
                this.ctx.fillRect(-6, 2, 12, 3);
            }
            
            this.ctx.restore();
        }
    }
    
    drawPowerups() {
        for (const powerup of this.powerups) {
            this.ctx.save();
            this.ctx.translate(
                powerup.x + powerup.width / 2,
                powerup.y + powerup.height / 2 + powerup.bobOffset
            );
            this.ctx.rotate(powerup.rotation);
            
            // Glow effect
            this.ctx.shadowColor = '#ffaa00';
            this.ctx.shadowBlur = 15;
            
            // Dessiner l'image du power-up
            if (this.powerupImage && this.powerupImage.complete) {
                this.ctx.drawImage(
                    this.powerupImage,
                    -powerup.width / 2,
                    -powerup.height / 2,
                    powerup.width,
                    powerup.height
                );
            } else {
                // Fallback si l'image n'est pas chargée
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#ffaa00';
                this.ctx.fillRect(-powerup.width / 2, -powerup.height / 2, powerup.width, powerup.height);
                
                // Détails
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(-8, -12, 16, 4);
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(-6, -6, 12, 2);
            }
            
            this.ctx.restore();
        }
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    drawPauseOverlay() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '24px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSE', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '12px "Press Start 2P"';
        this.ctx.fillText('Appuyez sur P pour continuer', this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.ctx.restore();
    }
    
    // ===== UI =====
    
    updateUI() {
        document.getElementById('scoreDisplay').textContent = `SCORE: ${this.score.toLocaleString()}`;
        document.getElementById('livesDisplay').textContent = `LIVES: ${this.lives}`;
        document.getElementById('levelDisplay').textContent = `LEVEL: ${this.level}`;
        
        const comboDisplay = document.getElementById('comboDisplay');
        if (this.combo > 1) {
            comboDisplay.style.display = 'block';
            comboDisplay.textContent = `COMBO: x${this.combo}`;
        } else {
            comboDisplay.style.display = 'none';
        }
        
        document.getElementById('progressInfo').textContent = 
            `MEMECOINS DÉTRUITS: ${this.destroyed}/${this.levelTarget}`;
        
        const progress = (this.destroyed / this.levelTarget) * 100;
        document.getElementById('progressFill').style.width = `${Math.min(100, progress)}%`;
    }
    
    showNotification(message, type = 'default') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
    
    showTrumpWarning() {
        const notification = document.getElementById('notification');
        notification.textContent = '🚨 TRUMP BONUS! Smack him for extra points! 🚨';
        notification.className = 'notification trump-warning';
        notification.classList.add('show');
        
        // Message reste seulement 3 secondes pour ne pas gêner le jeu
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // ===== AUDIO =====
    
    playSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.log(`🔊 Audio play failed for ${soundName}:`, e);
                // En cas d'erreur, on peut essayer de jouer à nouveau après un délai
                if (e.name === 'NotAllowedError') {
                    console.log('🔊 Audio bloqué - interaction utilisateur requise');
                }
            });
            console.log(`🔊 Playing sound: ${soundName}`);
        } else {
            console.error(`❌ Son non trouvé: ${soundName}`);
        }
    }
    
    stopSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
            console.log(`🔇 Stopped sound: ${soundName}`);
        }
    }
    
    setVolume(soundName, volume) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.volume = Math.max(0, Math.min(1, volume));
            console.log(`🔊 Volume ${soundName}: ${Math.round(volume * 100)}%`);
        }
    }
    
    // ===== GAME LOOP =====
    
    gameLoop(currentTime = 0) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(this.deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// ===== GLOBAL FUNCTIONS =====

let game;

function startGame() {
    game.startGame();
}

function restartGame() {
    game.restartGame();
}

function showStartScreen() {
    game.showStartScreen();
}

function nextLevel() {
    game.nextLevel();
}

function showInstructions() {
    alert(`🎮 LFIST GAME - Instructions 🎮

🎯 OBJECTIF :
• Détruisez tous les memecoins qui tombent
• Ne les laissez pas toucher le sol
• Survivez aux 50 niveaux !

🎮 CONTRÔLES :
• PC : Flèches ↑↓←→ ou WASD
• Mobile : Touchez l'écran
• Destruction automatique au contact
• P = Pause

💎 ÉLÉMENTS SPÉCIAUX :
• 🍺 Bières dorées = Power-ups variés
• 🚨 Trump coins = 500+ points (RARE!)
• 💥 Combos = Multiplicateur de points

🏆 CONSEILS :
• Enchaînez les destructions pour des combos
• Les Trump coins ne font pas perdre de vie
• Collectez les power-ups pour des bonus
• Plus le niveau est élevé, plus c'est rapide !

Bonne chance ! 🚀`);
}

// Fonctions de partage
function shareScore(platform) {
    const score = game.score.toLocaleString();
    const level = game.level;
    const message = `🎮 J'ai fait ${score} points au niveau ${level} sur LFIST GAME ! 🥊

💪 Penses-tu pouvoir battre mon score ?

🚀 Joue maintenant sur lfitcoin.netlify.app

#LFISTCOIN @LFISTCOIN 🚀`;

    const url = 'https://lfitcoin.netlify.app';
    
    switch (platform) {
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`);
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`);
            break;
        case 'telegram':
            window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`);
            break;
    }
}

function shareVictory(platform) {
    const score = game.score.toLocaleString();
    const combo = game.maxCombo;
    const destroyed = game.totalDestroyed;
    const message = `🎉 J'AI TERMINÉ LFIST GAME ! 🎉

🏆 Score final: ${score} points
💥 Combo max: ${combo}
🎯 Total détruit: ${destroyed}

🔥 50 NIVEAUX TERMINÉS ! 🔥

💪 Penses-tu pouvoir faire mieux ?

🚀 Joue maintenant sur lfitcoin.netlify.app

#LFISTCOIN @LFISTCOIN 🚀`;

    const url = 'https://lfitcoin.netlify.app';
    
    switch (platform) {
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`);
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`);
            break;
        case 'telegram':
            window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`);
            break;
    }
}

// Initialisation du jeu
document.addEventListener('DOMContentLoaded', () => {
    game = new LFistGame();
    console.log('🥊 LFIST GAME Loaded! Ready to punch some memecoins! 🚀');
});