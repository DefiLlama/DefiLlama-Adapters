const sdk = require("@defillama/sdk");
const { transformMetisAddress } = require("../helper/portedTokens");
const contracts = require('./contracts.json');

function tvl(chain) {
  return async (timestamp, block, chainBlocks) => {
    const transform = await transformMetisAddress()
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
};

module.exports = {
  metis: {
    tvl: tvl("metis"),
  },
};
