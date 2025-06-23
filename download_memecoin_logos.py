#!/usr/bin/env python3
"""
Script Python pour télécharger les logos des memecoins
Utilise l'API CoinGecko pour récupérer les images
"""

import requests
import os
import time
from urllib.parse import urlparse
from pathlib import Path

class MemecoinDownloader:
    def __init__(self, output_dir="memecoin_logos"):
        self.base_url = "https://api.coingecko.com/api/v3"
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()
        
    def search_coin(self, query):
        """Rechercher une cryptomonnaie par nom"""
        try:
            response = self.session.get(f"{self.base_url}/search", params={"query": query})
            response.raise_for_status()
            data = response.json()
            return data.get("coins", [])
        except requests.RequestException as e:
            print(f"Erreur lors de la recherche de {query}: {e}")
            return []
    
    def get_coin_details(self, coin_id):
        """Obtenir les détails d'une cryptomonnaie"""
        try:
            response = self.session.get(f"{self.base_url}/coins/{coin_id}")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Erreur lors de la récupération des détails de {coin_id}: {e}")
            return None
    
    def download_image(self, url, filename):
        """Télécharger une image depuis une URL"""
        try:
            response = self.session.get(url, stream=True)
            response.raise_for_status()
            
            filepath = self.output_dir / filename
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"✅ Téléchargé: {filename}")
            return True
        except requests.RequestException as e:
            print(f"❌ Erreur lors du téléchargement de {filename}: {e}")
            return False
    
    def download_coin_logo(self, coin_id, size="large"):
        """Télécharger le logo d'une cryptomonnaie"""
        coin_data = self.get_coin_details(coin_id)
        if not coin_data:
            return False
        
        image_url = coin_data.get("image", {}).get(size)
        if not image_url:
            print(f"❌ Pas d'image {size} disponible pour {coin_id}")
            return False
        
        # Déterminer l'extension du fichier
        parsed_url = urlparse(image_url)
        ext = os.path.splitext(parsed_url.path)[1] or '.png'
        filename = f"{coin_id}{ext}"
        
        return self.download_image(image_url, filename)
    
    def download_popular_memecoins(self):
        """Télécharger les logos des memecoins populaires"""
        popular_memecoins = [
            "dogecoin",
            "shiba-inu", 
            "pepe",
            "floki",
            "bonk",
            "wojak",
            "baby-doge-coin",
            "dogelon-mars",
            "akita-inu",
            "kishu-inu",
            "safemoon-2",
            "hoge-finance",
            "catecoin",
            "samoyedcoin",
            "meme",
            "doge-killer",
            "shibaswap"
        ]
        
        print(f"🚀 Téléchargement de {len(popular_memecoins)} logos de memecoins...")
        print(f"📁 Dossier de destination: {self.output_dir.absolute()}")
        print("-" * 50)
        
        success_count = 0
        for coin_id in popular_memecoins:
            print(f"📥 Téléchargement de {coin_id}...")
            if self.download_coin_logo(coin_id):
                success_count += 1
            time.sleep(0.5)  # Délai pour éviter de surcharger l'API
        
        print("-" * 50)
        print(f"✨ Terminé! {success_count}/{len(popular_memecoins)} logos téléchargés")
    
    def download_custom_list(self, coin_ids):
        """Télécharger une liste personnalisée de cryptomonnaies"""
        print(f"🚀 Téléchargement de {len(coin_ids)} logos personnalisés...")
        print(f"📁 Dossier de destination: {self.output_dir.absolute()}")
        print("-" * 50)
        
        success_count = 0
        for coin_id in coin_ids:
            print(f"📥 Téléchargement de {coin_id}...")
            if self.download_coin_logo(coin_id):
                success_count += 1
            time.sleep(0.5)
        
        print("-" * 50)
        print(f"✨ Terminé! {success_count}/{len(coin_ids)} logos téléchargés")
    
    def search_and_download(self, query, max_results=5):
        """Rechercher et télécharger les logos correspondant à une requête"""
        print(f"🔍 Recherche de '{query}'...")
        coins = self.search_coin(query)
        
        if not coins:
            print(f"❌ Aucune cryptomonnaie trouvée pour '{query}'")
            return
        
        print(f"📋 {len(coins)} résultats trouvés, téléchargement des {min(max_results, len(coins))} premiers...")
        print("-" * 50)
        
        success_count = 0
        for coin in coins[:max_results]:
            coin_id = coin.get("id")
            coin_name = coin.get("name")
            print(f"📥 Téléchargement de {coin_name} ({coin_id})...")
            if self.download_coin_logo(coin_id):
                success_count += 1
            time.sleep(0.5)
        
        print("-" * 50)
        print(f"✨ Terminé! {success_count}/{min(max_results, len(coins))} logos téléchargés")

def main():
    print("🎮 Téléchargeur de Logos Memecoin pour votre jeu")
    print("=" * 60)
    
    downloader = MemecoinDownloader()
    
    while True:
        print("\n📋 Options disponibles:")
        print("1. Télécharger les memecoins populaires")
        print("2. Rechercher et télécharger")
        print("3. Télécharger une liste personnalisée")
        print("4. Quitter")
        
        choice = input("\n🎯 Choisissez une option (1-4): ").strip()
        
        if choice == "1":
            downloader.download_popular_memecoins()
        
        elif choice == "2":
            query = input("🔍 Entrez votre recherche: ").strip()
            if query:
                max_results = input("📊 Nombre maximum de résultats (défaut: 5): ").strip()
                max_results = int(max_results) if max_results.isdigit() else 5
                downloader.search_and_download(query, max_results)
        
        elif choice == "3":
            print("📝 Entrez les IDs des cryptomonnaies séparés par des virgules")
            print("💡 Exemple: dogecoin,shiba-inu,pepe")
            coin_list = input("🎯 Liste: ").strip()
            if coin_list:
                coin_ids = [coin.strip() for coin in coin_list.split(",")]
                downloader.download_custom_list(coin_ids)
        
        elif choice == "4":
            print("👋 Au revoir!")
            break
        
        else:
            print("❌ Option invalide, veuillez choisir entre 1 et 4")

if __name__ == "__main__":
    main()