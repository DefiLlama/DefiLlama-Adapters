const { getUniTVL, getTokenPrices } = require('../helper/unknownTokens')
const chain = 'bitgert'
const factory = '0x9E6d21E759A7A288b80eef94E4737D313D31c13f'
const lpMapping = {
  '0xc7e6d7e08a89209f02af47965337714153c529f0': '0x8e7dd0d762f60942e0bd05b1114d6cedf4435a18', // tether
  '0xaedd3ff7b9fc5fc4e44d140b80f0b1c7fdb6102c': '0x7b970fba17679054d4865b2c6181baf12080b6a3', // usdc
  '0xB999Ea90607a826A3E6E6646B404c3C7d11fa39D': '0x558077e98aeceeb1d616d18c144c15909d4ab744', // ICE
}

const coreAssets = [
  '0x0eb9036cbE0f052386f36170c6b07eF0a0E3f710', //WBRISE
  '0xc3b730dd10a7e9a69204bdf6cb5a426e4f1f09e3', //LUNG
  '0x11203a00a9134db8586381c4b2fca0816476b3fd', //YPC
  ...Object.keys(lpMapping)
]

const lps = Object.values(lpMapping)

module.exports = {
  misrepresentedTokens: true,
  bitgert: {
    tvl: async (_, _b, {[chain]: block}) => {
      const { updateBalances } = await getTokenPrices({ chain, block, useDefaultCoreAssets: true, lps, allLps: true })
      const tvlFunc = getUniTVL({ chain, factory, coreAssets })
      const balances = await tvlFunc(_, _b, {[chain]: block})
      await updateBalances(balances)
      return balances
    },
  },
};
