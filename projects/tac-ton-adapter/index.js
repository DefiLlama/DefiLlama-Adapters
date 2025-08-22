const { getTonBalance } = require("../helper/chain/ton");

async function tvl() {
  const contractAddress = "EQAgpWmO8nBUrmfOOldIEmRkLEwV-IIfVAlJsphYswnuL80R";

  try {
    const balanceNanoTon = await getTonBalance(contractAddress);
    const balanceTon = parseInt(balanceNanoTon) / 1e9; 

    return {
      "coingecko:the-open-network": balanceTon,
    };
  } catch (error) {
    console.error("Error fetching TAC contract balance:", error.message);
    return {
      "coingecko:the-open-network": 0,
    };
  }
}

module.exports = {
  methodology:
    "Counts the TON tokens held in the TAC (TON Adapter) cross-chain layer contract.",
  timetravel: false,
  ton: {
    tvl,
  },
};
