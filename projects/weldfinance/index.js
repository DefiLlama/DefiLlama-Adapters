const ADDRESSES = require('../helper/coreAssets.json')
const { masterchefExports, } = require("../helper/unknownTokens")
const sdk = require('@defillama/sdk')

async function verifyTvl() {
  let [
    usdkSupply,
    briseSupply,
  ] = await sdk.api2.abi.multiCall({
    abi: 'erc20:totalSupply', chain: 'kava',
    calls: [ADDRESSES.kava.USDk, ADDRESSES.kava.kBRISE,]
  })
  usdkSupply /= 1e18
  briseSupply /= 1e18

  const fireBlockAccount = '0x07B8F3e3D3fCf5b6D8cf1a49B92047008EE991E8'
  const fireBlockHotAccount = '0x5e14128aC1192B31F2f9026D7130F446D0546D9c'

  const bals = await sdk.api2.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: [
      { target: ADDRESSES.ethereum.USDC, params: fireBlockAccount },
      { target: ADDRESSES.ethereum.USDT, params: fireBlockAccount },
    ],
  })

  const balsPoly = await sdk.api2.abi.multiCall({
    abi: 'erc20:balanceOf',
    chain: 'polygon',
    calls: [
      { target: ADDRESSES.polygon.USDC, params: fireBlockAccount },
      { target: ADDRESSES.polygon.USDT, params: fireBlockAccount },
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
  nativeToken: ADDRESSES.kava.KFT
})

module.exports.kava.tvl = sdk.util.sumChainTvls([module.exports.kava.tvl, verifyTvl])