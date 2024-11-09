const { stakings } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')


const config = {
  bsc: { factory: '0x1D9F43a6195054313ac1aE423B1f810f593b6ac1', masterchefs: ['0x2e881a10f682a3b2CBaaF8fc5A9a94E98D4879B4', '0x44eC8143EB368cAbB00c4EfF085AF276260202B5'], token: '0x2d2567dec25c9795117228adc7fd58116d2e310c' },
  base: { factory: '0xba34aA640b8Be02A439221BCbea1f48c1035EEF9', masterchefs: ['0xB6171582C75421A740dcC15E4D873a34Cb2Ebb48', '0x89c0619E7A798309193438b3Cff11f1F31266711'], token: '0x08Ccb86a31270Fd97D927A4e17934C6262A68b7E' },
  blast: { factory: '0x4B599f3425D54AfBf94bFD41EA9931fF92AD6551', masterchefs: ['0xdeE10310E729C36a560c72c0E8E3be0e46673063', '0xda3840837Df961A710C889e0D23295dF82cCfF8b'], token: '0x08Ccb86a31270Fd97D927A4e17934C6262A68b7E' },
  arbitrum: { factory: '0xba34aA640b8Be02A439221BCbea1f48c1035EEF9', masterchefs: ['0x6dAafc12F65801afb2F0B0212a8229F224Acf576', '0xA9E236aa88D3D9d5D4499D1b6ffA7ec170dA5DCA'], token: '0x08Ccb86a31270Fd97D927A4e17934C6262A68b7E' },
  polygon: { factory: '0xEE8F37D490CB7Ea1dae7d080c5738894731299f0', masterchefs: ['0x1D9F43a6195054313ac1aE423B1f810f593b6ac1', '0xb4286E807A8107cC3344d3094468DC44D73b49c2'], token: '0x5eBB1ff6dc0759f7A6253d0568A610650Dd0d050' },
  optimism: { factory: '0xba34aA640b8Be02A439221BCbea1f48c1035EEF9', masterchefs: ['0xB6171582C75421A740dcC15E4D873a34Cb2Ebb48', '0x89c0619E7A798309193438b3Cff11f1F31266711'], token: '0x08Ccb86a31270Fd97D927A4e17934C6262A68b7E' },

}


module.exports = {
  methodology: "TVL is calculated from total liquidity of SquadSwap's active pools",
  misrepresentedTokens: true
}

Object.keys(config).forEach(chain => {
  const { factory, masterchefs, token, } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }),
    staking: token && stakings(masterchefs, token)
  }
})