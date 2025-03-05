const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const assets = Object.values(ADDRESSES.taker)
  const totalSupplies = await api.multiCall({ calls: assets, abi: 'erc20:totalSupply' })
  api.add(assets, totalSupplies)
}

module.exports = {
  methodology: 'TVL counts the taker tokens that are staked.',
  taker:  { tvl }
}