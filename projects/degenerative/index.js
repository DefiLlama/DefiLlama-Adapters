const sdk = require('@defillama/sdk')
const axios = require('axios')

const collaterals = {
    'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
}

async function tvl(timestamp, block) {
    const assetsRaw = await axios.get('https://raw.githubusercontent.com/yam-finance/degenerative/master/protocol/assets.json')
    const assets =  Object.values(assetsRaw.data).flat()
    console.log(assets)
    const balances = {}
    const collateralBalances = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        block,
        calls:assets.map(asset=>({
            target: collaterals[asset.collateral],
            params: [asset.emp.address]
        }))
    })
    sdk.util.sumMultiBalanceOf(balances, collateralBalances)
  
    return balances
  }

  module.exports = {
    ethereum:{
        tvl
    },
    tvl
  }