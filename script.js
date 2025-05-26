import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createClient } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

// Configuration RainbowKit
const { chains, provider } = configureChains([mainnet], [publicProvider()]);
const connectors = connectorsForWallets([
    {
        groupName: 'Popular Wallets',
        wallets: [
            { name: 'Metamask', id: 'metaMask' },
            { name: 'WalletConnect', id: 'walletConnect' },
            { name: 'Coinbase Wallet', id: 'coinbaseWallet' },
            { name: 'Binance Wallet', id: 'binanceWallet' },
        ],
    },
]);

// Création du client Wagmi
const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

// Connexion au wallet
async function connectWallet() {
    try {
        const { account } = await wagmiClient.connect();
        document.getElementById('walletStatus').innerHTML = `🟢 Connected: ${account}`;
        console.log('Wallet connecté :', account);
    } catch (error) {
        console.error('Échec de connexion au wallet :', error);
        alert('Erreur de connexion au wallet !');
    }
}

// Ajout du gestionnaire d'événement au bouton
document.getElementById('connectWallet').addEventListener('click', connectWallet);

// Achat via Stripe
async function buyWithCard() {
    window.location.href = "https://checkout.stripe.com/pay/YOUR_STRIPE_LINK"; // Remplace par ton vrai lien Stripe
}

// Mise à jour en temps réel du compteur de capitalisation
async function updateMarketCap() {
    try {
        const response = await fetch("https://api.blockchain.com/lfist_market_cap"); // Remplace par l'API réelle
        const data = await response.json();
        document.getElementById("marketCap").innerHTML = `${data.market_cap} LFIST`;
    } catch (error) {
        console.error("Erreur lors de la récupération de la capitalisation :", error);
    }
}
setInterval(updateMarketCap, 5000);

// Effet déroulant pour la FAQ
document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
        button.nextElementSibling.style.display = button.nextElementSibling.style.display === "block" ? "none" : "block";
    });
});

