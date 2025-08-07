const { post } = require('../../helper/http');

async function getTvl(vaultAddress) {
  try {
    const data = await post(
      "https://api.hyperliquid.xyz/info",
      {
        type: "vaultDetails",
        vaultAddress,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const accountValueHistory = data.portfolio[0][1].accountValueHistory;
    const dp = 1e6;
    return Number(accountValueHistory[accountValueHistory.length - 1][1]) * dp;
  } catch (error) {
    console.error("Error in getTvl:", error.message);
    console.error("Full error:", error);
    return 0;
  }
}

module.exports = {
  getTvl
};
