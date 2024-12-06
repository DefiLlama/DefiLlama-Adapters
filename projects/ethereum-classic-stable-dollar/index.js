const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, } = require('../helper/unwrapLPs')
const { sumTokensExport, } = require('../helper/sumTokens')

module.exports = {
  methodology: "The TVL of ECSD is the amount of ETC in the contract's reserve.",
  ethereumclassic: {
    tvl: sumTokensExport({
      owner: '0xCc3664d7021FD36B1Fe2b136e2324710c8442cCf', 
      tokens: [nullAddress],
    })
  },
}

