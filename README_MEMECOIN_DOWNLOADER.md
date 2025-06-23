# 🚀 Téléchargeur de Logos Memecoin

Ce projet contient deux outils pour télécharger facilement les logos des memecoins pour votre jeu.

## 🌐 Version Web (Recommandée)

### Fichier: `memecoin-downloader.html`

**Avantages:**
- Interface graphique intuitive
- Pas d'installation requise
- Fonctionne directement dans le navigateur
- Prévisualisation des images
- Sélection multiple
- Téléchargement en lot

**Comment utiliser:**
1. Ouvrez `memecoin-downloader.html` dans votre navigateur
2. Utilisez la barre de recherche ou cliquez sur les memecoins populaires
3. Sélectionnez les logos que vous voulez télécharger
4. Cliquez sur "Télécharger Sélectionnés" ou téléchargez individuellement

**Fonctionnalités:**
- 🔍 Recherche par nom de cryptomonnaie
- 🔥 Accès rapide aux memecoins populaires
- ✅ Sélection multiple avec compteur
- 📥 Téléchargement individuel ou en lot
- 🖼️ Prévisualisation des images
- 📱 Interface responsive (mobile-friendly)

## 🐍 Version Python

### Fichier: `download_memecoin_logos.py`

**Avantages:**
- Téléchargement automatisé
- Traitement en lot
- Contrôle programmatique
- Gestion d'erreurs avancée

**Installation des dépendances:**
```bash
pip install requests
```

**Comment utiliser:**
```bash
python download_memecoin_logos.py
```

**Options disponibles:**
1. **Memecoins populaires**: Télécharge automatiquement les logos des memecoins les plus connus
2. **Recherche personnalisée**: Recherche et télécharge selon vos critères
3. **Liste personnalisée**: Télécharge une liste spécifique d'IDs de cryptomonnaies

## 📁 Organisation des fichiers

Les logos téléchargés seront sauvegardés dans:
- **Version Web**: Dossier de téléchargements par défaut de votre navigateur
- **Version Python**: Dossier `memecoin_logos/` dans le répertoire du script

## 🎮 Intégration dans votre jeu

### Format des fichiers
- **Format**: PNG (recommandé) ou JPG
- **Taille**: Images haute résolution (généralement 200x200px ou plus)
- **Nommage**: `nom-de-la-cryptomonnaie.png` (ex: `dogecoin.png`)

### Exemple d'intégration JavaScript
```javascript
// Dans votre jeu, vous pouvez charger les logos comme ceci:
const memecoinLogos = {
  doge: new Image(),
  shiba: new Image(),
  pepe: new Image()
};

memecoinLogos.doge.src = 'memecoin_logos/dogecoin.png';
memecoinLogos.shiba.src = 'memecoin_logos/shiba-inu.png';
memecoinLogos.pepe.src = 'memecoin_logos/pepe.png';
```

## 🔧 Memecoins populaires inclus

- 🐕 **Dogecoin** - Le memecoin original
- 🐕 **Shiba Inu** - Le "Dogecoin killer"
- 🐸 **Pepe** - Basé sur le mème Pepe the Frog
- 🐕 **Floki** - Inspiré par le chien d'Elon Musk
- 🔨 **Bonk** - Memecoin populaire sur Solana
- 😐 **Wojak** - Basé sur le mème Wojak
- 🐕 **Baby Doge** - Version "bébé" de Dogecoin
- 🚀 **Dogelon Mars** - Thème spatial
- 🐕 **Akita Inu** - Autre race de chien japonais
- 💎 **Kishu Inu** - Memecoin communautaire

## 🛠️ Personnalisation

### Modifier la liste des memecoins populaires
Dans le fichier HTML, modifiez la section `popular-coins`:
```html
<div class="popular-coin" onclick="searchSpecific('votre-coin-id')">🎯 Votre Coin</div>
```

Dans le fichier Python, modifiez la liste `popular_memecoins`:
```python
popular_memecoins = [
    "votre-coin-id",
    "autre-coin-id"
]
```

### Changer la taille des images
Par défaut, les images "large" sont téléchargées. Vous pouvez modifier cela:
- `thumb`: 32x32px
- `small`: 64x64px  
- `large`: 200x200px ou plus

## 🚨 Limitations et conseils

### Limites de l'API CoinGecko
- **Gratuite**: 50 appels par minute
- **Pas d'authentification**: Requise pour usage basique
- **Disponibilité**: Dépend de la disponibilité de l'API

### Conseils d'utilisation
1. **Testez d'abord**: Utilisez la version web pour voir les images disponibles
2. **Sauvegardez**: Gardez une copie locale des logos téléchargés
3. **Optimisez**: Redimensionnez les images selon vos besoins de jeu
4. **Respectez les limites**: Ne faites pas trop de requêtes simultanées

## 🎨 Optimisation pour le jeu

### Redimensionnement recommandé
Pour votre jeu, vous pourriez vouloir redimensionner les images:
```javascript
// Exemple de redimensionnement avec Canvas
function resizeImage(img, width, height) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
}
```

### Format optimal
- **PNG**: Pour la transparence (recommandé)
- **JPG**: Pour des fichiers plus petits
- **WebP**: Pour une compression optimale (navigateurs modernes)

## 🆘 Dépannage

### Problèmes courants
1. **Images ne se chargent pas**: Vérifiez votre connexion internet
2. **Téléchargement bloqué**: Autorisez les téléchargements multiples dans votre navigateur
3. **API indisponible**: Réessayez plus tard ou utilisez un VPN

### Support
- Vérifiez la console du navigateur pour les erreurs
- L'API CoinGecko peut parfois être lente ou indisponible
- Certaines cryptomonnaies peuvent ne pas avoir d'images disponibles

## 📄 Licence et utilisation

- **API CoinGecko**: Gratuite pour usage personnel
- **Images**: Propriété de leurs créateurs respectifs
- **Code**: Libre d'utilisation pour votre projet de jeu

---

🎮 **Bon développement de jeu !** 🚀