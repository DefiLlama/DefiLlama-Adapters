const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// beatUSD (Hyperbeat USD) is a treasury-backed stablecoin. Per DefiLlama's
// preference, we track the reserve assets backing it (the collateral side)
// rather than beatUSD's circulating supply. The reserves are USDC + USDG held by
// the Hyperbeat reserve address on Ethereum and HyperEVM.
const RESERVE = '0x669abe85f96a9e3b34723f7be9bc6f250abc0cc1'

const config = {
  ethereum: {
    tokens: [
      ADDRESSES.ethereum.USDC,                        // USDC
      '0xe343167631d89B6Ffc58B88d6b7fB0228795491D',   // USDG (Global Dollar)
    ],
  },
  hyperliquid: {
    tokens: [
      ADDRESSES.hyperliquid.USDC,                     // USDC
      '0x9522133c663ba8C2a8A7b4F63Dd2aC8DccCe1505',   // USDG (Global Dollar)
    ],
  },
}

const tvl = async (api) => {
  const { tokens } = config[api.chain]
  return sumTokens2({ api, owner: RESERVE, tokens })
}

module.exports = {
  methodology: 'TVL is the reserves backing beatUSD (Hyperbeat USD): USDC and USDG held by the Hyperbeat reserve address on Ethereum and HyperEVM.',
  start: '2025-11-11',
  ethereum: { tvl },
  hyperliquid: { tvl },
}
