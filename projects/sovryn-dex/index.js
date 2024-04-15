const { staking } = require('../helper/staking')
const { getConfig } = require('../helper/cache')
const { getUniqueAddresses } = require('../helper/utils')
const { transformDexBalances } = require('../helper/portedTokens')

async function tvl(api) {
  // https://github.com/BetsyBraddock/Sovryn-Contracts-Package/blob/main/contracts-mainnet.json

  // const impl = await api.call({  abi: 'address:swapsImpl', target: '0x5a0d867e0d70fcc6ade25c3f1b89d618b5b4eaa7' })
  // console.log(impl)

  const protocolContract = '0x5a0d867e0d70fcc6ade25c3f1b89d618b5b4eaa7'
  const res = await getConfig('sovryn', 'https://backend.sovryn.app/tvl')
  let pools = Object.values(res.tvlAmm).map(i => i?.contract).filter(i => i)
  pools = getUniqueAddresses(pools)
  const ownerTokens = []
  let data = []
  const allTokens = []
  const promises = pools.map(async (pool) => {
    const tokens = await api.fetchList({ lengthAbi: 'reserveTokenCount', itemAbi: 'reserveTokens', target: pool })
    allTokens.push(...tokens)
    if (tokens.length === 2) {
      const bals = await api.multiCall({  abi: 'erc20:balanceOf', calls: tokens.map(token => ({ target: token, params: pool })) })
      data.push({
        token0: tokens[0],
        token1: tokens[1],
        token0Bal: bals[0],
        token1Bal: bals[1],
      })
    } else
      ownerTokens.push([tokens, pool])
  })
  await Promise.all(promises)

  ownerTokens.push([allTokens, protocolContract])
  await api.sumTokens({ ownerTokens })
  return transformDexBalances({ data, api, })
}
module.exports = {
  misrepresentedTokens: true,
  rsk: {
    tvl,
    staking: staking('0x5684a06cab22db16d901fee2a5c081b4c91ea40e', '0xefc78fc7d48b64958315949279ba181c2114abbd')
  }
}