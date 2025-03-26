const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const sydeBtcPool = "EQCPWmXKrtHV8Kr85Y4Wbr48kPpEEUJFzJwwMeyk8d6SL0aW"
const sydeEthPool = "EQB-0rsa1xVNDQaSu8zlILSdlvP-tn3sXoJgl1kAEFS-4M3t"
const sydeSolPool = "EQCuFUhl6rrSZWT8Ozl7b4jpiadODlPxAaaDnQv7wUnyJqcT"

module.exports = {
  methodology: 'Counts Syde smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owners: [sydeBtcPool, sydeEthPool, sydeSolPool], tokens: [ADDRESSES.null]}),
  }
}
