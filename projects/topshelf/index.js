const { getLiquityTvl } = require('../helper/liquity')
const sdk = require('@defillama/sdk');

async function fantomCurveLps(api) {
  return api.sumTokens({
    tokensAndOwners: [
      ["0x6ef78ad4a40e9a6c81b9229de3ecc33ce591bc34", "0xce42b2ee38f3434be68d1d6258a4d8959a6716ab"], //usd
      ["0x8b63f036f5a34226065bc0a7b0ae5bb5eba1ff3d", "0x59f58431d4cba2b7e9e8d78f064a8fa24c5134bf"], //ftm
    ]
  })
}

const options = { nonNativeCollateralToken: true}

module.exports = {
  methodology: "Deposited AVAX, BNB and FTM on all three chains as well as deposits in staking pools. g3CRV is replaced by MIM",
  bsc: {
    tvl: getLiquityTvl("0x15102B7579aE3b913B0cbb2edE791fC58C528195", options)
  },
  avax: {
    tvl: getLiquityTvl("0x41c36D163DB9e58608F4B354FfB3893EF472E9fd", options)
  },
  fantom: {
    tvl: sdk.util.sumChainTvls([
      getLiquityTvl("0x5420d619823b7d836341524C55f3c24B4D497c72", options),
      getLiquityTvl("0x16E900A379873351D6922881388548e4eee5c611", options),
      fantomCurveLps
    ])
  }
};
