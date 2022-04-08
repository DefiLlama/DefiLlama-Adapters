const {getLiquityTvl} = require('../helper/liquity')
const sdk = require('@defillama/sdk');
const { sumTokens } = require('../helper/unwrapLPs');

async function fantomCurveLps(timestamp, ethBlock, chainBlocks){
  const balances = {}
  await sumTokens(balances, [
    ["0x6ef78ad4a40e9a6c81b9229de3ecc33ce591bc34", "0xce42b2ee38f3434be68d1d6258a4d8959a6716ab"], //usd
    ["0x8b63f036f5a34226065bc0a7b0ae5bb5eba1ff3d", "0x59f58431d4cba2b7e9e8d78f064a8fa24c5134bf"], //ftm
  ], chainBlocks.fantom, "fantom", addr=>{
    return "fantom:"+{
      "0x6ef78ad4a40e9a6c81b9229de3ecc33ce591bc34":"0x82f0b8b456c1a451378467398982d4834b6829c1",
      "0x8b63f036f5a34226065bc0a7b0ae5bb5eba1ff3d":"0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    }[addr.toLowerCase()]
  })
  return balances
}

module.exports = {
  timetravel: true,
  methodology: "Deposited AVAX, BNB and FTM on all three chains as well as deposits in staking pools. g3CRV is replaced by MIM",
  bsc:{
    tvl: getLiquityTvl("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", "0x15102B7579aE3b913B0cbb2edE791fC58C528195", "bsc")
  },
  avalanche:{
    tvl: getLiquityTvl("0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "0x41c36D163DB9e58608F4B354FfB3893EF472E9fd", "avax")
  },
  fantom:{
    tvl: sdk.util.sumChainTvls([
      getLiquityTvl("0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", "0x5420d619823b7d836341524C55f3c24B4D497c72", "fantom"),
      getLiquityTvl("0x82f0b8b456c1a451378467398982d4834b6829c1", "0x16E900A379873351D6922881388548e4eee5c611", "fantom"),
      fantomCurveLps
    ])
  }
};
