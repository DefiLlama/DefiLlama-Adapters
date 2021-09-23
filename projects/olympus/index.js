const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

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
    ],
    treasuryAddresses,
    block
  );

  return balances;
}

module.exports = {
  start: 1616569200, // March 24th, 2021
  ethereum: {
    tvl: ethTvl,
  },
  staking: {
    tvl: staking,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "Counts DAI, DAI SLP (OHM-DAI), FRAX, FRAX ULP (OHM-FRAX), WETH on the treasury",
};
