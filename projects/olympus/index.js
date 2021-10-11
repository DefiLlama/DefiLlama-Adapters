const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners, sumTokens, unwrapUniswapLPs } = require("../helper/unwrapLPs");
const abi = require('./abi.json')

const OlympusStakings = [
  // Old Staking Contract
  "0x0822F3C03dcc24d200AFF33493Dc08d0e1f274A2",
  // New Staking Contract
  "0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a",
];

const OHM = "0x383518188c0c6d7730d91b2c03a03c837814a899";

const treasuryAddresses = [
  // V1
  "0x886CE997aa9ee4F8c2282E182aB72A705762399D",
  // V2
  "0x31F8Cc382c9898b273eff4e0b7626a6987C846E8",
];

const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const OHM_DAI_SLP = "0x34d7d7aaf50ad4944b70b320acb24c95fa2def7c";
const FRAX = "0x853d955acef822db058eb8505911ed77f175b99e";
const OHM_FRAX_UNIV2 = "0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const LUSD = "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0"
const lusd_lp = "0xfdf12d1f85b5082877a6e070524f50f6c84faa6b"

/*** Staking of native token (OHM) TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  for (const stakings of OlympusStakings) {
    const stakingBalance = await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: OHM,
      params: stakings,
      block: ethBlock,
    });

    sdk.util.sumSingleBalance(balances, OHM, stakingBalance.output);
  }

  return balances;
};

const onsenAllocator = '0x0316508a1b5abf1CAe42912Dc2C8B9774b682fFC'
const sushiMasterchef = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd"
const convexAllocator = "0x408a9A09d97103022F53300A3A14Ca6c3FF867E8"

/*** Bonds TVL Portion (Treasury) ***
 * Treasury TVL consists of DAI, FRAX and WETH balances + Sushi SLP and UNI-V2 balances
 ***/
async function ethTvl(timestamp, block) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [DAI, false],
      [FRAX, false],
      [WETH, false],
      [OHM_DAI_SLP, true],
      [OHM_FRAX_UNIV2, true],
      [LUSD, false],
      [lusd_lp, true]
    ],
    treasuryAddresses,
    block
  );
  await sumTokens(balances, [
    ["0x028171bca77440897b824ca71d1c56cac55b68a3", "0x0e1177e47151be72e5992e0975000e73ab5fd9d4"]
  ], block)
  const fraxAllocated = await sdk.api.abi.call({
    target: convexAllocator,
    abi: abi.totalValueDeployed,
    block
  })
  sdk.util.sumSingleBalance(balances, FRAX, BigNumber(fraxAllocated.output).times(1e9).toFixed(0))
  const onsenLps = await sdk.api.abi.call({
    target: sushiMasterchef,
    block,
    abi: abi.userInfo,
    params: [185, onsenAllocator]
  })
  await unwrapUniswapLPs(balances, [{
    balance: onsenLps.output.amount,
    token: OHM_DAI_SLP
  }], block)

  return balances;
}

module.exports = {
  start: 1616569200, // March 24th, 2021
  ethereum: {
    tvl: ethTvl,
    staking
  },
  methodology:
    "Counts DAI, DAI SLP (OHM-DAI), FRAX, FRAX ULP (OHM-FRAX), WETH on the treasury",
};
