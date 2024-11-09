const {polygonContractData, 
  avalancheContractData, cronosContractData, kavaContractData } = require('./config')
const { vestingHelper } = require("../helper/unknownTokens")
const sdk = require('@defillama/sdk')

function tvl(args){
  return async (timestamp, ethBlock, chainBlocks) => {
    let totalBalances = {}
    for (let i = 0; i < args.length; i++) {
      const chain = args[i].chain
      const contract = args[i].contract
      let block = chainBlocks[chain]
      const { output: totalDepositId } = await sdk.api.abi.call({
        target: contract,
        abi: args[i].getNumLockedTokensABI,
        chain, block,
      })

      let tokens = [];
      const allDepositId = Array.from(Array(+totalDepositId).keys());
      const lpAllTokens = (
        await sdk.api.abi.multiCall({
          abi: args[i].getLockedTokenAtIndexABI,
          calls: allDepositId.map((num) => ({
            target: contract,
            params: num,
          })),
          chain: chain,
          block: block
        })
      ).output

      lpAllTokens.forEach(lp => {
        if (!lp.success) return;
        const lpToken = lp.output
        tokens.push(lpToken)
      })

      const blacklist = [...(args[i].pool2 || [])]

      if (chain === 'ethereum')
        blacklist.push('0x72E5390EDb7727E3d4e3436451DADafF675dBCC0') // HANU

      let balances = await vestingHelper({
        chain, block,
        owner: contract,
        useDefaultCoreAssets: true,
        blacklist,
        tokens,
      })

      for (const [token, balance] of Object.entries(balances))
        sdk.util.sumSingleBalance(totalBalances, token, balance)
    }
    return totalBalances
  }
}
module.exports = {
    methodology: 
  `Counts each LP pair's native token and 
   stable balance, adjusted to reflect locked pair's value. 
   Balances and merged across multiple 
   locker and staking contracts to return sum TVL per chain`,
  cronos: {
    tvl: tvl(cronosContractData)
  },
  polygon: {
    tvl: tvl(polygonContractData)
  },
  avax: {
    tvl: tvl(avalancheContractData)
  },
  kava:{
    tvl: tvl(kavaContractData)
  }
}

