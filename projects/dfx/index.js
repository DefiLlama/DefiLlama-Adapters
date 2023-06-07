const sdk = require("@defillama/sdk");
const {
  transformPolygonAddress,
  transformArbitrumAddress,
} = require("../helper/portedTokens");
const contracts = require("./contracts.json");

// node test.js projects/dfx/index.js
function tvl(chain) {
  return async (timestamp, block, chainBlocks) => {
    let transform;
    switch (chain) {
      case "polygon":
        transform = await transformPolygonAddress();
        break;
      case "arbitrum":
        transform = await transformArbitrumAddress();
        break;
      default:
        transform = (a) => a;
    }

    const balances = {};

    const [tokenBalances, usdcBalances] = await Promise.all([
      sdk.api.abi.multiCall({
        calls: contracts[chain].map((c) => ({
          target: c.token,
          params: [c.address],
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks[chain],
        chain,
      }),

      sdk.api.abi.multiCall({
        calls: contracts[chain].map((c) => ({
          target: contracts.usdc[chain],
          params: [c.address],
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks[chain],
        chain,
      }),
    ]);

    await Promise.all([
      sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform),
      sdk.util.sumMultiBalanceOf(balances, usdcBalances, true, transform),
    ]);

    return balances;
  };
}

module.exports = {
  ethereum: {
    tvl: tvl("ethereum"),
  },
  polygon: {
    tvl: tvl("polygon"),
  },
  arbitrum: {
    tvl: tvl("arbitrum"),
  },
  hallmarks: [[1667955600, "Hack"]],
};
