const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformHecoAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const BoosterStakingChef_Heco = "0x7970234cDfa8898853Eaa1e2586cE933d9054af8";
const MdexStakingChef_Heco = "0x44aEfA01E92d170C915D87C2AB03D03cA49D5cb5";
const LavaStakingChef_heco = "0x9B948c946BE7F062D2075744142896F08D32a8A5";
const SushiStakingChef_Ethereum = "0x0503866eD9F304Ec564F145d22994F7f11838596";

const treasuryAddress = "0xB3FC6B9be3AD6b2917d304d4F5645a311bCFd0A8";
const erc20Tokens = [
  //MDX
  "0x25d2e80cb6b86881fd7e07dd263fb79f4abe033c",
  //BOO
  "0xff96dccf2763d512b6038dc60b7e96d1a9142507",
];

const calcTvl = async (balances, chain, block, poolInfo, StakingChef) => {
  const lengthOfPool = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: StakingChef,
      chain,
      block,
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < lengthOfPool; index++) {
    const lpTokens = (
      await sdk.api.abi.call({
        abi: poolInfo,
        target: StakingChef,
        params: index,
        chain,
        block,
      })
    ).output.lpToken;

    const lpTokens_Bal = (
      await sdk.api.abi.call({
        abi: poolInfo,
        target: StakingChef,
        params: index,
        chain,
        block,
      })
    ).output.lpBalance;

    lpPositions.push({
      token: lpTokens,
      balance: lpTokens_Bal,
    });
  }

  const transformAddress = await transformHecoAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    chain == "heco" ? transformAddress : (addr) => addr
  );
};

/*** Treasury ***/
const Treasury = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformHecoAddress();

  for (const token of erc20Tokens) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[token, false]],
      [treasuryAddress],
      chainBlocks["heco"],
      "heco",
      transformAddress
    );
  }
  return balances;
};

/*** Heco TVL Portion ***/
const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  //  --- Staking on Booster Protcol ---
  await calcTvl(
    balances,
    "heco",
    chainBlocks["heco"],
    abi.poolInfoA,
    BoosterStakingChef_Heco
  );

  //  --- Staking on Mdex Protcol ---
  await calcTvl(
    balances,
    "heco",
    chainBlocks["heco"],
    abi.poolInfoB,
    MdexStakingChef_Heco
  );

  //  --- Staking on Lava Protcol ---
  await calcTvl(
    balances,
    "heco",
    chainBlocks["heco"],
    abi.poolInfoB,
    LavaStakingChef_heco
  );

  return balances;
};

/*** Ethereum TVL Portion ***/
const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  //  --- Staking on SushiSwap Protcol ---
  await calcTvl(
    balances,
    "ethereum",
    chainBlocks["ethereum"],
    abi.poolInfoB,
    SushiStakingChef_Ethereum
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  treasury: {
    tvl: Treasury,
  },
  ethereum: {
    tvl: ethTvl,
  },
  heco: {
    tvl: hecoTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl, hecoTvl]),
  methodology: `We count TVL on the pools (LP tokens), that are staking in other protocolos as Booster, Mdex and Lava on Heco Network
   and SushiSwap  on Ethereum Network,threw their correspondent MasterChef contracts; and Treasury part separated`,
};
