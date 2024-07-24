const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    staking: sumTokensExport({ owners: 
        ["0xbc10f2e862ed4502144c7d632a3459f49dfcdb5e", "0xa1d76a7ca72128541e9fcacafbda3a92ef94fdc5", "0x3feB1e09b4bb0E7f0387CeE092a52e85797ab889"]
        , tokens: [ADDRESSES.ethereum.LINK] }),
    tvl: async()=>({})
  }
}