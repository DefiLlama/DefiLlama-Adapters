const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

/*
const sydeBtcPool = "EQCPWmXKrtHV8Kr85Y4Wbr48kPpEEUJFzJwwMeyk8d6SL0aW"
const sydeEthPool = "EQB-0rsa1xVNDQaSu8zlILSdlvP-tn3sXoJgl1kAEFS-4M3t"
const sydeEthV2Pool = "EQD5B3arO4jzukP-3u1Te3_Ezak-Baf5BztuGCItylHzbhZp"
const sydeSolPool = "EQCuFUhl6rrSZWT8Ozl7b4jpiadODlPxAaaDnQv7wUnyJqcT"
const sydeXauPool = "EQCi9ogNps1Jbj5t7GcIb8iA1ghjHHAadljVgY80ONnEvHyM"
const sydeTonPool = "EQBhwJfdCFVImLYzAfFzk6-jbsiUhX78YhOUJEYteFBVHnJq"
*/

const sydeBtcPool = "EQDuFAdo9HkGwNNMy8Kwnon3A8bIJyM_GNw8VLf_vUN_wqrT"

module.exports = {
  methodology: 'Counts Syde smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owners: [sydeBtcPool], tokens: [ADDRESSES.null]}),
  }
}
