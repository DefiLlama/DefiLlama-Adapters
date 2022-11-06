const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const { sumTokens2 } = require("../helper/unwrapLPs");
const { transformAvaxAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const FarmPoolManager = "0x7ec4AeaeB57EcD237F35088D11C59525f7D631FE";
const treasuryAddress = "0x9300736E333233F515E585c26A5b868772392709";
const AVE = "0x78ea17559B3D2CF85a7F9C2C704eda119Db5E6dE";

const malformedLPTokens = [
  '0x75AB49DfF2649b2c7C5d1519fBabA89Ea57a4ef6',
  '0x2af262DD90bd2D124E95Fc778D9c85aA03734Ff2',
  '0xE5403978fF8AD2B0a007F330f6235F7250F54a6C',
  '0x91934e4fA7E2D25DF2FA132a4aAFEFE929751224',
  '0xac2d6DBE97de8C0363FfCeA77b701c8Ffc4D2F3b',
  '0x00EE200Df31b869a321B10400Da10b561F3ee60d',
].map(token => token.toLowerCase())

/*** Staking of native token AVE TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformAvaxAddress();

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
  return sumTokens2({ tokensAndOwners: toa, chain, block, resolveLP: true, })
};

module.exports = {
  timetravel: true,
  avax:{
    staking,
    tvl: avaxTvl,
  },
  methodology: `We count TVL that is on the Farms threw FarmPoolManager contract 
    and the portion of staking the native token (AVE) by treasury contract`,
};
