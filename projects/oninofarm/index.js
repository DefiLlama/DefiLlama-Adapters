const { staking } = require('../helper/staking')

const pools = [
    "0x94c62870C8234F4DB1629e7378fBCA46402c34f8",
    "0x415146A17F25ac2CC4c51E7b2bEEF9a6E32439a5",
    "0xBCCd7c12f570676984CA66F70e2E98809C7F13c3",
    "0x1b581E15421cE65888316939116139519a77dAAF",
    "0xcCD9af13Aa5132e36dBE524DE6Acc26405209Da2"
]

const token = "0xea89199344a492853502a7A699Cc4230854451B8"

module.exports = {
  bsc: { tvl: () => ({}), staking: staking(pools, token) }
};