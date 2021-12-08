const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { transformFantomAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const stakingContract = "0x9ae7972BA46933B3B20aaE7Acbf6C311847aCA40";
const HEC = "0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0";

const treasuryContract = "0xCB54EA94191B280C296E6ff0E37c7e76Ad42dC6A";

const DAI = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e";
const HEC_DAI_spLP = "0xbc0eecdA2d8141e3a26D2535C57cadcb1095bca9";
const USDC = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";
const HEC_USDC_SPIRITLP = "0xd661952749f05aCc40503404938A91aF9aC1473b";
const wFTM = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";

async function ftmTvl(timestamp, chainBlocks) {
  const balances = {};

  const transformAddress = await transformFantomAddress();
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [DAI, false],
      [USDC, false],
      [wFTM, false],
      [HEC_DAI_spLP, true],
      [HEC_USDC_SPIRITLP, true],
    ],
    [treasuryContract],
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
}

module.exports = {
  fantom: {
    staking: staking(stakingContract, HEC, "fantom"),
    tvl: ftmTvl,
  },
  tvl: sdk.util.sumChainTvls([ftmTvl]),
  methodology:
    "Counts DAI, DAI spLP (HEC-DAI), USDC, USDC SPIRIT-LP (HEC-USDC), wFTM on the treasury",
};
