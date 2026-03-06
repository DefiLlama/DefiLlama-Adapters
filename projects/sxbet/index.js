const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unknownTokens");

const escrowTvl = sumTokensExport({
  owner: '0x9039A2F174Ca7AfF96C983CAfB6EAC356a87edE7',
  tokens: [ADDRESSES.sxr.WSX, ADDRESSES.sxr.USDC],
})

const stakingTvl = staking('0x2083eF16cc1749c98F101E41Dba9b9472D4C5702', ADDRESSES.sxr.WSX);

module.exports = {
  sxr: {
    tvl: escrowTvl,
    staking: stakingTvl,
  }
};
