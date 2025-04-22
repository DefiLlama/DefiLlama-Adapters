const { staking } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  scroll: {
    funds: [
      '0x289E69E5B611F6193694F6Cfa2F93B7cF161253f', // Stone Fund (Scroll mainnet)
      '0xfbee64fa1a89b76976750d62c8f3298952C5a518', // weETH Fund (Scroll mainnet)
      '0x4B0D5Fe3C1F58FD68D20651A5bC761553C10D955', // Stone 2 Fund (Scroll mainnet)
    ],
    swaps:[
      '0xD151ce31322aEa25E4779678dF0A3f376f9FFc6f', // Stone SWAP (Scroll mainnet)
      '0x3d9f20E4F1F5aC1d5F24E271CE6364B2eEd71cA6', // weETH SWAP (Scroll mainnet)
      '0xEC8bFa1D15842D6B670d11777A08c39B09A5FF00', // Stone 2 SWAP (Scroll mainnet)
    ],
    token: '0x9735fb1126B521A913697A541f768376011bCcF9',
    escrow: '0xffD17794bF2e3BA798170f358225763F1aF8f5ba',    
  },
  bsc: {
    funds: [
      '0x2f40c245c66C5219e0615571a526C93883B456BB',  // BTC V2 Fund
      '0x1F18cC2b50575A71dD2EbF58793d4e661a7Ba0e0',  // ETH V2 Fund
      '0x7618f37EfE8930d5EE6da34185b3AbB750BD2a34',  // BNB V2 Fund
      '0x78006B8B80677aeD97ae4f55782E75CE956F54D6',  // SolvBTC V3 Fund
      '0xfD53F8dAaE81F8eb7f5d434E1922949cE6D24f67',  // SlisBNB V3 Fund
      '0x50635585A2bd884D87Fcc83c5Fc5AaD91495EC6a',  // SlisBNB 2 V3 Fund
      '0xb6730D3C7E43ab99a0558c6cAa5Ce59Fc393CEa1',  // SolvBTC.BBN V3 Fund
      '0x01907f044BCAe357f973d051B0f3B09093dc2763',  // SolvBTC.BBN 2 V3 Fund
      '0x04Eb0D1dCB55B5c3Fd08baaa286ac84c6E4F7BDd',  // brBTC V3 Fund
      '0x6DCD6942C740D3749792149A21eedF3d82CcE21E',  // uniBTC V3 Fund
      '0x97c8D5A7d9c9BE17a5B3fc83e14FBE2A878807A9',  // asBNB V3 Fund
      '0x91B07B0fB40874A61C2eD26Dd63869F579BefD34',  // uniBTC 2 V3 Fund
      '0xCb00aA9D486c1EF51D38A85C2d16cB849afFE6b6',  // brBTC 2 V3 Fund
      '0x9C7F6dC15399b353165eC7f86C1e2cf1FEb7be4A',  // sUSDX V3 Fund
    ],
    swaps: [
      '0x999DB223F0807B164b783eE33d48782cc6E06742',  // BTC V2 BISHOP Swap
      '0x87585A84E0A04b96e653de3DDA77a3Cb1fdf5B6a',  // ETH V2 BISHOP Swap
      '0x56118E49582A8FfA8e7309c58E9Cd8A7e2dDAa37',  // BNB V2 BISHOP Swap
      '0xfcF44D5EB5C4A03D03CF5B567C7CDe9B66Ba5773',  // BNB V2 QUEEN Swap
      '0x6Da3A029d0F0911C7ee36c1cEa2Ea69Fc31dd970',  // BTC USDC BISHOP Swap
      '0x09427783666Ec4173e951222ab9B3C12871400AA',  // ETH USDC BISHOP Swap
      '0xD3392699d679DFa57bC8ee71a0Ad44902C1Ab9f7',  // BNB USDC BISHOP Swap
      '0xf4302b631516E1BDa4f46730856DcaA588Ed2BBb',  // SolvBTC BISHOP Swap
      '0xD3d47598B56e15D5A3f466fC93517d97f7b6256E',  // SlisBNB BISHOP Swap
      '0x01209A232daf2068136d15E76c867c7f7fc21F4E',  // SlisBNB 2 BISHOP Swap
      '0xbbb1aa81E95298D64B7f710B936D89394DBdd28f',  // SolvBTC.BNB BISHOP Swap
      '0x2Fa534B3C9cd003e58dc1E8F44969846AF311698',  // SolvBTC.BNB 2 BISHOP Swap
      '0x8aeA25b112A8A614a417E3Be36ddF8d9bbc46d4B',  // brBTC Swap
      '0x0747277AC186a83F828C7Ac3Ba688f499D2a3F33',  // uniBTC Swap
      '0xD44783cD7869c4B0C5eAEDf8B08Ab6Dd14E7cAC1',  // sUSDX Swap
      '0xB4C672600497EFd6ee1a74A50788a5cd1A0893E6',  // staYuniBTC2-uniBTC Swap
      '0xf443F22bdf347c2898429031512036191C5651Bc',  // staYbrBTC2-brBTC Swap
      '0xBA5A53180504caE2f038685914084ed85d336C2b',  // staYasBNB-asBNB Swap
    ],
    token: '0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6',
    escrow: '0x95A2bBCD64E2859d40E2Ad1B5ba49Dc0e1Abc6C2',
  },
  ethereum: {
    funds:  [
      '0x811c9dD8B7B670A78d02fac592EbbE465e5dD0FA', // wstETH Fund (ETH mainnet)
    ],
    swaps:  [
      '0xBA919470C7a2983fbcdA6ADC89Be9C43b8298079', // ETH V2 BISHOP Swap (ETH mainnet)
      '0xAD06a2DBd34Da8f8Cf5f85d284A5B93A2057bDb5', // wstETH SWAP (ETH mainnet)
    ],
    token: '0xD6123271F980D966B00cA4FCa6C2c021f05e2E73',
    escrow: '0x3FadADF8f443A6DC1E091f14Ddf8d5046b6CF95E',
  },
}

module.exports = {
  methodology: `Counts the underlying assets in each fund.`,
}

Object.keys(config).forEach(chain => {
  const { funds, swaps, token, escrow } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      await api.erc4626Sum({ calls: funds, tokenAbi: 'tokenUnderlying', balanceAbi: 'getTotalUnderlying' })
      const quoteAddresses = await api.multiCall({ abi: 'address:quoteAddress', calls: swaps })
      return sumTokens2({ api, tokensAndOwners2: [quoteAddresses, swaps] })
    },
    staking: staking(escrow, token, undefined, 'tranchess', 18),
  }
})