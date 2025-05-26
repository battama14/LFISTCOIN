// Connecter Metamask
async function connectMetamask() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            alert("Metamask Connected: " + accounts[0]);
        } catch (error) {
            alert("Error: " + error.message);
        }
    } else {
        alert("Metamask is not installed!");
    }
}

// Connecter WalletConnect
async function connectWalletConnect() {
    const provider = new WalletConnectProvider({
        rpc: { 56: "https://bsc-dataseed.binance.org/" }
    });
    await provider.enable();
    const web3 = new Web3(provider);
    alert("WalletConnect enabled!");
}

// Connecter Binance Wallet
async function connectBinance() {
    if (window.BinanceChain) {
        try {
            const accounts = await window.BinanceChain.request({ method: "eth_requestAccounts" });
            alert("Binance Wallet Connected: " + accounts[0]);
        } catch (error) {
            alert("Error: " + error.message);
        }
    } else {
        alert("Binance Wallet is not installed!");
    }
}

// Ajouter support pour BestWallet, Bitget, BingX, Uniswap, Coinbase
async function connectWallet(walletName) {
    alert(walletName + " support coming soon!");
}

// Acheter avec carte (via Stripe)
async function buyWithCard() {
    window.location.href = "https://checkout.stripe.com/pay/YOUR_STRIPE_LINK";
}

// Market Capitalization Counter
async function updateMarketCap() {
    const response = await fetch("https://api.blockchain.com/lfist_market_cap");
    const data = await response.json();
    document.getElementById("marketCap").innerHTML = `${data.market_cap} LFIST`;
}

setInterval(updateMarketCap, 5000);
updateMarketCap();








