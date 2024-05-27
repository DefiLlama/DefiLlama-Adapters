const { staking } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  scroll: {
    funds: [
      '0x289E69E5B611F6193694F6Cfa2F93B7cF161253f', // Stone Fund (Scroll mainnet)
    ],
    swaps:[
      '0xD151ce31322aEa25E4779678dF0A3f376f9FFc6f', // Stone SWAP (Scroll mainnet)
    ],
    token: '0x9735fb1126B521A913697A541f768376011bCcF9',
    escrow: '0xffD17794bF2e3BA798170f358225763F1aF8f5ba',    
  },
  bsc: {
    funds: [
      '0x2f40c245c66C5219e0615571a526C93883B456BB',  // BTC V2 Fund
      '0x1F18cC2b50575A71dD2EbF58793d4e661a7Ba0e0',  // ETH V2 Fund
      '0x7618f37EfE8930d5EE6da34185b3AbB750BD2a34',  // BNB V2 Fund
    ],
    swaps: [
      '0x999DB223F0807B164b783eE33d48782cc6E06742',  // BTC V2 BISHOP Swap
      '0x87585A84E0A04b96e653de3DDA77a3Cb1fdf5B6a',  // ETH V2 BISHOP Swap
      '0x56118E49582A8FfA8e7309c58E9Cd8A7e2dDAa37',  // BNB V2 BISHOP Swap
      '0xfcF44D5EB5C4A03D03CF5B567C7CDe9B66Ba5773',  // BNB V2 QUEEN Swap
      '0x6Da3A029d0F0911C7ee36c1cEa2Ea69Fc31dd970',  // BTC USDC BISHOP Swap
      '0x09427783666Ec4173e951222ab9B3C12871400AA',  // ETH USDC BISHOP Swap
      '0xD3392699d679DFa57bC8ee71a0Ad44902C1Ab9f7',  // BNB USDC BISHOP Swap
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