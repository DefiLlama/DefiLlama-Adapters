const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const owners = [
  "0xEe7F9599Cf1FB89aDBC3edD850E4842C2997Ca2c", // vault manager
  "0xdb0c5d39c95A53eCdA3fCF6f6C5C81C7a74910c7", // vault
]

module.exports = {
  methodology: 'counts the number of USDB tokens in the Bloom contract.',
  blast: {
    tvl: sumTokensExport({ owners, tokens: [ADDRESSES.blast.USDB] })
  }
}; 