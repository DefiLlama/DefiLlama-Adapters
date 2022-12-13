const { masterchefExports, } = require("../helper/unknownTokens")
const sdk = require('@defillama/sdk')

async function verifyTvl() {
  let [
    usdkSupply,
    briseSupply,
  ] = await sdk.api2.abi.multiCall({
    abi: 'erc20:totalSupply', chain: 'kava',
    calls: ['0x472402d47Da0587C1cf515DAfbAFc7bcE6223106', '0xea616011e5ac9a5b91e22cac59b4ec6f562b83f9',]
  })
  usdkSupply /= 1e18
  briseSupply /= 1e18

  const fireBlockAccount = '0x07B8F3e3D3fCf5b6D8cf1a49B92047008EE991E8'
  const fireBlockHotAccount = '0x5e14128aC1192B31F2f9026D7130F446D0546D9c'

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

  const res = await sdk.api.eth.getBalances({ targets: [fireBlockAccount, fireBlockHotAccount], chain: 'bitgert', })
  let { output: briseBacking2 } = await sdk.api.erc20.balanceOf({ target: '0x8FFf93E810a2eDaaFc326eDEE51071DA9d398E83', owner: fireBlockHotAccount, chain: 'bsc', })
  const briseBacking = res.output.reduce((a, i) => (a + +i.balance/1e18), 0)
  briseBacking2 /= 1e9
  const backing = [...bals, ...balsPoly].reduce((a, i) => a + i / 1e6, 0)
  
  sdk.log('usdk supply: ', usdkSupply, 'usdk backing: ', backing, 'diff', backing - usdkSupply)
  sdk.log('BRISE supply: ', briseSupply, 'BRISE backing: ', (+briseBacking + +briseBacking2) , 'diff', (+briseBacking + +briseBacking2)  - briseSupply)

  if (usdkSupply > backing) throw new Error('USDk supply is higher than backing')
  if ((briseSupply > (+briseBacking + +briseBacking2))) throw new Error('BRISE supply is higher than backing')
  return {}
}

module.exports = masterchefExports({
  chain: 'kava',
  useDefaultCoreAssets: true,
  masterchef: '0xAbF3edbDf79dAfBBd9AaDBe2efEC078E557762D7',
  nativeToken: '0xa0EEDa2e3075092d66384fe8c91A1Da4bcA21788'
})

module.exports.kava.tvl = sdk.util.sumChainTvls([module.exports.kava.tvl, verifyTvl])