const { sumTokensExport } = require('../helper/unwrapLPs');
const wemixEContract = '0x3720b1dc2c8dde3bd6cfcf0b593d0a2bbcac856e';
const stakingContract = '0xA5c7992710A94A2ef2e8E910b441bD70385DBAB8'

module.exports = {
  methodology: "The balance of WEMIX.e tokens staked in Staking Wemix Contract on kroma chain",
  kroma: { tvl: sumTokensExport({ owner: stakingContract, tokens: [wemixEContract]}) },
}
