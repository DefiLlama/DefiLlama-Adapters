const { assetBalance } = require("../helper/chain/waves");
const sdk = require('@defillama/sdk')

const WXStakingWxTokenContract = "3PJL8Hn8LACaSBWLQ3UVhctA5cTQLBFwBAP";
const WXAssetId = "Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on";

async function WXTVL() {
  const balances = {};
  const { balance } = await assetBalance(WXStakingWxTokenContract, WXAssetId);
  sdk.util.sumSingleBalance(balances,'waves-exchange', balance / 1e8);
  return balances;
}

module.exports = {
  timetravel: false, // Waves blockchain
  methodology: "TVL of WX means the quantity of staked WX tokens on WX Staking contract",
  waves: {
    tvl: WXTVL,
  },
};
