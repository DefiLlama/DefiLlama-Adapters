const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");

const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformAvaxAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const FarmPoolManager = "0x7ec4AeaeB57EcD237F35088D11C59525f7D631FE";
const treasuryAddress = "0x9300736E333233F515E585c26A5b868772392709";
const AVE = "0x78ea17559B3D2CF85a7F9C2C704eda119Db5E6dE";

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

  const CountOfPools = (
    await sdk.api.abi.call({
      abi: abi.poolCount,
      target: FarmPoolManager,
      chain: "avax",
      block: chainBlocks["avax"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < CountOfPools; index++) {
    if (index == 14) {
      continue // 14 isn't a normal pool, it's NFT staking rewards
    }
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
        abi: erc20.balanceOf,
        target: stakingLpOrTokens,
        params: getPoolAddress,
        chain: "avax",
        block: chainBlocks["avax"],
      })
    ).output;

    if (index == 8) {
      sdk.util.sumSingleBalance(
        balances,
        `avax:${stakingLpOrTokens}`,
        balanceOfLpoOrToken
      );
    } else {
      lpPositions.push({
        token: stakingLpOrTokens,
        balance: balanceOfLpoOrToken,
      });
    }
  }

  const transformAddress = await transformAvaxAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["avax"],
    "avax",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking,
  },
  avalanche: {
    tvl: avaxTvl,
  },
  tvl: sdk.util.sumChainTvls([avaxTvl]),
  methodology: `We count TVL that is on the Farms threw FarmPoolManager contract 
    and the portion of staking the native token (AVE) by treasury contract`,
};
