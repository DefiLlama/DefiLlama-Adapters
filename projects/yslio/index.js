const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");

const masterChefContract = "0xEE7Bc7727436D839634845766f567fa354ba8C56";

const bscTvl = async (chainBlocks) => {
  const balances = {};

  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: masterChefContract,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLength; index++) {
    const strat = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: masterChefContract,
        params: index,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output.strat;

    const lpToken = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: masterChefContract,
        params: index,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output.lpToken;
    
    const strat_bal = (
      await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        target: lpToken,
        params: strat,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;
    
    const symbol = (
      await sdk.api.abi.call({
        abi: abi.symbol,
        target: lpToken,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    if (symbol.includes("LP")) {
      lpPositions.push({
        token: lpToken,
        balance: strat_bal,
      });
    } else {
      sdk.util.sumSingleBalance(balances, `bsc:${lpToken}`, strat_bal);
    }
  }
  const transformAddress = await transformBscAddress();
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );

  delete balances["bsc:0x95e7c70b58790a1cbd377bc403cd7e9be7e0afb1"]
  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  methodology:
    "We count liquidity on the Strategies (Vaults) through MasterChef contracts",
};
