const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const wemixEContract = ADDRESSES.kroma.WEMIX;
const stakingContract = '0xA5c7992710A94A2ef2e8E910b441bD70385DBAB8'

module.exports = {
  methodology: "The balance of WEMIX.e tokens staked in Staking Wemix Contract on kroma chain",
  kroma: { tvl: sumTokensExport({ owner: stakingContract, tokens: [wemixEContract]}) },
}
