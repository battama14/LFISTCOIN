// Mettre à jour l'état du Wallet
function updateWalletStatus(status, color) {
    document.getElementById("walletStatus").innerHTML = `<span style="color:${color};">${status}</span>`;
}

// Connexion Metamask
async function connectMetamask() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            updateWalletStatus("🟢 Connected: " + accounts[0], "green");
        } catch (error) {
            alert("Erreur : " + error.message);
        }
    } else {
        window.open("https://metamask.io/download.html", "_blank");
    }
}

// Connexion WalletConnect
async function connectWalletConnect() {
    try {
        const provider = new WalletConnectProvider({
            rpc: { 56: "https://bsc-dataseed.binance.org/" }
        });
        await provider.enable();
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        updateWalletStatus("🟢 Connected: " + accounts[0], "green");
    } catch (error) {
        alert("Erreur lors de la connexion à WalletConnect !");
    }
}

// Connexion Binance Wallet
async function connectBinance() {
    if (window.BinanceChain) {
        try {
            const accounts = await window.BinanceChain.request({ method: "eth_requestAccounts" });
            updateWalletStatus("🟢 Connected: " + accounts[0], "green");
        } catch (error) {
            alert("Erreur : " + error.message);
        }
    } else {
        window.open("https://www.binance.com/en/wallet-direct", "_blank");
    }
}

// Connexion BestWallet, Bitget, BingX, Uniswap, Coinbase via redirection
function connectWallet(walletName, walletUrl) {
    window.open(walletUrl, "_blank");
}

// Attribution des boutons de connexion aux wallets
document.querySelector(".wallet-btn[onclick='connectBestWallet()']").addEventListener("click", () => connectWallet("BestWallet", "https://bestwallet.io/connect"));
document.querySelector(".wallet-btn[onclick='connectBitget()']").addEventListener("click", () => connectWallet("Bitget", "https://bitget.com/wallet"));
document.querySelector(".wallet-btn[onclick='connectBingX()']").addEventListener("click", () => connectWallet("BingX", "https://bingx.com/wallet"));
document.querySelector(".wallet-btn[onclick='connectUniswap()']").addEventListener("click", () => connectWallet("Uniswap", "https://uniswap.org/connect"));
document.querySelector(".wallet-btn[onclick='connectCoinbase()']").addEventListener("click", () => connectWallet("Coinbase", "https://www.coinbase.com/connect"));

// Achat via Stripe
async function buyWithCard() {
    window.location.href = "https://checkout.stripe.com/pay/YOUR_STRIPE_LINK"; // Remplace par ton vrai lien Stripe
}

// Mettre à jour la capitalisation de marché en temps réel
async function updateMarketCap() {
    try {
        const response = await fetch("https://api.blockchain.com/lfist_market_cap");
        const data = await response.json();
        document.getElementById("marketCap").innerHTML = `${data.market_cap} LFIST`;
    } catch (error) {
        console.error("Erreur lors de la récupération de la capitalisation:", error);
    }
}

// Rafraîchir la capitalisation toutes les 5 secondes
setInterval(updateMarketCap, 5000);
updateMarketCap();

// Effet déroulant pour la FAQ
document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
        button.nextElementSibling.style.display = button.nextElementSibling.style.display === "block" ? "none" : "block";
    });
});
