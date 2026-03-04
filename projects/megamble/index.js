
const ADDRESSES = require("../helper/coreAssets.json");

const GAME_CONTRACT = "0x051B5a8B20F3e49E073Cf7A37F4fE2e5117Af3b6";

async function tvl(api) {
  // TVL = ETH held in the game contract (active pot + credits)
  const ethBalance = await api.call({
    abi: "function getGameInfo() view returns (uint256 roundId, uint256 potAmount, uint256 clickCount, uint256 endTime, address lastClicker, bool isActive)",
    target: GAME_CONTRACT,
  });

  // potAmount is the current pot size in wei
  api.add(ADDRESSES.null, ethBalance.potAmount);

  // Also count any remaining ETH in contract (credits, treasury not yet withdrawn)
  const contractBalance = await api.eth2.getBalance(GAME_CONTRACT);
  // Use the larger of pot or full balance to avoid double counting
  // Actually just use sumTokensExport for simplicity
}

// Simpler approach: just count all ETH in the game contract
async function tvlSimple(api) {
  return api.sumTokens({
    owners: [GAME_CONTRACT],
    tokens: [ADDRESSES.null], // null = native ETH
  });
}

module.exports = {
  methodology: "TVL is the ETH held in the Megamble game contract, including the active pot and player credits.",
  megaeth: {
    tvl: tvlSimple,
  },
};
