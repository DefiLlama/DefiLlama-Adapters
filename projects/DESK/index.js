const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
async function baseTvl(api) {
  const tokensAndOwners = [
    [ADDRESSES.base.USDC, "0x395c7f20bc6f38dfc644aa1a4023dc47d6939481"], // Vault
  ];
  return sumTokens2({ api, tokensAndOwners });
}
module.exports = {
  start: '2025-02-18',
  base: { tvl: baseTvl }
};
