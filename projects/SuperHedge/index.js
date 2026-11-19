const ADDRESSES = require('../helper/coreAssets.json')

// Vault configs
const vaults = [
  // ETH Bullish Call-Spread USDe
  {
    currency: ADDRESSES.ethereum.USDe,
    pt: '0xBC6736d346a5eBC0dEbc997397912CD9b8FAe10a',
    vault: '0xD0407E1c58Ce32a7fE672f331Af120E0C30aD45b'
  },
  // BTC Bullish Call-Spread lvlUSD
  {
    currency: '0x7c1156e515aa1a2e851674120074968c905aaf37',
    pt: '0x207F7205fd6c4b602Fa792C8b2B60e6006D4a0b8',
    vault: '0x93c318E595F58E4Ffc8779E35E574832D8d9a5Dc'
  },
  // ETH Bearish Put-Spread USDe
  {
    currency: ADDRESSES.ethereum.USDe,
    pt: '0xBC6736d346a5eBC0dEbc997397912CD9b8FAe10a',
    vault: '0x9AbbA395c4db06467B5C19A69F7e320EE962f2CB'
  },
  // BTC Bearish Put lvlUSD
  {
    currency: '0x7c1156e515aa1a2e851674120074968c905aaf37',
    pt: '0x207F7205fd6c4b602Fa792C8b2B60e6006D4a0b8',
    vault: '0x1fEcD2E54648476bD6AeA2f5B8BBD5155166816e'
  }
]

async function tvl(api) {
  // Process all vaults in a loop
  for (const { currency, pt, vault } of vaults) {
    // Get currency balance
    const currencyBalance = await api.call({
      abi: 'erc20:balanceOf',
      target: currency,
      params: [vault],
    });
    api.add(currency, currencyBalance);
    
    // Get PT token balance
    const ptBalance = await api.call({
      abi: 'erc20:balanceOf',
      target: pt,
      params: [vault],
    });
    api.add(pt, ptBalance);
  }
}

module.exports = {
  methodology: 'Counts the number of stablecoins and PT tokens in the SuperHedge Vault contracts.',
  ethereum: {
    tvl,
  }
};
