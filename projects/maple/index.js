const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const PoolFactory = "0x2Cd79F7f8b38B9c0D80EA6B230441841A31537eC";

const MapleTreasury = "0xa9466EaBd096449d650D5AEB0dD3dA6F52FD0B19";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

/*** Treasury ***/
const Treasury = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [[USDC, false]],
    [MapleTreasury],
    chainBlocks["ethereum"],
    "ethereum",
    addr => addr
  );

  return balances;
};

/*** Ethereum TVL Portions ***/
const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const poolsCreated = (
    await sdk.api.abi.call({
      abi: abi.poolsCreated,
      target: PoolFactory,
      block: ethBlock
    })
  ).output;

  for (let i = 0; i < poolsCreated; i++) {
    const pool = (
      await sdk.api.abi.call({
        abi: abi.pools,
        target: PoolFactory,
        params: i,
        block: ethBlock
      })
    ).output;

    const assetOfLiquidity = (
      await sdk.api.abi.call({
        abi: abi.liquidityAsset,
        target: pool,
        block: ethBlock
      })
    ).output;

    let totalSupply = (
      await sdk.api.abi.call({
        abi: abi.totalSupply,
        target: pool,
        block: ethBlock,
      })
    ).output;

    // We have two assets USDC and WETH, USDC is off by 12 digits because it only has 6 decimals unlike WETH which has 18, so this correction is needed
    if (assetOfLiquidity.toLowerCase() === USDC)
      totalSupply = totalSupply/ (10 ** 12);

    sdk.util.sumSingleBalance(balances, assetOfLiquidity, totalSupply);
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
    treasury: Treasury,
  },
  methodology:
    "We count liquidity by USDC deposited on the pools threw PoolFactory contract",
};
