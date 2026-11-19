const { post } = require('../../helper/http');

async function getTvl(vaultAddress) {
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
}

module.exports = {
  getTvl
};

