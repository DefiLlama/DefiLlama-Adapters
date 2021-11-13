const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking')
const { transformFantomAddress } = require("../helper/portedTokens");

const hectorStaking = "0x9ae7972BA46933B3B20aaE7Acbf6C311847aCA40"
const hec = "0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0"
const hecDaiSLP = "0xbc0eecdA2d8141e3a26D2535C57cadcb1095bca9"
const treasury = "0xCB54EA94191B280C296E6ff0E37c7e76Ad42dC6A"
const dai = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e"
const ftm = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"
const hecUsdcLP = "0xd661952749f05acc40503404938a91af9ac1473b"
const usdc = "0x04068da6c83afcfa0e13ba15a6696662335d5b75"



async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transformAddress = await transformFantomAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [dai, false],
      [usdc, false],
      [ftm, false],
      [hecUsdcLP, true],
      [hecDaiSLP, true]
    ],
    [treasury],
    chainBlocks.fantom,
    'fantom',
    transformAddress
  );

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl,
    staking: staking(hectorStaking, hec, "fantom")
  },
  methodology:
    "Counts tokens on the treasury for TVL and staked EXOD for staking",
};