const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking.js");
const { transformBscAddress } = require("../helper/portedTokens");

const treasuryAddresses = ["0x652A6F3459B276887bf2Fe9fb0FF810c9B24e1E3"];
const BUSD = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const RaStaking = "0xf45aE86eD6C7d7A6b6C4640e04FEc228641D4C64";
const RA = "0xcc238200cFfdA7A5E2810086c26d5334e64F1155";

const RA_BUSD_POOL = "0xE8C6539663973E892C21652be80cdeE9a62e67BC";
/*** Bonds TVL Portion (Treasury) ***
 * Treasury TVL consists of BUSD and PANCAKESWAP-V2 balances
 ***/
async function bscTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks.bsc;
  const transformAddress = await transformBscAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [BUSD, false],
      [RA_BUSD_POOL, true],
    ],
    treasuryAddresses,
    block,
    "bsc",
    transformAddress
  );

  return balances;
}

module.exports = {
  bsc: {
    tvl: bscTvl,
    staking: staking(RaStaking, RA, "bsc"),
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
  methodology: "Counts BUSD and BUSD SLP (RA-BUSD) on the treasury",
};
