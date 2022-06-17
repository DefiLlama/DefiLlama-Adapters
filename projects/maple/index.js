const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokensAndLPsSharedOwners, sumTokens2 } = require("../helper/unwrapLPs");
const { staking, } = require("../helper/staking")

const PoolFactory = "0x2Cd79F7f8b38B9c0D80EA6B230441841A31537eC";

const MapleTreasury = "0xa9466EaBd096449d650D5AEB0dD3dA6F52FD0B19";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const chain = 'ethereum'

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
const ethTvl = async (timestamp, block) => {
  const poolsCreated = (
    await sdk.api.abi.call({
      abi: abi.poolsCreated,
      target: PoolFactory,
      block
    })
  ).output;
  const calls = []

  for (let i = 0; i < poolsCreated; i++)
    calls.push({ params: i })
  
  const { output: pools } = await sdk.api.abi.multiCall({
    target: PoolFactory,
    abi: abi.pools,
    calls,
    chain, block,
  })

  const { output: assetOfLiquidity } = await sdk.api.abi.multiCall({
    abi: abi.liquidityAsset,
    calls: pools.map(i => ({ target: i.output })),
    chain, block,
  })

  const { output: locker } = await sdk.api.abi.multiCall({
    abi: abi.liquidityLocker,
    calls: pools.map(i => ({ target: i.output })),
    chain, block,
  })

  const toa = assetOfLiquidity.map(({ output }, i) => [output, locker[i].output])

  return sumTokens2({ tokensAndOwners: toa, block})
};


const borrowed = async (timestamp, block) => {
  const poolsCreated = (
    await sdk.api.abi.call({
      abi: abi.poolsCreated,
      target: PoolFactory,
      block
    })
  ).output;
  const calls = []

  for (let i = 0; i < poolsCreated; i++)
    calls.push({ params: i })
  
  const { output: pools } = await sdk.api.abi.multiCall({
    target: PoolFactory,
    abi: abi.pools,
    calls,
    chain, block,
  })

  const { output: assetOfLiquidity } = await sdk.api.abi.multiCall({
    abi: abi.liquidityAsset,
    calls: pools.map(i => ({ target: i.output })),
    chain, block,
  })

  const { output: principalOut } = await sdk.api.abi.multiCall({
    abi: abi.principalOut,
    calls: pools.map(i => ({ target: i.output })),
    chain, block,
  })

  const balances = {}
  assetOfLiquidity.forEach(({ output}, i) => sdk.util.sumSingleBalance(balances, output, principalOut[i].output))
  return balances
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
    treasury: Treasury,
    staking: staking('0x4937a209d4cdbd3ecd48857277cfd4da4d82914c', '0x33349b282065b0284d756f0577fb39c158f935e6'),
    borrowed,
  },
  methodology:
    "We count liquidity by USDC deposited on the pools through PoolFactory contract",
};
