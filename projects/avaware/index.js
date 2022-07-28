const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
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
  const balances = {};
  const transformAddress = await transformAvaxAddress();

  const CountOfPools = (
    await sdk.api.abi.call({
      abi: abi.poolCount,
      target: FarmPoolManager,
      chain: "avax",
      block: chainBlocks["avax"],
    })
  ).output;

  const lpPositions = [];
  const promises = []

  for (let index = 0; index < CountOfPools; index++) {
    if (index == 14) {
      continue // 14 isn't a normal pool, it's NFT staking rewards
    }

    promises.push((async () => {
      const getPoolAddress = (
        await sdk.api.abi.call({
          abi: abi.getPool,
          target: FarmPoolManager,
          params: index,
          chain: "avax",
          block: chainBlocks["avax"],
        })
      ).output.pool;

      const stakingLpOrTokens = (
        await sdk.api.abi.call({
          abi: abi.stakingToken,
          target: getPoolAddress,
          chain: "avax",
          block: chainBlocks["avax"],
        })
      ).output;

      const balanceOfLpoOrToken = (
        await sdk.api.abi.call({
          abi: 'erc20:balanceOf',
          target: stakingLpOrTokens,
          params: getPoolAddress,
          chain: "avax",
          block: chainBlocks["avax"],
        })
      ).output;

      if (index == 8) {
        sdk.util.sumSingleBalance(
          balances,
          transformAddress(stakingLpOrTokens),
          balanceOfLpoOrToken
        );
      } else {
        if (malformedLPTokens.includes(stakingLpOrTokens.toLowerCase()))
          return;
        lpPositions.push({
          token: stakingLpOrTokens,
          balance: balanceOfLpoOrToken,
        });
      }
    })())
  }

  await Promise.all(promises)


  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["avax"],
    "avax",
    transformAddress,
    undefined,
    undefined,
    undefined,
    { skipFailingLPs: true }
  );

  return balances;
};

module.exports = {
  timetravel: true,
  avalanche: {
    staking,
    tvl: avaxTvl,
  },
  methodology: `We count TVL that is on the Farms threw FarmPoolManager contract 
    and the portion of staking the native token (AVE) by treasury contract`,
};
