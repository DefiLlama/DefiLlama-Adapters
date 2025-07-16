const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const styTreasury = '0x54c56e149f6d655aa784678057d1f96612b0cf1a'
const styProtocol = '0x555ad3261c0eD6119Ab291b8dC383111d83C67c7'

async function styTvl(api) {
  // Simply add all tokens in the treasury
  const tokens = await api.call({ abi: 'address[]:assetTokens', target: styProtocol })
  
  // Create array of tokensAndOwners
  const tokensAndOwners = tokens.map(token => [token, styTreasury])
  
  // Get all balances directly
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  blast: {
    tvl: sumTokensExport({
      owners: [
        "0x462bd2d3c020f6986c98160bc4e189954f49634b", // treasury
      ],
      tokens: [ 
        ADDRESSES.null, // $ETH
        ADDRESSES.blast.USDB,  // $USDB
        ADDRESSES.blast.weETH  // weETH
      ]
    })
  },
  sty: { tvl: styTvl }
}