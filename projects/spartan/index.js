const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");

const poolFactory = "0x2C577706579E08A88bd30df0Fd7A5778A707c3AD";
const SPARTA_BASE = "0x3910db0600eA925F63C36DdB1351aB6E2c6eb102";

const Pool2 = async (chainBlocks) => {
  const balances = {};

  const pools = (
    await sdk.api.abi.call({
      abi: abi.getPoolAssets,
      target: poolFactory,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  for (const pool of pools) {
    const getToken = (
      await sdk.api.abi.call({
        abi: abi.TOKEN,
        target: pool,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    const getBaseBalance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: SPARTA_BASE,
        params: pool,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    const getTokenBalance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: getToken,
        params: pool,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    sdk.util.sumSingleBalance(balances, `bsc:${SPARTA_BASE}`, getBaseBalance);
    sdk.util.sumSingleBalance(balances, `bsc:${getToken}`, getTokenBalance);
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    pool2: Pool2,
    tvl: (async) => ({}),
  },
  methodology: "Counts liquidity on all the Pools (Pool2s) through PoolFactory Contract",
};
