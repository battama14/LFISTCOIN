// LFIST Game Configuration
const GAME_CONFIG = {
  // Performance settings
  performance: {
    targetFPS: 60,
    enableObjectPooling: true,
    maxParticles: 100,
    maxMemecoins: 20,
    maxPowerups: 5,
    enableFrameSkipping: true,
    lowPowerMode: false // Auto-detected on mobile
  },

  // Game balance
  balance: {
    player: {
      speed: 6,
      punchRadius: 80,
      punchDuration: 15,
      invulnerabilityDuration: 120,
      powerupDuration: 300
    },
    
    spawning: {
      baseSpawnRate: 80,
      powerupSpawnRate: 400,
      difficultyIncrease: 2,
      maxSpawnRate: 30
    },
    
    scoring: {
      basePoints: {
        doge: 100,
        shiba: 200,
        akita: 250,
        catecoin: 300,
        samoyed: 400
      },
      bonusPoints: 500,
      comboThreshold: 5,
      levelBonusMultiplier: 1000
    }
  },

  // Audio settings
  audio: {
    masterVolume: 0.7,
    musicVolume: 0.3,
    sfxVolume: 0.4,
    enableAudio: true,
    preloadAudio: true
  },

  // Visual settings
  graphics: {
    enableParticles: true,
    enableGlow: true,
    enableScreenShake: false,
    particleQuality: 'medium', // low, medium, high
    enableShadows: false
  },

  // Mobile optimizations
  mobile: {
    autoDetect: true,
    reducedParticles: true,
    simplifiedGraphics: true,
    touchSensitivity: 1.0,
    preventZoom: true
  },

  // Debug settings
  debug: {
    showFPS: false,
    showCollisionBoxes: false,
    enableConsoleLog: false,
    skipIntro: false
  }
};

// Auto-detect mobile and adjust settings
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  GAME_CONFIG.performance.lowPowerMode = true;
  GAME_CONFIG.performance.maxParticles = 50;
  GAME_CONFIG.graphics.particleQuality = 'low';
  GAME_CONFIG.graphics.enableShadows = false;
  GAME_CONFIG.mobile.reducedParticles = true;
}

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME_CONFIG;
} else if (typeof window !== 'undefined') {
  window.GAME_CONFIG = GAME_CONFIG;
}