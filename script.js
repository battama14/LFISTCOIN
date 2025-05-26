import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

// Configuration Web3Modal pour gérer tous les wallets
const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: { 56: "https://bsc-dataseed.binance.org/" }
        }
    }
};

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
});

// Connexion au wallet
async function connectWallet() {
    try {
        const provider = await web3Modal.connect();
        const web3 = new ethers.providers.Web3Provider(provider);
        const accounts = await web3.listAccounts();
        document.getElementById("walletStatus").innerHTML = `🟢 Connected: ${accounts[0]}`;
        console.log("Wallet connecté :", accounts[0]);
    } catch (error) {
        console.error("Échec de connexion au wallet :", error);
        alert("Erreur de connexion au wallet !");
    }
}

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
