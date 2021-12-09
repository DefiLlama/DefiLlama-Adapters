
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners, sumSingleBalance } = require("../helper/unwrapLPs");
const abi = require('./abi.json')

const LuxorStaking = "0xf3F0BCFd430085e198466cdCA4Db8C2Af47f0802";

const LUX = "0x6671E20b83Ba463F270c8c75dAe57e3Cc246cB2b";

const treasuryAddresses =  "0xDF2A28Cc2878422354A93fEb05B41Bd57d71DB24";

const DAI = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e";
const LUX_DAI = "0x46729c2AeeabE7774a0E710867df80a6E19Ef851";
const WFTM = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";

/*** Staking of native token (LUX) TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  for (const stakings of LuxorStaking) {
    const stakingBalance = await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: LUX,
      params: stakings,
      block: ethBlock,
    });

    sdk.util.sumSingleBalance(balances, LUX, stakingBalance.output);
  }

  return balances;
};

/*** Bonds TVL Portion (Treasury) ***
 * Treasury TVL consists of DAI, and WFTM balances + LP balances
 ***/
async function ethTvl(timestamp, block) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [DAI, false],
      [WFTM, false],
      [LUX_DAI, true],
    ],
    treasuryAddresses,
    block
  );

  return balances;
}

module.exports = {
  start: 1638641102, // Dec 8th, 2021
  ethereum: {
    tvl: ethTvl,
    staking
  },
  methodology:
    "Counts DAI, DAI LP (LUX-DAI), WFTM on the treasury",
};
