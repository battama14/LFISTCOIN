# 🎵 Guide Audio LFIST Game

## 🔊 FICHIERS AUDIO INTÉGRÉS

### 📁 Fichiers requis (tous présents) :
- ✅ `intro.mp3` - Musique d'intro sur l'écran de démarrage
- ✅ `ambiance.mp3` - Musique d'ambiance pendant le jeu (en boucle)
- ✅ `coup.mp3` - Son de frappe quand LFIST détruit un memecoin
- ✅ `sontrump.mp3` - Son spécial quand on détruit un Trump coin
- ✅ `bonus.mp3` - Son quand on collecte un power-up
- ✅ `rot.mp3` - Son spécial tous les 15 bonus collectés

## 🎮 DÉCLENCHEURS AUDIO DANS LE JEU

### 📻 **Écran de démarrage**
- **Musique** : `intro.mp3` (en boucle)
- **Volume** : 60%
- **Action** : Se joue automatiquement au lancement du menu

### 🎵 **Pendant le jeu**
- **Musique** : `ambiance.mp3` (en boucle)
- **Volume** : 40%
- **Action** : Se lance quand on clique "🚀 COMMENCER"
- **Arrêt** : Game Over ou Victoire

### 👊 **Frappe de memecoin**
- **Son** : `coup.mp3`
- **Volume** : 70%
- **Action** : À chaque destruction de memecoin normal
- **Déclencheur** : Collision LFIST + Memecoin

### 🚨 **Trump coin détruit**
- **Son** : `sontrump.mp3`
- **Volume** : 90%
- **Action** : Quand on détruit un Trump coin (rare)
- **Bonus** : +500 points, +5 combo

### 🍺 **Power-up collecté**
- **Son** : `bonus.mp3`
- **Volume** : 80%
- **Action** : À chaque collecte de bière dorée
- **Effets** : Score, vie, combo ou slow motion

### 💨 **Son rot spécial**
- **Son** : `rot.mp3`
- **Volume** : 80%
- **Action** : Tous les 15 bonus collectés
- **Notification** : "🎉 X BONUS COLLECTÉS! 🎉"
- **Délai** : 500ms après le son bonus

## 🔧 CONFIGURATION TECHNIQUE

### 📊 Volumes optimisés :
```javascript
intro: 60%      // Pas trop fort au démarrage
ambiance: 40%   // En fond, ne doit pas gêner
coup: 70%       // Impact satisfaisant
sontrump: 90%   // RARE - doit être marquant
bonus: 80%      // Récompense positive
rot: 80%        // Effet comique spécial
```

### 🔄 Gestion des loops :
- **intro.mp3** : Boucle infinie sur l'écran menu
- **ambiance.mp3** : Boucle infinie pendant le jeu
- **Autres sons** : Lecture unique

### 🎯 Événements :
- **Audio activé** : Bouton "🔊 ACTIVER AUDIO" sur l'écran d'accueil
- **Logs debug** : Console avec émojis pour chaque son joué
- **Gestion d'erreur** : Fallback si fichiers manquants

## 🧪 TEST DES SONS

### ✅ Utiliser `test-audio.html` :
1. **Ouvrir** le fichier de test
2. **Cliquer** sur chaque bouton "▶️ Jouer"
3. **Vérifier** que tous les sons se chargent
4. **Résumé** affiché automatiquement

### 🎮 Test in-game :
1. **Lancer** le jeu principal
2. **Cliquer** "🔊 ACTIVER AUDIO" (obligatoire)
3. **Jouer** et vérifier chaque son :
   - Menu → Intro music
   - Jeu → Ambiance music
   - Frappe → Son coup
   - Trump → Son Trump + notification
   - Bonus → Son bonus
   - 15 bonus → Son rot

## 🔊 ACTIVATION AUDIO

### 📱 Navigateurs modernes :
Les navigateurs bloquent l'auto-play audio. Il faut :
1. **Interaction utilisateur** requise
2. **Bouton "ACTIVER AUDIO"** sur l'écran d'accueil
3. **Une fois activé** : tous les sons fonctionnent

### 🎯 Messages console :
```
🔄 Chargement des images...
✅ Audio chargé: intro (45s)
✅ Audio chargé: ambiance (120s)
🔊 Audio activé avec succès!
🔊 Playing sound: intro
🔊 Playing sound: ambiance
```

## 🚀 INTÉGRATION COMPLÈTE

Tous les sons sont maintenant **100% intégrés** dans :
- ✅ **HTML** : Éléments `<audio>` avec bons chemins
- ✅ **JavaScript** : Gestion complète avec logs
- ✅ **Jeu** : Déclencheurs appropriés
- ✅ **UI** : Bouton d'activation
- ✅ **Test** : Page de vérification

**Le jeu est prêt avec l'audio complet !** 🎉

---

## 🎮 COMMANDES RAPIDES

- **Test audio** : Ouvrir `test-audio.html`
- **Jeu complet** : Ouvrir `lfist-game.html`
- **Debug** : Console F12 pour voir les logs audio

🚀 **AMUSEZ-VOUS BIEN !** 🎵