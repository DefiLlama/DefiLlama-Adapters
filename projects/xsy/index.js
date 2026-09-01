const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: ADDRESSES.avax.UTY,
  })
  api.add(ADDRESSES.avax.UTY, totalSupply)
}

module.exports = {
  start: 58017291, // block when UTY contract was deployed
  avax: { tvl },
}
