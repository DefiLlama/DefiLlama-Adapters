const sdk = require("@defillama/sdk");
const { transformPolygonAddress } = require("../helper/portedTokens");
const contracts = require('./contracts.json');

// node test.js projects/dfx/index.js
function tvl(chain) {
  return async (timestamp, block, chainBlocks) => {
    const transform =
      chain == "polygon" ? await transformPolygonAddress() : (a) => a;
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
  hallmarks: [1667955600, "Hack"]
};
