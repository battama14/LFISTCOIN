// Update Wallet Status Icon
function updateWalletStatus(status, color) {
    document.getElementById("walletStatus").innerHTML = `<span style="color:${color};">${status}</span>`;
}

// Connect Wallets
async function connectMetamask() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            updateWalletStatus("🟢 Connected: " + accounts[0], "green");
        } catch (error) {
            alert("Error: " + error.message);
        }
    } else {
        alert("Metamask is not installed!");
    }
}

async function connectWalletConnect() {
    const provider = new WalletConnectProvider({ rpc: { 56: "https://bsc-dataseed.binance.org/" } });
    await provider.enable();
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    updateWalletStatus("🟢 Connected: " + accounts[0], "green");
}

async function connectBinance() {
    if (window.BinanceChain) {
        try {
            const accounts = await window.BinanceChain.request({ method: "eth_requestAccounts" });
            updateWalletStatus("🟢 Connected: " + accounts[0], "green");
        } catch (error) {
            alert("Error: " + error.message);
        }
    } else {
        alert("Binance Wallet is not installed!");
    }
}

// Buy Tokens
async function buyWithCrypto() {
    alert("Buying LFIST with ETH...");
}

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









