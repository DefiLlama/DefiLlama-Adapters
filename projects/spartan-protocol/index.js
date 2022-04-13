const sdk = require("@defillama/sdk");

const factoryAbi = require("./abis/PoolFactory.json");

const factory = "0x2C577706579E08A88bd30df0Fd7A5778A707c3AD";
const sparta = "0x3910db0600eA925F63C36DdB1351aB6E2c6eb102";

async function tvl(timestamp, ethBlock, chainBlocks) {
  let tokens = await sdk.api.abi.call({
    target: factory,
    abi: factoryAbi["getTokenAssets"],
    block: chainBlocks.bsc,
    params: [],
    chain: "bsc",
  }); // Get listed token array
  tokens = tokens.output;

  let balances = {}; // Setup the balances object
  for (let i = 0; i < tokens.length; i++) {
    const poolAddress = sdk.api.abi.call({
      target: factory,
      abi: factoryAbi["getPool"],
      block: chainBlocks.bsc,
      params: [tokens[i]],
      chain: "bsc",
    }); // PoolFactory.getPool(tokenAddr)

    const tokenBal = sdk.api.erc20.balanceOf({
      target: tokens[i],
      owner: (await poolAddress).output,
      chain: "bsc",
      block: chainBlocks.bsc,
    }); // Pool's token balance
    const spartaBal = sdk.api.erc20.balanceOf({
      target: sparta,
      owner: (await poolAddress).output,
      chain: "bsc",
      block: chainBlocks.bsc,
    }); // Pool's sparta balance

    sdk.util.sumSingleBalance(balances, `bsc:${tokens[i]}`, (await tokenBal).output)
    sdk.util.sumSingleBalance(balances, `bsc:${sparta}`, (await spartaBal).output)
  }

  return balances;
}

module.exports = {
  methodology:
    "We count only the liquidity in the V2 pools. We do not include anything staked in the vaults nor any liquidity in the V1 pools.",
  bsc: {
    tvl,
  },
};
