const sdk = require('@defillama/sdk')
const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')
const chain = 'era'

const farm = "0xa65D04f79633BeBdC4Dd785498269e8ABD6A1476"

async function tvl(_, _b, {[chain]: block }, { api }) {

  let { output: poolLength } = await sdk.api.abi.multiCall({
    abi: abi.poolLength,
    calls: [{ target: farm}],
    chain, block,
  })
  poolLength = poolLength[0].output

  let poolAssets = []
  for(var i = 0; i < poolLength; i ++) {
    poolAssets.push(i)
  }

  let { output: poolInfos } = await sdk.api.abi.multiCall({
    abi: abi.poolInfo,
    calls: poolAssets.map((item) => {return { target: farm, params: item}}),
    chain, block,
  })

  poolAssets = poolInfos.map((item) => {return item.output.lpToken})
  let { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.underlyingToken,
    calls: poolAssets.map((item, index) => {if(index < 3) return { target: item}}).filter((item) => {return item}),
    chain, block,
  })

  const tokenAndOwner = []

  for(var i = 0; i < tokens.length; i++) {
    tokenAndOwner.push([tokens[i].output, poolAssets[i]])
  }
  const output = await sumTokens2({api, tokensAndOwners: tokenAndOwner})

  const valutsToken = await api.multiCall({ abi: "uint256:balanceOf", calls: poolAssets.map((item, index) => {if(index >= 3) return { target: item}}).filter((item) => {return item}), })
  const lps = await api.multiCall({ abi: "address:want", calls: poolAssets.map((item, index) => {if(index >= 3) return { target: item}}).filter((item) => {return item}), })
  valutsToken.forEach((data, i) => {
    sdk.util.sumSingleBalance(output, lps[i], data, api.chain)
  })

  return output

}

module.exports = {
  era: { 
    tvl,
  }
}

