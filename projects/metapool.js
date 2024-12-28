const utils = require('./helper/utils')
const ADDRESSES = require('./helper/coreAssets.json')

async function tvl() {
  const totalTvl = await utils.fetchURL('http://validators.narwallets.com:7000/metrics_json')

  return {
    near: totalTvl.data.tvl
  }
}

module.exports = {
  methodology: 'TVL counts the NEAR tokens that are staked.',
  near: { tvl, },
  aurora: {
    tvl: async (api) => {
      const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: '0xb01d35D469703c6dc5B369A1fDfD7D6009cA397F' })
      api.add(ADDRESSES.aurora.AURORA ,totalSupply)
    }
  }
}