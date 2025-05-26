// Web3 Wallet Connection
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            alert("Wallet connected! Address: " + accounts[0]);
        } catch (error) {
            alert("Failed to connect wallet: " + error.message);
        }
    } else {
        alert("Metamask is not installed!");
    }
}

// Buying LFIST with ETH
async function buyWithCrypto() {
    if (!window.ethereum) {
        alert("Connect your wallet first!");
        return;
    }
    
    const web3 = new Web3(window.ethereum);
    const contractAddress = "0xTON_CONTRACT_ADDRESS"; // Remplace par ton adresse de contrat
    const contractABI = [ /* Ton ABI ici */ ]; // Remplace par l'ABI de ton contrat
    
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    
    try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        await contract.methods.buyTokens().send({ from: accounts[0], value: web3.utils.toWei("0.1", "ether") });
        alert("Purchase successful!");
    } catch (error) {
        alert("Transaction failed: " + error.message);
    }
}

// Buying LFIST with Card (via Stripe)
async function buyWithCard() {
    window.location.href = "https://checkout.stripe.com/pay/YOUR_STRIPE_LINK"; // Remplace par ton lien Stripe
}

// Market Capitalization Counter
async function updateMarketCap() {
    const response = await fetch("https://api.blockchain.com/lfist_market_cap"); // Example API
    const data = await response.json();
    document.getElementById("marketCap").innerHTML = `${data.market_cap} LFIST`;
}

setInterval(updateMarketCap, 5000);
updateMarketCap();







