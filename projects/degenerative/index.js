const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { getConfig } = require('../helper/cache')

const collaterals = {
    'WETH': ADDRESSES.ethereum.WETH,
    'USDC': ADDRESSES.ethereum.USDC
}

async function tvl(timestamp, block) {
    const assetsRaw = await getConfig('degenerative', 'https://raw.githubusercontent.com/yam-finance/synths-sdk/master/src/assets.json')
    const assets =  Object.values(assetsRaw).map(b=>Object.values(b)).flat().flat()
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
  }
