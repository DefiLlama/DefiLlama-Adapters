const sdk = require("@defillama/sdk");
const { transformMetisAddress } = require("../helper/portedTokens");
const contracts = require('./contracts.json');

const { compoundExports } = require("../helper/compound");
const comptroller = "0xB6ef08Ffbbb0691a3D9E6c41db4b1d2F97D8D49a";

//tvl for drachma farm
const { tvl: drachmaTvl, borrowed: drachmaBorrowed } = compoundExports(
  comptroller,
  "metis"
);

//tvl for drachma app
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
  timetravel: true,
  incentivized: true,
  misrepresentedTokens: true,
  metis: {
    tvl: sdk.util.sumChainTvls([drachmaTvl, tvl("metis")]),
    borrowed: drachmaBorrowed,
  },
};
