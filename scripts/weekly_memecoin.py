import json
import random
import requests
import os

# Liste de memecoins fictifs ou récupérables via API (ici simulée)
memecoins = [
    {
        "name": "BRIBITE",
        "symbol": "BRBT",
        "website": "https://bribite.io",
        "twitter": "https://twitter.com/bribitetoken",
        "logo": "https://bribite.io/logo.png"
    },
    {
        "name": "DOGEGOD",
        "symbol": "DGOD",
        "website": None,
        "twitter": None,
        "logo": None
    },
    {
        "name": "PEPEKING",
        "symbol": "PEPK",
        "website": "https://pepeking.org",
        "twitter": None,
        "logo": "https://pepeking.org/logo.png"
    }
]

# Choisir un memecoin aléatoire
selected = random.choice(memecoins)

# Vérifie s’il a un logo ou une mascotte
if selected["logo"]:
    image_url = selected["logo"]
else:
    image_url = "assets/images/default.png"  # image locale sur GitHub Pages

# Préparer les données
data = {
    "name": selected["name"],
    "symbol": selected["symbol"],
    "website": selected["website"],
    "twitter": selected["twitter"],
    "image": image_url,
    "description": f"{selected['name']} est un memecoin aléatoire sélectionné par FIST-DETECTOR."
}

# Sauvegarder dans data/memecoin.json
os.makedirs("data", exist_ok=True)
with open("data/memecoin.json", "w") as f:
    json.dump(data, f, indent=4)

