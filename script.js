// Wallet Status
function updateWalletStatus(status, color) {
    document.getElementById("walletStatus").innerHTML = `<span style="color:${color};">${status}</span>`;
}

// Connect Wallets
async function connectMetamask() {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        updateWalletStatus("🟢 Connected: " + accounts[0], "green");
    } else {
        alert("Metamask is not installed!");
    }
}

// Buy Tokens
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

// FAQ Toggle
document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
        button.nextElementSibling.style.display = button.nextElementSibling.style.display === "block" ? "none" : "block";
    });
});










