const { masterchefExports, } = require("../helper/unknownTokens")
const sdk = require('@defillama/sdk')

async function verifyTvl() {
  const usdkSupply = (await sdk.api2.abi.call({
    target: '0x472402d47Da0587C1cf515DAfbAFc7bcE6223106',
    abi: 'erc20:totalSupply',
    chain: 'kava',
  })) / 1e18

  const fireBlockAccount = '0x07B8F3e3D3fCf5b6D8cf1a49B92047008EE991E8'

  const bals = await sdk.api2.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: [
      { target: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', params: fireBlockAccount },
      { target: '0xdac17f958d2ee523a2206206994597c13d831ec7', params: fireBlockAccount },
    ],
  })

  const balsPoly = await sdk.api2.abi.multiCall({
    abi: 'erc20:balanceOf',
    chain: 'polygon',
    calls: [
      { target: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', params: fireBlockAccount },
      { target: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', params: fireBlockAccount },
    ],
  })

  const backing = [...bals, ...balsPoly].reduce((a, i) => a + i/1e6, 0)

  sdk.log('usdk supply: ', usdkSupply)
  sdk.log('usdk backing: ', backing)
  if (usdkSupply > backing) throw new Error('USDk supply is higher than backing')
  return {}
}

module.exports = masterchefExports({
  chain: 'kava',
  useDefaultCoreAssets: true,
  masterchef: '0xAbF3edbDf79dAfBBd9AaDBe2efEC078E557762D7',
  nativeToken: '0xa0EEDa2e3075092d66384fe8c91A1Da4bcA21788'
})

module.exports.kava.tvl = sdk.util.sumChainTvls([module.exports.kava.tvl, verifyTvl])