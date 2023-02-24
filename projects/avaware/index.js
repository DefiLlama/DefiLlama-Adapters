const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const { sumTokens2 } = require("../helper/unwrapLPs");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const FarmPoolManager = "0x7ec4AeaeB57EcD237F35088D11C59525f7D631FE";
const treasuryAddress = "0x9300736E333233F515E585c26A5b868772392709";
const AVE = "0x78ea17559B3D2CF85a7F9C2C704eda119Db5E6dE";

/*** Staking of native token AVE TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = addr => 'avax:'+addr;

  await sumTokensAndLPsSharedOwners(
    balances,
    [[AVE, false]],
    [treasuryAddress],
    chainBlocks["avax"],
    "avax",
    transformAddress
  );

  return balances;
};

/*** farms TVL portion ***/
const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  const chain = 'avax'
  const block = chainBlocks[chain]

  const CountOfPools = (
    await sdk.api.abi.call({
      abi: abi.poolCount,
      target: FarmPoolManager,
      chain, block,
    })
  ).output;

  const indices = []

  for (let index = 0; index < CountOfPools; index++) {
    if (index == 14) {
      continue // 14 isn't a normal pool, it's NFT staking rewards
    }
    indices.push(index)
  }

  const { output: poolsRes } = await sdk.api.abi.multiCall({
    target: FarmPoolManager,
    abi: abi.getPool,
    calls: indices.map(i => ({ params: i })),
    chain, block,
  })
  const pools = poolsRes.map(i => i.output.pool)

  const { output: tokens } = await sdk.api.abi.multiCall({
    target: FarmPoolManager,
    abi: abi.stakingToken,
    calls: pools.map(i => ({ target: i })),
    chain, block,
  })
  const toa = []
  tokens.forEach(({ output, input: { target } }) => toa.push([output, target]))
  return sumTokens2({ tokensAndOwners: toa, chain, block, })
};

module.exports = {
  avax:{
    staking,
    tvl: avaxTvl,
  },
  methodology: `We count TVL that is on the Farms threw FarmPoolManager contract 
    and the portion of staking the native token (AVE) by treasury contract`,
};
