const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const empyreanStaking = "0xD080CBc2885c64510923Ac6F5c8896011f86a6aF";
const EMPYR = "0xE9F226a228Eb58d408FdB94c3ED5A18AF6968fE1";

const treasuryAddress = "0x4606f4e6D43d501b86Fc583f44ae27097A1F9EA7";
const USDC = ADDRESSES.aurora.USDC_e;
const EMPYR_USDC_TLP = "0x6e46c69FE35eF5BB78D7f35d92645C74245a6567";

/*** Bonds TVL Portion (Treasury) ***
 * Treasury TVL consists of USDC and Trisolaris TLP balances
 ***/
async function auroraTvl(timestamp, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [USDC, false],
      [EMPYR_USDC_TLP, true],
    ],
    [treasuryAddress],
    chainBlocks["aurora"],
    "aurora",
    (addr) => `aurora:${addr}`
  );

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  aurora: {
    staking: staking(empyreanStaking, EMPYR),
    tvl: auroraTvl,
  },
  methodology:
    "Counts USDC and TLP (EMPYR-USDC) on the treasury",
};


module.exports.deadFrom = '2022-05-09'