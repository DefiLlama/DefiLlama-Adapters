const { sumTokens2 } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  return sumTokens2({api, tokensAndOwners: [[ADDRESSES.solana.SOL, 'GVVUi6DaocSEAp8ATnXFAPNF5irCWjCvmPCzoaGAf5eJ']]})
  
}

async function staking() {
  return sumTokens2({ tokenAccounts: ['BZgWzdxHqytYrn3EuvkozE1Hg38CD5ajjxBppRHuV1nQ'] })
}

module.exports = {
  solana: {
    tvl,
    staking
  },
}