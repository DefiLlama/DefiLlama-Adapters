const ADDRESSES = require('../helper/coreAssets.json')

// elUSD token proxy: https://etherscan.io/address/0x65Fb0f9b196d524De0C4F3BAF572F0a79eb21194
const ELUSD = '0x65Fb0f9b196d524De0C4F3BAF572F0a79eb21194'

const tvl = async (api) => {
  const supply = await api.call({ target: ELUSD, abi: 'erc20:totalSupply' })
  api.add(ADDRESSES.ethereum.USDC, supply / 1e12)
}

module.exports = {
  start: '2026-06-16',
  methodology: 'TVL uses elUSD total supply as a proxy for protocol assets backing issued elUSD, mapped 1:1 to USDC for pricing.',
  ethereum: {
    misrepresentedTokens: true,
    tvl,
  },
}
