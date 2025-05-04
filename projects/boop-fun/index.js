const { sumTokens2 } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  return sumTokens2({api, tokensAndOwners: [[ADDRESSES.solana.SOL, 'GVVUi6DaocSEAp8ATnXFAPNF5irCWjCvmPCzoaGAf5eJ']]})
  
}

module.exports = {
  solana: {
    tvl,
  },
}